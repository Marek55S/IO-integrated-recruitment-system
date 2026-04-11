"""Generator danych testowych dla bazy rekrutacyjnej."""

import random
import uuid
from datetime import date, datetime, timedelta
from typing import Generator

from faker import Faker

fake = Faker("pl_PL")
Faker.seed(42)
random.seed(42)

PROGRAMS = [
    ("informatyka-st", "Informatyka — studia stacjonarne", 6000),
    ("zarzadzanie-np", "Zarządzanie — studia niestacjonarne", 5000),
    ("cyberbezpieczenstwo", "Cyberbezpieczeństwo", 7000),
]

STATUSES = [
    "draft",
    "submitted",
    "documents_incomplete",
    "documents_verified",
    "awaiting_enrollment_fee",
    "enrollment_fee_paid",
    "awaiting_payment",
    "payment_confirmed",
    "accepted",
]

DOC_TYPES = ["diploma_scan", "application_form", "enrollment_fee_proof"]

ACADEMIC_TITLES = ["magister", "magister inżynier", "inżynier", "licencjat"]

CANDIDATE_COUNT = 200
STAFF_COUNT = 4


def generate_uuid() -> str:
    return str(uuid.uuid4())


def sql_val(val) -> str:
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (date, datetime)):
        return f"'{val}'"
    return "'" + str(val).replace("'", "''") + "'"


def insert(table: str, columns: list[str], rows: list[tuple]) -> str:
    cols = ", ".join(columns)
    values = []
    for row in rows:
        vals = ", ".join(sql_val(v) for v in row)
        values.append(f"  ({vals})")
    return f"INSERT INTO {table} ({cols}) VALUES\n" + ",\n".join(values) + ";\n"


def generate_staff() -> list[tuple]:
    return [
        (
            generate_uuid(),
            fake.email(domain="agh.edu.pl"),
            "$2b$12$fakehash",
            "admin_coordinator",
            True,
        ),
        (
            generate_uuid(),
            fake.email(domain="agh.edu.pl"),
            "$2b$12$fakehash",
            "program_director",
            True,
        ),
        (
            generate_uuid(),
            fake.email(domain="agh.edu.pl"),
            "$2b$12$fakehash",
            "cok_staff",
            True,
        ),
        (
            generate_uuid(),
            fake.email(domain="agh.edu.pl"),
            "$2b$12$fakehash",
            "it_admin",
            True,
        ),
    ]


def generate_candidate() -> dict:
    user_id = generate_uuid()
    first_name = fake.first_name()
    last_name = fake.last_name()
    birth_date = fake.date_of_birth(minimum_age=23, maximum_age=50)
    pesel = fake.pesel()

    return {
        "user_id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": f"{first_name.lower()}.{last_name.lower()}@{fake.free_email_domain()}",
        "pesel": pesel,
        "birth_date": birth_date,
        "birth_place": fake.city(),
        "phone": fake.phone_number(),
        "address": {
            "country": "Polska",
            "city": fake.city(),
            "postal_code": fake.postcode(),
            "street": fake.street_name(),
            "house_number": str(random.randint(1, 150)),
        },
        "education": {
            "academic_title": random.choice(ACADEMIC_TITLES),
            "university_name": f"Uniwersytet {fake.city()}",
            "graduation_year": random.randint(2010, 2024),
            "diploma_country": random.choices(
                ["Polska", "Poza Polską"], weights=[90, 10]
            )[0],
        },
        "emergency": {
            "full_name": fake.name(),
            "email": fake.email(),
            "phone": fake.phone_number(),
        },
    }


