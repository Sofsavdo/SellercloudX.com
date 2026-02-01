"""
SellerCloudX API Tests
Tests for Click Payment, Trend Hunter, AI Scanner, and Auth endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com').rstrip('/')

class TestHealthEndpoints:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get('status') == 'ok'
        print(f"PASS: Health endpoint returns status: {data.get('status')}")
    
    def test_api_health_endpoint(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("PASS: API health endpoint returns 200")


class TestClickPaymentAPI:
    """Click Payment API tests"""
    
    def test_get_tiers(self):
        """Test GET /api/click/tiers - returns tier pricing data"""
        response = requests.get(f"{BASE_URL}/api/click/tiers")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('success') == True
        assert 'tiers' in data
        assert len(data['tiers']) >= 4  # At least 4 tiers expected
        
        # Verify tier structure
        for tier in data['tiers']:
            assert 'id' in tier
            assert 'name' in tier
            assert 'monthlyPrice' in tier
            assert 'annualPrice' in tier
            assert 'currency' in tier
            assert tier['currency'] == 'UZS'
        
        # Verify specific tiers exist
        tier_ids = [t['id'] for t in data['tiers']]
        assert 'free_starter' in tier_ids
        assert 'starter_pro' in tier_ids
        
        print(f"PASS: Click tiers endpoint returns {len(data['tiers'])} tiers")
    
    def test_create_payment_requires_auth(self):
        """Test POST /api/click/create-payment requires authentication"""
        response = requests.post(f"{BASE_URL}/api/click/create-payment", json={
            "tier": "starter_pro",
            "billingPeriod": "monthly"
        })
        assert response.status_code == 401
        print("PASS: Create payment requires authentication")


class TestTrendHunterAPI:
    """Trend Hunter API tests"""
    
    def test_opportunities_requires_auth(self):
        """Test GET /api/trends/opportunities requires authentication"""
        response = requests.get(f"{BASE_URL}/api/trends/opportunities")
        assert response.status_code == 401
        
        data = response.json()
        assert 'UNAUTHORIZED' in str(data) or 'Avtorizatsiya' in str(data)
        print("PASS: Trend Hunter requires authentication")


class TestAIScannerAPI:
    """AI Scanner API tests"""
    
    def test_unified_scanner_analyze_base64(self):
        """Test POST /api/unified-scanner/analyze-base64 - public endpoint"""
        # Small test image (1x1 pixel PNG)
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(f"{BASE_URL}/api/unified-scanner/analyze-base64", json={
            "image_base64": test_image_base64,
            "language": "uz"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return success with product info or error message
        assert 'success' in data
        print(f"PASS: Unified scanner analyze-base64 returns: success={data.get('success')}")
    
    def test_unified_scanner_full_process(self):
        """Test POST /api/unified-scanner/full-process"""
        response = requests.post(f"{BASE_URL}/api/unified-scanner/full-process", json={
            "partner_id": "test_partner",  # Required field
            "cost_price": 50000,
            "quantity": 10,
            "category": "electronics",
            "brand": "Samsung",
            "weight_kg": 0.5,
            "fulfillment": "fbs",
            "product_name": "Test Product",
            "description": "Test description"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get('success') == True
        assert 'data' in data
        
        # Verify price optimization
        assert 'price_optimization' in data['data']
        price_opt = data['data']['price_optimization']
        assert 'min_price' in price_opt
        assert 'optimal_price' in price_opt
        assert 'max_price' in price_opt
        
        # Verify product card
        assert 'product_card' in data['data']
        
        print(f"PASS: Full process returns optimal price: {price_opt.get('optimal_price')}")


class TestAuthAPI:
    """Authentication API tests"""
    
    def test_login_success(self):
        """Test POST /api/auth/login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'user' in data
        assert data['user']['username'] == 'admin'
        assert data['user']['role'] == 'admin'
        assert 'message' in data
        
        print(f"PASS: Admin login successful, role: {data['user']['role']}")
    
    def test_login_invalid_credentials(self):
        """Test POST /api/auth/login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "invalid_user",
            "password": "wrong_password"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert 'INVALID_CREDENTIALS' in str(data) or "noto'g'ri" in str(data).lower()
        
        print("PASS: Invalid credentials returns 401")
    
    def test_auth_me_requires_session(self):
        """Test GET /api/auth/me requires session"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("PASS: Auth me requires session")


class TestAuthenticatedEndpoints:
    """Tests for endpoints that require authentication"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        return session
    
    def test_trend_hunter_with_auth(self, auth_session):
        """Test Trend Hunter with authentication"""
        response = auth_session.get(f"{BASE_URL}/api/trends/opportunities?limit=3")
        
        # Should return 200 with data or 403 if tier restricted
        assert response.status_code in [200, 403]
        
        if response.status_code == 200:
            data = response.json()
            print(f"PASS: Trend Hunter returns data with auth")
        else:
            print("PASS: Trend Hunter requires higher tier (expected for admin)")
    
    def test_auth_me_with_session(self, auth_session):
        """Test GET /api/auth/me with valid session"""
        response = auth_session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        
        data = response.json()
        assert 'user' in data
        assert data['user']['username'] == 'admin'
        
        print("PASS: Auth me returns user data with session")
    
    def test_admin_partners_list(self, auth_session):
        """Test GET /api/admin/partners - admin only"""
        response = auth_session.get(f"{BASE_URL}/api/admin/partners")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        print(f"PASS: Admin partners list returns {len(data)} partners")


class TestPricingTiers:
    """Pricing tiers API tests"""
    
    def test_get_pricing_tiers(self):
        """Test GET /api/pricing-tiers"""
        response = requests.get(f"{BASE_URL}/api/pricing-tiers")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        print(f"PASS: Pricing tiers returns {len(data)} tiers")


class TestRegistrationAPI:
    """Registration API tests"""
    
    def test_registration_requires_inn(self):
        """Test POST /api/auth/register requires INN"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test User",
            "phone": "+998901234567"
            # Missing INN
        })
        
        # Should return 400 because INN is required
        assert response.status_code == 400
        data = response.json()
        assert 'INN' in str(data) or 'STIR' in str(data) or 'inn' in str(data).lower()
        
        print("PASS: Registration requires INN/STIR")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
