// Blog Page - SEO optimized public blog
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, Clock, Eye, Search, Tag, ArrowLeft, Share2, 
  ChevronRight, Newspaper, TrendingUp, BookOpen, Lightbulb
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  videoUrl?: string;
  category: string;
  tags: string;
  status: string;
  authorName: string;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  news: Newspaper,
  updates: TrendingUp,
  tutorials: BookOpen,
  tips: Lightbulb,
};

const CATEGORY_LABELS: Record<string, string> = {
  news: 'Yangiliklar',
  updates: 'Yangilanishlar',
  tutorials: "Qo'llanmalar",
  tips: 'Maslahatlar',
};

const CATEGORY_COLORS: Record<string, string> = {
  news: 'bg-blue-500',
  updates: 'bg-green-500',
  tutorials: 'bg-purple-500',
  tips: 'bg-orange-500',
};

export default function BlogPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch blog posts
  const { data: postsData = [], isLoading } = useQuery({
    queryKey: ['/api/blog/posts', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/blog/posts?category=${selectedCategory}&status=published`
        : '/api/blog/posts?status=published';
      const response = await apiRequest('GET', url);
      const data = await response.json();
      // Handle error response gracefully
      if (data && data.error) {
        console.warn('Blog API error:', data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    },
  });
  
  // Ensure posts is always an array
  const posts = Array.isArray(postsData) ? postsData : [];

  // Fetch categories
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['/api/blog/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/blog/categories');
      const data = await response.json();
      // Handle error response gracefully
      if (data && data.error) {
        console.warn('Categories API error:', data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    },
  });
  
  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const filteredPosts = posts.filter((post: BlogPost) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* SEO Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              SellerCloudX
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition">Bosh sahifa</Link>
            <Link href="/blog" className="text-primary font-semibold">Blog</Link>
            <Link href="/login">
              <Button>Kirish</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            SellerCloudX <span className="text-primary">Blog</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            E-commerce va marketplace sohasidagi so'nggi yangiliklar, maslahatlar va qo'llanmalar
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Maqolalarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              className="gap-2"
            >
              Hammasi
            </Button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const Icon = CATEGORY_ICONS[key];
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(key)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Maqolalar topilmadi</h3>
              <p className="text-muted-foreground">Tez orada yangi maqolalar qo'shiladi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post: BlogPost) => {
                const CategoryIcon = CATEGORY_ICONS[post.category] || Newspaper;
                return (
                  <Card 
                    key={post.id} 
                    className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => setLocation(`/blog/${post.slug}`)}
                  >
                    {/* Featured Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-blue-500/10 overflow-hidden">
                      {post.featuredImage ? (
                        <img 
                          src={post.featuredImage} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CategoryIcon className="w-16 h-16 text-primary/30" />
                        </div>
                      )}
                      <Badge className={`absolute top-4 left-4 ${CATEGORY_COLORS[post.category]}`}>
                        {CATEGORY_LABELS[post.category]}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.viewCount}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Yangiliklardan xabardor bo'ling</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            E-commerce sohasidagi eng so'nggi yangiliklar va maslahatlarni birinchilar qatorida oling
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <Input 
              placeholder="Email manzilingiz" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button variant="secondary">Obuna bo'lish</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">
            © 2024 SellerCloudX. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}
