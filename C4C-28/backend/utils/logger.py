import logging
from logging.handlers import RotatingFileHandler
import os

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Common format: [2026-05-25 14:30:12] [INFO] message
formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

def _setup_logger(name, log_file, level=logging.INFO):
    """Function setup as many loggers as you want"""
    handler = RotatingFileHandler(os.path.join(LOG_DIR, log_file), maxBytes=5*1024*1024, backupCount=2)
    handler.setFormatter(formatter)

    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid duplicate logs if calling setup multiple times
    if not logger.handlers:
        logger.addHandler(handler)
        
    return logger

# Centralized Loggers
app_logger = _setup_logger('app_logger', 'app.log')
auth_logger = _setup_logger('auth_logger', 'auth.log')
aqi_logger = _setup_logger('aqi_logger', 'aqi.log')
alert_logger = _setup_logger('alert_logger', 'alert.log')
hardware_logger = _setup_logger('hardware_logger', 'hardware.log')
error_logger = _setup_logger('error_logger', 'error.log', level=logging.ERROR)
