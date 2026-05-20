# -*- coding: utf-8 -*-
import sys

"""
Skrypt seedowania bazy danych dla systemu rekrutacyjnego.

Wczytuje:
  - 200 kandydatów z mockowanymi danymi
  - 4 pracowników (admin_coordinator, program_director, cok_staff, it_admin)
  - Konto administratora: admin@recruitment.pl / Admin123!
  - Konto testowe: szymon.tymek@gmail.com / Szymon123
  - Programy i edycje
  - Zgłoszenia rekrutacyjne, dokumenty, płatności, historię statusów

Użycie:
  cd <root projektu>
  python database/seed.py

Wymaga:
  pip install bcrypt faker psycopg2-binary
  (lub psycopg2 jeśli wolisz)

Baza danych musi być uruchomiona (docker-compose up -d w katalogu database/).
"""

import json
import os
import random
import sys
import uuid
from datetime import date, datetime, timedelta, timezone

# ---------------------------------------------------------------------------
# Zależności — sprawdź przed importem
# ---------------------------------------------------------------------------
try:
    import bcrypt
except ImportError:
    print("Brak pakietu 'bcrypt'. Zainstaluj: pip install bcrypt")
    sys.exit(1)

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("Brak pakietu 'psycopg2-binary'. Zainstaluj: pip install psycopg2-binary")
    sys.exit(1)

try:
    from faker import Faker
except ImportError:
    print("Brak pakietu 'faker'. Zainstaluj: pip install faker")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Konfiguracja
# ---------------------------------------------------------------------------

# Odczytaj DATABASE_URL ze zmiennych środowiskowych lub pliku .env
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user_admin:super_secret_password@127.0.0.1:5434/recruitment_system",
)

# Jeśli DATABASE_URL używa asyncpg (FastAPI), zamień na psycopg2-compatible
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

CANDIDATE_COUNT = 200
SEED_VALUE = 42

fake = Faker("pl_PL")
Faker.seed(SEED_VALUE)
random.seed(SEED_VALUE)

# ---------------------------------------------------------------------------
# Stałe danych
# ---------------------------------------------------------------------------

from seed_programs import PROGRAMS as SCRAPED_PROGRAMS, download_image

PROGRAMS = []
for p in SCRAPED_PROGRAMS:
    PROGRAMS.append({
        "id": p["id"],
        "name": p["name"],
        "description": p["description"],
        "image_src": p.get("image_remote"),
        "image_local": p.get("image_local"),
        "tuition_fee": p["tuition_fee"],
        "closest_term": p.get("closest_term", date(2026, 10, 1)),
        "mode": p.get("mode", "hybrydowy"),
    })


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

# ---------------------------------------------------------------------------
# Pomocnicze
# ---------------------------------------------------------------------------


def gen_uuid() -> str:
    return str(uuid.uuid4())


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Generatory danych
# ---------------------------------------------------------------------------


def make_staff_users() -> list[dict]:
    """Zwraca listę użytkowników-pracowników (bez admina i szymon.tymek)."""
    roles = ["admin_coordinator", "program_director", "cok_staff"]
    users = []
    for role in roles:
        users.append(
            {
                "id": gen_uuid(),
                "email": fake.email(domain="agh.edu.pl"),
                "password_hash": hash_password("Staff123!"),
                "role": role,
                "is_active": True,
            }
        )
    return users


def make_special_users() -> list[dict]:
    """
    Tworzy wymagane konta specjalne (it_admin):
      - admin@recruitment.pl        / Admin123!
      - admin@agh.edu.pl            / admin123
    """
    return [
        {
            "id": gen_uuid(),
            "email": "admin@recruitment.pl",
            "password_hash": hash_password("Admin123!"),
            "role": "it_admin",
            "is_active": True,
        },
        {
            "id": gen_uuid(),
            "email": "admin@agh.edu.pl",
            "password_hash": hash_password("admin123"),
            "role": "it_admin",
            "is_active": True,
        },
    ]


def make_candidate() -> dict:
    user_id = gen_uuid()
    first_name = fake.first_name()
    last_name = fake.last_name()
    birth_date = fake.date_of_birth(minimum_age=23, maximum_age=55)
    return {
        "user_id": user_id,
        "email": f"{first_name.lower().replace(' ', '')}.{last_name.lower().replace(' ', '')}_{random.randint(1,999)}@{fake.free_email_domain()}",
        "first_name": first_name,
        "last_name": last_name,
        "pesel": fake.pesel(),
        "birth_date": birth_date,
        "birth_place": fake.city(),
        "citizenship": "polska",
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
            "diploma_country": random.choices(["Polska", "Poza Polską"], weights=[90, 10])[0],
        },
        "emergency": {
            "full_name": fake.name(),
            "email": fake.email(),
            "phone": fake.phone_number(),
        },
    }


