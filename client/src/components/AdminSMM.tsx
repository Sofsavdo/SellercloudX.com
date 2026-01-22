// Admin SMM Component - Social Media Management
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Instagram, 
  Youtube, 
  Linkedin, 
  Twitter, 
  Send, 
  Calendar,
  BarChart3,
  Video,
  Image as ImageIcon,
  FileText,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Share2
} from 'lucide-react';

export function AdminSMM() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');

  // Get campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/smm/campaigns'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/smm/campaigns');
      return res.json();
    },
  });

  // Generate post mutation
  const generatePostMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/smm/generate-post', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Post yaratildi!',
        description: 'Post muvaffaqiyatli yaratildi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/smm/campaigns'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Generate video mutation
  const generateVideoMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/smm/generate-video', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Video yaratildi!',
        description: 'Video muvaffaqiyatli yaratildi',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGeneratePost = () => {
    if (!postContent.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Post matni bo\'sh bo\'lishi mumkin emas',
        variant: 'destructive',
      });
      return;
    }

    generatePostMutation.mutate({
      content: postContent,
      platform: selectedPlatform,
      postType,
      language: 'uz',
    });
  };

  const handleGenerateVideo = () => {
    if (!postContent.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Video uchun kontent talab qilinadi',
        variant: 'destructive',
      });
      return;
    }

    generateVideoMutation.mutate({
      productName: postContent.split(' ').slice(0, 5).join(' '),
      productDescription: postContent,
      duration: 15,
      aspectRatio: selectedPlatform === 'instagram' ? '9:16' : '16:9',
      style: 'lifestyle',
      language: 'uz',
    });
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-gradient-to-r from-red-500 to-red-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-gradient-to-r from-blue-600 to-blue-700' },
    { id: 'twitter', name: 'X.com (Twitter)', icon: Twitter, color: 'bg-gradient-to-r from-gray-800 to-gray-900' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'bg-gradient-to-r from-blue-400 to-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: Share2, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Share2 className="h-8 w-8 text-pink-600" />
            Social Media Management
          </h2>
          <p className="text-muted-foreground mt-2">
            Postlar yaratish, video generatsiyasi va ijtimoiy tarmoqlarni boshqarish
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Post Yaratish</TabsTrigger>
          <TabsTrigger value="campaigns">Kampaniyalar</TabsTrigger>
          <TabsTrigger value="analytics">Analitika</TabsTrigger>
        </TabsList>

        {/* Create Post Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Post Creation Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Yangi Post Yaratish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Platform Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Platforma</label>
                    <div className="grid grid-cols-3 gap-3">
                      {platforms.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <button
                            key={platform.id}
                            onClick={() => setSelectedPlatform(platform.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedPlatform === platform.id
                                ? `${platform.color} text-white border-transparent`
                                : 'bg-background border-border hover:border-primary'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{platform.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Post Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Post Turi</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPostType('text')}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          postType === 'text'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        <FileText className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm">Matn</div>
                      </button>
                      <button
                        onClick={() => setPostType('image')}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          postType === 'image'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        <ImageIcon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm">Rasm</div>
                      </button>
                      <button
                        onClick={() => setPostType('video')}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          postType === 'video'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        <Video className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm">Video</div>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Post Matni</label>
                    <Textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Post matnini kiriting..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleGeneratePost}
                      disabled={generatePostMutation.isPending}
                      className="flex-1"
                    >
                      {generatePostMutation.isPending ? 'Yaratilmoqda...' : 'Post Yaratish'}
                    </Button>
                    {postType === 'video' && (
                      <Button
                        onClick={handleGenerateVideo}
                        disabled={generateVideoMutation.isPending}
                        variant="outline"
                        className="flex-1"
                      >
                        {generateVideoMutation.isPending ? 'Yaratilmoqda...' : 'Video Yaratish'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platforma Ma'lumotlari</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-1">Tanlangan Platforma</div>
                      <Badge variant="secondary">
                        {platforms.find(p => p.id === selectedPlatform)?.name}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Post Turi</div>
                      <Badge variant="outline">
                        {postType === 'text' ? 'Matn' : postType === 'image' ? 'Rasm' : 'Video'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Matn Uzunligi</div>
                      <div className="text-2xl font-bold">{postContent.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kampaniyalar</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="text-center py-8">Yuklanmoqda...</div>
              ) : campaigns?.campaigns?.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.campaigns.map((campaign: any) => (
                    <Card key={campaign.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <p className="text-sm text-muted-foreground">{campaign.description}</p>
                            <div className="flex gap-2 mt-2">
                              {campaign.platforms.map((p: string) => (
                                <Badge key={p} variant="outline">{p}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Hozircha kampaniyalar yo'q
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Jami Postlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Jami Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Jami Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

