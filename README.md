Nexcart — Multi-Vendor E-Commerce Platform

Nexcart is a modern full-stack multi-vendor e-commerce platform built with a scalable architecture using Next.js (frontend) and Node.js/Express (backend). It focuses on real-world usability, clean UI, and production deployment practices.

✨ Features
👤 Customer Experience
Browse products across multiple categories
Search and filter products dynamically
Secure checkout with Razorpay integration
Google OAuth login support
Fully responsive UI (mobile-first design)
🏪 Vendor & Admin
Vendor dashboard for product management
Image upload & optimization using Cloudinary
Admin controls for:
Categories
Banners
Vendors
Order tracking and management
🧱 Tech Stack
Frontend
Next.js (App Router)
TypeScript
CSS (custom styling)
Backend
Node.js + Express.js
MongoDB (Mongoose)
Integrations
Google OAuth 2.0
Razorpay (Payments)
Cloudinary (Media storage)
Deployment
Vercel → Frontend
Railway → Backend
🏗️ Project Structure
/backend   → Express API (auth, products, orders)
/frontend  → Next.js app (UI, client logic)
⚙️ Environment Variables
Backend (/backend/.env)
PORT=8080
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

FRONTEND_URL=http://localhost:3000
Frontend (/frontend/.env)
NEXT_PUBLIC_API_URL=https://your-backend-url/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_RAZORPAY_KEY=your_key
🚀 Getting Started
1. Clone the repo
git clone https://github.com/alan-j-w/Nexcart-Ecommerce-Platform.git
cd Nexcart-Ecommerce-Platform
2. Setup Backend
cd backend
npm install
npm run dev
3. Setup Frontend
cd frontend
npm install
npm run dev
🌐 Deployment
Frontend (Vercel)
Set environment variables:
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_GOOGLE_CLIENT_ID
NEXT_PUBLIC_RAZORPAY_KEY
Backend (Railway)
Add all backend .env variables
Ensure:
app.set("trust proxy", 1);
Enable CORS:
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
⚠️ Known Production Considerations
API calls must run on the client (avoid server-side fetch issues in Next.js)
CORS must match the deployed frontend URL exactly
Google OAuth requires correct redirect URIs in Google Cloud Console
Railway deployments require proper trust proxy configuration
📌 Status

🚧 Actively under development
Core features are implemented and deployed, with ongoing improvements in authentication, performance, and stability.

📄 License

MIT License

👨‍💻 Author

Alan Joy Wilson
