from datetime import date, datetime, timezone
from uuid import UUID
import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user, require_candidate
from app.models.application import ProgramApplication
from app.models.enums import ADMIN_ROLES, UserRole
from app.models.payment import Payment, PaymentInstallment, PaymentPlan
from app.models.user import User
from app.schemas.payment import PaymentPlanCreate, PaymentPlanResponse

router = APIRouter(tags=["payments"])


@router.get("/applications/{app_id}/payments", response_model=PaymentPlanResponse | None)
async def get_payment_plan(app_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    app_r = await db.execute(select(ProgramApplication).where(ProgramApplication.id == app_id))
    app = app_r.scalar_one_or_none()
    if not app:
        raise HTTPException(404, "Zgłoszenie nie znalezione")
    if app.user_id != user.id and UserRole(user.role) not in ADMIN_ROLES:
        raise HTTPException(403, "Brak dostępu")
    result = await db.execute(
        select(PaymentPlan).where(PaymentPlan.application_id == app_id).options(selectinload(PaymentPlan.installments))
    )
    return result.scalar_one_or_none()


@router.post("/applications/{app_id}/payments/plan", response_model=PaymentPlanResponse, status_code=201)
async def create_payment_plan(app_id: UUID, body: PaymentPlanCreate, user: User = Depends(require_candidate), db: AsyncSession = Depends(get_db)):
    app_r = await db.execute(
        select(ProgramApplication).where(ProgramApplication.id == app_id, ProgramApplication.user_id == user.id)
        .options(selectinload(ProgramApplication.edition))
    )
    app = app_r.scalar_one_or_none()
    if not app:
        raise HTTPException(404, "Zgłoszenie nie znalezione")
    existing = await db.execute(select(PaymentPlan).where(PaymentPlan.application_id == app_id))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Plan płatności już istnieje")

    plan = PaymentPlan(application_id=app_id, plan_type=body.plan_type)
    db.add(plan)
    await db.flush()

    edition = app.edition
    enrollment_fee = float(edition.enrollment_fee) if edition else 100.0
    tuition_fee = float(edition.tuition_fee) if edition and edition.tuition_fee else 0

    db.add(PaymentInstallment(plan_id=plan.id, type="enrollment_fee", amount=enrollment_fee, due_date=date.today()))

    if tuition_fee > 0:
        if body.plan_type == "full":
            db.add(PaymentInstallment(plan_id=plan.id, type="full_payment", amount=tuition_fee, due_date=date.today()))
        else:
            from datetime import timedelta
            num = body.num_installments or 3
            per = round(tuition_fee / num, 2)
            for i in range(num):
                db.add(PaymentInstallment(plan_id=plan.id, type="installment", installment_no=i+1, amount=per, due_date=date.today() + timedelta(days=30*(i+1))))

    await db.commit()
    result = await db.execute(select(PaymentPlan).where(PaymentPlan.id == plan.id).options(selectinload(PaymentPlan.installments)))
    return result.scalar_one()


@router.post("/payments/{installment_id}/pay")
async def pay_installment(installment_id: UUID, user: User = Depends(require_candidate), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PaymentInstallment).where(PaymentInstallment.id == installment_id).options(selectinload(PaymentInstallment.plan)))
    inst = result.scalar_one_or_none()
    if not inst:
        raise HTTPException(404, "Rata nie znaleziona")
    app_r = await db.execute(select(ProgramApplication).where(ProgramApplication.id == inst.plan.application_id))
    app = app_r.scalar_one_or_none()
    if not app or app.user_id != user.id:
        raise HTTPException(403, "Brak dostępu")
    if inst.status == "paid":
        raise HTTPException(400, "Rata już opłacona")

    inst.status = "paid"
    payment = Payment(installment_id=inst.id, amount_paid=inst.amount, status="completed",
                      gateway_tx_id=f"MOCK-{random.randint(100000,999999)}", gateway_status="SUCCESS",
                      paid_at=datetime.now(timezone.utc))
    db.add(payment)
    await db.commit()
    return {"message": "Płatność zarejestrowana", "payment_id": str(payment.id)}
