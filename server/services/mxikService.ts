/**
 * MXIK Code Service - O'zbekiston Soliq tizimi klassifikatori
 * 
 * MXIK (Milliy Xo'jalik Faoliyati Klassifikatori) - mahsulotlar va xizmatlarni
 * soliq maqsadlarida tasniflash uchun ishlatiladigan kod.
 * 
 * Ma'lumot manbai: https://tasnif.soliq.uz/classifier
 * 
 * Fuzzy search algoritmi orqali mahsulot nomiga mos MXIK kodi topiladi.
 */

import * as fs from 'fs';
import * as path from 'path';

interface MxikCode {
  code: string;           // MXIK kodi (masalan: "85101200")
  nameUz: string;         // Nomi o'zbek tilida
  nameRu: string;         // Nomi rus tilida
  parentCode?: string;    // Ota kod
  level: number;          // Ierarxiya darajasi
  isActive: boolean;      // Faol yoki yo'q
}

interface MxikSearchResult {
  code: string;
  nameUz: string;
  nameRu: string;
  similarity: number;     // 0-100% o'xshashlik
}

// In-memory MXIK database (loaded from file on startup)
let mxikDatabase: MxikCode[] = [];
let isLoaded = false;

// Common MXIK codes for marketplace products (fallback)
const COMMON_MXIK_CODES: MxikCode[] = [
  // Elektronika
  { code: '26101100', nameUz: 'Mobil telefonlar', nameRu: 'Мобильные телефоны', level: 4, isActive: true },
  { code: '26201000', nameUz: 'Kompyuterlar va aksessuarlar', nameRu: 'Компьютеры и аксессуары', level: 3, isActive: true },
  { code: '26301000', nameUz: 'Audio va video uskunalar', nameRu: 'Аудио и видео оборудование', level: 3, isActive: true },
  { code: '27401000', nameUz: 'Maishiy elektr jihozlari', nameRu: 'Бытовые электроприборы', level: 3, isActive: true },
  
  // Kiyim-kechak
  { code: '14101000', nameUz: 'Erkaklar kiyimlari', nameRu: 'Мужская одежда', level: 3, isActive: true },
  { code: '14102000', nameUz: 'Ayollar kiyimlari', nameRu: 'Женская одежда', level: 3, isActive: true },
  { code: '14103000', nameUz: 'Bolalar kiyimlari', nameRu: 'Детская одежда', level: 3, isActive: true },
  { code: '15201000', nameUz: 'Poyabzallar', nameRu: 'Обувь', level: 3, isActive: true },
  
  // Uy-ro'zg'or
  { code: '31001000', nameUz: 'Mebel', nameRu: 'Мебель', level: 3, isActive: true },
  { code: '32201000', nameUz: 'O\'yinchoqlar', nameRu: 'Игрушки', level: 3, isActive: true },
  { code: '27501000', nameUz: 'Oshxona jihozlari', nameRu: 'Кухонное оборудование', level: 3, isActive: true },
  
  // Kosmetika va parfyumeriya
  { code: '20421000', nameUz: 'Parfyumeriya', nameRu: 'Парфюмерия', level: 3, isActive: true },
  { code: '20422000', nameUz: 'Kosmetika', nameRu: 'Косметика', level: 3, isActive: true },
  
  // Oziq-ovqat
  { code: '10101000', nameUz: 'Go\'sht mahsulotlari', nameRu: 'Мясные продукты', level: 3, isActive: true },
  { code: '10201000', nameUz: 'Baliq mahsulotlari', nameRu: 'Рыбные продукты', level: 3, isActive: true },
  { code: '10501000', nameUz: 'Sut mahsulotlari', nameRu: 'Молочные продукты', level: 3, isActive: true },
  
  // Sport va dam olish
  { code: '32301000', nameUz: 'Sport jihozlari', nameRu: 'Спортивный инвентарь', level: 3, isActive: true },
  { code: '32401000', nameUz: 'Dam olish uchun mahsulotlar', nameRu: 'Товары для отдыха', level: 3, isActive: true },
  
  // Avtomobil
  { code: '29101000', nameUz: 'Avtomobil ehtiyot qismlari', nameRu: 'Автозапчасти', level: 3, isActive: true },
  { code: '29201000', nameUz: 'Avtomobil aksessuarlari', nameRu: 'Автоаксессуары', level: 3, isActive: true },
  
  // Qurilish
  { code: '23101000', nameUz: 'Qurilish materiallari', nameRu: 'Строительные материалы', level: 3, isActive: true },
  { code: '27101000', nameUz: 'Elektr jihozlari', nameRu: 'Электротехника', level: 3, isActive: true },
  
  // Default
  { code: '47190000', nameUz: 'Boshqa chakana savdo', nameRu: 'Прочая розничная торговля', level: 2, isActive: true },
];

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  const distance = levenshteinDistance(str1, str2);
  return Math.round((1 - distance / maxLen) * 100);
}

