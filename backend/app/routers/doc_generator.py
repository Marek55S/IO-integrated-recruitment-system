"""Document generation router — produces real PDF files using reportlab.

Polish characters are handled by registering a system TTF font (Arial on Windows,
DejaVu/Liberation on Linux) instead of the built-in Helvetica which lacks UTF-8 support.
"""
import datetime
import io
import os
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.application import ProgramApplication
from app.models.program import ProgramEdition
from app.models.user import CandidateProfile, User

router = APIRouter(tags=["documents"])

# ── Unicode font registration ────────────────────────────────────────────────
# ReportLab's built-in Helvetica doesn't support Polish (ą ę ó ś ź ż ć ń ł).
# We register a system TTF font that does.

_FONT_REGULAR = "DocRegular"
_FONT_BOLD    = "DocBold"
_FONT_ITALIC  = "DocItalic"

_CANDIDATE_FONTS = [
    # Windows
    (
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\ariali.ttf",
    ),
    (
        r"C:\Windows\Fonts\calibri.ttf",
        r"C:\Windows\Fonts\calibrib.ttf",
        r"C:\Windows\Fonts\calibrii.ttf",
    ),
    # Linux (Docker, CI)
    (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
    ),
    (
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf",
    ),
]

def _register_fonts() -> tuple[str, str, str]:
    """Register the first available Unicode TTF font set. Returns (regular, bold, italic)."""
    for regular, bold, italic in _CANDIDATE_FONTS:
        if os.path.exists(regular):
            pdfmetrics.registerFont(TTFont("DocRegular", regular))
            if os.path.exists(bold):
                pdfmetrics.registerFont(TTFont("DocBold", bold))
            else:
                pdfmetrics.registerFont(TTFont("DocBold", regular))
            if os.path.exists(italic):
                pdfmetrics.registerFont(TTFont("DocItalic", italic))
            else:
                pdfmetrics.registerFont(TTFont("DocItalic", regular))
            return "DocRegular", "DocBold", "DocItalic"
    # Fallback — Helvetica (no Polish, but won't crash)
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


_FONT_REGULAR, _FONT_BOLD, _FONT_ITALIC = _register_fonts()

# ── Helpers ──────────────────────────────────────────────────────────────────

INSTITUTION  = "AKADEMIA GÓRNICZO-HUTNICZA im. Stanisława Staszica w Krakowie"
DEPARTMENT   = "Wydział Informatyki"
NAVY         = colors.HexColor("#1e3a5f")
SLATE        = colors.HexColor("#475569")
MUTED        = colors.HexColor("#64748b")
LIGHT_BG     = colors.HexColor("#f1f5f9")


def _decrypt_pesel(encrypted: str | None) -> str:
    if not encrypted:
        return "—"
    try:
        from app.utils.security import decrypt_sensitive
        return decrypt_sensitive(encrypted)
    except Exception:
        return "***********"


def _fmt_date(dt) -> str:
    if dt is None:
        return "—"
    if hasattr(dt, "strftime"):
        return dt.strftime("%d.%m.%Y")
    return str(dt)


def _today() -> str:
    return datetime.date.today().strftime("%d.%m.%Y")


def _ps(name: str, **kw) -> ParagraphStyle:
    """Shorthand for ParagraphStyle with default Unicode font."""
    kw.setdefault("fontName", _FONT_REGULAR)
    return ParagraphStyle(name, **kw)


def _institution_header(elements: list) -> None:
    """Append the AGH / WI header block to elements."""
    elements.append(Paragraph(
        INSTITUTION,
        _ps("Inst", fontName=_FONT_BOLD, fontSize=11,
            textColor=colors.HexColor("#0b1220"), spaceAfter=2),
    ))
    elements.append(Paragraph(
        DEPARTMENT,
        _ps("Dept", fontSize=10, textColor=SLATE, spaceAfter=4),
    ))
    elements.append(HRFlowable(
        width="100%", thickness=1.5, color=NAVY, spaceAfter=16,
    ))


# ── PDF builders ─────────────────────────────────────────────────────────────

