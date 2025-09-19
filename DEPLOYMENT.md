# GitHub Pages Deployment Guide

## Quick Setup Checklist

### 1. Repository Setup
- [ ] Create a GitHub repository
- [ ] Push your code to the repository
- [ ] Repository name matches the base URL in `vite.config.ts`

### 2. GitHub Pages Configuration
- [ ] Go to repository **Settings** → **Pages**
- [ ] Under **Source**, select **GitHub Actions**
- [ ] Wait for the first deployment to complete

### 3. Access Your Site
Your site will be available at:
`https://YOUR_USERNAME.github.io/monitoring-dashboard/`

## Files Modified for GitHub Pages

### 1. `vite.config.ts`
- Added production base URL configuration
- Optimized build settings with manual chunks
- Added sourcemap configuration

### 2. `src/router/index.ts`
- Configured hash-based routing for production
- Maintains history mode for development

### 3. `.github/workflows/deploy.yml`
- Automated deployment workflow
- Builds and deploys on push to main branch

### 4. `package.json`
- Added deployment scripts:
  - `build:gh-pages` - Production build
  - `build:fast` - Build without type checking
  - `serve:dist` - Preview production build

### 5. `src/vite-env.d.ts`
- Vue component type declarations
- Required for TypeScript compilation

## Commands

```bash
# Development
npm run dev

# Build for GitHub Pages
npm run build:gh-pages

# Preview production build locally
npm run serve:dist

# Type checking only
npm run type-check
```

## Troubleshooting

### Common Issues:

1. **404 on page refresh**
   - Fixed by using hash routing in production

2. **Assets not loading / main.ts not found**
   - Check base URL in `vite.config.ts` matches repository name
   - Ensure `public` directory exists with required assets (vite.svg, etc.)
   - Verify build generates correct paths in `dist/index.html`
   - Run `npm run build:gh-pages` to rebuild with correct paths

3. **Build failures**
   - Use `build:gh-pages` script which skips type checking
   - Check GitHub Actions logs for detailed errors

4. **Local preview not working**
   - Ensure you run `npm run build:gh-pages` first
   - Access the site at `http://localhost:3000/monitoring-dashboard/`

## Demo Credentials

For testing the deployed application:
- **Admin**: admin / admin123
- **User**: user / user123