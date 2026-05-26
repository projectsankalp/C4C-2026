"""
AarogyaNet Technical Report -- PDF Generator
Run: python generate_report.py
Output: AarogyaNet_Technical_Report.pdf
"""
from fpdf import FPDF
from fpdf.enums import XPos, YPos
from datetime import datetime

# -- Colour palette ------------------------------------------------------------
C_DARK      = (15, 23, 42)      # slate-900
C_NAVY      = (30, 58, 138)     # blue-800
C_BLUE      = (37, 99, 235)     # blue-600
C_ACCENT    = (124, 58, 237)    # violet-600
C_GREEN     = (22, 101, 52)     # green-800
C_RED       = (153, 27, 27)     # red-800
C_AMBER     = (120, 53, 15)     # amber-900
C_GRAY      = (71, 85, 105)     # slate-600
C_LIGHT     = (248, 250, 252)   # slate-50
C_ROW_ALT   = (241, 245, 249)   # slate-100
C_BORDER    = (203, 213, 225)   # slate-300
C_HEADER_BG = (30, 58, 138)     # blue-800


class PDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(18, 18, 18)

    # -- Running header --------------------------------------------------------
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(*C_GRAY)
        self.cell(0, 6, 'AarogyaNet -- Complete Technical Report', align='L',
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(*C_BORDER)
        self.line(18, 14, 192, 14)
        self.ln(2)

    # -- Running footer --------------------------------------------------------
    def footer(self):
        self.set_y(-14)
        self.set_draw_color(*C_BORDER)
        self.line(18, self.get_y(), 192, self.get_y())
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(*C_GRAY)
        self.cell(0, 8, f'Page {self.page_no()}  |  Confidential -- AarogyaNet Clinical Intelligence Platform  |  {datetime.now().strftime("%d %b %Y")}', align='C')

    # -- Helpers ---------------------------------------------------------------
    def section_title(self, num, title):
        self.ln(4)
        self.set_fill_color(*C_NAVY)
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 11)
        self.cell(0, 8, f'  {num}.  {title}', fill=True,
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(2)
        self.set_text_color(*C_DARK)

    def sub_title(self, title):
        self.ln(3)
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*C_BLUE)
        self.cell(0, 6, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(*C_DARK)

    def body(self, text, indent=0):
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(*C_DARK)
        if indent:
            self.set_x(self.l_margin + indent)
        self.multi_cell(0, 5, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def bullet(self, text, level=0):
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(*C_DARK)
        indent = 6 + level * 8
        sym    = '*' if level == 0 else '-'
        self.set_x(self.l_margin + indent)
        self.multi_cell(0, 5, f'{sym}  {text}', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def kv(self, key, val):
        self.set_font('Helvetica', 'B', 8.5)
        self.set_text_color(*C_NAVY)
        self.set_x(self.l_margin + 4)
        self.cell(42, 5, key + ':', new_x=XPos.RIGHT, new_y=YPos.LAST)
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(*C_DARK)
        self.multi_cell(0, 5, str(val), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def badge(self, text, color):
        r, g, b = color
        self.set_fill_color(r, g, b)
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 7)
        w = self.get_string_width(text) + 4
        self.cell(w, 5, text, fill=True, new_x=XPos.RIGHT, new_y=YPos.LAST)
        self.set_text_color(*C_DARK)
        self.ln(0)

    def table_header(self, cols):
        """cols = list of (label, width)"""
        self.set_fill_color(*C_HEADER_BG)
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 7.5)
        for label, w in cols:
            self.cell(w, 6, label, border=0, fill=True,
                      new_x=XPos.RIGHT, new_y=YPos.LAST)
        self.ln()

    def table_row(self, cells, cols, alt=False):
        """cells = list of strings, cols = list of (label, width)"""
        if alt:
            self.set_fill_color(*C_ROW_ALT)
        else:
            self.set_fill_color(255, 255, 255)
        self.set_text_color(*C_DARK)
        self.set_font('Helvetica', '', 7.5)
        x0 = self.get_x()
        y0 = self.get_y()
        max_h = 5
        # compute needed height for multi-cell
        for text, (_, w) in zip(cells, cols):
            lines = max(1, len(self.multi_cell(w, 5, text, dry_run=True, output='LINES')))
            max_h = max(max_h, lines * 5)
        for text, (_, w) in zip(cells, cols):
            x = self.get_x()
            y = self.get_y()
            self.set_fill_color(*C_ROW_ALT if alt else (255, 255, 255))
            self.rect(x, y, w, max_h, style='F')
            self.set_xy(x, y)
            self.multi_cell(w, max_h / max(1, len(self.multi_cell(w, 5, text, dry_run=True, output='LINES'))), text,
                            new_x=XPos.RIGHT, new_y=YPos.LAST)
            self.set_y(y)
        self.ln(max_h)
        # subtle divider
        self.set_draw_color(*C_BORDER)
        self.line(self.l_margin, self.get_y(), 192, self.get_y())

    def code_block(self, lines):
        self.set_fill_color(30, 41, 59)
        self.set_text_color(186, 230, 253)
        self.set_font('Courier', '', 7)
        for line in lines:
            self.set_x(self.l_margin)
            self.cell(0, 4.5, line, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(*C_DARK)
        self.ln(1)

    def metric_row(self, metrics):
        """metrics = list of (label, value, color)"""
        w = (174) // len(metrics)
        self.set_font('Helvetica', '', 7.5)
        for label, value, color in metrics:
            self.set_fill_color(*C_LIGHT)
            self.rect(self.get_x(), self.get_y(), w, 14, style='F')
            self.set_draw_color(*C_BORDER)
            self.rect(self.get_x(), self.get_y(), w, 14)
            x, y = self.get_x(), self.get_y()
            self.set_xy(x + 2, y + 2)
            self.set_font('Helvetica', 'B', 9)
            self.set_text_color(*color)
            self.cell(w - 4, 5, value, new_x=XPos.LEFT, new_y=YPos.NEXT)
            self.set_x(x + 2)
            self.set_font('Helvetica', '', 6.5)
            self.set_text_color(*C_GRAY)
            self.cell(w - 4, 4, label, new_x=XPos.RIGHT, new_y=YPos.LAST)
            self.set_xy(x + w, y)
        self.ln(16)
        self.set_text_color(*C_DARK)


# ==============================================================================
# Build the PDF
# ==============================================================================

pdf = PDF()
pdf.set_title('AarogyaNet Technical Report')
pdf.set_author('AarogyaNet Platform')
pdf.set_creator('AarogyaNet Report Generator')


# -- COVER PAGE ----------------------------------------------------------------
pdf.add_page()

# top colour bar
pdf.set_fill_color(*C_NAVY)
pdf.rect(0, 0, 210, 52, style='F')

pdf.set_font('Helvetica', 'B', 28)
pdf.set_text_color(255, 255, 255)
pdf.set_xy(18, 14)
pdf.cell(0, 12, 'AarogyaNet', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_xy(18, 28)
pdf.set_font('Helvetica', '', 13)
pdf.set_text_color(186, 230, 253)
pdf.cell(0, 8, 'Rural Healthcare Intelligence Platform', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_xy(18, 38)
pdf.set_font('Helvetica', '', 9)
pdf.set_text_color(147, 197, 253)
pdf.cell(0, 6, 'Complete Technical Report', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf.set_y(58)
pdf.set_text_color(*C_DARK)

# metadata box
pdf.set_fill_color(*C_LIGHT)
pdf.set_draw_color(*C_BORDER)
pdf.rect(18, 60, 174, 44, style='FD')
pdf.set_xy(24, 65)
pdf.set_font('Helvetica', 'B', 9)
pdf.set_text_color(*C_NAVY)
pdf.cell(0, 6, 'Document Information', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_xy(24, 72)
items = [
    ('Date', datetime.now().strftime('%d %B %Y')),
    ('Commit', 'b05dea6d65d8851d10e9e6e6f7790d99c2c1a08d'),
    ('Stack', 'Flask 3.x · PostgreSQL · XGBoost · SHAP · Blockchain (SHA-256/ECDSA/PoW)'),
    ('Status', 'Active development -- 23 features implemented'),
]
for k, v in items:
    pdf.set_x(24)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*C_GRAY)
    pdf.cell(28, 5, k + ':')
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*C_DARK)
    pdf.multi_cell(0, 5, v, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

# feature count boxes
pdf.set_y(112)
boxes = [
    ('13', 'Blueprints', C_BLUE),
    ('40+', 'API Endpoints', C_GREEN),
    ('8', 'DB Tables', C_ACCENT),
    ('1', 'Trained ML Model', (185, 28, 28)),
    ('23', 'Features Built', (161, 98, 7)),
]
bw = 33
for label, desc, color in boxes:
    x = pdf.get_x()
    y = pdf.get_y()
    pdf.set_fill_color(*color)
    pdf.rect(x, y, bw, 18, style='F')
    pdf.set_xy(x + 1, y + 2)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(bw - 2, 7, label, align='C', new_x=XPos.LEFT, new_y=YPos.NEXT)
    pdf.set_x(x + 1)
    pdf.set_font('Helvetica', '', 6)
    pdf.set_text_color(220, 220, 220)
    pdf.cell(bw - 2, 4, desc, align='C', new_x=XPos.RIGHT, new_y=YPos.LAST)
    pdf.set_xy(x + bw + 3, y)
pdf.ln(24)

pdf.set_text_color(*C_DARK)
pdf.set_font('Helvetica', '', 8.5)
pdf.set_x(18)
pdf.multi_cell(0, 5,
    'AarogyaNet is a rural healthcare intelligence platform designed for the Indian public health system. '
    'It digitises and augments the clinical workflows of ASHA workers, doctors, and patients '
    'managing hypertension, integrating a blockchain-secured visit ledger, a guided clinical '
    'protocol engine (GCPE), longitudinal patient memory, disease cluster detection, '
    'and an explainable XGBoost diabetes risk model -- all in a single offline-first Flask application.',
    new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf.ln(4)
pdf.set_font('Helvetica', 'B', 8)
pdf.set_text_color(*C_GRAY)
pdf.cell(0, 5, 'TABLE OF CONTENTS', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_font('Helvetica', '', 8)
pdf.set_text_color(*C_DARK)
toc = [
    ('1.  Project Overview', '2'),
    ('2.  Tech Stack', '2'),
    ('3.  Project Structure', '3'),
    ('4.  Features Implemented', '4'),
    ('5.  Functions & Methods', '5'),
    ('6.  Database / Data Models', '7'),
    ('7.  API Endpoints', '9'),
    ('8.  UI Components', '11'),
    ('9.  State Management', '12'),
    ('10. Integrations', '12'),
    ('11. Authentication & Security', '13'),
    ('12. What Is Not Yet Built', '13'),
    ('13. Known Issues', '14'),
]
for title, pg in toc:
    pdf.set_x(24)
    pdf.cell(140, 5, title)
    pdf.cell(0, 5, pg, align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)


# ==============================================================================
# SECTION 1 -- PROJECT OVERVIEW
# ==============================================================================
pdf.add_page()
pdf.section_title(1, 'Project Overview')

pdf.body(
    'AarogyaNet is a rural healthcare intelligence platform designed for the Indian public health system. '
    'It digitises and augments the clinical workflows of three primary user roles across hypertension management:'
)
pdf.bullet('ASHA Workers (Accredited Social Health Activists) -- conduct home visits, record vitals, '
           'complete guided clinical assessments via a step-by-step protocol wizard, and raise SOS emergencies.')
pdf.bullet('Doctors -- review a risk-ranked patient queue, analyse longitudinal trends, issue prescriptions, '
           'and acknowledge SOS emergencies with triage context.')
pdf.bullet('Patients -- view their own health records and prescription token redemption history.')

pdf.ln(2)
pdf.body('Core problems solved:')
pdf.bullet('Paper-based ASHA visit records are unstructured and non-actionable.')
pdf.bullet('Doctors in rural CHCs/PHCs lack prioritised, longitudinal intelligence across large patient populations.')
pdf.bullet('Medication adherence has no verifiable audit trail.')
pdf.bullet('Outbreak signals are invisible until clusters become crises.')
pdf.bullet('No ML-based early disease risk stratification in the primary care workflow.')

pdf.ln(2)
pdf.body(
    'The application is an offline-first, blockchain-secured, AI-augmented clinical decision support system. '
    'All AI outputs are explicitly framed as augmentation signals -- the deterministic rule engine always takes '
    'precedence for safety-critical decisions. The platform is built on Flask 3.x with a PostgreSQL primary '
    'database and SQLite offline queue, deployed on a single Python process.'
)


# ==============================================================================
# SECTION 2 -- TECH STACK
# ==============================================================================
pdf.section_title(2, 'Tech Stack')

pdf.sub_title('Backend Framework')
cols = [('Component', 60), ('Library / Package', 60), ('Version', 50)]
pdf.table_header(cols)
rows = [
    ('Web Framework', 'Flask', '>= 3.0.0'),
    ('CORS', 'flask-cors', '>= 4.0.0'),
    ('Authentication', 'flask-jwt-extended', '>= 4.6.0'),
    ('WSGI Server (prod)', 'gunicorn', '>= 21.2.0'),
    ('Environment Vars', 'python-dotenv', '>= 1.0.0'),
]
for i, r in enumerate(rows):
    pdf.table_row(r, cols, alt=(i % 2 == 1))

pdf.sub_title('Database')
cols = [('Component', 60), ('Technology', 60), ('Version', 50)]
pdf.table_header(cols)
rows = [
    ('Primary Database', 'PostgreSQL (psycopg2-binary)', '>= 2.9.9'),
    ('Offline Queue', 'SQLite (stdlib sqlite3)', 'Python stdlib'),
]
for i, r in enumerate(rows):
    pdf.table_row(r, cols, alt=(i % 2 == 1))

pdf.sub_title('AI / Machine Learning')
cols = [('Component', 60), ('Library', 60), ('Version', 50)]
pdf.table_header(cols)
rows = [
    ('ML Framework', 'XGBoost', '3.2.0'),
    ('Explainability', 'SHAP (TreeExplainer)', '0.51.0'),
    ('Preprocessing', 'scikit-learn', '>= 1.4.0'),
    ('Data Manipulation', 'pandas', '>= 2.2.0'),
    ('Numerical', 'numpy', '>= 1.26.0'),
    ('Model Persistence', 'joblib (via scikit-learn)', 'bundled'),
]
for i, r in enumerate(rows):
    pdf.table_row(r, cols, alt=(i % 2 == 1))

pdf.sub_title('Blockchain / Cryptography')
cols = [('Component', 60), ('Implementation', 110)]
pdf.table_header(cols)
rows = [
    ('Hashing', 'SHA-256 (stdlib hashlib)'),
    ('Digital Signatures', 'ECDSA via cryptography >= 42.0.0'),
    ('Proof-of-Work', 'Custom Python mining loop (difficulty=4, 4 leading zeros)'),
    ('Key Storage', 'ECDSA keypair: keys/ecdsa_private.pem + keys/ecdsa_public.pem'),
]
for i, r in enumerate(rows):
    pdf.table_row(r, cols, alt=(i % 2 == 1))

pdf.sub_title('Frontend')
cols = [('Component', 60), ('Technology', 110)]
pdf.table_header(cols)
rows = [
    ('Templating', 'Jinja2 (Flask-native server-side rendering)'),
    ('CSS Framework', 'Bootstrap 5 (CDN)'),
    ('Icons', 'Font Awesome 6 (CDN)'),
    ('Maps', 'Leaflet.js (CDN) + OpenStreetMap tiles'),
    ('Charts', 'Chart.js (CDN)'),
    ('JavaScript', 'Vanilla ES6+ (no build step, no bundler)'),
]
for i, r in enumerate(rows):
    pdf.table_row(r, cols, alt=(i % 2 == 1))


# ==============================================================================
# SECTION 3 -- PROJECT STRUCTURE
# ==============================================================================
pdf.add_page()
pdf.section_title(3, 'Project Structure')

pdf.sub_title('Root Level')
entries = [
    ('app.py', 'Flask app factory; registers 13 blueprints + 11 page routes'),
    ('config.py', 'Config class: DB URLs, JWT secret, PoW difficulty, port'),
    ('requirements.txt', 'Python package dependencies'),
    ('aarogyanet_offline.db', 'SQLite file for offline emergency queue'),
    ('keys/', 'ECDSA private + public PEM keypair for blockchain signing'),
]
cols = [('File / Directory', 70), ('Description', 100)]
pdf.table_header(cols)
for i, (f, d) in enumerate(entries):
    pdf.table_row([f, d], cols, alt=(i % 2 == 1))

pdf.sub_title('ai_engine/ -- AI & ML Infrastructure')
entries = [
    ('preprocessing.py', 'PROTECTED -- visit feature extraction for the deterministic risk engine'),
    ('risk_engine.py', 'PROTECTED -- 3-layer clinical risk scoring (vitals + GCPE + guards)'),
    ('datasets/raw/', 'Raw CSV datasets: Pima Indians (768r), Heart Disease UCI, NFHS-5'),
    ('datasets/metadata/schemas.py', 'DATASET_REGISTRY -- schema definitions for all 5 datasets'),
    ('datasets/profiler.py', 'DatasetProfiler -- statistical profiling with JSON/text report output'),
    ('models/base.py', 'AarogyaModelBase -- abstract base: save/load/predict contract'),
    ('models/registry.py', 'ModelRegistry singleton -- register, load, cache, introspect models'),
    ('models/artifacts/', 'Saved joblib models + diabetes_eval_report.json'),
    ('models/diabetes/model.py', 'DiabetesRiskModel, predict_diabetes_risk(), get_model_status()'),
    ('models/diabetes/preprocessor.py', 'PimaPreprocessor -- zeros->NaN, median impute, StandardScaler'),
    ('models/diabetes/trainer.py', 'DiabetesTrainer -- full train->evaluate->SHAP->save pipeline'),
    ('models/diabetes/explainer.py', 'DiabetesExplainer -- SHAP TreeExplainer (tree_path_dependent)'),
    ('pipelines/feature_pipeline.py', 'FeaturePipeline -- extract 35 features from visit data'),
    ('pipelines/feature_store.py', 'FeatureStore -- JSON-backed feature vector cache'),
    ('evaluation/metrics.py', 'evaluate_classifier() -- AUC, F1, sensitivity, Brier, ECE'),
]
cols = [('File', 80), ('Description', 90)]
pdf.table_header(cols)
for i, (f, d) in enumerate(entries):
    pdf.table_row([f, d], cols, alt=(i % 2 == 1))

pdf.sub_title('Other Top-level Directories')
entries = [
    ('blockchain/', 'blockchain.py, block.py, hashing.py, mining.py, verification.py'),
    ('database/', 'postgres.py (init_db, get_db_connection), sqlite_sync.py'),
    ('gcpe/', 'engine.py + protocols/hypertension_protocol.json (15-step branching protocol)'),
    ('routes/', '13 Flask blueprints -- one file per domain (auth, patients, visits, risk, ...)'),
    ('services/', '8 business logic modules -- longitudinal, emergency, cluster, absence, tokens, ...'),
    ('utils/', 'auth.py (hash/check password), helpers.py (hash, serialise), validators.py'),
    ('static/', 'css/style.css (Bootstrap overrides), js/main.js (JWT + API singleton)'),
    ('templates/', '10 Jinja2 templates: base, login, index, asha, doctor, patient, blockchain, ...'),
]
cols = [('Directory', 50), ('Contents', 120)]
pdf.table_header(cols)
for i, (f, d) in enumerate(entries):
    pdf.table_row([f, d], cols, alt=(i % 2 == 1))


# ==============================================================================
# SECTION 4 -- FEATURES IMPLEMENTED
# ==============================================================================
pdf.add_page()
pdf.section_title(4, 'All Features Implemented')

features = [
    ('1',  'JWT Authentication', 'Stateless login; dual storage (header + cookie); 24h expiry; role claims', 'Complete'),
    ('2',  'Role-Based Access Control', '4 roles: asha, doctor, patient, admin; enforced on every endpoint', 'Complete'),
    ('3',  'Patient Registration', 'ASHA registers patients with demographics, GPS, phone, medical history', 'Complete'),
    ('4',  'ASHA Visit Recording', 'BP, pulse, temp, symptoms, GPS + timestamp; SHA-256 tamper-hash', 'Complete'),
    ('5',  'GCPE Protocol Engine', '15-step branching hypertension assessment wizard; pathway-aware', 'Complete'),
    ('6',  '3-Layer Risk Scoring', 'Vitals rules + GCPE pathway boosts + clinical contradiction guards', 'Complete'),
    ('7',  'Blockchain Integrity', 'SHA-256 + ECDSA + PoW (difficulty=4) for every visit/emergency/adherence', 'Complete'),
    ('8',  'Risk Queue (Doctor)', 'Patients sorted by risk score descending with latest vitals', 'Complete'),
    ('9',  'Prescription System', 'Doctors create prescriptions; JanAushadi token per medication', 'Complete'),
    ('10', 'Token Redemption', 'Patient/ASHA redeems token; method mined to blockchain', 'Complete'),
    ('11', 'SOS Emergency Escalation', 'ASHA raises SOS; triage instructions; doctor notified; blockchain proof', 'Complete'),
    ('12', 'Offline Emergency Queue', 'SQLite stores SOS when offline; /offline/sync replays to PostgreSQL', 'Complete'),
    ('13', 'Passive Absence Detection', 'Records missed visits; continuity score; LAPSED/AT_RISK alerts', 'Complete'),
    ('14', 'Longitudinal PCM Engine', 'BP trend, risk trajectory, adherence %, first-deviations, narrative', 'Complete'),
    ('15', 'Disease Cluster Detection', 'Haversine spatiotemporal; 6 cluster types; CRITICAL/HIGH/MEDIUM', 'Complete'),
    ('16', 'Risk Heatmap', 'Leaflet.js coloured GPS markers; village stats overlay', 'Complete'),
    ('17', 'Dataset Profiling Layer', 'Statistical profiling of 5 public health datasets with reports', 'Complete'),
    ('18', 'AI Inference Pipeline', 'ModelRegistry, AarogyaModelBase, 35-feature pipeline, feature store', 'Complete'),
    ('19', 'Diabetes Risk Stratification', 'XGBoost (AUC=0.85) on Pima Indians; SHAP explainability; 4 risk bands', 'Complete'),
    ('20', 'Doctor AI Signal UI', 'Confidence-gated panel: risk band, SHAP factors, completeness %, disclaimer', 'Complete'),
    ('21', 'Blockchain Explorer', 'Full chain view, block lookup, integrity verification, stats', 'Complete'),
    ('22', 'Surveillance Dashboard', 'District cluster view, type summary, village breakdown', 'Complete'),
    ('23', 'Patient Dashboard', 'Own record, visit history, prescriptions, token adherence timeline', 'Complete'),
]

cols = [('#', 8), ('Feature', 62), ('Description', 90), ('Status', 16)]
pdf.table_header(cols)
for i, row in enumerate(features):
    pdf.table_row(list(row), cols, alt=(i % 2 == 1))


# ==============================================================================
# SECTION 5 -- FUNCTIONS & METHODS
# ==============================================================================
pdf.add_page()
pdf.section_title(5, 'Key Functions & Methods')

pdf.sub_title('ai_engine/risk_engine.py')
funcs = [
    ('calculate_risk_score(visit_data)', '(dict) -> (int, str)', '3-layer pipeline: vitals rules -> GCPE pathway boosts -> clinical contradiction guards'),
    ('get_risk_summary(score, level, visit_data)', '(int, str, dict) -> dict', 'Structured clinical summary: escalation reasons, adherence concerns, guard notes, referral urgency'),
    ('extract_gcpe_context(visit_data)', '(dict) -> dict', 'Normalises GCPE fields; backward-compatible for pre-GCPE visits'),
    ('_score_to_level(score)', '(int) -> str', 'LOW (<21) / MEDIUM (21-50) / HIGH (>=51) classification'),
    ('_classify_bp(bp_s, bp_d)', '(int, int) -> str', 'Normal / Stage1 / Stage2 / Crisis classification string'),
]
cols = [('Function', 68), ('Signature', 40), ('What It Does', 64)]
pdf.table_header(cols)
for i, r in enumerate(funcs):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))

pdf.sub_title('ai_engine/models/diabetes/model.py')
funcs = [
    ('predict_diabetes_risk(features)', '(dict) -> dict', 'Load model -> preprocess -> XGBoost predict -> SHAP explain -> format 12-field output'),
    ('get_model_status()', '() -> dict', 'Artifact existence, version, AUC-ROC, sensitivity, model path'),
    ('DiabetesRiskModel.predict(X)', '(ndarray) -> dict', 'Raw model inference with risk band + 5 contributing SHAP factors'),
    ('DiabetesRiskModel.save_to_disk(path)', '(Path)', 'joblib serialisation to .joblib artifact'),
    ('DiabetesRiskModel.load_from_disk(path)', '(Path) -> instance', 'joblib deserialisation with preprocessor loading'),
]
cols = [('Function', 68), ('Signature', 40), ('What It Does', 64)]
pdf.table_header(cols)
for i, r in enumerate(funcs):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))

pdf.sub_title('services/longitudinal_engine.py')
funcs = [
    ('build_longitudinal_summary(patient_id)', '(int) -> dict', 'Full PCM: BP trend + risk trajectory + adherence + deviations + pathways + alerts + narrative'),
    ('build_snapshot(patient_id)', '(int) -> dict', 'Lightweight: trend directions + top 3 alerts only (fast for list views)'),
    ('analyze_bp_trend(visits)', '(list) -> dict', 'IMPROVING/WORSENING/VOLATILE/STABLE/SINGLE with baseline, recent, delta, std'),
    ('analyze_risk_trajectory(visits)', '(list) -> dict', 'ESCALATING/IMPROVING/STABLE with baseline/recent/peak risk scores'),
    ('analyze_adherence_trajectory(visits)', '(list) -> dict', 'Adherence %, trend, consecutive misses, top missed reason'),
    ('detect_first_deviations(visits)', '(list) -> list', '7 clinically significant first-occurrence events with severity and description'),
    ('detect_sudden_escalations(visits)', '(list) -> list', 'Visits where risk score jumped >=20 points from previous visit'),
    ('generate_clinical_alerts(...)', '(...) -> list[str]', 'Prioritised human-readable alert strings for the doctor dashboard'),
]
cols = [('Function', 68), ('Signature', 35), ('What It Does', 69)]
pdf.table_header(cols)
for i, r in enumerate(funcs):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))

pdf.sub_title('services/cluster_engine.py')
funcs = [
    ('detect_clusters(lookback_days)', '(int) -> list', 'Runs all 6 cluster type detectors; returns severity-sorted cluster list'),
    ('get_surveillance_summary(lookback_days)', '(int) -> dict', 'District-level summary: total clusters, type breakdown, village breakdown'),
    ('_group_into_clusters(...)', '(...) -> list', 'Greedy Haversine spatiotemporal grouping (radius_m + window_days constraints)'),
    ('_haversine_m(lat1, lon1, lat2, lon2)', '(float×4) -> float', 'Distance in metres between two GPS coordinates using Haversine formula'),
    ('_classify_severity(ctype, count)', '(str, int) -> str', 'CRITICAL/HIGH/MEDIUM based on cluster type and case count'),
    ('_cluster_id(ctype, lat, lng, dt)', '(...) -> str', 'Deterministic SHA-256 cluster fingerprint (stable across re-runs)'),
]
cols = [('Function', 68), ('Signature', 35), ('What It Does', 69)]
pdf.table_header(cols)
for i, r in enumerate(funcs):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))

