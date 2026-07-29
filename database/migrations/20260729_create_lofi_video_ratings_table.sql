CREATE TABLE IF NOT EXISTS lofi_video_ratings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  video_id VARCHAR(32) NOT NULL,
  session_key CHAR(64) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY lofi_video_ratings_video_session_unique (video_id, session_key),
  KEY lofi_video_ratings_video_index (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
