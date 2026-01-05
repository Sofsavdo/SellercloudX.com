import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Building2,
  User,
  Users,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2,
  Shield,
} from 'lucide-react';

type EntityType = 'yatt' | 'ooo' | 'individual';

const baseSchema = {
  entityType: z.enum(['yatt', 'ooo', 'individual']),
  // Bank details
  bankName: z.string().min(2, 'Bank nomini kiriting'),
  bankMfo: z.string().length(5, 'MFO 5 raqam bo\'lishi kerak'),
  bankAccountNumber: z.string().min(20, 'Hisob raqami to\'liq bo\'lishi kerak'),
  // Address
  legalAddress: z.string().min(10, 'Yuridik manzilni kiriting'),
  actualAddress: z.string().optional(),
  // Contact
  phone: z.string().min(9, 'Telefon raqamini kiriting'),
  email: z.string().email('Email noto\'g\'ri'),
  website: z.string().url().optional().or(z.literal('')),
};

const yattSchema = z.object({
  ...baseSchema,
  entityType: z.literal('yatt'),
  fattName: z.string().min(5, 'F.I.O. to\'liq kiriting'),
  fattInn: z.string().length(9, 'INN 9 raqam bo\'lishi kerak'),
  fattCertificateNumber: z.string().min(6, 'Guvohnoma raqamini kiriting'),
  fattCertificateDate: z.string().min(1, 'Sanani tanlang'),
  fattIssuedBy: z.string().min(5, 'Kim tomonidan berilganini kiriting'),
});

const oooSchema = z.object({
  ...baseSchema,
  entityType: z.literal('ooo'),
  companyName: z.string().min(3, 'Korxona nomini kiriting'),
  companyInn: z.string().length(9, 'INN 9 raqam bo\'lishi kerak'),
  companyOked: z.string().min(5, 'OKED kodini kiriting'),
  companyDirector: z.string().min(5, 'Direktor F.I.O. kiriting'),
  companyFounder: z.string().min(5, 'Ta\'sischi F.I.O. kiriting'),
  companyRegistrationNumber: z.string().min(6, 'Ro\'yxat raqamini kiriting'),
  companyRegistrationDate: z.string().min(1, 'Sanani tanlang'),
});

const individualSchema = z.object({
  ...baseSchema,
  entityType: z.literal('individual'),
  fullName: z.string().min(5, 'F.I.O. to\'liq kiriting'),
  passportSeries: z.string().length(2, 'Passport seriyasi 2 harf'),
  passportNumber: z.string().length(7, 'Passport raqami 7 raqam'),
  pinfl: z.string().length(14, 'PINFL 14 raqam bo\'lishi kerak'),
});

const formSchema = z.discriminatedUnion('entityType', [
  yattSchema,
  oooSchema,
  individualSchema,
]);

type FormData = z.infer<typeof formSchema>;

const ENTITY_TYPES = [
  {
    id: 'yatt' as EntityType,
    name: 'YaTT',
    fullName: 'Yakka Tartibdagi Tadbirkor',
    icon: User,
    description: 'Individual tadbirkorlar uchun',
  },
  {
    id: 'ooo' as EntityType,
    name: 'OOO/MChJ',
    fullName: "Mas'uliyati Cheklangan Jamiyat",
    icon: Building2,
    description: 'Yuridik shaxslar uchun',
  },
  {
    id: 'individual' as EntityType,
    name: 'Jismoniy shaxs',
    fullName: 'Jismoniy shaxs',
    icon: Users,
    description: 'Oddiy fuqarolar uchun',
  },
];

interface LegalEntityFormProps {
  onSuccess?: () => void;
}

