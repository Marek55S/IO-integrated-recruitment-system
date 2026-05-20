"""Survey router — public submission (anonymous) + admin management."""
from statistics import mean
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.survey import Survey, SurveyResponse
from app.models.user import User

router = APIRouter(tags=["surveys"])


# ── Schemas ────────────────────────────────────────────────────────────────

class QuestionIn(BaseModel):
    id: str
    text: str
    type: str  # "scale" | "text"
    required: bool = False


class SurveyCreate(BaseModel):
    title: str
    description: str | None = None
    questions: list[QuestionIn]
    is_active: bool = False


class SurveyOut(BaseModel):
    id: UUID
    title: str
    description: str | None
    questions: list
    is_active: bool

    model_config = {"from_attributes": True}


class AnswerIn(BaseModel):
    question_id: str
    value: int | str  # int for scale, str for text


class SurveyRespondIn(BaseModel):
    answers: list[AnswerIn]


class SurveyStatsOut(BaseModel):
    survey_id: UUID
    title: str
    total_responses: int
    questions: list[dict]  # per-question stats


# ── Public endpoints (no auth required) ────────────────────────────────────

@router.get("/surveys/active", response_model=SurveyOut | None)
async def get_active_survey(db: AsyncSession = Depends(get_db)):
    """Return the currently active survey, or null if none."""
    result = await db.execute(
        select(Survey).where(Survey.is_active.is_(True)).limit(1)
    )
    survey = result.scalar_one_or_none()
    return survey


@router.post("/surveys/{survey_id}/respond", status_code=status.HTTP_201_CREATED)
async def respond_to_survey(
    survey_id: UUID,
    body: SurveyRespondIn,
    db: AsyncSession = Depends(get_db),
):
    """Submit an anonymous response to a survey."""
    result = await db.execute(
        select(Survey).where(Survey.id == survey_id, Survey.is_active.is_(True))
    )
    survey = result.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Ankieta nie znaleziona lub nieaktywna")

    response = SurveyResponse(
        survey_id=survey_id,
        answers=[a.model_dump() for a in body.answers],
    )
    db.add(response)
    await db.commit()
    return {"message": "Dziękujemy za wypełnienie ankiety!"}


# ── Admin endpoints ─────────────────────────────────────────────────────────

@router.get("/admin/surveys", response_model=list[dict])
async def admin_list_surveys(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """List all surveys with response counts."""
    result = await db.execute(select(Survey).order_by(Survey.created_at.desc()))
    surveys = result.scalars().all()

    out = []
    for s in surveys:
        count_result = await db.execute(
            select(func.count()).where(SurveyResponse.survey_id == s.id)
        )
        total = count_result.scalar() or 0
        out.append({
            "id": str(s.id),
            "title": s.title,
            "description": s.description,
            "is_active": s.is_active,
            "created_at": s.created_at.isoformat(),
            "total_responses": total,
            "questions": s.questions,
        })
    return out


@router.post("/admin/surveys", response_model=SurveyOut, status_code=201)
async def admin_create_survey(
    body: SurveyCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Create a new survey. If is_active=True, deactivates all others."""
    if body.is_active:
        # Deactivate any existing active surveys
        existing = await db.execute(select(Survey).where(Survey.is_active.is_(True)))
        for s in existing.scalars().all():
            s.is_active = False

    survey = Survey(
        title=body.title,
        description=body.description,
        questions=[q.model_dump() for q in body.questions],
        is_active=body.is_active,
    )
    db.add(survey)
    await db.commit()
    await db.refresh(survey)
    return survey


@router.patch("/admin/surveys/{survey_id}/activate")
async def admin_activate_survey(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Activate a survey (deactivates all others)."""
    # Deactivate existing
    existing = await db.execute(select(Survey).where(Survey.is_active.is_(True)))
    for s in existing.scalars().all():
        s.is_active = False

    result = await db.execute(select(Survey).where(Survey.id == survey_id))
    survey = result.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Ankieta nie znaleziona")
    survey.is_active = True
    await db.commit()
    return {"message": "Ankieta aktywowana"}


@router.get("/admin/surveys/{survey_id}/stats", response_model=SurveyStatsOut)
async def admin_survey_stats(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Return per-question statistics and text responses for a survey."""
    result = await db.execute(select(Survey).where(Survey.id == survey_id))
    survey = result.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Ankieta nie znaleziona")

    resp_result = await db.execute(
        select(SurveyResponse).where(SurveyResponse.survey_id == survey_id)
    )
    responses = resp_result.scalars().all()

    # Build per-question stats
    questions_stats = []
    for q in survey.questions:
        qid = q["id"]
        qtype = q.get("type", "scale")

        all_answers = []
        for r in responses:
            for a in r.answers:
                if a.get("question_id") == qid:
                    all_answers.append(a.get("value"))

        if qtype == "scale":
            numeric = [v for v in all_answers if isinstance(v, (int, float))]
            distribution = {str(i): numeric.count(i) for i in range(1, 6)}
            avg = round(mean(numeric), 2) if numeric else None
            questions_stats.append({
                "id": qid,
                "text": q["text"],
                "type": "scale",
                "total_answers": len(numeric),
                "average": avg,
                "distribution": distribution,
            })
        else:
            texts = [v for v in all_answers if isinstance(v, str) and v.strip()]
            questions_stats.append({
                "id": qid,
                "text": q["text"],
                "type": "text",
                "total_answers": len(texts),
                "comments": texts,  # anonymous comments
            })

    count_result = await db.execute(
        select(func.count()).where(SurveyResponse.survey_id == survey_id)
    )
    total = count_result.scalar() or 0

    return SurveyStatsOut(
        survey_id=survey.id,
        title=survey.title,
        total_responses=total,
        questions=questions_stats,
    )
