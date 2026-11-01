# 🐾 Paw Trails — Backend API

RESTful API backend for **Paw Trails** (Animal Welfare Initiative by CubeWorkSocial).
Built with Node.js, Express, and a high-performance persistent JSON storage engine with zero external database prerequisites.

---

## 🚀 Quick Start

### 1. Installation
In the `backend` folder, dependencies are already installed:
```bash
cd backend
npm install
```

### 2. Run Server
- **Production mode:**
  ```bash
  npm start
  ```
- **Development mode (with auto-reload):**
  ```bash
  npm run dev
  ```

The server will start on **`http://localhost:5000`**.

---

## 🔐 Default Admin Credentials

When the database initializes for the first time, a superadmin account is seeded automatically:

- **Username:** `admin` (or `admin@pawtrails.org`)
- **Password:** `admin123`
- **JWT Header for Protected Endpoints:** `Authorization: Bearer <your_token>`

---

## 📡 API Endpoints Overview

### Health & Information
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api` | Public | API greeting and route directory |
| `GET` | `/api/health` | Public | Service health check and uptime |

---

### 1. Adoption Requests (`/api/adoptions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/adoptions` | Public | Submit an adoption application |
| `GET` | `/api/adoptions` | Admin | List all adoption applications (filter: `?status=pending&search=Bruno`) |
| `GET` | `/api/adoptions/:id` | Admin | Get full details of an application |
| `PATCH`| `/api/adoptions/:id/status` | Admin | Update status (`pending`, `under_review`, `approved`, `rejected`) |
| `DELETE`| `/api/adoptions/:id` | Admin | Delete application |

**Sample Payload (`POST /api/adoptions`):**
```json
{
  "fullName": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "+919876543210",
  "city": "Pune",
  "animalOfInterest": "Bruno",
  "address": "Flat 402, Green Meadows, Kothrud",
  "whyAdopt": "We love indie rescues and have a safe spacious garden.",
  "petExperience": "Had an Indie dog for 10 years.",
  "message": "Excited to meet him!"
}
```

---

### 2. Rescue & Distress Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports` | Public | Report an animal in distress (multipart/form-data with optional `image` file) |
| `GET` | `/api/reports` | Admin | List all rescue reports (filter: `?status=reported&condition=Injured`) |
| `GET` | `/api/reports/:id` | Admin | Get single report details |
| `PATCH`| `/api/reports/:id/status` | Admin | Update status (`reported`, `investigating`, `rescued`, `closed`) |
| `DELETE`| `/api/reports/:id` | Admin | Delete rescue report |

---

### 3. Volunteer Registrations (`/api/volunteers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/volunteers` | Public | Register to volunteer |
| `GET` | `/api/volunteers` | Admin | List all volunteer sign-ups |
| `PATCH`| `/api/volunteers/:id/status` | Admin | Update status (`pending`, `confirmed`, `attended`, `cancelled`) |
| `DELETE`| `/api/volunteers/:id` | Admin | Remove volunteer record |

---

### 4. Contact Inquiries (`/api/contact` or `/api/contacts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contact` | Public | Submit contact message |
| `GET` | `/api/contact` | Admin | View messages (filter: `?status=unread`) |
| `PATCH`| `/api/contact/:id/status` | Admin | Mark as `read` or `replied` |
| `DELETE`| `/api/contact/:id` | Admin | Delete message |

---

### 5. Animals Catalog (`/api/animals`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/animals` | Public | List animals (filter: `?status=available|in-progress|adopted`) |
| `GET` | `/api/animals/:id` | Public | Get single animal profile & story |
| `POST` | `/api/animals` | Admin | Add a new rescued animal (supports photo upload) |
| `PUT` | `/api/animals/:id` | Admin | Edit animal details / update status |
| `DELETE`| `/api/animals/:id` | Admin | Delete animal |

---

### 6. Impact Stats & Dashboard (`/api/stats`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stats` | Public | Returns counters: `animalsFed`, `animalsRescued`, `successfulAdoptions`, `volunteersCount` |
| `GET` | `/api/stats/dashboard` | Admin | Aggregated metrics for Admin Dashboard (counts across all collections) |
| `PUT` | `/api/stats` | Admin | Manually update counter baselines |

---

### 7. Donations (`/api/donations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/donations` | Public | Log a donation intent or UPI payment reference |
| `GET` | `/api/donations` | Admin | View donation ledger & total amount |

---

### 8. Admin Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate admin, returns JWT token |
| `GET` | `/api/auth/me` | Admin | Verify current token and fetch admin profile |
| `PUT` | `/api/auth/password` | Admin | Change admin password |

---

## 📁 Directory Structure
```
backend/
├── config/
│   └── db.js                 # Persistent JSON database with auto-seeding
├── controllers/
│   ├── adoptionController.js
│   ├── animalController.js
│   ├── authController.js
│   ├── contactController.js
│   ├── donationController.js
│   ├── reportController.js
│   ├── statsController.js
│   └── volunteerController.js
├── data/
│   └── pawtrails.json        # Auto-generated database file
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── errorHandler.js       # Centralized error handler
│   └── uploadMiddleware.js   # Multer file upload handler
├── routes/
│   ├── adoptionRoutes.js
│   ├── animalRoutes.js
│   ├── authRoutes.js
│   ├── contactRoutes.js
│   ├── donationRoutes.js
│   ├── reportRoutes.js
│   ├── statsRoutes.js
│   └── volunteerRoutes.js
├── uploads/                  # Directory for uploaded rescue & animal images
├── .env                      # Environment configuration
├── .env.example
├── package.json
├── server.js                 # Application entry point
└── README.md
```
