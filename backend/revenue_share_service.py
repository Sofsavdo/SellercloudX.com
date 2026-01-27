"""
Revenue Share Service - 2026 Monetization Model
Handles revenue share calculation, debt tracking, and account blocking

Premium Tariff: $699 setup + $499/month + 4% revenue share
Individual Tariff: Custom contract

Features:
- Track partner sales from Yandex Market API
- Calculate monthly revenue share (4% of sales)
- Track debt and payment history
- Auto-block accounts with overdue payments
"""

import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import asyncio

# Constants
USD_TO_UZS = 12600  # Current exchange rate
DEBT_GRACE_DAYS = 7  # Days before blocking
BLOCK_DURATION_DAYS = 14  # How long account stays blocked
DEFAULT_REVENUE_SHARE_PERCENT = 0.04  # 4%
DEFAULT_MONTHLY_FEE_USD = 499


def calculate_revenue_share(total_sales_uzs: float, share_percent: float = 0.04) -> int:
    """Calculate revenue share amount from total sales"""
    return int(total_sales_uzs * share_percent)


def get_current_month() -> int:
    """Get current month in YYYYMM format"""
    now = datetime.now()
    return int(f"{now.year}{str(now.month).zfill(2)}")


def get_month_name(month_int: int) -> str:
    """Convert YYYYMM to readable format"""
    year = month_int // 100
    month = month_int % 100
    months = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 
              'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
    return f"{months[month]} {year}"


class RevenueShareService:
    """
    Revenue Share calculation and management service
    """
    
    def __init__(self):
        self.usd_to_uzs = USD_TO_UZS
    
    def calculate_monthly_bill(
        self,
        total_sales_uzs: float,
        monthly_fee_usd: float = DEFAULT_MONTHLY_FEE_USD,
        revenue_share_percent: float = DEFAULT_REVENUE_SHARE_PERCENT
    ) -> Dict[str, Any]:
        """
        Calculate complete monthly bill for a partner
        
        Returns:
        - monthly_fee_uzs: Fixed monthly subscription
        - revenue_share_uzs: 4% of total sales
        - total_debt_uzs: Total amount due
        """
        monthly_fee_uzs = int(monthly_fee_usd * self.usd_to_uzs)
        revenue_share_uzs = calculate_revenue_share(total_sales_uzs, revenue_share_percent)
        total_debt_uzs = monthly_fee_uzs + revenue_share_uzs
        
        return {
            "month": get_current_month(),
            "month_name": get_month_name(get_current_month()),
            "sales": {
                "total_uzs": total_sales_uzs,
                "total_usd": round(total_sales_uzs / self.usd_to_uzs, 2)
            },
            "fees": {
                "monthly_fee_usd": monthly_fee_usd,
                "monthly_fee_uzs": monthly_fee_uzs,
                "revenue_share_percent": revenue_share_percent * 100,
                "revenue_share_uzs": revenue_share_uzs,
                "revenue_share_usd": round(revenue_share_uzs / self.usd_to_uzs, 2)
            },
            "total": {
                "debt_uzs": total_debt_uzs,
                "debt_usd": round(total_debt_uzs / self.usd_to_uzs, 2)
            }
        }
    
    def check_blocking_status(
        self,
        last_payment_date: Optional[datetime],
        total_debt_uzs: float
    ) -> Dict[str, Any]:
        """
        Check if partner should be blocked for non-payment
        
        Rules:
        - Grace period: 7 days after month end
        - Block duration: 14 days
        - Unblock after payment
        """
        now = datetime.now()
        
        if total_debt_uzs <= 0:
            return {
                "should_block": False,
                "status": "active",
                "message": "Barcha to'lovlar bajarilgan"
            }
        
        if not last_payment_date:
            # Never paid - check grace period
            month_start = datetime(now.year, now.month, 1)
            days_since_month_start = (now - month_start).days
            
            if days_since_month_start > DEBT_GRACE_DAYS:
                return {
                    "should_block": True,
                    "status": "overdue",
                    "message": f"To'lov {days_since_month_start - DEBT_GRACE_DAYS} kun kechiktirilgan",
                    "debt_uzs": total_debt_uzs,
                    "debt_usd": round(total_debt_uzs / self.usd_to_uzs, 2)
                }
        else:
            # Has payment history
            days_since_payment = (now - last_payment_date).days
            if days_since_payment > 30 + DEBT_GRACE_DAYS:
                return {
                    "should_block": True,
                    "status": "overdue",
                    "message": f"Oxirgi to'lovdan {days_since_payment} kun o'tdi",
                    "debt_uzs": total_debt_uzs,
                    "debt_usd": round(total_debt_uzs / self.usd_to_uzs, 2),
                    "last_payment": last_payment_date.isoformat()
                }
        
        return {
            "should_block": False,
            "status": "active",
            "grace_period_remaining": max(0, DEBT_GRACE_DAYS - (now - datetime(now.year, now.month, 1)).days),
            "debt_uzs": total_debt_uzs
        }
    
    def generate_invoice(
        self,
        partner_id: str,
        partner_name: str,
        total_sales_uzs: float,
        monthly_fee_usd: float = DEFAULT_MONTHLY_FEE_USD,
        revenue_share_percent: float = DEFAULT_REVENUE_SHARE_PERCENT
    ) -> Dict[str, Any]:
        """
        Generate invoice for partner
        """
        bill = self.calculate_monthly_bill(
            total_sales_uzs=total_sales_uzs,
            monthly_fee_usd=monthly_fee_usd,
            revenue_share_percent=revenue_share_percent
        )
        
        invoice_id = f"INV-{partner_id[:6]}-{get_current_month()}"
        
        return {
            "invoice_id": invoice_id,
            "partner_id": partner_id,
            "partner_name": partner_name,
            "created_at": datetime.now().isoformat(),
            "due_date": (datetime.now() + timedelta(days=DEBT_GRACE_DAYS)).isoformat(),
            "status": "pending",
            **bill,
            "payment_methods": [
                {
                    "type": "bank_transfer",
                    "details": {
                        "bank": "Xalq Banki",
                        "account": "20208000XXXXXXXXX",
                        "name": "SELLERCLOUDX LLC"
                    }
                },
                {
                    "type": "click",
                    "service_id": 92585,
                    "merchant_id": 54318
                }
            ]
        }


