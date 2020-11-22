TILETYPES = [
]

def get_buildables(tiles):
    return TILETYPES

def create_tile(type):
    return next(filter(lambda x: x["name"] == type, TILETYPES),None).copy()
