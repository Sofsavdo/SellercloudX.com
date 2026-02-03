"""
AI LOAD BALANCER & QUEUE SYSTEM
================================
Minglab parallel so'rovlar uchun optimallashtirilgan

Features:
- Auto rate limit handling
- Multiple provider failover
- Request queuing
- Concurrent request management
"""

import os
import asyncio
import time
from typing import Dict, Any, Optional, List, Callable
from collections import deque
from dataclasses import dataclass
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "")


@dataclass
class AIProvider:
    """AI Provider konfiguratsiyasi"""
    name: str
    api_key: str
    rpm_limit: int  # Requests per minute
    priority: int   # 1 = highest
    enabled: bool
    current_rpm: int = 0
    last_reset: datetime = None
    
    def __post_init__(self):
        self.last_reset = datetime.now()
    
    def can_make_request(self) -> bool:
        """Rate limit tekshirish"""
        now = datetime.now()
        
        # Reset RPM every minute
        if (now - self.last_reset).seconds >= 60:
            self.current_rpm = 0
            self.last_reset = now
        
        return self.enabled and self.api_key and self.current_rpm < self.rpm_limit
    
    def record_request(self):
        """So'rov yozish"""
        self.current_rpm += 1


class AILoadBalancer:
    """
    AI Load Balancer - Minglab so'rovlar uchun
    
    Features:
    - Auto failover between providers
    - Rate limit management
    - Request queuing
    - Concurrent request handling
    """
    
    def __init__(self):
        # Provider'lar (tartib bo'yicha)
        self.providers: Dict[str, AIProvider] = {
            "openai": AIProvider(
                name="OpenAI GPT-4o",
                api_key=OPENAI_API_KEY,
                rpm_limit=10000,  # Tier 5
                priority=1,
                enabled=bool(OPENAI_API_KEY)
            ),
            "anthropic": AIProvider(
                name="Anthropic Claude",
                api_key=ANTHROPIC_API_KEY,
                rpm_limit=4000,  # Default tier
                priority=2,
                enabled=bool(ANTHROPIC_API_KEY)
            ),
            "emergent": AIProvider(
                name="Emergent LLM",
                api_key=EMERGENT_LLM_KEY,
                rpm_limit=1000,  # Estimated
                priority=3,
                enabled=bool(EMERGENT_LLM_KEY)
            ),
            "gemini": AIProvider(
                name="Google Gemini",
                api_key=GOOGLE_API_KEY,
                rpm_limit=60,  # Free tier: 15 RPM, paid: higher
                priority=4,
                enabled=bool(GOOGLE_API_KEY)
            )
        }
        
        # Request queue
        self.queue: deque = deque()
        self.processing = False
        
        # Semaphore for concurrent requests
        self.max_concurrent = 50  # Max parallel requests
        self.semaphore = asyncio.Semaphore(self.max_concurrent)
        
        # Stats
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        
        self._log_status()
    
    def _log_status(self):
        """Provider statuslarini log qilish"""
        print("\n" + "="*50)
        print("🤖 AI LOAD BALANCER STATUS")
        print("="*50)
        
        for name, provider in self.providers.items():
            status = "✅ ENABLED" if provider.enabled else "❌ DISABLED"
            print(f"  {provider.name}: {status} (RPM: {provider.rpm_limit})")
        
        print("="*50 + "\n")
    
    def get_available_provider(self) -> Optional[str]:
        """Mavjud provider'ni topish (priority bo'yicha)"""
        
        # Sort by priority
        sorted_providers = sorted(
            self.providers.items(),
            key=lambda x: x[1].priority
        )
        
        for name, provider in sorted_providers:
            if provider.can_make_request():
                return name
        
        return None
    
    async def process_request(
        self,
        request_type: str,
        request_func: Callable,
        *args,
        **kwargs
    ) -> Dict[str, Any]:
        """
        So'rovni qayta ishlash (auto failover bilan)
        
        Args:
            request_type: vision, text, image, etc.
            request_func: Async function to call
            *args, **kwargs: Function arguments
        
        Returns:
            AI response
        """
        async with self.semaphore:
            self.total_requests += 1
            
            # Get available provider
            provider_name = self.get_available_provider()
            
            if not provider_name:
                # All providers busy - wait and retry
                await asyncio.sleep(1)
                provider_name = self.get_available_provider()
                
                if not provider_name:
                    self.failed_requests += 1
                    return {
                        "success": False,
                        "error": "Barcha AI providerlar band. Keyinroq urinib ko'ring.",
                        "code": "RATE_LIMIT_EXCEEDED"
                    }
            
            provider = self.providers[provider_name]
            provider.record_request()
            
            try:
                # Execute request
                result = await request_func(provider_name, *args, **kwargs)
                self.successful_requests += 1
                
                return {
                    "success": True,
                    "data": result,
                    "provider": provider_name
                }
                
            except Exception as e:
                error_msg = str(e)
                
                # Rate limit error - try another provider
                if "rate" in error_msg.lower() or "429" in error_msg:
                    # Disable this provider temporarily
                    provider.current_rpm = provider.rpm_limit
                    
                    # Try another provider
                    fallback_provider = self.get_available_provider()
                    
                    if fallback_provider:
                        try:
                            result = await request_func(fallback_provider, *args, **kwargs)
                            self.successful_requests += 1
                            return {
                                "success": True,
                                "data": result,
                                "provider": fallback_provider
                            }
                        except Exception as e2:
                            pass
                
                self.failed_requests += 1
                return {
                    "success": False,
                    "error": error_msg,
                    "provider": provider_name
                }
    
    def get_stats(self) -> Dict[str, Any]:
        """Statistikalarni olish"""
        return {
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "success_rate": (self.successful_requests / max(self.total_requests, 1)) * 100,
            "providers": {
                name: {
                    "enabled": p.enabled,
                    "current_rpm": p.current_rpm,
                    "rpm_limit": p.rpm_limit,
                    "available": p.can_make_request()
                }
                for name, p in self.providers.items()
            }
        }


