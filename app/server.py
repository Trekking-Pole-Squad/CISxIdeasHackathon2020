#!/usr/bin/env python3

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from binretriever import *
from users import *
import asyncio

app = FastAPI()
binretriever = BinRetriever()
users = Users()

@app.get("/gettoken/")
async def output_token(username: str = "", sha512_password: str = ""):
    return_value = False
    if users.auth_password(username, sha512_password):
        users.create_token(username)
        return_value = {"token":users.token_from_user(username)}
    return return_value

@app.get("/bincoords/")
async def output_bin_coords(lat: float = 91, lon: float = 181, rng_lat: float = 0.001, returnall: bool = False):
    return_value = False
    if returnall:
        return_value = binretriever.bins
    elif abs(lat) <= 90 or abs(lon) <= 180:
        return_value = binretriever.near(lat, lon, rng_lat)
    return return_value

@app.get("/inventory/")
async def output_user_inventory(token: str = ""):
    return_value = False
    if users.auth_token(token):
        return_value = users.get_inventory(username)
    else:
        return_value = {"detail":"Not authenticated"}
    return return_value


app.mount("/webclient",StaticFiles(directory="webclient"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
