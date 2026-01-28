"""
SellerCloudX Database Service - MongoDB with Motor
Full authentication, chat, admin and partner management
"""
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import os
import bcrypt
import secrets
from pydantic import BaseModel

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/sellercloudx")
client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Initialize MongoDB connection"""
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client.sellercloudx
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connected successfully")
        
        # Create indexes
        await create_indexes()
        
        # Seed initial admin if not exists
        await seed_admin()
        
        return True
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        return False


async def create_indexes():
    """Create necessary indexes"""
    try:
        # Users collection
        await db.users.create_index("username", unique=True)
        await db.users.create_index("email", unique=True, sparse=True)
        
        # Partners collection
        await db.partners.create_index("user_id", unique=True)
        await db.partners.create_index("phone")
        
        # Chat collections
        await db.chat_rooms.create_index("partner_id")
        await db.messages.create_index("chat_room_id")
        await db.messages.create_index("created_at")
        
        # Sessions
        await db.sessions.create_index("token", unique=True)
        await db.sessions.create_index("expires_at", expireAfterSeconds=0)
        
        print("✅ MongoDB indexes created")
    except Exception as e:
        print(f"⚠️ Index creation warning: {e}")


async def seed_admin():
    """Seed initial admin user"""
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
            print("✅ Admin user seeded: admin / admin123")
    except Exception as e:
        print(f"⚠️ Admin seed warning: {e}")


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result


# ==================== USER OPERATIONS ====================

async def create_user(username: str, email: str, password: str, role: str = "partner", **kwargs) -> dict:
    """Create new user"""
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
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
    user = await db.users.find_one({"username": username})
    return serialize_doc(user) if user else None


async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        return serialize_doc(user) if user else None
    except:
        return None


async def validate_user_password(username: str, password: str) -> Optional[dict]:
    """Validate user credentials"""
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
    session = await db.sessions.find_one({
        "token": token,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    return session


async def delete_session(token: str):
    """Delete session"""
    await db.sessions.delete_one({"token": token})


# ==================== PARTNER OPERATIONS ====================

async def create_partner(user_id: str, **kwargs) -> dict:
    """Create partner profile"""
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
        "setup_paid": False,
        "monthly_fee_usd": 499,
        "revenue_share_percent": 0.04,
        "promo_code": f"SCX-{secrets.token_hex(3).upper()}",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.partners.insert_one(partner_data)
    partner_data["id"] = str(result.inserted_id)
    return serialize_doc(partner_data)


async def get_partner_by_user_id(user_id: str) -> Optional[dict]:
    """Get partner by user ID"""
    partner = await db.partners.find_one({"user_id": user_id})
    return serialize_doc(partner) if partner else None


async def get_partner_by_id(partner_id: str) -> Optional[dict]:
    """Get partner by ID"""
    try:
        partner = await db.partners.find_one({"_id": ObjectId(partner_id)})
        return serialize_doc(partner) if partner else None
    except:
        return None


async def get_all_partners(status: str = "all") -> List[dict]:
    """Get all partners with optional filter"""
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
        # Get user data
        user = await get_user_by_id(partner.get("user_id"))
        partner_dict = serialize_doc(partner)
        partner_dict["userData"] = user
        partners.append(partner_dict)
    return partners


async def update_partner(partner_id: str, updates: dict) -> Optional[dict]:
    """Update partner"""
    try:
        updates["updated_at"] = datetime.utcnow()
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
        "is_active": True,
        "ai_enabled": True,
        "approved_at": datetime.utcnow(),
        "approved_by": admin_id
    })


async def activate_partner_manual(partner_id: str, admin_id: str, tariff: str = "premium") -> Optional[dict]:
    """Manually activate partner without payment (admin only)"""
    return await update_partner(partner_id, {
        "approved": True,
        "is_active": True,
        "ai_enabled": True,
        "tariff_type": tariff,
        "setup_paid": True,
        "activated_at": datetime.utcnow(),
        "activated_by": admin_id,
        "activation_note": "Admin tomonidan qo'lda faollashtirildi"
    })


# ==================== CHAT OPERATIONS ====================

async def get_or_create_chat_room(partner_id: str) -> dict:
    """Get or create chat room for partner"""
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
    cursor = db.chat_rooms.find().sort("last_message_at", -1)
    rooms = []
    async for room in cursor:
        room_dict = serialize_doc(room)
        # Get partner info
        partner = await get_partner_by_id(room.get("partner_id"))
        if partner:
            room_dict["partnerName"] = partner.get("business_name", "Partner")
            room_dict["partnerPhone"] = partner.get("phone", "")
        rooms.append(room_dict)
    return rooms


async def get_messages(chat_room_id: str, limit: int = 100) -> List[dict]:
    """Get messages for chat room"""
    cursor = db.messages.find({"chat_room_id": chat_room_id}).sort("created_at", 1).limit(limit)
    messages = []
    async for msg in cursor:
        messages.append(serialize_doc(msg))
    return messages


async def create_message(chat_room_id: str, sender_id: str, sender_role: str, content: str, **kwargs) -> dict:
    """Create chat message"""
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
    
    # Update chat room last message time
    await db.chat_rooms.update_one(
        {"_id": ObjectId(chat_room_id)},
        {"$set": {"last_message_at": datetime.utcnow()}}
    )
    
    return serialize_doc(message_data)


# ==================== PRODUCTS OPERATIONS ====================

async def create_product(partner_id: str, **kwargs) -> dict:
    """Create product"""
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
    cursor = db.products.find({"partner_id": partner_id}).sort("created_at", -1)
    products = []
    async for product in cursor:
        products.append(serialize_doc(product))
    return products


async def get_product_by_id(product_id: str) -> Optional[dict]:
    """Get product by ID"""
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        return serialize_doc(product) if product else None
    except:
        return None


# ==================== MARKETPLACE INTEGRATIONS ====================

async def save_marketplace_credentials(partner_id: str, marketplace: str, credentials: dict) -> dict:
    """Save marketplace API credentials"""
    cred_data = {
        "partner_id": partner_id,
        "marketplace": marketplace,
        "credentials": credentials,  # Should be encrypted in production
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Upsert - update if exists, insert if not
    await db.marketplace_credentials.update_one(
        {"partner_id": partner_id, "marketplace": marketplace},
        {"$set": cred_data},
        upsert=True
    )
    
    return serialize_doc(cred_data)


async def get_marketplace_credentials(partner_id: str, marketplace: str = None) -> List[dict]:
    """Get marketplace credentials for partner"""
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
    products_count = await db.products.count_documents({"partner_id": partner_id})
    
    return {
        "products_count": products_count,
        "orders_count": 0,  # TODO: implement orders
        "total_revenue": 0,
        "active_marketplaces": 0
    }


# ==================== AI MANAGER ====================

async def get_ai_tasks(partner_id: str, status: str = None) -> List[dict]:
    """Get AI tasks for partner"""
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
    task_data = {
        "partner_id": partner_id,
        "task_type": task_type,
        "status": "pending",
        "input_data": input_data,
        "output_data": None,
        "error_message": None,
        "created_at": datetime.utcnow(),
        "started_at": None,
        "completed_at": None
    }
    result = await db.ai_tasks.insert_one(task_data)
    task_data["id"] = str(result.inserted_id)
    return serialize_doc(task_data)


async def update_ai_task(task_id: str, updates: dict) -> Optional[dict]:
    """Update AI task"""
    try:
        await db.ai_tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": updates}
        )
        task = await db.ai_tasks.find_one({"_id": ObjectId(task_id)})
        return serialize_doc(task) if task else None
    except:
        return None
