"""
SellerCloudX Backend Server - FastAPI Bridge
Proxies requests to the main Express server
"""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
import httpx
import os
import subprocess
import threading
import time

app = FastAPI(title="SellerCloudX API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Main server URL
MAIN_SERVER = os.getenv("MAIN_SERVER_URL", "http://127.0.0.1:5000")

# Start main server in background
def start_main_server():
    """Start the main Express+Vite server"""
    os.chdir("/app")
    os.environ["PORT"] = "5000"
    os.environ["NODE_ENV"] = "development"
    
    print("🚀 Starting main SellerCloudX server on port 5000...")
    subprocess.run(["yarn", "dev"], cwd="/app")

# Start in background thread
server_thread = threading.Thread(target=start_main_server, daemon=True)
server_thread.start()

# Wait for server to start
time.sleep(5)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "sellercloudx-proxy"}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy(request: Request, path: str):
    """Proxy all requests to main server"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Build target URL
            url = f"{MAIN_SERVER}/{path}"
            if request.query_params:
                url += f"?{request.query_params}"
            
            # Forward request
            response = await client.request(
                method=request.method,
                url=url,
                headers=dict(request.headers),
                content=await request.body(),
                cookies=request.cookies,
            )
            
            # Return response
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
            )
    except httpx.ConnectError:
        return HTMLResponse(
            content="<h1>Server starting...</h1><p>Please wait a moment and refresh.</p>",
            status_code=503
        )
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/")
async def root():
    """Redirect to main app"""
    return RedirectResponse(url=MAIN_SERVER)
