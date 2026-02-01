"""
AI Product Creator - 6-Step Wizard Integration Tests
Tests the full integrated workflow: Camera → AI Detection → Cost Input → AI Infographic → Marketplace → Product Card

Endpoints tested:
- POST /api/unified-scanner/scan-image - Image scanning
- POST /api/unified-scanner/full-process - Uzum Market full process
- POST /api/yandex-market/full-process - Yandex Market full process
- POST /api/infographic/generate - AI Infographic generation
- GET /api/unified-scanner/uzum-rules - Uzum rules
- GET /api/yandex-market/rules - Yandex rules
"""

import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com')


class TestUnifiedScannerFullProcess:
    """Test Uzum Market full product creation flow"""
    
    def test_uzum_full_process_success(self):
        """Test complete Uzum Market product creation"""
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
        
        # Verify success
        assert data["success"] == True
        assert "data" in data
        
        # Verify steps completed
        result_data = data["data"]
        assert "steps_completed" in result_data
        assert "price_optimization" in result_data
        assert "product_card" in result_data
        assert "sku" in result_data
        
        # Verify price optimization
        price_opt = result_data["price_optimization"]
        assert "min_price" in price_opt
        assert "optimal_price" in price_opt
        assert "max_price" in price_opt
        assert price_opt["optimal_price"] > price_opt["min_price"]
        
        # Verify product card
        card = result_data["product_card"]
        assert "title_uz" in card
        assert "title_ru" in card
        assert "description_uz" in card
        assert "description_ru" in card
        
        # Verify final package
        assert "final_package" in result_data
        final = result_data["final_package"]
        assert final["product_name"] == "Samsung Galaxy A54 5G"
        assert final["brand"] == "Samsung"
        assert final["category"] == "electronics"
        
    def test_uzum_full_process_missing_product_name(self):
        """Test error handling when product name is missing"""
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/full-process",
            json={
                "partner_id": "test-partner-123",
                "cost_price": 2500000,
                "quantity": 10,
                "category": "electronics"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == False
        assert "error" in data


class TestYandexMarketFullProcess:
    """Test Yandex Market full product creation flow"""
    
    def test_yandex_full_process_success(self):
        """Test complete Yandex Market product creation"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "test-partner-123",
                "cost_price": 15000000,
                "quantity": 5,
                "category": "electronics",
                "brand": "Apple",
                "weight_kg": 0.3,
                "fulfillment": "fbs",
                "payout_frequency": "weekly",
                "product_name": "iPhone 15 Pro Max 256GB",
                "description": "Premium smartphone with A17 Pro chip"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify success
        assert data["success"] == True
        assert "data" in data
        
        # Verify marketplace
        result_data = data["data"]
        assert result_data["marketplace"] == "yandex"
        
        # Verify steps completed
        assert "steps_completed" in result_data
        assert "price_calculation" in result_data["steps_completed"]
        assert "category_mapping" in result_data["steps_completed"]
        assert "card_generation" in result_data["steps_completed"]
        
        # Verify price optimization
        price_opt = result_data["price_optimization"]
        assert "min_price" in price_opt
        assert "optimal_price" in price_opt
        assert "max_price" in price_opt
        
        # Verify product card (Russian only for Yandex)
        card = result_data["product_card"]
        assert "name" in card
        assert "description" in card
        assert "vendor" in card
        
        # Verify category ID
        assert "category_id" in result_data
        assert result_data["category_id"] == 91491  # Electronics category
        
    def test_yandex_full_process_different_category(self):
        """Test Yandex process with clothing category"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "test-partner-123",
                "cost_price": 500000,
                "quantity": 20,
                "category": "clothing",
                "brand": "Zara",
                "weight_kg": 0.5,
                "fulfillment": "fbs",
                "payout_frequency": "weekly",
                "product_name": "Men's Cotton T-Shirt",
                "description": "Comfortable cotton t-shirt"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestMarketplaceRules:
    """Test marketplace rules endpoints"""
    
    def test_uzum_rules(self):
        """Test Uzum Market rules endpoint"""
        response = requests.get(f"{BASE_URL}/api/unified-scanner/uzum-rules")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "rules" in data
        
        rules = data["rules"]
        assert "stop_words" in rules
        assert "commission_rates" in rules
        assert "media_requirements" in rules
        assert "card_requirements" in rules
        
        # Verify media requirements
        media = rules["media_requirements"]
        assert media["image"]["width"] == 1080
        assert media["image"]["height"] == 1440
        assert media["image"]["aspect_ratio"] == "3:4"
        
    def test_yandex_rules(self):
        """Test Yandex Market rules endpoint"""
        response = requests.get(f"{BASE_URL}/api/yandex-market/rules")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "rules" in data
        
        rules = data["rules"]
        assert "commission_rates" in rules
        assert "media_requirements" in rules
        assert "categories" in rules
        assert "card_requirements" in rules
        
        # Verify media requirements (1:1 ratio for Yandex)
        media = rules["media_requirements"]
        assert media["image"]["recommended_width"] == 1000
        assert media["image"]["recommended_height"] == 1000
        assert media["image"]["aspect_ratio"] == "1:1"
        assert media["image"]["background"] == "white_required"


class TestInfographicIntegration:
    """Test infographic generation as part of the flow"""
    
    def test_infographic_generate_for_uzum(self):
        """Test infographic generation for Uzum marketplace"""
        response = requests.post(
            f"{BASE_URL}/api/infographic/generate",
            json={
                "product_name": "Samsung Galaxy A54 5G",
                "brand": "Samsung",
                "features": ["128GB storage", "5G connectivity", "AMOLED display"],
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
        
    def test_infographic_generate_for_yandex(self):
        """Test infographic generation for Yandex marketplace"""
        response = requests.post(
            f"{BASE_URL}/api/infographic/generate",
            json={
                "product_name": "iPhone 15 Pro Max",
                "brand": "Apple",
                "features": ["A17 Pro chip", "Titanium design", "48MP camera"],
                "template": "features_highlight",
                "marketplace": "yandex",
                "background": "white"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "image_base64" in data


class TestPriceCalculation:
    """Test price calculation accuracy"""
    
    def test_uzum_price_breakdown(self):
        """Verify Uzum price breakdown includes all fees"""
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/full-process",
            json={
                "partner_id": "test-partner-123",
                "cost_price": 1000000,
                "quantity": 1,
                "category": "electronics",
                "brand": "Test",
                "weight_kg": 1.0,
                "fulfillment": "fbs",
                "product_name": "Test Product"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data["success"]:
            breakdown = data["data"]["price_breakdown"]
            assert "cost_price" in breakdown
            assert "commission" in breakdown
            assert "logistics" in breakdown
            assert "tax" in breakdown
            
    def test_yandex_price_breakdown(self):
        """Verify Yandex price breakdown includes payout fee"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "test-partner-123",
                "cost_price": 1000000,
                "quantity": 1,
                "category": "electronics",
                "brand": "Test",
                "weight_kg": 1.0,
                "fulfillment": "fbs",
                "payout_frequency": "weekly",
                "product_name": "Test Product"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data["success"]:
            breakdown = data["data"]["price_breakdown"]
            assert "cost_price" in breakdown
            assert "commission" in breakdown
            assert "payout_fee" in breakdown  # Yandex-specific
            assert "logistics" in breakdown


class TestDataFlow:
    """Test data flows correctly between steps"""
    
    def test_product_name_preserved(self):
        """Verify product name is preserved through the flow"""
        product_name = "Test Product XYZ-123"
        
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/full-process",
            json={
                "partner_id": "test-partner-123",
                "cost_price": 500000,
                "quantity": 1,
                "category": "electronics",
                "product_name": product_name
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data["success"]:
            final = data["data"]["final_package"]
            assert final["product_name"] == product_name
            
    def test_brand_preserved(self):
        """Verify brand is preserved through the flow"""
        brand = "TestBrand"
        
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "test-partner-123",
                "cost_price": 500000,
                "quantity": 1,
                "category": "electronics",
                "brand": brand,
                "product_name": "Test Product"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data["success"]:
            final = data["data"]["final_package"]
            assert final["brand"] == brand


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
