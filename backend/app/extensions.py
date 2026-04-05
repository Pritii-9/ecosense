from pymongo import MongoClient

_mongo_client: MongoClient | None = None
_db_name: str | None = None


def init_mongo(app) -> None:
    """Create a single Mongo client and ensure the main indexes exist."""
    global _mongo_client, _db_name

    _mongo_client = MongoClient(app.config["MONGO_URI"], serverSelectionTimeoutMS=5000)
    _db_name = app.config["MONGO_DB_NAME"]

    database = get_database()
    database.users.create_index("email", unique=True)
    database.waste_logs.create_index([("user_id", 1), ("date", -1)])
    database.auth_codes.create_index([("email", 1), ("purpose", 1)], unique=True)
    database.auth_codes.create_index("expires_at", expireAfterSeconds=0)


def get_database():
    if _mongo_client is None or _db_name is None:
        raise RuntimeError("MongoDB has not been initialized.")

    return _mongo_client[_db_name]
