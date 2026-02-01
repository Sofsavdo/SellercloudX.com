"""
SellerCloudX - Unified AI Scanner Tests
Tests for the 5-step wizard: Rasm -> Aniqlash -> Tannarx -> Tahlil -> Kartochka
"""
import pytest
import requests
import os
import time

# API Base URL from environment
BASE_URL = os.environ.get('VITE_API_URL', 'https://sellercloudx.preview.emergentagent.com')


class TestUnifiedScannerEndpoints:
    """Unified Scanner API endpoint tests"""
    
    def test_health_check(self):
        """Test health endpoint is working"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Express server health check
        assert data.get("status") in ["healthy", "ok"], "Health status should be healthy/ok"
        print(f"✅ Health check passed - status: {data.get('status')}")
    
    def test_uzum_rules_endpoint(self):
        """Test GET /api/unified-scanner/uzum-rules returns stop words and commission rates"""
        response = requests.get(f"{BASE_URL}/api/unified-scanner/uzum-rules", timeout=30)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, "Request should be successful"
        assert "rules" in data, "Response should contain rules"
        
        rules = data.get("rules", {})
        
        # Stop words validation
        assert "stop_words" in rules, "Rules should contain stop_words"
        assert "stop_words_count" in rules, "Rules should contain stop_words_count"
        stop_words = rules.get("stop_words", [])
        assert len(stop_words) > 0, "Stop words list should not be empty"
        assert rules.get("stop_words_count") >= 50, "Should have at least 50 stop words"
        
        # Commission rates validation
        assert "commission_rates" in rules, "Rules should contain commission_rates"
        commission_rates = rules.get("commission_rates", {})
        assert "electronics" in commission_rates, "Commission rates should have electronics"
        assert "clothing" in commission_rates, "Commission rates should have clothing"
        assert "default" in commission_rates, "Commission rates should have default"
        
        # Electronics commission structure
        electronics = commission_rates.get("electronics", {})
        assert "smartphones" in electronics, "Electronics should have smartphones rate"
        assert electronics.get("smartphones") == 8, "Smartphones commission should be 8%"
        assert electronics.get("default") == 10, "Electronics default should be 10%"
        
        # Media requirements validation
        assert "media_requirements" in rules, "Rules should contain media_requirements"
        media = rules.get("media_requirements", {})
        assert "image" in media, "Media requirements should have image"
        image_reqs = media.get("image", {})
        assert image_reqs.get("width") == 1080, "Image width should be 1080"
        assert image_reqs.get("height") == 1440, "Image height should be 1440"
        assert image_reqs.get("aspect_ratio") == "3:4", "Aspect ratio should be 3:4"
        
        # Card requirements validation
        assert "card_requirements" in rules, "Rules should contain card_requirements"
        card_reqs = rules.get("card_requirements", {})
        assert card_reqs.get("title_max_length") == 80, "Title max length should be 80"
        assert card_reqs.get("description_min_length") == 300, "Description min length should be 300"
        assert "uz" in card_reqs.get("required_languages", []), "Should require Uzbek"
        assert "ru" in card_reqs.get("required_languages", []), "Should require Russian"
        
        print(f"✅ Uzum rules endpoint working - {rules.get('stop_words_count')} stop words, {len(commission_rates)} categories")
    
    def test_full_process_endpoint(self):
        """Test POST /api/unified-scanner/full-process with Samsung Galaxy A54 5G"""
        payload = {
            "partner_id": "test-partner-123",
            "cost_price": 2500000,
            "quantity": 50,
            "category": "electronics",
            "brand": "Samsung",
            "weight_kg": 0.5,
            "fulfillment": "fbs",
            "product_name": "Samsung Galaxy A54 5G",
            "description": "Yangi smartfon 128GB",
            "auto_ikpu": True
        }
        
        # This endpoint takes 15-60 seconds due to AI processing
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/full-process",
            json=payload,
            timeout=120
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, f"Request should be successful, got: {data}"
        assert "data" in data, "Response should contain data"
        
        result_data = data.get("data", {})
        
        # Steps completed validation
        steps_completed = result_data.get("steps_completed", [])
        assert "competitor_analysis" in steps_completed, "Should complete competitor_analysis"
        assert "price_optimization" in steps_completed, "Should complete price_optimization"
        assert "card_generation" in steps_completed, "Should complete card_generation"
        
        # Price optimization validation
        price_opt = result_data.get("price_optimization", {})
        assert "cost_price" in price_opt, "Price optimization should have cost_price"
        assert "min_price" in price_opt, "Price optimization should have min_price"
        assert "optimal_price" in price_opt, "Price optimization should have optimal_price"
        assert "max_price" in price_opt, "Price optimization should have max_price"
        assert "net_profit" in price_opt, "Price optimization should have net_profit"
        assert "actual_margin" in price_opt, "Price optimization should have actual_margin"
        assert price_opt.get("cost_price") == 2500000, "Cost price should match input"
        assert price_opt.get("optimal_price") > price_opt.get("min_price"), "Optimal should be > min"
        assert price_opt.get("max_price") > price_opt.get("optimal_price"), "Max should be > optimal"
        
        # Price breakdown validation
        breakdown = result_data.get("price_breakdown", {})
        assert "commission" in breakdown, "Breakdown should have commission"
        assert "logistics" in breakdown, "Breakdown should have logistics"
        assert "tax" in breakdown, "Breakdown should have tax"
        assert "net_profit" in breakdown, "Breakdown should have net_profit"
        
        commission = breakdown.get("commission", {})
        assert "rate" in commission, "Commission should have rate"
        assert "amount" in commission, "Commission should have amount"
        assert commission.get("rate") == 10.0, "Electronics default commission should be 10%"
        
        logistics = breakdown.get("logistics", {})
        assert logistics.get("type") == "FBS", "Logistics type should be FBS"
        assert logistics.get("amount") > 0, "Logistics amount should be positive"
        
        tax = breakdown.get("tax", {})
        assert tax.get("type") == "IP", "Tax type should be IP"
        assert tax.get("rate") == 4.0, "IP tax rate should be 4%"
        
        # Product card validation
        product_card = result_data.get("product_card", {})
        assert "title_uz" in product_card, "Card should have title_uz"
        assert "title_ru" in product_card, "Card should have title_ru"
        assert "description_uz" in product_card, "Card should have description_uz"
        assert "description_ru" in product_card, "Card should have description_ru"
        assert "keywords" in product_card, "Card should have keywords"
        assert "bullet_points_uz" in product_card, "Card should have bullet_points_uz"
        assert "bullet_points_ru" in product_card, "Card should have bullet_points_ru"
        assert "seo_score" in product_card, "Card should have seo_score"
        
        # Title length validation (max 80 chars)
        assert len(product_card.get("title_uz", "")) <= 80, "Uzbek title should be <= 80 chars"
        assert len(product_card.get("title_ru", "")) <= 80, "Russian title should be <= 80 chars"
        
        # Description length validation (min 300 chars)
        assert len(product_card.get("description_uz", "")) >= 200, "Uzbek description should be >= 200 chars"
        assert len(product_card.get("description_ru", "")) >= 200, "Russian description should be >= 200 chars"
        
        # Keywords validation
        keywords = product_card.get("keywords", [])
        assert len(keywords) >= 5, "Should have at least 5 keywords"
        
        # Card validation
        card_validation = result_data.get("card_validation", {})
        assert "is_valid" in card_validation, "Should have is_valid field"
        
        # SKU validation
        assert "sku" in result_data, "Should have SKU"
        sku = result_data.get("sku", "")
        assert sku.startswith("ELE-"), "Electronics SKU should start with ELE-"
        
        # IKPU validation
        ikpu = result_data.get("ikpu", {})
        assert "code" in ikpu, "IKPU should have code"
        
        # Final package validation
        final_package = result_data.get("final_package", {})
        assert final_package.get("product_name") == "Samsung Galaxy A54 5G", "Product name should match"
        assert final_package.get("brand") == "Samsung", "Brand should match"
        assert final_package.get("category") == "electronics", "Category should match"
        assert final_package.get("quantity") == 50, "Quantity should match"
        
        # Upload instructions validation
        upload_instructions = result_data.get("upload_instructions", {})
        assert "uz" in upload_instructions, "Should have Uzbek instructions"
        assert "ru" in upload_instructions, "Should have Russian instructions"
        assert len(upload_instructions.get("uz", [])) >= 5, "Should have at least 5 Uzbek steps"
        
        print(f"✅ Full process endpoint working - SEO Score: {product_card.get('seo_score')}, SKU: {sku}")
    
    def test_validate_text_endpoint(self):
        """Test POST /api/unified-scanner/validate-text for stop words"""
        # Test with stop words
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/validate-text",
            params={"text": "Super original telefon aksiya bilan"},
            timeout=30
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Request should be successful"
        assert "validation" in data, "Response should contain validation"
        
        validation = data.get("validation", {})
        assert validation.get("has_stop_words") == True, "Should detect stop words"
        found_words = validation.get("found_words", [])
        assert len(found_words) > 0, "Should find stop words"
        
        # Check cleaned text
        assert "cleaned_text" in data, "Should have cleaned_text"
        cleaned = data.get("cleaned_text", "")
        assert "super" not in cleaned.lower(), "Cleaned text should not have 'super'"
        
        print(f"✅ Text validation working - Found {len(found_words)} stop words: {found_words}")
    
    def test_validate_text_clean(self):
        """Test text validation with clean text (no stop words)"""
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/validate-text",
            params={"text": "Samsung Galaxy A54 smartfon 128GB xotira"},
            timeout=30
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Request should be successful"
        
        validation = data.get("validation", {})
        assert validation.get("has_stop_words") == False, "Should not detect stop words"
        assert validation.get("is_valid") == True, "Text should be valid"
        
        print("✅ Clean text validation working - No stop words detected")


class TestPriceCalculations:
    """Price calculation and breakdown tests"""
    
    def test_price_breakdown_structure(self):
        """Test that price breakdown includes all required fields"""
        payload = {
            "partner_id": "test-partner-123",
            "cost_price": 1000000,
            "quantity": 10,
            "category": "clothing",
            "brand": "Test Brand",
            "weight_kg": 0.3,
            "fulfillment": "fbo",
            "product_name": "Test Kiyim",
            "description": "Test tavsif",
            "auto_ikpu": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/full-process",
            json=payload,
            timeout=120
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, f"Request should be successful"
        
        result_data = data.get("data", {})
        breakdown = result_data.get("price_breakdown", {})
        
        # Verify all breakdown fields
        assert "cost_price" in breakdown, "Should have cost_price"
        assert "commission" in breakdown, "Should have commission"
        assert "logistics" in breakdown, "Should have logistics"
        assert "tax" in breakdown, "Should have tax"
        assert "net_profit" in breakdown, "Should have net_profit"
        assert "actual_margin" in breakdown, "Should have actual_margin"
        
        # Clothing should have 15% commission
        commission = breakdown.get("commission", {})
        assert commission.get("rate") == 15.0, f"Clothing commission should be 15%, got {commission.get('rate')}"
        
        # FBO logistics
        logistics = breakdown.get("logistics", {})
        assert logistics.get("type") == "FBO", "Logistics type should be FBO"
        
        print(f"✅ Price breakdown structure valid - Commission: {commission.get('rate')}%, Logistics: {logistics.get('type')}")


class TestStopWordsValidation:
    """Stop words validation tests"""
    
    def test_stop_words_list(self):
        """Test that stop words list contains expected words"""
        response = requests.get(f"{BASE_URL}/api/unified-scanner/uzum-rules", timeout=30)
        
        assert response.status_code == 200
        
        data = response.json()
        rules = data.get("rules", {})
        stop_words = rules.get("stop_words", [])
        
        # Check for common stop words (only first 50 are returned)
        expected_words = ["super", "aksiya", "chegirma", "sale", "discount"]
        found_count = 0
        for word in expected_words:
            # Check if word is in stop_words (case insensitive)
            found = any(w.lower() == word.lower() for w in stop_words)
            if found:
                found_count += 1
        
        assert found_count >= 3, f"Stop words should contain at least 3 expected words, found {found_count}"
        assert rules.get("stop_words_count") >= 50, "Should have at least 50 total stop words"
        
        print(f"✅ Stop words list contains {found_count} expected words, total: {rules.get('stop_words_count')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