/**
 * Tokenize and normalize text for better matching
 */
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sа-яўқғҳёa-z0-9]/gi, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

/**
 * Search MXIK code by product name using fuzzy matching
 */
export function searchMxikCode(productName: string, language: 'uz' | 'ru' = 'uz'): MxikSearchResult[] {
  const database = mxikDatabase.length > 0 ? mxikDatabase : COMMON_MXIK_CODES;
  const results: MxikSearchResult[] = [];
  const searchTokens = normalizeText(productName);

  for (const mxik of database) {
    if (!mxik.isActive) continue;

    const nameField = language === 'uz' ? mxik.nameUz : mxik.nameRu;
    const codeTokens = normalizeText(nameField);

    // Calculate token-based similarity
    let matchScore = 0;
    let matchCount = 0;

    for (const searchToken of searchTokens) {
      let bestTokenMatch = 0;
      for (const codeToken of codeTokens) {
        const sim = calculateSimilarity(searchToken, codeToken);
        bestTokenMatch = Math.max(bestTokenMatch, sim);
      }
      if (bestTokenMatch > 50) {
        matchScore += bestTokenMatch;
        matchCount++;
      }
    }

    // Average similarity if any matches found
    const similarity = matchCount > 0 ? Math.round(matchScore / matchCount) : 0;

    if (similarity > 40) {
      results.push({
        code: mxik.code,
        nameUz: mxik.nameUz,
        nameRu: mxik.nameRu,
        similarity
      });
    }
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  // Return top 5 results
  return results.slice(0, 5);
}

/**
 * Get best MXIK match for product
 */
export function getBestMxikCode(productName: string, productCategory?: string): MxikSearchResult | null {
  // First try with full product name
  let results = searchMxikCode(productName, 'uz');
  
  // If no good match, try with category
  if (results.length === 0 && productCategory) {
    results = searchMxikCode(productCategory, 'uz');
  }

  // If still no match, try Russian
  if (results.length === 0) {
    results = searchMxikCode(productName, 'ru');
  }

  // Return best match if similarity > 50%
  if (results.length > 0 && results[0].similarity > 50) {
    return results[0];
  }

  // Return default code for "other retail"
  return {
    code: '47190000',
    nameUz: 'Boshqa chakana savdo',
    nameRu: 'Прочая розничная торговля',
    similarity: 30
  };
}

/**
 * Validate MXIK code format
 */
export function validateMxikCode(code: string): boolean {
  // MXIK codes are typically 8 digits
  return /^\d{8}$/.test(code);
}

/**
 * Get MXIK code details by code
 */
export function getMxikByCode(code: string): MxikCode | null {
  const database = mxikDatabase.length > 0 ? mxikDatabase : COMMON_MXIK_CODES;
  return database.find(m => m.code === code) || null;
}

/**
 * Load MXIK database from JSON file
 */
export async function loadMxikDatabase(filePath?: string): Promise<boolean> {
  try {
    // Use absolute path by default
    const defaultPath = '/app/server/data/mxik_codes.json';
    const loadPath = filePath || defaultPath;
    
    console.log(`📂 Attempting to load MXIK from: ${loadPath}`);
    
    if (!fs.existsSync(loadPath)) {
      console.log('⚠️ MXIK database file not found, using built-in codes');
      mxikDatabase = COMMON_MXIK_CODES;
      isLoaded = true;
      return true;
    }

    const data = fs.readFileSync(loadPath, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Validate data structure
    if (Array.isArray(parsed) && parsed.length > 0) {
      mxikDatabase = parsed;
      isLoaded = true;
      console.log(`✅ Loaded ${mxikDatabase.length} MXIK codes from file`);
      return true;
    } else {
      console.log('⚠️ Invalid MXIK data, using built-in codes');
      mxikDatabase = COMMON_MXIK_CODES;
      isLoaded = true;
      return false;
    }
  } catch (error: any) {
    console.error('❌ Failed to load MXIK database:', error.message);
    mxikDatabase = COMMON_MXIK_CODES;
    isLoaded = true;
    return false;
  }
}

/**
 * Get MXIK database status
 */
export function getMxikStatus(): {
  loaded: boolean;
  totalCodes: number;
  source: 'file' | 'builtin';
} {
  return {
    loaded: isLoaded,
    totalCodes: mxikDatabase.length || COMMON_MXIK_CODES.length,
    source: mxikDatabase.length > COMMON_MXIK_CODES.length ? 'file' : 'builtin'
  };
}

// Initialize with built-in codes
loadMxikDatabase().catch(console.error);

export default {
  searchMxikCode,
  getBestMxikCode,
  validateMxikCode,
  getMxikByCode,
  loadMxikDatabase,
  getMxikStatus
};