pdf.sub_title('blockchain/blockchain.py')
funcs = [
    ('add_visit_block(visit_payload)', '(dict) -> Block', 'Hash payload -> mine PoW -> ECDSA sign -> persist to blockchain table'),
    ('add_emergency_block(event_id, type, hash)', '(...) -> (Block, str)', 'Same pipeline for emergency SOS events'),
    ('add_adherence_block(token_id, method)', '(...) -> (Block, str)', 'Same pipeline for token redemption adherence events'),
    ('verify_full_chain()', '() -> dict', 'Rehash + re-verify ECDSA signatures across entire chain; returns integrity report'),
    ('get_full_chain()', '() -> list', 'All blocks from DB, newest first'),
]
cols = [('Function', 68), ('Signature', 35), ('What It Does', 69)]
pdf.table_header(cols)
for i, r in enumerate(funcs):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))

pdf.sub_title('gcpe/engine.py')
funcs = [
    ('load_protocol(protocol_id)', '(str) -> dict', 'Load JSON protocol definition by ID from gcpe/protocols/'),
    ('advance_step(protocol, step_id, answer, answers)', '(...) -> dict|None', 'Evaluate answer conditions -> return next step object or None if complete'),
    ('build_summary(protocol, session)', '(dict, dict) -> dict', 'Compile completed GCPE session into structured clinical summary'),
    ('validate_answer(step, answer)', '(dict, any) -> (bool, str)', 'Type-check answer against step type (boolean/choice/text/number)'),
]
cols = [('Function', 68), ('Signature', 35), ('What It Does', 69)]
pdf.table_header(cols)
for i, r in enumerate(funcs):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))


