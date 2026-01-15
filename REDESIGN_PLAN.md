# Sri Samrath Dhandutatya Maharaj Temple - Website Redesign Plan

## Executive Summary

This document outlines a comprehensive plan to transform the current static temple website into a full-featured web application with event management, Hindu calendar integration (Panchang), donation system, and admin dashboard tailored for Maharashtra region temples.

---

## 1. Current State Analysis

### Existing Technology Stack
- **Frontend:** Bootstrap 5, Vanilla JS, jQuery
- **Styling:** SCSS/CSS with custom temple theme
- **Libraries:** Owl Carousel, WOW.js, Animate.css
- **Backend:** None (static site)
- **Database:** None

### Existing Features
- Homepage with temple information
- Services showcase (भक्तनिवास, अन्नछत्रालय, सुलभ दर्शन)
- Village information (डोंगरशेळकी)
- Team/Committee display
- Testimonials
- Contact form (non-functional)

### Limitations
- No dynamic content management
- No event scheduling
- No donation/payment system
- No admin panel
- Contact form doesn't work

---

## 2. Proposed Technology Stack

### Frontend
| Technology | Purpose | Reason |
|------------|---------|--------|
| **React.js** or **Next.js** | Frontend framework | Component-based, SEO-friendly (Next.js), better state management |
| **Tailwind CSS** + Bootstrap | Styling | Modern utility-first CSS while preserving existing design |
| **FullCalendar.js** | Event calendar | Industry-standard, supports custom rendering |
| **React-Datepicker** | Date selection | Configurable for Hindu calendar |

### Backend
| Technology | Purpose | Reason |
|------------|---------|--------|
| **Node.js + Express** | API Server | JavaScript consistency, excellent ecosystem |
| **MongoDB** | Database | Flexible schema for events, donations |
| **Mongoose** | ODM | Easy data modeling and validation |
| **JWT** | Authentication | Secure admin access |

### Alternative: Full-Stack Framework
| Technology | Purpose | Reason |
|------------|---------|--------|
| **Next.js 14+** | Full-stack | API routes + frontend, simplified deployment |
| **Prisma** | ORM | Type-safe database access |
| **PostgreSQL** | Database | ACID compliance for financial transactions |

### Payment Integration
| Service | Use Case | Features |
|---------|----------|----------|
| **Razorpay** (Primary) | Indian payments | UPI, Cards, NetBanking, 80G receipts |
| **PayU** (Alternative) | Backup gateway | Wide bank support |
| **PhonePe/Paytm** | UPI Direct | Popular in Maharashtra |

---

## 3. Feature Modules

### Module 1: Hindu Calendar (Panchang) Integration

#### 3.1.1 Core Features
- **Tithi Display:** शुक्ल/कृष्ण पक्ष (Shukla/Krishna Paksha)
- **Nakshatra:** Current star position
- **Muhurat Times:** शुभ मुहूर्त for darshan, puja
- **Sunrise/Sunset:** Based on temple location coordinates
- **Rahu Kaal:** Daily inauspicious time periods
- **Festivals:** Maharashtra-specific Hindu festivals

#### 3.1.2 Maharashtra-Specific Events (Marathi Calendar)
```
| Month (मराठी) | Major Festivals |
|---------------|-----------------|
| चैत्र         | गुढीपाडवा, राम नवमी |
| वैशाख        | अक्षय्य तृतीया, बुद्ध पौर्णिमा |
| ज्येष्ठ       | वट पौर्णिमा |
| आषाढ         | आषाढी एकादशी (पंढरपूर) |
| श्रावण        | नाग पंचमी, रक्षाबंधन, गोकुळाष्टमी |
| भाद्रपद      | गणेश चतुर्थी, अनंत चतुर्दशी |
| आश्विन       | नवरात्री, दसरा, कोजागिरी पौर्णिमा |
| कार्तिक      | दिवाळी, तुलसी विवाह, कार्तिकी एकादशी |
| मार्गशीर्ष    | दत्त जयंती |
| पौष          | मकर संक्रांति |
| माघ          | महाशिवरात्री |
| फाल्गुन      | होळी, रंगपंचमी |
```

