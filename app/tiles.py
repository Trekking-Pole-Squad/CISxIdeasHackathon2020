TILETYPES = [
]

def get_buildables(tiles):
    return TILETYPES

def get_tile_by_type(type):
    return next(filter(lambda x: x["name"] == type, TILETYPES),None)

def create_tile(type):
    return get_tile_by_type(type).copy()
