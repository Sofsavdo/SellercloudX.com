import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@sellercloudx.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendInvoiceCreated(
    email: string,
    partnerName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .invoice-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Invoice Created</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p>A new invoice has been generated for your SellercloudX subscription.</p>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            </div>
            
            <p>Please log in to your dashboard to view and pay this invoice.</p>
            <a href="${process.env.APP_URL}/partner/billing" class="button">View Invoice</a>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `New Invoice ${invoiceNumber} - SellercloudX`,
      html,
      text: `Hello ${partnerName}, A new invoice ${invoiceNumber} for $${amount.toFixed(2)} has been created. Due date: ${new Date(dueDate).toLocaleDateString()}. Please log in to pay.`,
    });
  }

  async sendPaymentReceived(
    email: string,
    partnerName: string,
    invoiceNumber: string,
    amount: number,
    paymentMethod: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .payment-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .success { color: #10B981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Payment Received</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p class="success">Your payment has been successfully received and processed.</p>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Paid:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Thank you for your payment. Your subscription is now active.</p>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Payment Received - Invoice ${invoiceNumber}`,
      html,
      text: `Hello ${partnerName}, Your payment of $${amount.toFixed(2)} for invoice ${invoiceNumber} has been received. Thank you!`,
    });
  }

  async sendInvoiceOverdue(
    email: string,
    partnerName: string,
    invoiceNumber: string,
    amount: number,
    daysOverdue: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .invoice-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #EF4444; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .warning { color: #EF4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠ Invoice Overdue</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p class="warning">Your invoice is now ${daysOverdue} day(s) overdue.</p>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
            </div>
            
            <p>Please make payment as soon as possible to avoid service interruption.</p>
            ${daysOverdue >= 5 ? '<p class="warning">Note: Your subscription will be suspended if payment is not received within 5 days of the due date.</p>' : ''}
            
            <a href="${process.env.APP_URL}/partner/billing" class="button">Pay Now</a>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `⚠ Invoice ${invoiceNumber} is Overdue - Action Required`,
      html,
      text: `Hello ${partnerName}, Your invoice ${invoiceNumber} for $${amount.toFixed(2)} is ${daysOverdue} days overdue. Please pay immediately to avoid service interruption.`,
    });
  }

  async sendSubscriptionSuspended(
    email: string,
    partnerName: string,
    reason: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .alert { background: #FEE2E2; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #DC2626; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Suspended</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            
            <div class="alert">
              <h3>Your subscription has been suspended</h3>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <p>Your access to SellercloudX services has been temporarily suspended. To restore your subscription, please:</p>
            <ol>
              <li>Log in to your dashboard</li>
              <li>Navigate to the Billing section</li>
              <li>Pay all outstanding invoices</li>
            </ol>
            
            <p>Once payment is received, your subscription will be automatically reactivated.</p>
            
            <a href="${process.env.APP_URL}/partner/billing" class="button">View Billing</a>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>For assistance, please contact support.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Subscription Suspended - Action Required',
      html,
      text: `Hello ${partnerName}, Your subscription has been suspended. Reason: ${reason}. Please log in and pay outstanding invoices to restore access.`,
    });
  }

  async sendCommissionReport(
    email: string,
    partnerName: string,
    month: string,
    totalSales: number,
    commission: number,
    commissionRate: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .report { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .stat { display: inline-block; margin: 10px 20px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .stat-label { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Monthly Commission Report</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p>Here's your commission report for ${month}:</p>
            
            <div class="report">
              <div class="stat">
                <div class="stat-value">$${totalSales.toFixed(2)}</div>
                <div class="stat-label">Total Sales</div>
              </div>
              <div class="stat">
                <div class="stat-value">${commissionRate}%</div>
                <div class="stat-label">Commission Rate</div>
              </div>
              <div class="stat">
                <div class="stat-value">$${commission.toFixed(2)}</div>
                <div class="stat-label">Commission Earned</div>
              </div>
            </div>
            
            <p>Your commission will be processed according to your payment schedule.</p>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Commission Report - ${month}`,
      html,
      text: `Hello ${partnerName}, Your commission report for ${month}: Total Sales: $${totalSales.toFixed(2)}, Commission Rate: ${commissionRate}%, Commission Earned: $${commission.toFixed(2)}`,
    });
  }
}

export default new EmailService();
