"""
Test MXIK API and Sales Sync Service for SellerCloudX
Tests Uzbekistan tax code (MXIK) search and validation
Tests admin sales sync functionality
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com').rstrip('/')

class TestMXIKAPI:
    """MXIK Code API Tests - Uzbekistan Tax Compliance"""
    
    def test_mxik_status(self):
        """Test /api/mxik/status returns database status"""
        response = requests.get(f"{BASE_URL}/api/mxik/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "loaded" in data
        assert "totalCodes" in data
        assert "source" in data
        assert data["totalCodes"] >= 23  # Built-in codes
        print(f"✅ MXIK Status: {data['totalCodes']} codes loaded from {data['source']}")
    
    def test_mxik_search_telefon(self):
        """Test /api/mxik/search?q=telefon returns matching codes"""
        response = requests.get(f"{BASE_URL}/api/mxik/search?q=telefon")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["query"] == "telefon"
        assert "results" in data
        assert len(data["results"]) > 0
        
        # Check first result is mobile phones
        first_result = data["results"][0]
        assert first_result["code"] == "26101100"
        assert "Mobil telefonlar" in first_result["nameUz"]
        print(f"✅ MXIK Search 'telefon': Found {len(data['results'])} results, best match: {first_result['code']}")
    
    def test_mxik_search_kompyuter(self):
        """Test /api/mxik/search?q=kompyuter returns computer codes"""
        response = requests.get(f"{BASE_URL}/api/mxik/search?q=kompyuter")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert len(data["results"]) > 0
        
        # Should find computers
        codes = [r["code"] for r in data["results"]]
        assert "26201000" in codes  # Kompyuterlar va aksessuarlar
        print(f"✅ MXIK Search 'kompyuter': Found {len(data['results'])} results")
    
    def test_mxik_search_kiyim(self):
        """Test /api/mxik/search?q=kiyim returns clothing codes"""
        response = requests.get(f"{BASE_URL}/api/mxik/search?q=kiyim")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        # Should find clothing categories
        print(f"✅ MXIK Search 'kiyim': Found {len(data['results'])} results")
    
    def test_mxik_search_russian(self):
        """Test /api/mxik/search with Russian language"""
        response = requests.get(f"{BASE_URL}/api/mxik/search?q=телефон&lang=ru")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["language"] == "ru"
        print(f"✅ MXIK Search Russian 'телефон': Found {len(data['results'])} results")
    
    def test_mxik_search_empty_query(self):
        """Test /api/mxik/search with empty query returns error"""
        response = requests.get(f"{BASE_URL}/api/mxik/search")
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] == False
        assert "error" in data
        print("✅ MXIK Search empty query: Correctly returns 400 error")
    
    def test_mxik_best_match(self):
        """Test /api/mxik/best-match?q=product_name returns best MXIK code"""
        response = requests.get(f"{BASE_URL}/api/mxik/best-match?q=Samsung%20Galaxy%20telefon")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "match" in data
        assert data["match"] is not None
        assert "code" in data["match"]
        assert "similarity" in data["match"]
        print(f"✅ MXIK Best Match: {data['match']['code']} ({data['match']['similarity']}% similarity)")
    
    def test_mxik_best_match_with_category(self):
        """Test /api/mxik/best-match with category parameter"""
        response = requests.get(f"{BASE_URL}/api/mxik/best-match?q=unknown_product&category=elektronika")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["category"] == "elektronika"
        print(f"✅ MXIK Best Match with category: {data['match']['code']}")
    
    def test_mxik_validate_valid_code(self):
        """Test /api/mxik/validate/:code validates correct MXIK format"""
        response = requests.get(f"{BASE_URL}/api/mxik/validate/26101100")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["code"] == "26101100"
        assert data["isValidFormat"] == True
        assert data["exists"] == True
        assert data["details"] is not None
        assert data["details"]["nameUz"] == "Mobil telefonlar"
        print(f"✅ MXIK Validate '26101100': Valid format, exists in database")
    
    def test_mxik_validate_invalid_format(self):
        """Test /api/mxik/validate/:code rejects invalid format"""
        response = requests.get(f"{BASE_URL}/api/mxik/validate/12345")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["isValidFormat"] == False
        assert data["exists"] == False
        assert data["details"] is None
        print("✅ MXIK Validate '12345': Correctly identified as invalid format")
    
    def test_mxik_validate_valid_format_not_exists(self):
        """Test /api/mxik/validate/:code for valid format but non-existent code"""
        response = requests.get(f"{BASE_URL}/api/mxik/validate/99999999")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["isValidFormat"] == True  # 8 digits is valid format
        assert data["exists"] == False  # But doesn't exist in database
        print("✅ MXIK Validate '99999999': Valid format but not in database")
    
    def test_mxik_code_details(self):
        """Test /api/mxik/code/:code returns code details"""
        response = requests.get(f"{BASE_URL}/api/mxik/code/26101100")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert data["data"]["code"] == "26101100"
        print(f"✅ MXIK Code Details: {data['data']['nameUz']}")
    
    def test_mxik_code_not_found(self):
        """Test /api/mxik/code/:code returns 404 for non-existent code"""
        response = requests.get(f"{BASE_URL}/api/mxik/code/99999999")
        assert response.status_code == 404
        
        data = response.json()
        assert data["success"] == False
        print("✅ MXIK Code '99999999': Correctly returns 404")


class TestClickTiers:
    """Click Payment Tiers API Tests"""
    
    def test_click_tiers(self):
        """Test /api/click/tiers returns pricing tiers"""
        response = requests.get(f"{BASE_URL}/api/click/tiers")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "tiers" in data
        assert len(data["tiers"]) == 4
        
        # Check tier structure
        tier_ids = [t["id"] for t in data["tiers"]]
        assert "free_starter" in tier_ids
        assert "starter_pro" in tier_ids
        assert "professional_plus" in tier_ids
        assert "enterprise_elite" in tier_ids
        print(f"✅ Click Tiers: {len(data['tiers'])} tiers returned")


class TestAdminSalesSync:
    """Admin Sales Sync API Tests - Requires Authentication"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "admin123"}
        )
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping authenticated tests")
        
        return session
    
    def test_sales_sync_status(self, admin_session):
        """Test /api/admin/sales-sync/status returns sync status"""
        response = admin_session.get(f"{BASE_URL}/api/admin/sales-sync/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        print(f"✅ Sales Sync Status: {data.get('message', 'OK')}")
    
    def test_sales_sync_run(self, admin_session):
        """Test /api/admin/sales-sync/run triggers manual sync"""
        response = admin_session.post(f"{BASE_URL}/api/admin/sales-sync/run")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        # Check sync result structure
        sync_data = data["data"]
        assert "sales" in sync_data
        assert "revenue" in sync_data
        assert "duration" in sync_data
        print(f"✅ Sales Sync Run: Completed in {sync_data['duration']}ms")
        print(f"   - Partners synced: {sync_data['sales']['synced']}/{sync_data['sales']['totalPartners']}")
    
    def test_sales_sync_unauthorized(self):
        """Test /api/admin/sales-sync/run requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/admin/sales-sync/run")
        assert response.status_code == 401
        print("✅ Sales Sync unauthorized: Correctly returns 401")


class TestPricingPage:
    """Pricing Page API Tests"""
    
    def test_pricing_tiers(self):
        """Test /api/pricing-tiers returns pricing information"""
        response = requests.get(f"{BASE_URL}/api/pricing-tiers")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Pricing Tiers: {len(data)} tiers returned")


class TestHealthCheck:
    """Health Check API Tests"""
    
    def test_health(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✅ Health Check: {data['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
