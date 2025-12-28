// Advanced Reporting Routes
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import reportingService from '../services/reportingService';

const router = express.Router();

// Generate report
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  const config = req.body;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const reportBuffer = await reportingService.generateReport(partner.id, config);
  
  // Set appropriate headers
  const contentType = config.format === 'excel' 
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : config.format === 'pdf'
    ? 'application/pdf'
    : 'text/csv';
  
  const extension = config.format === 'excel' ? 'xlsx' : config.format === 'pdf' ? 'pdf' : 'csv';
  const filename = `report_${Date.now()}.${extension}`;
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(reportBuffer);
}));

// Schedule report
router.post('/schedule', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  const { config, schedule } = req.body;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const scheduleId = await reportingService.scheduleReport(partner.id, config, schedule);
  res.json({ scheduleId, message: 'Report scheduled successfully' });
}));

export default router;

