-- =====================================================================
-- DSTI Website Database (MySQL 8.x)
-- Bilingual content: every public text field has _en (English) and
-- _te (Telugu). Safe to run repeatedly (IF NOT EXISTS / INSERT IGNORE).
-- =====================================================================
CREATE DATABASE IF NOT EXISTS dsti_website
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dsti_website;

-- ---------------------------------------------------------------------
-- 1. CMS USERS, ROLES, SESSIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  role_id      TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_name    VARCHAR(50) NOT NULL UNIQUE,      -- admin, approver, editor, viewer
  description  VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  user_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(50) NOT NULL UNIQUE,     -- CMS sign-in name
  full_name      VARCHAR(150) NOT NULL,
  email          VARCHAR(190) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,           -- bcrypt, never plain text
  role_id        TINYINT UNSIGNED NOT NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  must_change_password TINYINT(1) NOT NULL DEFAULT 1,
  failed_logins  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until   DATETIME NULL,
  last_login_at  DATETIME NULL,
  password_changed_at DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_history (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ph_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  session_id    CHAR(64) PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  csrf_token    CHAR(64) NOT NULL,
  ip            VARCHAR(64) NOT NULL DEFAULT '',
  user_agent    VARCHAR(255) NOT NULL DEFAULT '',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATETIME NOT NULL,
  KEY idx_sess_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jwt_blocklist (
  token_hash    CHAR(64) PRIMARY KEY,
  expires_at    DATETIME NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_jwt_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. MEDIA / FILE STORE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_files (
  file_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  file_name    VARCHAR(255) NOT NULL,
  file_path    VARCHAR(500) NOT NULL,
  mime_type    VARCHAR(100) NOT NULL,
  file_size_kb INT UNSIGNED,
  alt_text_en  VARCHAR(255),
  alt_text_te  VARCHAR(255),
  uploaded_by  INT UNSIGNED,
  uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
  KEY idx_media_path (file_path(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. GENERIC CONTENT PAGES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pages (
  page_id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_page_id    INT UNSIGNED NULL,
  section           ENUM('home','about','ict','investor','ecitizen','media',
                         'contact','statutory') NOT NULL DEFAULT 'about',
  slug              VARCHAR(150) NOT NULL UNIQUE,
  title_en          VARCHAR(255) NOT NULL,
  title_te          VARCHAR(255),
  body_en           MEDIUMTEXT,
  body_te           MEDIUMTEXT,
  meta_desc_en      VARCHAR(300),
  meta_desc_te      VARCHAR(300),
  og_image_id       INT UNSIGNED NULL,
  show_in_footer    TINYINT(1) NOT NULL DEFAULT 0,
  display_order     SMALLINT NOT NULL DEFAULT 0,
  status            ENUM('draft','pending','published','archived') NOT NULL DEFAULT 'draft',
  created_by        INT UNSIGNED,
  updated_by        INT UNSIGNED,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_page_id) REFERENCES pages(page_id) ON DELETE SET NULL,
  FOREIGN KEY (og_image_id)    REFERENCES media_files(file_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)     REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by)     REFERENCES users(user_id) ON DELETE SET NULL,
  FULLTEXT KEY ft_pages_en (title_en, body_en),
  FULLTEXT KEY ft_pages_te (title_te, body_te)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. HOME PAGE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  banner_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_en       VARCHAR(255) NOT NULL,
  title_te       VARCHAR(255),
  message_en     VARCHAR(500),
  message_te     VARCHAR(500),
  image_id       INT UNSIGNED,
  link_url       VARCHAR(500),
  display_order  SMALLINT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (image_id) REFERENCES media_files(file_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_updates (
  news_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_en      VARCHAR(300) NOT NULL,
  title_te      VARCHAR(300),
  link_url      VARCHAR(500),
  publish_date  DATE NOT NULL,
  expiry_date   DATE NULL,
  is_ticker     TINYINT(1) NOT NULL DEFAULT 1,
  status        ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  created_by    INT UNSIGNED,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FULLTEXT KEY ft_news (title_en, title_te)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audience_cards (
  card_id        TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  audience       ENUM('citizen','student','researcher','investor') NOT NULL UNIQUE,
  title_en       VARCHAR(150) NOT NULL,
  title_te       VARCHAR(150),
  description_en VARCHAR(400),
  description_te VARCHAR(400),
  link_url       VARCHAR(500),
  display_order  TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quick_links (
  link_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  link_group     ENUM('home_quick','useful_link','social') NOT NULL,
  label_en       VARCHAR(200) NOT NULL,
  label_te       VARCHAR(200),
  url            VARCHAR(500) NOT NULL,
  opens_new_tab  TINYINT(1) NOT NULL DEFAULT 0,
  display_order  SMALLINT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS social_links (
  social_id      TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  platform       VARCHAR(50) NOT NULL,
  url            VARCHAR(500) NOT NULL,
  display_order  TINYINT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS story_panels (
  panel_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_en       VARCHAR(200) NOT NULL,
  title_te       VARCHAR(200),
  text_en        VARCHAR(1000),
  text_te        VARCHAR(1000),
  image_id       INT UNSIGNED,
  display_order  SMALLINT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (image_id) REFERENCES media_files(file_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS almanac_entries (
  entry_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entry_type     ENUM('science_day','observance','this_day') NOT NULL,
  month_no       TINYINT UNSIGNED NOT NULL,
  day_no         TINYINT UNSIGNED NOT NULL,
  event_year     SMALLINT NULL,
  title_en       VARCHAR(255) NOT NULL,
  title_te       VARCHAR(255),
  description_en TEXT,
  description_te TEXT,
  KEY idx_almanac_date (month_no, day_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. ABOUT: AWARDS, OFFICERS, OFFICE CONTACTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS awards (
  award_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  award_year     SMALLINT NOT NULL,
  title_en       VARCHAR(255) NOT NULL,
  title_te       VARCHAR(255),
  recipient_en   VARCHAR(255),
  recipient_te   VARCHAR(255),
  description_en TEXT,
  description_te TEXT,
  image_id       INT UNSIGNED,
  status         ENUM('draft','published') NOT NULL DEFAULT 'draft',
  KEY idx_award_year (award_year),
  FOREIGN KEY (image_id) REFERENCES media_files(file_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS officers (
  officer_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en        VARCHAR(150) NOT NULL,
  name_te        VARCHAR(150),
  designation_en VARCHAR(200) NOT NULL,
  designation_te VARCHAR(200),
  phone          VARCHAR(30),
  email          VARCHAR(190),
  photo_id       INT UNSIGNED,
  display_order  SMALLINT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (photo_id) REFERENCES media_files(file_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS office_contacts (
  contact_id     TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  office_name_en VARCHAR(200) NOT NULL,
  office_name_te VARCHAR(200),
  address_en     VARCHAR(500),
  address_te     VARCHAR(500),
  phone          VARCHAR(30),
  email          VARCHAR(190),
  latitude       DECIMAL(9,6),
  longitude      DECIMAL(9,6),
  working_hours  VARCHAR(150)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. SECTORS, ORGANISATIONS, POLICIES, DISTRICTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sectors (
  sector_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en        VARCHAR(150) NOT NULL,
  name_te        VARCHAR(150),
  slug           VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS organisations (
  org_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(150) NOT NULL UNIQUE,
  name_en        VARCHAR(255) NOT NULL,
  name_te        VARCHAR(255),
  short_name     VARCHAR(50),
  about_en       MEDIUMTEXT,
  about_te       MEDIUMTEXT,
  website_url    VARCHAR(500),
  email          VARCHAR(190),
  phone          VARCHAR(30),
  address_en     VARCHAR(500),
  logo_id        INT UNSIGNED,
  display_order  SMALLINT NOT NULL DEFAULT 0,
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (logo_id) REFERENCES media_files(file_id) ON DELETE SET NULL,
  FULLTEXT KEY ft_org_en (name_en, about_en),
  FULLTEXT KEY ft_org_te (name_te, about_te)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS policies (
  policy_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(150) NOT NULL UNIQUE,
  name_en        VARCHAR(255) NOT NULL,
  name_te        VARCHAR(255),
  summary_en     TEXT,
  summary_te     TEXT,
  body_en        MEDIUMTEXT,
  body_te        MEDIUMTEXT,
  policy_period  VARCHAR(30),
  sector_id      INT UNSIGNED,
  pdf_file_id    INT UNSIGNED,
  display_order  SMALLINT NOT NULL DEFAULT 0,
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (sector_id)   REFERENCES sectors(sector_id) ON DELETE SET NULL,
  FOREIGN KEY (pdf_file_id) REFERENCES media_files(file_id) ON DELETE SET NULL,
  FULLTEXT KEY ft_pol_en (name_en, summary_en, body_en),
  FULLTEXT KEY ft_pol_te (name_te, summary_te, body_te)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS districts (
  district_id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en        VARCHAR(100) NOT NULL UNIQUE,
  name_te        VARCHAR(100),
  slug           VARCHAR(100) NOT NULL UNIQUE,
  map_code       VARCHAR(20),
  latitude       DECIMAL(9,6),
  longitude      DECIMAL(9,6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS district_institutions (
  inst_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  district_id    TINYINT UNSIGNED NOT NULL,
  org_id         INT UNSIGNED NULL,
  name_en        VARCHAR(255) NOT NULL,
  name_te        VARCHAR(255),
  category       ENUM('institution','research_centre','incubator','park',
                      'lab','project','activity') NOT NULL,
  sector_id      INT UNSIGNED NULL,
  description_en TEXT,
  description_te TEXT,
  address_en     VARCHAR(500),
  latitude       DECIMAL(9,6),
  longitude      DECIMAL(9,6),
  website_url    VARCHAR(500),
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  KEY idx_inst_district (district_id),
  FOREIGN KEY (district_id) REFERENCES districts(district_id) ON DELETE CASCADE,
  FOREIGN KEY (org_id)      REFERENCES organisations(org_id) ON DELETE SET NULL,
  FOREIGN KEY (sector_id)   REFERENCES sectors(sector_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS entity_links (
  link_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  from_type      ENUM('organisation','policy','sector') NOT NULL,
  from_id        INT UNSIGNED NOT NULL,
  to_type        ENUM('organisation','policy','sector') NOT NULL,
  to_id          INT UNSIGNED NOT NULL,
  relation_en    VARCHAR(200),
  relation_te    VARCHAR(200),
  UNIQUE KEY uq_link (from_type, from_id, to_type, to_id),
  KEY idx_link_to (to_type, to_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. DOCUMENT REPOSITORY
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_categories (
  category_id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(80) NOT NULL UNIQUE,
  name_en        VARCHAR(150) NOT NULL,
  name_te        VARCHAR(150),
  display_order  TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents (
  doc_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id    TINYINT UNSIGNED NOT NULL,
  doc_number     VARCHAR(100),
  title_en       VARCHAR(500) NOT NULL,
  title_te       VARCHAR(500),
  description_en TEXT,
  description_te TEXT,
  doc_date       DATE NOT NULL,
  policy_id      INT UNSIGNED NULL,
  file_id        INT UNSIGNED NULL,
  download_count INT UNSIGNED NOT NULL DEFAULT 0,
  status         ENUM('draft','pending','published','archived') NOT NULL DEFAULT 'draft',
  created_by     INT UNSIGNED,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_doc_cat_date (category_id, doc_date),
  FOREIGN KEY (category_id) REFERENCES document_categories(category_id),
  FOREIGN KEY (policy_id)   REFERENCES policies(policy_id) ON DELETE SET NULL,
  FOREIGN KEY (file_id)     REFERENCES media_files(file_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(user_id) ON DELETE SET NULL,
  FULLTEXT KEY ft_doc_en (title_en, description_en, doc_number),
  FULLTEXT KEY ft_doc_te (title_te, description_te)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faqs (
  faq_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_en    VARCHAR(500) NOT NULL,
  question_te    VARCHAR(500),
  answer_en      TEXT NOT NULL,
  answer_te      TEXT,
  display_order  SMALLINT NOT NULL DEFAULT 0,
  status         ENUM('draft','published') NOT NULL DEFAULT 'draft',
  FULLTEXT KEY ft_faq (question_en, answer_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. TENDERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenders (
  tender_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tender_number    VARCHAR(100) NOT NULL UNIQUE,
  title_en         VARCHAR(500) NOT NULL,
  title_te         VARCHAR(500),
  description_en   TEXT,
  description_te   TEXT,
  published_date   DATE NOT NULL,
  last_date        DATETIME NOT NULL,
  status           ENUM('open','closed','cancelled') NOT NULL DEFAULT 'open',
  file_id          INT UNSIGNED NULL,
  corrigendum_file_id INT UNSIGNED NULL,
  publish_status   ENUM('draft','pending','published','archived') NOT NULL DEFAULT 'draft',
  created_by       INT UNSIGNED,
  KEY idx_tender_status (status, last_date),
  FOREIGN KEY (file_id) REFERENCES media_files(file_id) ON DELETE SET NULL,
  FOREIGN KEY (corrigendum_file_id) REFERENCES media_files(file_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FULLTEXT KEY ft_tender (title_en, description_en, tender_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. MEDIA: SCIENCE STORIES AND EVENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS science_stories (
  story_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_en       VARCHAR(255) NOT NULL,
  title_te       VARCHAR(255),
  description_en TEXT,
  description_te TEXT,
  video_file_id  INT UNSIGNED NULL,
  video_url      VARCHAR(500) NULL,
  thumbnail_id   INT UNSIGNED NULL,
  captions_file_id INT UNSIGNED NULL,
  duration_sec   SMALLINT UNSIGNED,
  publish_date   DATE,
  display_order  SMALLINT NOT NULL DEFAULT 0,
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (video_file_id)    REFERENCES media_files(file_id) ON DELETE SET NULL,
  FOREIGN KEY (thumbnail_id)     REFERENCES media_files(file_id) ON DELETE SET NULL,
  FOREIGN KEY (captions_file_id) REFERENCES media_files(file_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  event_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(150) NOT NULL UNIQUE,
  title_en       VARCHAR(255) NOT NULL,
  title_te       VARCHAR(255),
  description_en MEDIUMTEXT,
  description_te MEDIUMTEXT,
  venue_en       VARCHAR(255),
  venue_te       VARCHAR(255),
  district_id    TINYINT UNSIGNED NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime   DATETIME NULL,
  registration_url VARCHAR(500),
  banner_id      INT UNSIGNED NULL,
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  KEY idx_event_start (start_datetime),
  FOREIGN KEY (district_id) REFERENCES districts(district_id) ON DELETE SET NULL,
  FOREIGN KEY (banner_id)   REFERENCES media_files(file_id) ON DELETE SET NULL,
  FULLTEXT KEY ft_event (title_en, description_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. FEEDBACK
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  email          VARCHAR(190) NOT NULL,
  phone          VARCHAR(30),
  subject        VARCHAR(255) NOT NULL,
  message        TEXT NOT NULL,
  ip_hash        CHAR(64),
  status         ENUM('new','read','replied','resolved','closed') NOT NULL DEFAULT 'new',
  notified_at    DATETIME NULL,
  handled_by     INT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (handled_by) REFERENCES users(user_id) ON DELETE SET NULL,
  KEY idx_feedback_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. ANALYTICS, ASSISTANT, AUDIT, SETTINGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_views (
  view_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page_path      VARCHAR(300) NOT NULL,
  lang           ENUM('en','te') NOT NULL DEFAULT 'en',
  visitor_hash   CHAR(64),
  device_type    ENUM('mobile','tablet','desktop','other') DEFAULT 'other',
  viewed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_view_date (viewed_at),
  KEY idx_view_path (page_path(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_stats (
  stat_date      DATE PRIMARY KEY,
  total_views    INT UNSIGNED NOT NULL DEFAULT 0,
  unique_visitors INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assistant_logs (
  log_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question       VARCHAR(1000) NOT NULL,
  answer         TEXT,
  source_url     VARCHAR(500),
  lang           ENUM('en','te') NOT NULL DEFAULT 'en',
  was_answered   TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assistant_feedback (
  log_id         BIGINT UNSIGNED PRIMARY KEY,
  helpful        TINYINT(1) NOT NULL,
  comment        VARCHAR(500),
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (log_id) REFERENCES assistant_logs(log_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NULL,
  action         VARCHAR(60) NOT NULL,
  table_name     VARCHAR(80),
  record_id      INT UNSIGNED,
  target         VARCHAR(160) NOT NULL DEFAULT '',
  details        JSON,
  ip_address     VARCHAR(45),
  username       VARCHAR(60) NOT NULL DEFAULT '',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key    VARCHAR(100) PRIMARY KEY,
  setting_value  TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. CMS EXTENSIONS (used by the admin/CMS compatibility layer)
-- ---------------------------------------------------------------------
-- Free-form collections that have no dedicated table in the schema
-- (main menu, home feature cards, ICT projects, investor incentives...).
CREATE TABLE IF NOT EXISTS cms_blocks (
  block_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  collection     VARCHAR(40) NOT NULL,
  item_key       VARCHAR(80) NOT NULL,
  data           LONGTEXT NOT NULL,
  status         ENUM('draft','published') NOT NULL DEFAULT 'published',
  sort_order     INT NOT NULL DEFAULT 0,
  created_by     INT UNSIGNED NULL,
  updated_by     INT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_block_key (collection, item_key),
  KEY idx_block_order (collection, status, sort_order),
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fields the CMS collects that have no column in the parent table.
CREATE TABLE IF NOT EXISTS cms_extras (
  resource       VARCHAR(40) NOT NULL,
  record_id      INT UNSIGNED NOT NULL,
  data           LONGTEXT NOT NULL,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (resource, record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS backups (
  backup_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  file_name      VARCHAR(200) NOT NULL,
  size_bytes     INT UNSIGNED NOT NULL DEFAULT 0,
  created_by     INT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- REFERENCE DATA
-- =====================================================================
INSERT IGNORE INTO roles (role_name, description) VALUES
 ('admin',    'Full access including users and settings'),
 ('approver', 'Reviews and publishes content'),
 ('editor',   'Creates and edits content; sends for approval'),
 ('viewer',   'Read-only access to CMS and feedback');

INSERT IGNORE INTO document_categories (slug, name_en, display_order) VALUES
 ('government-orders', 'Government Orders', 1),
 ('notifications',     'Notifications', 2),
 ('circulars',         'Circulars', 3),
 ('acts',              'Acts', 4),
 ('rules',             'Rules', 5),
 ('guidelines',        'Guidelines', 6),
 ('rti',               'Right to Information', 7),
 ('it-act-2000',       'IT Act 2000 (Procedure, Judgements)', 8),
 ('posh-act',          'PoSH Act', 9);

INSERT IGNORE INTO audience_cards (audience, title_en, title_te, display_order) VALUES
 ('citizen','Citizen','పౌరుడు',1),('student','Student','విద్యార్థి',2),
 ('researcher','Researcher','పరిశోధకుడు',3),('investor','Investor','పెట్టుబడిదారుడు',4);

INSERT IGNORE INTO sectors (name_en, slug) VALUES
 ('IT & GCC','it-gcc'),('Electronics','electronics'),('Semiconductor','semiconductor'),
 ('Data Centre','data-centre'),('Drone','drone'),('Space','space'),
 ('Biotechnology','biotechnology'),('Science, Technology & Innovation','sti');

INSERT IGNORE INTO districts (name_en, slug) VALUES
 ('Srikakulam','srikakulam'),('Parvathipuram Manyam','parvathipuram-manyam'),
 ('Vizianagaram','vizianagaram'),('Visakhapatnam','visakhapatnam'),
 ('Alluri Sitharama Raju','alluri-sitharama-raju'),('Anakapalli','anakapalli'),
 ('Kakinada','kakinada'),('East Godavari','east-godavari'),
 ('Dr. B.R. Ambedkar Konaseema','konaseema'),('Eluru','eluru'),
 ('West Godavari','west-godavari'),('NTR','ntr'),('Krishna','krishna'),
 ('Palnadu','palnadu'),('Guntur','guntur'),('Bapatla','bapatla'),
 ('Prakasam','prakasam'),('Sri Potti Sriramulu Nellore','nellore'),
 ('Kurnool','kurnool'),('Nandyal','nandyal'),('Anantapuramu','anantapuramu'),
 ('Sri Sathya Sai','sri-sathya-sai'),('YSR Kadapa','ysr-kadapa'),
 ('Annamayya','annamayya'),('Chittoor','chittoor'),('Tirupati','tirupati');

-- Default CMS administrator: username admin / password Admin@12345
-- (must be changed at first sign-in).
INSERT IGNORE INTO users (username, full_name, email, password_hash, role_id, is_active, must_change_password)
VALUES ('admin', 'Website Administrator', 'admin@dsti.ap.gov.in',
        '$2b$12$O6olTjjuRbGi8yoEPHZPKOq7NLr9xIhF4wUVpaUwnf5S5PiZ0CcW.',
        (SELECT role_id FROM roles WHERE role_name = 'admin'), 1, 1);

INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
 ('site', '{"name":{"en":"Department of Science, Technology & Innovation","te":"విజ్ఞాన, సాంకేతిక మరియు ఆవిష్కరణల శాఖ"},"shortName":"DSTI","gov":{"en":"Government of Andhra Pradesh","te":"ఆంధ్రప్రదేశ్ ప్రభుత్వం"},"tagline":{"en":"Science, Technology and Innovation for a better Andhra Pradesh","te":"మెరుగైన ఆంధ్రప్రదేశ్ కోసం విజ్ఞానం, సాంకేతికత మరియు ఆవిష్కరణ"},"logo":"","domain":"https://dsti.ap.gov.in","ctaLabel":{"en":"Contact us","te":"మమ్మల్ని సంప్రదించండి"},"footerAbout":{"en":"The Department of Science, Technology & Innovation promotes science, technology and innovation across Andhra Pradesh.","te":"విజ్ఞాన, సాంకేతిక మరియు ఆవిష్కరణల శాఖ ఆంధ్రప్రదేశ్ అంతటా విజ్ఞానం, సాంకేతికత మరియు ఆవిష్కరణలను ప్రోత్సహిస్తుంది."},"social":[{"id":"facebook","label":"Facebook","href":"https://www.facebook.com/APDSTI"},{"id":"x","label":"X (Twitter)","href":"https://x.com/APDSTI"},{"id":"youtube","label":"YouTube","href":"https://www.youtube.com/@APDSTI"}]}'),
 ('contact', '{"headOffice":{"en":"Department of Science, Technology & Innovation, Government of Andhra Pradesh, Velagapudi, Amaravati - 522503","te":"విజ్ఞాన, సాంకేతిక మరియు ఆవిష్కరణల శాఖ, ఆంధ్రప్రదేశ్ ప్రభుత్వం, వెలగపూడి, అమరావతి - 522503"},"phone":"+91 863 2345678","fax":"+91 863 2345679","email":"info@dsti.ap.gov.in","workingHours":{"en":"Monday to Friday, 10:00 - 17:00 IST","te":"సోమవారం నుండి శుక్రవారం, 10:00 - 17:00 IST"}}'),
 ('about', '{"intro":[{"en":"The Department of Science, Technology & Innovation (DSTI) is the nodal department of the Government of Andhra Pradesh for science, technology and innovation.","te":"విజ్ఞాన, సాంకేతిక మరియు ఆవిష్కరణల శాఖ (DSTI) విజ్ఞానం, సాంకేతికత మరియు ఆవిష్కరణల కోసం ఆంధ్రప్రదేశ్ ప్రభుత్వ నోడల్ శాఖ."}],"mission":{"en":"To make Andhra Pradesh a leader in science, technology and innovation.","te":"విజ్ఞానం, సాంకేతికత మరియు ఆవిష్కరణలలో ఆంధ్రప్రదేశ్‌ను అగ్రగామిగా తీర్చిదిద్దడం."},"objectives":[{"en":"Promote research and development across emerging technologies.","te":"ఉదయిస్తున్న సాంకేతికతలలో పరిశోధన మరియు అభివృద్ధిని ప్రోత్సహించడం."}],"orgStructure":{"en":"The Department works with its autonomous organisations and district-level institutions across Andhra Pradesh.","te":"ఈ శాఖ ఆంధ్రప్రదేశ్ అంతటా తన స్వయంప్రతిపత్తి సంస్థలు మరియు జిల్లా స్థాయి సంస్థలతో కలిసి పనిచేస్తుంది."},"orgChart":""}'),
 ('investors', '{"intro":{"en":"Andhra Pradesh offers a thriving ecosystem for science and technology investment.","te":"విజ్ఞానం మరియు సాంకేతిక పెట్టుబడులకు ఆంధ్రప్రదేశ్ అనుకూలమైన పర్యావరణ వ్యవస్థను అందిస్తుంది."},"whyInvest":[{"en":"Skilled talent, strong infrastructure and proactive policies.","te":"నైపుణ్యమైన మానవ వనరులు, బలమైన మౌలిక సదుపాయాలు మరియు ప్రోత్సాహక విధానాలు."}],"steps":[{"en":"Review the sector policies and submit an application through the single-window portal.","te":"రంగ విధానాలను పరిశీలించి, సింగిల్ విండో పోర్టల్ ద్వారా దరఖాస్తు సమర్పించండి."}]}'),
 ('home', '{"showTicker":true,"showServices":true,"showAudiences":true,"showStats":true,"showArticles":true,"articlesTitle":{"en":"News & updates","te":"వార్తలు మరియు నవీకరణలు"},"articlesSubtitle":{"en":"The latest from the Department","te":"శాఖ నుండి తాజా సమాచారం"},"showDistricts":true,"showAlmanac":true,"showStory":true,"showConnections":true,"showStories":true,"showEvents":true}'),
 ('system', '{"feedbackNotifyEmail":"feedback@dsti.ap.gov.in"}');
