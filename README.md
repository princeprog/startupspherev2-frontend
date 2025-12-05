# StartupSphere v2 - Frontend

A modern, interactive web application for discovering, managing, and visualizing startup ecosystems with an immersive 3D map interface.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Dummy Users](#dummy-users)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

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
- **React** `^19.0.0`  
- **React DOM** `^19.0.0`  
- **Vite** `^6.3.3`  

### Routing & State Management
- **React Router DOM** `^7.5.2`  
- **Context API** (built-in)  

### UI & Styling
- **Tailwind CSS** `^4.1.4`  
- **@tailwindcss/vite** `^4.1.4`  
- **Material Tailwind** `^2.1.10`  
- **Flowbite** `^3.1.2`  
- **Flowbite React** `^0.11.7`  
- **DaisyUI** `^5.0.28`  
- **Lucide React** `^0.507.0`  
- **React Icons** `^5.5.0`  

### Maps & Geolocation
- **Mapbox GL** `^3.11.1`  
- **@mapbox/mapbox-gl-geocoder** `^5.0.3`  

### Data Visualization
- **Chart.js** `^4.4.9`  
- **React Chart.js 2** `^5.3.0`  
- **Recharts** `^2.15.3`  

### UI Components & Utilities
- **React Toastify** `^11.0.5`  
- **React Datepicker** `^8.3.0`  
- **Pikaday** `^1.8.2`  
- **Cally** `^0.8.0`  
- **Date-fns** `^4.1.0`  

### PDF Generation
- **jsPDF** `^3.0.1`  
- **jsPDF AutoTable** `^5.0.2`  

### Development Tools
- **ESLint** `^9.22.0`  
- **@eslint/js** `^9.22.0`  
- **eslint-plugin-react-hooks** `^5.2.0`  
- **eslint-plugin-react-refresh** `^0.4.19`  
- **@vitejs/plugin-react** `^4.3.4`  
- **globals** `^16.0.0`  
- **@types/react** `^19.0.10`  
- **@types/react-dom** `^19.0.4`  

## 📦 Prerequisites

- **Node.js** v18.0.0 or higher  
- **npm** v9.0.0 or higher (or **yarn** v1.22.0+)  
- **Git** for version control  
- **PostgreSQL** for backend database  
- **Backend environment ready** (Node.js or Spring Boot)  

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/princeprog/startupspherev2-frontend.git
cd startupspherev2-frontend
````

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env` file in the root:

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_API_BASE_URL=your_backend_api_url
```

4. **SSL Certificates (for HTTPS development)**
   Place the following files in the root:

* `cert.key`
* `cert.crt`
* `ca.crt`

## 💻 Development

### Start Development Server

```bash
npm run dev
```

App runs on `https://localhost:5173`.

### Build Production

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

## 🌐 Deployment

### Frontend Deployment (Vercel / Netlify)

```bash
npm run build
npm i -g vercel
vercel login
vercel --prod
```

Set environment variables in Vercel/Netlify:

| Key                      | Value                                                              |
| ------------------------ | ------------------------------------------------------------------ |
| VITE_MAPBOX_ACCESS_TOKEN | your_mapbox_token                                                  |
| VITE_API_BASE_URL        | [https://your-backend-domain/api](https://your-backend-domain/api) |

### Backend Deployment (Node.js / Spring Boot / PostgreSQL)

**Node.js / Express Example**

```bash
npm install
npm run build
pm2 start dist/server.js
```

**Spring Boot Example**

```bash
./mvnw clean package
java -jar target/app.jar
```

**PostgreSQL Setup Example**

```sql
CREATE DATABASE startupsphere;
CREATE USER sphere_user WITH ENCRYPTED PASSWORD 'sphere_pass';
GRANT ALL PRIVILEGES ON DATABASE startupsphere TO sphere_user;
```

**Backend environment variables**

| Key        | Value             |
| ---------- | ----------------- |
| DB_HOST    | localhost         |
| DB_PORT    | 5432              |
| DB_NAME    | startupsphere     |
| DB_USER    | sphere_user       |
| DB_PASS    | sphere_pass       |
| JWT_SECRET | strong-secret-key |
| SMTP_USER  | your_email        |
| SMTP_PASS  | email_password    |

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

## 👤 Dummy Users

**Public Dummy User**

| Field    | Value                                                     |
| -------- | --------------------------------------------------------- |
| Email    | [dummy@startupsphere.com](mailto:dummy@startupsphere.com) |
| Password | dummy@123                                                 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Private & proprietary. All rights reserved.

## 📧 Contact

For questions or support, contact the development team.

---

**Built with ❤️ by the StartupSphere Team**

```