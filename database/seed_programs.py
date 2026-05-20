# -*- coding: utf-8 -*-
import sys

"""
Skrypt wstrzykujacy rzeczywiste kierunki podyplomowe AGH WI do bazy danych.

Dane pobrane z: https://podyplomowe.informatyka.agh.edu.pl/
- 12 kierunkow z opisami, cenami, zdjeciami i edycjami
- Zdjecia pobierane bezposrednio z serwera AGH i zapisywane lokalnie

Uzycie:
  python database/seed_programs.py

Wymaga: pip install psycopg2-binary requests
"""

import json
import os
import re
import uuid
import sys
from datetime import date, datetime, timezone
from pathlib import Path

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("Brak pakietu 'psycopg2-binary'. Zainstaluj: pip install psycopg2-binary")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("Brak pakietu 'requests'. Zainstaluj: pip install requests")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Konfiguracja
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user_admin:super_secret_password@127.0.0.1:5434/recruitment_system",
).replace("postgresql+asyncpg://", "postgresql://")

# Katalog na zdjecia w Next.js (public/programs/)
PROJECT_ROOT = Path(__file__).parent.parent
IMAGES_DIR = PROJECT_ROOT / "client" / "public" / "programs"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

AGH_BASE = "https://podyplomowe.informatyka.agh.edu.pl"

DOC_TYPES = ["diploma_scan", "application_form", "enrollment_fee_proof"]

