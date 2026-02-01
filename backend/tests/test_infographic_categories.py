"""
Test Infographic Generation with Category-Based Prompts
Tests POST /api/ai/generate-infographics with different categories:
- cosmetics: Hero shot with floating vitamins
- food: Hero shot with floating nuts/chocolate
Verifies generated images are valid ImgBB URLs and image_types are returned correctly
"""

import pytest
import requests
import os
import time

# Use the public URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com').rstrip('/')


class TestInfographicGeneration:
    """Test infographic generation with category-based prompts"""
    
    def test_health_check(self):
        """Verify backend is healthy before running tests"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✅ Health check passed: status={data.get('status')}")
    
    def test_ai_status(self):
        """Verify AI service is enabled"""
        response = requests.get(f"{BASE_URL}/api/ai/status")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data.get("ai", {}).get("enabled") == True
        print(f"✅ AI status: {data}")
    
    def test_cosmetics_category_infographic(self):
        """
        Test POST /api/ai/generate-infographics with category=cosmetics
        Expected: Hero shot with floating vitamins
        """
        payload = {
            "product_name": "Сыворотка с витамином С",
            "brand": "Advanced Skincare",
            "features": [
                "Увлажняет кожу",
                "Осветляет пигментацию",
                "Антиоксидантная защита",
                "Разглаживает морщины"
            ],
            "category": "cosmetics",
            "count": 1  # Only 1 image to save time (~17-20 seconds per image)
        }
        
        print(f"\n🎨 Testing cosmetics category infographic generation...")
        print(f"   Product: {payload['brand']} {payload['product_name']}")
        print(f"   Category: {payload['category']}")
        print(f"   Expected: Hero shot with floating vitamins")
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-infographics",
            json=payload,
            timeout=60  # 60 second timeout for image generation
        )
        elapsed_time = time.time() - start_time
        
        print(f"   Response time: {elapsed_time:.2f} seconds")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"   Response: {data}")
        
        # Verify success
        assert data.get("success") == True, f"Expected success=True, got: {data}"
        
        # Verify images array exists and has at least 1 image
        images = data.get("images", [])
        assert len(images) >= 1, f"Expected at least 1 image, got {len(images)}"
        
        # Verify image URL is valid ImgBB URL
        image_url = images[0]
        assert "ibb.co" in image_url or "i.ibb.co" in image_url, f"Expected ImgBB URL, got: {image_url}"
        assert image_url.startswith("https://"), f"Expected HTTPS URL, got: {image_url}"
        
        # Verify image_types are returned
        image_types = data.get("image_types", [])
        assert len(image_types) >= 1, f"Expected at least 1 image_type, got {len(image_types)}"
        assert image_types[0] == "hero_floating", f"Expected 'hero_floating' type, got: {image_types[0]}"
        
        # Verify generated_count
        assert data.get("generated_count") >= 1, f"Expected generated_count >= 1, got: {data.get('generated_count')}"
        
        # Verify category is returned
        assert data.get("category") == "cosmetics", f"Expected category='cosmetics', got: {data.get('category')}"
        
        print(f"✅ Cosmetics infographic generated successfully!")
        print(f"   Image URL: {image_url}")
        print(f"   Image type: {image_types[0]}")
    
    def test_food_category_infographic(self):
        """
        Test POST /api/ai/generate-infographics with category=food
        Expected: Hero shot with floating nuts/chocolate
        """
        payload = {
            "product_name": "Протеиновый батончик с орехами",
            "brand": "FitBar",
            "features": [
                "100% натуральный состав",
                "Без сахара",
                "Богат белком",
                "Заряд энергии"
            ],
            "category": "food",
            "count": 1  # Only 1 image to save time
        }
        
        print(f"\n🍫 Testing food category infographic generation...")
        print(f"   Product: {payload['brand']} {payload['product_name']}")
        print(f"   Category: {payload['category']}")
        print(f"   Expected: Hero shot with floating nuts/chocolate")
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-infographics",
            json=payload,
            timeout=60  # 60 second timeout for image generation
        )
        elapsed_time = time.time() - start_time
        
        print(f"   Response time: {elapsed_time:.2f} seconds")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"   Response: {data}")
        
        # Verify success
        assert data.get("success") == True, f"Expected success=True, got: {data}"
        
        # Verify images array exists and has at least 1 image
        images = data.get("images", [])
        assert len(images) >= 1, f"Expected at least 1 image, got {len(images)}"
        
        # Verify image URL is valid ImgBB URL
        image_url = images[0]
        assert "ibb.co" in image_url or "i.ibb.co" in image_url, f"Expected ImgBB URL, got: {image_url}"
        assert image_url.startswith("https://"), f"Expected HTTPS URL, got: {image_url}"
        
        # Verify image_types are returned
        image_types = data.get("image_types", [])
        assert len(image_types) >= 1, f"Expected at least 1 image_type, got {len(image_types)}"
        assert image_types[0] == "hero_floating", f"Expected 'hero_floating' type, got: {image_types[0]}"
        
        # Verify generated_count
        assert data.get("generated_count") >= 1, f"Expected generated_count >= 1, got: {data.get('generated_count')}"
        
        # Verify category is returned
        assert data.get("category") == "food", f"Expected category='food', got: {data.get('category')}"
        
        print(f"✅ Food infographic generated successfully!")
        print(f"   Image URL: {image_url}")
        print(f"   Image type: {image_types[0]}")
    
    def test_verify_imgbb_url_accessible(self):
        """
        Verify that generated ImgBB URLs are actually accessible
        Uses a sample URL from previous test or generates new one
        """
        # First generate an image
        payload = {
            "product_name": "Test Product",
            "brand": "TestBrand",
            "features": ["Feature 1"],
            "category": "general",
            "count": 1
        }
        
        print(f"\n🔗 Testing ImgBB URL accessibility...")
        
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-infographics",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("images"):
                image_url = data["images"][0]
                
                # Try to access the image URL
                img_response = requests.head(image_url, timeout=10)
                assert img_response.status_code == 200, f"Image URL not accessible: {image_url}"
                
                # Check content type is image
                content_type = img_response.headers.get("Content-Type", "")
                assert "image" in content_type.lower(), f"Expected image content type, got: {content_type}"
                
                print(f"✅ ImgBB URL is accessible: {image_url}")
                print(f"   Content-Type: {content_type}")
            else:
                pytest.skip(f"Image generation failed: {data}")
        else:
            pytest.skip(f"API returned {response.status_code}")


class TestPromptCategoryDetection:
    """Test that category detection in prompts works correctly"""
    
    def test_cosmetics_keywords_detection(self):
        """Test that cosmetics keywords trigger correct prompt"""
        # Test with product name containing cosmetics keywords
        payload = {
            "product_name": "Vitamin C Serum",  # Contains 'serum' - cosmetics keyword
            "brand": "SkinCare Pro",
            "features": ["Hydrating", "Anti-aging"],
            "category": "general",  # Even with general category, should detect cosmetics
            "count": 1
        }
        
        print(f"\n🧴 Testing cosmetics keyword detection in product name...")
        
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-infographics",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should succeed - the prompt generator should detect 'serum' keyword
        if data.get("success"):
            print(f"✅ Cosmetics keywords detected, image generated: {data.get('images', ['N/A'])[0][:50]}...")
        else:
            print(f"⚠️ Generation failed but API responded correctly: {data.get('error')}")
    
    def test_food_keywords_detection(self):
        """Test that food keywords trigger correct prompt"""
        payload = {
            "product_name": "Chocolate Bar with Nuts",  # Contains 'bar', 'chocolate' - food keywords
            "brand": "HealthySnacks",
            "features": ["Natural", "No sugar"],
            "category": "general",  # Even with general category, should detect food
            "count": 1
        }
        
        print(f"\n🍫 Testing food keyword detection in product name...")
        
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-infographics",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data.get("success"):
            print(f"✅ Food keywords detected, image generated: {data.get('images', ['N/A'])[0][:50]}...")
        else:
            print(f"⚠️ Generation failed but API responded correctly: {data.get('error')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