# ==============================================================================
# SECTION 6 -- DATABASE / DATA MODELS
# ==============================================================================
pdf.add_page()
pdf.section_title(6, 'Database / Data Models')

pdf.body('All tables are created in PostgreSQL by database/postgres.py on first startup. '
         'SQLite mirrors the emergency_events schema for offline queue storage.')

def schema_table(pdf, title, fields):
    pdf.sub_title(title)
    cols = [('Column', 52), ('Type', 40), ('Description', 80)]
    pdf.table_header(cols)
    for i, (col, typ, desc) in enumerate(fields):
        pdf.table_row([col, typ, desc], cols, alt=(i % 2 == 1))
    pdf.ln(1)

schema_table(pdf, 'users', [
    ('id', 'SERIAL PK', 'Auto-increment primary key'),
    ('username', 'VARCHAR(80) UNIQUE', 'Login username'),
    ('email', 'VARCHAR(120) UNIQUE', 'Email address'),
    ('password_hash', 'VARCHAR(256)', 'SHA-256 + salt hashed password'),
    ('role', 'VARCHAR(20)', 'asha | doctor | patient | admin'),
    ('full_name', 'VARCHAR(200)', 'Display name'),
    ('phone', 'VARCHAR(20)', 'Contact number'),
    ('village', 'VARCHAR(100)', 'Assigned village'),
    ('is_active', 'BOOLEAN DEFAULT TRUE', 'Account active flag'),
    ('created_at', 'TIMESTAMP', 'Account creation time'),
])

