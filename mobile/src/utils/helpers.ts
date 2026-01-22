// Yordamchi funksiyalar

/**
 * Narxni formatlash (UZS)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' UZS';
}

/**
 * Qisqa narx formati (1.2M, 500K)
 */
export function formatShortPrice(price: number): string {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + 'M';
  } else if (price >= 1000) {
    return (price / 1000).toFixed(0) + 'K';
  }
  return price.toString();
}

/**
 * Sanani formatlash
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Vaqtni formatlash (5 daqiqa oldin, 2 soat oldin)
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (seconds < 60) return 'Hozirgina';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} daqiqa oldin`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} soat oldin`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} kun oldin`;
  
  return formatDate(date);
}

/**
 * INN validatsiya
 */
export function validateINN(inn: string): { valid: boolean; error?: string } {
  const cleanINN = inn.replace(/\D/g, '');
  
  if (!cleanINN) {
    return { valid: false, error: 'INN kiritilmagan' };
  }
  
  if (cleanINN.length !== 9) {
    return { valid: false, error: 'INN 9 ta raqamdan iborat bo\'lishi kerak' };
  }
  
  if (cleanINN.startsWith('0')) {
    return { valid: false, error: 'Noto\'g\'ri INN formati' };
  }
  
  // Barcha raqamlar bir xil
  const allSame = cleanINN.split('').every(d => d === cleanINN[0]);
  if (allSame) {
    return { valid: false, error: 'Barcha raqamlar bir xil bo\'lmasligi kerak' };
  }
  
  // Ketma-ket raqamlar
  if (cleanINN === '123456789' || cleanINN === '987654321') {
    return { valid: false, error: 'Ketma-ket raqamlar qabul qilinmaydi' };
  }
  
  return { valid: true };
}

/**
 * Telefon raqamini formatlash
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  return phone;
}

/**
 * Foyda foizini hisoblash
 */
export function calculateProfitMargin(costPrice: number, sellingPrice: number): number {
  if (costPrice <= 0) return 0;
  return Math.round(((sellingPrice - costPrice) / costPrice) * 100);
}

/**
 * Tavsiya etilgan narxni hisoblash (30% markup)
 */
export function calculateSuggestedPrice(costPrice: number, markup: number = 30): number {
  return Math.round(costPrice * (1 + markup / 100));
}

/**
 * UUID generatsiya
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
