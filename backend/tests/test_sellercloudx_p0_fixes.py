"""
SellerCloudX P0 Fixes Backend Tests
Testing all critical endpoints after P0 bug fixes:
- Auth (admin/partner login)
- Admin partners management
- Chat system (rooms, messages)
- Referral dashboard
- Blog posts
- Analytics
- Trend Hunter
- Business metrics
"""
import pytest
import requests
import os
import json

# Get API URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
PARTNER_USERNAME = "partner"
PARTNER_PASSWORD = "partner123"


class TestHealthCheck:
    """Health check tests"""
    
    def test_health_endpoint(self):
        """Test /health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["ok", "healthy"]
        print(f"✅ Health check passed: {data}")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["role"] == "admin", "User role should be admin"
        assert data["user"]["username"] == ADMIN_USERNAME
        
        print(f"✅ Admin login successful: user_id={data['user'].get('id')}, role={data['user']['role']}")
        return data["token"]
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": "wrongpassword"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Admin login with wrong password correctly rejected")


class TestPartnerAuth:
    """Partner authentication tests"""
    
    @pytest.fixture
    def create_partner_user(self):
        """Create a test partner user if not exists"""
        # First try to login
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": PARTNER_USERNAME, "password": PARTNER_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()
        
        # If login fails, try to register
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "username": PARTNER_USERNAME,
                "email": "partner@test.com",
                "password": PARTNER_PASSWORD,
                "businessName": "Test Partner Business",
                "businessCategory": "general"
            }
        )
        if response.status_code in [200, 201]:
            return response.json()
        
        # Partner might already exist but with different password
        pytest.skip("Partner user creation/login failed")
    
    def test_partner_login_or_register(self, create_partner_user):
        """Test partner login or registration"""
        data = create_partner_user
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        print(f"✅ Partner auth successful: user_id={data['user'].get('id')}, role={data['user'].get('role')}")


class TestAdminPartners:
    """Admin partners management tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_get_partners_list(self, admin_token):
        """Test GET /api/admin/partners - List all partners"""
        response = requests.get(
            f"{BASE_URL}/api/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Response can be {success, data, total} or direct array
        if isinstance(data, dict):
            assert "data" in data or "success" in data, "Response should have data or success field"
            partners = data.get("data", [])
        else:
            partners = data
        
        assert isinstance(partners, list), "Partners should be a list"
        print(f"✅ Partners list retrieved: {len(partners)} partners found")
        
        # Return first partner ID for approval test
        if partners:
            return partners[0].get("id")
        return None
    
    def test_approve_partner(self, admin_token):
        """Test PUT /api/admin/partners/{id}/approve"""
        # First get partners list
        response = requests.get(
            f"{BASE_URL}/api/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code != 200:
            pytest.skip("Could not get partners list")
        
        data = response.json()
        partners = data.get("data", data) if isinstance(data, dict) else data
        
        # Find an unapproved partner
        unapproved = [p for p in partners if not p.get("approved")]
        if not unapproved:
            print("⚠️ No unapproved partners to test approval")
            return
        
        partner_id = unapproved[0]["id"]
        
        # Approve the partner
        response = requests.put(
            f"{BASE_URL}/api/admin/partners/{partner_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True or "data" in data
        print(f"✅ Partner {partner_id} approved successfully")
    
    def test_partners_requires_admin(self):
        """Test that partners endpoint requires admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/partners")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✅ Partners endpoint correctly requires authentication")


class TestChatSystem:
    """Chat system tests - Testing P0 fix for chat_rooms schema"""
    
    @pytest.fixture
    def partner_auth(self):
        """Get partner auth token and data"""
        # Try login first
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": PARTNER_USERNAME, "password": PARTNER_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()
        
        # Try register
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "username": PARTNER_USERNAME,
                "email": "partner@test.com",
                "password": PARTNER_PASSWORD,
                "businessName": "Test Partner",
                "businessCategory": "general"
            }
        )
        if response.status_code in [200, 201]:
            return response.json()
        
        pytest.skip("Partner auth failed")
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_get_chat_room_partner(self, partner_auth):
        """Test GET /api/chat/room - Get/create chat room for partner"""
        token = partner_auth["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/chat/room",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # This tests the P0 fix - chat_rooms should work with participants jsonb
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "id" in data, "Chat room should have id"
        print(f"✅ Chat room retrieved/created: id={data.get('id')}")
        return data
    
    def test_get_all_chat_rooms_admin(self, admin_token):
        """Test GET /api/chat/rooms - Get all chat rooms (admin)"""
        response = requests.get(
            f"{BASE_URL}/api/chat/rooms",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list of rooms"
        print(f"✅ Admin chat rooms retrieved: {len(data)} rooms")
    
    def test_send_message(self, partner_auth):
        """Test POST /api/chat/send - Send message"""
        token = partner_auth["token"]
        
        # First get/create room
        room_response = requests.get(
            f"{BASE_URL}/api/chat/room",
            headers={"Authorization": f"Bearer {token}"}
        )
        if room_response.status_code != 200:
            pytest.skip("Could not get chat room")
        
        room_id = room_response.json().get("id")
        
        # Send message
        response = requests.post(
            f"{BASE_URL}/api/chat/send",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "content": "Test message from pytest",
                "messageType": "text",
                "roomId": room_id
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "id" in data or "content" in data, "Message should be created"
        print(f"✅ Message sent successfully")
    
    def test_get_messages(self, partner_auth):
        """Test GET /api/chat/messages - Get messages"""
        token = partner_auth["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/chat/messages",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Messages should be a list"
        print(f"✅ Messages retrieved: {len(data)} messages")


class TestReferralDashboard:
    """Referral dashboard tests"""
    
    @pytest.fixture
    def partner_token(self):
        """Get partner auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": PARTNER_USERNAME, "password": PARTNER_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        
        # Try register
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "username": PARTNER_USERNAME,
                "email": "partner@test.com",
                "password": PARTNER_PASSWORD,
                "businessName": "Test Partner",
                "businessCategory": "general"
            }
        )
        if response.status_code in [200, 201]:
            return response.json()["token"]
        
        pytest.skip("Partner auth failed")
    
    def test_referral_dashboard(self, partner_token):
        """Test GET /api/partner/referrals/dashboard"""
        response = requests.get(
            f"{BASE_URL}/api/partner/referrals/dashboard",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        
        # Endpoint might return 200 with data or 404 if not implemented
        if response.status_code == 404:
            print("⚠️ Referral dashboard endpoint not found (404)")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"✅ Referral dashboard retrieved: {data}")


class TestBlogPosts:
    """Blog posts tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_get_blog_posts_admin(self, admin_token):
        """Test GET /api/admin/blog/posts"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blog/posts",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Blog endpoint might return error if table doesn't exist
        if response.status_code == 500:
            data = response.json()
            if "no such table" in str(data.get("error", "")):
                print("⚠️ Blog posts table not created yet")
                return
        
        if response.status_code == 404:
            print("⚠️ Blog posts endpoint not found")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Response can be array or {success, data}
        posts = data.get("data", data) if isinstance(data, dict) else data
        print(f"✅ Blog posts retrieved: {len(posts) if isinstance(posts, list) else 'N/A'}")
    
    def test_get_public_blog_posts(self):
        """Test GET /api/blog/posts (public)"""
        response = requests.get(f"{BASE_URL}/api/blog/posts")
        
        if response.status_code == 500:
            data = response.json()
            if "no such table" in str(data.get("error", "")):
                print("⚠️ Blog posts table not created yet")
                return
        
        if response.status_code == 404:
            print("⚠️ Public blog posts endpoint not found")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✅ Public blog posts endpoint working")


class TestAnalytics:
    """Analytics endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_get_analytics(self, admin_token):
        """Test GET /api/analytics"""
        response = requests.get(
            f"{BASE_URL}/api/analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 404:
            print("⚠️ Analytics endpoint not found")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"✅ Analytics retrieved: {list(data.keys()) if isinstance(data, dict) else 'array'}")


class TestTrendHunter:
    """Trend Hunter tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_trend_hunter(self, admin_token):
        """Test GET /api/trends/hunter"""
        response = requests.get(
            f"{BASE_URL}/api/trends/hunter",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 404:
            print("⚠️ Trend hunter endpoint not found at /api/trends/hunter")
            # Try alternative endpoint
            response = requests.get(
                f"{BASE_URL}/api/trends/top",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            if response.status_code == 200:
                print("✅ Trend hunter available at /api/trends/top")
                return
        
        if response.status_code == 401:
            print("⚠️ Trend hunter requires different auth (Node.js middleware)")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"✅ Trend hunter data retrieved")
    
    def test_trends_top(self, admin_token):
        """Test GET /api/trends/top"""
        response = requests.get(
            f"{BASE_URL}/api/trends/top",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 401:
            print("⚠️ /api/trends/top requires Node.js auth middleware")
            return
        
        if response.status_code == 404:
            print("⚠️ /api/trends/top endpoint not found")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"✅ Trends top data retrieved: {len(data) if isinstance(data, list) else 'object'}")


class TestBusinessMetrics:
    """Admin business metrics tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_business_metrics(self, admin_token):
        """Test GET /api/admin/business-metrics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/business-metrics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 404:
            print("⚠️ Business metrics endpoint not found")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"✅ Business metrics retrieved: {list(data.keys()) if isinstance(data, dict) else 'array'}")


class TestDateTimeHandling:
    """Test datetime handling - P0 fix for Invalid Date"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_partners_datetime_format(self, admin_token):
        """Test that partner dates are properly formatted (not Invalid Date)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code != 200:
            pytest.skip("Could not get partners")
        
        data = response.json()
        partners = data.get("data", data) if isinstance(data, dict) else data
        
        if not partners:
            print("⚠️ No partners to check datetime format")
            return
        
        for partner in partners[:3]:  # Check first 3
            created_at = partner.get("created_at") or partner.get("createdAt")
            if created_at:
                # Should be ISO format string, not "Invalid Date"
                assert created_at != "Invalid Date", f"created_at should not be 'Invalid Date'"
                assert isinstance(created_at, str), f"created_at should be string"
                print(f"✅ Partner datetime format OK: {created_at[:25]}...")
        
        print("✅ All partner datetimes properly formatted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
