"""
SellerCloudX - Uzum Market & AI Scanner Integration Tests
Tests for Uzum Market API and AI Product Scanner functionality
"""
import pytest
import requests
import os
import base64

# API Base URL from environment
BASE_URL = os.environ.get('VITE_API_URL', 'https://sellercloudx.preview.emergentagent.com')

class TestUzumMarketAPI:
    """Uzum Market API endpoint tests"""
    
    def test_uzum_test_connection(self):
        """Test Uzum Market API connection endpoint"""
        response = requests.get(f"{BASE_URL}/api/uzum-market/test-connection", timeout=30)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, "API connection should be successful"
        assert "products_count" in data, "Response should contain products_count"
        assert data.get("products_count") == 49, f"Expected 49 products, got {data.get('products_count')}"
        assert data.get("status_code") == 200, "Uzum API status should be 200"
        print(f"✅ Uzum Market API connected - {data.get('products_count')} products found")
    
    def test_uzum_get_stocks(self):
        """Test Uzum Market stocks endpoint - should return 49 products"""
        response = requests.get(f"{BASE_URL}/api/uzum-market/stocks", timeout=30)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, "Stocks request should be successful"
        assert "data" in data, "Response should contain data"
        
        payload = data.get("data", {}).get("payload", {})
        sku_list = payload.get("skuAmountList", [])
        
        assert len(sku_list) == 49, f"Expected 49 SKUs, got {len(sku_list)}"
        
        # Verify SKU structure
        if sku_list:
            first_sku = sku_list[0]
            assert "skuId" in first_sku, "SKU should have skuId"
            assert "skuTitle" in first_sku, "SKU should have skuTitle"
            assert "productTitle" in first_sku, "SKU should have productTitle"
            assert "barcode" in first_sku, "SKU should have barcode"
            assert "amount" in first_sku, "SKU should have amount"
            assert "fbsAllowed" in first_sku, "SKU should have fbsAllowed"
        
        print(f"✅ Uzum stocks endpoint working - {len(sku_list)} products returned")
    
    def test_uzum_get_orders(self):
        """Test Uzum Market orders endpoint"""
        response = requests.get(f"{BASE_URL}/api/uzum-market/orders?limit=10", timeout=30)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "success" in data, "Response should contain success field"
        print(f"✅ Uzum orders endpoint working - success: {data.get('success')}")
    
    def test_uzum_orders_count(self):
        """Test Uzum Market orders count endpoint"""
        response = requests.get(f"{BASE_URL}/api/uzum-market/orders/count", timeout=30)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "success" in data, "Response should contain success field"
        print(f"✅ Uzum orders count endpoint working - success: {data.get('success')}")


class TestAIService:
    """AI Service endpoint tests"""
    
    def test_ai_status(self):
        """Test AI service status endpoint"""
        response = requests.get(f"{BASE_URL}/api/ai/status", timeout=30)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, "AI status should be successful"
        assert "ai" in data, "Response should contain ai field"
        
        ai_info = data.get("ai", {})
        assert ai_info.get("enabled") == True, "AI should be enabled"
        assert ai_info.get("provider") == "Emergent LLM", "AI provider should be Emergent LLM"
        assert ai_info.get("model") == "gpt-4o", "AI model should be gpt-4o"
        
        print(f"✅ AI service status - enabled: {ai_info.get('enabled')}, model: {ai_info.get('model')}")
    
    def test_ai_scan_product_with_image(self):
        """Test AI product scanning with test image"""
        test_image_path = "/tmp/test_product.jpg"
        
        # Check if test image exists
        if not os.path.exists(test_image_path):
            pytest.skip("Test image not found at /tmp/test_product.jpg")
        
        # Upload image for scanning
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_product.jpg', f, 'image/jpeg')}
            response = requests.post(
                f"{BASE_URL}/api/ai/scan-product",
                files=files,
                timeout=60  # AI processing may take time
            )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, f"Scan should be successful, got: {data}"
        assert "result" in data, "Response should contain result"
        
        result = data.get("result", {})
        
        # Verify productInfo structure
        product_info = result.get("productInfo", {})
        assert "name" in product_info, "Product info should have name"
        assert "category" in product_info, "Product info should have category"
        assert "description" in product_info, "Product info should have description"
        assert "confidence" in product_info, "Product info should have confidence"
        
        # Verify priceAnalysis structure
        price_analysis = result.get("priceAnalysis", {})
        assert "avgPrice" in price_analysis, "Price analysis should have avgPrice"
        assert "minPrice" in price_analysis, "Price analysis should have minPrice"
        assert "maxPrice" in price_analysis, "Price analysis should have maxPrice"
        assert "suggestedPrice" in price_analysis, "Price analysis should have suggestedPrice"
        
        # Verify seoKeywords
        assert "seoKeywords" in result, "Result should have seoKeywords"
        
        print(f"✅ AI scan successful - Product: {product_info.get('name')}, Confidence: {product_info.get('confidence')}%")
    
    def test_ai_generate_card(self):
        """Test AI product card generation"""
        payload = {
            "name": "Samsung Galaxy A54",
            "category": "electronics",
            "description": "Yangi smartfon",
            "price": 4500000,
            "marketplace": "uzum"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-card",
            json=payload,
            timeout=60
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, f"Card generation should be successful, got: {data}"
        assert "card" in data, "Response should contain card"
        
        card = data.get("card", {})
        assert "title" in card, "Card should have title"
        assert "description" in card, "Card should have description"
        
        print(f"✅ AI card generation successful - Title: {card.get('title', '')[:50]}...")
    
    def test_ai_optimize_price(self):
        """Test AI price optimization"""
        payload = {
            "productName": "Aqlli soat",
            "currentPrice": 500000,
            "costPrice": 300000,
            "category": "electronics",
            "marketplace": "uzum"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/optimize-price",
            json=payload,
            timeout=60
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, f"Price optimization should be successful, got: {data}"
        assert "optimization" in data, "Response should contain optimization"
        
        optimization = data.get("optimization", {})
        assert "recommendedPrice" in optimization, "Optimization should have recommendedPrice"
        
        print(f"✅ AI price optimization successful - Recommended: {optimization.get('recommendedPrice')}")


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("status") == "ok" or data.get("status") == "healthy", "Health status should be ok/healthy"
        
        print(f"✅ Health check passed - status: {data.get('status')}")


class TestAIManagerStats:
    """AI Manager statistics tests"""
    
    def test_ai_manager_stats(self):
        """Test AI Manager stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/ai/manager/stats", timeout=30)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, "Stats request should be successful"
        assert "stats" in data, "Response should contain stats"
        
        stats = data.get("stats", {})
        assert "totalProducts" in stats, "Stats should have totalProducts"
        assert stats.get("totalProducts") == 49, f"Expected 49 products, got {stats.get('totalProducts')}"
        assert stats.get("apiStatus") == "connected", "API status should be connected"
        
        print(f"✅ AI Manager stats - Total: {stats.get('totalProducts')}, In Stock: {stats.get('inStock')}, Out of Stock: {stats.get('outOfStock')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
