from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename

# ---------- Setup ----------
load_dotenv()

app = Flask(__name__)

# Allow both localhost and LAN IP frontend
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.0.196:5173"  
]}}, supports_credentials=True)

# Uploads folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db_name = os.getenv("DB_NAME", "bluecarbon")

client = MongoClient(mongo_uri)
db = client[db_name]
projects = db["projects"]
users = db["users"]

# Ensure unique wallet address
users.create_index("wallet_address", unique=True)


# ---------- Helpers ----------
def serialize_user(user):
    user["_id"] = str(user["_id"])
    return user


# ---------- Routes ----------
@app.route("/")
def home():
    return {"message": "Blue Carbon MRV Backend Running ✅"}


# -------- Login Route --------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        wallet_address = data.get("wallet_address")

        if not wallet_address:
            return jsonify({"error": "Wallet address required"}), 400

        user = users.find_one({"wallet_address": wallet_address})

        if user:
            return jsonify({"user": serialize_user(user)}), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------- File Upload --------
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    return jsonify({"url": f"http://localhost:5000/uploads/{filename}"}), 201


@app.route("/uploads/<filename>")
def serve_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


# -------- Project Routes --------
@app.route("/projects/new", methods=["POST"])
def create_project():
    try:
        data = request.json

        project = {
            "project_id": f"PRJ-{datetime.now().year}-{str(uuid.uuid4())[:8]}",
            "wallet_address": data.get("wallet_address"),
            "role": data.get("role"),
            "tree_type": data.get("tree_type"),
            "area": data.get("area"),
            "location": data.get("location"),
            "before_images": data.get("before_images", []),
            "after_images": [],
            "status": "awaiting_after_images",  # 👈 new default
            "credits": 0,
            "created_at": datetime.utcnow(),
        }

        # Role-specific fields
        if project["role"] == "individual":
            project["land_record"] = data.get("land_record")

        elif project["role"] == "ngo":
            project["org_name"] = data.get("org_name")
            project["reg_no"] = data.get("reg_no")
            project["mou"] = data.get("mou")

        elif project["role"] == "corporate":
            project["csr_budget"] = data.get("csr_budget")
            project["mou"] = data.get("mou")

        elif project["role"] == "community":
            project["community_name"] = data.get("community_name")
            project["land_proof"] = data.get("land_proof")

        projects.insert_one(project)

        project["_id"] = str(project["_id"])
        return jsonify({"message": "Project registered successfully!", "project": project}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/projects/<wallet_address>", methods=["GET"])
def get_projects(wallet_address):
    user_projects = list(projects.find({"wallet_address": wallet_address}))
    for proj in user_projects:
        proj["_id"] = str(proj["_id"])
    return jsonify({"projects": user_projects}), 200

# -------- Upload After Images --------
@app.route("/projects/<project_id>/after-images", methods=["POST"])
def upload_after_images(project_id):
    try:
        data = request.json
        after_images = data.get("after_images", [])

        if not after_images:
            return jsonify({"error": "No images provided"}), 400

        result = projects.update_one(
            {"project_id": project_id},
            {"$set": {"after_images": after_images, "status": "pending"}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Project not found"}), 404

        return jsonify({"message": "After images uploaded successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------- Main ----------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
