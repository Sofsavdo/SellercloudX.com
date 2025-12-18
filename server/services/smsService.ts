import axios from 'axios';

// SMS Service for Uzbekistan providers
class SMSService {
  private eskizConfig = {
    email: process.env.ESKIZ_EMAIL || '',
    password: process.env.ESKIZ_PASSWORD || '',
    apiUrl: 'https://notify.eskiz.uz/api',
    token: ''
  };

  private playmobileConfig = {
    login: process.env.PLAYMOBILE_LOGIN || '',
    password: process.env.PLAYMOBILE_PASSWORD || '',
    apiUrl: 'https://send.smsxabar.uz/broker-api'
  };

  async sendSMS(phone: string, message: string, provider: 'eskiz' | 'playmobile' = 'eskiz'): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (provider === 'eskiz') {
      return this.sendEskizSMS(phone, message);
    } else {
      return this.sendPlaymobileSMS(phone, message);
    }
  }

  private async sendEskizSMS(phone: string, message: string): Promise<any> {
    try {
      // Get token if not exists
      if (!this.eskizConfig.token) {
        await this.getEskizToken();
      }

      const response = await axios.post(
        `${this.eskizConfig.apiUrl}/message/sms/send`,
        {
          mobile_phone: this.formatPhone(phone),
          message,
          from: 'SellerCloudX'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.eskizConfig.token}`
          }
        }
      );

      return {
        success: true,
        messageId: response.data.id
      };
    } catch (error: any) {
      console.error('Eskiz SMS error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  private async getEskizToken(): Promise<void> {
    const response = await axios.post(
      `${this.eskizConfig.apiUrl}/auth/login`,
      {
        email: this.eskizConfig.email,
        password: this.eskizConfig.password
      }
    );

    this.eskizConfig.token = response.data.data.token;
  }

  private async sendPlaymobileSMS(phone: string, message: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.playmobileConfig.apiUrl}/send`,
        {
          messages: [{
            recipient: this.formatPhone(phone),
            'message-id': `SCX-${Date.now()}`,
            sms: {
              originator: 'SellerCloudX',
              content: { text: message }
            }
          }]
        },
        {
          auth: {
            username: this.playmobileConfig.login,
            password: this.playmobileConfig.password
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0]['message-id']
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendOTP(phone: string, code: string): Promise<any> {
    const message = `SellerCloudX tasdiqlash kodi: ${code}. Hech kimga bermang!`;
    return this.sendSMS(phone, message);
  }

  async sendOrderConfirmation(phone: string, orderNumber: string): Promise<any> {
    const message = `Buyurtmangiz ${orderNumber} qabul qilindi. Tez orada yetkazib beramiz!`;
    return this.sendSMS(phone, message);
  }

  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('998')) {
      cleaned = '998' + cleaned;
    }
    return cleaned;
  }
}

export const smsService = new SMSService();
