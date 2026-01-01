import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  TrendingUp, 
  Package, 
  Search, 
  FileText,
  Sparkles,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  price: number;
  unit: string;
  costPerUnit: number;
  margin: number;
  features: string[];
  estimatedTime: string;
}

const premiumFeatures: PremiumFeature[] = [
  {
    id: 'video-generation',
    name: 'Video Generation',
    description: 'AI-powered product videos for social media and marketplaces',
    icon: Video,
    price: 2.00,
    unit: 'per 15-sec video',
    costPerUnit: 0.75,
    margin: 62.5,
    features: [
      'Professional 15-second videos',
      'Multiple templates',
      'Background music',
      'Text overlays',
      'HD quality export',
      'Social media optimized'
    ],
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'competitor-analysis',
    name: 'Advanced Competitor Analysis',
    description: 'Deep market intelligence and competitor insights',
    icon: TrendingUp,
    price: 0.20,
    unit: 'per analysis',
    costPerUnit: 0.05,
    margin: 75,
    features: [
      'Competitor pricing analysis',
      'Market positioning',
      'Sales velocity tracking',
      'Review sentiment analysis',
      'Pricing recommendations',
      'Market share insights'
    ],
    estimatedTime: '30 seconds'
  },
  {
    id: 'bulk-processing',
    name: 'Bulk Product Processing',
    description: 'Process hundreds of products at once',
    icon: Package,
    price: 5.00,
    unit: 'per 100 products',
    costPerUnit: 1.50,
    margin: 70,
    features: [
      'Batch upload via Excel',
      'Automated categorization',
      'Bulk SEO optimization',
      'Multi-language translation',
      'Marketplace distribution',
      'Progress tracking'
    ],
    estimatedTime: '5-10 minutes'
  },
  {
    id: 'premium-seo',
    name: 'Premium SEO Optimization',
    description: 'Advanced SEO with keyword research and optimization',
    icon: Search,
    price: 0.50,
    unit: 'per product',
    costPerUnit: 0.10,
    margin: 80,
    features: [
      'Advanced keyword research',
      'Competitor keyword analysis',
      'Meta tags optimization',
      'Search trend analysis',
      'Long-tail keywords',
      'SEO score tracking'
    ],
    estimatedTime: '1 minute'
  },
  {
    id: 'trend-reports',
    name: 'Market Trend Reports',
    description: 'Monthly comprehensive market analysis reports',
    icon: FileText,
    price: 20.00,
    unit: 'per month',
    costPerUnit: 5.00,
    margin: 75,
    features: [
      'Monthly trend analysis',
      'Category insights',
      'Seasonal predictions',
      'Opportunity alerts',
      'Custom recommendations',
      'PDF export'
    ],
    estimatedTime: 'Instant access'
  }
];

export default function PremiumAIFeatures() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Premium AI Features
          </h2>
          <p className="text-muted-foreground mt-2">
            Unlock advanced AI capabilities to supercharge your business
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Pay-as-you-go
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="usage">Usage History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {premiumFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-10 w-10 text-primary" />
                      <Badge variant="outline">
                        ${feature.price} {feature.unit}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{feature.name}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Processing time:</span>
                        <span className="font-medium">{feature.estimatedTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Margin:</span>
                        <Badge variant="secondary">{feature.margin}%</Badge>
                      </div>
                      <Button className="w-full" size="sm">
                        Try Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Details Modal */}
          {selectedFeature && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  {premiumFeatures.find(f => f.id === selectedFeature)?.name}
                </CardTitle>
                <CardDescription>
                  {premiumFeatures.find(f => f.id === selectedFeature)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Features included:</h4>
                    <ul className="space-y-2">
                      {premiumFeatures.find(f => f.id === selectedFeature)?.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">Start Using</Button>
                    <Button variant="outline" onClick={() => setSelectedFeature(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
              <CardDescription>
                Transparent pricing with high margins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {premiumFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6 text-primary" />
                          <div>
                            <h4 className="font-semibold">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {feature.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">${feature.price}</div>
                          <div className="text-xs text-muted-foreground">
                            Cost: ${feature.costPerUnit}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your profit:</span>
                          <span className="font-semibold text-green-600">
                            ${(feature.price - feature.costPerUnit).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Margin:</span>
                          <Badge variant="secondary">{feature.margin}%</Badge>
                        </div>
                        <Progress value={feature.margin} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Package Deals */}
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Package Deals (Save More!)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>10 Videos Package:</span>
                    <span className="font-semibold">$18 (10% off)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>50 Videos Package:</span>
                    <span className="font-semibold">$80 (20% off)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>100 Competitor Analyses:</span>
                    <span className="font-semibold">$15 (25% off)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1,000 Products Bulk:</span>
                    <span className="font-semibold">$40 (20% off)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage History Tab */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Track your premium feature usage and spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Total Spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$0.00</div>
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Features Used
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Total requests
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Avg. Processing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-muted-foreground">
                        Time per request
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Empty State */}
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No usage yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start using premium features to see your usage history here
                  </p>
                  <Button onClick={() => setActiveTab('overview')}>
                    Explore Features
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">Why Premium Features?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                While our core AI Manager is completely free, premium features give you 
                advanced capabilities to scale faster and compete better. Pay only for what you use.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">No subscription required</Badge>
                <Badge variant="secondary">Pay per use</Badge>
                <Badge variant="secondary">Cancel anytime</Badge>
                <Badge variant="secondary">High ROI</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