schema_table(pdf, 'patients', [
    ('id', 'SERIAL PK', 'Auto-increment primary key'),
    ('patient_id', 'VARCHAR(20) UNIQUE', 'AAR-XXXXXXXX format UID'),
    ('full_name', 'VARCHAR(200)', 'Patient full name'),
    ('age', 'INTEGER', 'Age in years'),
    ('gender', 'VARCHAR(10)', 'Gender'),
    ('village', 'VARCHAR(100)', 'Home village'),
    ('phone', 'VARCHAR(20)', 'Contact number'),
    ('asha_worker_id', 'INTEGER FK->users', 'Assigned ASHA worker'),
    ('doctor_id', 'INTEGER FK->users', 'Assigned doctor'),
    ('medical_history', 'TEXT', 'Free-text medical background'),
    ('latitude / longitude', 'DECIMAL(9,6)', 'Home GPS coordinates'),
    ('last_visit', 'TIMESTAMP', 'Updated after each visit'),
])

pdf.add_page()
schema_table(pdf, 'asha_visits', [
    ('id', 'SERIAL PK', 'Auto-increment primary key'),
    ('patient_id', 'INTEGER FK->patients', 'Patient reference'),
    ('asha_worker_id', 'INTEGER FK->users', 'Recording ASHA worker'),
    ('visit_date', 'TIMESTAMP DEFAULT NOW()', 'Visit timestamp'),
    ('visit_timestamp', 'FLOAT', 'Unix epoch for replay protection in hash'),
    ('bp_systolic / bp_diastolic', 'INTEGER', 'Blood pressure readings mmHg'),
    ('pulse', 'INTEGER', 'Heart rate bpm'),
    ('temperature', 'DECIMAL(4,1)', 'Body temperature °C'),
    ('dizziness / chest_pain / medicine_missed', 'BOOLEAN', 'Symptom flags'),
    ('notes', 'TEXT', 'Free-text notes'),
    ('risk_score', 'INTEGER DEFAULT 0', '0-100 computed risk score'),
    ('risk_level', 'VARCHAR(10)', 'LOW | MEDIUM | HIGH'),
    ('gcpe_data', 'JSONB', 'Full GCPE session: pathways, answers, alerts, risk_flags'),
    ('visit_hash', 'VARCHAR(64)', 'SHA-256 tamper-evidence hash'),
    ('block_index', 'INTEGER', 'Linked blockchain block index'),
    ('synced_to_blockchain', 'BOOLEAN DEFAULT FALSE', 'Blockchain mining flag'),
    ('latitude / longitude', 'DECIMAL(9,6)', 'Visit GPS coordinates'),
])

