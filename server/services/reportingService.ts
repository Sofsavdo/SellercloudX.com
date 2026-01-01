// Advanced Reporting Service
// Custom reports, Export to Excel/PDF, Scheduled reports

import ExcelJS from 'exceljs';
import { db } from '../db';
import { sql } from 'drizzle-orm';

interface ReportConfig {
  type: 'sales' | 'inventory' | 'analytics' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  format: 'excel' | 'pdf' | 'csv';
  fields: string[];
  filters?: Record<string, any>;
}

// Generate custom report
export async function generateReport(
  partnerId: string,
  config: ReportConfig
): Promise<Buffer> {
  console.log(`📊 Generating ${config.type} report for partner ${partnerId}`);
  
  try {
    let data: any[] = [];
    
    switch (config.type) {
      case 'sales':
        data = await generateSalesReport(partnerId, config);
        break;
      case 'inventory':
        data = await generateInventoryReport(partnerId, config);
        break;
      case 'analytics':
        data = await generateAnalyticsReport(partnerId, config);
        break;
      default:
        data = [];
    }
    
    // Export based on format
    if (config.format === 'excel') {
      return await exportToExcel(data, config);
    } else if (config.format === 'pdf') {
      return await exportToPDF(data, config);
    } else {
      return await exportToCSV(data, config);
    }
  } catch (error: any) {
    console.error('Report generation error:', error);
    throw error;
  }
}

// Export to Excel
async function exportToExcel(data: any[], config: ReportConfig): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');
  
  // Add headers
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// Export to PDF (using jsPDF)
async function exportToPDF(data: any[], config: ReportConfig): Promise<Buffer> {
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Report', 14, 15);
  
  // Add table
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => Object.values(row));
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25
    });
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}

// Export to CSV
async function exportToCSV(data: any[], config: ReportConfig): Promise<Buffer> {
  if (data.length === 0) {
    return Buffer.from('');
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => Object.values(row).join(','))
  ];
  
  return Buffer.from(csvRows.join('\n'), 'utf-8');
}

// Generate sales report
async function generateSalesReport(partnerId: string, config: ReportConfig) {
  const startDate = config.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = config.endDate || new Date();
  
  return await db.all(
    `SELECT 
       date,
       revenue,
       orders,
       profit,
       marketplace,
       category
     FROM analytics
     WHERE partner_id = ? 
     AND date >= ? 
     AND date <= ?
     ORDER BY date DESC`,
    [partnerId, startDate.toISOString(), endDate.toISOString()]
  );
}

// Generate inventory report
async function generateInventoryReport(partnerId: string, config: ReportConfig) {
  return await db.all(
    `SELECT 
       name,
       sku,
       stock_quantity,
       price,
       cost_price,
       category
     FROM products
     WHERE partner_id = ?
     ORDER BY name`,
    [partnerId]
  );
}

// Generate analytics report
async function generateAnalyticsReport(partnerId: string, config: ReportConfig) {
  return await db.all(
    `SELECT 
       date,
       revenue,
       orders,
       profit,
       commission_paid,
       marketplace,
       category
     FROM analytics
     WHERE partner_id = ?
     ORDER BY date DESC
     LIMIT 1000`,
    [partnerId]
  );
}

// Schedule report
export async function scheduleReport(
  partnerId: string,
  config: ReportConfig,
  schedule: 'daily' | 'weekly' | 'monthly'
): Promise<string> {
  const scheduleId = `schedule_${Date.now()}`;
  
  await db.run(
    `INSERT INTO report_schedules 
     (id, partner_id, report_config, schedule, status, created_at)
     VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
    [scheduleId, partnerId, JSON.stringify(config), schedule]
  );
  
  return scheduleId;
}

export default {
  generateReport,
  scheduleReport
};

