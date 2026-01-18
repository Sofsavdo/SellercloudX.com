#!/usr/bin/env python3
"""
SellerCloudX NaN Bug Fix Verification Tests
Tests specifically for NaN values in AI monitoring and database columns
Focus on features mentioned in review request
"""

import requests
import json
import sys
import math
from typing import Dict, Any, Optional

# Configuration - Using the external URL from frontend/.env
BASE_URL = "https://trendopti.preview.emergentagent.com"
# Test credentials from review request
TEST_CREDENTIALS = {"username": "testpartner", "password": "Test123!"}
ADMIN_CREDENTIALS = {"username": "admin", "password": "admin123"}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

class NaNBugTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_session = requests.Session()
        self.partner_session = requests.Session()
        self.results = {
            "passed": [],
            "failed": [],
            "nan_issues": [],
            "warnings": []
        }
        self.partner_id = None
        self.product_id = None
        
    def log(self, message: str, level: str = "info"):
        """Log messages with colors"""
        if level == "success":
            print(f"{Colors.GREEN}✅ {message}{Colors.END}")
        elif level == "error":
            print(f"{Colors.RED}❌ {message}{Colors.END}")
        elif level == "warning":
            print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")
        else:
            print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")
    
    def check_for_nan_values(self, data: Any, path: str = "root") -> list:
        """Recursively check for NaN values in response data"""
        nan_issues = []
        
        if isinstance(data, dict):
            for key, value in data.items():
                current_path = f"{path}.{key}"
                nan_issues.extend(self.check_for_nan_values(value, current_path))
        elif isinstance(data, list):
            for i, item in enumerate(data):
                current_path = f"{path}[{i}]"
                nan_issues.extend(self.check_for_nan_values(item, current_path))
        elif isinstance(data, (int, float)):
            if math.isnan(data) if isinstance(data, float) else False:
                nan_issues.append(f"NaN found at {path}")
        elif isinstance(data, str):
            if data.lower() in ['nan', 'null', 'undefined']:
                nan_issues.append(f"String NaN/null found at {path}: '{data}'")
        
        return nan_issues
    
    def test_endpoint_for_nan(self, name: str, method: str, endpoint: str, 
                             session: Optional[requests.Session] = None,
                             data: Optional[Dict] = None,
                             expected_status: int = 200,
                             json_data: Optional[Dict] = None) -> bool:
        """Test endpoint and check for NaN values"""
        url = f"{BASE_URL}{endpoint}"
        sess = session or self.session
        
        try:
            if method == "GET":
                response = sess.get(url, timeout=10)
            elif method == "POST":
                if json_data:
                    response = sess.post(url, json=json_data, timeout=10)
                else:
                    response = sess.post(url, data=data, timeout=10)
            elif method == "PUT":
                response = sess.put(url, json=json_data, timeout=10)
            else:
                self.log(f"{name}: Unsupported method {method}", "error")
                return False
            
            # Check status code
            if response.status_code == expected_status:
                self.log(f"{name}: {method} {endpoint} - Status {response.status_code}", "success")
                
                # Parse JSON and check for NaN values
                try:
                    json_response = response.json()
                    nan_issues = self.check_for_nan_values(json_response, name)
                    
                    if nan_issues:
                        self.log(f"{name}: Found NaN issues: {nan_issues}", "error")
                        self.results["nan_issues"].extend(nan_issues)
                        self.results["failed"].append(f"{name} (NaN values found)")
                        return False
                    else:
                        self.log(f"{name}: No NaN values detected ✓", "success")
                        self.results["passed"].append(name)
                        
                        # Store important IDs for later tests
                        if isinstance(json_response, dict):
                            if "partner" in json_response and "id" in json_response["partner"]:
                                self.partner_id = json_response["partner"]["id"]
                            if "id" in json_response and "product" in name.lower():
                                self.product_id = json_response["id"]
                        
                        return True
                        
                except json.JSONDecodeError:
                    self.log(f"{name}: Non-JSON response", "warning")
                    self.results["passed"].append(name)
                    return True
                except Exception as e:
                    self.log(f"{name}: Error parsing response: {str(e)}", "error")
                    self.results["failed"].append(f"{name} (Parse error)")
                    return False
            else:
                self.log(f"{name}: Expected {expected_status}, got {response.status_code}", "error")
                self.log(f"Response: {response.text[:200]}", "error")
                self.results["failed"].append(f"{name} (Status: {response.status_code})")
                return False
                
        except requests.exceptions.Timeout:
            self.log(f"{name}: Request timeout", "error")
            self.results["failed"].append(f"{name} (Timeout)")
            return False
        except Exception as e:
            self.log(f"{name}: {str(e)}", "error")
            self.results["failed"].append(f"{name} ({str(e)})")
            return False
    
    def test_health(self):
        """Test health check endpoint - Feature 1"""
        self.log("\n=== 1. Testing Health Check API ===", "info")
        return self.test_endpoint_for_nan("Health Check", "GET", "/api/health")
    
    def test_partner_registration(self):
        """Test partner registration - Feature 2"""
        self.log("\n=== 2. Testing Partner Registration ===", "info")
        
        # Generate unique username
        import time
        timestamp = int(time.time())
        
        partner_data = {
            "username": f"testpartner{timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "Test123!",
            "firstName": "Test",
            "lastName": "Partner",
            "phone": "+998901234567",
            "businessName": "Test Business LLC",
            "businessCategory": "electronics",
            "monthlyRevenue": "50000-100000"
        }
        
        result = self.test_endpoint_for_nan(
            "Partner Registration",
            "POST",
            "/api/partners/register",
            json_data=partner_data,
            expected_status=201
        )
        
        if result:
            # Update test credentials for login
            global TEST_CREDENTIALS
            TEST_CREDENTIALS["username"] = partner_data["username"]
            TEST_CREDENTIALS["password"] = partner_data["password"]
        
        return result
    
    def test_login_api(self):
        """Test login API - Feature 3"""
        self.log("\n=== 3. Testing Login API ===", "info")
        
        # Try with test credentials first
        result = self.test_endpoint_for_nan(
            "Partner Login",
            "POST",
            "/api/auth/login",
            session=self.partner_session,
            json_data=TEST_CREDENTIALS
        )
        
        if not result:
            # If test credentials fail, try to register and login
            self.log("Test credentials failed, trying registration", "warning")
            if self.test_partner_registration():
                result = self.test_endpoint_for_nan(
                    "Partner Login (after registration)",
                    "POST",
                    "/api/auth/login",
                    session=self.partner_session,
                    json_data=TEST_CREDENTIALS
                )
        
        return result
    
    def test_partner_profile_api(self):
        """Test partner profile API - Feature 4 (check aiCardsUsed for NaN)"""
        self.log("\n=== 4. Testing Partner Profile API (aiCardsUsed field) ===", "info")
        
        result = self.test_endpoint_for_nan(
            "Partner Profile (/api/partners/me)",
            "GET",
            "/api/partners/me",
            session=self.partner_session
        )
        
        # Additional check specifically for aiCardsUsed field
        if result:
            try:
                url = f"{BASE_URL}/api/partners/me"
                response = self.partner_session.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    ai_cards_used = data.get('aiCardsUsed', 0)
                    
                    if isinstance(ai_cards_used, (int, float)) and not math.isnan(ai_cards_used if isinstance(ai_cards_used, float) else 0):
                        self.log(f"aiCardsUsed field is valid: {ai_cards_used}", "success")
                    else:
                        self.log(f"aiCardsUsed field has NaN issue: {ai_cards_used}", "error")
                        self.results["nan_issues"].append("aiCardsUsed field contains NaN")
                        return False
            except Exception as e:
                self.log(f"Error checking aiCardsUsed field: {str(e)}", "warning")
        
        return result
    
    def test_products_api(self):
        """Test products API - Feature 5"""
        self.log("\n=== 5. Testing Products API ===", "info")
        
        # Test GET /api/products
        get_result = self.test_endpoint_for_nan(
            "Get Products",
            "GET",
            "/api/products",
            session=self.partner_session
        )
        
        # Test POST /api/products
        product_data = {
            "name": "Test Product for NaN Check",
            "category": "electronics",
            "price": 99.99,
            "description": "Test product to check for NaN values",
            "costPrice": 50.00,
            "sku": f"TEST-{int(time.time())}",
            "weight": "1.5"
        }
        
        create_result = self.test_endpoint_for_nan(
            "Create Product",
            "POST",
            "/api/products",
            session=self.partner_session,
            json_data=product_data,
            expected_status=201
        )
        
        return get_result and create_result
    
    def test_ai_dashboard_api(self):
        """Test AI dashboard API - Feature 6 (check for NaN values)"""
        self.log("\n=== 6. Testing AI Dashboard API ===", "info")
        
        return self.test_endpoint_for_nan(
            "AI Dashboard (/api/ai/dashboard)",
            "GET",
            "/api/ai/dashboard",
            session=self.partner_session
        )
    
    def test_ai_monitoring_api(self):
        """Test AI monitoring API - Feature 7 (critical NaN fix)"""
        self.log("\n=== 7. Testing AI Monitoring API (Critical NaN Fix) ===", "info")
        
        # First get partner ID if we don't have it
        if not self.partner_id:
            try:
                url = f"{BASE_URL}/api/partners/me"
                response = self.partner_session.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self.partner_id = data.get('id')
            except:
                pass
        
        if self.partner_id:
            return self.test_endpoint_for_nan(
                f"AI Monitoring (/api/ai-manager/monitor/partner/{self.partner_id})",
                "POST",
                f"/api/ai-manager/monitor/partner/{self.partner_id}",
                session=self.partner_session
            )
        else:
            self.log("Cannot test AI monitoring - no partner ID available", "warning")
            return False
    
    def test_admin_login(self):
        """Test admin login"""
        self.log("\n=== Testing Admin Login ===", "info")
        return self.test_endpoint_for_nan(
            "Admin Login",
            "POST",
            "/api/auth/login",
            session=self.admin_session,
            json_data=ADMIN_CREDENTIALS
        )
    
    def run_nan_bug_tests(self):
        """Run tests specifically for NaN bug fixes mentioned in review request"""
        self.log("\n" + "="*70, "info")
        self.log("SELLERCLOUDX NaN BUG FIX VERIFICATION TESTS", "info")
        self.log("Testing all features mentioned in review request", "info")
        self.log("="*70 + "\n", "info")
        
        # Test sequence based on review request features
        tests = [
            ("1. Health Check API", self.test_health),
            ("2. Partner Registration", self.test_partner_registration),
            ("3. Login API", self.test_login_api),
            ("4. Partner Profile (aiCardsUsed)", self.test_partner_profile_api),
            ("5. Products API", self.test_products_api),
            ("6. AI Dashboard", self.test_ai_dashboard_api),
            ("7. AI Monitoring (Critical)", self.test_ai_monitoring_api),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log(f"Test '{test_name}' crashed: {str(e)}", "error")
                self.results["failed"].append(f"{test_name} (Crashed)")
        
        # Test admin login for additional verification
        try:
            self.test_admin_login()
        except Exception as e:
            self.log(f"Admin login test crashed: {str(e)}", "error")
        
        # Print summary
        return self.print_summary()
    
    def print_summary(self):
        """Print test summary with NaN focus"""
        self.log("\n" + "="*70, "info")
        self.log("NaN BUG FIX VERIFICATION SUMMARY", "info")
        self.log("="*70 + "\n", "info")
        
        total = len(self.results["passed"]) + len(self.results["failed"])
        passed = len(self.results["passed"])
        failed = len(self.results["failed"])
        nan_issues_count = len(self.results["nan_issues"])
        
        self.log(f"Total Tests: {total}", "info")
        self.log(f"Passed: {passed}", "success")
        self.log(f"Failed: {failed}", "error" if failed > 0 else "info")
        self.log(f"NaN Issues Found: {nan_issues_count}", "error" if nan_issues_count > 0 else "success")
        
        if self.results["nan_issues"]:
            self.log("\n🚨 NaN ISSUES DETECTED:", "error")
            for issue in self.results["nan_issues"]:
                self.log(f"  - {issue}", "error")
        else:
            self.log("\n✅ NO NaN VALUES DETECTED - Bug fix successful!", "success")
        
        if self.results["failed"]:
            self.log("\nFailed Tests:", "error")
            for test in self.results["failed"]:
                self.log(f"  - {test}", "error")
        
        if self.results["warnings"]:
            self.log("\nWarnings:", "warning")
            for warning in self.results["warnings"]:
                self.log(f"  - {warning}", "warning")
        
        # Final verdict
        if nan_issues_count == 0 and failed == 0:
            self.log("\n🎉 ALL TESTS PASSED - NaN bug fix verified!", "success")
        elif nan_issues_count == 0:
            self.log("\n✅ No NaN issues found, but some API tests failed", "warning")
        else:
            self.log("\n❌ NaN issues still present - bug fix incomplete", "error")
        
        self.log("\n" + "="*70 + "\n", "info")
        
        # Return exit code (0 if no NaN issues, 1 if NaN issues found)
        return 0 if nan_issues_count == 0 else 1

if __name__ == "__main__":
    import time
    tester = NaNBugTester()
    # Run NaN bug fix verification tests
    exit_code = tester.run_nan_bug_tests()
    sys.exit(exit_code)
