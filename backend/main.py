from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import httpx
import os

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
SYSTEM_PROMPT = '''You are a software architect. Analyze the given requirements and return ONLY a JSON object - no markdown, no code fences, no explanation outside the JSON.

Schema:
{
  "functional_requirements":[{"id":"FR1","title":"...","description":"..."}],
  "non_functional_requirements":[{"id":"NFR1","category":"Performance|Security|Scalability|Reliability|Maintainability|Usability","title":"...","description":"..."}],
  "architecture_style":{"name":"...","description":"...","rationale":"..."},
  "layers":[{"name":"Presentation|API Gateway|Business Logic|Data|Infrastructure","order":1,"components":["ExactComponentName"]}],
  "components":[{"id":"c1","name":"...","type":"Service|Database|Queue|Cache|Gateway|Frontend|External|Load Balancer|Storage|Microservice|API","layer":"LayerName","description":"...","responsibilities":["..."],"dependencies":["c2"],"tech_suggestions":["..."]}],
  "connections":[{"from":"c1","to":"c2","label":"...","type":"sync|async|data"}],
  "patterns":[{"name":"...","category":"Structural|Behavioral|Integration|Data","description":"...","applied_to":"..."}],
  "nfr_tags":[{"tag":"...","category":"Performance|Security|Scalability|Reliability|Maintainability|Usability"}],
  "reasoning":{"overall":"...","key_decisions":[{"decision":"...","rationale":"..."}]}
}

Rules: 5-12 components. Names in layers.components must match exactly the name field in components. connections.from, connections.to, and components.dependencies must use components[].id - not name. Use realistic tech. Return ONLY the JSON object.'''

if not ANTHROPIC_API_KEY:
    raise RuntimeError("ANTHROPIC_API_KEY is not set in .env or environment variables")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.post("/api/design")
async def proxy_anthropic(request: Request):
    body = await request.json()
    user_input = body.get("req")

    if not user_input:
        raise HTTPException(status_code=400, detail="Missing 'req' parameter")

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"
    }

    payload = {
        "model": "claude-sonnet-4-5",
        "max_tokens": 8000,
        "system": SYSTEM_PROMPT,
        "messages": [
            {"role": "user", "content": f"Design the software architecture for:\n\n{user_input}"}
        ]
    }

    async with httpx.AsyncClient(timeout=300) as client:
        try:
            response = await client.post(ANTHROPIC_URL, headers=headers, json=payload)

            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type="application/json"
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"Proxy error: {str(exc)}")

app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    file_path = os.path.join("frontend/dist", full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    return FileResponse("frontend/dist/index.html")
