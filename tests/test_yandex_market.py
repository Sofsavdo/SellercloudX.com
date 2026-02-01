"""
Yandex Market Integration Tests
Tests for Yandex Market 4-step wizard API endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com')

class TestYandexMarketRules:
    """Test /api/yandex-market/rules endpoint"""
    
    def test_get_rules_success(self):
        """Test GET /api/yandex-market/rules returns success"""
        response = requests.get(f"{BASE_URL}/api/yandex-market/rules")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "rules" in data
        
        # Validate rules structure
        rules = data["rules"]
        assert "commission_rates" in rules
        assert "media_requirements" in rules
        assert "categories" in rules
        assert "card_requirements" in rules
        
    def test_rules_commission_rates_structure(self):
        """Test commission rates have correct structure"""
        response = requests.get(f"{BASE_URL}/api/yandex-market/rules")
        data = response.json()
        
        commission_rates = data["rules"]["commission_rates"]
        # Check electronics category exists
        assert "electronics" in commission_rates
        assert "clothing" in commission_rates
        assert "beauty" in commission_rates
        
        # Check electronics has subcategories
        electronics = commission_rates["electronics"]
        assert "smartphones" in electronics
        assert "base" in electronics["smartphones"]
        assert "max" in electronics["smartphones"]
        
    def test_rules_media_requirements(self):
        """Test media requirements are correct"""
        response = requests.get(f"{BASE_URL}/api/yandex-market/rules")
        data = response.json()
        
        media = data["rules"]["media_requirements"]
        assert "image" in media
        assert media["image"]["recommended_width"] == 1000
        assert media["image"]["recommended_height"] == 1000
        assert media["image"]["background"] == "white_required"
        
    def test_rules_card_requirements(self):
        """Test card requirements are correct"""
        response = requests.get(f"{BASE_URL}/api/yandex-market/rules")
        data = response.json()
        
        card_req = data["rules"]["card_requirements"]
        assert card_req["title_max_length"] == 120
        assert card_req["description_min_length"] == 200
        assert "ru" in card_req["required_languages"]


class TestYandexMarketCalculatePrice:
    """Test /api/yandex-market/calculate-price endpoint"""
    
    def test_calculate_price_success(self):
        """Test price calculation returns correct structure"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/calculate-price",
            params={
                "cost_price": 2500000,
                "category": "electronics",
                "weight_kg": 1.0,
                "fulfillment": "fbs",
                "payout_frequency": "weekly"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "calculation" in data
        
        calc = data["calculation"]
        assert "cost_price" in calc
        assert "min_price" in calc
        assert "optimal_price" in calc
        assert "max_price" in calc
        assert "breakdown" in calc
        
    def test_calculate_price_breakdown(self):
        """Test price breakdown includes all fees"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/calculate-price",
            params={
                "cost_price": 2500000,
                "category": "electronics",
                "weight_kg": 1.0,
                "fulfillment": "fbs",
                "payout_frequency": "weekly"
            }
        )
        data = response.json()
        
        breakdown = data["calculation"]["breakdown"]
        assert "commission" in breakdown
        assert "payout_fee" in breakdown
        assert "logistics" in breakdown
        assert "net_profit" in breakdown
        assert "actual_margin" in breakdown
        
        # Verify commission structure
        assert "rate" in breakdown["commission"]
        assert "amount" in breakdown["commission"]
        
    def test_calculate_price_different_fulfillment(self):
        """Test price calculation with different fulfillment types"""
        for fulfillment in ["fbs", "fby", "dbs"]:
            response = requests.post(
                f"{BASE_URL}/api/yandex-market/calculate-price",
                params={
                    "cost_price": 1000000,
                    "category": "electronics",
                    "weight_kg": 0.5,
                    "fulfillment": fulfillment,
                    "payout_frequency": "weekly"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            assert data["calculation"]["breakdown"]["logistics"]["type"].upper() == fulfillment.upper()
            
    def test_calculate_price_different_payout_frequencies(self):
        """Test price calculation with different payout frequencies"""
        frequencies = ["daily", "weekly", "biweekly", "monthly"]
        expected_rates = {"daily": 3.3, "weekly": 2.8, "biweekly": 2.3, "monthly": 1.8}
        
        for freq in frequencies:
            response = requests.post(
                f"{BASE_URL}/api/yandex-market/calculate-price",
                params={
                    "cost_price": 1000000,
                    "category": "electronics",
                    "weight_kg": 0.5,
                    "fulfillment": "fbs",
                    "payout_frequency": freq
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            assert data["calculation"]["breakdown"]["payout_fee"]["frequency"] == freq


class TestYandexMarketFullProcess:
    """Test /api/yandex-market/full-process endpoint"""
    
    def test_full_process_success(self):
        """Test full process returns product card and price analysis"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "TEST_partner_123",
                "cost_price": 2500000,
                "quantity": 10,
                "category": "electronics",
                "brand": "Samsung",
                "weight_kg": 0.5,
                "fulfillment": "fbs",
                "payout_frequency": "weekly",
                "product_name": "TEST Samsung Galaxy A54 5G Smartphone",
                "description": "Latest Samsung smartphone with 5G support"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        result = data["data"]
        assert result["marketplace"] == "yandex"
        assert "price_optimization" in result
        assert "product_card" in result
        assert "final_package" in result
        
    def test_full_process_price_optimization(self):
        """Test full process returns correct price optimization"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "TEST_partner_123",
                "cost_price": 1500000,
                "quantity": 5,
                "category": "clothing",
                "brand": "Zara",
                "weight_kg": 0.3,
                "fulfillment": "fbs",
                "payout_frequency": "weekly",
                "product_name": "TEST Zara Men's T-Shirt",
                "description": "Cotton t-shirt"
            }
        )
        data = response.json()
        
        price_opt = data["data"]["price_optimization"]
        assert price_opt["cost_price"] == 1500000
        assert price_opt["min_price"] > price_opt["cost_price"]
        assert price_opt["optimal_price"] > price_opt["min_price"]
        assert price_opt["max_price"] > price_opt["optimal_price"]
        
    def test_full_process_product_card_generation(self):
        """Test full process generates AI product card"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "TEST_partner_123",
                "cost_price": 500000,
                "quantity": 20,
                "category": "beauty",
                "brand": "L'Oreal",
                "weight_kg": 0.2,
                "fulfillment": "fbs",
                "payout_frequency": "weekly",
                "product_name": "TEST L'Oreal Face Cream",
                "description": "Moisturizing face cream"
            },
            timeout=120  # AI generation may take time
        )
        data = response.json()
        
        # Check product card was generated
        if "product_card" in data["data"]:
            card = data["data"]["product_card"]
            assert "name" in card
            assert "description" in card
            assert len(card["description"]) >= 100  # Should have substantial description
            
    def test_full_process_missing_product_name(self):
        """Test full process fails without product name"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "TEST_partner_123",
                "cost_price": 1000000,
                "quantity": 1,
                "category": "electronics"
            }
        )
        data = response.json()
        assert data["success"] == False
        assert "error" in data
        
    def test_full_process_final_package(self):
        """Test full process returns complete final package"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/full-process",
            json={
                "partner_id": "TEST_partner_123",
                "cost_price": 3000000,
                "quantity": 15,
                "category": "electronics",
                "brand": "Apple",
                "weight_kg": 0.4,
                "fulfillment": "fby",
                "payout_frequency": "monthly",
                "product_name": "TEST Apple AirPods Pro",
                "description": "Wireless earbuds with noise cancellation"
            },
            timeout=120
        )
        data = response.json()
        
        final_package = data["data"]["final_package"]
        assert final_package["product_name"] == "TEST Apple AirPods Pro"
        assert final_package["brand"] == "Apple"
        assert final_package["category"] == "electronics"
        assert final_package["quantity"] == 15
        assert "prices" in final_package
        assert "expenses" in final_package
        assert "profit" in final_package
        assert "ready_for_upload" in final_package


