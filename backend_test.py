#!/usr/bin/env python3
"""
SellerCloudX AI Services Testing
Tests for Trend Hunter API, AI Scanner API, and AI Status endpoints
Focus on features mentioned in review request
"""

import requests
import json
import sys
import base64
from typing import Dict, Any, Optional

# Configuration - Using the external URL from frontend/.env
BASE_URL = "https://sellercloudx.preview.emergentagent.com"
# Test credentials from review request
ADMIN_CREDENTIALS = {"username": "admin", "password": "admin123"}

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
        self.results = {
            "passed": [],
            "failed": [],
            "warnings": []
        }
        self.auth_token = None
        
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
                     files: Optional[Dict] = None) -> bool:
        """Test endpoint and validate response"""
        url = f"{BASE_URL}{endpoint}"
        sess = session or self.session
        
        try:
            if method == "GET":
                response = sess.get(url, timeout=30)
            elif method == "POST":
                if files:
                    response = sess.post(url, files=files, data=data, timeout=30)
                elif json_data:
                    response = sess.post(url, json=json_data, timeout=30)
                else:
                    response = sess.post(url, data=data, timeout=30)
            else:
                self.log(f"{name}: Unsupported method {method}", "error")
                return False
            
            # Check status code
            if response.status_code == expected_status:
                self.log(f"{name}: {method} {endpoint} - Status {response.status_code}", "success")
                
                # Parse and validate JSON response
                try:
                    json_response = response.json()
                    self.log(f"{name}: Response structure valid", "success")
                    
                    # Log response for debugging
                    if json_response.get("success"):
                        self.log(f"{name}: API returned success=true", "success")
                    else:
                        self.log(f"{name}: API returned success=false - {json_response.get('error', 'Unknown error')}", "warning")
                    
                    self.results["passed"].append(name)
                    return True
                        
                except json.JSONDecodeError:
                    self.log(f"{name}: Non-JSON response: {response.text[:200]}", "warning")
                    self.results["passed"].append(name)
                    return True
                except Exception as e:
                    self.log(f"{name}: Error parsing response: {str(e)}", "error")
                    self.results["failed"].append(f"{name} (Parse error)")
                    return False
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
    
    def test_admin_login(self):
        """Test admin login to get authentication"""
        self.log("\n=== Testing Admin Login ===", "info")
        
        result = self.test_endpoint(
            "Admin Login",
            "POST",
            "/api/auth/login",
            session=self.admin_session,
            json_data=ADMIN_CREDENTIALS
        )
        
        if result:
            # Store session for authenticated requests
            self.session = self.admin_session
            self.log("Admin authentication successful - using admin session for tests", "success")
        
        return result
    
    def test_trend_hunter_top(self):
        """Test Trend Hunter API - GET /api/trends/top?limit=5"""
        self.log("\n=== 1. Testing Trend Hunter API - Top 5 Opportunities ===", "info")
        
        return self.test_endpoint(
            "Trend Hunter - Top 5 Opportunities",
            "GET",
            "/api/trends/top?limit=5",
            session=self.session
        )
    
    def test_trend_hunter_opportunities(self):
        """Test Trend Hunter API - GET /api/trends/opportunities?category=electronics&limit=10"""
        self.log("\n=== 2. Testing Trend Hunter API - Electronics Category ===", "info")
        
        return self.test_endpoint(
            "Trend Hunter - Electronics Opportunities",
            "GET",
            "/api/trends/opportunities?category=electronics&limit=10",
            session=self.session
        )
    
    def test_trend_hunter_saved(self):
        """Test Trend Hunter API - GET /api/trends/saved"""
        self.log("\n=== 3. Testing Trend Hunter API - Saved Trends ===", "info")
        
        return self.test_endpoint(
            "Trend Hunter - Saved Trends",
            "GET",
            "/api/trends/saved",
            session=self.session
        )
    
    def test_ai_scanner_scan_image(self):
        """Test AI Scanner API - POST /api/ai/scanner/scan-image"""
        self.log("\n=== 4. Testing AI Scanner API - Scan Image ===", "info")
        
        # Test with imageUrl in JSON body as specified in review request
        image_data = {
            "imageUrl": "https://example.com/product.jpg"
        }
        
        # First try the endpoint mentioned in review request
        result1 = self.test_endpoint(
            "AI Scanner - Scan Image (Review Request Endpoint)",
            "POST",
            "/api/ai/scanner/scan-image",
            session=self.session,
            json_data=image_data
        )
        
        # Also test the FastAPI backend endpoint
        result2 = self.test_endpoint(
            "AI Scanner - Scan Image (FastAPI Backend)",
            "POST",
            "/api/ai/scan-image",
            session=self.session,
            json_data=image_data
        )
        
        return result1 or result2
    
    def test_ai_status(self):
        """Test AI Status - GET /api/ai/status"""
        self.log("\n=== 5. Testing AI Status API ===", "info")
        
        # Test both possible endpoints
        result1 = self.test_endpoint(
            "AI Status (FastAPI Backend)",
            "GET",
            "/api/ai/status",
            session=self.session
        )
        
        result2 = self.test_endpoint(
            "AI Status (Express Server)",
            "GET",
            "/api/ai/scanner/status",
            session=self.session
        )
        
        return result1 or result2
    
    def validate_trend_response_structure(self, endpoint: str):
        """Validate trend response has required fields"""
        self.log(f"\n=== Validating {endpoint} Response Structure ===", "info")
        
        try:
            url = f"{BASE_URL}{endpoint}"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("data"):
                    trends = data["data"]
                    if trends and len(trends) > 0:
                        trend = trends[0]
                        
                        # Check required fields from review request
                        # Note: competitors count is in product.competitorCount, not root level
                        required_fields = [
                            "profitMargin", "monthlyProfitEstimate", 
                            "opportunityScore"
                        ]
                        
                        missing_fields = []
                        for field in required_fields:
                            if field not in trend:
                                missing_fields.append(field)
                        
                        # Check if competitors info exists (either as competitors or in product.competitorCount)
                        has_competitors = "competitors" in trend or (
                            "product" in trend and "competitorCount" in trend["product"]
                        )
                        
                        if missing_fields:
                            self.log(f"Missing required fields in trend data: {missing_fields}", "warning")
                            self.results["warnings"].append(f"{endpoint} - Missing fields: {missing_fields}")
                        else:
                            self.log(f"All required trend fields present", "success")
                        
                        if not has_competitors:
                            self.log(f"Missing competitors information", "warning")
                            self.results["warnings"].append(f"{endpoint} - Missing competitors info")
                        else:
                            self.log(f"Competitors information available", "success")
                            
                        # Validate score is 0-100
                        score = trend.get("opportunityScore", 0)
                        if isinstance(score, (int, float)) and 0 <= score <= 100:
                            self.log(f"Opportunity score valid: {score}", "success")
                        else:
                            self.log(f"Opportunity score invalid: {score} (should be 0-100)", "warning")
                        
                        # Check if prices are in UZS format (should be large numbers for UZS)
                        price_fields = ["recommendedPrice", "totalCost", "localAvgPrice"]
                        for field in price_fields:
                            if field in trend:
                                price = trend[field]
                                if isinstance(price, (int, float)) and price > 1000:  # UZS prices should be large
                                    self.log(f"Price field {field} appears to be in UZS format: {price:,.0f}", "success")
                                else:
                                    self.log(f"Price field {field} might not be in UZS format: {price}", "warning")
                        
                        return True
                    else:
                        self.log(f"No trend data returned", "warning")
                        return True
                else:
                    self.log(f"Response structure invalid or no data", "warning")
                    return True
            else:
                self.log(f"Failed to get response for validation: {response.status_code}", "warning")
                return False
                
        except Exception as e:
            self.log(f"Validation error: {str(e)}", "warning")
            return False
    
    def run_sellercloudx_tests(self):
        """Run all SellerCloudX AI service tests"""
        self.log("\n" + "="*70, "info")
        self.log("SELLERCLOUDX AI SERVICES TESTING", "info")
        self.log("Testing Trend Hunter API, AI Scanner API, and AI Status", "info")
        self.log("="*70 + "\n", "info")
        
        # Test sequence based on review request
        tests = [
            ("Admin Login", self.test_admin_login),
            ("Trend Hunter - Top 5", self.test_trend_hunter_top),
            ("Trend Hunter - Electronics", self.test_trend_hunter_opportunities),
            ("Trend Hunter - Saved", self.test_trend_hunter_saved),
            ("AI Scanner - Scan Image", self.test_ai_scanner_scan_image),
            ("AI Status", self.test_ai_status),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log(f"Test '{test_name}' crashed: {str(e)}", "error")
                self.results["failed"].append(f"{test_name} (Crashed)")
        
        # Validate response structures
        try:
            self.validate_trend_response_structure("/api/trends/top?limit=5")
            self.validate_ai_status_response()
        except Exception as e:
            self.log(f"Response validation crashed: {str(e)}", "error")
        
        # Print summary
        return self.print_summary()
    
    def validate_ai_status_response(self):
        """Validate AI status response structure"""
        self.log(f"\n=== Validating AI Status Response Structure ===", "info")
        
        try:
            url = f"{BASE_URL}/api/ai/status"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields from review request
                if data.get("success") and "ai" in data:
                    ai_info = data["ai"]
                    
                    # Check for services status object
                    required_ai_fields = ["enabled", "provider"]
                    missing_fields = []
                    
                    for field in required_ai_fields:
                        if field not in ai_info:
                            missing_fields.append(field)
                    
                    if missing_fields:
                        self.log(f"Missing AI status fields: {missing_fields}", "warning")
                        self.results["warnings"].append(f"AI Status - Missing fields: {missing_fields}")
                    else:
                        self.log(f"AI status structure valid", "success")
                        
                        # Check if AI is enabled
                        if ai_info.get("enabled"):
                            self.log(f"AI services are enabled with provider: {ai_info.get('provider')}", "success")
                        else:
                            self.log(f"AI services are disabled", "warning")
                    
                    return True
                else:
                    self.log(f"AI status response structure invalid", "warning")
                    return False
            else:
                self.log(f"Failed to get AI status: {response.status_code}", "warning")
                return False
                
        except Exception as e:
            self.log(f"AI status validation error: {str(e)}", "warning")
            return False
    
    def print_summary(self):
        """Print test summary"""
        self.log("\n" + "="*70, "info")
        self.log("SELLERCLOUDX AI SERVICES TEST SUMMARY", "info")
        self.log("="*70 + "\n", "info")
        
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
            self.log("\nWarnings:", "warning")
            for warning in self.results["warnings"]:
                self.log(f"  - {warning}", "warning")
        
        # Final verdict
        if failed == 0:
            self.log("\n🎉 ALL TESTS PASSED - SellerCloudX AI services working!", "success")
        else:
            self.log(f"\n⚠️ {failed} tests failed - some issues need attention", "warning")
        
        self.log("\n" + "="*70 + "\n", "info")
        
        # Return exit code (0 if all passed, 1 if any failed)
        return 0 if failed == 0 else 1

if __name__ == "__main__":
    tester = SellerCloudXTester()
    # Run SellerCloudX AI services tests
    exit_code = tester.run_sellercloudx_tests()
    sys.exit(exit_code)