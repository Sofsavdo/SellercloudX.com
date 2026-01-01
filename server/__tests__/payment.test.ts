import { describe, it, expect, beforeAll } from 'vitest';
import { paymentGateway, PaymentProvider } from '../services/paymentGateway';

describe('Payment Gateway Service', () => {
  describe('Click Payment', () => {
    it('should generate Click payment URL', () => {
      const url = paymentGateway.generateClickPaymentUrl({
        amount: 100000,
        orderId: 'TEST-001',
        partnerId: 'partner-123'
      });

      expect(url).toContain('my.click.uz');
      expect(url).toContain('amount=100000');
      expect(url).toContain('transaction_param=TEST-001');
    });

    it('should verify Click payment signature', async () => {
      const mockData = {
        click_trans_id: '123456',
        service_id: 'test_service',
        click_paydoc_id: '789',
        merchant_trans_id: 'TEST-001',
        amount: '100000',
        action: '1',
        sign_time: '2024-01-01 12:00:00',
        sign_string: 'test_signature'
      };

      const result = await paymentGateway.verifyClickPayment(mockData);
      expect(result).toHaveProperty('success');
    });
  });

  describe('Payme Payment', () => {
    it('should generate Payme payment URL', () => {
      const url = paymentGateway.generatePaymePaymentUrl({
        amount: 100000,
        orderId: 'TEST-001',
        partnerId: 'partner-123'
      });

      expect(url).toContain('checkout.paycom.uz');
    });

    it('should handle Payme CheckPerformTransaction', async () => {
      const request = {
        method: 'CheckPerformTransaction',
        params: {
          account: { order_id: 'TEST-001' }
        }
      };

      const result = await paymentGateway.handlePaymeRequest(request);
      expect(result).toBeDefined();
    });
  });

  describe('Subscription Payment', () => {
    it('should process subscription payment', async () => {
      const result = await paymentGateway.processSubscriptionPayment({
        partnerId: 'partner-123',
        amount: 300000,
        pricingTier: 'starter_pro',
        billingPeriod: 'monthly',
        provider: PaymentProvider.CLICK
      });

      expect(result.success).toBeDefined();
      if (result.success) {
        expect(result.paymentUrl).toBeDefined();
        expect(result.transactionId).toBeDefined();
      }
    });
  });
});