# Global instance
revenue_share_service = RevenueShareService()


async def get_partner_billing_summary(
    partner_id: str,
    yandex_sales: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Get complete billing summary for a partner
    
    Includes:
    - Current month sales from Yandex
    - Revenue share calculation
    - Outstanding debt
    - Payment history
    """
    # Get sales from Yandex if available
    total_sales_uzs = 0
    if yandex_sales:
        total_sales_uzs = yandex_sales.get("total_sales_uzs", 0)
    
    # Calculate bill
    bill = revenue_share_service.calculate_monthly_bill(
        total_sales_uzs=total_sales_uzs
    )
    
    # Check blocking status
    blocking = revenue_share_service.check_blocking_status(
        last_payment_date=None,  # TODO: Get from database
        total_debt_uzs=bill["total"]["debt_uzs"]
    )
    
    return {
        "partner_id": partner_id,
        "billing": bill,
        "account_status": blocking,
        "payment_due": (datetime.now() + timedelta(days=DEBT_GRACE_DAYS)).isoformat()
    }


async def sync_sales_and_calculate_share(
    partner_id: str,
    oauth_token: str,
    business_id: str
) -> Dict[str, Any]:
    """
    Sync sales from Yandex Market and calculate revenue share
    
    This should be called:
    1. Monthly via cron job
    2. When partner requests billing summary
    """
    from yandex_service import YandexMarketAPI
    
    try:
        api = YandexMarketAPI(oauth_token=oauth_token, business_id=business_id)
        
        # Get sales data from Yandex
        # Note: Actual implementation depends on Yandex API
        # For now, we'll use offers data as proxy
        offers_result = await api.get_all_offers_status(limit=100)
        
        if not offers_result.get("success"):
            return {"success": False, "error": "Yandex API xatosi"}
        
        stats = offers_result.get("stats", {})
        total_products = stats.get("total", 0)
        ready_products = stats.get("ready", 0)
        
        # Estimate sales (this is simplified - real implementation needs order data)
        # Assuming average product price of 200,000 UZS and 30% sell-through rate
        estimated_monthly_sales = ready_products * 200000 * 0.3
        
        # Calculate bill
        bill = revenue_share_service.calculate_monthly_bill(
            total_sales_uzs=estimated_monthly_sales
        )
        
        return {
            "success": True,
            "partner_id": partner_id,
            "products": {
                "total": total_products,
                "active": ready_products
            },
            "sales_estimate": {
                "monthly_uzs": estimated_monthly_sales,
                "monthly_usd": round(estimated_monthly_sales / USD_TO_UZS, 2),
                "note": "Bu taxminiy hisob. Aniq ma'lumot uchun Yandex Partner kabinetini tekshiring."
            },
            "billing": bill
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}
