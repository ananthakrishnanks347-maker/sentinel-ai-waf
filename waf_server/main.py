import json
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from rules import quick_signature_check

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.middleware("http")
async def waf_middleware(request: Request, call_next):
    if request.url.path.startswith("/ws"):
        return await call_next(request)

    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8", errors="ignore")

    # Re-inject body stream for downstream route handlers
    async def receive():
        return {"type": "http.request", "body": body_bytes}

    request = Request(request.scope, receive=receive)

    # Execute rules check
    waf_result = quick_signature_check(payload=body_str, path=request.url.path)

    is_threat = waf_result.get("is_threat", False)
    threat_type = waf_result.get("threat_type", "Clean")
    confidence = waf_result.get("confidence", 0.0)
    payload_preview = body_str if body_str else request.url.path

    if is_threat:
        log_data = {
            "status": "BLOCKED 403",
            "method": request.method,
            "path": request.url.path,
            "threat_type": threat_type,
            "payload": payload_preview
        }
        await manager.broadcast(log_data)
        print(f"\033[91m[WAF BLOCKED]\033[0m Path: {request.url.path} | Threat: {threat_type} | Confidence: {confidence}")
        
        return JSONResponse(
            status_code=403,
            content={"status": "blocked", "reason": threat_type, "confidence": confidence}
        )

    response = await call_next(request)
    
    log_data = {
        "status": f"ALLOWED {response.status_code}",
        "method": request.method,
        "path": request.url.path,
        "threat_type": "Clean",
        "payload": "-"
    }
    await manager.broadcast(log_data)
    print(f"\033[92m[WAF ALLOWED]\033[0m Path: {request.url.path}")
    
    return response

@app.get("/api/v1/products")
async def get_products():
    return {"status": "passed_waf", "message": "Request allowed by WAF"}

@app.post("/login")
async def login():
    return {"status": "passed_waf"}

@app.post("/comment")
async def comment():
    return {"status": "passed_waf"}

@app.get("/etc/passwd")
async def passwd():
    return {"status": "passed_waf"}

@app.post("/ai-agent")
async def ai_agent():
    return {"status": "passed_waf"}