# ---------------------------------------------------------------------------
# Dane kierunkow (pobrane z AGH API + uzupelnione opisami ze stron)
# ---------------------------------------------------------------------------
PROGRAMS = [
    {
        "id": "analiza-danych-data-science-hybrydowe",
        "name": "Analiza Danych - Data Science (hybrydowe)",
        "description": (
            "Studia podyplomowe z zakresu analizy danych i data science w trybie hybrydowym. "
            "Program obejmuje metody statystyczne, uczenie maszynowe, wizualizacje danych oraz "
            "nowoczesne narzedzia analityczne stosowane w biznesie i nauce. "
            "Zajecia prowadzone weekendowo, lacza spotkania stacjonarne z modulami online."
        ),
        "duration": "2 semestry",
        "mode": "hybrydowy",
        "formula": "weekendowa",
        "tuition_fee": 11300.00,
        "image_remote": "/media/cache/d4/29/d429be35c0a6e4f06e9369503a820b36.jpg",
        "image_local": "analiza-danych-data-science.jpg",
        "url_slug": "sp-adds-hybryda1",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "analiza-danych-data-science-online",
        "name": "Analiza Danych - Data Science (online)",
        "description": (
            "Studia podyplomowe z zakresu analizy danych i data science w pelni online. "
            "Program przygotowuje specjalistow do pracy z duzymi zbiorami danych, modelowania "
            "predykcyjnego i podejmowania decyzji na podstawie danych. "
            "Zajecia prowadzone weekendowo w formie zdalnej, dostepne z dowolnego miejsca."
        ),
        "duration": "2 semestry",
        "mode": "online",
        "formula": "weekendowa",
        "tuition_fee": 10600.00,
        "image_remote": "/media/cache/31/59/3159b218b937822dd812c7e25a663303.jpg",
        "image_local": "analiza-danych-data-science.jpg",
        "url_slug": "sp-adds-online2",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "analiza-kryminalna",
        "name": "Analiza kryminalna",
        "description": (
            "Studia podyplomowe z zakresu analizy kryminalnej laczace wiedze informatyczna "
            "z metodami stosowanymi w kryminalistyce i bezpieczenstwie publicznym. "
            "Program przygotowuje do pracy w organach scigania, sluzbach specjalnych "
            "oraz instytucjach zajmujacych sie bezpieczenstwem i analiza danych sledczych."
        ),
        "duration": "2 semestry",
        "mode": "hybrydowy",
        "formula": "weekendowa",
        "tuition_fee": 9000.00,
        "image_remote": "/media/cache/85/cf/85cfe178ace321abf77189c6ac4223e4.jpg",
        "image_local": "analiza-kryminalna.jpg",
        "url_slug": "sp-analizakryminalna",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "cyberbezpieczenstwo-w-praktyce",
        "name": "Cyberbezpieczenstwo w praktyce",
        "description": (
            "Studia podyplomowe z zakresu cyberbezpieczenstwa skierowane do praktykow IT. "
            "Program obejmuje testy penetracyjne, analize malware, reagowanie na incydenty, "
            "bezpieczenstwo sieci i aplikacji webowych oraz standardy i regulacje prawne. "
            "Zajecia prowadzone przez ekspertow z branzy bezpieczenstwa informatycznego."
        ),
        "duration": "2 semestry",
        "mode": "hybrydowy",
        "formula": "weekendowa",
        "tuition_fee": 9600.00,
        "image_remote": "/media/cache/b6/ef/b6efdea4717117f2c9f906ecbd621374.jpg",
        "image_local": "cyberbezpieczenstwo-w-praktyce.jpg",
        "url_slug": "CWP1",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "inzynieria-systemow-sztucznej-inteligencji",
        "name": "Inzynieria systemow sztucznej inteligencji",
        "description": (
            "Studia podyplomowe przygotowujace inzynierow do projektowania i wdrazania "
            "systemow opartych na sztucznej inteligencji. Program laczy teorie uczenia "
            "maszynowego z praktycznymi umiejetnosciami tworzenia skalowalnych aplikacji AI, "
            "obejmujac m.in. sieci neuronowe, przetwarzanie jezyka naturalnego i widzenie komputerowe."
        ),
        "duration": "2 semestry",
        "mode": "stacjonarny",
        "formula": "weekendowa",
        "tuition_fee": 10600.00,
        "image_remote": "/media/cache/d7/2a/d72aa2875253856bf37671a8522340b2.jpg",
        "image_local": "inzynieria-systemow-sztucznej-inteligencji.jpg",
        "url_slug": "sp-iissi",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "metody-wytwarzania-oprogramowania",
        "name": "Metody Wytwarzania Oprogramowania",
        "description": (
            "Studia podyplomowe z zakresu inzynierii oprogramowania i nowoczesnych metodyk "
            "wytwarzania systemow informatycznych. Program obejmuje metodyki zwinne (Agile, Scrum), "
            "DevOps, testowanie, architekture mikrouslug oraz zarzadzanie jakoscia kodu. "
            "Skierowany do programistow i liderow technicznych chcacych poszerzyc kompetencje."
        ),
        "duration": "2 semestry",
        "mode": "hybrydowy",
        "formula": "weekendowa",
        "tuition_fee": 8000.00,
        "image_remote": "/media/cache/96/dc/96dcb3648bee1a2d30310f7faf08a010.jpg",
        "image_local": "metody-wytwarzania-oprogramowania.jpg",
        "url_slug": "MWO-2",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "podstawy-analityki-danych-w-biznesie",
        "name": "Podstawy analityki danych w biznesie",
        "description": (
            "Studia podyplomowe dla osob bez zaawansowanego tla technicznego, chcacych "
            "nauczyc sie analizy danych z perspektywy biznesowej. Program obejmuje Excel, SQL, "
            "Power BI, podstawy statystyki i metody prezentacji wynikow analiz. "
            "Idealne dla menedzerow, analitykow biznesowych i specjalistow z roznych branz."
        ),
        "duration": "2 semestry",
        "mode": "hybrydowy",
        "formula": "weekendowa",
        "tuition_fee": 9600.00,
        "image_remote": "/media/cache/8b/36/8b36b8d25b74e934ef9302603ea88413.jpg",
        "image_local": "podstawy-analityki-danych-w-biznesie.jpg",
        "url_slug": "sp-padw",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "systemy-baz-danych",
        "name": "Systemy baz danych",
        "description": (
            "Studia podyplomowe z zakresu projektowania, administrowania i optymalizacji "
            "relacyjnych i nierelacyjnych baz danych. Program obejmuje SQL, PostgreSQL, MongoDB, "
            "hurtownie danych, Big Data oraz technologie chmurowe. "
            "Skierowany do administratorow baz danych, programistow i architektow systemow."
        ),
        "duration": "2 semestry",
        "mode": "hybrydowy",
        "formula": "weekendowa",
        "tuition_fee": 8000.00,
        "image_remote": "/media/cache/cc/91/cc91476158a9921a5e6016260b8602a0.jpg",
        "image_local": "systemy-baz-danych.jpg",
        "url_slug": "sp-systemybazdanych",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "systemy-erp-analiza-biznesowa",
        "name": "Systemy ERP - sciezka Analiza biznesowa w systemach ERP oraz BI",
        "description": (
            "Studia podyplomowe ze sciezka Analiza biznesowa w systemach ERP oraz BI "
            "(Business Intelligence & Information Management). Program obejmuje systemy SAP, "
            "analize procesow biznesowych, raportowanie i Business Intelligence. "
            "Zajecia prowadzone online w formule weekendowej przez ekspertow SAP."
        ),
        "duration": "2 semestry",
        "mode": "online",
        "formula": "weekendowa",
        "tuition_fee": 9300.00,
        "image_remote": "/media/cache/b2/dc/b2dc06f31979a7cb829f2793002204c1.jpg",
        "image_local": "systemy-erp-sciezka-analiza-biznesowa-w-systemach-erp-oraz-bi-business-intelligence-information-management.png",
        "url_slug": "ERP-BUSINES1",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "systemy-erp-inzynieria-oprogramowania-sap",
        "name": "Systemy ERP - sciezka Inzynieria oprogramowania dla SAP i programowanie ABAP",
        "description": (
            "Studia podyplomowe ze sciezka Inzynieria oprogramowania dla SAP (S/4HANA) "
            "i programowanie w jezyku ABAP. Program przygotowuje programistow i konsultantow "
            "do pracy z platforma SAP, obejmujac architekture systemu, ABAP OOP, FIORI i HANA. "
            "Zajecia online prowadzone przez certyfikowanych ekspertow SAP."
        ),
        "duration": "2 semestry",
        "mode": "online",
        "formula": "weekendowa",
        "tuition_fee": 9300.00,
        "image_remote": "/media/cache/b4/b7/b4b752ebe954d5e8bb9ab90a20df45f4.jpg",
        "image_local": "systemy-erp-sciezka-inzynieria-oprogramowania-dla-sap-hana-erp-i-programowanie-w-jezyku-abap.png",
        "url_slug": "ERP-SIP2",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "systemy-erp-sap-s4hana",
        "name": "Systemy ERP - sciezka SAP S/4HANA",
        "description": (
            "Studia podyplomowe ze sciezka SAP S/4HANA obejmujace kompleksowe wdrozenia "
            "i konfiguracje systemu SAP S/4HANA. Program laczy wiedze o procesach biznesowych "
            "z techniczna znajomoscia platformy SAP, przygotowujac do roli konsultanta SAP. "
            "Zajecia prowadzone online z dostepem do systemu SAP do cwiczen praktycznych."
        ),
        "duration": "2 semestry",
        "mode": "online",
        "formula": "weekendowa",
        "tuition_fee": 9300.00,
        "image_remote": "/media/cache/09/f0/09f069a747f1985e9f4b5e71a08c50fe.jpg",
        "image_local": "systemy-erp-sap-s-4hana.png",
        "url_slug": "ERP-HANNA1",
        "closest_term": date(2026, 10, 1),
    },
    {
        "id": "uczenie-maszynowe-w-analityce-danych",
        "name": "Uczenie maszynowe w analityce danych",
        "description": (
            "Studia podyplomowe lacza teorię uczenia maszynowego z praktycznym zastosowaniem "
            "w analizie danych biznesowych. Program obejmuje algorytmy ML, Python (scikit-learn, "
            "TensorFlow), przetwarzanie danych i wdrazanie modeli produkcyjnych. "
            "Skierowany do analitykow danych i programistow chcacych specjalizowac sie w AI/ML."
        ),
        "duration": "2 semestry",
        "mode": "online",
        "formula": "weekendowa",
        "tuition_fee": 9300.00,
        "image_remote": "/media/cache/b5/37/b537726677526e9d84b00ce5d9de53a0.jpg",
        "image_local": "uczenie-maszynowe-w-analityce-danych.jpg",
        "url_slug": "UCZENIEMASZYNOWE1",
        "closest_term": date(2026, 10, 1),
    },
]


