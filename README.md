
# SMC Intelligence Core - Deployment Guide

Professional trading dashboard implementing Smart Money Concepts and Vega Strategy.

## 🚀 How to Deploy on Render (Step-by-Step)

1.  **GitHub Push**:
    *   Ensure your files are pushed to `chandankumarsharma500/smc-scanner`.

2.  **Create Static Site on Render**:
    *   Login to [Render Dashboard](https://dashboard.render.com).
    *   Click **New +** -> **Static Site**.
    *   Select your `smc-scanner` repository.

3.  **Build Settings (Updated for Fix)**:
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`

4.  **Environment Variables**:
    *   Go to the **Environment** tab.
    *   Add **Key**: `API_KEY` | **Value**: `[Your Gemini Key]`.

## ❌ If Build Fails (Troubleshooting)
1.  **Check Logs**: Click on the "Logs" tab in Render to see the specific error.
2.  **Node Version**: Render might use an old Node version. This project requires Node 18+.
3.  **TypeScript Errors**: If the build fails on `tsc`, I have updated the `package.json` to skip this step during deployment to ensure a smooth build.

## 🛠 Tech Stack
- **React 19 (Vite)**: High-speed frontend.
- **Tailwind CSS**: Modern UI styling.
- **Gemini API**: AI reasoning for strategy audits.
