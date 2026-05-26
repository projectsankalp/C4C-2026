def calculate_result(score: int, track: str) -> dict:
    """
    Evaluates the screening score and returns the severity level and tailored suggestions.
    Max possible score is 30 (10 questions, up to 3 points each).
    """
    track_display_names = {
        "attention": "Attention & Focus",
        "stress": "Stress & Exhaustion",
        "repetitive": "Repetitive Thoughts & Checking"
    }

    display_track = track_display_names.get(track, track.capitalize())

    # Recalibrated severity thresholds for 10-question scale (Max score 30)
    if score <= 10:
        level = "Low"
    elif score <= 20:
        level = "Medium"
    else:
        level = "High"

    suggestions = []

    if track == "attention":
        if level == "Low":
            suggestions = [
                "Your focus and attention patterns appear optimal. Continue maintaining your current sleep schedule.",
                "Practice light productivity exercises like the Pomodoro Technique (25 min work, 5 min break) to stay sharp.",
                "Keep working in clean, clutter-free physical workspaces."
            ]
        elif level == "Medium":
            suggestions = [
                "Try breaking down larger tasks into smaller, bite-sized checklists to maintain motivation.",
                "Minimize digital distractions by putting your phone on 'Do Not Disturb' during working hours.",
                "Take short 5-minute mindfulness or stretching breaks every hour to reset your cognitive load."
            ]
        else: # High
            suggestions = [
                "Establish strict daily routines with visual cues and time-blocking planners.",
                "Utilize distraction-blocking web browser extensions and apps during focus blocks.",
                "If attention struggles significantly affect your school, college, or work performance, consider consulting a learning specialist or physician."
            ]

    elif track == "stress":
        if level == "Low":
            suggestions = [
                "You are demonstrating good emotional resilience and stress management.",
                "Continue practicing healthy work-life boundaries and making time for hobbies.",
                "Maintain a consistent sleep pattern (7-8 hours per night)."
            ]
        elif level == "Medium":
            suggestions = [
                "Practice simple deep breathing or box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s) when feeling rushed.",
                "Establish clear boundaries and practice saying 'no' to non-essential tasks.",
                "Dedicate at least 30 minutes daily to completely unplug from emails and social media."
            ]
        else: # High
            suggestions = [
                "Prioritize immediate rest. High stress levels pose a significant risk of physical and mental burnout.",
                "Incorporate simple physical activity, like a 20-minute walk outside, to help clear cortisol from your system.",
                "Consider reaching out to a professional counselor, therapist, or supportive friend to help navigate this period."
            ]

    elif track == "repetitive":
        if level == "Low":
            suggestions = [
                "Your cognitive patterns appear calm, stable, and healthy.",
                "Maintain a regular journaling habit to externalize and process daily thoughts.",
                "Continue practicing open-minded awareness of your thoughts without over-analyzing."
            ]
        elif level == "Medium":
            suggestions = [
                "Practice redirecting your energy into highly engaging physical or creative activities (painting, sports, cooking) when loops start.",
                "Try a structured journaling method: write down your repetitive concerns, close the book, and physically set it aside for the day.",
                "Acknowledge the thoughts without fighting them—remind yourself, 'This is just a repetitive thought, I don't need to act on it.'"
            ]
        else: # High
            suggestions = [
                "Avoid trying to forcefully fight or suppress thoughts; instead, practice observing them neutrally like clouds passing.",
                "Establish a dedicated 'worry time' (e.g., 10 minutes at 5:00 PM) to contain and process these thoughts, limiting them outside that block.",
                "If repetitive loops or checking behaviors interfere with your daily peace or functioning, consider seeking support from a CBT (Cognitive Behavioral Therapy) professional."
            ]
    else:
        # Fallback suggestions
        if level == "Low":
            suggestions = ["Maintain your current positive lifestyle habits and self-care routine."]
        elif level == "Medium":
            suggestions = ["Consider incorporating daily relaxation and mindfulness practices into your routine."]
        else:
            suggestions = ["Highly suggest consulting a mental health or medical professional for tailored guidance."]

    return {
        "track": display_track,
        "level": level,
        "score": score,
        "suggestions": suggestions
    }