import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Upload, 
  Download, 
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  totalProducts: number;
  processedProducts: number;
  successCount: number;
  errorCount: number;
  results?: any[];
  batchId?: string;
}

export default function BulkProductProcessor() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<BulkProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: '',
    totalProducts: 0,
    processedProducts: 0,
    successCount: 0,
    errorCount: 0
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.xlsx') && !uploadedFile.name.endsWith('.xls')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel file (.xlsx or .xls)',
        variant: 'destructive'
      });
      return;
    }

    setFile(uploadedFile);
    toast({
      title: 'File uploaded',
      description: `${uploadedFile.name} ready to process`
    });
  };

  const downloadTemplate = () => {
    // Create sample Excel template
    const templateData = [
      ['Product Name', 'Description', 'Category', 'Cost Price', 'Quantity', 'Image URL'],
      ['Example Product', 'Product description here', 'Electronics', '100', '50', 'https://example.com/image.jpg'],
      ['', '', '', '', '', '']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const processBulk = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please upload an Excel file first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setProcessingStatus({
        status: 'uploading',
        progress: 5,
        message: 'Uploading file...',
        totalProducts: 0,
        processedProducts: 0,
        successCount: 0,
        errorCount: 0
      });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/premium/bulk/process', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      setProcessingStatus({
        status: 'processing',
        progress: 10,
        message: 'Processing products...',
        totalProducts: result.totalProducts,
        processedProducts: 0,
        successCount: 0,
        errorCount: 0,
        batchId: result.batchId
      });

      // Poll for progress
      const checkProgress = setInterval(async () => {
        const progressResponse = await fetch(`/api/premium/bulk/status/${result.batchId}`);
        const progressData = await progressResponse.json();

        const progress = (progressData.processedProducts / progressData.totalProducts) * 100;

        setProcessingStatus({
          status: 'processing',
          progress: Math.min(progress, 95),
          message: `Processing ${progressData.processedProducts}/${progressData.totalProducts} products...`,
          totalProducts: progressData.totalProducts,
          processedProducts: progressData.processedProducts,
          successCount: progressData.successCount,
          errorCount: progressData.errorCount
        });

        if (progressData.status === 'completed') {
          clearInterval(checkProgress);
          setProcessingStatus({
            status: 'completed',
            progress: 100,
            message: 'Processing complete!',
            totalProducts: progressData.totalProducts,
            processedProducts: progressData.processedProducts,
            successCount: progressData.successCount,
            errorCount: progressData.errorCount,
            results: progressData.results
          });
          toast({
            title: 'Bulk processing completed!',
            description: `Successfully processed ${progressData.successCount} products`
          });
        } else if (progressData.status === 'error') {
          clearInterval(checkProgress);
          throw new Error(progressData.error);
        }
      }, 2000);

    } catch (error: any) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: error.message || 'Processing failed',
        totalProducts: 0,
        processedProducts: 0,
        successCount: 0,
        errorCount: 0
      });
      toast({
        title: 'Processing failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const downloadResults = () => {
    if (!processingStatus.results) return;

    const csvContent = [
      ['Product Name', 'Status', 'Message', 'Product ID'],
      ...processingStatus.results.map(r => [
        r.productName,
        r.success ? 'Success' : 'Failed',
        r.message,
        r.productId || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_processing_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setProcessingStatus({
      status: 'idle',
      progress: 0,
      message: '',
      totalProducts: 0,
      processedProducts: 0,
      successCount: 0,
      errorCount: 0
    });
  };

  const calculateCost = () => {
    if (!processingStatus.totalProducts) return 0;
    const batches = Math.ceil(processingStatus.totalProducts / 100);
    return batches * 5;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Bulk Product Processor
          </h2>
          <p className="text-muted-foreground mt-2">
            Process hundreds of products at once with AI
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          $5.00 per 100 products
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Upload */}
        <div className="space-y-6">
          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Excel File</CardTitle>
              <CardDescription>
                Upload your product list in Excel format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Download */}
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">Need a template?</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Download our Excel template with the correct format
                    </div>
                    <Button
                      onClick={downloadTemplate}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="fileUpload"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <div className="text-sm mb-1">
                      <span className="text-primary font-semibold">Click to upload</span>
                      {' '}or drag and drop
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Excel files (.xlsx, .xls) up to 10MB
                    </p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process Button */}
          <Button
            onClick={processBulk}
            disabled={!file || processingStatus.status === 'processing' || processingStatus.status === 'uploading'}
            className="w-full"
            size="lg"
          >
            {processingStatus.status === 'processing' || processingStatus.status === 'uploading' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Process Products
              </>
            )}
          </Button>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-sm">AI Analysis</div>
                    <div className="text-xs text-muted-foreground">
                      Each product analyzed with GPT-4 Vision
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-sm">SEO Optimization</div>
                    <div className="text-xs text-muted-foreground">
                      Titles, descriptions, and keywords generated
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-sm">Multi-language</div>
                    <div className="text-xs text-muted-foreground">
                      Translated to Uzbek, Russian, English
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-sm">Marketplace Ready</div>
                    <div className="text-xs text-muted-foreground">
                      Cards created for all 4 marketplaces
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Results */}
        <div className="space-y-6">
          {/* Processing Status */}
          {processingStatus.status !== 'idle' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {processingStatus.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {processingStatus.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {(processingStatus.status === 'processing' || processingStatus.status === 'uploading') && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  {processingStatus.message}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {processingStatus.status !== 'error' && (
                  <>
                    <Progress value={processingStatus.progress} />
                    
                    {processingStatus.totalProducts > 0 && (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{processingStatus.totalProducts}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{processingStatus.successCount}</div>
                          <div className="text-xs text-muted-foreground">Success</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-destructive">{processingStatus.errorCount}</div>
                          <div className="text-xs text-muted-foreground">Errors</div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {processingStatus.status === 'completed' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Processing Complete!
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {processingStatus.successCount} products successfully processed
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={downloadResults} className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download Results
                      </Button>
                      <Button onClick={resetForm} variant="outline" className="flex-1">
                        Process More
                      </Button>
                    </div>
                  </div>
                )}

                {processingStatus.status === 'error' && (
                  <Button onClick={resetForm} variant="outline" className="w-full">
                    Try Again
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Calculator</CardTitle>
              <CardDescription>
                Transparent pricing based on volume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">100 products</span>
                  <span className="font-bold">$5.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">500 products</span>
                  <span className="font-bold">$25.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">1,000 products</span>
                  <div className="text-right">
                    <span className="font-bold">$40.00</span>
                    <Badge variant="secondary" className="ml-2">Save 20%</Badge>
                  </div>
                </div>
              </div>

              {processingStatus.totalProducts > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Your Cost:</span>
                    <span className="font-bold text-primary">
                      ${calculateCost().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    For {processingStatus.totalProducts} products
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Save 95% time vs manual entry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Professional SEO for all products</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Multi-language support included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Marketplace-ready cards</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
