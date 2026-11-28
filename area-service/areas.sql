CREATE TABLE IF NOT EXISTS totoya_visit_areas (
  session_id TEXT PRIMARY KEY,
  measured_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('district','uncertain','outside')),
  board INTEGER,
  district INTEGER
);
CREATE INDEX IF NOT EXISTS idx_totoya_area_time ON totoya_visit_areas(measured_at);
