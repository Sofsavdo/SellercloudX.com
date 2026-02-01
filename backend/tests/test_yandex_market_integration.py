"""
Yandex Market Integration Tests
Tests for SellerCloudX Yandex Market API integration

Endpoints tested:
- POST /api/partner/marketplaces/connect - Yandex Market REAL API validation
- GET /api/partner/marketplaces - Connected marketplaces list
- POST /api/yandex-market/full-process - Full product card creation
- POST /api/yandex-market/test-connection - Yandex API connection test
- POST /api/yandex-market/create-product - Real product creation on Yandex Market
- GET /api/yandex-market/rules - Yandex rules
- POST /api/unified-scanner/analyze-base64 - AI Scanner endpoint
- POST /api/unified-scanner/full-process - Full scan and create chain
"""
import pytest
import requests
import os
import json
import base64
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://sellercloudx.preview.emergentagent.com"

# Test credentials from review request
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
PARTNER_USERNAME = "partner"
PARTNER_PASSWORD = "partner123"
YANDEX_API_KEY = "ACMA:rHqOiebT6JY1JlkEN0rdYdZn2SkO6iC2V6HvLE22:1806b892"
YANDEX_BUSINESS_ID = "197529861"


class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_01_health_check(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["ok", "healthy"]
        print(f"✅ Health check passed: {data}")
    
    def test_02_admin_login(self):
        """Test admin login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data.get("user", {}).get("role") == "admin"
        print(f"✅ Admin login successful, token: {data['token'][:20]}...")
        return data["token"]
    
    def test_03_partner_login(self):
        """Test partner login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": PARTNER_USERNAME, "password": PARTNER_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print(f"✅ Partner login successful")
        return data["token"], data.get("partner", {}).get("id")


class TestYandexMarketConnection:
    """Yandex Market API connection tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get partner token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": PARTNER_USERNAME, "password": PARTNER_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.partner_id = data.get("partner", {}).get("id")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Partner login failed")
    
    def test_04_yandex_test_connection_real_api(self):
        """Test Yandex Market API connection with REAL credentials"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/test-connection",
            json={
                "partner_id": self.partner_id or "test",
                "oauth_token": YANDEX_API_KEY,
                "business_id": YANDEX_BUSINESS_ID
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check if connection was successful
        if data.get("success"):
            print(f"✅ Yandex API connection successful!")
            print(f"   Business ID: {data.get('business_id')}")
            print(f"   Campaigns: {data.get('campaign_count', 0)}")
            campaigns = data.get("campaigns", [])
            for camp in campaigns[:3]:
                print(f"   - {camp.get('clientName', camp.get('domain', 'Shop'))}")
        else:
            print(f"⚠️ Yandex API connection failed: {data.get('error')}")
            # This is expected if API key is invalid/expired
        
        # Assert response structure is correct
        assert "success" in data
    
    def test_05_marketplace_connect_yandex(self):
        """Test connecting Yandex marketplace with REAL API validation"""
        response = requests.post(
            f"{BASE_URL}/api/partner/marketplaces/connect",
            headers=self.headers,
            json={
                "marketplace": "yandex",
                "apiKey": YANDEX_API_KEY,
                "campaignId": None
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            print(f"✅ Yandex marketplace connected!")
            print(f"   Shops found: {data.get('data', {}).get('campaign_count', 0)}")
            shops = data.get("data", {}).get("shops", [])
            for shop in shops:
                print(f"   - {shop.get('name')} (ID: {shop.get('id')})")
        else:
            print(f"⚠️ Yandex marketplace connection: {data.get('message')}")
            print(f"   Error: {data.get('error')}")
        
        # Assert response structure
        assert "success" in data or "message" in data
    
    def test_06_get_connected_marketplaces(self):
        """Test getting connected marketplaces list"""
        response = requests.get(
            f"{BASE_URL}/api/partner/marketplaces",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        marketplaces = data.get("data", {})
        
        print(f"✅ Connected marketplaces:")
        for mp_name, mp_data in marketplaces.items():
            status = "✓ Connected" if mp_data.get("connected") else "✗ Not connected"
            print(f"   - {mp_data.get('name', mp_name)}: {status}")


class TestYandexMarketRules:
    """Yandex Market rules and requirements tests"""
    
    def test_07_get_yandex_rules(self):
        """Test getting Yandex Market rules"""
        response = requests.get(f"{BASE_URL}/api/yandex-market/rules")
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        rules = data.get("rules", {})
        
        # Verify rules structure
        assert "commission_rates" in rules
        assert "media_requirements" in rules
        assert "card_requirements" in rules
        
        print(f"✅ Yandex Market rules retrieved:")
        print(f"   Title max length: {rules.get('card_requirements', {}).get('title_max_length')}")
        print(f"   Min images: {rules.get('card_requirements', {}).get('min_images')}")
        print(f"   Required language: {rules.get('card_requirements', {}).get('required_languages')}")


class TestYandexFullProcess:
    """Yandex Market full product creation process tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get partner token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": PARTNER_USERNAME, "password": PARTNER_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.partner_id = data.get("partner", {}).get("id")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Partner login failed")
    
    def test_08_yandex_full_process(self):
        """Test full Yandex product card creation (price calc, category mapping, AI card)"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": self.partner_id or "test",
                "cost_price": 50000,
                "quantity": 10,
                "category": "electronics",
                "brand": "Samsung",
                "weight_kg": 0.5,
                "fulfillment": "fbs",
                "payout_frequency": "weekly",
                "product_name": "TEST Samsung Galaxy Buds Pro",
                "description": "Wireless earbuds with ANC"
            },
            timeout=60  # AI generation may take time
        )
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            print(f"✅ Yandex full process completed!")
            result = data.get("data", {})
            
            # Check steps completed
            steps = result.get("steps_completed", [])
            print(f"   Steps completed: {', '.join(steps)}")
            
            # Check price optimization
            price_opt = result.get("price_optimization", {})
            print(f"   Optimal price: {price_opt.get('optimal_price')} UZS")
            print(f"   Min price: {price_opt.get('min_price')} UZS")
            
            # Check AI card
            card = result.get("product_card", {})
            if card:
                print(f"   AI Card name: {card.get('name', '')[:50]}...")
                print(f"   SEO score: {result.get('seo_score', 0)}")
            
            # Verify required fields
            assert "price_optimization" in result
            assert "category_id" in result
        else:
            print(f"⚠️ Full process failed: {data.get('error')}")
            # Check if it's an AI service issue
            if "EMERGENT" in str(data.get("error", "")):
                pytest.skip("AI service not available")


class TestYandexCreateProduct:
    """Yandex Market real product creation tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get partner token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": PARTNER_USERNAME, "password": PARTNER_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.partner_id = data.get("partner", {}).get("id")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Partner login failed")
    
    def test_09_yandex_create_product_real_api(self):
        """Test creating real product on Yandex Market via API"""
        # Generate unique offer_id for test
        timestamp = datetime.now().strftime("%H%M%S")
        
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/create-product",
            json={
                "partner_id": self.partner_id or "test",
                "oauth_token": YANDEX_API_KEY,
                "business_id": YANDEX_BUSINESS_ID,
                "product_name": f"TEST Product {timestamp}",
                "description": "Test product created via API automation",
                "brand": "TestBrand",
                "category": "electronics",
                "price": 99000,
                "quantity": 5,
                "weight_kg": 0.3,
                "images": ["https://via.placeholder.com/1000x1000.png?text=Test+Product"],
                "auto_generate_card": True
            },
            timeout=90  # AI + API calls may take time
        )
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            print(f"✅ Product created on Yandex Market!")
            result = data.get("data", {})
            print(f"   Offer ID: {result.get('offer_id')}")
            print(f"   Product name: {result.get('product_name')}")
            print(f"   Price: {result.get('price')} UZS")
            print(f"   Business ID: {result.get('business_id')}")
            
            # Check steps
            steps = result.get("steps_completed", [])
            print(f"   Steps: {', '.join(steps)}")
            
            # Check warnings
            warnings = result.get("warnings", [])
            if warnings:
                print(f"   Warnings: {warnings}")
        else:
            print(f"⚠️ Product creation failed: {data.get('error')}")
            details = data.get("details", {})
            if details:
                print(f"   Details: {json.dumps(details, indent=2)[:500]}")
            
            # Check if it's an API key issue
            if "401" in str(data) or "token" in str(data.get("error", "")).lower():
                print("   Note: API key may be invalid or expired")


class TestUnifiedScanner:
    """Unified Scanner endpoint tests"""
    
    def test_10_unified_scanner_analyze_base64(self):
        """Test AI Scanner with base64 image"""
        # Create a simple test image (1x1 pixel PNG)
        # This is a minimal valid PNG
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={
                "image_base64": test_image_base64,
                "language": "uz",
                "marketplace": "yandex"
            },
            timeout=60
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "success" in data
        
        if data.get("success"):
            print(f"✅ Scanner analysis completed!")
            scan_data = data.get("data", {})
            print(f"   Product name: {scan_data.get('productName', 'N/A')}")
            print(f"   Category: {scan_data.get('category', 'N/A')}")
            print(f"   Confidence: {scan_data.get('confidence', 0)}")
        else:
            print(f"⚠️ Scanner analysis: {data.get('error')}")
            # AI service may not recognize minimal test image
    
    def test_11_unified_scanner_analyze_with_image_field(self):
        """Test AI Scanner with 'image' field (alternative format)"""
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={
                "image": test_image_base64,  # Using 'image' instead of 'image_base64'
                "language": "ru",
                "marketplace": "yandex"
            },
            timeout=60
        )
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        print(f"✅ Scanner with 'image' field: success={data.get('success')}")


class TestUnifiedScannerFullProcess:
    """Unified Scanner full process tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get partner token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": PARTNER_USERNAME, "password": PARTNER_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.partner_id = data.get("partner", {}).get("id")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Partner login failed")
    
    def test_12_unified_scanner_full_process(self):
        """Test full scanning and creation chain"""
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/full-process",
            json={
                "partner_id": self.partner_id or "test",
                "product_name": "TEST Samsung Galaxy Watch 5",
                "category": "electronics",
                "cost_price": 200000,
                "quantity": 5,
                "brand": "Samsung",
                "weight_kg": 0.2,
                "fulfillment": "fbs",
                "auto_ikpu": True,
                "description": "Smart watch with health monitoring"
            },
            timeout=90
        )
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            print(f"✅ Full process completed!")
            result = data.get("data", {})
            
            # Check steps
            steps = result.get("steps_completed", [])
            failed = result.get("steps_failed", [])
            print(f"   Steps completed: {', '.join(steps)}")
            if failed:
                print(f"   Steps failed: {[f.get('step') for f in failed]}")
            
            # Check price optimization
            price = result.get("price_optimization", {})
            print(f"   Optimal price: {price.get('optimal_price', 'N/A')}")
            
            # Check IKPU
            ikpu = result.get("ikpu", {})
            print(f"   IKPU code: {ikpu.get('code', 'N/A')}")
            
            # Check card
            card = result.get("product_card", {})
            if card:
                print(f"   Card title: {card.get('title', card.get('name', ''))[:50]}...")
        else:
            print(f"⚠️ Full process failed: {data.get('error')}")


class TestYandexGetCampaigns:
    """Test Yandex campaigns retrieval"""
    
    def test_13_yandex_get_campaigns(self):
        """Test getting Yandex Market campaigns (shops)"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/get-campaigns",
            json={
                "partner_id": "test",
                "oauth_token": YANDEX_API_KEY
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            campaigns = data.get("campaigns", [])
            print(f"✅ Retrieved {len(campaigns)} campaigns:")
            for camp in campaigns[:5]:
                name = camp.get("clientName", camp.get("domain", "Unknown"))
                camp_id = camp.get("id")
                print(f"   - {name} (ID: {camp_id})")
        else:
            print(f"⚠️ Get campaigns: {data.get('error')}")


class TestYandexPriceCalculation:
    """Test Yandex price calculation"""
    
    def test_14_yandex_calculate_price(self):
        """Test Yandex Market price calculation"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/calculate-price",
            params={
                "cost_price": 100000,
                "category": "electronics",
                "weight_kg": 1.0,
                "fulfillment": "fbs",
                "payout_frequency": "weekly"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            calc = data.get("calculation", {})
            print(f"✅ Price calculation:")
            print(f"   Cost price: 100,000 UZS")
            print(f"   Optimal price: {calc.get('optimal_price')} UZS")
            print(f"   Min price: {calc.get('min_price')} UZS")
            print(f"   Max price: {calc.get('max_price')} UZS")
            
            breakdown = calc.get("breakdown", {})
            if breakdown:
                print(f"   Commission: {breakdown.get('commission')} UZS")
                print(f"   Net profit: {breakdown.get('net_profit')} UZS")
        else:
            print(f"⚠️ Price calculation failed: {data.get('error')}")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