# ---------------------------------------------------------------------------
# Pobieranie zdjec
# ---------------------------------------------------------------------------

def download_image(remote_path: str, local_filename: str) -> str:
    """Pobiera zdjecie z AGH i zapisuje do client/public/programs/. Zwraca lokalny src."""
    local_path = IMAGES_DIR / local_filename

    # Jesli plik juz istnieje - pomin
    if local_path.exists():
        print(f"   [SKIP] Zdjecie juz istnieje: {local_filename}")
        return f"/programs/{local_filename}"

    url = AGH_BASE + remote_path
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        with open(local_path, "wb") as f:
            f.write(resp.content)
        size_kb = len(resp.content) // 1024
        print(f"   [OK] Pobrano: {local_filename} ({size_kb} KB)")
        return f"/programs/{local_filename}"
    except Exception as e:
        print(f"   [WARN] Nie udalo sie pobrac {local_filename}: {e}")
        return f"/programs/{local_filename}"  # i tak uzyj tej sciezki


# ---------------------------------------------------------------------------
# Seed programow
# ---------------------------------------------------------------------------

def seed_programs(conn):
    cur = conn.cursor()

    print("[INFO] Czyszczenie starych programow i edycji...")
    # Usun w odpowiedniej kolejnosci (FK)
    cur.execute("DELETE FROM payments")
    cur.execute("DELETE FROM payment_installments")
    cur.execute("DELETE FROM payment_plans")
    cur.execute("DELETE FROM application_status_history")
    cur.execute("DELETE FROM application_documents")
    cur.execute("DELETE FROM program_applications")
    cur.execute("DELETE FROM edition_required_documents")
    cur.execute("DELETE FROM program_editions")
    cur.execute("DELETE FROM programs")
    conn.commit()
    print("[OK] Stare programy i ich powiazania usuniete.\n")

    print("[INFO] Pobieranie zdjec z AGH...")
    for prog in PROGRAMS:
        prog["image_src"] = download_image(prog["image_remote"], prog["image_local"])

    print()
    print("[INFO] Wstrzykiwanie programow do bazy...")

    for prog in PROGRAMS:
        # Wstaw program
        cur.execute(
            """INSERT INTO programs (id, name, description, image_src, is_active)
               VALUES (%s, %s, %s, %s, TRUE)
               ON CONFLICT (id) DO UPDATE
               SET name = EXCLUDED.name,
                   description = EXCLUDED.description,
                   image_src = EXCLUDED.image_src""",
            (prog["id"], prog["name"], prog["description"], prog["image_src"]),
        )

        # Wstaw edycje
        edition_id = str(uuid.uuid4())
        cur.execute(
            """INSERT INTO program_editions
               (id, program_id, edition_name, recruitment_start, recruitment_end,
                studies_start, studies_end, min_enrollment, max_enrollment,
                enrollment_fee, tuition_fee, is_active)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE)""",
            (
                edition_id,
                prog["id"],
                f"2025/2026 semestr zimowy — {prog['mode']}",
                date(2025, 6, 1),
                date(2025, 9, 30),
                prog["closest_term"],
                date(2026, 6, 30),
                15,
                40,
                100.00,
                prog["tuition_fee"],
            ),
        )

        # Wymagane dokumenty
        for doc_type in DOC_TYPES:
            cur.execute(
                """INSERT INTO edition_required_documents
                   (id, edition_id, doc_type, description, is_required)
                   VALUES (%s, %s, %s, NULL, TRUE)""",
                (str(uuid.uuid4()), edition_id, doc_type),
            )

        mode_label = f"[{prog['mode'].upper()}]"
        print(f"   + {mode_label} {prog['name']} — {prog['tuition_fee']:,.0f} PLN")

    conn.commit()
    cur.close()


# ---------------------------------------------------------------------------
# Uruchomienie
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 65)
    print("  SEED PROGRAMOW AGH — Studia Podyplomowe WI")
    print("=" * 65)
    print(f"  Lacze z: {DATABASE_URL}")
    print(f"  Zdjecia zapisywane do: {IMAGES_DIR}")
    print()

    try:
        conn = psycopg2.connect(DATABASE_URL)
    except psycopg2.OperationalError as e:
        print(f"[ERROR] Blad polaczenia: {e}")
        sys.exit(1)

    try:
        seed_programs(conn)
    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Blad: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        conn.close()

    print()
    print("=" * 65)
    print("[OK] Programy wstrzykniete pomyslnie!")
    print()
    print(f"  Wstrzyknieto {len(PROGRAMS)} kierunkow podyplomowych AGH WI:")
    for p in PROGRAMS:
        print(f"  - {p['name']}")
    print()
    print("  Zdjecia dostepne w: client/public/programs/")
    print("  Baza dostepna przez: http://localhost:8000/api/v1/programs")
    print("=" * 65)
