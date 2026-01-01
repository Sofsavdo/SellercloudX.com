# 🧪 Premium AI Features - Testing Guide

## Version 1.0.0
**Date:** December 18, 2024  
**Status:** Ready for Testing

---

## 📋 Overview

This guide provides comprehensive testing procedures for all Premium AI Features including:
- Video Generation Studio
- Bulk Product Processor
- Premium Payment Integration
- Usage Tracking & Analytics

---

## 🎯 Testing Checklist

### 1. Premium AI Features Dashboard

#### Component: `PremiumAIFeatures.tsx`

**Test Cases:**

- [ ] **TC-001: Dashboard Loading**
  - Navigate to Premium AI Features page
  - Verify all 5 feature cards display correctly
  - Check pricing badges show correct amounts
  - Confirm icons render properly

- [ ] **TC-002: Tab Navigation**
  - Click "Overview" tab - verify feature cards display
  - Click "Pricing" tab - verify pricing breakdown shows
  - Click "Usage History" tab - verify empty state or usage data
  - Confirm smooth transitions between tabs

- [ ] **TC-003: Feature Selection**
  - Click on each feature card
  - Verify feature details modal opens
  - Check all features list displays
  - Confirm "Start Using" button works

- [ ] **TC-004: Pricing Display**
  - Verify each feature shows correct price
  - Check margin percentages display (62.5% - 80%)
  - Confirm package deals show discounts
  - Validate cost calculations

**Expected Results:**
- All features display with correct information
- Navigation works smoothly
- Pricing is accurate and clear
- UI is responsive on all screen sizes

---

### 2. Video Generation Studio

#### Component: `VideoGenerationStudio.tsx`

**Test Cases:**

- [ ] **TC-101: Template Selection**
  - View all 4 video templates
  - Select each template
  - Verify active state highlights correctly
  - Check template descriptions display

- [ ] **TC-102: Product Information Input**
  - Enter product name (max 100 chars)
  - Enter description (max 500 chars)
  - Verify character counter updates
  - Test validation for empty fields

- [ ] **TC-103: Image Upload**
  - Upload single image (PNG/JPG)
  - Upload multiple images (up to 5)
  - Test file size limit (10MB)
  - Verify image preview displays
  - Test remove image functionality

- [ ] **TC-104: Video Generation Process**
  - Fill all required fields
  - Click "Generate Video" button
  - Verify upload progress shows
  - Check processing status updates
  - Confirm progress bar animates
  - Wait for completion (2-3 minutes)

- [ ] **TC-105: Video Result**
  - Verify video player displays
  - Test video playback
  - Click "Download" button
  - Verify video file downloads
  - Test "Create Another" button

- [ ] **TC-106: Error Handling**
  - Try generating without images
  - Test with invalid file types
  - Simulate network error
  - Verify error messages display

**API Endpoints to Test:**
```
POST /api/premium/video/generate
GET  /api/premium/video/status/:taskId
```

**Expected Results:**
- Smooth upload and processing flow
- Clear progress indicators
- Video generates successfully
- Download works correctly
- Errors handled gracefully

---

### 3. Bulk Product Processor

#### Component: `BulkProductProcessor.tsx`

**Test Cases:**

- [ ] **TC-201: Template Download**
  - Click "Download Template" button
  - Verify CSV file downloads
  - Open file and check format
  - Confirm headers are correct

- [ ] **TC-202: File Upload**
  - Upload valid Excel file (.xlsx)
  - Upload valid Excel file (.xls)
  - Test invalid file type (should reject)
  - Verify file info displays
  - Test remove file functionality

- [ ] **TC-203: Bulk Processing**
  - Upload file with 10 products
  - Click "Process Products" button
  - Verify upload progress shows
  - Check processing status updates
  - Monitor product count progress
  - Wait for completion

- [ ] **TC-204: Processing Results**
  - Verify success/error counts display
  - Check total products processed
  - Click "Download Results" button
  - Verify results CSV downloads
  - Test "Process More" button

- [ ] **TC-205: Cost Calculator**
  - Upload file with 100 products
  - Verify cost shows $5.00
  - Upload file with 500 products
  - Verify cost shows $25.00
  - Check discount badges display

