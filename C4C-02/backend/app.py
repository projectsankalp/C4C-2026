from flask import Flask
from flask import jsonify

from flask_cors import CORS

from analysis.session_analyzer import (
    generate_analysis_report
)

app = Flask(__name__)

CORS(app)


# -----------------------------------
# API ROUTE
# -----------------------------------

@app.route("/api/report")

def get_report():

    report = (
        generate_analysis_report()
    )

    return jsonify(report)


# -----------------------------------
# START SERVER
# -----------------------------------

if __name__ == "__main__":

    app.run(debug=True)