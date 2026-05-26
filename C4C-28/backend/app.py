from flask import Flask
from flask_cors import CORS
from config import Config
import database
from utils.responses import success_response

def create_app(test_config=None):
    """Create and configure the Flask application."""
    app_instance = Flask(__name__, instance_relative_config=True)
    app_instance.config.from_object(Config)

    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app_instance.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app_instance.config.from_mapping(test_config)

    # Enable CORS
    CORS(app_instance)

    # Initialize Database connection & CLI commands
    database.init_app(app_instance)

    # Simple Health Check Route
    @app_instance.route('/health', methods=['GET'])
    def health_check():
        return success_response("Swachh Vayu Backend is running", data={
            "database_connected": True,
            "version": "1.0.0"
        })

    from utils.error_handler import register_error_handlers
    register_error_handlers(app_instance)

    # Register blueprints (future routes will go here)
    from routes.auth_routes import auth_bp
    from routes.node_routes import node_bp
    from routes.aqi_routes import aqi_bp
    from routes.alert_routes import alert_bp
    from routes.map_routes import map_bp
    from routes.language_routes import language_bp
    from routes.ranking_routes import ranking_bp
    from routes.health_routes import health_bp
    from routes.sarvam_routes import sarvam_bp
    from routes.prediction_routes import prediction_bp
    from routes.agri_routes import agri_bp

    app_instance.register_blueprint(auth_bp)
    app_instance.register_blueprint(node_bp)
    app_instance.register_blueprint(aqi_bp)
    app_instance.register_blueprint(alert_bp)
    app_instance.register_blueprint(map_bp)
    app_instance.register_blueprint(language_bp)
    app_instance.register_blueprint(ranking_bp)
    app_instance.register_blueprint(health_bp)
    app_instance.register_blueprint(sarvam_bp)
    app_instance.register_blueprint(prediction_bp)
    app_instance.register_blueprint(agri_bp)

    return app_instance

if __name__ == '__main__':
    app = create_app()
    app.run(debug=app.config['DEBUG_MODE'], host='0.0.0.0', port=5000)
