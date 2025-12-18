import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Building, 
  MapPin, 
  FileText,
  Upload,
  Save
} from 'lucide-react';

interface PartnerVerificationSectionProps {
  partner: any;
  onUpdate?: () => void;
}

export default function PartnerVerificationSection({ partner, onUpdate }: PartnerVerificationSectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: partner?.businessName || '',
    businessAddress: partner?.businessAddress || '',
    businessCategory: partner?.businessCategory || '',
    inn: partner?.inn || '',
    legalName: '',
    directorName: '',
    bankAccount: '',
    bankName: '',
    mfo: '',
    notes: partner?.notes || ''
  });

  const getStatusBadge = () => {
    if (partner?.approved) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="w-4 h-4 mr-1" />
          Tasdiqlangan
        </Badge>
      );
    }
    
    if (formData.inn && formData.businessAddress) {
      return (
        <Badge className="bg-yellow-500">
          <Clock className="w-4 h-4 mr-1" />
          Tekshiruvda
        </Badge>
      );
    }

    return (
      <Badge className="bg-red-500">
        <AlertCircle className="w-4 h-4 mr-1" />
        Ma'lumotlar to'ldirilmagan
      </Badge>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      toast({
        title: "✅ Saqlandi!",
        description: "Ma'lumotlaringiz muvaffaqiyatli yangilandi. Admin tez orada ko'rib chiqadi.",
      });

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      toast({
        title: "❌ Xatolik",
        description: "Ma'lumotlarni saqlashda xatolik yuz berdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            Yuridik Ma'lumotlar va Aktivatsiya
          </CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Platformadan to'liq foydalanish uchun yuridik ma'lumotlaringizni to'ldiring
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {!partner?.approved && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Aktivatsiya kutilmoqda</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Yuridik ma'lumotlaringizni to'ldiring va admin tasdiqini kuting. 
                  Odatda 24 soat ichida ko'rib chiqiladi.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Biznes Ma'lumotlari
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Biznes Nomi *</Label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  disabled={!isEditing}
                  required
                  placeholder="ElectroMart UZ"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Kategoriya *</Label>
                <Input
                  value={formData.businessCategory}
                  onChange={(e) => setFormData({...formData, businessCategory: e.target.value})}
                  disabled={!isEditing}
                  required
                  placeholder="Elektronika"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Biznes Manzili *
              </Label>
              <Input
                value={formData.businessAddress}
                onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                disabled={!isEditing}
                required
                placeholder="Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi 1-uy"
                className="mt-1"
              />
            </div>
          </div>

          {/* Legal Information */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Yuridik Ma'lumotlar
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>INN (STIR) *</Label>
                <Input
                  value={formData.inn}
                  onChange={(e) => setFormData({...formData, inn: e.target.value})}
                  disabled={!isEditing}
                  required
                  placeholder="123456789"
                  maxLength={9}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">9 raqamli STIR</p>
              </div>

              <div>
                <Label>Yuridik Nomi</Label>
                <Input
                  value={formData.legalName}
                  onChange={(e) => setFormData({...formData, legalName: e.target.value})}
                  disabled={!isEditing}
                  placeholder="ElectroMart UZ MChJ"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Direktor F.I.O</Label>
                <Input
                  value={formData.directorName}
                  onChange={(e) => setFormData({...formData, directorName: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Karimov Rustam Akramovich"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Bank Hisob Raqami</Label>
                <Input
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                  disabled={!isEditing}
                  placeholder="20208000000000000000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Bank Nomi</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Xalq Banki"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>MFO</Label>
                <Input
                  value={formData.mfo}
                  onChange={(e) => setFormData({...formData, mfo: e.target.value})}
                  disabled={!isEditing}
                  placeholder="00014"
                  maxLength={5}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="pt-4 border-t">
            <Label>Qo'shimcha Ma'lumot</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              disabled={!isEditing}
              placeholder="Qo'shimcha ma'lumotlar yoki izohlar..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Documents Upload (Future) */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
              <Upload className="w-5 h-5 text-green-600" />
              Hujjatlar (Ixtiyoriy)
            </h3>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Guvohnoma, litsenziya yoki boshqa hujjatlarni yuklang
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Tez orada qo'shiladi)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                Tahrirlash
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Saqlash
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>

        {/* Status Info */}
        {partner?.approved ? (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">Akkauntingiz tasdiqlangan!</p>
                <p className="text-sm text-green-700 mt-1">
                  Siz platformaning barcha imkoniyatlaridan foydalanishingiz mumkin.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800">Tasdiq kutilmoqda</p>
                <p className="text-sm text-blue-700 mt-1">
                  Ma'lumotlaringizni to'ldiring va admin tasdiqini kuting. 
                  Savol bo'lsa: support@sellercloudx.com
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
