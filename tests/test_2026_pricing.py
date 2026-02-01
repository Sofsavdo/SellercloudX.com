"""
Test Suite for SellerCloudX 2026 Premium Pricing Model
Tests: Revenue Share Model, Billing APIs, Pricing Page, Partner Dashboard
"""

import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sellercloudx.preview.emergentagent.com').rstrip('/')

class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get('status') == 'healthy'
        print("SUCCESS: Health endpoint working")

class TestClickTiersAPI:
    """Test Click Payment Tiers API"""
    
    def test_get_tiers(self):
        """Test GET /api/click/tiers returns pricing tiers"""
        response = requests.get(f"{BASE_URL}/api/click/tiers")
        assert response.status_code == 200
        data = response.json()
        assert data.get('success') == True
        assert 'tiers' in data
        assert len(data['tiers']) >= 4
        
        # Verify tier structure
        tier_ids = [t['id'] for t in data['tiers']]
        assert 'free_starter' in tier_ids
        assert 'starter_pro' in tier_ids
        print(f"SUCCESS: Click tiers API returns {len(data['tiers'])} tiers")

class TestBillingAPIs:
    """Test 2026 Revenue Share Billing APIs"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        return session
    
    @pytest.fixture
    def partner_session(self):
        """Get partner session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "username": "partner",
            "password": "partner123"
        })
        assert response.status_code == 200
        return session
    
    def test_billing_summary_requires_auth(self):
        """Test billing summary requires authentication"""
        response = requests.get(f"{BASE_URL}/api/billing/revenue-share/summary")
        assert response.status_code == 401
        print("SUCCESS: Billing summary requires auth")
    
    def test_billing_summary_with_partner_auth(self, partner_session):
        """Test billing summary with partner authentication"""
        response = partner_session.get(f"{BASE_URL}/api/billing/revenue-share/summary")
        assert response.status_code == 200
        data = response.json()
        
        # Verify 2026 pricing fields
        assert data.get('success') == True
        assert 'data' in data
        billing_data = data['data']
        
        # Check required 2026 fields
        assert 'tariffType' in billing_data
        assert 'setupPaid' in billing_data
        assert 'setupFeeUsd' in billing_data
        assert 'monthlyFeeUsd' in billing_data
        assert 'revenueSharePercent' in billing_data
        assert 'currentDebt' in billing_data
        assert 'isBlocked' in billing_data
        assert 'salesBeforeUs' in billing_data
        
        # Verify default values
        assert billing_data['setupFeeUsd'] == 699
        assert billing_data['monthlyFeeUsd'] == 499
        assert billing_data['revenueSharePercent'] == 0.04
        
        print(f"SUCCESS: Billing summary returns 2026 pricing data")
        print(f"  - Tariff: {billing_data['tariffType']}")
        print(f"  - Setup Fee: ${billing_data['setupFeeUsd']}")
        print(f"  - Monthly Fee: ${billing_data['monthlyFeeUsd']}")
        print(f"  - Revenue Share: {billing_data['revenueSharePercent']*100}%")
    
    def test_start_trial_requires_auth(self):
        """Test start trial requires authentication"""
        response = requests.post(f"{BASE_URL}/api/billing/revenue-share/start-trial")
        assert response.status_code == 401
        print("SUCCESS: Start trial requires auth")
    
    def test_admin_billing_summary_returns_partner_not_found(self, admin_session):
        """Test admin user gets 'Partner not found' for billing summary"""
        response = admin_session.get(f"{BASE_URL}/api/billing/revenue-share/summary")
        # Admin doesn't have partner profile, so should return 404
        assert response.status_code == 404
        data = response.json()
        assert 'error' in data
        print("SUCCESS: Admin correctly gets 'Partner not found' for billing summary")

class TestPartnerData:
    """Test partner data has 2026 fields"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        return session
    
    def test_partners_have_2026_fields(self, admin_session):
        """Test partners have new 2026 pricing fields"""
        response = admin_session.get(f"{BASE_URL}/api/admin/partners")
        assert response.status_code == 200
        partners = response.json()
        
        assert len(partners) > 0
        partner = partners[0]
        
        # Check 2026 fields exist
        assert 'tariffType' in partner
        assert 'setupPaid' in partner
        assert 'setupFeeUsd' in partner
        assert 'monthlyFeeUsd' in partner
        assert 'revenueSharePercent' in partner
        assert 'totalDebtUzs' in partner
        assert 'blockedUntil' in partner
        assert 'salesBeforeUs' in partner
        
        print(f"SUCCESS: Partners have 2026 pricing fields")
        print(f"  - Found {len(partners)} partners")
        print(f"  - First partner tariff: {partner['tariffType']}")

class TestPricingPageContent:
    """Test pricing page content via API"""
    
    def test_pricing_page_loads(self):
        """Test pricing page is accessible"""
        response = requests.get(f"{BASE_URL}/pricing")
        assert response.status_code == 200
        print("SUCCESS: Pricing page loads")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