schema_table(pdf, 'blockchain', [
    ('block_index', 'SERIAL PK', 'Sequential block index'),
    ('timestamp', 'FLOAT', 'Unix epoch of block creation'),
    ('data', 'JSONB', 'PHI-stripped block payload'),
    ('previous_hash', 'VARCHAR(64)', 'Hash of preceding block'),
    ('current_hash', 'VARCHAR(64)', 'SHA-256 hash of this block'),
    ('nonce', 'INTEGER', 'Proof-of-work nonce'),
    ('signature', 'TEXT', 'ECDSA base64 signature'),
    ('is_valid', 'BOOLEAN DEFAULT TRUE', 'Verification flag'),
    ('block_type', 'VARCHAR(20)', 'visit | emergency | adherence'),
])

schema_table(pdf, 'emergency_events', [
    ('event_id', 'VARCHAR(64) UNIQUE', 'UUID hex event identifier'),
    ('patient_id', 'INTEGER FK->patients', 'Patient in distress'),
    ('asha_worker_id', 'INTEGER FK->users', 'ASHA who raised the SOS'),
    ('emergency_type', 'VARCHAR(50)', 'hypertensive_crisis | chest_pain | unconscious | ...'),
    ('status', 'VARCHAR(20)', 'active | acknowledged | resolved | escalated'),
    ('severity', 'VARCHAR(10)', 'CRITICAL | HIGH'),
    ('latitude / longitude', 'DECIMAL(9,6)', 'Emergency location GPS'),
    ('latest_bp_systolic / diastolic', 'INTEGER', 'Most recent BP from visit history'),
    ('escalation_targets', 'JSONB', 'Doctor, PHC contact, helpline, supervisor'),
    ('triage_instructions', 'JSONB', 'Step-by-step first-response instructions'),
    ('emergency_hash', 'VARCHAR(64)', 'SHA-256 of event_id + type + timestamp'),
    ('block_index', 'INTEGER', 'Linked blockchain block'),
    ('acknowledged_by', 'INTEGER FK->users', 'Acknowledging doctor ID'),
    ('acknowledged_at / resolved_at', 'TIMESTAMP', 'Lifecycle timestamps'),
])

schema_table(pdf, 'prescriptions & prescription_tokens', [
    ('prescriptions.id', 'SERIAL PK', 'Prescription ID'),
    ('prescriptions.medicines', 'JSONB', 'List of medicine name strings'),
    ('prescriptions.dosage_instructions', 'TEXT', 'Dosage free text'),
    ('prescriptions.followup_date', 'DATE', 'Scheduled follow-up'),
    ('prescription_tokens.token_id', 'VARCHAR(32) UNIQUE', 'Hex redemption token'),
    ('prescription_tokens.status', 'VARCHAR(20)', 'pending | redeemed | expired'),
    ('prescription_tokens.redemption_method', 'VARCHAR(30)', 'patient_pickup | asha_pickup | home_delivery'),
    ('prescription_tokens.adherence_hash', 'VARCHAR(64)', 'SHA-256 of redemption event'),
    ('prescription_tokens.block_index', 'INTEGER', 'Linked blockchain block'),
])

schema_table(pdf, 'absence_events', [
    ('id', 'SERIAL PK', 'Auto-increment primary key'),
    ('patient_id', 'INTEGER FK->patients', 'Patient reference'),
    ('recorded_by', 'INTEGER FK->users', 'ASHA/doctor who recorded absence'),
    ('absence_type', 'VARCHAR(50)', 'missed_visit | patient_unavailable | refused_visit | ...'),
    ('expected_date', 'DATE', 'When the visit was expected'),
    ('notes', 'TEXT', 'Reason/context'),
    ('recorded_at', 'TIMESTAMP DEFAULT NOW()', 'Record timestamp'),
])


