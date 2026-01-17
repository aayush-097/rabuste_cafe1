# Cafe-Bot Quick Start Guide

## 🚀 Quick Deployment on Render

### 1. Get Your Gemini API Key
- Visit: https://makersuite.google.com/app/apikey
- Create and copy your API key

### 2. Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure:
   - **Name**: `cafe-bot`
   - **Root Directory**: `rabuste_cafe1/cafe-bot` ⚠️ **IMPORTANT**
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
5. Add Environment Variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your API key from step 1
6. Click **"Create Web Service"**
7. Wait 2-5 minutes for deployment
8. Copy your service URL (e.g., `https://cafe-bot-xxxx.onrender.com`)

### 3. Update Backend

1. Go to your **backend service** on Render
2. Add Environment Variable:
   - Key: `CAFE_BOT_URL`
   - Value: Your cafe-bot URL (no trailing slash)
3. Backend will auto-redeploy

### 4. Test

- Visit: `https://cafe-bot-xxxx.onrender.com/docs` (should show API docs)
- Visit: `https://cafe-bot-xxxx.onrender.com/health` (should return `{"status": "healthy"}`)
- Test chatbot in your frontend

## ✅ Done!

Your cafe-bot is now deployed and integrated with your backend.

## 📚 Need More Details?

- Full deployment guide: `DEPLOYMENT.md`
- Complete deployment plan: `../CAFE_BOT_DEPLOYMENT_PLAN.md`
- Service documentation: `README.md`
