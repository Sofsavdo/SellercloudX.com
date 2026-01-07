import session from "express-session";
import MemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const MemoryStoreSession = MemoryStore(session);
const PgSession = connectPgSimple(session);

export function getSessionConfig() {
  const isProd = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL || '';
  const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');
  
  let store;
  
  if (isProd && isPostgres) {
    // Use PostgreSQL session store in production with PostgreSQL
    console.log('✅ Using PostgreSQL session store');
    
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    
    store = new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15,
      errorLog: (err: Error) => {
        console.error('🔴 Session store error:', err);
      }
    });
  } else {
    // Use MemoryStore for development or SQLite production
    const storeType = isProd ? 'MemoryStore (SQLite production)' : 'MemoryStore (development)';
    console.log(`⚠️  Using ${storeType}`);
    store = new MemoryStoreSession({
      checkPeriod: 86400000,
      ttl: 7 * 24 * 60 * 60 * 1000,
      stale: false
    });
  }

  // Determine if we're behind a proxy (Railway, Render, etc.)
  const isBehindProxy = isProd || process.env.TRUST_PROXY === 'true';
  
  // Railway specific: If on Railway, sameSite should be 'none' with secure: true
  // Because Railway serves frontend and backend from different internal services
  const isRailway = databaseUrl.includes('railway.app') || process.env.RAILWAY_ENVIRONMENT;
  const cookieSameSite = isRailway ? 'none' as const : (isProd ? 'lax' as const : 'lax' as const);
  const cookieSecure = isProd; // Always true in production
  
  const sessionConfig = {
    store,
    secret: process.env.SESSION_SECRET || "your-secret-key-dev-only",
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
      secure: cookieSecure, // true in production (Railway has HTTPS)
      httpOnly: true,
      sameSite: cookieSameSite, // 'none' for Railway, 'lax' for others
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: undefined // Let browser set domain automatically
    },
    rolling: true, // Reset expiration on each request
    proxy: isBehindProxy // Trust proxy headers (Railway, Render, etc.)
  } as session.SessionOptions;

  console.log('🔧 Session config:', {
    name: sessionConfig.name,
    storeType: isPostgres ? 'PostgreSQL' : 'Memory',
    cookie: {
      secure: sessionConfig.cookie.secure,
      httpOnly: sessionConfig.cookie.httpOnly,
      sameSite: sessionConfig.cookie.sameSite,
      maxAge: sessionConfig.cookie.maxAge,
      path: sessionConfig.cookie.path
    },
    proxy: sessionConfig.proxy,
    environment: isProd ? 'production' : 'development',
    isRailway: !!isRailway
  });

  return sessionConfig;
}
