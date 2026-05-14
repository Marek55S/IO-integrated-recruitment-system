import enum


# ── User roles ──────────────────────────────────────────────
class UserRole(str, enum.Enum):
    candidate = "candidate"
    admin_coordinator = "admin_coordinator"
    program_director = "program_director"
    cok_staff = "cok_staff"
    it_admin = "it_admin"


ADMIN_ROLES = {
    UserRole.admin_coordinator,
    UserRole.program_director,
    UserRole.cok_staff,
    UserRole.it_admin,
}


# ── Application status (state machine) ─────────────────────
class ApplicationStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    documents_incomplete = "documents_incomplete"
    documents_verified = "documents_verified"
    awaiting_enrollment_fee = "awaiting_enrollment_fee"
    enrollment_fee_paid = "enrollment_fee_paid"
    awaiting_payment = "awaiting_payment"
    payment_confirmed = "payment_confirmed"
    accepted = "accepted"
    waitlisted = "waitlisted"
    rejected = "rejected"
    cancelled = "cancelled"
    studies_not_launched = "studies_not_launched"


# ── Document types ──────────────────────────────────────────
class RequiredDocType(str, enum.Enum):
    diploma_scan = "diploma_scan"
    application_form = "application_form"
    marketing_consent = "marketing_consent"
    enrollment_fee_proof = "enrollment_fee_proof"
    id_copy = "id_copy"
    other = "other"


class DocumentStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


# ── Payments ────────────────────────────────────────────────
class PaymentPlanType(str, enum.Enum):
    full = "full"
    installments = "installments"


class InstallmentType(str, enum.Enum):
    enrollment_fee = "enrollment_fee"
    full_payment = "full_payment"
    installment = "installment"


class InstallmentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    overdue = "overdue"
    waived = "waived"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"


# ── Communication ──────────────────────────────────────────
class MessageChannel(str, enum.Enum):
    system = "system"
    email = "email"
    whatsapp = "whatsapp"


class MessageDirection(str, enum.Enum):
    outbound = "outbound"
    inbound = "inbound"


class NotificationType(str, enum.Enum):
    documents_incomplete = "documents_incomplete"
    payment_reminder = "payment_reminder"
    status_change = "status_change"
    welcome = "welcome"
    studies_not_launched = "studies_not_launched"
    accepted = "accepted"