def make_application(user_id: str, edition_id: str, program_id: str) -> dict:
    status = random.choice(STATUSES)
    submitted_at = (
        fake.date_time_between(start_date="-3M", end_date="now", tzinfo=timezone.utc)
        if status != "draft"
        else None
    )
    form_data: dict = {}
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
        "id": gen_uuid(),
        "user_id": user_id,
        "edition_id": edition_id,
        "status": status,
        "form_data": json.dumps(form_data),
        "submitted_at": submitted_at,
    }


def make_status_history(app: dict) -> list[tuple]:
    status_order = STATUSES[: STATUSES.index(app["status"]) + 1]
    rows = []
    ts = app["submitted_at"] or now_utc()
    for i, status in enumerate(status_order):
        old = status_order[i - 1] if i > 0 else None
        rows.append(
            (
                gen_uuid(),
                app["id"],
                old,
                status,
                None,
                None,
                ts + timedelta(hours=i * 12),
            )
        )
    return rows


def make_documents(app: dict) -> list[tuple]:
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
                gen_uuid(),
                app["id"],
                doc_type,
                f"/uploads/{app['user_id']}/{doc_type}.{ext}",
                f"{doc_type}.{ext}",
                f"application/{ext}",
                status,
                None,
                None,
                now_utc() - timedelta(days=random.randint(1, 60)),
                None,
            )
        )
    return rows


def make_payments(app: dict, tuition_fee: float) -> tuple[list, list, list]:
    plans, installments, payments_rows = [], [], []
    status_idx = STATUSES.index(app["status"])
    if status_idx < STATUSES.index("awaiting_enrollment_fee"):
        return plans, installments, payments_rows

    plan_id = gen_uuid()
    plan_type = random.choice(["full", "installments"])
    plans.append((plan_id, app["id"], plan_type))

    enrollment_id = gen_uuid()
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
                gen_uuid(),
                enrollment_id,
                100.00,
                "completed",
                f"GW-TXN-{random.randint(100000, 999999)}",
                "SUCCESS",
                now_utc() - timedelta(days=25),
            )
        )

    if status_idx >= STATUSES.index("awaiting_payment"):
        if plan_type == "full":
            inst_id = gen_uuid()
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
                        gen_uuid(),
                        inst_id,
                        tuition_fee,
                        "completed",
                        f"GW-TXN-{random.randint(100000, 999999)}",
                        "SUCCESS",
                        now_utc() - timedelta(days=10),
                    )
                )
        else:
            num_inst = random.choice([2, 3, 4])
            per_inst = round(tuition_fee / num_inst, 2)
            for i in range(num_inst):
                inst_id = gen_uuid()
                due = date.today() + timedelta(days=30 * (i + 1))
                paid = i == 0 and status_idx >= STATUSES.index("payment_confirmed")
                installments.append(
                    (inst_id, plan_id, "installment", i + 1, per_inst, due, "paid" if paid else "pending")
                )
                if paid:
                    payments_rows.append(
                        (
                            gen_uuid(),
                            inst_id,
                            per_inst,
                            "completed",
                            f"GW-TXN-{random.randint(100000, 999999)}",
                            "SUCCESS",
                            now_utc() - timedelta(days=5),
                        )
                    )
    return plans, installments, payments_rows


# ---------------------------------------------------------------------------
# Główny seed
# ---------------------------------------------------------------------------


