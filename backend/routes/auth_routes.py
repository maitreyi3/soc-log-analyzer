from flask import Blueprint, request, jsonify, session
from backend.models.user_model import verify_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    print("DEBUG: raw data:", data)

    username = data.get("username")
    password = data.get("password")
    print("DEBUG: username:", username)
    print("DEBUG: password:", password)
    result = verify_user(username, password)
    print("DEBUG: verify_user result:", result)
    # Verify user from DB using hashed password
    if verify_user(username, password):
        session["logged_in"] = True
        session["username"] = username
        session["role"] = "admin" if username == "admin" else "test"
        session.permanent = True
        
        return jsonify({"message": "Login successful"}), 200

    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route("/check_login", methods=["GET"])
def check_login():
    logged_in = session.get("logged_in", False)
    username = session.get("username", None)
    role = session.get("role", None)

    return jsonify({
        "logged_in": logged_in,
        "username": username,
        "role": role
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200
