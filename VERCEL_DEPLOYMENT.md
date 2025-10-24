# Deploying to Vercel

This guide explains how to deploy your Brand Color Database app to Vercel.

## Overview

Your app has been configured to work with Vercel's serverless platform. Here's what has been set up:

### Files Created/Modified

1. **`vercel.json`** - Vercel configuration file that tells Vercel how to build and deploy your app
2. **`api/index.ts`** - Serverless function handler for your Express backend (handles all `/api/*` routes)
3. **`.vercelignore`** - Files to ignore during deployment

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables** (if using PostgreSQL database)
   In Vercel Dashboard → Settings → Environment Variables, add:
   - `DATABASE_URL` - Your PostgreSQL connection string (from Neon or other provider)
   - Any other environment variables your app needs

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a live URL like `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## How It Works

### Frontend
- Built using Vite
- Static files served from `dist/public`
- All your React components remain unchanged

### Backend (API Routes)
- Runs as serverless functions on Vercel
- All routes under `/api/*` are handled by `api/serverless.ts`
- The serverless function initializes Express and handles requests

### Database
- If using PostgreSQL (Neon):
  - Make sure to add `DATABASE_URL` as an environment variable in Vercel
  - The app will automatically connect using the URL
- If using in-memory storage:
  - Data will reset on each deployment
  - Consider switching to a database for production

## Important Notes

### Routes
All your API routes are already prefixed with `/api`, so they'll work correctly:
- `GET /api/colors`
- `GET /api/colors/hue/:hue`
- `GET /api/colors/keyword/:keyword`
- `GET /api/colors/search?q=...`
- `POST /api/colors`
- And all other routes

### Build Process
The build command in `vercel.json` is:
```bash
npm run build
```

This runs:
1. `vite build` - Builds the React frontend
2. `esbuild server/index.ts` - Bundles the server code

### Limitations
Serverless functions have some limitations:
- **10-second timeout** on the Hobby plan (60 seconds on Pro)
- **No persistent storage** - Use a database for data persistence
- **Cold starts** - First request after inactivity may be slower

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json` (not devDependencies)
- Verify TypeScript compiles: `npm run check`

### API Routes Not Working
- Verify routes are prefixed with `/api`
- Check Function logs in Vercel dashboard
- Ensure environment variables are set correctly

### Database Connection Issues
- Verify `DATABASE_URL` is set in Vercel environment variables
- For Neon or other PostgreSQL providers, make sure the connection string is correct
- Check if your database allows connections from Vercel's IP ranges

## Testing Locally

Before deploying, test the production build locally:

```bash
# Build the app
npm run build

# Start production server
npm run start
```

Visit `http://localhost:5000` to test.

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Import project in Vercel
3. ✅ Configure environment variables
4. ✅ Deploy
5. ✅ Test your live app
6. 🎉 Share your app with the world!

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Express Apps](https://vercel.com/guides/using-express-with-vercel)
- [Environment Variables](https://vercel.com/docs/environment-variables)
