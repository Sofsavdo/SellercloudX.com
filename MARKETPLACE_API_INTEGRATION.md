# Marketplace API Integration - SellerCloudX

## Supported Marketplaces

### 1. Uzum Market (Uzbekistan)
**API Documentation:** https://api-seller.uzum.uz/api/seller-openapi/swagger/swagger-ui/

**Authentication:**
- OAuth 2.0 / API Key based
- Requires seller account registration

**Key Endpoints:**
- `/api/seller/products` - Product management
- `/api/seller/orders` - Order management
- `/api/seller/stock` - Inventory management
- `/api/seller/analytics` - Sales analytics

**Integration Requirements:**
- Seller ID
- API Key
- API Secret

**Features Available:**
- ✅ Product listing sync
- ✅ Stock management
- ✅ Order processing
- ✅ Price updates
- ✅ Analytics data

### 2. Yandex Market (Russia/CIS)
**API Documentation:** https://yandex.ru/dev/market/partner-api/doc/ru/

**Authentication:**
- OAuth 2.0
- Campaign ID required
- Client ID and Secret

**Key Endpoints:**
- `/campaigns/{campaignId}/offer-mapping-entries` - Product mapping
- `/campaigns/{campaignId}/orders` - Order management
- `/campaigns/{campaignId}/stats/skus` - Product statistics
- `/campaigns/{campaignId}/offer-prices/updates` - Price updates

**Integration Requirements:**
- Campaign ID (shop ID)
- OAuth Client ID
- OAuth Client Secret
- Access Token

**Features Available:**
- ✅ Product catalog sync
- ✅ Order management
- ✅ Stock updates
- ✅ Price management
- ✅ Analytics and reports

### 3. Wildberries (Russia/CIS)
**API Documentation:** https://openapi.wildberries.ru/

**Authentication:**
- API Key (x-api-key header)

**Key Endpoints:**
- `/api/v3/supplies` - Supply management
- `/api/v3/orders` - Order management
- `/content/v1/cards/list` - Product cards
- `/public/api/v1/info` - Warehouse info

**Integration Requirements:**
- API Key (Standard or Statistics)
- Supplier ID

**Features Available:**
- ✅ Product card management
- ✅ Supply creation
- ✅ Order tracking
- ✅ Stock management
- ✅ Sales analytics

### 4. Ozon (Russia/CIS)
**API Documentation:** https://docs.ozon.ru/api/seller/

**Authentication:**
- Client-Id and Api-Key headers

**Key Endpoints:**
- `/v2/product/list` - Product list
- `/v3/posting/fbs/list` - Orders (FBS)
- `/v1/product/import` - Product import
- `/v1/product/info/stocks` - Stock info

**Integration Requirements:**
- Client ID
- API Key

**Features Available:**
- ✅ Product management
- ✅ Order processing (FBS/FBO)
- ✅ Stock updates
- ✅ Price management
- ✅ Analytics

## Database Schema

### marketplace_integrations
```sql
CREATE TABLE marketplace_integrations (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  marketplace TEXT NOT NULL, -- 'uzum', 'yandex', 'wildberries', 'ozon'
  api_key TEXT,
  api_secret TEXT,
  seller_id TEXT, -- Marketplace-specific seller/campaign ID
  active INTEGER DEFAULT 0,
  last_sync_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### marketplace_api_configs (Admin-managed)
```sql
CREATE TABLE marketplace_api_configs (
  id TEXT PRIMARY KEY,
  marketplace TEXT NOT NULL UNIQUE,
  api_endpoint TEXT NOT NULL,
  auth_type TEXT NOT NULL, -- 'api_key', 'oauth2', 'bearer'
  rate_limit INTEGER,
  documentation TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

## Partner Integration Flow

### Step 1: Connect Marketplace
Partner goes to "Marketplace Integratsiyalari" section in cabinet:

```
1. Select marketplace (Uzum, Yandex, Wildberries, Ozon)
2. Enter credentials:
   - API Key
   - API Secret (if required)
   - Seller/Campaign ID
3. Test connection
4. Save and activate
```

### Step 2: Sync Products
```
1. Fetch products from marketplace
2. Map to internal product catalog
3. Enable auto-sync (optional)
```

### Step 3: Auto-Sync Features
```
- Stock updates (real-time or scheduled)
- Price updates
- Order notifications
- Product status sync
```

## API Integration Implementation

### Uzum Integration
```typescript
class UzumIntegration {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api-seller.uzum.uz';

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/seller/profile`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/api/seller/products`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/api/seller/stock`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity })
    });
    return response.ok;
  }
}
```

### Yandex Market Integration
```typescript
class YandexMarketIntegration {
  private campaignId: string;
  private accessToken: string;
  private baseUrl = 'https://api.partner.market.yandex.ru';

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/campaigns/${this.campaignId}`,
        {
          headers: {
            'Authorization': `OAuth ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch(
      `${this.baseUrl}/campaigns/${this.campaignId}/offer-mapping-entries`,
      {
        headers: {
          'Authorization': `OAuth ${this.accessToken}`
        }
      }
    );
    const data = await response.json();
    return data.result.offerMappingEntries;
  }

  async updatePrice(offerId: string, price: number): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/campaigns/${this.campaignId}/offer-prices/updates`,
      {
        method: 'POST',
        headers: {
          'Authorization': `OAuth ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          offers: [{ id: offerId, price: { value: price, currencyId: 'RUB' } }]
        })
      }
    );
    return response.ok;
  }
}
```

## UI Components Needed

### 1. MarketplaceConnectionCard
Shows connected marketplaces with status indicators

### 2. MarketplaceSetupModal
Form to enter API credentials and test connection

### 3. ProductSyncDashboard
Shows sync status, last sync time, sync errors

### 4. MarketplaceOrdersList
Displays orders from all connected marketplaces

## Implementation Priority

### Phase 1 (MVP):
1. ✅ Database schema (already exists)
2. ⚠️ Basic API integration classes
3. ⚠️ Connection testing
4. ⚠️ UI for adding marketplace credentials

### Phase 2:
1. Product sync (one-way: marketplace → platform)
2. Stock updates (platform → marketplace)
3. Order fetching

### Phase 3:
1. Two-way product sync
2. Auto-sync scheduling
3. Webhook integration
4. Real-time updates

## Security Considerations

1. **API Keys Storage:**
   - Encrypt API keys in database
   - Never expose in frontend
   - Use environment variables for sensitive data

2. **Rate Limiting:**
   - Respect marketplace API rate limits
   - Implement exponential backoff
   - Queue requests if needed

3. **Error Handling:**
   - Log all API errors
   - Notify partner of sync failures
   - Retry failed requests

## Testing

1. **Connection Test:**
   - Verify credentials
   - Check API endpoint availability
   - Validate response format

2. **Product Sync Test:**
   - Fetch sample products
   - Verify data mapping
   - Check for duplicates

3. **Stock Update Test:**
   - Update test product stock
   - Verify marketplace reflects change
   - Check response time

## Next Steps

1. Implement real API integration classes (replace stubs)
2. Create UI components for marketplace connection
3. Add to partner dashboard
4. Test with real marketplace accounts
5. Document setup process for partners
