from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.program import Program, ProgramEdition
from app.schemas.program import ProgramDetail, ProgramListItem

router = APIRouter(prefix="/programs", tags=["programs"])


@router.get("", response_model=list[ProgramListItem])
async def list_programs(search: str | None = None, db: AsyncSession = Depends(get_db)):
    """List all active programs, optionally filtered by search query."""
    query = select(Program).where(Program.is_active.is_(True)).order_by(Program.name)
    if search:
        query = query.where(Program.name.ilike(f"%{search}%"))
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{program_id}", response_model=ProgramDetail)
async def get_program(program_id: str, db: AsyncSession = Depends(get_db)):
    """Get program details with active editions."""
    result = await db.execute(select(Program).where(Program.id == program_id, Program.is_active.is_(True)))
    program = result.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program nie znaleziony")
    return program
