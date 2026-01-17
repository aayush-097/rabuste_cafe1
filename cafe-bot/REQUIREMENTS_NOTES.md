# Requirements.txt Notes

## Overview

This `requirements.txt` file contains all dependencies needed for the cafe-bot service to run on Render.

## Key Dependencies

### Large Packages (Build Time Considerations)

1. **torch==2.9.1** (~1.5GB)
   - Required by `sentence-transformers`
   - This will significantly increase build time on Render (expect 5-10 minutes)
   - Considered necessary for the RAG functionality

2. **sentence-transformers==5.2.0**
   - Used for embedding user queries
   - Depends on torch, transformers, and other ML libraries

3. **faiss-cpu==1.13.2**
   - Vector search library (CPU version, appropriate for Render)
   - Required for semantic search

### Optional Dependencies

- **pymongo==4.15.5**: Only needed if you want to rebuild the FAISS index on Render. If you only build indexes locally, you can remove this from production.

## Build Time Optimization

If build times are too long on Render, consider:

1. **Use requirements-runtime.txt** (excludes pymongo)
   - Update `render.yaml` build command to: `pip install -r requirements-runtime.txt`

2. **Pre-build Docker image** (advanced)
   - Build a custom Docker image with dependencies pre-installed
   - Use that as base image in Render

3. **Use Render's build cache**
   - Render caches pip packages between builds
   - Subsequent builds will be faster

## Version Compatibility

All versions have been tested together. Key compatibility notes:

- **numpy==2.4.0**: Recent version, compatible with torch 2.9.1
- **fastapi==0.115.0**: Latest stable version
- **uvicorn[standard]==0.32.0**: Includes performance improvements
- **google-genai==1.56.0**: Latest Gemini SDK

## Troubleshooting

### Build Fails with "Out of Memory"
- Render free tier has limited memory
- Consider upgrading to paid tier
- Or reduce dependencies (remove pymongo if not needed)

### Build Timeout
- torch installation can take 5-10 minutes
- Render free tier has build time limits
- Consider using requirements-runtime.txt (smaller, faster)

### Import Errors After Deployment
- Verify all packages are listed
- Check that versions are compatible
- Review deployment logs for specific errors

## Testing Locally

Before deploying, test installation locally:

```bash
cd rabuste_cafe1/cafe-bot
pip install -r requirements.txt
python main.py
```

If this works locally, it should work on Render.
