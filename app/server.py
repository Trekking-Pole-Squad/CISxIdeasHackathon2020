#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from users import *
import asyncio

app = FastAPI()
users = Users()

@app.get("/gettoken/")
async def output_token(username: str = "", sha512_password: str = ""):
    return_value = False
    if users.auth_password(username, sha512_password):
        users.create_token(username)
        return_value = {"token":users.token_from_user(username)}
    return return_value

@app.get("/inventory/")
async def output_user_inventory(token: str = ""):
    return_value = False
    if users.auth_token(token):
        return_value = users.get_inventory(username)
    else:
        return_value = {"detail":"Not authenticated"}
    return return_value

@app.get("/userdata/")
async def get_user_tiles(token:str="",
        tiles:bool=False,
        inventory:bool=False,
        buildables:bool=False):
    if users.auth_token(token):
        return_value = {}
        username = users.user_from_token(token)
        if tiles:
            return_value["tiles"] = users.get_tiles(username)
        if inventory:
            return_value["inventory"] = users.get_inventory(username)
        if buildables:
            return_value["buildables"] = users.get_buildables(username)
        return return_value
    else: raise HTTPException(status_code=403)

app.mount("/webclient",StaticFiles(directory="webclient"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
