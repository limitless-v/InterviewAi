# Node.js Dependencies (equivalent to Python requirements.txt)
# This project uses npm for package management

# Frontend (production)
react==18.3.1
react-dom==18.3.1
react-router-dom==7.9.4
react-hot-toast==2.6.0
lucide-react==0.344.0
axios==1.7.7

# Backend (production)
express==4.19.2
cors==2.8.5
express-rate-limit==7.4.0
mongoose==8.6.1
jsonwebtoken==9.0.2
bcryptjs==2.4.3
multer==1.4.5-lts.1
pdf-parse==1.1.1
cloudinary==1.41.3
openai==4.56.0
dotenv==16.4.5

# Development
typescript==5.9.3
ts-node==10.9.2
ts-node-dev==2.0.0
@types/node==20.12.12
@types/express==4.17.21
@types/jsonwebtoken==9.0.6
@types/multer==1.4.12
@types/bcryptjs==2.4.6
@types/cors==2.8.19
@eslint/js==9.9.1
eslint==9.9.1
@vitejs/plugin-react==4.3.1
vite==5.4.2
tailwindcss==3.4.1
postcss==8.4.35
autoprefixer==10.4.18
globals==15.9.0
eslint-plugin-react-hooks==5.1.0-rc.0
eslint-plugin-react-refresh==0.4.11
@types/react==18.3.5
@types/react-dom==18.3.0

# Build Tools
node>=18.0.0
npm>=8.0.0

# Environment Variables Required
# Frontend (.env at project root)
# VITE_API_BASE_URL=http://localhost:8080

# Backend (server/.env)
# PORT=8080
# MONGODB_URI=your_mongodb_uri
# JWT_SECRET=your_jwt_secret
# OPENAI_API_KEY=your_openai_api_key
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
# CLOUDINARY_FOLDER=interviewai
