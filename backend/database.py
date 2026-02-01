"""
SellerCloudX Database Service
PostgreSQL (Production - Railway) with existing schema
"""
import os
import bcrypt
import secrets
import json
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

# Determine database type from environment
DATABASE_URL = os.getenv("DATABASE_URL", "")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/sellercloudx")

# Database type
USE_POSTGRES = DATABASE_URL.startswith("postgres")

print(f"🔧 Database Mode: {'PostgreSQL' if USE_POSTGRES else 'MongoDB'}")
if DATABASE_URL:
    print(f"🔧 DATABASE_URL: {DATABASE_URL[:30]}...")

# ==================== PostgreSQL Setup ====================
# Define pool globally (None for MongoDB mode)
pool = None

if USE_POSTGRES:
    import asyncpg
    
    async def connect_db():
        """Initialize PostgreSQL connection pool"""
        global pool
        try:
            pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            print("✅ PostgreSQL connected successfully")
            await ensure_tables()
            await seed_admin_pg()
            return True
        except Exception as e:
            print(f"❌ PostgreSQL connection error: {e}")
            return False
    
    async def ensure_tables():
        """Ensure required tables exist"""
        async with pool.acquire() as conn:
            # Create user_sessions table if not exists
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id SERIAL PRIMARY KEY,
                    token VARCHAR(255) UNIQUE NOT NULL,
                    user_id VARCHAR(255) NOT NULL,
                    user_data JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL
                )
            """)
            # Create index on token
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)
            """)
            print("✅ Tables ensured")
    
    async def seed_admin_pg():
        """Seed admin and demo partner user in PostgreSQL"""
        try:
            async with pool.acquire() as conn:
                # Seed admin
                existing = await conn.fetchrow(
                    "SELECT id FROM users WHERE username = $1", "admin"
                )
                if not existing:
                    hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
                    user_id = secrets.token_hex(12)
                    await conn.execute("""
                        INSERT INTO users (id, username, email, password, role, is_active, first_name, last_name, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """, 
                    user_id, "admin", "admin@sellercloudx.com", 
                    hashed, "admin", True, "Admin", "User", utc_now()
                    )
                    print("✅ Admin user seeded in PostgreSQL")
                else:
                    print("✅ Admin user exists in PostgreSQL")
                
                # Seed demo partner user
                partner_existing = await conn.fetchrow(
                    "SELECT id FROM users WHERE username = $1", "partner"
                )
                if not partner_existing:
                    partner_hashed = bcrypt.hashpw("partner123".encode(), bcrypt.gensalt()).decode()
                    partner_user_id = secrets.token_hex(12)
                    await conn.execute("""
                        INSERT INTO users (id, username, email, password, role, is_active, first_name, last_name, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """, 
                    partner_user_id, "partner", "partner@sellercloudx.com", 
                    partner_hashed, "partner", True, "Demo", "Partner", utc_now()
                    )
                    
                    # Create partner profile
                    partner_id = secrets.token_hex(12)
                    await conn.execute("""
                        INSERT INTO partners (id, user_id, business_name, business_category, phone, pricing_tier, is_active, ai_enabled, ai_cards_used, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        ON CONFLICT (user_id) DO NOTHING
                    """,
                    partner_id, partner_user_id, "Demo Partner Shop", "electronics", "+998901234567",
                    "premium_2026", True, True, 0, utc_now()
                    )
                    print("✅ Demo partner seeded in PostgreSQL")
                else:
                    print("✅ Demo partner exists in PostgreSQL")
                    
        except Exception as e:
            print(f"⚠️ Seed warning: {e}")

