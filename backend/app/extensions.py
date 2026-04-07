from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import logging
import certifi

logger = logging.getLogger(__name__)

_mongo_client: MongoClient | None = None
_db_name: str | None = None


def init_mongo(app) -> None:
    """Create a single Mongo client and ensure the main indexes exist."""
    global _mongo_client, _db_name

    mongo_uri = app.config["MONGO_URI"]
    _db_name = app.config["MONGO_DB_NAME"]

    # Configure MongoDB connection with robust settings for DNS resolution issues
    # serverSelectionTimeoutMS: Increased to 15s for slow DNS resolution
    # connectTimeoutMS: Time to wait for initial connection
    # socketTimeoutMS: Time to wait for socket operations
    try:
        _mongo_client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=15000,
            connectTimeoutMS=20000,
            socketTimeoutMS=20000,
            retryWrites=True,
            retryReads=True,
            maxPoolSize=50,
            minPoolSize=10,
            tlsCAFile=certifi.where(),
        )
        # Trigger connection to verify it works
        _mongo_client.admin.command("ping")
        logger.info("Successfully connected to MongoDB")
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.error(
            "Troubleshooting tips:\n"
            "1. Check your internet connection\n"
            "2. Verify MongoDB Atlas cluster is running and accessible\n"
            "3. Try using a different DNS server (e.g., 8.8.8.8 or 1.1.1.1)\n"
            "4. Check if your network blocks MongoDB Atlas connections\n"
            "5. Verify the MONGO_URI in .env file is correct"
        )
        raise RuntimeError(f"MongoDB connection failed: {e}") from e

    database = get_database()
    database.users.create_index("email", unique=True)
    database.users.create_index([("org_id", 1), ("department", 1)])
    database.waste_logs.create_index([("user_id", 1), ("date", -1)])
    database.auth_codes.create_index([("email", 1), ("purpose", 1)], unique=True)
    database.auth_codes.create_index("expires_at", expireAfterSeconds=0)


def get_database():
    if _mongo_client is None or _db_name is None:
        raise RuntimeError("MongoDB has not been initialized.")

    return _mongo_client[_db_name]
