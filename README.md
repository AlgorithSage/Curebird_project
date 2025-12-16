# 🏥 Curebird - Medical Portfolio & AI Health Analytics

Curebird is a modern, full-stack medical portfolio application that combines secure health record management with advanced AI analytics. It features real-time disease intelligence, prescription analysis, and a comprehensive personal health dashboard.

![Curebird Dashboard](public/logo.png)

## 🌟 Key Features

### 👤 Personal Medical Portfolio
- **Secure Dashboard**: Manage your health records, appointments, and medications.
- **Visual Analytics**: Track your vital signs and health trends over time.
- **Document Storage**: Securely store and organize your medical reports.

### 🧠 Cure Analyzer (AI-Powered)
- **Prescription Analysis**: Upload prescription images to extract medicines and instructions.
- **AI Intelligence**: Powered by Google Gemini AI and Tesseract OCR.
- **Disease Detection**: automatically identifies potential conditions mentioned in reports.

### 📊 Cure Stat (Disease Intelligence)
- **Real-Time Trends**: Visualizes disease outbreaks across India using government data.
- **Interactive Heatmap**: Geographic distribution of diseases via Google Maps.
- **Research Metrics**: Detailed demographics, recovery rates, and medication trends.
- **Risk Analysis**: AI-driven risk assessment (High/Medium/Low) for various regions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)
- Google Cloud API Key (for Maps & AI)
- Tesseract OCR (installed on system)

### 1️⃣ Installation

**Clone the repository:**
```bash
git clone https://github.com/yourusername/curebird.git
cd curebird
```

**Install Frontend Dependencies:**
```bash
npm install
```

**Install Backend Dependencies:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2️⃣ Configuration

**Frontend Setup:**
Create a `.env.local` file in the root directory:
```env
# Google Maps API Key for Heatmap
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here

# Backend API URL
REACT_APP_API_URL=http://127.0.0.1:5001
```

**Backend Setup:**
Create a `.env` file in the `backend` directory:
```env
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_key

# India Gov Data API Key
DATA_GOV_API_KEY=your_gov_data_key
```

### 3️⃣ Running the Application

**Start Backend Server:**
```bash
cd backend
python run.py
# Server runs on http://127.0.0.1:5001
```

**Start Frontend Application:**
```bash
# In a new terminal
npm start
# Application opens at http://localhost:3000
```

---

## 🛠️ Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Flask, Pandas, Python
- **AI/ML**: Google Gemini 2.0, Tesseract OCR
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication

## 🔐 Security
- Environment variables for sensitive keys.
- Firebase security rules for data protection.
- Client-side data processing for privacy.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
