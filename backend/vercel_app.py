from starlette.applications import Starlette
from starlette.routing import Mount

# Import the existing FastAPI app
from backend.main import app as bug_app

# Mount the FastAPI app under '/api' so requests to /api/* are forwarded correctly
app = Starlette(routes=[Mount('/api', bug_app)])
