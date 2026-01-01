# BiznesYordam.uz - Railway Deploy Instructions

## 🚀 Quick Deploy to Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub account
- PostgreSQL database (Railway provides this)

### Step 1: Connect to Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 2: Configure Environment Variables

Add these environment variables in Railway dashboard:

```bash
# Required
DATABASE_URL=postgresql://... # Railway provides this automatically
SESSION_SECRET=your-random-secret-key-change-this
NODE_ENV=production

# Optional - For full functionality
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Marketplace APIs (Optional)
UZUM_API_KEY=...
WILDBERRIES_API_KEY=...

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 3: Deploy

Railway will automatically:
1. Detect the build command from `railway.json`
2. Install dependencies
3. Build the project
4. Start the server

### Step 4: Database Setup

After first deployment:
1. Wait for the database to be ready
2. Run migrations automatically (handled by server startup)
3. Admin user will be created automatically:
   - Username: `Medik`
   - Password: `Medik9298`
   - Email: `medik@biznesyordam.uz`

### Step 5: Access Your Application

1. Railway will provide a URL (e.g., `https://your-app.railway.app`)
2. Visit the URL
3. Login with admin credentials
4. Change admin password immediately!

## 🔧 Build Configuration

The project uses these configurations:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/health` endpoint
- **Port**: Automatically set by Railway

## 📁 Project Structure

```
/workspace
├── dist/               # Build output
│   ├── public/         # Frontend build (Vite)
│   │   ├── assets/     # JS, CSS, images
│   │   └── index.html
│   └── index.js        # Backend build (esbuild)
├── server/             # Backend source
├── client/src/         # Frontend source
└── shared/             # Shared types/schema
```

## 🐛 Troubleshooting

### Build Fails
- Check if all dependencies are installed
- Verify Node.js version (requires 18+)
- Check Railway logs for errors

### Database Connection Issues
- Verify DATABASE_URL is set
- Check PostgreSQL service is running
- Ensure SSL settings are correct

### Static Files Not Loading
- Check if `dist/public/` exists after build
- Verify Vite build completed successfully
- Check server logs for MIME type warnings

### Health Check Failing
- Server should respond at `/health`
- Database must be connected
- Check health check timeout settings

## 🔐 Security Notes

1. **Change default credentials immediately after first login**
2. Set strong `SESSION_SECRET` (minimum 32 characters)
3. Configure CORS_ORIGIN for production domain
4. Enable HTTPS (Railway provides this automatically)
5. Keep API keys secure and never commit to git

## 📊 Monitoring

- Health endpoint: `https://your-app.railway.app/health`
- API docs: `https://your-app.railway.app/api-docs`
- Admin dashboard: `https://your-app.railway.app/admin`

## 🔄 Updates

To deploy updates:
1. Push changes to GitHub
2. Railway automatically deploys
3. No manual intervention needed

## 📞 Support

If you encounter issues:
1. Check Railway logs
2. Review health check endpoint
3. Contact support at medik@biznesyordam.uz

---

Built with ❤️ for Uzbekistan's e-commerce ecosystem
