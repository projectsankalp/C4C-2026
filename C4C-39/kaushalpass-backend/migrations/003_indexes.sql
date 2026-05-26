-- Performance indexes

CREATE INDEX IF NOT EXISTS idx_passports_user_id ON passports(user_id);
CREATE INDEX IF NOT EXISTS idx_passports_passport_code ON passports(passport_code);

CREATE INDEX IF NOT EXISTS idx_skills_passport_id ON skills(passport_id);
CREATE INDEX IF NOT EXISTS idx_skills_archived ON skills(passport_id) WHERE archived = FALSE;

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_phash ON documents(user_id, phash);

CREATE INDEX IF NOT EXISTS idx_verifier_reviews_assessment ON verifier_reviews(assessment_id);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_action ON usage_logs(user_id, action, created_at DESC);
