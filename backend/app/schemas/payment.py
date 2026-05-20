from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class PaymentInstallmentResponse(BaseModel):
    id: UUID
    type: str
    installment_no: int | None = None
    amount: Decimal
    due_date: date
    status: str

    model_config = {"from_attributes": True}


class PaymentPlanResponse(BaseModel):
    id: UUID
    plan_type: str
    created_at: datetime
    installments: list[PaymentInstallmentResponse] = []

    model_config = {"from_attributes": True}


class PaymentPlanCreate(BaseModel):
    plan_type: str  # 'full' | 'installments'
    num_installments: int | None = None  # for 'installments' type
