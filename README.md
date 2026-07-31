# 🚀 PhoenixBank

> **A Resilient, Zero-Trust Digital Banking Platform**

Rebuilding trusted digital finance after the Super Malware Agent disaster of 2065 — engineered so it can never happen again.

---

## 🏗️ Architecture Overview

PhoenixBank has been entirely rebuilt using a **Microservices Architecture** with isolated failure domains, ensuring that no single compromised service can cascade into a total network shutdown.

### Core Components Built So Far:

1. **Infrastructure (Docker Compose)**
   - **PostgreSQL**: Serving as the isolated ledger database.
   - **Apache Kafka & Zookeeper**: The asynchronous Event Bus connecting our microservices.
   - **Redis**: Low-latency caching and session state.

2. **Frontend Web App (`frontend/`)**
   - **Tech Stack**: Next.js 15, TypeScript, Vanilla CSS.
   - **Features**: Premium Glassmorphism dashboard, real-time balance fetching, offline-ready foundations.

3. **Accounts & Ledger Microservice (`backend/`)**
   - **Tech Stack**: NestJS, TypeORM.
   - **Features**: PostgreSQL-backed account entity, exposes REST endpoints, and operates as a **Kafka Consumer** to process incoming transfer events atomically.

4. **Payments Microservice (`payments/`)**
   - **Tech Stack**: NestJS, Kafka Client.
   - **Features**: A fully isolated service. Exposes a `POST /payments/transfer` API. It validates requests and publishes a `transfer-initiated` event to Kafka without synchronously blocking the ledger.

5. **API Gateway (`kong/`)**
   - **Tech Stack**: Kong (DB-less mode).
   - **Features**: Single entry point for all frontend/mobile requests (Port 8000), configured with a strict Rate-Limiting plugin (20 req/min) for DDoS protection.

6. **Mobile App (`mobile/`)**
   - **Tech Stack**: React Native (Expo).
   - **Features**: Offline-first mobile banking application using `AsyncStorage`. Shows cached balances when the network or Gateway is down.

---

## 🚀 How to Run the Project Locally

To run the entire PhoenixBank suite locally, you will need **Docker** installed and 4 separate terminal instances.

### 1. Start the Infrastructure (Docker)
Ensure your Docker daemon is running. This starts Postgres, Redis, Zookeeper, Kafka, and the **Kong API Gateway**:
```bash
docker compose up -d
```
*(Kong will run on `http://localhost:8000` and act as the single entry point)*

### 2. Start the Accounts Ledger (Terminal 1)
This service connects to Postgres and listens to Kafka events on Port 4001.
```bash
cd backend
npm install
npm run start:dev
```

### 3. Start the Payments Service (Terminal 2)
This service acts as the Kafka Producer on Port 4003.
```bash
cd payments
npm install
npm run start:dev
```

### 4. Start the Frontend Dashboard (Terminal 3)
The Next.js frontend runs on Port 4002 and connects via Kong API Gateway.
```bash
cd frontend
npm install
npm run dev
```
Navigate to [http://localhost:4002](http://localhost:4002) in your browser.

### 5. Start the Mobile App (Terminal 4)
The React Native mobile app features offline caching.
```bash
cd mobile
npm install
npm start
```
Press `w` in the terminal to view in your web browser, or scan the QR code with the **Expo Go** app on your phone (Remember to update `localhost` in `App.js` to your PC's IP address if using a physical phone).

---

## 🔮 Roadmap

- **✅ Phase 1 - 3**: Accounts, Next.js Frontend, Payments Microservice (Kafka)
- **✅ Phase 4**: Kong API Gateway & Zero-Trust Routing.
- **✅ Phase 5**: Offline-first React Native mobile app.
- **⏳ Phase 6**: Deploy Python AI/ML Anomaly & Fraud Detection Engine.
- **⏳ Phase 7**: Master Key Ceremony & HashiCorp Vault Integration.
