# Deployment Guide for Trivia Game

## Prerequisites
- GitHub account
- Render account (for backend)
- Vercel account (for frontend)

## Step 1: Push Code to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trivia-game.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to [Render](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: trivia-game-backend
   - **Root Directory**: src/backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `NODE_ENV`: production
   - `FRONTEND_URL`: (will add after deploying frontend)

6. Click "Create Web Service"
7. Copy the backend URL (e.g., https://trivia-game-backend.onrender.com)

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "Import Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

5. Add Environment Variable:
   - `VITE_BACKEND_URL`: Your Render backend URL (e.g., https://trivia-game-backend.onrender.com)

6. Click "Deploy"
7. Copy your frontend URL (e.g., https://trivia-game.vercel.app)

## Step 4: Update Backend CORS

1. Go back to Render dashboard
2. Go to Environment settings
3. Add/Update:
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., https://trivia-game.vercel.app)
4. The service will automatically redeploy

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Create a room
3. Share the room code with friends
4. Enjoy the game!

## Alternative Free Hosting Options

### Backend:
- **Railway**: railway.app (similar to Render)
- **Fly.io**: fly.io
- **Cyclic**: cyclic.sh

### Frontend:
- **Netlify**: netlify.com
- **GitHub Pages**: (with some modifications)
- **Surge.sh**: surge.sh

## Troubleshooting

### WebSocket Connection Issues
- Make sure CORS is properly configured
- Ensure the backend URL in frontend .env is correct
- Check if the backend is running (may take 1-2 minutes to wake up on free tier)

### "Game already started" Error
- Restart the backend service
- Clear browser cache
- Try creating a new room

## Notes for Free Tier
- Render free tier services spin down after 15 minutes of inactivity
- First request after sleeping may take 30-60 seconds
- Consider upgrading to paid tier for production use