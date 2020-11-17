#!/usr/bin/env python3

from fastapi import FastAPI
from binretriever import *
import asyncio

app = FastAPI()
binretriever = BinRetriever()

@app.get("/bincoords/")
async def output_bin_coords(lat: float = 91, lon: float = 181, rng_lat: float = 0.001, returnall: bool = False):
	return_value = False
	if returnall:
		return_value = binretriever.bins
	elif abs(lat) <= 90 or abs(lon) <= 180:
		return_value = binretriever.near(lat, lon, rng_lat)
	return return_value



if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app)
