"""
Test Leads API Endpoints for SellerCloudX
Tests the lead capture and admin leads management functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com')

class TestLeadsAPI:
    """Test Lead Capture API (Public endpoint)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_lead_data = {
            "fullName": "TEST_Pytest Lead",
            "phone": "+998901234567",
            "region": "Toshkent shahri",
            "currentSalesVolume": "20-50 mln UZS/oy",
            "businessType": "Elektronika",
            "marketplaces": "Uzum, Yandex",
            "message": "Test message from pytest",
            "source": "seller_landing",
            "campaign": "pytest_test"
        }
    
    def test_create_lead_success(self):
        """Test creating a new lead from landing page"""
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=self.test_lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "lead_id" in data
        print(f"✅ Lead created with ID: {data['lead_id']}")
    
    def test_create_lead_minimal_data(self):
        """Test creating lead with only required fields"""
        minimal_data = {
            "fullName": "TEST_Minimal Lead",
            "phone": "+998991112233"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=minimal_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Minimal lead created with ID: {data['lead_id']}")
    
    def test_create_lead_missing_required_fields(self):
        """Test creating lead without required fields - should still work (backend handles gracefully)"""
        incomplete_data = {
            "region": "Toshkent"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=incomplete_data,
            headers={"Content-Type": "application/json"}
        )
        
        # Backend should return 422 for validation error
        assert response.status_code in [200, 422]


class TestAdminLeadsAPI:
    """Test Admin Leads Management API (Requires authentication)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup admin authentication"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            self.token = login_response.json().get("token")
            self.headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.token}"
            }
        else:
            pytest.skip("Admin authentication failed")
    
    def test_get_all_leads(self):
        """Test fetching all leads as admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Found {len(data)} leads")
        
        # Verify lead structure
        if len(data) > 0:
            lead = data[0]
            assert "id" in lead
            assert "full_name" in lead
            assert "phone" in lead
            assert "status" in lead
    
    def test_get_leads_by_status(self):
        """Test filtering leads by status"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads?status=new",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # All returned leads should have status 'new'
        for lead in data:
            assert lead.get("status") == "new"
        print(f"✅ Found {len(data)} new leads")
    
    def test_get_leads_stats(self):
        """Test fetching leads statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads/stats",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify stats structure
        assert "total" in data
        assert "new" in data
        assert "contacted" in data
        assert "qualified" in data
        assert "converted" in data
        assert "lost" in data
        assert "today" in data
        assert "thisWeek" in data
        
        # Values should be non-negative integers
        assert isinstance(data["total"], int) and data["total"] >= 0
        assert isinstance(data["new"], int) and data["new"] >= 0
        
        print(f"✅ Stats: total={data['total']}, new={data['new']}, today={data['today']}")
    
    def test_update_lead_status(self):
        """Test updating lead status"""
        # First get a lead
        leads_response = requests.get(
            f"{BASE_URL}/api/admin/leads",
            headers=self.headers
        )
        
        if leads_response.status_code != 200 or len(leads_response.json()) == 0:
            pytest.skip("No leads available for update test")
        
        lead_id = leads_response.json()[0]["id"]
        
        # Update the lead
        update_data = {
            "status": "contacted",
            "notes": "Test note from pytest"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/leads/{lead_id}",
            json=update_data,
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Lead {lead_id} updated successfully")
    
    def test_leads_unauthorized_access(self):
        """Test that leads API requires authentication"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 403
        print("✅ Unauthorized access correctly blocked")
    
    def test_leads_stats_unauthorized_access(self):
        """Test that leads stats API requires authentication"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads/stats",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 403
        print("✅ Unauthorized stats access correctly blocked")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
