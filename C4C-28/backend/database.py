import sqlite3
import os
import click
from flask import g, current_app

def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    db = getattr(g, '_database', None)
    if db is None:
        # Get path to db file
        db_path = os.path.join(current_app.root_path, current_app.config['DATABASE_NAME'])
        
        # Connect to SQLite
        db = g._database = sqlite3.connect(
            db_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        # Return rows as dictionary-like objects
        db.row_factory = sqlite3.Row

    return db

def close_db(e=None):
    """Closes the database again at the end of the request."""
    # e is explicitly ignored
    _ = e
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Initializes the database using schema.sql."""
    db = get_db()
    schema_path = os.path.join(current_app.root_path, 'schema.sql')
    
    with current_app.open_resource(schema_path, mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

def init_app(app):
    """Register database functions with the Flask app."""
    app.teardown_appcontext(close_db)
    
    @app.cli.command('init-db')
    def init_db_command():
        """Clear the existing data and create new tables."""
        init_db()
        click.echo('Initialized the database.')
