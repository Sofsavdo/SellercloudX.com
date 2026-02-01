"""
SellerCloudX Mobile Scanner & API Tests - Iteration 15
Tests critical endpoints for mobile app functionality
"""
import pytest
import requests
import base64
import os
import time

# API URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com').rstrip('/')

# Test image URL
TEST_IMAGE_URL = "https://i.ibb.co/MkqKDcBn/68785868b3db.jpg"


class TestHealthAndStatus:
    """Basic health and status checks"""
    
    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✅ Health check passed: {data.get('version', 'unknown')}")
    
    def test_ai_status(self):
        """Test /api/ai/status - AI service should be enabled"""
        response = requests.get(f"{BASE_URL}/api/ai/status", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data.get("ai", {}).get("enabled") == True
        print(f"✅ AI Status: enabled={data['ai']['enabled']}, provider={data['ai'].get('provider')}")


class TestMobileScanner:
    """CRITICAL - Mobile Scanner endpoint tests"""
    
    @pytest.fixture
    def test_image_base64(self):
        """Download test image and convert to base64"""
        response = requests.get(TEST_IMAGE_URL, timeout=30)
        assert response.status_code == 200
        return base64.b64encode(response.content).decode('utf-8')
    
    def test_analyze_base64_endpoint_exists(self):
        """Test that /api/unified-scanner/analyze-base64 endpoint exists"""
        # Send minimal request to check endpoint exists
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={"image_base64": "invalid", "language": "uz"},
            timeout=30
        )
        # Should not be 404 - endpoint should exist
        assert response.status_code != 404, "Endpoint /api/unified-scanner/analyze-base64 not found!"
        print(f"✅ Endpoint exists, status: {response.status_code}")
    
    def test_analyze_base64_with_real_image(self, test_image_base64):
        """CRITICAL - Test mobile scanner with real product image"""
        print(f"📸 Testing with image from: {TEST_IMAGE_URL}")
        print(f"📦 Image base64 size: {len(test_image_base64)} chars")
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={
                "image_base64": test_image_base64,
                "language": "uz"
            },
            timeout=120  # AI analysis can take time
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:500]}"
        
        data = response.json()
        print(f"📊 Response received in {elapsed:.1f}s")
        
        # Verify response structure
        assert data.get("success") == True, f"Expected success=True, got: {data}"
        assert "product_info" in data, "Missing product_info in response"
        
        product_info = data.get("product_info", {})
        
        # Verify product_info fields
        assert "brand" in product_info, "Missing brand in product_info"
        assert "product_name" in product_info or "name" in product_info, "Missing product name"
        assert "category" in product_info, "Missing category in product_info"
        
        # Verify suggested_price and confidence
        assert "suggested_price" in data, "Missing suggested_price"
        assert "confidence" in data, "Missing confidence"
        
        print(f"✅ Mobile Scanner Test PASSED!")
        print(f"   Brand: {product_info.get('brand')}")
        print(f"   Name: {product_info.get('product_name') or product_info.get('name')}")
        print(f"   Category: {product_info.get('category')}")
        print(f"   Suggested Price: {data.get('suggested_price')}")
        print(f"   Confidence: {data.get('confidence')}%")
        print(f"   Response Time: {elapsed:.1f}s")


class TestBillingCalculator:
    """Test billing/revenue share calculator"""
    
    def test_billing_calculate_default(self):
        """Test /api/billing/calculate with default params"""
        response = requests.get(f"{BASE_URL}/api/billing/calculate", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "fees" in data
        
        fees = data.get("fees", {})
        assert fees.get("monthly_fee_usd") == 499, f"Expected $499/month, got {fees.get('monthly_fee_usd')}"
        assert fees.get("revenue_share_percent") == 4.0, f"Expected 4% revenue share, got {fees.get('revenue_share_percent')}"
        
        print(f"✅ Billing Calculator: ${fees.get('monthly_fee_usd')}/month + {fees.get('revenue_share_percent')}% revenue share")
    
    def test_billing_calculate_with_sales(self):
        """Test billing calculation with sales amount"""
        response = requests.get(
            f"{BASE_URL}/api/billing/calculate",
            params={"total_sales_uzs": 10000000},  # 10M UZS
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        fees = data.get("fees", {})
        
        # 4% of 10M = 400,000 UZS
        expected_revenue_share = 400000
        actual_revenue_share = fees.get("revenue_share_uzs", 0)
        
        assert actual_revenue_share == expected_revenue_share, \
            f"Expected {expected_revenue_share} UZS revenue share, got {actual_revenue_share}"
        
        print(f"✅ Revenue share for 10M UZS sales: {actual_revenue_share:,} UZS")


class TestYandexDashboard:
    """Test Yandex Market dashboard status"""
    
    def test_yandex_dashboard_status(self):
        """Test /api/yandex/dashboard/status"""
        response = requests.get(f"{BASE_URL}/api/yandex/dashboard/status", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "stats" in data
        
        stats = data.get("stats", {})
        assert "total" in stats
        assert "ready" in stats
        
        print(f"✅ Yandex Dashboard: {stats.get('total')} total products, {stats.get('ready')} ready")
        
        # Check offers list
        if "offers" in data:
            offers = data.get("offers", [])
            print(f"   Sample offers: {len(offers)} returned")
            if offers:
                first_offer = offers[0]
                print(f"   First offer: {first_offer.get('name', 'N/A')[:50]}...")


class TestTrendHunter:
    """Test Trend Hunter API (may require auth)"""
    
    def test_trends_top_endpoint(self):
        """Test /api/trends/top - may return 401 if auth required"""
        response = requests.get(
            f"{BASE_URL}/api/trends/top",
            params={"limit": 5},
            timeout=30
        )
        
        # This endpoint may require auth in Node.js middleware
        if response.status_code == 401:
            data = response.json()
            print(f"⚠️ Trends API requires auth (expected): {data.get('message', 'Unauthorized')}")
            # This is expected behavior per the context
            pytest.skip("Trend Hunter API requires authentication (expected)")
        
        assert response.status_code == 200, f"Unexpected status: {response.status_code}"
        data = response.json()
        
        if data.get("success"):
            print(f"✅ Trends API working: {data.get('total', 0)} trends returned")
            if data.get("data"):
                first_trend = data["data"][0]
                print(f"   Top trend: {first_trend.get('name', 'N/A')}")
        else:
            print(f"⚠️ Trends API returned success=False: {data.get('error', 'Unknown')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
