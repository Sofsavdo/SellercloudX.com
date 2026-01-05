// Simple Product Form - Minimal ma'lumotlar bilan mahsulot yaratish
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package, Camera, Upload, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AIScanner } from './AIScanner';

interface SimpleProductFormProps {
  onProductCreated?: () => void;
}

export function SimpleProductForm({ onProductCreated }: SimpleProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    stockQuantity: '',
    costPrice: '',
    image: null as File | null,
    imagePreview: null as string | null
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('stockQuantity', data.stockQuantity);
      formDataToSend.append('costPrice', data.costPrice);
      if (data.image) {
        formDataToSend.append('image', data.image);
      }

      const response = await apiRequest('POST', '/api/products/simple', formDataToSend);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Mahsulot yaratildi!",
        description: "AI Manager avtomatik kartochka yaratishni boshladi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsOpen(false);
      resetForm();
      onProductCreated?.();
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      stockQuantity: '',
      costPrice: '',
      image: null,
      imagePreview: null
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleProductFromScanner = (productData: any) => {
    setFormData(prev => ({
      ...prev,
      name: productData.name || prev.name,
      costPrice: productData.price ? productData.price.toString() : prev.costPrice
    }));
    setShowScanner(false);
    toast({
      title: "✅ Mahsulot topildi!",
      description: "Ma'lumotlar avtomatik to'ldirildi"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.stockQuantity || !formData.costPrice) {
      toast({
        title: "⚠️ Ma'lumotlar to'liq emas",
        description: "Barcha majburiy maydonlarni to'ldiring",
        variant: "destructive"
      });
      return;
    }

    createProductMutation.mutate(formData);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Yangi Mahsulot
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Yangi Mahsulot Qo'shish
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Minimal ma'lumotlar kiriting - AI Manager qolgan qismlarni avtomatik to'ldiradi
            </p>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI Scanner Button */}
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">AI Scanner</h4>
                    <p className="text-sm text-muted-foreground">
                      Kameradan rasm oling yoki fayl yuklang - AI avtomatik aniqlaydi
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    className="border-primary"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scanner
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Name */}
            <div>
              <Label htmlFor="name">Mahsulot Nomi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masalan: iPhone 15 Pro Max"
                required
                className="mt-1"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <Label htmlFor="stockQuantity">Qoldiq Miqdori *</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                placeholder="Masalan: 10"
                required
                className="mt-1"
              />
            </div>

            {/* Cost Price */}
            <div>
              <Label htmlFor="costPrice">Tannarx (so'm) *</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                placeholder="Masalan: 500000"
                required
                className="mt-1"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image">Mahsulot Rasmi (Sifatli) *</Label>
              <div className="mt-2">
                {formData.imagePreview ? (
                  <div className="relative">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                    >
                      O'chirish
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-primary font-medium">Rasm yuklash</span>
                      <span className="text-muted-foreground"> yoki drag & drop</span>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-blue-900">🤖 AI Manager Avtomatik:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Marketplace kartochkalarini yaratadi</li>
                  <li>✅ SEO-optimizatsiya qilingan sarlavha va tavsif</li>
                  <li>✅ Infografika va qo'shimcha rasmlar generatsiya qiladi</li>
                  <li>✅ Marketplace qoidalariga moslashtiradi</li>
                  <li>✅ Narx optimizatsiyasi va raqobat tahlili</li>
                </ul>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                Bekor qilish
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Yaratish va AI Manager ga Yuborish
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Scanner Modal */}
      <AIScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onProductFound={handleProductFromScanner}
      />
    </>
  );
}

