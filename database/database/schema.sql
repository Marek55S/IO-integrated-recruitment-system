-- ============================================================
-- TYPY ENUM
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'candidate',
  'admin_coordinator',
  'program_director',
  'cok_staff',
  'it_admin'
);

CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'documents_incomplete',
  'documents_verified',
  'awaiting_enrollment_fee',
  'enrollment_fee_paid',
  'awaiting_payment',
  'payment_confirmed',
  'accepted',
  'waitlisted',
  'rejected',
  'cancelled',
  'studies_not_launched'
);

CREATE TYPE required_doc_type AS ENUM (
  'diploma_scan',
  'application_form',
  'marketing_consent',
  'enrollment_fee_proof',
  'id_copy',
  'other'
);

CREATE TYPE document_status AS ENUM (
  'pending',
  'accepted',
  'rejected'
);

CREATE TYPE payment_plan_type AS ENUM (
  'full',
  'installments'
);

CREATE TYPE installment_type AS ENUM (
  'enrollment_fee',
  'full_payment',
  'installment'
);

CREATE TYPE installment_status AS ENUM (
  'pending',
  'paid',
  'overdue',
  'waived'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE message_channel AS ENUM ('system', 'email', 'whatsapp');
CREATE TYPE message_direction AS ENUM ('outbound', 'inbound');

CREATE TYPE notification_type AS ENUM (
  'documents_incomplete',
  'payment_reminder',
  'status_change',
  'welcome',
  'studies_not_launched',
  'accepted'
);

-- ============================================================
-- UŻYTKOWNICY
-- ============================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'candidate',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DANE KANDYDATA
-- ============================================================

CREATE TABLE candidate_profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  family_name  VARCHAR(100),
  pesel        VARCHAR(255),
  birth_date   DATE,
  birth_place  VARCHAR(100),
  citizenship  VARCHAR(100),
  phone        VARCHAR(20),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         VARCHAR(20) NOT NULL CHECK (type IN ('residence', 'correspondence')),
  country      VARCHAR(100),
  city         VARCHAR(100),
  postal_code  VARCHAR(10),
  street       VARCHAR(200),
  house_number VARCHAR(20),
  UNIQUE (user_id, type)
);

CREATE TABLE education_records (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  academic_title       VARCHAR(50),
  university_name      VARCHAR(255),
  graduation_year      SMALLINT,
  diploma_country      VARCHAR(20) CHECK (diploma_country IN ('Polska', 'Poza Polską')),
  diploma_country_name VARCHAR(100)
);

CREATE TABLE emergency_contacts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(200),
  email     VARCHAR(255),
  phone     VARCHAR(20)
);

CREATE TABLE user_agreements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agreement_type VARCHAR(50) NOT NULL CHECK (agreement_type IN ('rodo', 'marketing')),
  accepted       BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_at    TIMESTAMPTZ,
  UNIQUE (user_id, agreement_type)
);

-- ============================================================
-- PROGRAMY I EDYCJE
-- ============================================================

CREATE TABLE programs (
  id          VARCHAR(100) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  image_src   VARCHAR(500),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE program_editions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id        VARCHAR(100) NOT NULL REFERENCES programs(id),
  edition_name      VARCHAR(100) NOT NULL,
  recruitment_start DATE,
  recruitment_end   DATE,
  studies_start     DATE,
  studies_end       DATE,
  min_enrollment    INTEGER NOT NULL DEFAULT 15,
  max_enrollment    INTEGER,
  enrollment_fee    NUMERIC(10,2) NOT NULL DEFAULT 100.00,
  tuition_fee       NUMERIC(10,2),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE edition_required_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id  UUID NOT NULL REFERENCES program_editions(id),
  doc_type    required_doc_type NOT NULL,
  description VARCHAR(255),
  is_required BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- ZGŁOSZENIA REKRUTACYJNE
-- ============================================================

CREATE TABLE program_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edition_id   UUID NOT NULL REFERENCES program_editions(id),
  status       application_status NOT NULL DEFAULT 'draft',
  form_data    JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, edition_id)
);

CREATE TABLE application_status_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES program_applications(id) ON DELETE CASCADE,
  old_status     application_status,
  new_status     application_status NOT NULL,
  changed_by     UUID REFERENCES users(id),
  note           TEXT,
  changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOKUMENTY
-- ============================================================

CREATE TABLE application_documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES program_applications(id) ON DELETE CASCADE,
  doc_type       required_doc_type NOT NULL,
  file_path      VARCHAR(500) NOT NULL,
  file_name      VARCHAR(255) NOT NULL,
  mime_type      VARCHAR(100),
  status         document_status NOT NULL DEFAULT 'pending',
  reviewed_by    UUID REFERENCES users(id),
  review_note    TEXT,
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ
);

-- ============================================================
-- PŁATNOŚCI (bramka płatności online)
-- ============================================================

CREATE TABLE payment_plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID UNIQUE NOT NULL REFERENCES program_applications(id) ON DELETE CASCADE,
  plan_type      payment_plan_type NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_installments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id        UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  type           installment_type NOT NULL,
  installment_no SMALLINT,
  amount         NUMERIC(10,2) NOT NULL,
  due_date       DATE NOT NULL,
  status         installment_status NOT NULL DEFAULT 'pending',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_id UUID NOT NULL REFERENCES payment_installments(id),
  amount_paid    NUMERIC(10,2) NOT NULL,
  status         payment_status NOT NULL DEFAULT 'pending',
  gateway_tx_id  VARCHAR(255),
  gateway_status VARCHAR(100),
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- KOMUNIKACJA
-- ============================================================

CREATE TABLE contact_messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES program_applications(id) ON DELETE CASCADE,
  author_id      UUID REFERENCES users(id),
  direction      message_direction NOT NULL,
  channel        message_channel NOT NULL DEFAULT 'system',
  subject        VARCHAR(255),
  body           TEXT NOT NULL,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- POWIADOMIENIA
-- ============================================================

CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES program_applications(id),
  type           notification_type NOT NULL,
  title          VARCHAR(255) NOT NULL,
  body           TEXT NOT NULL,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  channel        message_channel NOT NULL DEFAULT 'system',
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);