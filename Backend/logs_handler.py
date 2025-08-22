import logging

# ANSI color codes
COLORS = {
    "DEBUG": "\033[94m",     # Blue
    "INFO": "\033[92m",      # Green
    "WARNING": "\033[93m",   # Yellow
    "ERROR": "\033[91m",     # Red
    "CRITICAL": "\033[95m",  # Magenta
    "RESET": "\033[0m"       # Reset
}

class ColorFormatter(logging.Formatter):
    def format(self, record):
        log_color = COLORS.get(record.levelname, COLORS["RESET"])
        message = super().format(record)
        return f"{log_color}{message}{COLORS['RESET']}"

handler = logging.StreamHandler()
handler.setFormatter(ColorFormatter("%(levelname)s - %(message)s"))

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logger.addHandler(handler)