# ==================== MongoDB Setup ====================
else:
    from motor.motor_asyncio import AsyncIOMotorClient
    from bson import ObjectId
    
    client: AsyncIOMotorClient = None
    db = None
    
    async def connect_db():
        """Initialize MongoDB connection"""
        global client, db
        try:
            client = AsyncIOMotorClient(
                MONGO_URL,
                maxPoolSize=10,
                minPoolSize=1,
                serverSelectionTimeoutMS=5000
            )
            db = client.sellercloudx
            await client.admin.command('ping')
            print("✅ MongoDB connected successfully")
            await create_indexes()
            await seed_admin_mongo()
            return True
        except Exception as e:
            print(f"❌ MongoDB connection error: {e}")
            return False
    
    async def create_indexes():
        """Create MongoDB indexes"""
        try:
            await db.users.create_index("username", unique=True)
            await db.users.create_index("email", unique=True, sparse=True)
            await db.partners.create_index("user_id", unique=True)
            await db.chat_rooms.create_index("partner_id")
            await db.messages.create_index("chat_room_id")
            await db.sessions.create_index("token", unique=True)
            await db.sessions.create_index("expires_at", expireAfterSeconds=0)
            print("✅ MongoDB indexes created")
        except Exception as e:
            print(f"⚠️ Index creation warning: {e}")
    
    async def seed_admin_mongo():
        """Seed admin user in MongoDB"""
        try:
            existing = await db.users.find_one({"username": "admin"})
            if not existing:
                hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
                await db.users.insert_one({
                    "username": "admin",
                    "email": "admin@sellercloudx.com",
                    "password": hashed,
                    "role": "admin",
                    "is_active": True,
                    "first_name": "Admin",
                    "last_name": "User",
                    "created_at": utc_now()
                })
                print("✅ Admin user seeded in MongoDB")
        except Exception as e:
            print(f"⚠️ Admin seed warning: {e}")


# ==================== Helper Functions ====================

def get_pool():
    """Get the database pool (for direct access in server.py)"""
    return pool

def utc_now():
    """Get current UTC time as naive datetime (for PostgreSQL compatibility)"""
    return datetime.now(timezone.utc).replace(tzinfo=None)

def serialize_doc(doc: dict) -> dict:
    """Convert document to JSON-serializable dict"""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif hasattr(value, '__class__') and value.__class__.__name__ == 'ObjectId':
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result


def serialize_pg_row(row) -> dict:
    """Convert PostgreSQL row to dict"""
    if row is None:
        return None
    result = dict(row)
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result


# ==================== USER OPERATIONS ====================

async def create_user(username: str, email: str, password: str, role: str = "partner", **kwargs) -> dict:
    """Create new user"""
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            user_id = secrets.token_hex(12)
            try:
                await conn.execute("""
                    INSERT INTO users (id, username, email, password, role, is_active, first_name, last_name, phone, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """,
                user_id, username, email, hashed, role, True,
                kwargs.get("first_name", ""), kwargs.get("last_name", ""),
                kwargs.get("phone", ""), utc_now()
                )
            except Exception as e:
                if "duplicate" in str(e).lower():
                    raise ValueError("Username allaqachon mavjud")
                raise
            row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
            result = serialize_pg_row(row)
            if "password" in result:
                del result["password"]
            return result
    else:
        user_data = {
            "username": username,
            "email": email,
            "password": hashed,
            "role": role,
            "is_active": True,
            "first_name": kwargs.get("first_name", ""),
            "last_name": kwargs.get("last_name", ""),
            "phone": kwargs.get("phone", ""),
            "created_at": utc_now()
        }
        result = await db.users.insert_one(user_data)
        user_data["id"] = str(result.inserted_id)
        del user_data["password"]
        return serialize_doc(user_data)


async def get_user_by_username(username: str) -> Optional[dict]:
    """Get user by username"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM users WHERE username = $1", username)
            return serialize_pg_row(row)
    else:
        user = await db.users.find_one({"username": username})
        return serialize_doc(user)


async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
            return serialize_pg_row(row)
    else:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            return serialize_doc(user)
        except:
            return None


async def validate_user_password(username: str, password: str) -> Optional[dict]:
    """Validate user credentials"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM users WHERE username = $1", username)
            if not row:
                return None
            if bcrypt.checkpw(password.encode(), row["password"].encode()):
                result = serialize_pg_row(row)
                del result["password"]
                return result
            return None
    else:
        user = await db.users.find_one({"username": username})
        if not user:
            return None
        if bcrypt.checkpw(password.encode(), user["password"].encode()):
            user_dict = serialize_doc(user)
            del user_dict["password"]
            return user_dict
        return None


# ==================== SESSION OPERATIONS ====================

