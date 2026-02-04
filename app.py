import datetime as dt
import json
import sqlite3
from http import HTTPStatus

from flask import Flask, request, jsonify, make_response

app = Flask(__name__)

conn = sqlite3.connect('data.db', check_same_thread=False)
conn.execute(
    """
    CREATE TABLE IF NOT EXISTS round
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        desc TEXT NOT NULL
    );""")
conn.execute("""
    CREATE TABLE IF NOT EXISTS vote
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        guilty INTEGER NOT NULL CHECK(guilty >= 0 AND guilty <= 1),
        datetime TEXT NOT NULL,
        FOREIGN KEY(round_id) REFERENCES round(id)
    );
    """
)
conn.execute("""
    INSERT OR REPLACE INTO round (id, desc) VALUES (1, 'test');
""")
conn.commit()

# https://stackoverflow.com/questions/25594893/how-to-enable-cors-in-flask
def _corsify(response):
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    return response

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

@app.route("/rounds")
def rounds():
    SELECT_ROUNDS = "SELECT * FROM round;"
    rounds = conn.execute(SELECT_ROUNDS).fetchall()
    obj = []
    for id_, desc in rounds:
        obj.append(dict(id=id_, desc=desc))
    return _corsify(jsonify(obj))

@app.route("/create-round", methods=["POST", "OPTIONS"])
def create_round():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    data = json.loads(request.data.decode())
    if "description" not in data:
        return "missing `description` field in request", HTTPStatus.BAD_REQUEST
    description = data["description"]

    INSERT_ROUND = """INSERT INTO round (desc) VALUES (?);"""
    conn.execute(INSERT_ROUND, (description, ))
    conn.commit()
    return _corsify(make_response("created", HTTPStatus.CREATED))

INSERT_VOTE = """INSERT INTO vote (round_id, guilty, datetime) VALUES (?, ?, ?);"""

@app.route("/vote", methods=["POST", "OPTIONS"])
def coupable():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    data = json.loads(request.data.decode())
    print(data)
    if "round_id" not in data:
        return "missing `round_id` field in request", HTTPStatus.BAD_REQUEST
    round_id = data["round_id"]
    guilty = data["guilty"]
    conn.execute(INSERT_VOTE, (round_id, int(guilty), dt.datetime.now().isoformat()))
    conn.commit()
    return _corsify(make_response("created", HTTPStatus.CREATED))
