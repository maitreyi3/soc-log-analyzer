from flask import session
from backend.models.user_model import verify_user 

def login_user(username, password):
    if verify_user(username, password):
        session["logged_in"] = True
        session["username"] = username
        return True
    return False

def logout_user():
    session.clear()

def is_logged_in():
    return session.get("logged_in", False)
