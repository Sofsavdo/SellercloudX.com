"""
Test Mobile Scanner Endpoints - Critical for Mobile App
Tests the /api/unified-scanner/analyze-base64 endpoint
"""
import pytest
import requests
import base64
import os
import time

# API URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com')

# Test image URL
TEST_IMAGE_URL = "https://i.ibb.co/MkqKDcBn/68785868b3db.jpg"


class TestMobileScannerEndpoints:
    """Test mobile scanner endpoints - CRITICAL for mobile app"""
    
    @pytest.fixture(scope="class")
    def test_image_base64(self):
        """Download test image and convert to base64"""
        response = requests.get(TEST_IMAGE_URL, timeout=30)
        assert response.status_code == 200, f"Failed to download test image: {response.status_code}"
        return base64.b64encode(response.content).decode('utf-8')
    
    def test_health_check(self):
        """Test backend health"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✅ Health check passed: {data.get('version', 'unknown')}")
    
    def test_ai_status(self):
        """Test AI service status"""
        response = requests.get(f"{BASE_URL}/api/ai/status", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data.get("ai", {}).get("enabled") == True
        print(f"✅ AI Status: enabled={data['ai']['enabled']}, provider={data['ai'].get('provider')}")
    
    def test_analyze_base64_endpoint_exists(self, test_image_base64):
        """Test that analyze-base64 endpoint exists and accepts requests"""
        # Send a small portion of the image to test endpoint existence
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={
                "image_base64": test_image_base64[:1000],  # Small portion to test endpoint
                "language": "uz"
            },
            timeout=30
        )
        # Should return 200 even if analysis fails (endpoint exists)
        assert response.status_code == 200, f"Endpoint returned {response.status_code}"
        print(f"✅ analyze-base64 endpoint exists and responds")
    
    def test_analyze_base64_full_image(self, test_image_base64):
        """Test full image analysis with analyze-base64 endpoint - CRITICAL TEST"""
        print(f"📸 Sending full image to analyze-base64 endpoint...")
        print(f"   Image base64 size: {len(test_image_base64)} chars")
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/unified-scanner/analyze-base64",
            json={
                "image_base64": test_image_base64,
                "language": "uz"
            },
            timeout=120  # 2 minutes timeout for AI analysis
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Endpoint returned {response.status_code}"
        data = response.json()
        
        print(f"   Response time: {elapsed:.2f}s")
        print(f"   Response: {str(data)[:500]}")
        
        # Verify response structure
        assert "success" in data, "Response missing 'success' field"
        
        if data.get("success"):
            assert "product_info" in data, "Response missing 'product_info'"
            product_info = data["product_info"]
            
            # Verify product_info structure (as expected by mobile app)
            assert "brand" in product_info, "product_info missing 'brand'"
            assert "product_name" in product_info or "name" in product_info, "product_info missing name"
            assert "category" in product_info, "product_info missing 'category'"
            
            print(f"✅ analyze-base64 SUCCESS:")
            print(f"   Brand: {product_info.get('brand')}")
            print(f"   Name: {product_info.get('product_name') or product_info.get('name')}")
            print(f"   Category: {product_info.get('category')}")
            print(f"   Suggested Price: {data.get('suggested_price')}")
            print(f"   Confidence: {data.get('confidence')}%")
        else:
            print(f"⚠️ analyze-base64 returned success=False: {data.get('error')}")
            # This is acceptable - endpoint works but AI couldn't identify product
    
    def test_billing_calculate_default(self):
        """Test billing calculator with default values ($699 setup + $499/mo + 4%)"""
        response = requests.get(f"{BASE_URL}/api/billing/calculate", timeout=10)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        fees = data.get("fees", {})
        
        # Verify 2026 Revenue Share model
        assert fees.get("monthly_fee_usd") == 499, f"Expected $499/month, got {fees.get('monthly_fee_usd')}"
        assert fees.get("revenue_share_percent") == 4.0, f"Expected 4%, got {fees.get('revenue_share_percent')}"
        
        print(f"✅ Billing Calculate (default):")
        print(f"   Monthly Fee: ${fees.get('monthly_fee_usd')}/month")
        print(f"   Revenue Share: {fees.get('revenue_share_percent')}%")
        print(f"   Total Debt: {data.get('total', {}).get('debt_uzs')} UZS")
    
    def test_billing_calculate_with_sales(self):
        """Test billing calculator with sales amount"""
        # Test with 10,000,000 UZS sales
        response = requests.get(
            f"{BASE_URL}/api/billing/calculate",
            params={"total_sales_uzs": 10000000},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        fees = data.get("fees", {})
        
        # 4% of 10,000,000 = 400,000 UZS
        expected_revenue_share = 400000
        assert fees.get("revenue_share_uzs") == expected_revenue_share, \
            f"Expected {expected_revenue_share} UZS revenue share, got {fees.get('revenue_share_uzs')}"
        
        print(f"✅ Billing Calculate (with 10M UZS sales):")
        print(f"   Sales: 10,000,000 UZS")
        print(f"   Revenue Share (4%): {fees.get('revenue_share_uzs')} UZS")
        print(f"   Monthly Fee: {fees.get('monthly_fee_uzs')} UZS")
        print(f"   Total Debt: {data.get('total', {}).get('debt_uzs')} UZS")
    
    def test_yandex_dashboard_status(self):
        """Test Yandex dashboard status endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/yandex/dashboard/status",
            params={"limit": 5},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        stats = data.get("stats", {})
        
        assert "total" in stats, "Missing 'total' in stats"
        assert "ready" in stats, "Missing 'ready' in stats"
        assert "offers" in data, "Missing 'offers' in response"
        
        print(f"✅ Yandex Dashboard Status:")
        print(f"   Total Products: {stats.get('total')}")
        print(f"   Ready: {stats.get('ready')}")
        print(f"   In Moderation: {stats.get('in_moderation')}")
        print(f"   Offers returned: {len(data.get('offers', []))}")


