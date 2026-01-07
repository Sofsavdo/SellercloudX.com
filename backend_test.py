#!/usr/bin/env python3
"""
SellerCloudX Backend API Testing
Tests all backend endpoints systematically with focus on p.reduce error
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://localhost:8001"
ADMIN_CREDENTIALS = {"username": "Medik", "password": "Medik9298"}
PARTNER_CREDENTIALS = {"username": "partner", "password": "partner123"}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

class SellerCloudXTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_session = requests.Session()
        self.partner_session = requests.Session()
        self.results = {
            "passed": [],
            "failed": [],
            "warnings": []
        }
        
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
    
    def test_endpoint(self, name: str, method: str, endpoint: str, 
                     session: Optional[requests.Session] = None,
                     data: Optional[Dict] = None,
                     expected_status: int = 200,
                     json_data: Optional[Dict] = None,
                     check_array_structure: bool = False) -> bool:
        """Test a single endpoint with enhanced error checking"""
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
            elif method == "DELETE":
                response = sess.delete(url, timeout=10)
            else:
                self.log(f"{name}: Unsupported method {method}", "error")
                return False
            
            # Check status code
            if response.status_code == expected_status:
                self.log(f"{name}: {method} {endpoint} - Status {response.status_code}", "success")
                
                # Check response structure for p.reduce error
                try:
                    json_response = response.json()
                    
                    # Special check for array vs object structure (p.reduce error)
                    if check_array_structure and isinstance(json_response, dict):
                        # Look for common patterns that might cause p.reduce errors
                        for key, value in json_response.items():
                            if key in ['data', 'items', 'results', 'payments', 'transactions']:
                                if not isinstance(value, list):
                                    self.log(f"{name}: WARNING - {key} is not an array, might cause p.reduce error", "warning")
                                    self.results["warnings"].append(f"{name} - {key} not array")
                    
                    # Log response structure for debugging
                    if isinstance(json_response, dict):
                        keys = list(json_response.keys())[:5]  # First 5 keys
                        self.log(f"{name}: Response keys: {keys}", "info")
                    elif isinstance(json_response, list):
                        self.log(f"{name}: Response is array with {len(json_response)} items", "info")
                        
                except Exception as parse_error:
                    self.log(f"{name}: Response not JSON: {str(parse_error)}", "warning")
                
                self.results["passed"].append(name)
                return True
            else:
                self.log(f"{name}: Expected {expected_status}, got {response.status_code}", "error")
                self.log(f"Response: {response.text[:300]}", "error")
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
        """Test health check endpoint"""
        self.log("\n=== Testing Health Check ===", "info")
        return self.test_endpoint("Health Check", "GET", "/api/health")
    
    def test_admin_login(self):
        """Test admin login"""
        self.log("\n=== Testing Admin Authentication ===", "info")
        result = self.test_endpoint(
            "Admin Login",
            "POST",
            "/api/auth/login",
            session=self.admin_session,
            json_data=ADMIN_CREDENTIALS
        )
        return result
    
    def test_admin_me(self):
        """Test admin /me endpoint"""
        return self.test_endpoint(
            "Admin Auth Check",
            "GET",
            "/api/auth/me",
            session=self.admin_session
        )
    
    def test_partner_login(self):
        """Test partner login"""
        self.log("\n=== Testing Partner Authentication ===", "info")
        result = self.test_endpoint(
            "Partner Login",
            "POST",
            "/api/auth/login",
            session=self.partner_session,
            json_data=PARTNER_CREDENTIALS
        )
        return result
    
    def test_partner_me(self):
        """Test partner /me endpoint"""
        return self.test_endpoint(
            "Partner Auth Check",
            "GET",
            "/api/auth/me",
            session=self.partner_session
        )
    
    def test_partner_wallet(self):
        """Test partner wallet endpoint - CRITICAL for p.reduce error"""
        self.log("\n=== Testing Partner Wallet (p.reduce focus) ===", "info")
        return self.test_endpoint(
            "Partner Wallet Balance",
            "GET",
            "/api/partner/wallet",
            session=self.partner_session,
            check_array_structure=True
        )
    
    def test_partner_payment_history(self):
        """Test partner payment history - CRITICAL for p.reduce error"""
        self.log("\n=== Testing Partner Payment History (p.reduce focus) ===", "info")
        return self.test_endpoint(
            "Partner Payment History",
            "GET",
            "/api/partner/payment-history",
            session=self.partner_session,
            check_array_structure=True
        )
    
    def test_partner_products(self):
        """Test partner products endpoint"""
        self.log("\n=== Testing Partner Products ===", "info")
        return self.test_endpoint(
            "Partner Products",
            "GET",
            "/api/products",
            session=self.partner_session,
            check_array_structure=True
        )
    
    def test_partner_analytics(self):
        """Test partner analytics endpoint"""
        self.log("\n=== Testing Partner Analytics ===", "info")
        return self.test_endpoint(
            "Partner Analytics",
            "GET",
            "/api/analytics",
            session=self.partner_session,
            check_array_structure=True
        )
    
    def test_admin_partners(self):
        """Test admin partners list"""
        self.log("\n=== Testing Admin Partners List ===", "info")
        return self.test_endpoint(
            "Admin Partners List",
            "GET",
            "/api/admin/partners",
            session=self.admin_session,
            check_array_structure=True
        )
    
    def test_admin_analytics(self):
        """Test admin business metrics"""
        self.log("\n=== Testing Admin Business Metrics ===", "info")
        return self.test_endpoint(
            "Admin Business Metrics",
            "GET",
            "/api/admin/business-metrics",
            session=self.admin_session,
            check_array_structure=True
        )
    
    def test_logout(self):
        """Test logout"""
        self.log("\n=== Testing Logout ===", "info")
        
        admin_logout = self.test_endpoint(
            "Admin Logout",
            "POST",
            "/api/auth/logout",
            session=self.admin_session
        )
        
        partner_logout = self.test_endpoint(
            "Partner Logout",
            "POST",
            "/api/auth/logout",
            session=self.partner_session
        )
        
        return admin_logout and partner_logout
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("\n" + "="*60, "info")
        self.log("SELLERCLOUDX BACKEND API COMPREHENSIVE TEST", "info")
        self.log("Focus: p.reduce error detection and session handling", "info")
        self.log("="*60 + "\n", "info")
        
        # Test sequence - prioritize critical endpoints
        tests = [
            ("Health Check", self.test_health),
            ("Admin Login", self.test_admin_login),
            ("Admin Auth Check", self.test_admin_me),
            ("Partner Login", self.test_partner_login),
            ("Partner Auth Check", self.test_partner_me),
            ("Partner Wallet (p.reduce critical)", self.test_partner_wallet),
            ("Partner Payment History (p.reduce critical)", self.test_partner_payment_history),
            ("Partner Products", self.test_partner_products),
            ("Partner Analytics", self.test_partner_analytics),
            ("Admin Partners List", self.test_admin_partners),
            ("Admin Analytics", self.test_admin_analytics),
            ("Logout", self.test_logout),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log(f"Test '{test_name}' crashed: {str(e)}", "error")
                self.results["failed"].append(f"{test_name} (Crashed)")
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        self.log("\n" + "="*60, "info")
        self.log("TEST SUMMARY", "info")
        self.log("="*60 + "\n", "info")
        
        total = len(self.results["passed"]) + len(self.results["failed"])
        passed = len(self.results["passed"])
        failed = len(self.results["failed"])
        warnings = len(self.results["warnings"])
        
        self.log(f"Total Tests: {total}", "info")
        self.log(f"Passed: {passed}", "success")
        self.log(f"Failed: {failed}", "error" if failed > 0 else "info")
        self.log(f"Warnings: {warnings}", "warning" if warnings > 0 else "info")
        
        if self.results["failed"]:
            self.log("\nFailed Tests:", "error")
            for test in self.results["failed"]:
                self.log(f"  - {test}", "error")
        
        if self.results["warnings"]:
            self.log("\nWarnings (Potential p.reduce issues):", "warning")
            for warning in self.results["warnings"]:
                self.log(f"  - {warning}", "warning")
        
        self.log("\n" + "="*60 + "\n", "info")
        
        # Return exit code
        return 0 if failed == 0 else 1

if __name__ == "__main__":
    tester = SellerCloudXTester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)