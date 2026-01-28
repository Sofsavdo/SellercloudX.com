"""
SellerCloudX Database Service
PostgreSQL (Production - Railway) with existing schema
"""
import os
import bcrypt
import secrets
import json
from datetime import datetime, timedelta
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
if USE_POSTGRES:
    import asyncpg
    
    pool: asyncpg.Pool = None
    
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
        """Seed admin user in PostgreSQL"""
        try:
            async with pool.acquire() as conn:
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
                    hashed, "admin", True, "Admin", "User", datetime.utcnow()
                    )
                    print("✅ Admin user seeded in PostgreSQL")
                else:
                    print("✅ Admin user exists in PostgreSQL")
        except Exception as e:
            print(f"⚠️ Admin seed warning: {e}")

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
                    "created_at": datetime.utcnow()
                })
                print("✅ Admin user seeded in MongoDB")
        except Exception as e:
            print(f"⚠️ Admin seed warning: {e}")


# ==================== Helper Functions ====================

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
                kwargs.get("phone", ""), datetime.utcnow()
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
            "created_at": datetime.utcnow()
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
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO user_sessions (token, user_id, user_data, created_at, expires_at)
                VALUES ($1, $2, $3, $4, $5)
            """, token, user_id, json.dumps(user_data), datetime.utcnow(), expires_at)
    else:
        await db.sessions.insert_one({
            "token": token,
            "user_id": user_id,
            "user_data": user_data,
            "created_at": datetime.utcnow(),
            "expires_at": expires_at
        })
    return token


async def get_session(token: str) -> Optional[dict]:
    """Get session by token"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM user_sessions WHERE token = $1 AND expires_at > $2",
                token, datetime.utcnow()
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
            "expires_at": {"$gt": datetime.utcnow()}
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
            "trial", promo_code, datetime.utcnow(), datetime.utcnow()
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
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
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
    updates["updated_at"] = datetime.utcnow()
    
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            set_clauses = []
            values = []
            i = 1
            for key, value in updates.items():
                # Convert datetime to string for JSON fields
                if isinstance(value, datetime):
                    value = value.isoformat()
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
        "approved_at": datetime.utcnow(),
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
        "activated_at": datetime.utcnow()
    })


# ==================== CHAT OPERATIONS ====================

async def get_or_create_chat_room(partner_id: str) -> dict:
    """Get or create chat room for partner"""
    if USE_POSTGRES:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM chat_rooms WHERE partner_id = $1", partner_id)
            if not row:
                room_id = f"chat-{secrets.token_hex(8)}"
                await conn.execute("""
                    INSERT INTO chat_rooms (id, partner_id, status, created_at)
                    VALUES ($1, $2, $3, $4)
                """, room_id, partner_id, "active", datetime.utcnow())
                row = await conn.fetchrow("SELECT * FROM chat_rooms WHERE id = $1", room_id)
            return serialize_pg_row(row)
    else:
        room = await db.chat_rooms.find_one({"partner_id": partner_id})
        if not room:
            room_data = {
                "partner_id": partner_id,
                "admin_id": None,
                "status": "active",
                "created_at": datetime.utcnow(),
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
            rows = await conn.fetch("SELECT * FROM chat_rooms ORDER BY last_message_at DESC NULLS LAST")
            rooms = []
            for row in rows:
                room_dict = serialize_pg_row(row)
                partner = await get_partner_by_id(row.get("partner_id"))
                if partner:
                    room_dict["partnerName"] = partner.get("business_name", "Partner")
                    room_dict["partnerPhone"] = partner.get("phone", "")
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
            rows = await conn.fetch(
                "SELECT * FROM messages WHERE chat_room_id = $1 ORDER BY created_at ASC LIMIT $2",
                chat_room_id, limit
            )
            return [serialize_pg_row(row) for row in rows]
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
            msg_id = f"msg-{secrets.token_hex(8)}"
            await conn.execute("""
                INSERT INTO messages (id, chat_room_id, sender_id, sender_role, content, message_type, attachment_url, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """,
            msg_id, chat_room_id, sender_id, sender_role, content,
            kwargs.get("message_type", "text"), kwargs.get("attachment_url"),
            datetime.utcnow()
            )
            await conn.execute(
                "UPDATE chat_rooms SET last_message_at = $1 WHERE id = $2",
                datetime.utcnow(), chat_room_id
            )
            row = await conn.fetchrow("SELECT * FROM messages WHERE id = $1", msg_id)
            return serialize_pg_row(row)
    else:
        message_data = {
            "chat_room_id": chat_room_id,
            "sender_id": sender_id,
            "sender_role": sender_role,
            "content": content,
            "message_type": kwargs.get("message_type", "text"),
            "attachment_url": kwargs.get("attachment_url"),
            "created_at": datetime.utcnow(),
            "read_at": None
        }
        result = await db.messages.insert_one(message_data)
        message_data["id"] = str(result.inserted_id)
        
        await db.chat_rooms.update_one(
            {"partner_id": chat_room_id},
            {"$set": {"last_message_at": datetime.utcnow()}}
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
            True, datetime.utcnow(), datetime.utcnow()
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
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
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
                    SET credentials = $1, is_active = true, updated_at = $2
                    WHERE partner_id = $3 AND marketplace = $4
                """, json.dumps(credentials), datetime.utcnow(), partner_id, marketplace)
            else:
                await conn.execute("""
                    INSERT INTO marketplace_integrations (id, partner_id, marketplace, credentials, is_active, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                """, secrets.token_hex(12), partner_id, marketplace, json.dumps(credentials), True, datetime.utcnow(), datetime.utcnow())
            
            return {"marketplace": marketplace, "is_connected": True}
    else:
        cred_data = {
            "partner_id": partner_id,
            "marketplace": marketplace,
            "credentials": credentials,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
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
            """, task_id, partner_id, task_type, "pending", json.dumps(input_data), datetime.utcnow())
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
            "created_at": datetime.utcnow()
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
