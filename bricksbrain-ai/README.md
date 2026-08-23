# BricksBrain AI 🧠🏠

An AI-powered real estate platform — React + Tailwind frontend, Node.js/Express backend,
MongoDB database, and a Python/FastAPI microservice for all the machine-learning features.
Visual style is inspired by 99acres.com (red/white theme, card-based listings).

## What's included

| Feature | How it's implemented |
|---|---|
| ML price prediction | `RandomForestRegressor` (scikit-learn) trained on a generated 6,000-row synthetic Indian real-estate dataset |
| Future price forecasting | **ARIMA** (statsmodels) + a **neural forecaster** — full LSTM if TensorFlow is installed, otherwise an automatic lightweight MLP fallback so the feature works out of the box |
| Personalized recommendations | Content-based filtering (cosine similarity over property feature vectors + user preferences/history) |
| Area Intelligence | Per-locality walk/safety/connectivity scores, schools/hospitals count, 5yr price growth |
| Google Maps | Live embed if you add an API key, graceful fallback link otherwise |
| Property comparison | Compare up to 4 properties side-by-side |
| EMI calculator | Real amortization math with year-by-year schedule chart |
| AI chatbot | Intent-classification + slot-extraction NLU (regex/keyword based, no external API key required) |
| 3D Digital Twin | Interactive procedural building model rendered with Three.js — drag to rotate, auto-rotate, scales to the property's BHK/area |
| Auth | JWT (httpOnly cookie + bearer token), bcrypt password hashing, role-based access (user/admin) |
| Dashboards | User dashboard (saved properties, recommendations, preferences) + Admin dashboard (stats, charts, recent activity) |

This is a **complete, runnable demo build**. The ML models are trained on realistic
*synthetic* data (documented in `ai-service/train.py`) since no proprietary MLS dataset
is bundled — swap in real listing data any time by replacing the training CSV.

---

## Project structure

```
bricksbrain-ai/
├── backend/            Node.js + Express REST API
│   ├── config/db.js
│   ├── models/          User.js, Property.js  (Mongoose)
│   ├── controllers/      auth, property, chat, admin
│   ├── routes/
│   ├── middleware/       auth (JWT), error handler
│   ├── seed.js           seeds 120 demo properties + demo/admin users
│   └── server.js
├── ai-service/          Python + FastAPI ML microservice
│   ├── main.py            API endpoints
│   ├── train.py           generates dataset + trains price model
│   ├── models/
│   │   ├── price_predictor.py   RandomForest price prediction
│   │   ├── forecast.py          ARIMA + LSTM/MLP forecasting
│   │   ├── recommender.py       content-based recommendation engine
│   │   └── chatbot.py           intent-based chat NLU
│   └── data/               generated CSVs (dataset + price history)
├── frontend/            React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/          Home, Listings, PropertyDetail, Dashboard, AdminDashboard, ...
│       ├── components/     Navbar, PropertyCard, Chatbot, DigitalTwin3D, MapView, EMICalculator, CompareTable
│       ├── context/        AuthContext
│       └── api/axios.js
└── docker-compose.yml   optional one-command startup for all 4 services
```

---

## Quick start (local, no Docker)

### 1. MongoDB
Run MongoDB locally (`mongod`) or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 2. AI/ML service (Python)
```bash
cd ai-service
pip install -r requirements.txt
python train.py          # generates dataset + trains the price model (~30s, pre-trained artifacts already included)
uvicorn main:app --reload --port 8000
```
Optional — for a real LSTM instead of the automatic MLP fallback:
```bash
pip install tensorflow-cpu
```

### 3. Backend (Node.js)
```bash
cd backend
cp .env.example .env     # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed              # populates 120 demo properties + demo/admin accounts
npm run dev                # http://localhost:5000
```

### 4. Frontend (React)
```bash
cd frontend
cp .env.example .env      # optionally add a Google Maps API key
npm install
npm run dev                 # http://localhost:5173
```

Open **http://localhost:5173** — the app is fully functional end-to-end.

### Demo logins (created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@bricksbrain.ai | admin123 |
| User | demo@bricksbrain.ai | demo1234 |

---

## Quick start (Docker)

```bash
docker compose up --build
```
This starts MongoDB, the AI service, the backend, and the frontend together.
Then run the seed script once inside the backend container:
```bash
docker compose exec backend npm run seed
```

---

## Environment variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bricksbrain
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=            # optional — leave blank to use the built-in fallback map link
```

---

## Key API endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/properties                 (filters: city, propertyType, listingType, bhk, minPrice, maxPrice, sort, page)
GET    /api/properties/featured
GET    /api/properties/:id
POST   /api/properties/:id/save        (toggle wishlist)
POST   /api/properties/compare         { ids: [...] }
GET    /api/properties/recommendations (auth required)
POST   /api/properties/predict-price   -> proxies to AI service
POST   /api/properties/forecast        -> proxies to AI service (ARIMA + LSTM)
POST   /api/properties/emi

POST   /api/chat                        -> proxies to AI chatbot

GET    /api/admin/stats                (admin only)
```

AI microservice (FastAPI, auto docs at `http://localhost:8000/docs`):
```
POST /predict-price
POST /forecast-price
POST /recommend
POST /chatbot
```

---

## Notes & next steps for production

- The ML price model is trained on **synthetic** data for demo purposes — retrain
  `ai-service/train.py` against real listing data for production accuracy.
- The chatbot uses rule-based intent classification (fast, free, no API key). To upgrade
  it to a generative LLM, swap the internals of `generate_reply()` in `chatbot.py` to call
  an LLM API using the extracted intent/slots as context.
- The 3D Digital Twin is a procedurally generated massing model (walls/floors/roof scaled
  to BHK & area) rather than a true BIM/CAD twin — swap in a GLTF/GLB model loader in
  `DigitalTwin3D.jsx` if you have real 3D scans per property.
- Add rate limiting / stricter CORS and rotate `JWT_SECRET` before deploying publicly.