export function LegalEntityForm({ onSuccess }: LegalEntityFormProps) {
  const [entityType, setEntityType] = useState<EntityType>('yatt');
  const [files, setFiles] = useState<Record<string, File | null>>({
    passportCopy: null,
    innCertificate: null,
    companyCharter: null,
    companyExtract: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingEntity, isLoading: isLoadingEntity } = useQuery({
    queryKey: ['/api/legal-entities/me'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/legal-entities/me');
      return response.json();
    },
    retry: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityType: 'yatt',
      bankName: '',
      bankMfo: '',
      bankAccountNumber: '',
      legalAddress: '',
      actualAddress: '',
      phone: '',
      email: '',
      website: '',
    } as any,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, String(value));
      });
      
      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const response = await apiRequest('POST', '/api/legal-entities', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '✅ Muvaffaqiyatli saqlandi',
        description: "Ma'lumotlar tasdiqlash uchun yuborildi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/legal-entities/me'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Xatolik',
        description: error.message || "Ma'lumotlarni saqlashda xatolik",
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleEntityTypeChange = (type: EntityType) => {
    setEntityType(type);
    form.setValue('entityType', type);
  };

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  const getVerificationStatus = () => {
    if (!existingEntity) return null;
    if (existingEntity.verified) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Tasdiqlangan
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Tekshirilmoqda
      </Badge>
    );
  };

  if (isLoadingEntity) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Yuridik Ma'lumotlar
            </CardTitle>
            <CardDescription>
              Hamkorlik shartnomasi uchun to'liq yuridik ma'lumotlarni kiriting
            </CardDescription>
          </div>
          {getVerificationStatus()}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Entity Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Biznes turi</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ENTITY_TYPES.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleEntityTypeChange(type.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      entityType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${entityType === type.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                        <type.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{type.name}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* YaTT Form Fields */}
            <AnimatePresence mode="wait">
              {entityType === 'yatt' && (
                <motion.div
                  key="yatt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    YaTT Ma'lumotlari
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fattName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>F.I.O. (To'liq)</FormLabel>
                          <FormControl>
                            <Input placeholder="Aliyev Vali Akmalovich" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fattInn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>INN</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789" maxLength={9} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fattCertificateNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guvohnoma raqami</FormLabel>
                          <FormControl>
                            <Input placeholder="00123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fattCertificateDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guvohnoma sanasi</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fattIssuedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kim tomonidan berilgan</FormLabel>
                          <FormControl>
                            <Input placeholder="Toshkent sh. Soliq boshqarmasi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {/* OOO Form Fields */}
              {entityType === 'ooo' && (
                <motion.div
                  key="ooo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    OOO/MChJ Ma'lumotlari
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Korxona nomi</FormLabel>
                          <FormControl>
                            <Input placeholder='"Innovatsiya Texnologiyalari" MChJ' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyInn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>INN</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789" maxLength={9} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyOked"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OKED</FormLabel>
                          <FormControl>
                            <Input placeholder="46900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyRegistrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ro'yxat raqami</FormLabel>
                          <FormControl>
                            <Input placeholder="00123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyRegistrationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ro'yxat sanasi</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyDirector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Direktor F.I.O.</FormLabel>
                          <FormControl>
                            <Input placeholder="Aliyev Vali Akmalovich" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyFounder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ta'sischi F.I.O.</FormLabel>
                          <FormControl>
                            <Input placeholder="Aliyev Vali Akmalovich" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {/* Individual Form Fields */}
              {entityType === 'individual' && (
                <motion.div
                  key="individual"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Jismoniy Shaxs Ma'lumotlari
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>F.I.O. (To'liq)</FormLabel>
                          <FormControl>
                            <Input placeholder="Aliyev Vali Akmalovich" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="passportSeries"
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Seriya</FormLabel>
                            <FormControl>
                              <Input placeholder="AA" maxLength={2} className="uppercase" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="passportNumber"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Passport raqami</FormLabel>
                            <FormControl>
                              <Input placeholder="1234567" maxLength={7} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="pinfl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PINFL</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678901234" maxLength={14} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Separator />

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Bank Rekvizitlari
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank nomi</FormLabel>
                      <FormControl>
                        <Input placeholder="Agrobank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankMfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MFO</FormLabel>
                      <FormControl>
                        <Input placeholder="00873" maxLength={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hisob raqami</FormLabel>
                      <FormControl>
                        <Input placeholder="20208000000000000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Manzil
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="legalAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yuridik manzil</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Toshkent sh., Yunusobod t., Amir Temur ko'chasi, 1-uy" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faktik manzil (ixtiyoriy)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Agar yuridik manzildan farq qilsa kiriting" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Agar faktik manzil yuridik manzil bilan bir xil bo'lsa, bo'sh qoldiring
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Aloqa ma'lumotlari
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="+998 90 123 45 67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@company.uz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veb-sayt (ixtiyoriy)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://company.uz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Hujjatlar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportCopy">Pasport nusxasi</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="passportCopy"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange('passportCopy', e)}
                    />
                    {files.passportCopy && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="innCertificate">INN guvohnomasi</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="innCertificate"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange('innCertificate', e)}
                    />
                    {files.innCertificate && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
                {entityType === 'ooo' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyCharter">Nizom</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="companyCharter"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFileChange('companyCharter', e)}
                        />
                        {files.companyCharter && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyExtract">Ro'yxatdan o'tish ko'chirma</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="companyExtract"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFileChange('companyExtract', e)}
                        />
                        {files.companyExtract && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Fayllar PDF yoki rasm (JPG, PNG) formatida bo'lishi kerak. Maksimal hajm: 5MB
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                size="lg"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Saqlash va Tasdiqlashga Yuborish
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