- [ ] **TC-206: Large File Handling**
  - Upload file with 1000+ products
  - Verify processing handles large batches
  - Check memory usage stays reasonable
  - Confirm no browser freezing

**API Endpoints to Test:**
```
POST /api/premium/bulk/process
GET  /api/premium/bulk/status/:batchId
```

**Expected Results:**
- Template downloads correctly
- File upload works smoothly
- Processing completes successfully
- Results are accurate
- Cost calculation is correct

---

### 4. Premium Payment Integration

#### Component: `PremiumPaymentModal.tsx`

**Test Cases:**

- [ ] **TC-301: Modal Display**
  - Open payment modal
  - Verify feature info displays
  - Check amount shows correctly
  - Confirm payment providers list

- [ ] **TC-302: Provider Selection**
  - Select Click payment
  - Select Payme payment
  - Select Uzcard payment
  - Verify active state highlights

- [ ] **TC-303: Payment Summary**
  - Check subtotal displays
  - Verify processing fee (if any)
  - Confirm total amount correct
  - Test currency formatting

- [ ] **TC-304: Payment Process**
  - Select payment provider
  - Click "Pay" button
  - Verify payment URL generates
  - Check new window opens
  - Confirm status polling starts

- [ ] **TC-305: Payment Success**
  - Complete payment in provider window
  - Verify success message displays
  - Check feature activates
  - Confirm modal closes

- [ ] **TC-306: Payment Failure**
  - Simulate payment failure
  - Verify error message displays
  - Check "Try Again" button works
  - Confirm can retry payment

**API Endpoints to Test:**
```
POST /api/premium/payment/create
GET  /api/premium/payment/status/:transactionId
```

**Payment Providers to Test:**
- Click (Uzbekistan)
- Payme (Uzbekistan)
- Uzcard (Uzbekistan)

**Expected Results:**
- Payment flow is smooth
- Provider integration works
- Success/failure handled correctly
- User feedback is clear

---

### 5. Usage Tracking & Analytics

**Test Cases:**

- [ ] **TC-401: Usage Statistics**
  - Navigate to Usage History tab
  - Verify total spent displays
  - Check features used count
  - Confirm breakdown by feature

- [ ] **TC-402: Usage History**
  - View list of past transactions
  - Check date/time stamps
  - Verify amounts are correct
  - Test sorting/filtering

- [ ] **TC-403: Empty State**
  - Test with new user (no usage)
  - Verify empty state displays
  - Check "Explore Features" button
  - Confirm helpful message shows

**API Endpoints to Test:**
```
GET /api/premium/usage/stats
GET /api/premium/usage/history
```

**Expected Results:**
- Statistics are accurate
- History displays correctly
- Empty state is helpful
- Data updates in real-time

---

## 🔧 Backend Testing

### API Endpoints

#### 1. Video Generation

```bash
# Test video generation
curl -X POST http://localhost:5000/api/premium/video/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "productName=Test Product" \
  -F "description=Test description" \
  -F "template=modern-product" \
  -F "image0=@/path/to/image.jpg"

# Check status
curl http://localhost:5000/api/premium/video/status/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. Bulk Processing

```bash
# Upload Excel file
curl -X POST http://localhost:5000/api/premium/bulk/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/products.xlsx"

# Check progress
curl http://localhost:5000/api/premium/bulk/status/BATCH_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Payment

```bash
# Create payment
curl -X POST http://localhost:5000/api/premium/payment/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "featureId": "video-generation",
    "amount": 2.00,
    "provider": "click",
    "description": "Video Generation"
  }'

# Check payment status
curl http://localhost:5000/api/premium/payment/status/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Usage Stats

```bash
# Get usage statistics
curl http://localhost:5000/api/premium/usage/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎭 User Scenarios

### Scenario 1: First-Time User

1. User logs in to partner dashboard
2. Sees "Premium AI Features" in navigation
3. Clicks to explore premium features
4. Views all 5 available features
5. Reads pricing and benefits
6. Decides to try Video Generation
7. Uploads product images
8. Generates first video
9. Downloads and uses video
10. Sees usage statistics update

**Expected Outcome:** Smooth onboarding, successful video generation, clear value proposition

### Scenario 2: Bulk Processing Power User

