ALTER TABLE users
  ADD COLUMN terms_accepted_at DATETIME NULL AFTER terms_accepted,
  ADD COLUMN terms_version VARCHAR(32) NULL AFTER terms_accepted_at,
  ADD COLUMN privacy_version VARCHAR(32) NULL AFTER terms_version,
  ADD COLUMN terms_accepted_ip VARCHAR(45) NULL AFTER privacy_version,
  ADD COLUMN terms_accepted_user_agent VARCHAR(255) NULL AFTER terms_accepted_ip;
