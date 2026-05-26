RESOURCES = {
    "threat": [
        {
            "title": "National Cyber Crime Reporting Portal",
            "url": "https://www.cybercrime.gov.in",
            "description": "Official Government of India portal to report cyber threats, online harassment and crimes. Run by Ministry of Home Affairs."
        },
        {
            "title": "National Commission for Women",
            "url": "https://ncw.nic.in",
            "description": "NCW handles complaints related to online threats and harassment targeted at women. File a complaint directly with the commission."
        },
    ],
    "identity_attack": [
        {
            "title": "National Cyber Crime Reporting Portal",
            "url": "https://www.cybercrime.gov.in",
            "description": "Report identity-based hate and cybercrime to India's central cybercrime authority under the Ministry of Home Affairs."
        },
        {
            "title": "National Commission for Women",
            "url": "https://ncw.nic.in",
            "description": "Supports victims of identity-based online attacks, especially targeting women. Provides legal aid and complaint redressal."
        },
    ],
    "insult": [
        {
            "title": "Tele MANAS — Mental Health Helpline",
            "url": "https://telemanas.mohfw.gov.in",
            "description": "Free 24/7 mental health support by the Government of India. Call 14416 to speak with a counsellor about emotional distress caused by cyberbullying."
        },
        {
            "title": "National Cyber Crime Reporting Portal",
            "url": "https://www.cybercrime.gov.in",
            "description": "Report online insults, defamation and harassment directly to Indian cybercrime authorities."
        },
    ],
    "obscene": [
        {
            "title": "National Cyber Crime Reporting Portal",
            "url": "https://www.cybercrime.gov.in",
            "description": "Report obscene or explicit content and online abuse to India's national cybercrime portal. Supports anonymous reporting."
        },
        {
            "title": "National Commission for Women",
            "url": "https://ncw.nic.in",
            "description": "NCW specifically handles cases of obscene content targeting women online. File a complaint for immediate support."
        },
    ],
    "severe_toxicity": [
        {
            "title": "National Cyber Crime Reporting Portal",
            "url": "https://www.cybercrime.gov.in",
            "description": "For severe online abuse and harassment, report directly to India's cybercrime authority. Available 24/7 at helpline 1930."
        },
        {
            "title": "Tele MANAS — Mental Health Helpline",
            "url": "https://telemanas.mohfw.gov.in",
            "description": "Free government mental health support for victims of severe cyberbullying. Call 14416 for immediate counselling."
        },
    ],
    "toxicity": [
        {
            "title": "National Cyber Crime Reporting Portal",
            "url": "https://www.cybercrime.gov.in",
            "description": "Report toxic online behaviour and cybercrime to the official Government of India portal."
        },
        {
            "title": "Tele MANAS — Mental Health Helpline",
            "url": "https://telemanas.mohfw.gov.in",
            "description": "Speak to a trained counsellor for free if online toxicity is affecting your mental health. Call 14416 anytime."
        },
    ],
    "default": [
        {
            "title": "National Cyber Crime Reporting Portal",
            "url": "https://www.cybercrime.gov.in",
            "description": "India's official portal to report all types of cybercrime. Run by Ministry of Home Affairs. Helpline: 1930."
        },
        {
            "title": "Tele MANAS — Mental Health Helpline",
            "url": "https://telemanas.mohfw.gov.in",
            "description": "Free 24/7 government mental health support. Call 14416 if cyberbullying is affecting your wellbeing."
        },
        {
            "title": "National Commission for Women",
            "url": "https://ncw.nic.in",
            "description": "Support and legal aid for women facing online harassment, threats or abuse."
        },
    ]
}
def get_resources(category: str) -> list:
    return RESOURCES.get(category, RESOURCES["default"])
