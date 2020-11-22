#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
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
        buildables:bool=False,
        points:bool=False):
    if users.auth_token(token):
        return_value = {}
        username = users.user_from_token(token)
        if tiles:
            return_value["tiles"] = users.get_tiles(username)
        if inventory:
            return_value["inventory"] = users.get_inventory(username)
        if buildables:
            return_value["buildables"] = users.get_buildables(username)
        if points:
            return_value["points"] = users.get_points(username)
        return return_value
    else: raise HTTPException(status_code=403)

class RequestBuildNew(BaseModel):
    tile: int
    type: str
@app.put("/buildnew/")
async def build_new_tile(token:str,body:RequestBuildNew):
    if users.auth_token(token):
        name = users.user_from_token(token)
        try:
            users.create_in_inventory(name,body.type)
            users.swap_tile_inventory(name,body.tile,-1) # last appended item
            return await get_user_tiles(token,tiles=True,inventory=True,points=True)
        except GameError as e:
            raise HTTPException(status_code=403,detail="Not Enough Points")
class RequestSwapTile(BaseModel):
    tile: int
    inventory: int
@app.put("/swaptile/")
async def swap_tile(token:str,body:RequestSwapTile):
    if users.auth_token(token):
        users.swap_tile_inventory(users.user_from_token(token),body.tile,body.inventory)
        return await get_user_tiles(token,tiles=True,inventory=True)

app.mount("/webclient",StaticFiles(directory="webclient"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