# ==============================================================================
# SECTION 7 -- API ENDPOINTS
# ==============================================================================
pdf.add_page()
pdf.section_title(7, 'API Endpoints')

def endpoint_table(pdf, title, rows):
    pdf.sub_title(title)
    cols = [('Method', 14), ('Path', 80), ('Roles', 34), ('Description', 44)]
    pdf.table_header(cols)
    for i, r in enumerate(rows):
        pdf.table_row(list(r), cols, alt=(i % 2 == 1))
    pdf.ln(1)

endpoint_table(pdf, 'Authentication -- /api/auth', [
    ('POST', '/api/auth/login', 'Open', 'Authenticate; returns JWT + sets cookie'),
    ('POST', '/api/auth/register', 'Open', 'Register new user'),
    ('GET',  '/api/auth/profile', 'JWT any', 'Current user profile'),
    ('GET',  '/api/auth/users', 'JWT admin', 'List all users'),
])

endpoint_table(pdf, 'Patients -- /api/patients', [
    ('GET',  '/api/patients', 'JWT all', 'List patients (role-scoped)'),
    ('POST', '/api/patients', 'JWT asha/admin', 'Register new patient'),
    ('GET',  '/api/patients/<id>', 'JWT all', 'Patient + visits + prescriptions'),
    ('GET',  '/api/patients/my', 'JWT patient', 'Own patient record'),
    ('GET',  '/api/patients/<id>/longitudinal', 'JWT doc/asha/admin', 'Full PCM summary'),
    ('GET',  '/api/patients/<id>/snapshot', 'JWT doc/asha/admin', 'Lightweight trend snapshot'),
])

endpoint_table(pdf, 'Visits -- /api/visits', [
    ('POST', '/api/visits', 'JWT asha/admin', 'Create visit -> risk score -> mine block'),
    ('GET',  '/api/visits', 'JWT all', 'List visits (role-scoped, up to 100)'),
    ('GET',  '/api/visits/<id>', 'JWT all', 'Single visit + risk summary + longitudinal snapshot'),
    ('GET',  '/api/visits/patient/<id>', 'JWT all', 'All visits for one patient'),
])

endpoint_table(pdf, 'Risk -- /api/risk', [
    ('POST', '/api/risk/score', 'JWT any', 'Preview risk score (no DB write)'),
    ('GET',  '/api/risk/queue', 'JWT doc/admin', 'Risk-ranked patient queue'),
    ('GET',  '/api/risk/longitudinal-queue', 'JWT doc/admin', 'Queue with longitudinal trend data'),
    ('GET',  '/api/risk/heatmap', 'JWT any', 'GPS points for Leaflet map'),
    ('GET',  '/api/risk/stats', 'JWT any', 'Aggregate dashboard stats'),
])

endpoint_table(pdf, 'Blockchain -- /api/blockchain', [
    ('GET', '/api/blockchain/chain', 'JWT any', 'Full chain, newest first'),
    ('GET', '/api/blockchain/block/<index>', 'JWT any', 'Single block by index'),
    ('GET', '/api/blockchain/verify', 'JWT any', 'Full integrity report'),
    ('GET', '/api/blockchain/latest', 'JWT any', 'Most recent block'),
    ('GET', '/api/blockchain/stats', 'JWT any', 'Chain summary statistics'),
])

endpoint_table(pdf, 'GCPE -- /api/gcpe', [
    ('GET',  '/api/gcpe/protocol/<id>', 'JWT any', 'Full protocol JSON definition'),
    ('POST', '/api/gcpe/next', 'JWT any', 'Advance one step; returns next step + risk flags'),
    ('POST', '/api/gcpe/summary', 'JWT any', 'Build summary from completed session'),
])

pdf.add_page()

endpoint_table(pdf, 'Prescriptions -- /api/prescriptions', [
    ('POST', '/api/prescriptions', 'JWT doctor', 'Create prescription + generate tokens'),
    ('GET',  '/api/prescriptions', 'JWT doc/admin', 'List prescriptions (role-scoped)'),
    ('GET',  '/api/prescriptions/<id>', 'JWT any', 'Single prescription detail'),
    ('GET',  '/api/prescriptions/patient/<id>', 'JWT any', 'Patient prescriptions'),
])

endpoint_table(pdf, 'Tokens -- /api/tokens', [
    ('POST', '/api/tokens/redeem', 'JWT all', 'Redeem token; mine adherence block'),
    ('GET',  '/api/tokens/<token_id>', 'JWT any', 'Token status and redemption info'),
    ('GET',  '/api/tokens/prescription/<id>', 'JWT doc/admin', 'Tokens for a prescription'),
    ('GET',  '/api/tokens/patient/<id>', 'JWT any', 'Tokens for a patient'),
    ('GET',  '/api/tokens/my', 'JWT any', 'Role-aware token listing'),
])

endpoint_table(pdf, 'Emergency -- /api/emergency', [
    ('GET',  '/api/emergency/types', 'Open', 'Available emergency type enum (offline-safe)'),
    ('POST', '/api/emergency', 'JWT any', 'Create SOS + triage + blockchain proof'),
    ('GET',  '/api/emergency', 'JWT all', 'List emergencies (role-scoped)'),
    ('GET',  '/api/emergency/<event_id>', 'JWT any', 'Single event detail with patient info'),
    ('POST', '/api/emergency/<event_id>/acknowledge', 'JWT doc/admin', 'Doctor acknowledges SOS'),
    ('POST', '/api/emergency/<event_id>/resolve', 'JWT doc/admin/asha', 'Mark SOS resolved'),
    ('GET',  '/api/emergency/patient/<id>', 'JWT any', 'All events for a patient'),
    ('GET',  '/api/emergency/offline/pending', 'JWT any', 'SQLite offline queue count'),
    ('POST', '/api/emergency/offline/sync', 'JWT any', 'Replay SQLite queue to PostgreSQL'),
])

endpoint_table(pdf, 'Absence -- /api/absence', [
    ('GET',  '/api/absence/types', 'JWT any', 'Absence type enum'),
    ('POST', '/api/absence', 'JWT asha/doc/admin', 'Record missed visit event'),
    ('GET',  '/api/absence/patient/<id>', 'JWT any', 'Absence history + continuity analysis'),
    ('GET',  '/api/absence/alerts', 'JWT doc/admin', 'All patients with active absence alerts'),
    ('GET',  '/api/absence/continuity', 'JWT doc/admin', 'Continuity overview table'),
])

endpoint_table(pdf, 'Clusters -- /api/clusters', [
    ('GET',  '/api/clusters', 'JWT any', 'Active clusters (?lookback_days, ?type, ?severity)'),
    ('GET',  '/api/clusters/summary', 'JWT doc/admin', 'District surveillance summary'),
    ('GET',  '/api/clusters/heatmap', 'JWT any', 'Cluster overlay for Leaflet.js'),
    ('POST', '/api/clusters/recalculate', 'JWT asha/doc/admin', 'Force re-detection after offline sync'),
])

endpoint_table(pdf, 'AI Inference -- /api/ai', [
    ('POST', '/api/ai/diabetes-risk', 'JWT any', 'XGBoost inference; all 8 fields optional (imputed if missing)'),
    ('GET',  '/api/ai/status', 'JWT any', 'Model registry + artifact status + phase'),
    ('GET',  '/api/ai/diabetes/explain', 'JWT any', 'Global SHAP feature importance + eval metrics'),
])


