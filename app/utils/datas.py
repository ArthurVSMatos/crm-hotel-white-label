from datetime import datetime
#agora
def now():
    return datetime.now()
#data formato iso
def iso():
    return datetime.now().isoformat()