async def create_session(user_id: str, user_data: dict) -> str:
    """Create new session token"""
    token = secrets.token_urlsafe(32)
    # Use naive datetime for PostgreSQL (no timezone info)
    now_naive = utc_now()
    expires_at = now_naive + timedelta(days=7)
    
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO user_sessions (token, user_id, user_data, created_at, expires_at)
                VALUES ($1, $2, $3, $4, $5)
            """, token, user_id, json.dumps(user_data), now_naive, expires_at)
    else:
        await db.sessions.insert_one({
            "token": token,
            "user_id": user_id,
            "user_data": user_data,
            "created_at": utc_now(),
            "expires_at": utc_now() + timedelta(days=7)
        })
    return token


async def get_session(token: str) -> Optional[dict]:
    """Get session by token"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            # Use naive datetime for PostgreSQL comparison (DB stores naive timestamps)
            now_naive = utc_now()
            row = await conn.fetchrow(
                "SELECT * FROM user_sessions WHERE token = $1 AND expires_at > $2",
                token, now_naive
            )
            if row:
                user_data = row["user_data"]
                if isinstance(user_data, str):
                    user_data = json.loads(user_data)
                return {"user_data": user_data}
            return None
    else:
        session = await db.sessions.find_one({
            "token": token,
            "expires_at": {"$gt": utc_now()}
        })
        if session:
            return {"user_data": session.get("user_data", session)}
        return None


async def delete_session(token: str):
    """Delete session"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            await conn.execute("DELETE FROM user_sessions WHERE token = $1", token)
    else:
        await db.sessions.delete_one({"token": token})


# ==================== PARTNER OPERATIONS ====================

async def create_partner(user_id: str, **kwargs) -> dict:
    """Create partner profile"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            partner_id = secrets.token_hex(12)
            promo_code = f"SCX-{secrets.token_hex(3).upper()}"
            await conn.execute("""
                INSERT INTO partners (id, user_id, business_name, business_category, business_type,
                    phone, inn, website, monthly_revenue, is_approved, approved, is_active, ai_enabled,
                    pricing_tier, promo_code, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            """,
            partner_id, user_id, kwargs.get("business_name", "Yangi Biznes"),
            kwargs.get("business_category", "general"), kwargs.get("business_type", "yatt"),
            kwargs.get("phone", ""), kwargs.get("inn"), kwargs.get("website"),
            kwargs.get("monthly_revenue", "0"), False, False, False, False,
            "trial", promo_code, utc_now(), utc_now()
            )
            row = await conn.fetchrow("SELECT * FROM partners WHERE id = $1", partner_id)
            return serialize_pg_row(row)
    else:
        partner_data = {
            "user_id": user_id,
            "business_name": kwargs.get("business_name", "Yangi Biznes"),
            "business_category": kwargs.get("business_category", "general"),
            "business_type": kwargs.get("business_type", "yatt"),
            "phone": kwargs.get("phone", ""),
            "inn": kwargs.get("inn"),
            "website": kwargs.get("website"),
            "monthly_revenue": kwargs.get("monthly_revenue", "0"),
            "approved": False,
            "is_active": False,
            "ai_enabled": False,
            "tariff_type": "trial",
            "promo_code": f"SCX-{secrets.token_hex(3).upper()}",
            "created_at": utc_now(),
            "updated_at": utc_now()
        }
        result = await db.partners.insert_one(partner_data)
        partner_data["id"] = str(result.inserted_id)
        return serialize_doc(partner_data)


async def get_partner_by_user_id(user_id: str) -> Optional[dict]:
    """Get partner by user ID"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM partners WHERE user_id = $1", user_id)
            return serialize_pg_row(row)
    else:
        partner = await db.partners.find_one({"user_id": user_id})
        return serialize_doc(partner)


async def get_partner_by_id(partner_id: str) -> Optional[dict]:
    """Get partner by ID"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM partners WHERE id = $1", partner_id)
            return serialize_pg_row(row)
    else:
        try:
            partner = await db.partners.find_one({"_id": ObjectId(partner_id)})
            return serialize_doc(partner)
        except:
            return None


