from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["bluecarbon"]
users_collection = db["users"]

@app.route("/")
def home():
    return {"message": "Blue Carbon MRV Backend Running"}

# Register new user
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    wallet_address = data.get("wallet_address")

    # check if user exists
    existing = users_collection.find_one({"wallet_address": wallet_address})
    if existing:
        return jsonify({"error": "User already exists"}), 400

    new_user = {
        "wallet_address": wallet_address,
        "name": data.get("name"),
        "phone": data.get("phone"),
        "role": data.get("role"),  # individual / ngo / community
        "age": data.get("age"),
        "land_proof": data.get("land_proof", None),  # optional for NGOs
        "projects": [],
    }
    users_collection.insert_one(new_user)

    return jsonify({"message": "User registered successfully"}), 201

# Login existing user (by wallet address)
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    wallet_address = data.get("wallet_address")

    user = users_collection.find_one({"wallet_address": wallet_address})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # convert MongoDB ObjectId to string
    user["_id"] = str(user["_id"])
    return jsonify({"message": "Login successful", "user": user}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
