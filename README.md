<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HR Helper App

This contains everything you need to run your app locally and deploy it.

## 🚀 Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Environment Variables:
   Copy `.env.example` to `.env.local` and set the `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env.local
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## 📦 Build for Production

To build the static files for production, run:
```bash
npm run build
```
The output will be in the `dist` directory.

## 🌐 Deploy to GitHub Pages

This project is configured with a GitHub Action to automatically deploy to GitHub Pages whenever you push to the `main` or `master` branch.

**Setup Instructions:**
1. Go to your GitHub repository settings.
2. Navigate to **Pages** on the left sidebar.
3. Under **Build and deployment**, set the Source to **GitHub Actions**.
4. Push your code to the `main` or `master` branch, and the workflow (`deploy.yml`) will automatically build and deploy your app.