def seed(conn):
    cur = conn.cursor()

    print("[INFO] Czyszczenie starych danych (CASCADE)...")
    # Kolejność usuwa w odwrotnej kolejności FK
    tables = [
        "notifications",
        "contact_messages",
        "payments",
        "payment_installments",
        "payment_plans",
        "application_documents",
        "application_status_history",
        "program_applications",
        "edition_required_documents",
        "program_editions",
        "programs",
        "user_agreements",
        "emergency_contacts",
        "education_records",
        "addresses",
        "candidate_profiles",
        "users",
    ]
    for table in tables:
        cur.execute(f"DELETE FROM {table}")
    conn.commit()
    print("[OK] Dane wyczyszczone.\n")

    # ── Użytkownicy ──────────────────────────────────────────
    print("[INFO] Tworzenie uzytkownikow...")

    special_users = make_special_users()
    staff_users = make_staff_users()
    candidates = [make_candidate() for _ in range(CANDIDATE_COUNT)]
    
    # Dodajemy konta Szymona jako kandydatów
    szymon1 = make_candidate()
    szymon1["email"] = "szymon.tymek@gmail.com"
    szymon1["first_name"] = "Szymon"
    szymon1["last_name"] = "Tymek"
    szymon1["user_id"] = gen_uuid()  # Unikalne ID dla szymon.tymek
    szymon1["password_hash"] = hash_password("Szymon123")

    szymon2 = make_candidate()
    szymon2["email"] = "szymon.tyburczy22@gmail.com"
    szymon2["first_name"] = "Szymon"
    szymon2["last_name"] = "Tyburczy"
    szymon2["user_id"] = gen_uuid()  # Unikalne ID dla szymon.tyburczy22
    szymon2["password_hash"] = hash_password("Szymon123")
    
    candidates.append(szymon1)
    candidates.append(szymon2)

    # Inserty użytkowników
    all_users = (
        [(u["id"], u["email"], u["password_hash"], u["role"], u["is_active"]) for u in special_users]
        + [(u["id"], u["email"], u["password_hash"], u["role"], u["is_active"]) for u in staff_users]
        + [(c["user_id"],c["email"],c.get("password_hash") or hash_password("Kandydat123!"),c.get("role", "candidate"),True,)
    for c in candidates
]
    )

    psycopg2.extras.execute_values(
        cur,
        "INSERT INTO users (id, email, password_hash, role, is_active) VALUES %s ON CONFLICT (email) DO NOTHING",
        all_users,
    )

    print(f"   + {len(special_users)} specjalnych kont (admin + szymon.tymek)")
    print(f"   + {len(staff_users)} pracownikow")
    print(f"   + {CANDIDATE_COUNT} kandydatow")

    # ── Profile kandydatów ────────────────────────────────────
    print("[INFO] Profile kandydatow...")
    psycopg2.extras.execute_values(
        cur,
        """INSERT INTO candidate_profiles
           (user_id, first_name, last_name, pesel, birth_date, birth_place, citizenship, phone)
           VALUES %s""",
        [
            (
                c["user_id"], c["first_name"], c["last_name"],
                c["pesel"], c["birth_date"], c["birth_place"],
                c["citizenship"], c["phone"],
            )
            for c in candidates
        ],
    )

    # ── Adresy ───────────────────────────────────────────────
    psycopg2.extras.execute_values(
        cur,
        """INSERT INTO addresses
           (user_id, type, country, city, postal_code, street, house_number)
           VALUES %s""",
        [
            (
                c["user_id"], "residence",
                c["address"]["country"], c["address"]["city"],
                c["address"]["postal_code"], c["address"]["street"],
                c["address"]["house_number"],
            )
            for c in candidates
        ],
    )

    # ── Wykształcenie ─────────────────────────────────────────
    psycopg2.extras.execute_values(
        cur,
        """INSERT INTO education_records
           (user_id, academic_title, university_name, graduation_year, diploma_country)
           VALUES %s""",
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

    # ── Kontakty alarmowe ─────────────────────────────────────
    psycopg2.extras.execute_values(
        cur,
        "INSERT INTO emergency_contacts (user_id, full_name, email, phone) VALUES %s",
        [(c["user_id"], c["emergency"]["full_name"], c["emergency"]["email"], c["emergency"]["phone"]) for c in candidates],
    )

    # ── Zgody ────────────────────────────────────────────────
    agreement_rows = []
    for c in candidates:
        agreement_rows.append((c["user_id"], "rodo", True, now_utc() - timedelta(days=random.randint(1, 90))))
        accepted_mkt = random.choice([True, False])
        agreement_rows.append(
            (
                c["user_id"], "marketing", accepted_mkt,
                (now_utc() - timedelta(days=random.randint(1, 90))) if accepted_mkt else None,
            )
        )
    psycopg2.extras.execute_values(
        cur,
        "INSERT INTO user_agreements (user_id, agreement_type, accepted, accepted_at) VALUES %s",
        agreement_rows,
    )
    print("   + Profile, adresy, wyksztalcenie, kontakty alarmowe, zgody.")

    # ── Programy ──────────────────────────────────────────────
    print("[INFO] Programy i edycje...")
    
    # Download images first
    for p in PROGRAMS:
        if p.get("image_src") and p.get("image_local"):
            p["image_src"] = download_image(p["image_src"], p["image_local"])
        else:
            p["image_src"] = "/images/programs/placeholder.jpg"
            
    psycopg2.extras.execute_values(
        cur,
        "INSERT INTO programs (id, name, description, image_src, is_active) VALUES %s",
        [(p["id"], p["name"], p["description"], p["image_src"], True) for p in PROGRAMS],
    )

    editions = []  # list of (edition_id, program_id, tuition_fee)
    for prog in PROGRAMS:
        eid = gen_uuid()
        editions.append((eid, prog["id"], prog["tuition_fee"]))
        cur.execute(
            """INSERT INTO program_editions
               (id, program_id, edition_name, recruitment_start, recruitment_end,
                studies_start, studies_end, min_enrollment, max_enrollment,
                enrollment_fee, tuition_fee)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                eid, prog["id"], "2025/2026 semestr zimowy",
                date(2025, 6, 1), date(2025, 9, 30),
                date(2025, 10, 15), date(2026, 6, 30),
                15, 40, 100.00, prog["tuition_fee"],
            ),
        )

    doc_req_rows = []
    for eid, _, _ in editions:
        for doc_type in DOC_TYPES:
            doc_req_rows.append((gen_uuid(), eid, doc_type, None, True))
    psycopg2.extras.execute_values(
        cur,
        "INSERT INTO edition_required_documents (id, edition_id, doc_type, description, is_required) VALUES %s",
        doc_req_rows,
    )
    print(f"   + {len(PROGRAMS)} programow, {len(editions)} edycji, {len(doc_req_rows)} wymaganych dokumentow.")

    # ── Zgłoszenia ────────────────────────────────────────────
    print("[INFO] Zgloszenia rekrutacyjne...")
    all_apps = []
    used_pairs: set[tuple] = set()

    for candidate in candidates:
        edition = random.choice(editions)
        pair = (candidate["user_id"], edition[0])
        if pair in used_pairs:
            continue
        used_pairs.add(pair)
        app = make_application(candidate["user_id"], edition[0], edition[1])
        all_apps.append((app, edition[2]))

    psycopg2.extras.execute_values(
        cur,
        """INSERT INTO program_applications
           (id, user_id, edition_id, status, form_data, submitted_at)
           VALUES %s""",
        [
            (a["id"], a["user_id"], a["edition_id"], a["status"], a["form_data"], a["submitted_at"])
            for a, _ in all_apps
        ],
    )
    print(f"   + {len(all_apps)} zgloszen.")

    # ── Historia statusów ─────────────────────────────────────
    print("[INFO] Historia statusow...")
    history_rows = []
    for app, _ in all_apps:
        history_rows.extend(make_status_history(app))
    if history_rows:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO application_status_history
               (id, application_id, old_status, new_status, changed_by, note, changed_at)
               VALUES %s""",
            history_rows,
        )
    print(f"   + {len(history_rows)} wpisow historii.")

    # ── Dokumenty ─────────────────────────────────────────────
    print("[INFO] Dokumenty...")
    doc_rows = []
    for app, _ in all_apps:
        doc_rows.extend(make_documents(app))
    if doc_rows:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO application_documents
               (id, application_id, doc_type, file_path, file_name, mime_type,
                status, reviewed_by, review_note, uploaded_at, reviewed_at)
               VALUES %s""",
            doc_rows,
        )
    print(f"   + {len(doc_rows)} dokumentow.")

    # ── Płatności ─────────────────────────────────────────────
    print("[INFO] Plany platnosci i platnosci...")
    all_plans, all_installments, all_payments = [], [], []
    for app, tuition in all_apps:
        plans, installments, payment_rows = make_payments(app, tuition)
        all_plans.extend(plans)
        all_installments.extend(installments)
        all_payments.extend(payment_rows)

    if all_plans:
        psycopg2.extras.execute_values(
            cur,
            "INSERT INTO payment_plans (id, application_id, plan_type) VALUES %s",
            all_plans,
        )
    if all_installments:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO payment_installments
               (id, plan_id, type, installment_no, amount, due_date, status)
               VALUES %s""",
            all_installments,
        )
    if all_payments:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO payments
               (id, installment_id, amount_paid, status, gateway_tx_id, gateway_status, paid_at)
               VALUES %s""",
            all_payments,
        )
    print(f"   + {len(all_plans)} planow, {len(all_installments)} rat, {len(all_payments)} platnosci.")

    conn.commit()
    cur.close()


# ---------------------------------------------------------------------------
# Uruchomienie
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("  SEED BAZY DANYCH — System Rekrutacyjny")
    print("=" * 60)
    print(f"  Łączenie z: {DATABASE_URL}")
    print()

    try:
        conn = psycopg2.connect(DATABASE_URL)
    except psycopg2.OperationalError as e:
        print(f"[ERROR] Blad polaczenia z baza danych:\n   {e}")
        print("\nSprawdz czy baza jest uruchomiona (docker-compose up -d w katalogu database/)")
        sys.exit(1)

    try:
        seed(conn)
    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Blad podczas seedowania: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        conn.close()

    print()
    print("=" * 62)
    print("[OK] Seedowanie zakonczone pomyslnie!")
    print()
    print("  Konta testowe:")
    print("  Email                           | Haslo        | Rola")
    print("  --------------------------------+--------------+------------------")
    print("  admin@recruitment.pl            | Admin123!    | it_admin")
    print("  admin@agh.edu.pl                | admin123     | it_admin")
    print("  szymon.tymek@gmail.com          | Szymon123    | it_admin")
    print("  szymon.tyburczy22@gmail.com     | Szymon123    | it_admin")
    print("  (losowy)@agh.edu.pl x3          | Staff123!    | rozne role")
    print("  (mock kandydaci x200)           | Kandydat123! | candidate")
    print("=" * 62)
