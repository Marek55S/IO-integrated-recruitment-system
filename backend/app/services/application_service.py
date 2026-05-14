from app.models.enums import ApplicationStatus

# Allowed state transitions for the application status machine.
ALLOWED_TRANSITIONS: dict[ApplicationStatus, list[ApplicationStatus]] = {
    ApplicationStatus.draft: [
        ApplicationStatus.submitted,
        ApplicationStatus.cancelled,
    ],
    ApplicationStatus.submitted: [
        ApplicationStatus.documents_incomplete,
        ApplicationStatus.documents_verified,
        ApplicationStatus.cancelled,
    ],
    ApplicationStatus.documents_incomplete: [
        ApplicationStatus.submitted,  # re-submission after fixing
        ApplicationStatus.cancelled,
    ],
    ApplicationStatus.documents_verified: [
        ApplicationStatus.awaiting_enrollment_fee,
        ApplicationStatus.cancelled,
    ],
    ApplicationStatus.awaiting_enrollment_fee: [
        ApplicationStatus.enrollment_fee_paid,
        ApplicationStatus.cancelled,
    ],
    ApplicationStatus.enrollment_fee_paid: [
        ApplicationStatus.awaiting_payment,
        ApplicationStatus.cancelled,
    ],
    ApplicationStatus.awaiting_payment: [
        ApplicationStatus.payment_confirmed,
        ApplicationStatus.cancelled,
    ],
    ApplicationStatus.payment_confirmed: [
        ApplicationStatus.accepted,
        ApplicationStatus.waitlisted,
        ApplicationStatus.rejected,
    ],
    ApplicationStatus.accepted: [
        ApplicationStatus.studies_not_launched,
    ],
    ApplicationStatus.waitlisted: [
        ApplicationStatus.accepted,
        ApplicationStatus.rejected,
    ],
    # Terminal states — no transitions from: rejected, cancelled, studies_not_launched
}


def validate_transition(current: str, new: str) -> bool:
    """Check if status transition is allowed."""
    try:
        current_status = ApplicationStatus(current)
        new_status = ApplicationStatus(new)
    except ValueError:
        return False
    allowed = ALLOWED_TRANSITIONS.get(current_status, [])
    return new_status in allowed