#### 3.1.3 Panchang API Options
1. **Prokerala API** - Comprehensive Panchang data
2. **AstroSage API** - Free tier available
3. **Custom Calculation** - Swiss Ephemeris library
4. **Drik Panchang** - Web scraping (last resort)

#### 3.1.4 Data Model - Panchang
```javascript
{
  date: Date,
  tithi: {
    name: String,        // "एकादशी"
    paksha: String,      // "शुक्ल पक्ष"
    endTime: Date
  },
  nakshatra: {
    name: String,        // "रोहिणी"
    endTime: Date
  },
  yoga: String,
  karana: String,
  sunrise: Date,
  sunset: Date,
  moonrise: Date,
  rahuKaal: {
    start: Date,
    end: Date
  },
  location: {
    city: "Dongarshelsoki",
    state: "Maharashtra",
    coordinates: [lat, lng]
  }
}
```

---

### Module 2: Event Calendar System

#### 3.2.1 Event Types
| Type | Description | Example |
|------|-------------|---------|
| **नित्य कार्यक्रम** | Daily rituals | काकड आरती, महाआरती |
| **साप्ताहिक** | Weekly events | गुरुवार भजन, सत्संग |
| **मासिक** | Monthly events | पौर्णिमा पूजा, एकादशी |
| **वार्षिक उत्सव** | Annual festivals | यात्रा, जयंती, पुण्यतिथी |
| **विशेष कार्यक्रम** | Special events | सत्यनारायण पूजा, लग्न |

