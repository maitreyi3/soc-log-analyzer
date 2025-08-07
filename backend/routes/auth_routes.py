from flask import Blueprint, request, jsonify, session
from backend.models.user_model import verify_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Verify user from DB using hashed password
    if verify_user(username, password):
        session["logged_in"] = True
        session["username"] = username
        session.permanent = True
        
        print(f"Login successful - Session set: {dict(session)}")
        return jsonify({"message": "Login successful"}), 200

    print("Login failed - Invalid credentials")
    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route("/check_login", methods=["GET"])
def check_login():
    logged_in = session.get("logged_in", False)
    username = session.get("username", None)
    
    print(f"Check login - Session: {dict(session)}")
    print(f"Logged in status: {logged_in}")
    
    return jsonify({
        "logged_in": logged_in,
        "username": username
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    print(f"Logout - Session before clear: {dict(session)}")
    session.clear()
    print(f"Logout - Session after clear: {dict(session)}")
    return jsonify({"message": "Logged out successfully"}), 200