async def get_all_partners(status: str = "all") -> List[dict]:
    """Get all partners with optional filter"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            if status == "active":
                rows = await conn.fetch("SELECT * FROM partners WHERE is_active = true ORDER BY created_at DESC")
            elif status == "inactive":
                rows = await conn.fetch("SELECT * FROM partners WHERE is_active = false ORDER BY created_at DESC")
            elif status == "pending":
                rows = await conn.fetch("SELECT * FROM partners WHERE (approved = false OR approved IS NULL) ORDER BY created_at DESC")
            else:
                rows = await conn.fetch("SELECT * FROM partners ORDER BY created_at DESC")
            
            partners = []
            for row in rows:
                partner_dict = serialize_pg_row(row)
                # Get user data
                user_row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", row["user_id"])
                if user_row:
                    user_dict = serialize_pg_row(user_row)
                    if "password" in user_dict:
                        del user_dict["password"]
                    partner_dict["userData"] = user_dict
                partners.append(partner_dict)
            return partners
    else:
        query = {}
        if status == "active":
            query["is_active"] = True
        elif status == "inactive":
            query["is_active"] = False
        elif status == "pending":
            query["approved"] = False
        
        cursor = db.partners.find(query).sort("created_at", -1)
        partners = []
        async for partner in cursor:
            partner_dict = serialize_doc(partner)
            user = await get_user_by_id(partner.get("user_id"))
            partner_dict["userData"] = user
            partners.append(partner_dict)
        return partners


async def update_partner(partner_id: str, updates: dict) -> Optional[dict]:
    """Update partner"""
    updates["updated_at"] = utc_now()
    
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            set_clauses = []
            values = []
            i = 1
            for key, value in updates.items():
                # CRITICAL FIX: Keep datetime objects as-is for PostgreSQL
                # PostgreSQL's asyncpg driver handles datetime serialization automatically
                # Converting to isoformat() string causes: "expected datetime instance, got 'str'"
                set_clauses.append(f"{key} = ${i}")
                values.append(value)
                i += 1
            values.append(partner_id)
            
            try:
                await conn.execute(
                    f"UPDATE partners SET {', '.join(set_clauses)} WHERE id = ${i}",
                    *values
                )
            except Exception as e:
                print(f"Update error: {e}")
            return await get_partner_by_id(partner_id)
    else:
        try:
            await db.partners.update_one(
                {"_id": ObjectId(partner_id)},
                {"$set": updates}
            )
            return await get_partner_by_id(partner_id)
        except:
            return None


async def approve_partner(partner_id: str, admin_id: str) -> Optional[dict]:
    """Approve partner"""
    return await update_partner(partner_id, {
        "approved": True,
        "is_approved": True,
        "is_active": True,
        "ai_enabled": True,
        "approved_at": utc_now(),
        "approved_by": admin_id
    })


async def activate_partner_manual(partner_id: str, admin_id: str, tariff: str = "premium") -> Optional[dict]:
    """Manually activate partner without payment"""
    return await update_partner(partner_id, {
        "approved": True,
        "is_approved": True,
        "is_active": True,
        "ai_enabled": True,
        "pricing_tier": tariff,
        "tariff_type": tariff,
        "activated_at": utc_now()
    })


# ==================== CHAT OPERATIONS ====================
# PostgreSQL schema uses:
# - chat_rooms: id, name, type, participants (jsonb), last_message_at, is_active
# - chat_messages: id, partner_id, role, content, metadata, created_at

async def get_or_create_chat_room(partner_id: str) -> dict:
    """Get or create chat room for partner"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            # Chat rooms use participants jsonb field, not partner_id
            # Search for room where partner is in participants
            row = await conn.fetchrow("""
                SELECT * FROM chat_rooms 
                WHERE participants::text LIKE $1 
                OR name = $2
                LIMIT 1
            """, f'%"{partner_id}"%', f"partner-{partner_id}")
            
            if not row:
                room_id = f"chat-{secrets.token_hex(8)}"
                participants = json.dumps([partner_id, "admin"])
                now_naive = utc_now()
                await conn.execute("""
                    INSERT INTO chat_rooms (id, name, type, participants, is_active, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                """, room_id, f"partner-{partner_id}", "support", participants, True, now_naive, now_naive)
                row = await conn.fetchrow("SELECT * FROM chat_rooms WHERE id = $1", room_id)
            
            result = serialize_pg_row(row)
            result["partner_id"] = partner_id  # Add for compatibility
            return result
    else:
        room = await db.chat_rooms.find_one({"partner_id": partner_id})
        if not room:
            room_data = {
                "partner_id": partner_id,
                "admin_id": None,
                "status": "active",
                "created_at": utc_now(),
                "last_message_at": None
            }
            result = await db.chat_rooms.insert_one(room_data)
            room_data["_id"] = result.inserted_id
            room = room_data
        return serialize_doc(room)


