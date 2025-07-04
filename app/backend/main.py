from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from routers import routers

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://castle-viz.vercel.app",
    "https://castle-viz-production.up.railway.app",
]

app.add_middleware(
    CORSMiddleware, 
    allow_origins = origins,
    allow_credentials=True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(routers.router)


@app.get("/")
def read_root():
    return {"Working": "Test", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"} 
