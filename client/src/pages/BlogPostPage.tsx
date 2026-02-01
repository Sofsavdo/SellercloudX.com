// Blog Post Detail Page - SEO optimized
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, Clock, Eye, ArrowLeft, Share2, Facebook, Twitter, 
  Linkedin, Copy, CheckCircle, User, Tag, ChevronRight, Newspaper
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

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
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  news: 'Yangiliklar',
  updates: 'Yangilanishlar',
  tutorials: "Qo'llanmalar",
  tips: 'Maslahatlar',
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Fetch post
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['/api/blog/posts', slug],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/blog/posts/${slug}`);
      return response.json();
    },
    enabled: !!slug,
  });

  // Increment view count
  useEffect(() => {
    if (post?.id) {
      apiRequest('POST', `/api/blog/posts/${post.id}/view`).catch(() => {});
    }
  }, [post?.id]);

  // Fetch related posts
  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['/api/blog/posts/related', post?.category],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/blog/posts?category=${post?.category}&status=published&limit=3`);
      return response.json();
    },
    enabled: !!post?.category,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const readingTime = (content: string) => {
    const words = content?.split(/\s+/).length || 0;
    return Math.ceil(words / 200);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: 'Nusxalandi!', description: 'Havola nusxalandi' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Update page meta for SEO
  useEffect(() => {
    if (post) {
      document.title = post.metaTitle || post.title + ' | SellerCloudX Blog';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', post.metaDescription || post.excerpt);
      }
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Maqola topilmadi</h1>
          <p className="text-muted-foreground mb-4">Bu maqola mavjud emas yoki o'chirilgan</p>
          <Button onClick={() => setLocation('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Blogga qaytish
          </Button>
        </div>
      </div>
    );
  }

  const tags = post.tags ? JSON.parse(post.tags) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Blogga qaytish</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener">
                <Facebook className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`} target="_blank" rel="noopener">
                <Twitter className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative h-96 bg-gradient-to-br from-primary/10 to-blue-500/10">
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Content */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="secondary">{CATEGORY_LABELS[post.category]}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {readingTime(post.content)} daqiqa o'qish
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              {post.viewCount} ko'rildi
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{post.authorName || 'SellerCloudX'}</p>
              <p className="text-sm text-muted-foreground">Muallif</p>
            </div>
          </div>

          {/* Video */}
          {post.videoUrl && (
            <div className="mb-8 aspect-video rounded-xl overflow-hidden">
              <iframe
                src={post.videoUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pt-8 border-t">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {tags.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Share */}
          <Card className="mb-8">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Maqola yoqdimi?</h3>
                <p className="text-sm text-muted-foreground">Do'stlaringiz bilan ulashing</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyLink}>
                  {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Nusxalash
                </Button>
                <Button size="sm" asChild>
                  <a href={`https://t.me/share/url?url=${shareUrl}&text=${post.title}`} target="_blank" rel="noopener">
                    <Share2 className="w-4 h-4 mr-1" />
                    Telegram
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">O'xshash maqolalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {relatedPosts.filter((p: BlogPost) => p.id !== post.id).slice(0, 3).map((relatedPost: BlogPost) => (
                <Card 
                  key={relatedPost.id} 
                  className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => setLocation(`/blog/${relatedPost.slug}`)}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-blue-500/10">
                    {relatedPost.featuredImage && (
                      <img src={relatedPost.featuredImage} alt={relatedPost.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 hover:text-primary transition">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

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
