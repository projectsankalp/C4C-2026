const { randomUUID } = require('crypto');
const pool = require('./db');

let schemaReadyPromise = null;

async function ensureMobileSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id UUID PRIMARY KEY,
          full_name TEXT NOT NULL,
          address TEXT NOT NULL DEFAULT '',
          dob TEXT NOT NULL,
          mobile TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await pool.query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`);
      await pool.query(`ALTER TABLE patients ALTER COLUMN address SET DEFAULT ''`);
      await pool.query(`UPDATE patients SET address = '' WHERE address IS NULL`);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS visits (
          id UUID PRIMARY KEY,
          patient_id UUID NOT NULL,
          scheduled_time TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'Pending',
          risk_level TEXT NOT NULL DEFAULT 'Unknown',
          visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
          notes TEXT DEFAULT '',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS screenings (
          id UUID PRIMARY KEY,
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          submitted_by TEXT NOT NULL DEFAULT '',
          age INTEGER NOT NULL,
          bmi NUMERIC(5, 2) NOT NULL,
          family_history INTEGER NOT NULL,
          exercise INTEGER NOT NULL,
          sugary_food INTEGER NOT NULL,
          smoking INTEGER NOT NULL,
          thirst INTEGER NOT NULL,
          headaches INTEGER NOT NULL,
          sleep INTEGER NOT NULL,
          stress INTEGER NOT NULL,
          answers JSONB NOT NULL DEFAULT '{}'::jsonb,
          diabetes_risk TEXT NOT NULL,
          diabetes_probability INTEGER NOT NULL,
          hypertension_risk TEXT NOT NULL,
          hypertension_probability INTEGER NOT NULL,
          overall_risk TEXT NOT NULL,
          overall_probability INTEGER NOT NULL,
          explainability JSONB NOT NULL DEFAULT '{}'::jsonb,
          risk_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
          status TEXT NOT NULL DEFAULT 'NEW',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS submitted_by TEXT DEFAULT ''`);
      await pool.query(`ALTER TABLE screenings ALTER COLUMN submitted_by SET DEFAULT ''`);
      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE screenings ALTER COLUMN answers SET DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS explainability JSONB DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE screenings ALTER COLUMN explainability SET DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS risk_reasons JSONB DEFAULT '[]'::jsonb`);
      await pool.query(`ALTER TABLE screenings ALTER COLUMN risk_reasons SET DEFAULT '[]'::jsonb`);

      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS doctor_notes TEXT DEFAULT ''`);
      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS diagnosis TEXT DEFAULT ''`);
      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS prescription TEXT DEFAULT ''`);
      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP`);
      await pool.query(`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS resolved_by TEXT DEFAULT ''`);
    })();
  }

  return schemaReadyPromise;
}

function createMobileId() {
  return randomUUID();
}

module.exports = {
  ensureMobileSchema,
  createMobileId,
};