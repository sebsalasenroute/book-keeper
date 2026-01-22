# TaxFlow - Accounting Office Dashboard

AI-powered internal accounting dashboard for Canadian tax preparation with CRA-aligned categorization.

![Dashboard Preview](https://via.placeholder.com/800x400?text=TaxFlow+Dashboard)

## Features

- 🏢 **Firm Workspace** - Multi-client management with role-based access
- 📄 **Document Ingestion** - PDF, CSV, XLSX, image support with OCR
- 🤖 **AI Categorization** - Automatic transaction classification with CRA codes
- ✅ **Review Workflow** - Approve, reject, split transactions with keyboard shortcuts
- 📊 **Reports** - Generate client review packages and exports
- 🔧 **Rules Engine** - Teach AI with merchant→category mappings

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
npm run build
```

---

## 🚀 Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/taxflow-dashboard)

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

### Option 3: Via GitHub Integration

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/taxflow-dashboard.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Click "Deploy"

3. **Automatic Deployments:**
   - Every push to `main` triggers a production deployment
   - Pull requests get preview deployments

---

## Project Structure

```
taxflow-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── AccountingOfficeDashboard.jsx  # Main dashboard component
│   ├── dashboard.css                   # All styles
│   ├── App.jsx                         # App wrapper
│   ├── main.jsx                        # React entry point
│   └── index.css                       # Global reset
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Lucide React** - Icon library
- **CSS Variables** - Theming system

## Environment Variables

For production features, create a `.env` file:

```env
VITE_API_URL=https://api.yourbackend.com
VITE_OPENAI_API_KEY=sk-...  # For AI features
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `⌘K` | Global search |
| `⌘1` | Dashboard |
| `⌘2` | Clients |
| `⌘3` | Transaction Review |
| `↑↓` | Navigate transactions |
| `A` | Approve transaction |
| `C` | Change category |
| `S` | Split transaction |
| `Q` | Add question |

## CRA Category Codes

The dashboard includes a complete CRA-aligned category system:

- **Income:** T4, T2125, T776, T5, Schedule 3
- **Expenses:** Lines 8521-9270 (Advertising through Other)
- **Personal:** Medical, Donations, Tuition, RRSP
- **Flags:** 50% meal limitation, km log required, mixed-use

## License

MIT © 2024

---

## Support

For issues or feature requests, please open a GitHub issue.
