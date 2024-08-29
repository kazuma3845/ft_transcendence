# config.py

# Variable de configuration
DEBUG = True

DEBUG_CATEGORIES = {
    "REQUEST": True,
    "HIT": False,        # Activer/Désactiver les messages liés aux "hits"
    "REBOUND": False,    # Activer/Désactiver les messages liés aux rebonds
    "FINAL_POS": False,  # Activer/Désactiver les messages liés à la position finale
    "PONDERATORS": False,
    "CORRECTION": False,
    "INPUT": True,
}

# Codes de style ANSI
RESET = "\033[0m"
BOLD = "\033[1m"
ITALIC = "\033[3m"
UNDERLINE = "\033[4m"

# Codes de couleur du texte ANSI
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"
WHITE = "\033[37m"

# Codes de couleur de fond ANSI
BG_RED = "\033[41m"
BG_GREEN = "\033[42m"
BG_YELLOW = "\033[43m"
BG_BLUE = "\033[44m"
BG_MAGENTA = "\033[45m"
BG_CYAN = "\033[46m"
BG_WHITE = "\033[47m"

# Fonction de logging
def log(message, level="default", category=None):
    if not DEBUG:
        return
    
    if category and not DEBUG_CATEGORIES.get(category, False):
        return  # Ne pas afficher ce message si la catégorie est désactivée
    
    if level == "info":
        print(f"{BLUE}{BOLD}INFO:{RESET} {message}{RESET}")
    elif level == "warning":
        print(f"{YELLOW}{BOLD}WARNING:{RESET} {ITALIC}{message}{RESET}")
    elif level == "error":
        print(f"{RED}{BOLD}ERROR:{RESET} {message}{RESET}")
    elif level == "title":
        print(f"{MAGENTA}{BOLD}{message}{RESET}")
    elif level == "default":
        print(message)