// Admin Blog Management - Full CRUD for blog posts
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, Edit, Trash2, Eye, Image, Video, FileText, Search,
  Calendar, CheckCircle, Clock, Send, X, Loader2, ExternalLink
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  videoUrl: string;
  category: string;
  tags: string;
  status: string;
  authorId: string;
  authorName: string;
  viewCount: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  publishedAt: string;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'news', label: 'Yangiliklar' },
  { value: 'updates', label: 'Yangilanishlar' },
  { value: 'tutorials', label: "Qo'llanmalar" },
  { value: 'tips', label: 'Maslahatlar' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-500',
  published: 'bg-green-500',
  archived: 'bg-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Qoralama',
  published: 'Nashr qilingan',
  archived: 'Arxivlangan',
};

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export function AdminBlogManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    videoUrl: '',
    category: 'news',
    tags: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/admin/blog/posts', filterStatus, filterCategory],
    queryFn: async () => {
      let url = '/api/admin/blog/posts?';
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterCategory) url += `category=${filterCategory}&`;
      const response = await apiRequest('GET', url);
      const result = await response.json();
      // API returns {success, data, total} - extract data array
      return result.data || result || [];
    },
  });

  // Create post
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/admin/blog/posts', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Muvaffaqiyatli!', description: 'Maqola yaratildi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  // Update post
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await apiRequest('PUT', `/api/admin/blog/posts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Muvaffaqiyatli!', description: 'Maqola yangilandi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      setEditingPost(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  // Delete post
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/blog/posts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "O'chirildi", description: "Maqola o'chirildi" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  // Publish post
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/admin/blog/posts/${id}/publish`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Nashr qilindi!', description: 'Maqola nashr qilindi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      videoUrl: '',
      category: 'news',
      tags: '',
      status: 'draft',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    });
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featuredImage: post.featuredImage || '',
      videoUrl: post.videoUrl || '',
      category: post.category,
      tags: post.tags || '',
      status: post.status,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      metaKeywords: post.metaKeywords || '',
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast({ title: 'Xatolik', description: 'Sarlavha va matn kiritilishi shart', variant: 'destructive' });
      return;
    }

    const data = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
    };

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredPosts = posts.filter((post: BlogPost) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const PostForm = () => (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Kontent</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sarlavha *</Label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    title: e.target.value,
                    slug: generateSlug(e.target.value)
                  });
                }}
                placeholder="Maqola sarlavhasi"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="maqola-sarlavhasi"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Qisqa tavsif</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Maqolaning qisqa tavsifi..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Matn *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Maqola matni (HTML qo'llab-quvvatlanadi)..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategoriya</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Holat</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Qoralama</SelectItem>
                  <SelectItem value="published">Nashr qilish</SelectItem>
                  <SelectItem value="archived">Arxivlash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Teglar (vergul bilan ajrating)</Label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e-commerce, marketplace, tips"
            />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Asosiy rasm URL</Label>
            <Input
              value={formData.featuredImage}
              onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            {formData.featuredImage && (
              <div className="mt-2 rounded-lg overflow-hidden border">
                <img src={formData.featuredImage} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Video URL (YouTube)</Label>
            <Input
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>SEO Sarlavha</Label>
            <Input
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              placeholder="Qidiruv natijalarida ko'rinadigan sarlavha"
            />
            <p className="text-xs text-muted-foreground">{formData.metaTitle.length}/60 belgi</p>
          </div>

          <div className="space-y-2">
            <Label>SEO Tavsif</Label>
            <Textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              placeholder="Qidiruv natijalarida ko'rinadigan tavsif"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{formData.metaDescription.length}/160 belgi</p>
          </div>

          <div className="space-y-2">
            <Label>SEO Kalit so'zlar</Label>
            <Input
              value={formData.metaKeywords}
              onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
              placeholder="kalit, so'zlar, vergul, bilan"
            />
          </div>

          {/* SEO Preview */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Google qidiruv ko'rinishi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {formData.metaTitle || formData.title || 'Maqola sarlavhasi'}
                </p>
                <p className="text-green-700 text-sm">
                  sellercloudx.com/blog/{formData.slug || 'maqola-slug'}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {formData.metaDescription || formData.excerpt || 'Maqola tavsifi bu yerda ko\'rinadi...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => {
          setIsCreateOpen(false);
          setEditingPost(null);
          resetForm();
        }}>
          Bekor qilish
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {editingPost ? 'Saqlash' : 'Yaratish'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Boshqaruvi</h2>
          <p className="text-muted-foreground">Maqolalar, yangiliklar va kontentni boshqaring</p>
        </div>
        <Dialog open={isCreateOpen || !!editingPost} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingPost(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Yangi Maqola
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Maqolani tahrirlash' : 'Yangi maqola yaratish'}
              </DialogTitle>
            </DialogHeader>
            <PostForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? null : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Holat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="draft">Qoralama</SelectItem>
                <SelectItem value="published">Nashr qilingan</SelectItem>
                <SelectItem value="archived">Arxivlangan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory || 'all'} onValueChange={(v) => setFilterCategory(v === 'all' ? null : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Kategoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Jami maqolalar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts.filter((p: BlogPost) => p.status === 'published').length}</p>
              <p className="text-sm text-muted-foreground">Nashr qilingan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts.filter((p: BlogPost) => p.status === 'draft').length}</p>
              <p className="text-sm text-muted-foreground">Qoralamalar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts.reduce((acc: number, p: BlogPost) => acc + (p.viewCount || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Jami ko'rishlar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Maqola</TableHead>
                <TableHead>Kategoriya</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead>Ko'rishlar</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Maqolalar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post: BlogPost) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                          {post.featuredImage ? (
                            <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORIES.find(c => c.value === post.category)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[post.status]}>
                        {STATUS_LABELS[post.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.viewCount || 0}</TableCell>
                    <TableCell>{formatDate(post.publishedAt || post.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {post.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => publishMutation.mutate(post.id)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Maqolani o'chirishni tasdiqlaysizmi?")) {
                              deleteMutation.mutate(post.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
