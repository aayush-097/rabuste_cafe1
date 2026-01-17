# Cafe-Bot Deployment Guide for Render

This guide walks you through deploying the cafe-bot service on Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A Google Gemini API key (get it from https://makersuite.google.com/app/apikey)
3. Your backend already deployed on Render (for reference)

## Step 1: Prepare Your Repository

The cafe-bot is located at `rabuste_cafe1/cafe-bot/`. Make sure all files are committed to your Git repository.

## Step 2: Create a New Web Service on Render

1. Go to your Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure the service:

### Basic Settings

- **Name**: `cafe-bot` (or any name you prefer)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `rabuste_cafe1/cafe-bot` ⚠️ **IMPORTANT**

### Build & Deploy Settings

- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main.py`

### Environment Variables

Add the following environment variable:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your Google Gemini API key |

**Note**: Render automatically sets the `PORT` environment variable, so you don't need to set it manually.

### Advanced Settings (Optional)

- **Health Check Path**: `/docs` (FastAPI auto-generates this)
- **Auto-Deploy**: `Yes` (deploys on every push)

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies from `requirements.txt`
   - Start the service using `python main.py`
3. Wait for deployment to complete (usually 2-5 minutes)

## Step 4: Get Your Service URL

Once deployed, Render will provide a URL like:
```
https://cafe-bot-xxxx.onrender.com
```

**Save this URL** - you'll need it for the next step.

## Step 5: Update Backend Configuration

Your backend (Express.js) needs to know where the cafe-bot service is located.

1. Go to your **backend service** on Render
2. Add/Update environment variable:

| Key | Value |
|-----|-------|
| `CAFE_BOT_URL` | `https://cafe-bot-xxxx.onrender.com` |

3. The backend code has been updated to use this environment variable (see `backend/src/routes/Chat.js`)

## Step 6: Verify Deployment

1. **Test Cafe-Bot Directly**:
   - Visit: `https://cafe-bot-xxxx.onrender.com/docs`
   - You should see FastAPI's interactive API documentation
   - Try the `/chat/stream` endpoint

2. **Test Through Backend**:
   - Your frontend should now be able to chat with the bot
   - The backend proxies requests from `/api/chat` to the cafe-bot service

## Troubleshooting

### Issue: Service fails to start

**Check logs** in Render dashboard:
- Look for import errors
- Verify `GEMINI_API_KEY` is set correctly
- Check if `storage/cafe_faiss` directory exists (it should be in your repo)

### Issue: "Storage folder missing" error

The FAISS index files must be in your repository:
- Ensure `storage/cafe_faiss/` directory is committed to Git
- Files needed: `index.faiss`, `metadata.jsonl`, `config.json`

### Issue: Backend can't connect to cafe-bot

1. Verify `CAFE_BOT_URL` is set correctly in backend environment variables
2. Check that cafe-bot service is running (not sleeping)
3. On Render free tier, services sleep after 15 min of inactivity
4. First request after sleep may take 30+ seconds

### Issue: CORS errors

The cafe-bot already has CORS configured to allow all origins. If you see CORS errors:
- Check that your backend URL is correct
- Verify the request is going to the right endpoint

## Render Free Tier Limitations

- **Sleep Mode**: Services sleep after 15 minutes of inactivity
- **Cold Start**: First request after sleep takes 30+ seconds
- **Build Time**: Limited build minutes per month

**For Production**: Consider upgrading to a paid plan for:
- Always-on services (no sleep)
- Faster cold starts
- More build minutes

## Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory, and response times
- **Health Checks**: Render automatically checks `/docs` endpoint

## Next Steps

1. ✅ Cafe-bot deployed on Render
2. ✅ Backend configured to use cafe-bot URL
3. ✅ Frontend should now work with the chatbot
4. 🎉 Test the full flow end-to-end!

## Support

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables are set
3. Test endpoints directly using the `/docs` interface
4. Review this guide for common issues
