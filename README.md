# SSDMS Temple Website

श्री समर्थ धोंडुतात्या महाराज मंदिर - Temple Management System

A modern, full-stack temple website with event management, Hindu calendar (Panchang), and donation system.

## Features

### Public Features
- **Homepage** - Temple information, services, upcoming events
- **Panchang Calendar** - Daily Hindu calendar with Tithi, Nakshatra, festivals
- **Events** - View upcoming temple events and festivals
- **Donations** - Online donation with Razorpay integration
- **80G Tax Receipt** - Automatic receipt generation for donations

### Admin Features
- **Dashboard** - Overview of donations, events, statistics
- **Event Management** - Create, edit, delete events
- **Donation Management** - View and manage donations
- **User Management** - Admin user roles and permissions
- **Reports** - Donation and event reports

## Tech Stack

### Frontend (Vite + React)
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- FullCalendar for calendar view
- Lucide React for icons

### Backend (FastAPI + Python)
- FastAPI for REST API
- MongoDB with Motor (async driver)
- Pydantic for data validation
- JWT authentication
- Razorpay integration

## Project Structure

```
ssdms/
├── frontend/               # Vite React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main app component
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/routes/    # API route handlers
│   │   ├── core/          # Config, database
│   │   ├── models/        # Pydantic models
│   │   ├── services/      # Business logic
│   │   └── main.py        # FastAPI app
│   └── requirements.txt
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and Razorpay keys

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Run development server
npm run dev
```

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register admin
- `GET /api/auth/me` - Current user

### Events
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/calendar/:year/:month` - Calendar view

### Donations
- `GET /api/donations` - List donations
- `POST /api/donations` - Create donation
- `POST /api/donations/create-order` - Create Razorpay order
- `POST /api/donations/verify` - Verify payment
- `GET /api/donations/categories` - Get categories

### Panchang
- `GET /api/panchang/today` - Today's Panchang
- `GET /api/panchang/date/:date` - Panchang for date
- `GET /api/panchang/month/:year/:month` - Monthly Panchang
- `GET /api/panchang/festivals/:year` - Annual festivals

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/reports/donations` - Donation reports
- `GET /api/admin/reports/events` - Event reports

## Maharashtra Hindu Calendar

The Panchang service includes:
- Tithi (तिथी) - Lunar day
- Nakshatra (नक्षत्र) - Star constellation
- Yoga (योग) - Auspicious combinations
- Karana (करण) - Half of Tithi
- Rahu Kaal (राहुकाळ) - Inauspicious time
- Sunrise/Sunset times

### Supported Festivals (2024-2025)
- गुढीपाडवा (Gudi Padwa)
- राम नवमी (Ram Navami)
- आषाढी एकादशी (Ashadhi Ekadashi)
- गणेश चतुर्थी (Ganesh Chaturthi)
- नवरात्री (Navratri)
- दिवाळी (Diwali)
- महाशिवरात्री (Mahashivratri)
- And many more...

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=ssdms_temple
SECRET_KEY=your-secret-key
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

---

All rights reserved by the Account Owner.

🙏 जय श्री समर्थ धोंडुतात्या महाराज 🙏
