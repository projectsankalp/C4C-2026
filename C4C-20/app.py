"""
AarogyaNet — Main Flask application entry point.

Architecture:
  - Flask 3.x with Blueprint-based modular routing
  - JWT auth (flask-jwt-extended)
  - PostgreSQL primary + SQLite offline sync
  - Custom Python blockchain (SHA-256 + ECDSA + PoW)
  - GCPE protocol engine + AI risk scoring
"""
import os
import sys

# Add project root to path so imports work
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, redirect, render_template, request, jsonify, session
from flask_cors import CORS
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt_identity, get_jwt, unset_jwt_cookies

from config import Config

def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config.from_object(Config)
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
    app.config['JWT_COOKIE_SECURE'] = False
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    app.config['JWT_ACCESS_COOKIE_NAME'] = 'aarogyanet_token'

    # Extensions
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)
    jwt = JWTManager(app)

    # ── Initialise databases ──────────────────────────────────────
    from database.postgres import init_db
    from database.sqlite_sync import init_sqlite
    try:
        init_db()
    except Exception as e:
        print(f"[ERROR] PostgreSQL init failed: {e}")
    try:
        init_sqlite()
    except Exception as e:
        print(f"[WARNING] SQLite init failed: {e}")

    # ── Register API blueprints ───────────────────────────────────
    from routes.auth_routes import auth_bp
    from routes.patient_routes import patient_bp
    from routes.visit_routes import visit_bp
    from routes.blockchain_routes import blockchain_bp
    from routes.prescription_routes import prescription_bp
    from routes.risk_routes import risk_bp
    from routes.gcpe_routes import gcpe_bp
    from routes.longitudinal_routes import longitudinal_bp
    from routes.token_routes import token_bp
    from routes.emergency_routes import emergency_bp
    from routes.absence_routes import absence_bp
    from routes.cluster_routes import cluster_bp
    from routes.ai_routes import ai_bp

    for bp in [auth_bp, patient_bp, visit_bp, blockchain_bp,
               prescription_bp, risk_bp, gcpe_bp, longitudinal_bp,
               token_bp, emergency_bp, absence_bp, cluster_bp, ai_bp]:
        app.register_blueprint(bp)

    # ── Template context: inject current_user from Flask session ──
    def get_current_user():
        """Try to extract user from Flask session for template rendering."""
        from flask import session as flask_session
        uid = flask_session.get('user_id')
        if uid:
            return type('User', (), {
                'id': uid,
                'role': flask_session.get('user_role', ''),
                'full_name': flask_session.get('user_full_name', ''),
            })()
        return None

    # ── Frontend page routes (Jinja2 templates) ───────────────────

    @app.route('/')
    def index():
        return render_template('index.html', layout='app')

    @app.route('/login')
    def login_page():
        return render_template('login.html', layout='login')

    @app.route('/logout')
    def logout():
        from flask import session as flask_session
        flask_session.clear()
        response = redirect('/login')
        unset_jwt_cookies(response)
        return response

    @app.route('/asha')
    def asha_dashboard():
        return render_template('asha_dashboard.html', layout='app')

    @app.route('/asha/new-visit')
    def asha_new_visit():
        return render_template('asha_dashboard.html', layout='app')

    @app.route('/doctor')
    def doctor_dashboard():
        return render_template('doctor_dashboard.html', layout='app')

    @app.route('/patient')
    def patient_dashboard():
        return render_template('patient_dashboard.html', layout='app')

    @app.route('/blockchain')
    def blockchain_page():
        return render_template('blockchain.html', layout='app')

    @app.route('/heatmap')
    def heatmap_page():
        return render_template('heatmap.html', layout='app')

    @app.route('/longitudinal')
    def longitudinal_page():
        return render_template('longitudinal.html', layout='app')

    @app.route('/surveillance')
    def surveillance_page():
        return render_template('surveillance.html', layout='app')

    @app.route('/emergency')
    def emergency_page():
        return render_template('emergency.html', layout='app')

    @app.route('/prescription')
    def prescription_page():
        return render_template('prescription.html', layout='app')

    @app.route('/admin')
    def admin_page():
        return render_template('admin.html', layout='app')

    # ── Health check ──────────────────────────────────────────────
    @app.route('/healthz')
    def health():
        return jsonify({'status': 'ok', 'app': 'AarogyaNet'})

    # ── Error handlers ────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Not found'}), 404
        return redirect('/')

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

    return app


app = create_app()

if __name__ == '__main__':
    port = Config.PORT
    print(f"[AarogyaNet] Starting on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
