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

---

## 🚀 How to Run the Project Locally

To run the entire PhoenixBank suite locally, you will need **Docker** installed and 3 separate terminal instances.

### 1. Start the Infrastructure (Docker)
Ensure your Docker daemon is running, then start the databases and Kafka broker:
```bash
docker compose up -d
```

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
The Next.js frontend runs on Port 4002.
```bash
cd frontend
npm install
npm run dev
```

Navigate to [http://localhost:4002](http://localhost:4002) in your browser to view the PhoenixBank Dashboard!

---

## 🔮 Roadmap

- **Phase 4**: Implement Kong API Gateway and Istio Service Mesh (mTLS).
- **Phase 5**: Build offline-first React Native mobile app & USSD gateway.
- **Phase 6**: Deploy Python AI/ML Anomaly & Fraud Detection Engine.
- **Phase 7**: Master Key Ceremony & HashiCorp Vault Integration.
