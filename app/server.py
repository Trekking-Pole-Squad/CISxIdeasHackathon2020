#!/usr/bin/env python3

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/webclient",StaticFiles(directory="webclient"))

if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app)
