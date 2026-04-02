# Appifylab Full Stack Engineer Task

## Project Summary
This project converts the provided static **Login**, **Register**, and **Feed** pages into a full stack web application using **Next.js** for the frontend, **Node.js + Express** for the backend, and **MongoDB Atlas** for the database. The original assets and overall design of the provided pages were preserved as required, while the feed was implemented with a stronger focus on functionality.

## What I Built
The application includes:

- User registration with **first name, last name, email, and password**
- Secure login and authenticated access to the feed
- Protected feed route for logged-in users only
- Create post with **text** and optional **image**
- Posts ordered with **newest first**
- **Public** and **private** post visibility
- Like/unlike system for posts
- Comment and reply system
- Like/unlike system for comments and replies
- Display of users who liked a post, comment, or reply

## Tech Stack
- **Frontend:** Next.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Deployment:**
  - Frontend → Vercel
  - Backend → Render
  - Database → MongoDB Atlas

## Project Structure
```text
.
├── frontend/
├── backend/
└── source-static/
```

- `frontend/` contains the Next.js application
- `backend/` contains the Express API and MongoDB models
- `source-static/` keeps the original provided HTML/CSS files for reference

## Main Technical Decisions
### 1. Next.js for frontend
Next.js was used because it satisfies the task requirement and provides a clean structure for routing, protected pages, API proxy routes, and deployment on Vercel.

### 2. Express for backend API
Express was chosen for its simplicity and flexibility in handling authentication, posts, comments, replies, and protected REST-style endpoints.

### 3. MongoDB for flexible content modeling
MongoDB fits this task well because posts, comments, replies, likes, and user data can be modeled efficiently with flexible schemas.

### 4. JWT-based authentication
JWT authentication was used to secure protected routes and API access. This keeps the authentication flow simple and suitable for a separately deployed frontend and backend.

### 5. Single comment model for comments and replies
Replies are handled through the same comment collection using a parentComment field. This reduces duplication and keeps the comment/reply logic simpler.

### 6. Public/private visibility enforced in backend
Post visibility is enforced in the backend query layer so private posts are only returned to their author, while public posts are returned to all authenticated users.

### 7. Feed pagination for scalability
The feed endpoint was updated to support pagination using page and limit parameters. This prevents the application from loading all posts at once and makes feed retrieval more realistic for larger datasets.

### 8. Database indexing for main read paths
Indexes were added on the fields most frequently used for filtering and sorting, such as:

  - post visibility + created time
  - post author + created time
  - comment post + created time
  - reply parent comment + created time

These indexes help reduce query cost and improve feed/comment lookup performance as the dataset grows.

## Security and UX Considerations
- Passwords are hashed before storage
- Protected routes reject unauthenticated requests
- Input validation is applied on auth and post/comment endpoints
- CORS is restricted to the frontend origin
- Security middleware such as Helmet and rate limiting are used in the backend
- Feed results are paginated instead of returning all posts at once
- MongoDB indexes are used on the main read-heavy query paths
- The UI keeps the provided structure while making the feed functionality clear and usable

## API Overview
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
### Posts
- `GET /api/posts?page=1&limit=10`
- `POST /api/posts`
- `POST /api/posts/:postId/like`
### Comments / Replies
- `POST /api/comments/post/:postId`
- `POST /api/comments/:commentId/reply`
- `POST /api/comments/:commentId/like`

## Local Setup
### Backend
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

Run:
```bash
cd backend
npm install
npm run dev
```

### Frontend
Create `frontend/.env.local`:
```env
BACKEND_URL=http://localhost:5000/api
```

Run:
```bash
cd frontend
npm install
npm run dev
```

## Deployment
### Backend
Deploy the backend to **Render** and configure:
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

### Frontend
Deploy the frontend to **Vercel** and configure:
- `BACKEND_URL`

### Database
Use **MongoDB Atlas** free tier for the database.

## Notes / Trade-offs
- The implementation focuses on the required task features only
- Feed design was kept close to the supplied assets, while feed functionality was prioritized as allowed by the task
- Pagination and indexing were added to better align the solution with scalability expectations

## Deliverables
This repository is intended to be submitted with:
- GitHub repository link
- Live deployed URL
- Unlisted/private YouTube walkthrough
