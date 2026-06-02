# 🛒 Nexcart — Multi-Vendor E-Commerce Platform

Nexcart is a full-stack, production-ready multi-vendor e-commerce platform designed to simulate real-world online marketplace operations. Built using **Next.js**, **Node.js**, **Express.js**, and **MongoDB**, the platform enables customers to browse and purchase products while providing vendors and administrators with powerful management tools.

The project emphasizes scalability, secure authentication, payment integration, responsive design, and modern deployment practices.

---

## ✨ Key Features

### 👤 Customer Features

* Browse products across multiple categories
* Advanced product search and filtering
* Product details with image galleries
* Shopping cart and wishlist functionality
* Secure checkout experience
* Razorpay payment gateway integration
* Google OAuth authentication
* Responsive mobile-first user interface

---

### 🏪 Vendor Features

* Vendor dashboard
* Product creation, editing, and deletion
* Inventory management
* Order monitoring and management
* Earnings overview

---

### 🛠️ Admin Features

* Category management
* Banner management
* Vendor management
* Product moderation
* Platform-wide order tracking
* User and marketplace administration

---

## 🧱 Technology Stack

### Frontend

* Next.js (App Router)
* TypeScript
* React
* Custom CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication & Security

* JWT Authentication
* Google OAuth 2.0
* Helmet Security Middleware
* Express Rate Limiting
* CORS Protection

### Third-Party Integrations

* Razorpay Payment Gateway
* Cloudinary Media Storage
* Nodemailer Email Services

---

## 📂 Project Structure

```text
Nexcart-Ecommerce-Platform
│
├── backend
│   ├── routes
│   ├── controllers
│   ├── middleware
│   ├── models
│   └── config
│
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   └── public
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=8080

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_PASS=your_email_password

FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url/api

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/alan-j-w/Nexcart-Ecommerce-Platform.git
cd Nexcart-Ecommerce-Platform
```

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:8080
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

## 🌐 Production Deployment

### Frontend Deployment

**Platform:** Vercel

Required Environment Variables:

```env
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_GOOGLE_CLIENT_ID
NEXT_PUBLIC_RAZORPAY_KEY
```

---

### Backend Deployment

**Platform:** Render

Required Environment Variables:

```env
MONGO_URI
JWT_SECRET
GOOGLE_CLIENT_ID
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL_PASS
FRONTEND_URL
```

Production backend includes:

* Helmet security headers
* Rate limiting
* CORS protection
* MongoDB Atlas connectivity
* Cloudinary integration
* Render deployment configuration

---

## 🔒 Security Features

* JWT-based authentication
* Google OAuth login
* Protected admin routes
* Protected vendor routes
* Password hashing using bcrypt
* Helmet security middleware
* API request rate limiting
* Environment-based secret management
* Restricted CORS policy

---

## 📈 Current Status

✅ Customer marketplace implemented

✅ Vendor management implemented

✅ Admin management implemented

✅ Google OAuth authentication

✅ Razorpay payment integration

✅ Cloudinary image hosting

✅ MongoDB Atlas database integration

✅ Vercel frontend deployment

✅ Render backend deployment

🚀 Actively maintained and continuously improved

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Alan Joy Wilson**

Full Stack Developer | MERN Stack | Next.js | Node.js | MongoDB

GitHub: https://github.com/alan-j-w