#### 3.2.2 Event Data Model
```javascript
{
  _id: ObjectId,
  title: {
    marathi: String,     // "महाशिवरात्री महोत्सव"
    english: String      // "Mahashivratri Festival"
  },
  description: {
    marathi: String,
    english: String
  },
  eventType: Enum,       // DAILY, WEEKLY, MONTHLY, ANNUAL, SPECIAL
  category: Enum,        // PUJA, UTSAV, KIRTAN, PRAVACHAN, SEVA

  // Timing
  startDate: Date,
  endDate: Date,
  startTime: String,     // "06:00"
  endTime: String,       // "08:00"
  isAllDay: Boolean,

  // Recurrence
  recurrence: {
    type: Enum,          // NONE, DAILY, WEEKLY, MONTHLY, YEARLY
    daysOfWeek: [Number],// [0, 4] for Sunday, Thursday
    dayOfMonth: Number,
    tithiBasedDate: {    // For lunar calendar events
      tithi: String,     // "एकादशी"
      paksha: String,    // "शुक्ल"
      month: String      // "आषाढ" (optional for annual)
    }
  },

  // Location
  venue: String,         // "मुख्य मंदिर", "सभा मंडप"

  // Media
  images: [String],

  // Registration
  requiresRegistration: Boolean,
  maxParticipants: Number,
  registrationDeadline: Date,
  registrationFee: Number,

  // Prasad/Seva
  prasadAvailable: Boolean,
  sevaOptions: [{
    name: String,        // "अभिषेक"
    amount: Number,      // 251
    description: String
  }],

  // Status
  status: Enum,          // DRAFT, PUBLISHED, CANCELLED, COMPLETED
  isFeatured: Boolean,

  // Meta
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.2.3 Calendar Views
1. **Monthly Calendar** - Grid view with events
2. **Weekly View** - Detailed schedule
3. **Daily View** - All events for a day
4. **List View** - Upcoming events list
5. **Panchang View** - Calendar with tithi/nakshatra overlay

---

### Module 3: Donation & Payment System

#### 3.3.1 Donation Categories
| Category (मराठी) | English | Purpose |
|------------------|---------|---------|
| **सामान्य देणगी** | General Donation | Temple maintenance |
| **अन्नदान** | Food Donation | भोजन प्रसाद for devotees |
| **गोसेवा** | Cow Service | Goshala maintenance |
| **विद्यादान** | Education | Student scholarships |
| **औषधसेवा** | Medical Aid | Health camps |
| **मंदिर जीर्णोद्धार** | Temple Renovation | Construction/repairs |
| **उत्सव प्रायोजकत्व** | Festival Sponsorship | Event sponsorship |
| **नित्य पूजा** | Daily Puja | Regular worship expenses |

#### 3.3.2 Seva Options (Bookable Services)
```
| Seva | Amount (₹) | Description |
|------|------------|-------------|
| महाअभिषेक | 1,100 | Grand abhishek with full ritual |
| रुद्राभिषेक | 501 | Rudra puja with 11 priests |
| सत्यनारायण पूजा | 751 | Full Satyanarayan katha |
| अर्चना | 51 | Basic archana |
| महाप्रसाद | 251 | Special prasad booking |
| अन्नदान (50 भक्त) | 5,000 | Feed 50 devotees |
| अन्नदान (100 भक्त) | 10,000 | Feed 100 devotees |
| दीप दान | 21 | Light a lamp |
```

#### 3.3.3 Donation Data Model
```javascript
{
  _id: ObjectId,

  // Donor Info
  donor: {
    name: String,
    email: String,
    phone: String,
    address: String,
    panNumber: String,    // For 80G receipt
    isAnonymous: Boolean
  },

  // Donation Details
  category: String,
  subcategory: String,
  amount: Number,
  currency: "INR",

  // Dedication
  inMemoryOf: String,     // "स्व. श्री..."
  occasion: String,       // "जन्मदिन", "पुण्यतिथी"

  // Payment
  paymentMethod: Enum,    // UPI, CARD, NETBANKING, CASH, CHEQUE
  paymentGateway: String, // "razorpay", "payu"
  transactionId: String,
  paymentStatus: Enum,    // PENDING, SUCCESS, FAILED, REFUNDED

  // Receipt
  receiptNumber: String,  // "SSDM-2024-00001"
  receiptGenerated: Boolean,
  receipt80G: Boolean,
  receiptUrl: String,

  // Meta
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.3.4 Payment Gateway Integration (Razorpay)

```javascript
// Backend: Create Order
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function createDonationOrder(amount, donorInfo) {
  const order = await razorpay.orders.create({
    amount: amount * 100, // in paise
    currency: "INR",
    receipt: `donation_${Date.now()}`,
    notes: {
      donor_name: donorInfo.name,
      category: donorInfo.category,
      temple: "SSDM_Temple"
    }
  });
  return order;
}

// Frontend: Payment Modal
const options = {
  key: RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: "INR",
  name: "श्री समर्थ धोंडुतात्या महाराज मंदिर",
  description: "Temple Donation",
  image: "/img/temple-logo.png",
  order_id: order.id,
  handler: function(response) {
    verifyPayment(response);
  },
  prefill: {
    name: donor.name,
    email: donor.email,
    contact: donor.phone
  },
  theme: {
    color: "#EAA636" // Temple primary color
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

#### 3.3.5 80G Tax Receipt Generation
- Auto-generate PDF receipts for donations
- Include temple's 80G registration number
- PAN verification for donations > ₹2,000
- Email receipt to donor automatically

---

### Module 4: Admin Dashboard

#### 3.4.1 Admin Roles
| Role | Permissions |
|------|-------------|
| **Super Admin** | All access, user management |
| **Temple Manager** | Events, donations, reports |
| **Content Editor** | Website content, gallery |
| **Seva Coordinator** | Seva bookings, schedules |
| **Accountant** | Donation reports, receipts |

#### 3.4.2 Admin Features

##### Dashboard Overview
- Today's events
- Recent donations (last 7 days)
- Upcoming festivals
- Total donations this month
- Visitor statistics

##### Event Management
- Create/Edit/Delete events
- Bulk event creation (recurring)
- Event registration management
- Send notifications to registered users
- Event photo gallery upload

##### Donation Management
- View all donations
- Filter by date, category, amount
- Export to Excel/PDF
- Generate 80G receipts
- Refund processing
- Donor directory

##### Content Management
- Edit homepage sections
- Manage team members
- Update services information
- Photo gallery management
- Testimonials moderation

##### Reports & Analytics
- Daily/Weekly/Monthly donation reports
- Event attendance reports
- Category-wise donation breakdown
- Year-over-year comparison
- Custom date range reports

#### 3.4.3 Admin User Model
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,       // bcrypt hashed
  role: Enum,

  profile: {
    name: String,
    phone: String,
    designation: String   // "मंदिर व्यवस्थापक"
  },

  permissions: {
    events: { create, read, update, delete },
    donations: { create, read, update, delete },
    content: { create, read, update, delete },
    users: { create, read, update, delete },
    reports: { read, export }
  },

  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

---

## 4. Database Schema (MongoDB)

### Collections Overview
```
├── users              # Admin users
├── donors             # Donor profiles
├── donations          # All donations
├── events             # Calendar events
├── eventRegistrations # Event sign-ups
├── sevaBookings       # Seva reservations
├── panchang           # Cached Panchang data
├── content            # CMS content blocks
├── gallery            # Photo albums
├── notifications      # Push/Email notifications
├── auditLogs          # Admin action logs
```

### Key Indexes
```javascript
// Donations - for quick lookups
db.donations.createIndex({ createdAt: -1 });
db.donations.createIndex({ "donor.email": 1 });
db.donations.createIndex({ category: 1, createdAt: -1 });
db.donations.createIndex({ paymentStatus: 1 });

// Events - for calendar queries
db.events.createIndex({ startDate: 1, endDate: 1 });
db.events.createIndex({ eventType: 1, status: 1 });
db.events.createIndex({ "recurrence.tithiBasedDate.tithi": 1 });
```

---

## 5. API Endpoints Design

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
```

### Events
```
GET    /api/events                    # List events
GET    /api/events/:id               # Get event details
GET    /api/events/calendar/:year/:month  # Monthly calendar
GET    /api/events/upcoming          # Next 30 days
POST   /api/events                   # Create event (admin)
PUT    /api/events/:id               # Update event (admin)
DELETE /api/events/:id               # Delete event (admin)
POST   /api/events/:id/register      # User registration
```

### Donations
```
GET    /api/donations                # List donations (admin)
GET    /api/donations/:id           # Get donation details
POST   /api/donations/create-order   # Create Razorpay order
POST   /api/donations/verify         # Verify payment
GET    /api/donations/receipt/:id    # Download receipt
GET    /api/donations/categories     # List categories
```

### Panchang
```
GET    /api/panchang/today          # Today's Panchang
GET    /api/panchang/:date          # Specific date
GET    /api/panchang/month/:year/:month  # Monthly data
GET    /api/panchang/festivals/:year # Annual festivals
```

### Admin
```
GET    /api/admin/dashboard          # Dashboard stats
GET    /api/admin/reports/donations  # Donation reports
GET    /api/admin/reports/events     # Event reports
POST   /api/admin/users              # Create admin user
GET    /api/admin/audit-logs         # Activity logs
```

---

## 6. UI/UX Design Guidelines

### Design Principles
1. **Mobile-First:** 70%+ traffic from mobile devices
2. **Marathi-First:** Primary language, English secondary
3. **Accessible:** Large fonts, high contrast for elderly users
4. **Fast Loading:** Optimize for rural 3G/4G networks
5. **Offline Support:** PWA for basic functionality

### Color Palette (Existing + Enhanced)
```css
:root {
  /* Primary - Temple Gold */
  --primary: #EAA636;
  --primary-light: #F5C75D;
  --primary-dark: #C4881F;

  /* Secondary - Temple Red/Orange */
  --secondary: #D35400;
  --secondary-light: #E67E22;

  /* Accent - Spiritual Colors */
  --saffron: #FF6B35;
  --vermillion: #E63946;
  --sandalwood: #F4A261;

  /* Neutrals */
  --dark: #1E1916;
  --light: #FDF5EB;
  --cream: #FFF8F0;

  /* Functional */
  --success: #2ECC71;
  --warning: #F39C12;
  --error: #E74C3C;
}
```

### Typography
```css
/* Marathi Text */
font-family: 'Noto Sans Devanagari', 'Mukta', sans-serif;

/* English Text */
font-family: 'Playfair Display', serif; /* Headings */
font-family: 'Roboto', sans-serif;      /* Body */
```

### Key UI Components

#### Event Calendar Card
```
┌─────────────────────────────────────┐
│  📅 आषाढी एकादशी                    │
│  17 जुलै 2024 (बुधवार)              │
│  शुक्ल पक्ष एकादशी                   │
├─────────────────────────────────────┤
│  ⏰ सकाळी 5:00 - रात्री 10:00       │
│  📍 मुख्य मंदिर                      │
├─────────────────────────────────────┤
│  [नोंदणी करा]  [अधिक माहिती]         │
└─────────────────────────────────────┘
```

#### Donation Form
```
┌─────────────────────────────────────┐
│         🙏 देणगी द्या 🙏             │
├─────────────────────────────────────┤
│  देणगी प्रकार: [▼ सामान्य देणगी   ] │
│                                     │
│  रक्कम:  ○ ₹101  ○ ₹251  ○ ₹501    │
│          ○ ₹1,001  ○ इतर [____]    │
│                                     │
│  नाव: [____________________]        │
│  फोन: [____________________]        │
│  ईमेल: [___________________]        │
│                                     │
│  □ अज्ञात राहू इच्छितो              │
│  □ 80G पावती हवी (PAN आवश्यक)      │
│                                     │
│  [═══════ देणगी द्या ═══════]       │
└─────────────────────────────────────┘
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Core Setup)
- [ ] Set up Next.js project with TypeScript
- [ ] Configure MongoDB database
- [ ] Implement authentication system
- [ ] Create base UI components
- [ ] Set up CI/CD pipeline

### Phase 2: Calendar & Events
- [ ] Integrate Panchang API
- [ ] Build event calendar component
- [ ] Create event CRUD for admin
- [ ] Implement event registration
- [ ] Add tithi-based recurring events

### Phase 3: Donations & Payments
- [ ] Integrate Razorpay gateway
- [ ] Build donation form
- [ ] Implement 80G receipt generation
- [ ] Create donation reports
- [ ] Add seva booking system

### Phase 4: Admin Dashboard
- [ ] Build admin authentication
- [ ] Create dashboard overview
- [ ] Implement event management
- [ ] Add donation management
- [ ] Build report generation

### Phase 5: Content & Polish
- [ ] Migrate existing content
- [ ] Build CMS for content editing
- [ ] Implement gallery management
- [ ] Add multilingual support
- [ ] Performance optimization

### Phase 6: Launch & Maintenance
- [ ] Security audit
- [ ] Load testing
- [ ] User acceptance testing
- [ ] Documentation
- [ ] Training for temple staff
- [ ] Go-live

---

## 8. Third-Party Services & APIs

### Required Services
| Service | Purpose | Cost |
|---------|---------|------|
| **Razorpay** | Payment gateway | 2% per transaction |
| **MongoDB Atlas** | Database hosting | Free tier / $9+/month |
| **Vercel/Railway** | App hosting | Free tier / $20+/month |
| **SendGrid/Resend** | Email service | Free tier / $20+/month |
| **Cloudinary** | Image hosting | Free tier / $89+/month |

### Panchang API Options
| API | Features | Cost |
|-----|----------|------|
| **Prokerala** | Full Panchang | $10-50/month |
| **AstroSage** | Basic Panchang | Free/Premium |
| **Drik Panchang** | Reference data | Free (scraping) |
| **Custom (Swiss Ephemeris)** | Self-calculated | Free (open source) |

---

## 9. Security Considerations

### Data Protection
- [ ] Encrypt sensitive data (PAN, payment info)
- [ ] Implement HTTPS everywhere
- [ ] Secure API endpoints with JWT
- [ ] Input validation and sanitization
- [ ] SQL/NoSQL injection prevention

### Payment Security
- [ ] PCI DSS compliance (via Razorpay)
- [ ] Never store card details
- [ ] Verify webhook signatures
- [ ] Implement refund controls
- [ ] Audit trail for all transactions

### Admin Security
- [ ] Strong password requirements
- [ ] Two-factor authentication (optional)
- [ ] Role-based access control
- [ ] Session timeout
- [ ] Activity logging

---

## 10. Mobile App Considerations (Future)

### PWA Features (Immediate)
- Installable on home screen
- Offline calendar access
- Push notifications for events
- Fast loading on slow networks

### Native App (Future)
- React Native for iOS/Android
- Shared codebase with web
- Native payment integrations
- Calendar sync with device

---

## 11. File Structure (Proposed Next.js Project)

```
/ssdms-temple/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Homepage
│   │   ├── about/page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx             # Event list
│   │   │   └── [id]/page.tsx        # Event details
│   │   ├── calendar/page.tsx        # Full calendar
│   │   ├── donate/page.tsx          # Donation page
│   │   ├── services/page.tsx
│   │   ├── gallery/page.tsx
│   │   └── contact/page.tsx
│   ├── admin/
│   │   ├── layout.tsx               # Admin layout
│   │   ├── page.tsx                 # Dashboard
│   │   ├── events/page.tsx
│   │   ├── donations/page.tsx
│   │   ├── content/page.tsx
│   │   └── users/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── donations/
│   │   ├── panchang/
│   │   └── admin/
│   └── layout.tsx
├── components/
│   ├── ui/                          # Base components
│   ├── calendar/
│   │   ├── EventCalendar.tsx
│   │   ├── PanchangDisplay.tsx
│   │   └── EventCard.tsx
│   ├── donation/
│   │   ├── DonationForm.tsx
│   │   ├── SevaSelector.tsx
│   │   └── PaymentModal.tsx
│   └── admin/
│       ├── Sidebar.tsx
│       ├── DataTable.tsx
│       └── Charts.tsx
├── lib/
│   ├── db.ts                        # Database connection
│   ├── auth.ts                      # Auth utilities
│   ├── panchang.ts                  # Panchang calculations
│   └── razorpay.ts                  # Payment utilities
├── models/
│   ├── User.ts
│   ├── Event.ts
│   ├── Donation.ts
│   └── Panchang.ts
├── public/
│   ├── img/
│   └── fonts/
├── styles/
│   └── globals.css
└── package.json
```

---

## 12. Success Metrics

### Key Performance Indicators (KPIs)
| Metric | Target |
|--------|--------|
| Online donations | 50+ per month |
| Event registrations | 100+ per month |
| Website visitors | 1000+ per month |
| Mobile usage | 70%+ |
| Page load time | < 3 seconds |
| Donation conversion | > 5% |

---

## 13. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment failures | High | Multiple gateway fallback |
| Server downtime | High | Cloud hosting with redundancy |
| Data breach | Critical | Encryption, security audits |
| Low adoption | Medium | User training, simple UX |
| API rate limits | Medium | Caching, fallback data |

---

## 14. Next Steps

### Immediate Actions
1. **Finalize technology choices** - Confirm Next.js + MongoDB stack
2. **Set up development environment** - Initialize project
3. **Razorpay account setup** - Complete KYC for payment gateway
4. **Panchang API evaluation** - Test and select API provider
5. **Design mockups** - Create Figma/wireframe designs

### Questions to Resolve
1. Domain hosting preferences?
2. Budget for third-party services?
3. Priority features for MVP?
4. Staff training requirements?
5. Existing donor/event data to migrate?

---

## Appendix A: Maharashtra Hindu Festival Calendar 2024-25

| Festival | Marathi Month | Tithi | Gregorian Date |
|----------|---------------|-------|----------------|
| गुढीपाडवा | चैत्र | शु. प्रतिपदा | April 9, 2024 |
| राम नवमी | चैत्र | शु. नवमी | April 17, 2024 |
| हनुमान जयंती | चैत्र | शु. पौर्णिमा | April 23, 2024 |
| अक्षय्य तृतीया | वैशाख | शु. तृतीया | May 10, 2024 |
| वट पौर्णिमा | ज्येष्ठ | शु. पौर्णिमा | June 21, 2024 |
| आषाढी एकादशी | आषाढ | शु. एकादशी | July 17, 2024 |
| गुरु पौर्णिमा | आषाढ | शु. पौर्णिमा | July 21, 2024 |
| नाग पंचमी | श्रावण | शु. पंचमी | Aug 9, 2024 |
| रक्षाबंधन | श्रावण | शु. पौर्णिमा | Aug 19, 2024 |
| गोकुळाष्टमी | श्रावण | कृ. अष्टमी | Aug 26, 2024 |
| गणेश चतुर्थी | भाद्रपद | शु. चतुर्थी | Sep 7, 2024 |
| अनंत चतुर्दशी | भाद्रपद | शु. चतुर्दशी | Sep 17, 2024 |
| नवरात्री प्रारंभ | आश्विन | शु. प्रतिपदा | Oct 3, 2024 |
| दसरा | आश्विन | शु. दशमी | Oct 12, 2024 |
| कोजागिरी पौर्णिमा | आश्विन | शु. पौर्णिमा | Oct 17, 2024 |
| धनत्रयोदशी | कार्तिक | कृ. त्रयोदशी | Oct 29, 2024 |
| लक्ष्मीपूजन | कार्तिक | अमावस्या | Nov 1, 2024 |
| बलिप्रतिपदा | कार्तिक | शु. प्रतिपदा | Nov 2, 2024 |
| भाऊबीज | कार्तिक | शु. द्वितीया | Nov 3, 2024 |
| तुलसी विवाह | कार्तिक | शु. एकादशी | Nov 12, 2024 |
| कार्तिकी एकादशी | कार्तिक | शु. एकादशी | Nov 12, 2024 |
| दत्त जयंती | मार्गशीर्ष | शु. पौर्णिमा | Dec 14, 2024 |
| मकर संक्रांति | पौष | - | Jan 14, 2025 |
| महाशिवरात्री | माघ | कृ. चतुर्दशी | Feb 26, 2025 |
| होळी | फाल्गुन | शु. पौर्णिमा | Mar 14, 2025 |
| रंगपंचमी | फाल्गुन | कृ. पंचमी | Mar 18, 2025 |

---

## Appendix B: Glossary

| Term | Meaning |
|------|---------|
| तिथी (Tithi) | Lunar day in Hindu calendar |
| पक्ष (Paksha) | Fortnight - शुक्ल (bright) or कृष्ण (dark) |
| नक्षत्र (Nakshatra) | Lunar mansion / star constellation |
| मुहूर्त (Muhurat) | Auspicious time period |
| पंचांग (Panchang) | Hindu almanac with 5 elements |
| सेवा (Seva) | Religious service / ritual |
| प्रसाद (Prasad) | Sacred food offering |
| आरती (Aarti) | Ritual of worship with light |
| अभिषेक (Abhishek) | Sacred bathing ritual |
| दर्शन (Darshan) | Viewing/visiting deity |

---

*Document Version: 1.0*
*Created: January 2026*
*Project: SSDMS Temple Website Redesign*