async def get_chat_rooms() -> List[dict]:
    """Get all chat rooms (admin)"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM chat_rooms WHERE is_active = true ORDER BY last_message_at DESC NULLS LAST")
            rooms = []
            for row in rows:
                room_dict = serialize_pg_row(row)
                # Extract partner_id from participants or name
                partner_id = None
                if row.get("participants"):
                    participants = row["participants"]
                    if isinstance(participants, str):
                        participants = json.loads(participants)
                    if isinstance(participants, list) and len(participants) > 0:
                        partner_id = participants[0] if participants[0] != "admin" else (participants[1] if len(participants) > 1 else None)
                
                if not partner_id and row.get("name", "").startswith("partner-"):
                    partner_id = row["name"].replace("partner-", "")
                
                if partner_id:
                    partner = await get_partner_by_id(partner_id)
                    if partner:
                        room_dict["partnerName"] = partner.get("business_name", "Partner")
                        room_dict["partnerPhone"] = partner.get("phone", "")
                        room_dict["partner_id"] = partner_id
                rooms.append(room_dict)
            return rooms
    else:
        cursor = db.chat_rooms.find().sort("last_message_at", -1)
        rooms = []
        async for room in cursor:
            room_dict = serialize_doc(room)
            partner = await get_partner_by_id(room.get("partner_id"))
            if partner:
                room_dict["partnerName"] = partner.get("business_name", "Partner")
                room_dict["partnerPhone"] = partner.get("phone", "")
            rooms.append(room_dict)
        return rooms


async def get_messages(chat_room_id: str, limit: int = 100) -> List[dict]:
    """Get messages for chat room"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            # Use chat_messages table which has partner_id
            # First try to get partner_id from room
            room = await conn.fetchrow("SELECT * FROM chat_rooms WHERE id = $1", chat_room_id)
            partner_id = None
            if room:
                if room.get("name", "").startswith("partner-"):
                    partner_id = room["name"].replace("partner-", "")
                elif room.get("participants"):
                    participants = room["participants"]
                    if isinstance(participants, str):
                        participants = json.loads(participants)
                    if isinstance(participants, list) and len(participants) > 0:
                        partner_id = participants[0] if participants[0] != "admin" else (participants[1] if len(participants) > 1 else None)
            
            # Get messages from chat_messages table
            if partner_id:
                rows = await conn.fetch(
                    "SELECT * FROM chat_messages WHERE partner_id = $1 ORDER BY created_at ASC LIMIT $2",
                    partner_id, limit
                )
            else:
                rows = []
            
            messages = []
            for row in rows:
                msg = serialize_pg_row(row)
                # Map role to sender_role for compatibility
                msg["sender_role"] = msg.get("role", "partner")
                msg["chat_room_id"] = chat_room_id
                messages.append(msg)
            return messages
    else:
        cursor = db.messages.find({"chat_room_id": chat_room_id}).sort("created_at", 1).limit(limit)
        messages = []
        async for msg in cursor:
            messages.append(serialize_doc(msg))
        return messages


async def create_message(chat_room_id: str, sender_id: str, sender_role: str, content: str, **kwargs) -> dict:
    """Create chat message"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            # Get partner_id from chat room
            room = await conn.fetchrow("SELECT * FROM chat_rooms WHERE id = $1", chat_room_id)
            partner_id = None
            if room:
                if room.get("name", "").startswith("partner-"):
                    partner_id = room["name"].replace("partner-", "")
                elif room.get("participants"):
                    participants = room["participants"]
                    if isinstance(participants, str):
                        participants = json.loads(participants)
                    if isinstance(participants, list) and len(participants) > 0:
                        partner_id = participants[0] if participants[0] != "admin" else (participants[1] if len(participants) > 1 else None)
            
            if not partner_id:
                partner_id = sender_id
            
            msg_id = f"msg-{secrets.token_hex(8)}"
            metadata = json.dumps({"sender_id": sender_id, "message_type": kwargs.get("message_type", "text")})
            
            # Insert into chat_messages table
            await conn.execute("""
                INSERT INTO chat_messages (id, partner_id, role, content, metadata, created_at)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, msg_id, partner_id, sender_role, content, metadata, utc_now())
            
            # Update chat_rooms last_message_at
            now_naive = utc_now()
            await conn.execute(
                "UPDATE chat_rooms SET last_message_at = $1, updated_at = $2 WHERE id = $3",
                now_naive, now_naive, chat_room_id
            )
            
            row = await conn.fetchrow("SELECT * FROM chat_messages WHERE id = $1", msg_id)
            result = serialize_pg_row(row)
            result["sender_role"] = sender_role
            result["chat_room_id"] = chat_room_id
            return result
    else:
        message_data = {
            "chat_room_id": chat_room_id,
            "sender_id": sender_id,
            "sender_role": sender_role,
            "content": content,
            "message_type": kwargs.get("message_type", "text"),
            "attachment_url": kwargs.get("attachment_url"),
            "created_at": utc_now(),
            "read_at": None
        }
        result = await db.messages.insert_one(message_data)
        message_data["id"] = str(result.inserted_id)
        
        await db.chat_rooms.update_one(
            {"partner_id": chat_room_id},
            {"$set": {"last_message_at": utc_now()}}
        )
        
        return serialize_doc(message_data)


