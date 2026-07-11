# PetSneha

PetSneha is a full-stack pet care platform designed for pet owners, veterinarians, and admins. It helps users manage pet health records, appointments, reminders, vet visits, articles, community discussions, and purchases from one place.

##  What PetSneha offers

- Pet profile and medical record management
- Appointment booking and reminder tracking
- Vet directory and booking flow
- Pet-focused articles and community forum
- Online shop for pet products
- Admin and vet dashboards
- Multi-language experience with a modern UI

##  Tech stack

### Frontend
- React + Vite
- React Router
- Tailwind CSS
- i18next for localization
- Vitest + Testing Library for frontend tests

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Multer for uploads
- Jest + Supertest for backend tests

##  Project structure

PetSneha/
├── Backend/
│   ├── src/
│   ├── server.js
│   └── package.json
├── Frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md


## Getting started

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd PetSneha
```

### 2) Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend folder with values similar to:

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/petsneha
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

### 3) Frontend setup

```bash
cd ../Frontend
npm install
```

Start the Vite frontend:

```bash
npm run dev
```

The app should now be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5050

##  Testing

Run backend tests:

```bash
cd Backend
npm test
```

Run frontend tests:

```bash
cd Frontend
npm test
```

##  Screenshots

Here are a few existing app visuals from the project assets:

[PetSneha logo](Frontend/public/logo.png)

[Happy puppy illustration](Frontend/public/happy-puppy.png)

[Security illustration](Frontend/public/shield.png)

[Profile illustration](Frontend/public/profile.png)

##  Notes

- The backend uses JWT-based authentication and protected routes.
- The frontend is organized around pages, reusable UI components, hooks, and shared context.
- The project includes both unit tests and UI/component tests.

