"""
Uzum Automation Endpoints Tests
Tests for Uzum Market browser automation endpoints

Endpoints tested:
- POST /api/uzum-automation/login - Uzum seller login
- POST /api/uzum-automation/create-product - Create product on Uzum
- POST /api/uzum-automation/submit-otp - Submit OTP code
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com')


class TestUzumAutomationLogin:
    """Test /api/uzum-automation/login endpoint"""
    
    def test_login_endpoint_exists(self):
        """Test that login endpoint exists and returns proper JSON"""
        response = requests.post(
            f"{BASE_URL}/api/uzum-automation/login",
            json={
                "partner_id": "test-partner-123",
                "phone_or_email": "test@example.com",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return JSON with success field
        assert "success" in data
        # Without real credentials, should fail but return proper error
        assert data["success"] == False
        assert "error" in data
        
    def test_login_missing_credentials(self):
        """Test login fails gracefully without credentials"""
        response = requests.post(
            f"{BASE_URL}/api/uzum-automation/login",
            json={
                "partner_id": "test-partner-123"
            }
        )
        
        # Should return 422 validation error or 200 with error message
        assert response.status_code in [200, 422]


class TestUzumAutomationCreateProduct:
    """Test /api/uzum-automation/create-product endpoint"""
    
    def test_create_product_endpoint_exists(self):
        """Test that create-product endpoint exists and returns proper JSON"""
        response = requests.post(
            f"{BASE_URL}/api/uzum-automation/create-product",
            json={
                "partner_id": "test-partner-123",
                "phone_or_email": "test@example.com",
                "password": "testpassword123",
                "name": "Test Product",
                "description": "Test description",
                "price": 100000,
                "category": "electronics",
                "quantity": 1
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return JSON with success field
        assert "success" in data
        
    def test_create_product_requires_credentials(self):
        """Test create-product requires credentials"""
        response = requests.post(
            f"{BASE_URL}/api/uzum-automation/create-product",
            json={
                "partner_id": "test-partner-123",
                "name": "Test Product",
                "description": "Test description",
                "price": 100000,
                "category": "electronics",
                "quantity": 1
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should indicate credentials are required
        assert data["success"] == False
        assert "requires_credentials" in data or "error" in data
        
    def test_create_product_with_all_fields(self):
        """Test create-product with all optional fields"""
        response = requests.post(
            f"{BASE_URL}/api/uzum-automation/create-product",
            json={
                "partner_id": "test-partner-123",
                "use_saved_credentials": False,
                "phone_or_email": "test@example.com",
                "password": "testpassword123",
                "name": "Samsung Galaxy A54 5G",
                "description": "Latest Samsung smartphone with 5G support",
                "price": 2500000,
                "category": "electronics",
                "brand": "Samsung",
                "images": [],
                "quantity": 10,
                "ikpu_code": "12345678901234567",
                "weight_kg": 0.5,
                "use_ai_card": True,
                "use_ai_infographic": True,
                "infographic_template": "product_showcase"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "success" in data


class TestYandexMarketCreateProduct:
    """Test /api/yandex-market/create-product endpoint"""
    
    def test_create_product_endpoint_exists(self):
        """Test that Yandex create-product endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/create-product",
            json={
                "partner_id": "test-partner-123",
                "oauth_token": "test_invalid_token",
                "business_id": "12345678",
                "product_name": "Test Product",
                "description": "Test description",
                "brand": "TestBrand",
                "category": "electronics",
                "price": 100000,
                "quantity": 1,
                "weight_kg": 0.5,
                "images": [],
                "auto_generate_card": False
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return JSON with success field
        assert "success" in data
        # Without valid token, should fail but return proper error
        assert data["success"] == False
        assert "error" in data or "details" in data
        
    def test_create_product_with_auto_card_generation(self):
        """Test Yandex create-product with auto card generation"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/create-product",
            json={
                "partner_id": "test-partner-123",
                "oauth_token": "test_invalid_token",
                "business_id": "12345678",
                "product_name": "iPhone 15 Pro Max",
                "description": "Premium smartphone",
                "brand": "Apple",
                "category": "electronics",
                "price": 15000000,
                "quantity": 5,
                "weight_kg": 0.3,
                "images": [],
                "auto_generate_card": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "success" in data


class TestInfographicGenerate:
    """Test /api/infographic/generate endpoint"""
    
    def test_infographic_generate_success(self):
        """Test infographic generation returns image"""
        response = requests.post(
            f"{BASE_URL}/api/infographic/generate",
            json={
                "product_name": "Test Product",
                "brand": "TestBrand",
                "features": ["Feature 1", "Feature 2", "Feature 3"],
                "template": "product_showcase",
                "marketplace": "uzum",
                "background": "white"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "image_base64" in data
        assert len(data["image_base64"]) > 100  # Should have actual image data
        assert "mime_type" in data
        
    def test_infographic_different_templates(self):
        """Test infographic with different templates"""
        templates = ["product_showcase", "features_highlight", "comparison", "lifestyle", "bundle"]
        
        for template in templates:
            response = requests.post(
                f"{BASE_URL}/api/infographic/generate",
                json={
                    "product_name": "Test Product",
                    "brand": "TestBrand",
                    "features": ["Feature 1"],
                    "template": template,
                    "marketplace": "uzum",
                    "background": "white"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True, f"Template {template} failed"


class TestUnifiedScannerFullProcess:
    """Test /api/unified-scanner/full-process endpoint"""
    
    def test_full_process_success(self):
        """Test full process returns complete product data"""
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/full-process",
            json={
                "partner_id": "test-partner-123",
                "cost_price": 2500000,
                "quantity": 10,
                "category": "electronics",
                "brand": "Samsung",
                "weight_kg": 0.5,
                "fulfillment": "fbs",
                "product_name": "Samsung Galaxy A54 5G",
                "description": "Smartphone with 128GB storage",
                "auto_ikpu": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "data" in data
        
        result = data["data"]
        assert "price_optimization" in result
        assert "product_card" in result
        assert "sku" in result


class TestHealthEndpoint:
    """Test health endpoint"""
    
    def test_health_check(self):
        """Test health endpoint returns ok"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] in ["ok", "healthy"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