1. User has 500 products to upload
2. Downloads Excel template
3. Fills template with product data
4. Uploads completed file
5. Reviews cost ($25 for 500 products)
6. Confirms and starts processing
7. Monitors progress in real-time
8. Downloads results when complete
9. Reviews success/error report
10. Imports successful products

**Expected Outcome:** Efficient bulk processing, clear progress tracking, actionable results

### Scenario 3: Payment Flow

1. User wants to generate video
2. Clicks "Generate Video" button
3. Payment modal opens
4. Reviews pricing ($2.00)
5. Selects Click payment
6. Clicks "Pay" button
7. Redirected to Click payment page
8. Completes payment
9. Returns to platform
10. Video generation starts automatically

**Expected Outcome:** Seamless payment experience, automatic feature activation

---

## 🐛 Known Issues & Limitations

### Current Limitations:

1. **Video Generation**
   - Max 5 images per video
   - 15-second duration only
   - Processing time: 2-3 minutes

2. **Bulk Processing**
   - Max 10MB file size
   - Excel format only (.xlsx, .xls)
   - Processing time varies by size

3. **Payment**
   - Uzbekistan payment providers only
   - No international cards yet
   - Manual verification for large amounts

### Planned Improvements:

- [ ] Add video duration options (15s, 30s, 60s)
- [ ] Support CSV format for bulk upload
- [ ] Add Stripe for international payments
- [ ] Implement automatic refunds
- [ ] Add usage alerts and limits

---

## 📊 Performance Benchmarks

### Expected Performance:

| Feature | Processing Time | Success Rate | Cost |
|---------|----------------|--------------|------|
| Video Generation | 2-3 minutes | 95%+ | $2.00 |
| Bulk Processing (100) | 5-10 minutes | 98%+ | $5.00 |
| Payment Processing | 10-30 seconds | 99%+ | Free |
| Usage Stats | < 1 second | 100% | Free |

### Load Testing:

- [ ] 10 concurrent video generations
- [ ] 5 concurrent bulk uploads (100 products each)
- [ ] 50 concurrent payment requests
- [ ] 100 concurrent usage stat requests

---

## ✅ Sign-Off Checklist

Before marking as production-ready:

- [ ] All test cases passed
- [ ] No critical bugs found
- [ ] Performance meets benchmarks
- [ ] Payment integration verified
- [ ] Error handling tested
- [ ] UI/UX reviewed and approved
- [ ] Documentation complete
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] User acceptance testing done

---

## 📝 Test Results Template

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Environment:** [Development/Staging/Production]
**Browser:** [Chrome/Firefox/Safari]

### Results:
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

### Critical Issues:
1. [Issue description]
2. [Issue description]

### Notes:
[Additional observations]

### Recommendation:
[ ] Ready for Production
[ ] Needs Fixes
[ ] Needs Retesting
```

---

## 🚀 Deployment Checklist

Before deploying to production:

1. **Environment Variables**
   ```bash
   CLICK_MERCHANT_ID=xxx
   CLICK_SECRET_KEY=xxx
   PAYME_MERCHANT_ID=xxx
   PAYME_SECRET_KEY=xxx
   OPENAI_API_KEY=xxx
   RUNWAY_API_KEY=xxx
   ```

2. **Database Migrations**
   - [ ] Premium features table
   - [ ] Payment transactions table
   - [ ] Usage tracking table

3. **API Keys**
   - [ ] OpenAI API key configured
   - [ ] Runway ML API key configured
   - [ ] Payment gateway credentials

4. **Monitoring**
   - [ ] Error tracking enabled
   - [ ] Performance monitoring
   - [ ] Payment alerts configured
   - [ ] Usage tracking active

---

## 📞 Support & Troubleshooting

### Common Issues:

**Issue:** Video generation fails
**Solution:** Check OpenAI API key, verify image formats, check file sizes

**Issue:** Bulk processing stuck
**Solution:** Check file format, verify Excel structure, check server resources

**Issue:** Payment not completing
**Solution:** Verify payment gateway credentials, check callback URLs, review logs

**Issue:** Usage stats not updating
**Solution:** Check database connection, verify tracking code, clear cache

---

**Testing Status:** ✅ Ready for Testing  
**Last Updated:** December 18, 2024  
**Next Review:** After initial testing phase