# ==================== PRODUCTS ====================

async def create_product(partner_id: str, **kwargs) -> dict:
    """Create product"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            product_id = secrets.token_hex(12)
            await conn.execute("""
                INSERT INTO products (id, partner_id, name, sku, barcode, description, category, brand, price, cost_price, stock, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            """,
            product_id, partner_id, kwargs.get("name", ""),
            kwargs.get("sku"), kwargs.get("barcode"),
            kwargs.get("description", ""), kwargs.get("category", "general"),
            kwargs.get("brand"), kwargs.get("price", 0),
            kwargs.get("cost_price", 0), kwargs.get("stock_quantity", 0),
            True, utc_now(), utc_now()
            )
            row = await conn.fetchrow("SELECT * FROM products WHERE id = $1", product_id)
            return serialize_pg_row(row)
    else:
        product_data = {
            "partner_id": partner_id,
            "name": kwargs.get("name", ""),
            "sku": kwargs.get("sku"),
            "barcode": kwargs.get("barcode"),
            "description": kwargs.get("description", ""),
            "category": kwargs.get("category", "general"),
            "brand": kwargs.get("brand"),
            "price": kwargs.get("price", 0),
            "cost_price": kwargs.get("cost_price", 0),
            "stock_quantity": kwargs.get("stock_quantity", 0),
            "is_active": True,
            "created_at": utc_now(),
            "updated_at": utc_now()
        }
        result = await db.products.insert_one(product_data)
        product_data["id"] = str(result.inserted_id)
        return serialize_doc(product_data)


async def get_products_by_partner(partner_id: str) -> List[dict]:
    """Get all products for partner"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM products WHERE partner_id = $1 ORDER BY created_at DESC",
                partner_id
            )
            return [serialize_pg_row(row) for row in rows]
    else:
        cursor = db.products.find({"partner_id": partner_id}).sort("created_at", -1)
        products = []
        async for product in cursor:
            products.append(serialize_doc(product))
        return products


async def get_product_by_id(product_id: str) -> Optional[dict]:
    """Get product by ID"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM products WHERE id = $1", product_id)
            return serialize_pg_row(row)
    else:
        try:
            product = await db.products.find_one({"_id": ObjectId(product_id)})
            return serialize_doc(product)
        except:
            return None


# ==================== MARKETPLACE INTEGRATIONS ====================

async def save_marketplace_credentials(partner_id: str, marketplace: str, credentials: dict) -> dict:
    """Save marketplace API credentials"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            existing = await conn.fetchrow(
                "SELECT id FROM marketplace_integrations WHERE partner_id = $1 AND marketplace = $2",
                partner_id, marketplace
            )
            if existing:
                await conn.execute("""
                    UPDATE marketplace_integrations 
                    SET api_credentials = $1, is_active = true, active = true, updated_at = $2
                    WHERE partner_id = $3 AND marketplace = $4
                """, json.dumps(credentials), utc_now(), partner_id, marketplace)
            else:
                await conn.execute("""
                    INSERT INTO marketplace_integrations (id, partner_id, marketplace, api_credentials, is_active, active, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """, secrets.token_hex(12), partner_id, marketplace, json.dumps(credentials), True, True, utc_now(), utc_now())
            
            return {"marketplace": marketplace, "is_connected": True}
    else:
        cred_data = {
            "partner_id": partner_id,
            "marketplace": marketplace,
            "credentials": credentials,
            "is_active": True,
            "created_at": utc_now(),
            "updated_at": utc_now()
        }
        await db.marketplace_credentials.update_one(
            {"partner_id": partner_id, "marketplace": marketplace},
            {"$set": cred_data},
            upsert=True
        )
        return serialize_doc(cred_data)


