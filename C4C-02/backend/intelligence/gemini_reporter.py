import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

class GeminiReporter:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_id = self._verify_model()

    def _verify_model(self):
        """Automatically finds a working model name for your API key."""
        try:
            available = [m.name for m in self.client.models.list()]
            for name in ["gemini-1.5-flash", "models/gemini-1.5-flash", "gemini-1.5-pro"]:
                if name in available: return name
            return available[0]
        except: return "gemini-1.5-flash"

    def generate_report(self, biomechanical_report_text):
        """
        Accepts the REAL text summary from session_analyzer and 
        generates a professional scientific interpretation.
        """
        prompt = f"""
        You are a Biomechanics Research Assistant.
        Task: Provide a technical summary of the following gait analysis session.
        Language: Professional, scientific, cautious. No medical diagnoses.

        SESSION DATA:
        {biomechanical_report_text}

        Please provide:
        1. A summary of biomechanical performance.
        2. Observations on gait stability and symmetry.
        3. Mobility insights based on the range of motion and speed.
        4. Observations on diabetic peripheral neuropathy indicators.
        5. Any potential concerns or areas for further analysis.
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            return response.text
        except Exception as e:
            return f"Error analyzing real data: {str(e)}"