# ========================================
# AI FUNCTIONS WITH LOAD BALANCING
# ========================================

# Singleton
load_balancer = AILoadBalancer()


async def _scan_with_provider(provider: str, image_base64: str) -> Dict[str, Any]:
    """Provider bilan rasm skanerlash"""
    
    if provider == "openai":
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": """Analyze this product image and return JSON:
{
  "name": "Product name in Russian",
  "category": "Category",
  "description": "Description",
  "brand": "Brand if visible",
  "estimatedPrice": 100000,
  "keywords": ["keyword1", "keyword2"],
  "confidence": 85
}"""
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_base64}"
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": 500
                }
            )
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Parse JSON
            import json
            import re
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                return json.loads(json_match.group())
            
            return {"name": "Unknown", "category": "general"}
    
    elif provider == "anthropic":
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 500,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": "image/jpeg",
                                        "data": image_base64
                                    }
                                },
                                {
                                    "type": "text",
                                    "text": """Analyze this product and return JSON:
{
  "name": "Product name",
  "category": "Category",
  "description": "Description",
  "brand": "Brand",
  "estimatedPrice": 100000,
  "keywords": ["keyword1"],
  "confidence": 85
}"""
                                }
                            ]
                        }
                    ]
                }
            )
            
            data = response.json()
            content = data["content"][0]["text"]
            
            import json
            import re
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                return json.loads(json_match.group())
            
            return {"name": "Unknown", "category": "general"}
    
    else:
        # Fallback to Emergent (existing logic)
        from ai_service import scan_product_image
        result = await scan_product_image(image_base64)
        return result.get("product", {})


async def balanced_scan_product(image_base64: str) -> Dict[str, Any]:
    """Load balanced product scanning"""
    return await load_balancer.process_request(
        "vision",
        _scan_with_provider,
        image_base64
    )


async def _generate_text_with_provider(
    provider: str,
    prompt: str,
    system: str = ""
) -> str:
    """Provider bilan matn generatsiya"""
    
    if provider == "openai":
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})
            
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": messages,
                    "max_tokens": 1000
                }
            )
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    elif provider == "anthropic":
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "claude-3-5-haiku-20241022",
                    "max_tokens": 1000,
                    "system": system or "You are a helpful assistant.",
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            data = response.json()
            return data["content"][0]["text"]
    
    elif provider == "gemini":
        import httpx
        if not GOOGLE_API_KEY:
            raise Exception("GOOGLE_API_KEY not set. Please configure it in environment variables.")
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": f"{system}\n\n{prompt}"}]}]
                }
            )
            
            if response.status_code == 400:
                data = response.json()
                error_msg = data.get("error", {}).get("message", "Unknown error")
                if "API key not valid" in error_msg or "invalid API key" in error_msg.lower():
                    raise Exception(f"Gemini API key is invalid. Please check GOOGLE_API_KEY in environment variables. Error: {error_msg}")
                raise Exception(f"Gemini API error: {error_msg}")
            
            if response.status_code != 200:
                raise Exception(f"Gemini API returned status {response.status_code}: {response.text}")
            
            data = response.json()
            if "candidates" not in data or not data.get("candidates"):
                raise Exception(f"Gemini API returned unexpected format: {data}")
            
            return data["candidates"][0]["content"]["parts"][0]["text"]
    
    else:
        # Emergent fallback
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="balanced",
            system_message=system or "You are a helpful assistant."
        ).with_model("openai", "gpt-4o-mini")
        
        return await chat.send_message(UserMessage(text=prompt))


async def balanced_generate_text(
    prompt: str,
    system: str = ""
) -> Dict[str, Any]:
    """Load balanced text generation"""
    return await load_balancer.process_request(
        "text",
        _generate_text_with_provider,
        prompt,
        system
    )


def get_ai_stats() -> Dict[str, Any]:
    """AI statistikalarini olish"""
    return load_balancer.get_stats()