async def get_marketplace_credentials(partner_id: str, marketplace: str = None) -> List[dict]:
    """Get marketplace credentials for partner"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            if marketplace:
                rows = await conn.fetch(
                    "SELECT * FROM marketplace_integrations WHERE partner_id = $1 AND marketplace = $2",
                    partner_id, marketplace
                )
            else:
                rows = await conn.fetch(
                    "SELECT * FROM marketplace_integrations WHERE partner_id = $1",
                    partner_id
                )
            return [serialize_pg_row(row) for row in rows]
    else:
        query = {"partner_id": partner_id}
        if marketplace:
            query["marketplace"] = marketplace
        cursor = db.marketplace_credentials.find(query)
        creds = []
        async for cred in cursor:
            creds.append(serialize_doc(cred))
        return creds


# ==================== ANALYTICS ====================

async def get_partner_stats(partner_id: str) -> dict:
    """Get partner statistics"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            products_count = await conn.fetchval(
                "SELECT COUNT(*) FROM products WHERE partner_id = $1", partner_id
            )
            return {
                "products_count": products_count or 0,
                "orders_count": 0,
                "total_revenue": 0,
                "active_marketplaces": 0
            }
    else:
        products_count = await db.products.count_documents({"partner_id": partner_id})
        return {
            "products_count": products_count,
            "orders_count": 0,
            "total_revenue": 0,
            "active_marketplaces": 0
        }


# ==================== AI TASKS ====================

async def get_ai_tasks(partner_id: str, status: str = None) -> List[dict]:
    """Get AI tasks for partner"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            if status:
                rows = await conn.fetch(
                    "SELECT * FROM ai_tasks WHERE partner_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 50",
                    partner_id, status
                )
            else:
                rows = await conn.fetch(
                    "SELECT * FROM ai_tasks WHERE partner_id = $1 ORDER BY created_at DESC LIMIT 50",
                    partner_id
                )
            return [serialize_pg_row(row) for row in rows]
    else:
        query = {"partner_id": partner_id}
        if status:
            query["status"] = status
        cursor = db.ai_tasks.find(query).sort("created_at", -1).limit(50)
        tasks = []
        async for task in cursor:
            tasks.append(serialize_doc(task))
        return tasks


async def create_ai_task(partner_id: str, task_type: str, input_data: dict) -> dict:
    """Create AI task"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            task_id = secrets.token_hex(12)
            await conn.execute("""
                INSERT INTO ai_tasks (id, partner_id, task_type, status, input_data, created_at)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, task_id, partner_id, task_type, "pending", json.dumps(input_data), utc_now())
            row = await conn.fetchrow("SELECT * FROM ai_tasks WHERE id = $1", task_id)
            return serialize_pg_row(row)
    else:
        task_data = {
            "partner_id": partner_id,
            "task_type": task_type,
            "status": "pending",
            "input_data": input_data,
            "output_data": None,
            "error_message": None,
            "created_at": utc_now()
        }
        result = await db.ai_tasks.insert_one(task_data)
        task_data["id"] = str(result.inserted_id)
        return serialize_doc(task_data)


async def update_ai_task(task_id: str, updates: dict) -> Optional[dict]:
    """Update AI task"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            set_clauses = []
            values = []
            i = 1
            for key, value in updates.items():
                set_clauses.append(f"{key} = ${i}")
                values.append(value)
                i += 1
            values.append(task_id)
            await conn.execute(
                f"UPDATE ai_tasks SET {', '.join(set_clauses)} WHERE id = ${i}",
                *values
            )
            row = await conn.fetchrow("SELECT * FROM ai_tasks WHERE id = $1", task_id)
            return serialize_pg_row(row)
    else:
        try:
            await db.ai_tasks.update_one(
                {"_id": ObjectId(task_id)},
                {"$set": updates}
            )
            task = await db.ai_tasks.find_one({"_id": ObjectId(task_id)})
            return serialize_doc(task)
        except:
            return None
