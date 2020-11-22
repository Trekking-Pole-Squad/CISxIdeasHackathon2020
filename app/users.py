import pickle
from secrets import token_urlsafe

class User():
    def __init__(self, name, sha512_password):
        self.name = name
        self.sha512_password = sha512_password
        self.inventory = []
        self.token = False
        self.tiles = {}

class Users():
    def __init__(self):
        self.users = pickle.load(open("users.pickle","rb"))

    def add(self, name, sha512_password):
        if name not in map(lambda user: user.name, self.users):
            self.users.append(User(name, sha512_password))
            pickle.dump(self.users,open("users.pickle","wb+"))

    def names(self):
        return list(map(lambda user: user.name,self.users))

    def auth_password(self, name, sha512_password):
        return_value = False
        if (name,sha512_password) in map(lambda user: (user.name,user.sha512_password),self.users):
                return_value = True
        return return_value

    def create_token(self, name):
        self.users[list(map(lambda user: user.name, self.users)).index(name)].token = token_urlsafe(16)

    def token_from_user(self, name):
        return self.users[list(map(lambda user: user.name, self.users)).index(name)].token

    def auth_token(self, token):
        return_value = False
        if token in map(lambda user: user.token, self.users):
            return_value = True
        return return_value

    def user_from_token(self, token):
        return self.users[list(map(lambda user: user.token, self.users)).index(token)].name

    def get_inventory(self, name):
        return_value = False
        if name in map(lambda user: user.name,self.users):
            return_value = self.users[list(map(lambda user: user.name,self.users)).index(name)].inventory
        return return_value

    def get_tiles(self,name):
        user = next((u for u in self.users if u.name == name),None)
        if user is not None:
            return user.tiles