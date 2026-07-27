import re

SQLI_PATTERNS = [
    r"'\s*or\s*",
    r"or\s+'?1'?='?1",
    r"--",
    r"union\s+select",
    r"drop\s+table",
    r"select\s+\*"
]

XSS_PATTERNS = [
    r"<script.*?>",
    r"javascript:",
    r"onerror=",
    r"onload=",
    r"<script>",
    r"alert\("
]

PATH_TRAVERSAL_PATTERNS = [
    r"\.\./",
    r"\.\.\\",
    r"/etc/passwd",
    r"c:\\windows"
]

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+previous\s+instructions",
    r"system\s+prompt",
    r"dump\s+all",
    r"disregard\s+above"
]

def quick_signature_check(payload: str = "", path: str = "") -> dict:
    target_string = f"{path} {payload}".lower()

    # Check Path Traversal
    for pattern in PATH_TRAVERSAL_PATTERNS:
        if re.search(pattern, target_string, re.IGNORECASE):
            return {"is_threat": True, "blocked": True, "threat_type": "Path Traversal", "confidence": 0.98}

    # Check SQL Injection
    for pattern in SQLI_PATTERNS:
        if re.search(pattern, target_string, re.IGNORECASE):
            return {"is_threat": True, "blocked": True, "threat_type": "SQL Injection", "confidence": 0.95}

    # Check XSS
    for pattern in XSS_PATTERNS:
        if re.search(pattern, target_string, re.IGNORECASE):
            return {"is_threat": True, "blocked": True, "threat_type": "XSS Payload", "confidence": 0.92}

    # Check AI Prompt Injection
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, target_string, re.IGNORECASE):
            return {"is_threat": True, "blocked": True, "threat_type": "AI Prompt Injection Anomaly", "confidence": 0.90}

    return {"is_threat": False, "blocked": False, "threat_type": "Clean", "confidence": 0.0}