# ==============================================================================
# SECTION 8 -- UI COMPONENTS
# ==============================================================================
pdf.add_page()
pdf.section_title(8, 'UI Components')

components = [
    ('base.html', 'Shared layout',
     'Navbar with role-aware links, Bootstrap 5 + Font Awesome 6 CDN, '
     'main.js + style.css includes, {% block content %} and {% block scripts %} extension points.'),
    ('login.html', 'Login page',
     'Username/password form. JWT stored to localStorage on success. '
     'Redirects to role-appropriate dashboard (/asha, /doctor, /patient).'),
    ('asha_dashboard.html', 'ASHA Dashboard',
     'Patient list with search/filter, multi-step visit wizard (vitals -> GCPE wizard -> risk preview -> submit), '
     'SOS panel with emergency type selector + GPS capture, offline queue display.'),
    ('doctor_dashboard.html', 'Doctor Dashboard',
     'Risk queue with longitudinal trend badges (ESCALATING), patient detail panel, '
     'AI Diabetes Signal panel (confidence-gated >=0.70), '
     'PCM longitudinal view (Chart.js BP trend), prescription form, token/adherence history, '
     'visit history (last 5).'),
    ('patient_dashboard.html', 'Patient Dashboard',
     'Own health record, latest vitals, risk level, prescription list, '
     'token redemption status with blockchain hash display.'),
    ('blockchain.html', 'Blockchain Explorer',
     'Full chain table (block index, type, hash, timestamp, validity badge), '
     'block lookup form, integrity verification button, chain stats card.'),
    ('heatmap.html', 'Risk Heatmap',
     'Leaflet.js map centred on Rajasthan, coloured risk markers (red=HIGH/amber=MEDIUM/green=LOW), '
     'cluster overlay from /api/clusters/heatmap, village stats sidebar.'),
    ('longitudinal.html', 'Longitudinal PCM View',
     'BP trend chart (Chart.js line), risk trajectory chart, '
     'first-deviations timeline, GCPE pathway history table.'),
    ('surveillance.html', 'Surveillance Dashboard',
     'District cluster summary cards (CRITICAL/HIGH/MEDIUM counts), '
     'active clusters table (type, severity, village, case count), '
     'cluster type breakdown, village breakdown table.'),
]

for name, role, desc in components:
    pdf.set_fill_color(*C_LIGHT)
    pdf.set_draw_color(*C_BORDER)
    x = pdf.get_x()
    y = pdf.get_y()
    pdf.rect(x, y, 174, 5, style='F')
    pdf.set_xy(x + 2, y)
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(*C_NAVY)
    pdf.cell(40, 5, name)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(*C_GRAY)
    pdf.cell(0, 5, role, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(x + 4)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*C_DARK)
    pdf.multi_cell(166, 4.5, desc, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)


# ==============================================================================
# SECTION 9 -- STATE MANAGEMENT
# ==============================================================================
pdf.section_title(9, 'State Management')

states = [
    ('JWT Access Token', 'localStorage[\'aarogya_token\'] + HTTP-only cookie \'aarogyanet_token\'',
     'Sent as Authorization: Bearer <token> header on every API call'),
    ('User Identity', 'JWT claims (additional_claims dict)',
     'Extracted server-side via get_jwt() and get_jwt_identity()'),
    ('Flask Session', 'Server-side flask.session',
     'Set on login; used only for Jinja2 template current_user injection'),
    ('GCPE Session', 'Client-side JS object (in-memory)',
     'Accumulated answers dict passed in each /api/gcpe/next request body'),
    ('Visit Form', 'Client-side JS object',
     'Accumulated across multi-step wizard; submitted atomically on completion'),
    ('Offline Emergency Queue', 'SQLite aarogyanet_offline.db',
     'Written when PostgreSQL unreachable; synced via /api/emergency/offline/sync'),
    ('ML Model Instance', 'Python process memory (ModelRegistry._instances)',
     'Lazy-loaded on first inference call; cached for entire process lifetime'),
]

cols = [('State', 40), ('Storage Location', 55), ('How It Flows', 77)]
pdf.table_header(cols)
for i, r in enumerate(states):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))


# ==============================================================================
# SECTION 10 -- INTEGRATIONS
# ==============================================================================
pdf.section_title(10, 'Integrations')

integrations = [
    ('PostgreSQL', 'Active', 'Via DATABASE_URL env var; Replit-managed; all clinical data'),
    ('SQLite', 'Active', 'Local aarogyanet_offline.db; emergency offline queue'),
    ('ECDSA Keys', 'Active', 'Pre-generated PEM keypair in keys/; blockchain block signing'),
    ('Leaflet.js / OpenStreetMap', 'Active', 'CDN; map tiles for heatmap + cluster overlay pages'),
    ('Bootstrap 5 + Font Awesome 6', 'Active', 'CDN; all UI styling and icons'),
    ('JanAushadi Pharmacy', 'Mock', 'Prescription tokens named after JanAushadi; no real API'),
    ('National Emergency Helpline (112)', 'Mock', 'Hardcoded string in EMERGENCY_HELPLINE constant'),
    ('PHC Contact Directory', 'Mock', '3 PHCs hardcoded in MOCK_PHC_CONTACTS dict'),
    ('SMS / Push Notifications', 'Mock', 'notification_service.py prints to console only'),
    ('ICMR / NFHS-5 / HMIS Datasets', 'Profiled', 'Loaded and profiled; not yet used for model training'),
]

cols = [('Integration', 55), ('Status', 20), ('Notes', 97)]
pdf.table_header(cols)
for i, r in enumerate(integrations):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))


# ==============================================================================
# SECTION 11 -- AUTHENTICATION & SECURITY
# ==============================================================================
pdf.add_page()
pdf.section_title(11, 'Authentication & Security')

pdf.sub_title('Authentication Architecture')
pdf.bullet('JWT via flask-jwt-extended; 24-hour expiry; stored in localStorage and HTTP-only cookie aarogyanet_token')
pdf.bullet('Token accepted from both Authorization: Bearer header and cookie -- dual-mode for browser + API client support')
pdf.bullet('Password hashing via utils/auth.py using SHA-256 + salt (note: not bcrypt -- weaker than industry standard)')
pdf.bullet('JWT_COOKIE_CSRF_PROTECT = False (dev mode)')

pdf.sub_title('Role-Based Access Control')
pdf.body('Every API endpoint enforces role checks via get_jwt()[\'role\']. The four roles and their permissions:')
roles = [
    ('asha', 'Own patients only; create visits; raise SOS; record absences'),
    ('doctor', 'All patients; risk queue; prescriptions; acknowledge/resolve emergencies'),
    ('patient', 'Own record only; view prescriptions and tokens'),
    ('admin', 'Full access across all endpoints'),
]
cols = [('Role', 25), ('Permissions', 147)]
pdf.table_header(cols)
for i, r in enumerate(roles):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))

pdf.sub_title('Clinical Data Integrity')
pdf.bullet('Every visit payload is SHA-256 hashed (visit_hash) before DB insert -- tampering breaks the hash')
pdf.bullet('Visit hash includes GPS coordinates + Unix timestamp -> replay-attack protection')
pdf.bullet('Every visit, emergency, and adherence event is mined into blockchain (SHA-256 + ECDSA + PoW difficulty=4)')
pdf.bullet('Chain can be fully verified at any time via GET /api/blockchain/verify')