def generate_application(user_id: str, edition_id: str, program_id: str) -> dict:
    status = random.choice(STATUSES)
    submitted_at = (
        fake.date_time_between(start_date="-3M", end_date="now")
        if status != "draft"
        else None
    )

    form_data = {}
    if program_id == "informatyka-st":
        form_data = {
            "github_profile": f"https://github.com/{fake.user_name()}",
            "study_mode_confirm": True,
        }
    elif program_id == "zarzadzanie-np":
        form_data = {
            "work_experience": random.choice(["Brak", "Do 2 lat", "Powyżej 2 lat"]),
            "weekend_availability": True,
        }

    return {
        "id": generate_uuid(),
        "user_id": user_id,
        "edition_id": edition_id,
        "status": status,
        "form_data": str(form_data)
        .replace("'", '"')
        .replace("True", "true")
        .replace("False", "false"),
        "submitted_at": submitted_at,
    }


def build_status_history(app: dict) -> list[tuple]:
    status_order = STATUSES[: STATUSES.index(app["status"]) + 1]
    rows = []
    ts = app["submitted_at"] or datetime.now()

    for i, status in enumerate(status_order):
        old = status_order[i - 1] if i > 0 else None
        rows.append(
            (
                generate_uuid(),
                app["id"],
                old,
                status,
                None,
                None,
                ts + timedelta(hours=i * 12),
            )
        )

    return rows


def build_payments(app: dict, tuition_fee: float) -> tuple[list, list, list]:
    plans, installments, payments_rows = [], [], []

    status_idx = STATUSES.index(app["status"])
    if status_idx < STATUSES.index("awaiting_enrollment_fee"):
        return plans, installments, payments_rows

    plan_id = generate_uuid()
    plan_type = random.choice(["full", "installments"])
    plans.append((plan_id, app["id"], plan_type))

    enrollment_id = generate_uuid()
    enrollment_paid = status_idx >= STATUSES.index("enrollment_fee_paid")
    installments.append(
        (
            enrollment_id,
            plan_id,
            "enrollment_fee",
            None,
            100.00,
            date.today() - timedelta(days=30),
            "paid" if enrollment_paid else "pending",
        )
    )

    if enrollment_paid:
        payments_rows.append(
            (
                generate_uuid(),
                enrollment_id,
                100.00,
                "completed",
                f"GW-TXN-{random.randint(100000, 999999)}",
                "SUCCESS",
                datetime.now() - timedelta(days=25),
            )
        )

    if status_idx >= STATUSES.index("awaiting_payment"):
        if plan_type == "full":
            inst_id = generate_uuid()
            paid = status_idx >= STATUSES.index("payment_confirmed")
            installments.append(
                (
                    inst_id,
                    plan_id,
                    "full_payment",
                    None,
                    tuition_fee,
                    date.today() + timedelta(days=14),
                    "paid" if paid else "pending",
                )
            )
            if paid:
                payments_rows.append(
                    (
                        generate_uuid(),
                        inst_id,
                        tuition_fee,
                        "completed",
                        f"GW-TXN-{random.randint(100000, 999999)}",
                        "SUCCESS",
                        datetime.now() - timedelta(days=10),
                    )
                )
        else:
            num_installments = random.choice([2, 3, 4])
            per_installment = round(tuition_fee / num_installments, 2)
            for i in range(num_installments):
                inst_id = generate_uuid()
                due = date.today() + timedelta(days=30 * (i + 1))
                paid = i == 0 and status_idx >= STATUSES.index("payment_confirmed")
                installments.append(
                    (
                        inst_id,
                        plan_id,
                        "installment",
                        i + 1,
                        per_installment,
                        due,
                        "paid" if paid else "pending",
                    )
                )
                if paid:
                    payments_rows.append(
                        (
                            generate_uuid(),
                            inst_id,
                            per_installment,
                            "completed",
                            f"GW-TXN-{random.randint(100000, 999999)}",
                            "SUCCESS",
                            datetime.now() - timedelta(days=5),
                        )
                    )

    return plans, installments, payments_rows