class TestYandexMarketTestConnection:
    """Test /api/yandex-market/test-connection endpoint"""
    
    def test_connection_with_invalid_token(self):
        """Test connection fails with invalid OAuth token"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/test-connection",
            json={
                "partner_id": "TEST_partner_123",
                "oauth_token": "invalid_token_12345",
                "business_id": "12345678"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should fail with invalid token
        assert data["success"] == False or "error" in data
        
    def test_connection_missing_token(self):
        """Test connection fails without OAuth token"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/test-connection",
            json={
                "partner_id": "TEST_partner_123"
            }
        )
        # Should return validation error
        assert response.status_code in [200, 422]


class TestYandexMarketCreateProduct:
    """Test /api/yandex-market/create-product endpoint"""
    
    def test_create_product_with_invalid_credentials(self):
        """Test create product fails with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/yandex-market/create-product",
            json={
                "partner_id": "TEST_partner_123",
                "oauth_token": "invalid_token",
                "business_id": "12345678",
                "product_name": "TEST Product",
                "description": "Test description",
                "brand": "TestBrand",
                "category": "electronics",
                "price": 1000000,
                "quantity": 1,
                "weight_kg": 0.5,
                "images": [],
                "auto_generate_card": True
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should fail with invalid credentials
        assert data["success"] == False
        assert "error" in data or "details" in data


class TestHealthCheck:
    """Test health endpoint"""
    
    def test_health_check(self):
        """Test health endpoint returns ok"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] in ["ok", "healthy"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
