"""
Partner Marketplace Credentials Management Service
Secure storage and retrieval of partner's marketplace API keys and login credentials
"""
import os
import json
import base64
import hashlib
from cryptography.fernet import Fernet
from typing import Optional, Dict, Any
from datetime import datetime

# Generate or load encryption key
def get_encryption_key():
    """Get or generate encryption key from environment"""
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        # Generate a new key if not exists
        key = Fernet.generate_key().decode()
        print(f"⚠️ No ENCRYPTION_KEY found. Generated new key: {key[:20]}...")
    return key.encode() if isinstance(key, str) else key

ENCRYPTION_KEY = get_encryption_key()
cipher_suite = Fernet(ENCRYPTION_KEY)


def encrypt_data(data: str) -> str:
    """Encrypt sensitive data"""
    if not data:
        return ""
    encrypted = cipher_suite.encrypt(data.encode())
    return base64.b64encode(encrypted).decode()


def decrypt_data(encrypted_data: str) -> str:
    """Decrypt sensitive data"""
    if not encrypted_data:
        return ""
    try:
        decoded = base64.b64decode(encrypted_data.encode())
        decrypted = cipher_suite.decrypt(decoded)
        return decrypted.decode()
    except Exception as e:
        print(f"Decryption error: {e}")
        return ""


