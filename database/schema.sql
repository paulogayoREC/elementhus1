CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  terms_accepted TINYINT(1) NOT NULL DEFAULT 0,
  terms_accepted_at DATETIME NULL,
  terms_version VARCHAR(32) NULL,
  privacy_version VARCHAR(32) NULL,
  terms_accepted_ip VARCHAR(45) NULL,
  terms_accepted_user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email),
  KEY users_created_at_index (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(190) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  requested_ip VARCHAR(45) NULL,
  requested_user_agent VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY password_resets_token_hash_unique (token_hash),
  KEY password_resets_user_created_index (user_id, created_at),
  KEY password_resets_expires_at_index (expires_at),
  CONSTRAINT password_resets_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(48) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'published',
  submitted_ip VARCHAR(45) NULL,
  submitted_user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY community_comments_status_created_index (status, created_at),
  KEY community_comments_user_created_index (user_id, created_at),
  CONSTRAINT community_comments_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  content_slug VARCHAR(120) NOT NULL,
  page_slug VARCHAR(120) NOT NULL,
  content_title VARCHAR(190) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(48) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'published',
  submitted_ip VARCHAR(45) NULL,
  submitted_user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY article_comments_content_status_created_index (content_slug, status, created_at),
  KEY article_comments_page_created_index (page_slug, created_at),
  KEY article_comments_user_created_index (user_id, created_at),
  CONSTRAINT article_comments_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
