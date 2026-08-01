# 🚀 PhoenixBank

> **A Resilient, Zero-Trust Digital Banking Platform**

Rebuilding trusted digital finance with an isolated microservices architecture, AI-powered fraud detection, and threshold cryptography.

---

## 🏗️ Architecture Overview

PhoenixBank is built using a **Microservices Architecture** with isolated failure domains, ensuring no single compromised service can cascade into a total network shutdown.

### Core Components:

1. **Infrastructure (Docker Compose)**
   - **PostgreSQL**: Isolated ledger database.
   - **Apache Kafka & Zookeeper**: Asynchronous Event Bus connecting microservices.
   - **Redis**: Low-latency session state & caching.
   - **HashiCorp Vault**: Centralized zero-trust secret management.

2. **Frontend Web App (`frontend/`)**
   - **Tech Stack**: Next.js 15, TypeScript, Vanilla CSS.
   - **Features**: Glassmorphism UI dashboard, Member Registration & Login Auth, real-time balance updates, interactive transfers, utility bill payments.

3. **Accounts & Ledger Microservice (`backend/`)**
   - **Tech Stack**: NestJS, TypeORM, PostgreSQL.
   - **Features**: Account management, member registration, auto-seeding initial ledger states, and Kafka consumer processing transfer events atomically.

4. **Payments Microservice (`payments/`)**
   - **Tech Stack**: NestJS, Kafka Client.
   - **Features**: Isolated payment processing microservice. Exposes `POST /payments/transfer`, validates requests, and publishes `transfer-initiated` events to Kafka.

5. **AI/ML Fraud & Anomaly Engine (`fraud-detection/`)**
   - **Tech Stack**: Python, FastAPI, Scikit-Learn (`IsolationForest`), Kafka Consumer.
   - **Features**: Real-time Machine Learning transaction scoring to detect high-risk anomalies, rapid velocity transfers, and suspicious transaction patterns.

6. **Security & Master Key Ceremony (`security/`)**
   - **Tech Stack**: Python, HashiCorp Vault REST API.
   - **Features**: 3-of-5 Shamir's Secret Sharing threshold scheme for splitting the Root Master Key into 5 shares and unsealing Vault KV secrets securely.

7. **API Gateway (`kong/`)**
   - **Tech Stack**: Kong (DB-less mode).
   - **Features**: Single entry point for all client requests (`http://localhost:8000`), configured with Rate-Limiting plugin (20 req/min) for DDoS protection.

8. **Mobile App (`mobile/`)**
   - **Tech Stack**: React Native (Expo).
   - **Features**: Offline-first mobile banking application using `AsyncStorage` for cached balances during network or gateway outages.

---

## 🛡️ Security & Zero-Trust Best Practices

- **Zero-Trust Access**: All client applications route strictly through the Kong API Gateway (`http://localhost:8000`). Direct microservice exposure is blocked in production.
- **Threshold Cryptography**: Root Master Key is governed by a 3-of-5 Shamir's Secret Sharing scheme (`security/key_ceremony.py`). No single administrator holds full system access.
- **Environment Confidentiality**: Production database and JWT secrets are managed via HashiCorp Vault. Raw credentials must never be hardcoded or committed to version control.

---

## 🚀 How to Run the Project Locally

### 1. Start Infrastructure (Docker)
Ensure Docker Desktop is running:
```bash
docker compose up -d
```
*(Starts Postgres, Redis, Zookeeper, Kafka, Kong API Gateway, and HashiCorp Vault)*

### 2. Start the Accounts Ledger (Terminal 1)
```bash
cd backend
npm install
npm run start:dev
```
*(Runs on Port 4001 and connects to PostgreSQL)*

### 3. Start the Payments Service (Terminal 2)
```bash
cd payments
npm install
npm run start:dev
```
*(Runs on Port 4003 and acts as Kafka Producer)*

### 4. Start the AI/ML Fraud Detection Engine (Terminal 3)
```bash
cd fraud-detection
pip install -r requirements.txt
python main.py
```
*(Runs on Port 5000 and scores transactions in real time)*

### 5. Start the Web Dashboard (Terminal 4)
```bash
cd frontend
npm install
npm run dev
```
Navigate to [http://localhost:4002](http://localhost:4002).

### 6. Start the Mobile App (Terminal 5)
```bash
cd mobile
npm install
npm start
```
Press `w` in the terminal to view in browser or scan QR code using **Expo Go**.

### 7. Perform Master Key Ceremony (Security CLI)
```bash
python security/key_ceremony.py --generate
python security/key_ceremony.py --unseal <share1> <share2> <share3>
```

---

## 🔮 Completed Roadmap

- **✅ Phase 1 - 3**: Accounts, Next.js Frontend, Payments Microservice (Kafka)
- **✅ Phase 4**: Kong API Gateway & Zero-Trust Rate Limiting
- **✅ Phase 5**: Offline-first React Native mobile app with AsyncStorage
- **✅ Phase 6**: Python AI/ML Anomaly & Fraud Detection Engine (IsolationForest)
- **✅ Phase 7**: Master Key Ceremony (3-of-5 Shamir's Secret Sharing) & HashiCorp Vault Integration