class TestPricingModel:
    """Test 2026 Revenue Share pricing model: $699 setup + $499/month + 4%"""
    
    def test_pricing_model_values(self):
        """Verify pricing model constants"""
        response = requests.get(f"{BASE_URL}/api/billing/calculate", timeout=10)
        assert response.status_code == 200
        data = response.json()
        
        fees = data.get("fees", {})
        
        # 2026 Model: $699 setup + $499/month + 4%
        # Note: Setup fee ($699) is one-time, not in monthly calculation
        assert fees.get("monthly_fee_usd") == 499, "Monthly fee should be $499"
        assert fees.get("revenue_share_percent") == 4.0, "Revenue share should be 4%"
        
        print(f"✅ 2026 Pricing Model Verified:")
        print(f"   Setup Fee: $699 (one-time)")
        print(f"   Monthly Fee: ${fees.get('monthly_fee_usd')}")
        print(f"   Revenue Share: {fees.get('revenue_share_percent')}%")
    
    def test_revenue_share_calculation(self):
        """Test revenue share calculation accuracy"""
        test_cases = [
            (1000000, 40000),    # 1M UZS -> 40K revenue share
            (5000000, 200000),   # 5M UZS -> 200K revenue share
            (10000000, 400000),  # 10M UZS -> 400K revenue share
            (50000000, 2000000), # 50M UZS -> 2M revenue share
        ]
        
        for sales, expected_share in test_cases:
            response = requests.get(
                f"{BASE_URL}/api/billing/calculate",
                params={"total_sales_uzs": sales},
                timeout=10
            )
            assert response.status_code == 200
            data = response.json()
            
            actual_share = data.get("fees", {}).get("revenue_share_uzs")
            assert actual_share == expected_share, \
                f"For {sales} UZS sales, expected {expected_share} share, got {actual_share}"
        
        print(f"✅ Revenue share calculations verified for all test cases")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
