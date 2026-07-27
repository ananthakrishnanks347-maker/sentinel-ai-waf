import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("AGENT_ROUTER_KEY"),
    base_url="https://agentrouter.org/v1"
)

def analyze_payload_with_ai(payload: str, headers: dict) -> dict:
    prompt = f"""
    Analyze the following HTTP request payload and headers for potential cyber attacks (OWASP Top 10, Zero-day anomalies, SSRF, RCE, Command Injection).
    
    Headers: {headers}
    Payload: {payload}

    Respond ONLY in valid JSON format with no markdown blocks:
    {{
        "is_threat": true/false,
        "threat_type": "None" or category,
        "confidence_score": 0.0 to 1.0,
        "reasoning": "brief explanation"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1].replace("json", "").strip()
        return json.loads(content)
    except Exception as e:
        return {"is_threat": False, "threat_type": "API Error", "confidence_score": 0.0, "reasoning": str(e)}
