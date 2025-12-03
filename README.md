# StartupSphere v2 - Frontend

A modern, interactive web application for discovering, managing, and visualizing startup ecosystems with an immersive 3D map interface.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

StartupSphere v2 is a comprehensive platform that enables users to explore startups and stakeholders in an interactive 3D environment. The application provides powerful tools for startup management, visualization, and ecosystem mapping with geolocation capabilities.

## ✨ Features

- **Interactive 3D Map**: Explore startups on an immersive 3D map powered by Mapbox GL
- **Startup Management**: Add, update, and manage startup profiles with detailed information
- **Stakeholder Browser**: Connect and manage relationships with stakeholders
- **Dashboard Analytics**: Visualize startup metrics with interactive charts
- **CSV Import**: Bulk upload startup data via CSV files
- **Location-Based Search**: Advanced geocoding and location picking capabilities
- **Notifications System**: Real-time notifications for important updates
- **Bookmarks**: Save and organize favorite startups
- **Authentication & Security**: Protected routes with email verification
- **Responsive Design**: Modern UI with Tailwind CSS and Material Tailwind
- **PDF Export**: Generate reports using jsPDF

## 🛠️ Tech Stack

### Core Framework
- **React** `^19.0.0` - UI library for building component-based interfaces
- **React DOM** `^19.0.0` - React rendering for web applications
- **Vite** `^6.3.3` - Next-generation frontend build tool

### Routing & State Management
- **React Router DOM** `^7.5.2` - Declarative routing for React applications
- **Context API** - Built-in state management solution

### UI & Styling
- **Tailwind CSS** `^4.1.4` - Utility-first CSS framework
- **@tailwindcss/vite** `^4.1.4` - Tailwind CSS integration for Vite
- **Material Tailwind** `^2.1.10` - Material Design components for React
- **Flowbite** `^3.1.2` - Component library built on Tailwind CSS
- **Flowbite React** `^0.11.7` - React components for Flowbite
- **DaisyUI** `^5.0.28` - Component library for Tailwind CSS
- **Lucide React** `^0.507.0` - Beautiful & consistent icon toolkit
- **React Icons** `^5.5.0` - Popular icon library for React

### Maps & Geolocation
- **Mapbox GL** `^3.11.1` - Interactive, customizable maps
- **@mapbox/mapbox-gl-geocoder** `^5.0.3` - Location search and geocoding

### Data Visualization
- **Chart.js** `^4.4.9` - Simple yet flexible JavaScript charting
- **React Chart.js 2** `^5.3.0` - React wrapper for Chart.js
- **Recharts** `^2.15.3` - Composable charting library for React

### UI Components & Utilities
- **React Toastify** `^11.0.5` - Toast notifications for React
- **React Datepicker** `^8.3.0` - Date picker component
- **Pikaday** `^1.8.2` - Lightweight date picker
- **Cally** `^0.8.0` - Calendar component
- **Date-fns** `^4.1.0` - Modern JavaScript date utility library

### PDF Generation
- **jsPDF** `^3.0.1` - Client-side PDF generation
- **jsPDF AutoTable** `^5.0.2` - Table plugin for jsPDF

### Development Tools
- **ESLint** `^9.22.0` - JavaScript linting utility
- **@eslint/js** `^9.22.0` - ESLint JavaScript configurations
- **eslint-plugin-react-hooks** `^5.2.0` - ESLint rules for React Hooks
- **eslint-plugin-react-refresh** `^0.4.19` - ESLint plugin for React Fast Refresh
- **@vitejs/plugin-react** `^4.3.4` - Official Vite plugin for React
- **globals** `^16.0.0` - Global identifiers for JavaScript environments
- **@types/react** `^19.0.10` - TypeScript definitions for React
- **@types/react-dom** `^19.0.4` - TypeScript definitions for React DOM

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/princeprog/startupspherev2-frontend.git
   cd startupspherev2-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with necessary API keys:
   ```env
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   VITE_API_BASE_URL=your_backend_api_url
   ```

4. **SSL Certificates (for HTTPS development)**
   Ensure you have the following certificate files in the root directory:
   - `cert.key` - SSL private key
   - `cert.crt` - SSL certificate
   - `ca.crt` - Certificate authority

## 💻 Development

### Start Development Server
```bash
npm run dev
```
The application will run on `https://localhost:5173` with HTTPS enabled.

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## 📁 Project Structure

```
startupspherev2-frontend/
├── public/                      # Static assets
│   └── startupsphere-csv-input2.csv
├── src/
│   ├── 3dmap/                   # 3D map components
│   │   ├── EditLocationMap.jsx
│   │   └── Startupmap.jsx
│   ├── assets/                  # Images, fonts, etc.
│   ├── components/              # Reusable UI components
│   │   ├── Card.jsx
│   │   ├── CardContent.jsx
│   │   ├── StakeholderBrowser.jsx
│   │   └── StakeholderLocationPicker.jsx
│   ├── context/                 # React Context providers
│   │   └── SidebarContext.jsx
│   ├── modals/                  # Modal components
│   │   ├── DashboardVerification.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Verification.jsx
│   ├── Notifications/           # Notification components
│   │   └── Notification.jsx
│   ├── pages/                   # Page components
│   │   ├── PrivacyPolicy.jsx
│   │   └── TermsAndConditions.jsx
│   ├── security/                # Authentication & authorization
│   │   └── ProtectedRoute.jsx
│   ├── sidebar/                 # Sidebar components
│   │   ├── Bookmarks.jsx
│   │   └── Sidebar.jsx
│   ├── startup/                 # Startup-related components
│   │   ├── AddMethodModal.jsx
│   │   ├── AllStartupDashboard.jsx
│   │   ├── CsvUploadPage.jsx
│   │   ├── Startupadd.jsx
│   │   ├── StartupDashboard.jsx
│   │   ├── StartupDetail.jsx
│   │   ├── StartupReviewSelection.jsx
│   │   ├── UpdateStartup.jsx
│   │   └── UpdateStartupAlternative.jsx
│   ├── App.jsx                  # Main App component
│   ├── App.css                  # App styles
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── eslint.config.js             # ESLint configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── vite.config.js               # Vite configuration
├── vercel.json                  # Vercel deployment config
├── package.json                 # Project dependencies
└── README.md                    # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 📧 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ by the StartupSphere Team**
