#!/usr/bin/env python3

from fastapi import FastAPI
from bins.get_bin import Get_Bin
import asyncio

app = FastAPI()
get_bin = Get_Bin()

@app.get("/bincoords/")
async def output_bin_coords(lat: int = 91, lon: int = 181, rng_lat: int = 0.001):
	return_value = False
	if abs(lat) <= 90 or abs(lon) <= 180:
		return_value = get_bin.near(lat, lon, rng_lat)
	return return_value



if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app)