class MarketplaceCredentials:
    """Manages marketplace credentials for partners"""
    
    # In-memory storage (replace with database in production)
    _credentials: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def save_credentials(
        cls,
        partner_id: str,
        marketplace: str,
        credentials: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Save partner's marketplace credentials
        
        Args:
            partner_id: Partner ID
            marketplace: Marketplace name (uzum, yandex, wildberries, ozon)
            credentials: Dict with api_key, api_secret, login, password
        """
        key = f"{partner_id}:{marketplace}"
        
        # Encrypt sensitive data
        encrypted_creds = {}
        for field, value in credentials.items():
            if field in ['api_key', 'api_secret', 'password']:
                encrypted_creds[field] = encrypt_data(value) if value else ""
            else:
                encrypted_creds[field] = value
        
        cls._credentials[key] = {
            "partner_id": partner_id,
            "marketplace": marketplace,
            "credentials": encrypted_creds,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": True
        }
        
        return {
            "success": True,
            "message": f"{marketplace} credentials saved successfully",
            "marketplace": marketplace
        }
    
    @classmethod
    def get_credentials(
        cls,
        partner_id: str,
        marketplace: str,
        decrypt: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Get partner's marketplace credentials
        
        Args:
            partner_id: Partner ID
            marketplace: Marketplace name
            decrypt: Whether to decrypt sensitive data
        """
        key = f"{partner_id}:{marketplace}"
        
        if key not in cls._credentials:
            return None
        
        cred_data = cls._credentials[key].copy()
        
        if decrypt:
            decrypted_creds = {}
            for field, value in cred_data["credentials"].items():
                if field in ['api_key', 'api_secret', 'password']:
                    decrypted_creds[field] = decrypt_data(value) if value else ""
                else:
                    decrypted_creds[field] = value
            cred_data["credentials"] = decrypted_creds
        
        return cred_data
    
    @classmethod
    def get_all_partner_credentials(
        cls,
        partner_id: str,
        mask_sensitive: bool = True
    ) -> list:
        """Get all marketplace credentials for a partner"""
        result = []
        
        for key, data in cls._credentials.items():
            if data["partner_id"] == partner_id:
                cred_info = {
                    "marketplace": data["marketplace"],
                    "is_active": data["is_active"],
                    "created_at": data["created_at"],
                    "updated_at": data["updated_at"],
                }
                
                # Show masked credentials
                creds = data["credentials"]
                if mask_sensitive:
                    cred_info["has_api_key"] = bool(creds.get("api_key"))
                    cred_info["has_login"] = bool(creds.get("login"))
                    cred_info["has_password"] = bool(creds.get("password"))
                    if creds.get("login"):
                        login = decrypt_data(creds["login"]) if creds.get("login") else creds.get("login", "")
                        cred_info["login_masked"] = login[:3] + "***" + login[-2:] if len(login) > 5 else "***"
                
                result.append(cred_info)
        
        return result
    
    @classmethod
    def delete_credentials(cls, partner_id: str, marketplace: str) -> bool:
        """Delete partner's marketplace credentials"""
        key = f"{partner_id}:{marketplace}"
        
        if key in cls._credentials:
            del cls._credentials[key]
            return True
        return False
    
    @classmethod
    def test_credentials(cls, partner_id: str, marketplace: str) -> Dict[str, Any]:
        """Test if saved credentials are valid"""
        cred_data = cls.get_credentials(partner_id, marketplace)
        
        if not cred_data:
            return {
                "success": False,
                "error": f"No credentials found for {marketplace}"
            }
        
        creds = cred_data["credentials"]
        
        # Test based on marketplace
        if marketplace == "uzum":
            return cls._test_uzum_credentials(creds)
        elif marketplace == "yandex":
            return cls._test_yandex_credentials(creds)
        else:
            return {
                "success": False,
                "error": f"Unknown marketplace: {marketplace}"
            }
    
    @classmethod
    def _test_uzum_credentials(cls, creds: Dict[str, str]) -> Dict[str, Any]:
        """Test Uzum Market API credentials"""
        import httpx
        
        api_key = creds.get("api_key", "")
        if not api_key:
            return {"success": False, "error": "No API key provided"}
        
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.get(
                    "https://api-seller.uzum.uz/api/seller-openapi/v2/fbs/sku/stocks",
                    headers={
                        "Authorization": api_key,
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    products_count = len(data.get("payload", {}).get("skuAmountList", []))
                    return {
                        "success": True,
                        "message": f"Uzum API connected! {products_count} products found",
                        "products_count": products_count
                    }
                else:
                    return {
                        "success": False,
                        "error": f"API returned {response.status_code}: {response.text[:200]}"
                    }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @classmethod
    def _test_yandex_credentials(cls, creds: Dict[str, str]) -> Dict[str, Any]:
        """Test Yandex Market API credentials"""
        import httpx
        
        api_key = creds.get("api_key", "")
        campaign_id = creds.get("campaign_id", "")
        
        if not api_key:
            return {"success": False, "error": "No API key provided"}
        
        try:
            with httpx.Client(timeout=30.0) as client:
                # Yandex uses OAuth token in Authorization header
                response = client.get(
                    f"https://api.partner.market.yandex.ru/campaigns/{campaign_id}/offers",
                    headers={
                        "Authorization": f"OAuth {api_key}",
                        "Content-Type": "application/json"
                    },
                    params={"limit": 1}
                )
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "message": "Yandex Market API connected!"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"API returned {response.status_code}"
                    }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Supported marketplaces configuration
SUPPORTED_MARKETPLACES = {
    "uzum": {
        "name": "Uzum Market",
        "icon": "🍇",
        "auth_type": "api_key",  # Only API key needed
        "fields": ["api_key"],
        "portal_url": "https://seller.uzum.uz",
        "api_docs": "https://api-seller.uzum.uz/api/seller-openapi/"
    },
    "yandex": {
        "name": "Yandex Market",
        "icon": "🔴",
        "auth_type": "oauth",
        "fields": ["api_key", "campaign_id", "client_id"],
        "portal_url": "https://partner.market.yandex.ru",
        "api_docs": "https://yandex.ru/dev/market/partner-api/"
    },
    "wildberries": {
        "name": "Wildberries",
        "icon": "🟣",
        "auth_type": "api_key",
        "fields": ["api_key"],
        "portal_url": "https://seller.wildberries.ru",
        "api_docs": "https://openapi.wb.ru/"
    },
    "ozon": {
        "name": "Ozon",
        "icon": "🔵",
        "auth_type": "api_key",
        "fields": ["client_id", "api_key"],
        "portal_url": "https://seller.ozon.ru",
        "api_docs": "https://docs.ozon.ru/api/seller/"
    }
}


def get_supported_marketplaces():
    """Get list of supported marketplaces with their configuration"""
    return SUPPORTED_MARKETPLACES
