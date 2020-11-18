import pickle

class User():
    def __init__(self, name, id):
        self.name = name
        self.id = id
        self.inventory = []
        
class Users():
    def __init__(self):
        self.users = pickle.load(open("users.pickle","rb"))
    
    def add(self, name, id):
        self.users.append(User(name,id))
        pickle.dump(self.users,open("users.pickle","wb+"))
        
    def get_inventory(self, id):
        return_value = False
        if id in map(lambda user: user.id,self.users):
            return_value = self.users[list(map(lambda user: user.id,self.users)).index(id)].inventory
        return return_value