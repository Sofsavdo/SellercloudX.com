import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  Upload, 
  Play, 
  Download, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Music,
  Type,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  style: string;
  thumbnail: string;
}

const videoTemplates: VideoTemplate[] = [
  {
    id: 'modern-product',
    name: 'Modern Product Showcase',
    description: 'Clean, professional product presentation',
    duration: 15,
    style: 'modern',
    thumbnail: '🎨'
  },
  {
    id: 'dynamic-promo',
    name: 'Dynamic Promo',
    description: 'High-energy promotional video',
    duration: 15,
    style: 'dynamic',
    thumbnail: '⚡'
  },
  {
    id: 'elegant-luxury',
    name: 'Elegant Luxury',
    description: 'Premium, sophisticated presentation',
    duration: 15,
    style: 'elegant',
    thumbnail: '💎'
  },
  {
    id: 'social-media',
    name: 'Social Media Ready',
    description: 'Optimized for Instagram, TikTok',
    duration: 15,
    style: 'social',
    thumbnail: '📱'
  }
];

interface VideoGenerationStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  videoUrl?: string;
  taskId?: string;
}

export default function VideoGenerationStudio() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern-product');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [generationStatus, setGenerationStatus] = useState<VideoGenerationStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: 'Too many images',
        description: 'Maximum 5 images allowed',
        variant: 'destructive'
      });
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generateVideo = async () => {
    if (!productName || !description || images.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please provide product name, description, and at least one image',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGenerationStatus({
        status: 'uploading',
        progress: 10,
        message: 'Uploading images...'
      });

      // Upload images
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });
      formData.append('productName', productName);
      formData.append('description', description);
      formData.append('template', selectedTemplate);

      setGenerationStatus({
        status: 'processing',
        progress: 30,
        message: 'AI is creating your video...'
      });

      const response = await fetch('/api/premium/video/generate', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Video generation failed');
      }

      const result = await response.json();

      setGenerationStatus({
        status: 'processing',
        progress: 60,
        message: 'Rendering video...',
        taskId: result.taskId
      });

      // Poll for completion
      const checkStatus = setInterval(async () => {
        const statusResponse = await fetch(`/api/premium/video/status/${result.taskId}`);
        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          clearInterval(checkStatus);
          setGenerationStatus({
            status: 'completed',
            progress: 100,
            message: 'Video ready!',
            videoUrl: statusData.videoUrl
          });
          toast({
            title: 'Video generated successfully!',
            description: 'Your product video is ready to download'
          });
        } else if (statusData.status === 'error') {
          clearInterval(checkStatus);
          throw new Error(statusData.error);
        } else {
          setGenerationStatus(prev => ({
            ...prev,
            progress: Math.min(prev.progress + 5, 95)
          }));
        }
      }, 2000);

    } catch (error: any) {
      setGenerationStatus({
        status: 'error',
        progress: 0,
        message: error.message || 'Video generation failed'
      });
      toast({
        title: 'Generation failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const downloadVideo = () => {
    if (generationStatus.videoUrl) {
      window.open(generationStatus.videoUrl, '_blank');
    }
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setImages([]);
    setGenerationStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            Video Generation Studio
          </h2>
          <p className="text-muted-foreground mt-2">
            Create professional product videos in minutes
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          $2.00 per video
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Template</CardTitle>
              <CardDescription>
                Select a video style that matches your brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {videoTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{template.thumbnail}</div>
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {template.duration}s
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Tell us about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Premium Wireless Headphones"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product's key features and benefits..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload 1-5 high-quality product images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-primary font-semibold">Click to upload</span>
                    {' '}or drag and drop
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB (max 5 images)
                  </p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateVideo}
            disabled={generationStatus.status === 'processing' || generationStatus.status === 'uploading'}
            className="w-full"
            size="lg"
          >
            {generationStatus.status === 'processing' || generationStatus.status === 'uploading' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Video ($2.00)
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Preview & Status */}
        <div className="space-y-6">
          {/* Generation Status */}
          {generationStatus.status !== 'idle' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {generationStatus.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {generationStatus.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {(generationStatus.status === 'processing' || generationStatus.status === 'uploading') && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  {generationStatus.message}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generationStatus.status !== 'error' && (
                  <Progress value={generationStatus.progress} />
                )}

                {generationStatus.status === 'completed' && generationStatus.videoUrl && (
                  <div className="space-y-4">
                    <video
                      src={generationStatus.videoUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button onClick={downloadVideo} className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button onClick={resetForm} variant="outline" className="flex-1">
                        Create Another
                      </Button>
                    </div>
                  </div>
                )}

                {generationStatus.status === 'error' && (
                  <Button onClick={resetForm} variant="outline" className="w-full">
                    Try Again
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Professional Quality</div>
                    <div className="text-sm text-muted-foreground">
                      HD 1080p export ready for all platforms
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Music className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Background Music</div>
                    <div className="text-sm text-muted-foreground">
                      Royalty-free music matched to your style
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Type className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Text Overlays</div>
                    <div className="text-sm text-muted-foreground">
                      Animated text with your product info
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ImageIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Smart Transitions</div>
                    <div className="text-sm text-muted-foreground">
                      AI-powered smooth transitions between images
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Single Video</span>
                  <span className="font-bold">$2.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">10 Videos Package</span>
                  <div className="text-right">
                    <span className="font-bold">$18.00</span>
                    <Badge variant="secondary" className="ml-2">Save 10%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">50 Videos Package</span>
                  <div className="text-right">
                    <span className="font-bold">$80.00</span>
                    <Badge variant="secondary" className="ml-2">Save 20%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
