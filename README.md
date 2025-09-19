# Monitoring Dashboard Application

This project is a monitoring application dashboard built with Vue 3, TypeScript, and Vite. It includes modules for authentication, a monitoring dashboard, and a knowledge base/FAQ section. The application is designed to provide insights into concurrent users, application uptime, and ticket counts, with a user-friendly interface utilizing Element Plus components.

## 🚀 Live Demo

The application is deployed on GitHub Pages: [View Live Demo](https://YOUR_USERNAME.github.io/monitoring-dashboard/)

## Features

- **Authentication Module**: 
  - User login functionality.
  - Responsive design for authentication pages.

- **Dashboard Module**: 
  - Monitoring iframe to display the monitored website.
  - Stats cards showing real-time data on concurrent users, application uptime, and ticket counts.

- **Knowledge Base/FAQ Module**: 
  - A dedicated section for frequently asked questions to assist users.

## Technologies Used

- Vue 3
- TypeScript
- Vite
- Element Plus
- Bootstrap
- SCSS
- Axios
- Pinia

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd monitoring-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the application.

## Environment Variables

Create a `.env` file in the root directory to define your environment variables. You can also create `.env.development` and `.env.production` for environment-specific configurations.

## Folder Structure

```
monitoring-dashboard
├── src
│   ├── assets
│   ├── components
│   ├── router
│   ├── stores
│   ├── types
│   ├── views
│   ├── services
│   ├── utils
│   ├── App.vue
│   └── main.ts
├── .github/workflows    # GitHub Actions deployment
├── .env
├── .env.development
├── .env.production
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Prerequisites

1. A GitHub repository for your project
2. GitHub Pages enabled in your repository settings

### Setup Instructions

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **Configure repository name (if different):**
   - If your repository name is not `monitoring-dashboard`, update the `base` path in `vite.config.ts`:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/',
   ```

4. **Automatic Deployment:**
   - The GitHub Actions workflow will automatically trigger on pushes to the `main` branch
   - Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Manual Deployment

If you prefer manual deployment:

```bash
# Build for production
npm run build:gh-pages

# The built files will be in the 'dist' directory
# You can then manually upload these to your hosting service
```

### Local Testing of Production Build

To test the production build locally:

```bash
# Build the project
npm run build

# Preview the production build
npm run serve:dist
```

### Deployment Scripts

- `npm run build:gh-pages` - Build for GitHub Pages production
- `npm run deploy` - Alias for build:gh-pages
- `npm run serve:dist` - Preview production build locally

### Troubleshooting

1. **404 errors on page refresh:**
   - The router is configured to use hash mode in production to avoid 404s on GitHub Pages

2. **Assets not loading:**
   - Ensure the `base` URL in `vite.config.ts` matches your repository name

3. **Build failures:**
   - Check the Actions tab in your GitHub repository for detailed error logs
   - Ensure all dependencies are properly listed in `package.json`

### Environment Variables

For GitHub Pages deployment, you may need to set environment variables:
- Create repository secrets in **Settings** → **Secrets and variables** → **Actions**
- Reference them in the GitHub Actions workflow as needed

## License

This project is licensed under the MIT License. See the LICENSE file for details.