pdf.sub_title('AI Safety Properties')
pdf.bullet('deterministic_override field present in every AI API output -- states that the clinical rules engine takes precedence')
pdf.bullet('No diagnosis language used; only "clinical evaluation advised" phrasing')
pdf.bullet('Doctor dashboard AI signal hidden when model confidence < 70% (confidence_above_threshold: false)')
pdf.bullet('All 8 Pima feature names verified PHI-free (no names, phone, Aadhaar, address, GPS, email)')

pdf.sub_title('Known Security Gaps (Development Mode)')
pdf.bullet('CSRF protection disabled (JWT_COOKIE_CSRF_PROTECT = False)')
pdf.bullet('CORS allows all origins (CORS_ORIGINS = [\'*\'])')
pdf.bullet('Registration endpoint open -- no admin-only gate in current deployment')
pdf.bullet('JWT secret falls back to hardcoded string if SESSION_SECRET env var not set')


# ==============================================================================
# SECTION 12 -- WHAT IS NOT YET BUILT
# ==============================================================================
pdf.section_title(12, 'What Is Not Yet Built')

pdf.sub_title('Planned ML Models (status = "planned" in registry)')
models = [
    ('bp_trajectory', 'XGBoost Regression', 'aarogyanet_visits', 'Predict future BP systolic from longitudinal visit history'),
    ('outbreak_risk', 'Time-series Anomaly', 'hmis', 'Village-level outbreak probability from HMIS patterns'),
    ('adherence_predictor', 'XGBoost Classifier', 'aarogyanet_visits', 'Likelihood of next-visit medication miss'),
]
cols = [('Model Key', 38), ('Algorithm', 35), ('Dataset', 35), ('Target', 64)]
pdf.table_header(cols)
for i, r in enumerate(models):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))

pdf.sub_title('Feature Gaps Identified from Code Analysis')
gaps = [
    'Real notifications -- notification_service.py only prints to console; no SMS, push, or WhatsApp delivery',
    'Real PHC directory -- 3 hardcoded entries; no integration with government health facility registry',
    'ASHA supervisor role -- referenced in escalation targets but no supervisor user type or dashboard exists',
    'Patient-level diabetes risk history -- AI predictions are stateless (not stored in DB against patient record)',
    'Doctor-to-patient direct messaging -- no messaging system despite notification infrastructure hooks',
    'Patient appointment scheduling -- followup_date field exists in prescriptions but no scheduling feature',
    'GPS auto-capture in visit wizard -- browser Geolocation API referenced but not fully wired',
    'Heart disease risk model -- UCI dataset profiled and present in raw/ but no model built',
    'NFHS-5 / HMIS dataset models -- datasets profiled; schemas defined; no training pipelines yet',
    'Admin dashboard -- admin role has full access but no dedicated admin UI',
    'Offline visit recording -- SQLite handles offline emergencies but not offline visits',
    'Multi-language support -- all UI in English; platform targets Hindi-speaking ASHA workers',
    'Report / export feature -- no PDF generation for prescriptions or patient summaries',
    'Additional GCPE protocols -- only hypertension_protocol.json exists; diabetes, COPD absent',
]
for g in gaps:
    pdf.bullet(g)


# ==============================================================================
# SECTION 13 -- KNOWN ISSUES
# ==============================================================================
pdf.add_page()
pdf.section_title(13, 'Known Issues & Incomplete Areas')

pdf.sub_title('Browser Console Errors (Pre-existing)')
pdf.code_block([
    'allQueue.filter is not a function        (doctor_dashboard.html:430)',
    '(alerts || []).filter is not a function  (doctor_dashboard.html:854)',
    'Dashboard load error: {}',
])
pdf.body('These fire when the doctor dashboard loads before authentication resolves. '
         'The API returns a non-array response and .filter() is called without defensive type-checking.')

pdf.sub_title('Code-Level Issues')
issues = [
    ('requirements.txt', 'flask listed three times (lines 1, 11, 12) -- redundant duplicates'),
    ('config.py', 'SECRET_KEY and JWT_SECRET_KEY both fall back to the same hardcoded string if env var unset'),
    ('utils/auth.py', 'Uses SHA-256 + salt, not bcrypt -- passwords are less secure than industry standard'),
    ('notification_service.py', 'All notification dispatch is print() calls only -- no real delivery mechanism'),
    ('emergency_service.py', 'PHC contacts hardcoded for 3 villages; all others get a single default entry'),
    ('routes/token_routes.py', 'GET /api/tokens/my queries patients WHERE doctor_id=%s but patients table has no doctor_id column'),
    ('doctor_dashboard.html', 'loadDiabetesSignal() submits mostly zero-valued features (glucose=0, BMI=0) -- confidence threshold rarely met'),
    ('database/postgres.py', 'No connection pooling -- each request opens and closes a new psycopg2 connection'),
    ('blockchain/mining.py', 'PoW is synchronous -- high-BP visits under load could increase response latency'),
    ('models/__init__.py', 'Root models/ package is empty -- leftover SQLAlchemy scaffolding, not used'),
]
cols = [('File', 55), ('Issue', 117)]
pdf.table_header(cols)
for i, r in enumerate(issues):
    pdf.table_row(list(r), cols, alt=(i % 2 == 1))

pdf.sub_title('Hardcoded Demo Data')
pdf.bullet('MOCK_PHC_CONTACTS: 3 hardcoded PHC names and phone numbers (Rampur, Sundarpur, Bhatpur)')
pdf.bullet('EMERGENCY_HELPLINE: hardcoded "National Emergency -- 112"')
pdf.bullet('ASHA supervisor contact: hardcoded 9800000000 in all escalation targets')
pdf.bullet('Demo credentials: admin/admin123, dr_rajan/doc123, asha_priya/asha123, patient_ram/pat123')

# -- Diabetes Model Performance Summary ----------------------------------------
pdf.ln(4)
pdf.sub_title('Appendix: Diabetes Risk Model Performance (v1.0.0)')
pdf.body('Trained on Pima Indians Diabetes Database (768 rows, 8 features, 70/15/15 split):')
pdf.ln(2)
pdf.metric_row([
    ('AUC-ROC', '0.8503', C_GREEN),
    ('Sensitivity', '82.5%', C_GREEN),
    ('Specificity', '77.6%', C_BLUE),
    ('F1 Score', '0.7333', C_AMBER),
    ('Brier Score', '0.154', C_GRAY),
])

pdf.sub_title('SHAP Global Feature Importance')
feats = [
    ('glucose', 0.7539, C_RED),
    ('age', 0.3872, C_BLUE),
    ('bmi', 0.3788, C_BLUE),
    ('diabetes_pedigree', 0.2461, C_ACCENT),
    ('insulin', 0.2036, C_AMBER),
    ('pregnancies', 0.1071, C_GRAY),
    ('skin_thickness', 0.1016, C_GRAY),
    ('blood_pressure', 0.0495, C_GRAY),
]
bar_max = 100
for fname, val, color in feats:
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*C_DARK)
    pdf.cell(36, 5, fname)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*color)
    bar_w = int(val * bar_max)
    pdf.set_fill_color(*color)
    pdf.rect(pdf.get_x(), pdf.get_y() + 1, bar_w, 3.5, style='F')
    pdf.set_x(pdf.get_x() + bar_w + 2)
    pdf.set_text_color(*C_DARK)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.cell(0, 5, str(val), new_x=XPos.LMARGIN, new_y=YPos.NEXT)


# -- Save ----------------------------------------------------------------------
output_path = '/home/runner/workspace/AarogyaNet_Technical_Report.pdf'
pdf.output(output_path)
print(f'PDF saved: {output_path}')
print(f'Pages: {pdf.page}')