def _build_pdf_acceptance(
    app: ProgramApplication, profile: CandidateProfile | None
) -> bytes:
    """Zaświadczenie o przyjęciu na studia podyplomowe."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2.5 * cm, rightMargin=2.5 * cm,
        topMargin=2.5 * cm, bottomMargin=2 * cm,
    )
    elements: list = []

    _institution_header(elements)

    elements.append(Paragraph(
        "ZAŚWIADCZENIE O PRZYJĘCIU NA STUDIA PODYPLOMOWE",
        _ps("Title", fontName=_FONT_BOLD, fontSize=15,
            alignment=1, textColor=NAVY, spaceAfter=8),
    ))
    elements.append(Spacer(1, 10))

    first = profile.first_name if profile else "—"
    last  = profile.last_name  if profile else "—"
    pesel = _decrypt_pesel(profile.pesel if profile else None)
    program = (app.edition.program.name if app.edition and app.edition.program else "—")
    edition = (app.edition.edition_name  if app.edition else "—")
    accepted_date = _fmt_date(app.updated_at)

    body = _ps("Body", fontSize=11, leading=18, spaceAfter=6)

    elements.append(Paragraph("Zaświadcza się, że", body))
    elements.append(Paragraph(
        f"<b>{first} {last}</b>",
        _ps("Name", fontName=_FONT_BOLD, fontSize=13, alignment=1, spaceAfter=4),
    ))
    elements.append(Paragraph(f"PESEL: {pesel}", body))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f"został/a <b>przyjęty/a na studia podyplomowe</b>:", body,
    ))

    data = [
        ["Kierunek studiów:", program],
        ["Edycja:",           edition],
        ["Data przyjęcia:",   accepted_date],
        ["Numer wniosku:",    str(app.id)[:8].upper()],
    ]
    tbl = Table(data, colWidths=[5 * cm, 11 * cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME",       (0, 0), (0, -1), _FONT_BOLD),
        ("FONTNAME",       (1, 0), (1, -1), _FONT_REGULAR),
        ("FONTSIZE",       (0, 0), (-1, -1), 11),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT_BG, colors.white]),
        ("TOPPADDING",     (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 6),
        ("LEFTPADDING",    (0, 0), (-1, -1), 8),
        ("GRID",           (0, 0), (-1, -1), 0.3, colors.HexColor("#cbd5e1")),
        ("BOX",            (0, 0), (-1, -1), 1, NAVY),
    ]))
    elements.append(Spacer(1, 8))
    elements.append(tbl)
    elements.append(Spacer(1, 24))

    elements.append(Paragraph(
        "Zaświadczenie wydane na podstawie danych systemu rekrutacyjnego AGH.",
        _ps("Footer", fontName=_FONT_ITALIC, fontSize=9, textColor=MUTED),
    ))
    elements.append(Spacer(1, 40))
    elements.append(Paragraph(
        f"Kraków, {_today()}",
        _ps("Date", fontSize=10),
    ))
    elements.append(Spacer(1, 36))
    elements.append(HRFlowable(width=8 * cm, thickness=0.5,
                                color=colors.HexColor("#94a3b8")))
    elements.append(Paragraph(
        "Podpis Dziekana / Prodziekana",
        _ps("Sig", fontSize=9, textColor=MUTED),
    ))

    doc.build(elements)
    return buf.getvalue()


def _build_pdf_student_status(
    app: ProgramApplication, profile: CandidateProfile | None
) -> bytes:
    """Zaświadczenie o statusie studenta studiów podyplomowych."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2.5 * cm, rightMargin=2.5 * cm,
        topMargin=2.5 * cm, bottomMargin=2 * cm,
    )
    elements: list = []

    _institution_header(elements)

    elements.append(Paragraph(
        "ZAŚWIADCZENIE O STATUSIE STUDENTA STUDIÓW PODYPLOMOWYCH",
        _ps("Title", fontName=_FONT_BOLD, fontSize=14,
            alignment=1, textColor=NAVY, spaceAfter=8),
    ))
    elements.append(Spacer(1, 10))

    first = profile.first_name if profile else "—"
    last  = profile.last_name  if profile else "—"
    pesel = _decrypt_pesel(profile.pesel if profile else None)
    program = (app.edition.program.name if app.edition and app.edition.program else "—")
    edition = (app.edition.edition_name  if app.edition else "—")
    status_map = {
        "accepted":          "Student studiów podyplomowych — aktywny",
        "payment_confirmed": "Kandydat — opłata potwierdzona",
        "awaiting_payment":  "Kandydat — oczekuje na opłatę",
        "submitted":         "Kandydat — wniosek złożony",
        "documents_incomplete": "Kandydat — brak wymaganych dokumentów",
        "waitlisted":        "Kandydat — lista rezerwowa",
        "rejected":          "Kandydat — wniosek odrzucony",
        "cancelled":         "Kandydat — wniosek anulowany",
    }
    status_label = status_map.get(app.status, app.status)

    body = _ps("Body", fontSize=11, leading=18)

    elements.append(Paragraph("Zaświadcza się, że", body))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        f"<b>{first} {last}</b>",
        _ps("Name", fontName=_FONT_BOLD, fontSize=13, alignment=1, spaceAfter=4),
    ))
    elements.append(Paragraph(f"PESEL: {pesel}", body))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        f"posiada status: <b>{status_label}</b>", body,
    ))
    elements.append(Spacer(1, 12))

    data = [
        ["Kierunek studiów:",          program],
        ["Edycja:",                    edition],
        ["Aktualny status:",           status_label],
        ["Numer wniosku:",             str(app.id)[:8].upper()],
        ["Data wydania zaświadczenia:", _today()],
    ]
    tbl = Table(data, colWidths=[6 * cm, 10 * cm])
    tbl.setStyle(TableStyle([
        ("FONTNAME",       (0, 0), (0, -1), _FONT_BOLD),
        ("FONTNAME",       (1, 0), (1, -1), _FONT_REGULAR),
        ("FONTSIZE",       (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT_BG, colors.white]),
        ("TOPPADDING",     (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 6),
        ("LEFTPADDING",    (0, 0), (-1, -1), 8),
        ("GRID",           (0, 0), (-1, -1), 0.3, colors.HexColor("#cbd5e1")),
        ("BOX",            (0, 0), (-1, -1), 1, NAVY),
    ]))
    elements.append(tbl)
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(
        "Zaświadczenie wydane do celów urzędowych na podstawie danych systemu rekrutacyjnego AGH.",
        _ps("Footer", fontName=_FONT_ITALIC, fontSize=9, textColor=MUTED),
    ))
    elements.append(Spacer(1, 48))
    elements.append(HRFlowable(width=8 * cm, thickness=0.5,
                                color=colors.HexColor("#94a3b8")))
    elements.append(Paragraph(
        "Podpis Dziekana / Prodziekana",
        _ps("Sig", fontSize=9, textColor=MUTED),
    ))

    doc.build(elements)
    return buf.getvalue()


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.get("/applications/{application_id}/document")
async def generate_document(
    application_id: UUID,
    type: str = Query(..., description="acceptance | student_status"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and stream a PDF document for an application."""
    result = await db.execute(
        select(ProgramApplication)
        .where(ProgramApplication.id == application_id)
        .options(
            selectinload(ProgramApplication.edition)
            .selectinload(ProgramEdition.program),
            selectinload(ProgramApplication.user)
            .selectinload(User.profile),
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Wniosek nie znaleziony")

    admin_roles = {"admin_coordinator", "program_director", "cok_staff", "it_admin"}
    if str(app.user_id) != str(user.id) and str(user.role) not in admin_roles:
        raise HTTPException(status_code=403, detail="Brak dostępu")

    profile = app.user.profile if app.user else None

    if type == "acceptance":
        if app.status != "accepted":
            raise HTTPException(
                status_code=400,
                detail="Zaświadczenie o przyjęciu dostępne tylko dla statusu 'accepted'",
            )
        pdf_bytes = _build_pdf_acceptance(app, profile)
        filename = f"zaswiadczenie_przyjecie_{str(app.id)[:8].upper()}.pdf"

    elif type == "student_status":
        pdf_bytes = _build_pdf_student_status(app, profile)
        filename = f"zaswiadczenie_status_{str(app.id)[:8].upper()}.pdf"

    else:
        raise HTTPException(
            status_code=400,
            detail="Nieznany typ dokumentu. Użyj: acceptance | student_status",
        )

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
