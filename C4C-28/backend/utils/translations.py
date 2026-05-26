"""
Temporary static translation dictionary until Sarvam AI is fully integrated.
"""

UI_TRANSLATIONS = {
    'en': {
        'dashboard_title': 'Dashboard',
        'current_aqi': 'Current AQI',
        'alerts': 'Alerts',
        'map': 'Map',
        'rankings': 'Rankings',
        'language': 'Language',
        'profile': 'Profile',
        'logout': 'Logout',
        'emergency_warning': 'Emergency Warning',
        'safe_message': 'Safe Air Quality',
        'poor_air_message': 'Poor Air Quality'
    },
    'hi': {
        'dashboard_title': 'डैशबोर्ड',
        'current_aqi': 'वर्तमान AQI',
        'alerts': 'चेतावनी',
        'map': 'नक्शा',
        'rankings': 'रैंकिंग',
        'language': 'भाषा',
        'profile': 'प्रोफ़ाइल',
        'logout': 'लॉग आउट',
        'emergency_warning': 'आपातकालीन चेतावनी',
        'safe_message': 'सुरक्षित वायु गुणवत्ता',
        'poor_air_message': 'खराब वायु गुणवत्ता'
    },
    'mr': {
        'dashboard_title': 'डॅशबोर्ड',
        'current_aqi': 'सध्याचा AQI',
        'alerts': 'अॅलर्ट्स',
        'map': 'नकाशा',
        'rankings': 'रँकिंग',
        'language': 'भाषा',
        'profile': 'प्रोफाईल',
        'logout': 'लॉगआउट',
        'emergency_warning': 'आणीबाणीची चेतावणी',
        'safe_message': 'सुरक्षित हवा गुणवत्ता',
        'poor_air_message': 'खराब हवा गुणवत्ता'
    },
    'kn': {
        'dashboard_title': 'ಡ್ಯಾಶ್ಬೋರ್ಡ್',
        'current_aqi': 'ಪ್ರಸ್ತುತ AQI',
        'alerts': 'ಎಚ್ಚರಿಕೆಗಳು',
        'map': 'ನಕ್ಷೆ',
        'rankings': 'ಶ್ರೇಣಿಗಳು',
        'language': 'ಭಾಷೆ',
        'profile': 'ಪ್ರೊಫೈಲ್',
        'logout': 'ಲಾಗ್ಔಟ್',
        'emergency_warning': 'ತುರ್ತು ಎಚ್ಚರಿಕೆ',
        'safe_message': 'ಸುರಕ್ಷಿತ ಗಾಳಿಯ ಗುಣಮಟ್ಟ',
        'poor_air_message': 'ಕಳಪೆ ಗಾಳಿಯ ಗುಣಮಟ್ಟ'
    }
}

ALERT_TEMPLATES = {
    'en': {
        'Hazardous': "Emergency Swachh Vayu Alert: Hazardous air quality detected. AQI: {aqi_value}. Stay indoors and avoid outdoor exposure.",
        'Poor': "Swachh Vayu Alert: Poor air quality detected in your area. AQI: {aqi_value}. Please avoid outdoor activity.",
        'Node Offline': "System Alert: Sensor node {node_code} is offline. Please check the device.",
        'Low Battery': "System Alert: Sensor node {node_code} battery is low. Maintenance required.",
        'Broadcast': "Swachh Vayu Admin Broadcast: {message}"
    },
    'hi': {
        'Hazardous': "आपातकालीन स्वच्छ वायु चेतावनी: खतरनाक वायु गुणवत्ता पाई गई है। AQI: {aqi_value}। घर के अंदर रहें।",
        'Poor': "स्वच्छ वायु चेतावनी: आपके क्षेत्र में खराब वायु गुणवत्ता पाई गई है। AQI: {aqi_value}। कृपया बाहरी गतिविधियों से बचें।",
        'Node Offline': "सिस्टम अलर्ट: सेंसर नोड {node_code} ऑफ़लाइन है। कृपया डिवाइस की जांच करें।",
        'Low Battery': "सिस्टम अलर्ट: सेंसर नोड {node_code} की बैटरी कम है। रखरखाव आवश्यक है।",
        'Broadcast': "स्वच्छ वायु व्यवस्थापक प्रसारण: {message}"
    },
    'mr': {
        'Hazardous': "आणीबाणी स्वच्छ वायू चेतावणी: धोकादायक हवा गुणवत्ता आढळली. AQI: {aqi_value}. घरातच राहा आणि बाहेर जाणे टाळा.",
        'Poor': "स्वच्छ वायू चेतावणी: तुमच्या परिसरात खराब हवा गुणवत्ता आढळली. AQI: {aqi_value}. कृपया बाहेरचे काम टाळा.",
        'Node Offline': "सिस्टम अलर्ट: सेन्सर नोड {node_code} ऑफलाइन आहे. कृपया डिव्हाइस तपासा.",
        'Low Battery': "सिस्टम अलर्ट: सेन्सर नोड {node_code} ची बॅटरी कमी आहे. देखभाल आवश्यक आहे.",
        'Broadcast': "स्वच्छ वायू प्रशासन ब्रॉडकास्ट: {message}"
    },
    'kn': {
        'Hazardous': "ತುರ್ತು ಸ್ವಚ್ಛ ವಾಯು ಎಚ್ಚರಿಕೆ: ಅಪಾಯಕಾರಿ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಪತ್ತೆಯಾಗಿದೆ. AQI: {aqi_value}. ಮನೆಯೊಳಗೆ ಇರಿ.",
        'Poor': "ಸ್ವಚ್ಛ ವಾಯು ಎಚ್ಚರಿಕೆ: ಕಳಪೆ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಪತ್ತೆಯಾಗಿದೆ. AQI: {aqi_value}. ದಯವಿಟ್ಟು ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಯನ್ನು ತಪ್ಪಿಸಿ.",
        'Node Offline': "ಸಿಸ್ಟಮ್ ಎಚ್ಚರಿಕೆ: ಸೆನ್ಸರ್ ನೋಡ್ {node_code} ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
        'Low Battery': "ಸಿಸ್ಟಮ್ ಎಚ್ಚರಿಕೆ: ಸೆನ್ಸರ್ ನೋಡ್ {node_code} ಬ್ಯಾಟರಿ ಕಡಿಮೆಯಾಗಿದೆ.",
        'Broadcast': "ಸ್ವಚ್ಛ ವಾಯು ನಿರ್ವಾಹಕ ಪ್ರಸಾರ: {message}"
    }
}
