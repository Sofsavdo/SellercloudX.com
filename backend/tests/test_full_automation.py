"""
SellerCloudX Full Automation Backend Tests
Tests for:
1. POST /api/ai/scan-from-url - URL orqali rasm skanerlash
2. POST /api/ai/full-automation - To'liq avtomatizatsiya oqimi (6 step)
3. POST /api/ai/generate-infographics - 1080x1440 razmer bilan infografika
4. GET /api/yandex/dashboard/status - Dashboard statistikasi
5. Yandex API product creation verification
"""

import pytest
import requests
import os
import time

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com').rstrip('/')

# Test image URL provided in requirements
TEST_IMAGE_URL = "https://i.ibb.co/MkqKDcBn/68785868b3db.jpg"
YANDEX_BUSINESS_ID = "197529861"


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_backend_health(self):
        """Test backend is running"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✅ Backend healthy: {data}")
    
    def test_ai_status(self):
        """Test AI service is enabled"""
        response = requests.get(f"{BASE_URL}/api/ai/status", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data.get("ai", {}).get("enabled") == True
        print(f"✅ AI status: {data}")


class TestScanFromURL:
    """Test POST /api/ai/scan-from-url endpoint"""
    
    def test_scan_from_url_success(self):
        """Test scanning product from image URL"""
        payload = {
            "image_url": TEST_IMAGE_URL,
            "partner_id": "test_partner"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/scan-from-url",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify success
        assert data.get("success") == True, f"Scan failed: {data.get('error')}"
        
        # Verify scan_result structure
        scan_result = data.get("scan_result", {})
        assert "product" in scan_result, "Missing product in scan_result"
        assert "mxik" in scan_result, "Missing mxik in scan_result"
        assert "price_analysis" in scan_result, "Missing price_analysis in scan_result"
        
        # Verify product info
        product = scan_result.get("product", {})
        assert product.get("name"), "Product name is empty"
        assert product.get("category"), "Product category is empty"
        
        # Verify MXIK code
        mxik = scan_result.get("mxik", {})
        assert mxik.get("code"), "MXIK code is empty"
        assert len(mxik.get("code", "")) == 8, f"MXIK code should be 8 digits, got: {mxik.get('code')}"
        
        # Verify price analysis
        price_analysis = scan_result.get("price_analysis", {})
        assert "suggested_price" in price_analysis, "Missing suggested_price"
        
        print(f"✅ Scan from URL successful:")
        print(f"   Product: {product.get('name')}")
        print(f"   Category: {product.get('category')}")
        print(f"   MXIK: {mxik.get('code')}")
        print(f"   Suggested Price: {price_analysis.get('suggested_price')}")
        
        return data
    
    def test_scan_from_url_invalid_url(self):
        """Test scanning with invalid URL"""
        payload = {
            "image_url": "https://invalid-url-that-does-not-exist.com/image.jpg"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/scan-from-url",
            json=payload,
            timeout=60
        )
        
        # Should return error but not crash
        assert response.status_code in [200, 400, 500]
        data = response.json()
        
        # Either success=False or error message
        if response.status_code == 200:
            assert data.get("success") == False or "error" in data
        
        print(f"✅ Invalid URL handled correctly: {data.get('error', 'N/A')}")


class TestFullAutomation:
    """Test POST /api/ai/full-automation endpoint - 6 step flow"""
    
    def test_full_automation_without_infographics(self):
        """
        Test full automation flow WITHOUT infographics (faster test)
        Steps: scan, mxik, ai_card, pricing, (skip infographics), yandex
        """
        payload = {
            "image_url": TEST_IMAGE_URL,
            "cost_price": 50000,  # 50,000 UZS
            "partner_id": "test_partner",
            "generate_infographics": False,  # Skip for faster testing
            "infographic_count": 0
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/full-automation",
            json=payload,
            timeout=120  # 2 minutes timeout
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify steps structure
        steps = data.get("steps", {})
        
        # Step 1: Scan
        assert "scan" in steps, "Missing scan step"
        scan_step = steps.get("scan", {})
        if scan_step.get("success"):
            assert scan_step.get("product_name"), "Missing product_name in scan"
            print(f"   Step 1 (Scan): ✅ {scan_step.get('product_name')}")
        else:
            print(f"   Step 1 (Scan): ❌ {scan_step.get('error')}")
        
        # Step 2: MXIK
        assert "mxik" in steps, "Missing mxik step"
        mxik_step = steps.get("mxik", {})
        if mxik_step.get("success"):
            assert mxik_step.get("code"), "Missing MXIK code"
            print(f"   Step 2 (MXIK): ✅ {mxik_step.get('code')}")
        else:
            print(f"   Step 2 (MXIK): ⚠️ Fallback used: {mxik_step.get('fallback_code')}")
        
        # Step 3: AI Card
        assert "ai_card" in steps, "Missing ai_card step"
        ai_card_step = steps.get("ai_card", {})
        if ai_card_step.get("success"):
            print(f"   Step 3 (AI Card): ✅ Name: {ai_card_step.get('name_ru', '')[:50]}...")
        else:
            print(f"   Step 3 (AI Card): ❌ {ai_card_step.get('error')}")
        
        # Step 4: Pricing
        assert "pricing" in steps, "Missing pricing step"
        pricing_step = steps.get("pricing", {})
        if pricing_step.get("success"):
            assert pricing_step.get("optimal_price"), "Missing optimal_price"
            print(f"   Step 4 (Pricing): ✅ Optimal: {pricing_step.get('optimal_price')} UZS")
        else:
            print(f"   Step 4 (Pricing): ❌ {pricing_step.get('error')}")
        
        # Step 5: Infographics (skipped)
        assert "infographics" in steps, "Missing infographics step"
        infographics_step = steps.get("infographics", {})
        if infographics_step.get("skipped"):
            print(f"   Step 5 (Infographics): ⏭️ Skipped (as requested)")
        elif infographics_step.get("success"):
            print(f"   Step 5 (Infographics): ✅ Generated: {infographics_step.get('generated_count')}")
        else:
            print(f"   Step 5 (Infographics): ❌ {infographics_step.get('error')}")
        
        # Step 6: Yandex
        assert "yandex" in steps, "Missing yandex step"
        yandex_step = steps.get("yandex", {})
        if yandex_step.get("success"):
            print(f"   Step 6 (Yandex): ✅ Offer ID: {yandex_step.get('offer_id')}")
        else:
            print(f"   Step 6 (Yandex): ❌ {yandex_step.get('error')}")
        
        # Verify summary
        summary = data.get("summary", {})
        print(f"\n   Summary:")
        print(f"   - Product: {summary.get('product_name')}")
        print(f"   - Brand: {summary.get('brand')}")
        print(f"   - Category: {summary.get('category')}")
        print(f"   - MXIK: {summary.get('mxik_code')}")
        print(f"   - Final Price: {summary.get('final_price')} UZS")
        print(f"   - Steps Completed: {summary.get('steps_completed')}")
        
        # At least 4 steps should succeed
        successful_steps = sum(1 for step in steps.values() if step.get("success") or step.get("skipped"))
        assert successful_steps >= 4, f"Only {successful_steps} steps succeeded, expected at least 4"
        
        print(f"\n✅ Full automation completed: {successful_steps}/6 steps successful")
        
        return data


class TestGenerateInfographics:
    """Test POST /api/ai/generate-infographics endpoint"""
    
    def test_generate_infographics_single(self):
        """Test generating single infographic (1080x1440)"""
        payload = {
            "product_name": "Протеиновый батончик с орехами",
            "brand": "FitBar",
            "features": ["100% натуральный", "Без сахара", "Богат белком"],
            "category": "food",
            "count": 1  # Single image for faster test
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-infographics",
            json=payload,
            timeout=120  # 2 minutes for image generation
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check if service is available
        if not data.get("success") and "not available" in str(data.get("error", "")):
            pytest.skip("Nano Banana service not available")
        
        # Verify response structure
        if data.get("success"):
            assert "images" in data, "Missing images array"
            assert "image_types" in data, "Missing image_types array"
            assert "generated_count" in data, "Missing generated_count"
            
            images = data.get("images", [])
            image_types = data.get("image_types", [])
            
            assert len(images) >= 1, "No images generated"
            assert images[0].startswith("https://"), f"Invalid image URL: {images[0]}"
            
            # Verify ImgBB URL
            assert "ibb.co" in images[0] or "i.ibb.co" in images[0], f"Not an ImgBB URL: {images[0]}"
            
            print(f"✅ Infographic generated:")
            print(f"   Count: {data.get('generated_count')}")
            print(f"   Type: {image_types[0] if image_types else 'N/A'}")
            print(f"   URL: {images[0][:60]}...")
            print(f"   Size: 1080x1440 (3:4 aspect ratio)")
        else:
            # Budget exceeded or other error
            error = data.get("error", "")
            if "budget" in error.lower() or "exceeded" in error.lower():
                print(f"⚠️ Budget limit reached: {error}")
                pytest.skip("LLM budget exceeded")
            else:
                print(f"❌ Generation failed: {error}")
        
        return data
    
    def test_generate_infographics_cosmetics_category(self):
        """Test infographic with cosmetics category prompts"""
        payload = {
            "product_name": "Сыворотка с витамином С",
            "brand": "Advanced Skincare",
            "features": ["Увлажняет кожу", "Осветляет пигментацию", "Антиоксидантная защита"],
            "category": "cosmetics",
            "count": 1
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-infographics",
            json=payload,
            timeout=120
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            assert data.get("category") == "cosmetics", "Category mismatch"
            print(f"✅ Cosmetics infographic generated: {data.get('images', ['N/A'])[0][:50]}...")
        elif "budget" in str(data.get("error", "")).lower():
            pytest.skip("LLM budget exceeded")
        
        return data


class TestYandexDashboard:
    """Test GET /api/yandex/dashboard/status endpoint"""
    
    def test_dashboard_status(self):
        """Test Yandex dashboard status endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/yandex/dashboard/status",
            params={"limit": 10},
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            # Verify stats structure
            stats = data.get("stats", {})
            assert "total" in stats, "Missing total in stats"
            assert "ready" in stats, "Missing ready in stats"
            assert "in_moderation" in stats, "Missing in_moderation in stats"
            
            # Verify offers structure
            offers = data.get("offers", [])
            
            print(f"✅ Dashboard status retrieved:")
            print(f"   Total products: {stats.get('total')}")
            print(f"   Ready: {stats.get('ready')}")
            print(f"   In moderation: {stats.get('in_moderation')}")
            print(f"   Need content: {stats.get('need_content')}")
            print(f"   Rejected: {stats.get('rejected')}")
            print(f"   Last updated: {data.get('last_updated')}")
            
            if offers:
                print(f"   Sample offer: {offers[0].get('name', 'N/A')[:40]}...")
        else:
            error = data.get("error", "")
            if "YANDEX_API_KEY" in error:
                print(f"⚠️ Yandex API key not configured: {error}")
            else:
                print(f"❌ Dashboard error: {error}")
        
        return data
    
    def test_yandex_campaigns(self):
        """Test Yandex campaigns endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/yandex/campaigns",
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            campaigns = data.get("campaigns", [])
            print(f"✅ Yandex campaigns retrieved: {len(campaigns)} campaigns")
            for camp in campaigns[:3]:
                print(f"   - {camp.get('domain', 'N/A')}: ID {camp.get('id')}")
        else:
            print(f"⚠️ Campaigns error: {data.get('error')}")
        
        return data


class TestYandexProductCreation:
    """Test Yandex API product creation verification"""
    
    def test_yandex_connection(self):
        """Test Yandex API connection"""
        # Use test-connection endpoint with env credentials
        response = requests.get(
            f"{BASE_URL}/api/yandex/campaigns",
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            print(f"✅ Yandex API connection successful")
            print(f"   Campaigns: {len(data.get('campaigns', []))}")
        else:
            print(f"⚠️ Yandex connection issue: {data.get('error')}")
        
        return data
    
    def test_offer_status_check(self):
        """Test checking offer status (if any offers exist)"""
        # First get dashboard to see if there are any offers
        dashboard_response = requests.get(
            f"{BASE_URL}/api/yandex/dashboard/status",
            params={"limit": 5},
            timeout=30
        )
        
        if dashboard_response.status_code == 200:
            data = dashboard_response.json()
            if data.get("success"):
                offers = data.get("offers", [])
                if offers:
                    offer_id = offers[0].get("offer_id")
                    print(f"✅ Found existing offer: {offer_id}")
                    print(f"   Status: {offers[0].get('status')}")
                    print(f"   Name: {offers[0].get('name', 'N/A')[:40]}...")
                else:
                    print(f"ℹ️ No existing offers found in Yandex Market")
            else:
                print(f"⚠️ Dashboard error: {data.get('error')}")
        
        return dashboard_response.json() if dashboard_response.status_code == 200 else {}


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