def build_documents(app: dict) -> list[tuple]:
    status_idx = STATUSES.index(app["status"])
    if status_idx < STATUSES.index("submitted"):
        return []

    rows = []
    for doc_type in DOC_TYPES:
        ext = random.choice(["pdf", "jpg"])
        status = "pending"
        if app["status"] == "documents_incomplete" and doc_type == "diploma_scan":
            status = "rejected"
        elif status_idx >= STATUSES.index("documents_verified"):
            status = "accepted"

        rows.append(
            (
                generate_uuid(),
                app["id"],
                doc_type,
                f"/uploads/{app['user_id']}/{doc_type}.{ext}",
                f"{doc_type}.{ext}",
                f"application/{ext}",
                status,
                None,
                None,
                datetime.now() - timedelta(days=random.randint(1, 60)),
            )
        )

    return rows


def generate_sql() -> str:
    output = ["-- Wygenerowane automatycznie przez seed_generator.py\n"]

    # --- Staff ---
    staff = generate_staff()
    staff_rows = [(s[0], s[1], s[2], s[3], s[4]) for s in staff]

    # --- Candidates ---
    candidates = [generate_candidate() for _ in range(CANDIDATE_COUNT)]

    user_rows = [
        (c["user_id"], c["email"], "$2b$12$fakehash", "candidate", True)
        for c in candidates
    ]
    user_rows.extend(staff_rows)
    output.append(
        insert(
            "users", ["id", "email", "password_hash", "role", "is_active"], user_rows
        )
    )

    output.append(
        insert(
            "candidate_profiles",
            [
                "user_id",
                "first_name",
                "last_name",
                "pesel",
                "birth_date",
                "birth_place",
                "citizenship",
                "phone",
            ],
            [
                (
                    c["user_id"],
                    c["first_name"],
                    c["last_name"],
                    c["pesel"],
                    c["birth_date"],
                    c["birth_place"],
                    "polska",
                    c["phone"],
                )
                for c in candidates
            ],
        )
    )

    output.append(
        insert(
            "addresses",
            [
                "user_id",
                "type",
                "country",
                "city",
                "postal_code",
                "street",
                "house_number",
            ],
            [
                (
                    c["user_id"],
                    "residence",
                    c["address"]["country"],
                    c["address"]["city"],
                    c["address"]["postal_code"],
                    c["address"]["street"],
                    c["address"]["house_number"],
                )
                for c in candidates
            ],
        )
    )

    output.append(
        insert(
            "education_records",
            [
                "user_id",
                "academic_title",
                "university_name",
                "graduation_year",
                "diploma_country",
            ],
            [
                (
                    c["user_id"],
                    c["education"]["academic_title"],
                    c["education"]["university_name"],
                    c["education"]["graduation_year"],
                    c["education"]["diploma_country"],
                )
                for c in candidates
            ],
        )
    )

    output.append(
        insert(
            "emergency_contacts",
            ["user_id", "full_name", "email", "phone"],
            [
                (
                    c["user_id"],
                    c["emergency"]["full_name"],
                    c["emergency"]["email"],
                    c["emergency"]["phone"],
                )
                for c in candidates
            ],
        )
    )

    agreement_rows = []
    for c in candidates:
        agreement_rows.append(
            (
                c["user_id"],
                "rodo",
                True,
                datetime.now() - timedelta(days=random.randint(1, 90)),
            )
        )
        accepted_marketing = random.choice([True, False])
        agreement_rows.append(
            (
                c["user_id"],
                "marketing",
                accepted_marketing,
                (
                    datetime.now() - timedelta(days=random.randint(1, 90))
                    if accepted_marketing
                    else None
                ),
            )
        )
    output.append(
        insert(
            "user_agreements",
            ["user_id", "agreement_type", "accepted", "accepted_at"],
            agreement_rows,
        )
    )

    # --- Programs & editions ---
    output.append(
        insert(
            "programs",
            ["id", "name", "description", "is_active"],
            [
                (pid, name, f"Studia podyplomowe: {name}", True)
                for pid, name, _ in PROGRAMS
            ],
        )
    )

    editions = []
    for pid, _, tuition in PROGRAMS:
        eid = generate_uuid()
        editions.append((eid, pid, tuition))
        output.append(
            insert(
                "program_editions",
                [
                    "id",
                    "program_id",
                    "edition_name",
                    "recruitment_start",
                    "recruitment_end",
                    "studies_start",
                    "studies_end",
                    "min_enrollment",
                    "max_enrollment",
                    "enrollment_fee",
                    "tuition_fee",
                ],
                [
                    (
                        eid,
                        pid,
                        "2025/2026 semestr zimowy",
                        date(2025, 6, 1),
                        date(2025, 9, 30),
                        date(2025, 10, 15),
                        date(2026, 6, 30),
                        15,
                        40,
                        100.00,
                        tuition,
                    )
                ],
            )
        )

    doc_req_rows = []
    for eid, _, _ in editions:
        for doc_type in DOC_TYPES:
            doc_req_rows.append((generate_uuid(), eid, doc_type, None, True))
    output.append(
        insert(
            "edition_required_documents",
            ["id", "edition_id", "doc_type", "description", "is_required"],
            doc_req_rows,
        )
    )

    # --- Applications ---
    all_apps = []
    used_pairs: set[tuple[str, str]] = set()

    for candidate in candidates:
        edition = random.choice(editions)
        pair = (candidate["user_id"], edition[0])
        if pair in used_pairs:
            continue
        used_pairs.add(pair)

        app = generate_application(candidate["user_id"], edition[0], edition[1])
        all_apps.append((app, edition[2]))

    output.append(
        insert(
            "program_applications",
            ["id", "user_id", "edition_id", "status", "form_data", "submitted_at"],
            [
                (
                    a["id"],
                    a["user_id"],
                    a["edition_id"],
                    a["status"],
                    a["form_data"],
                    a["submitted_at"],
                )
                for a, _ in all_apps
            ],
        )
    )

    # --- Status history ---
    history_rows = []
    for app, _ in all_apps:
        history_rows.extend(build_status_history(app))
    if history_rows:
        output.append(
            insert(
                "application_status_history",
                [
                    "id",
                    "application_id",
                    "old_status",
                    "new_status",
                    "changed_by",
                    "note",
                    "changed_at",
                ],
                history_rows,
            )
        )

    # --- Documents ---
    doc_rows = []
    for app, _ in all_apps:
        doc_rows.extend(build_documents(app))
    if doc_rows:
        output.append(
            insert(
                "application_documents",
                [
                    "id",
                    "application_id",
                    "doc_type",
                    "file_path",
                    "file_name",
                    "mime_type",
                    "status",
                    "reviewed_by",
                    "review_note",
                    "uploaded_at",
                ],
                doc_rows,
            )
        )

    # --- Payments ---
    all_plans, all_installments, all_payments = [], [], []
    for app, tuition in all_apps:
        plans, installments, payment_rows = build_payments(app, tuition)
        all_plans.extend(plans)
        all_installments.extend(installments)
        all_payments.extend(payment_rows)

    if all_plans:
        output.append(
            insert("payment_plans", ["id", "application_id", "plan_type"], all_plans)
        )
    if all_installments:
        output.append(
            insert(
                "payment_installments",
                [
                    "id",
                    "plan_id",
                    "type",
                    "installment_no",
                    "amount",
                    "due_date",
                    "status",
                ],
                all_installments,
            )
        )
    if all_payments:
        output.append(
            insert(
                "payments",
                [
                    "id",
                    "installment_id",
                    "amount_paid",
                    "status",
                    "gateway_tx_id",
                    "gateway_status",
                    "paid_at",
                ],
                all_payments,
            )
        )

    return "\n".join(output)


if __name__ == "__main__":
    sql = generate_sql()
    output_path = "database/seed.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"Wygenerowano {CANDIDATE_COUNT} kandydatów → {output_path}")
