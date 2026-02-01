"""
SellerCloudX Iteration 22 Tests
Testing: Partner Login, AI Scanner, Trend Hunter, Marketplace Integrations

Features tested:
1. Partner Dashboard login (partner/partner123)
2. AI Scanner API - /api/unified-scanner/analyze-base64 endpoint
3. Trend Hunter API - /api/trends/hunter endpoint
4. Marketplace Settings - POST /api/partner/marketplace-integrations endpoint
"""

import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com')

class TestPartnerLogin:
    """Partner authentication tests"""
    
    def test_partner_login_success(self):
        """Test partner login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "partner", "password": "partner123"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "token" in data
        assert "user" in data
        assert "partner" in data
        
        # Verify user role
        assert data["user"]["role"] == "partner"
        assert data["user"]["username"] == "partner"
        
        print(f"✅ Partner login successful, token received")
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "token" in data
        assert data["user"]["role"] == "admin"
        print(f"✅ Admin login successful")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "invalid", "password": "wrong"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401
        print(f"✅ Invalid credentials correctly rejected")


class TestAIScanner:
    """AI Scanner endpoint tests"""
    
    def test_unified_scanner_analyze_base64(self):
        """Test AI Scanner analyze-base64 endpoint"""
        # Small test image (1x1 pixel PNG)
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={
                "image_base64": test_image_base64,
                "language": "uz"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # API should return a response (success or error)
        assert "success" in data
        print(f"✅ AI Scanner endpoint responded: success={data.get('success')}")
    
    def test_unified_scanner_with_data_url(self):
        """Test AI Scanner with data URL format"""
        test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={
                "image_base64": test_image_base64,
                "language": "uz",
                "marketplace": "yandex"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        print(f"✅ AI Scanner with data URL format responded")
    
    def test_unified_scanner_empty_image(self):
        """Test AI Scanner with empty image"""
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={
                "image_base64": "",
                "language": "uz"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == False
        print(f"✅ Empty image correctly handled")


class TestTrendHunter:
    """Trend Hunter endpoint tests"""
    
    def test_trend_hunter_all_categories(self):
        """Test Trend Hunter with all categories"""
        response = requests.get(
            f"{BASE_URL}/api/trends/hunter?category=all",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "data" in data
        assert "usdRate" in data
        
        # Verify products have required fields
        if len(data["data"]) > 0:
            product = data["data"][0]
            assert "name" in product
            assert "category" in product
            assert "sourcePrice" in product
            assert "recommendedPrice" in product
            
        print(f"✅ Trend Hunter returned {len(data['data'])} products")
    
    def test_trend_hunter_electronics_category(self):
        """Test Trend Hunter with electronics category"""
        response = requests.get(
            f"{BASE_URL}/api/trends/hunter?category=electronics",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Trend Hunter electronics category works")
    
    def test_trend_hunter_action_buttons_data(self):
        """Verify Trend Hunter products have data for action buttons"""
        response = requests.get(
            f"{BASE_URL}/api/trends/hunter?category=all",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["data"]) > 0:
            product = data["data"][0]
            # These fields are needed for 1688, Alibaba, Mahalliy narx buttons
            assert "name" in product  # Used for search queries
            assert "sourcePrice" in product  # For price comparison
            assert "recommendedPrice" in product
            
        print(f"✅ Trend Hunter products have required data for action buttons")


class TestMarketplaceIntegrations:
    """Marketplace integration endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for partner"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "partner", "password": "partner123"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_get_marketplace_integrations(self, auth_token):
        """Test GET marketplace integrations"""
        response = requests.get(
            f"{BASE_URL}/api/partner/marketplace-integrations",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "integrations" in data or isinstance(data, list)
        print(f"✅ GET marketplace integrations works")
    
    def test_post_marketplace_integration_yandex(self, auth_token):
        """Test POST marketplace integration for Yandex Market"""
        response = requests.post(
            f"{BASE_URL}/api/partner/marketplace-integrations",
            json={
                "marketplace": "yandex",
                "apiKey": "test_api_key_123",
                "apiSecret": "test_secret_456",
                "shopId": "shop_789"
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # The endpoint should respond (may fail validation but endpoint exists)
        assert "success" in data or "message" in data or "error" in data
        print(f"✅ POST marketplace integration endpoint exists and responds")
    
    def test_test_marketplace_connection(self, auth_token):
        """Test marketplace connection test endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/partner/marketplace-integrations/yandex/test",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "success" in data or "message" in data
        print(f"✅ Marketplace test endpoint works")
    
    def test_delete_marketplace_integration(self, auth_token):
        """Test DELETE marketplace integration endpoint"""
        # Use a valid marketplace name from the allowed list
        response = requests.delete(
            f"{BASE_URL}/api/partner/marketplace-integrations/ozon",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        
        # Should return 200 even if marketplace doesn't exist
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        print(f"✅ DELETE marketplace integration endpoint works")


class TestHealthAndStatus:
    """Health and status endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"✅ Health endpoint works")
    
    def test_ai_status_endpoint(self):
        """Test AI status endpoint"""
        response = requests.get(f"{BASE_URL}/api/ai/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "ai" in data
        print(f"✅ AI status endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
