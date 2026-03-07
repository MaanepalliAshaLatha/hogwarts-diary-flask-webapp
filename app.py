from flask import Flask, request, jsonify
from flask import  redirect, render_template,session
from database import db
from models import Diary,User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)
# CHANGE PASSWORD HERE
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:Mysql%40123@localhost/hogwarts_diary"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = "hogwarts_secret_key"

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/diary", methods=["POST"])
def add_diary():
    if "user_id" not in session:
        return {"error": "Unauthorized"}, 401

    data = request.json
    entry = Diary(
        user_id=session["user_id"],  # IMPORTANT
        date=data["date"],
        title=data["title"],
        content=data["content"]
    )
    if not "date" or not "title" or not "content":
        return {"error": "The parchment is incomplete. Fill every spell line."}, 400

    db.session.add(entry)
    db.session.commit()
    return {"message": "Saved"}


@app.route("/diary", methods=["GET"])
def get_diary():
    if "user_id" not in session:
        return {"error": "Unauthorized"}, 401

    entries = Diary.query.filter_by(user_id=session["user_id"]).all()
    return jsonify([
        {"id": e.id, "date": str(e.date), "title": e.title, "content": e.content}
        for e in entries
    ])

@app.route("/diary/<int:entry_id>", methods=["DELETE"])
def delete_diary(entry_id):
    if "user_id" not in session:
        return {"error": "Unauthorized"}, 401

    entry = Diary.query.filter_by(id=entry_id, user_id=session["user_id"]).first()

    if not entry:
        return {"error": "Not found"}, 404

    db.session.delete(entry)
    db.session.commit()

    return {"message": "Deleted"}

@app.route("/diary/<int:entry_id>", methods=["PUT"])
def update_diary(entry_id):
    if "user_id" not in session:
        return {"error": "Unauthorized"}, 401

    entry = Diary.query.filter_by(
        id=entry_id,
        user_id=session["user_id"]
    ).first()

    if not entry:
        return {"error": "Entry not found"}, 404

    data = request.json

    entry.date = data.get("date")
    entry.title = data.get("title")
    entry.content = data.get("content")

    db.session.commit()

    return {"message": "Updated successfully"}, 200

def is_valid_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[!@#$%^&*]", password):
        return False
    return True

@app.route("/signup", methods=["GET", "POST"])
def signup():
    error = None

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            error = "This wizard already exists in Hogwarts records."
            return render_template("signup.html", error=error)

        if not is_valid_password(password):
            error = "Password must contain 8 characters, uppercase, lowercase, number and special symbol"
            return render_template("signup.html", error=error)

        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return redirect("/signin")

    return render_template("signup.html", error=error)

@app.route("/signin", methods=["GET", "POST"])
def signin():
    error = None

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            session["user_id"] = user.id
            return redirect("/dashboard")
        else:
            error = "Wrong spell! The castle does not recognize you."

    return render_template("signin.html", error=error)

@app.route("/account", methods=["GET"])
def account_info():
    if "user_id" not in session:
        return {"error": "Unauthorized"}, 401

    user = User.query.get(session["user_id"])

    return jsonify({
        "id": user.id,
        "username": user.username
    })

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect("/signin")

    return render_template("index.html")

@app.route("/logout")
def logout():
    session.pop("user_id", None)
    return redirect("/signin")


if __name__ == "__main__":
    app.run(debug=True)