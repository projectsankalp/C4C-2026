-- Row Level Security policies

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifier_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_insert_own ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- passports: own passport
CREATE POLICY passports_select_own ON passports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY passports_insert_own ON passports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY passports_update_own ON passports FOR UPDATE USING (auth.uid() = user_id);

-- skills: via passport ownership
CREATE POLICY skills_select_own ON skills FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM passports p WHERE p.id = skills.passport_id AND p.user_id = auth.uid()
    ));
CREATE POLICY skills_insert_own ON skills FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM passports p WHERE p.id = skills.passport_id AND p.user_id = auth.uid()
    ));
CREATE POLICY skills_update_own ON skills FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM passports p WHERE p.id = skills.passport_id AND p.user_id = auth.uid()
    ));

-- assessments: own assessments
CREATE POLICY assessments_select_own ON assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY assessments_insert_own ON assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- documents: own documents
CREATE POLICY documents_select_own ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY documents_insert_own ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- verifier_reviews: verifiers can insert; users see reviews on their assessments
CREATE POLICY verifier_reviews_insert ON verifier_reviews FOR INSERT
    WITH CHECK (auth.uid() = verifier_user_id);
CREATE POLICY verifier_reviews_select ON verifier_reviews FOR SELECT
    USING (
        auth.uid() = verifier_user_id
        OR EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = verifier_reviews.assessment_id AND a.user_id = auth.uid()
        )
    );

-- usage_logs: own logs
CREATE POLICY usage_logs_select_own ON usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY usage_logs_insert_own ON usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role bypasses RLS (backend uses service key for server operations)
