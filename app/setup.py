import pickle
from hashlib import sha512
from users import User

def create_users_file():
    users = [User("ryan",sha512(b"password").hexdigest())]
    pickle.dump(users,open("users.pickle","wb+"))

def get_users():
    return pickle.load(open("users.pickle","rb"))


print(get_users()[0].name,get_users()[0].sha512_password,get_users()[0].token)