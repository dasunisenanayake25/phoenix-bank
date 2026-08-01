# PhoenixBank 
**Zero-Trust Banking Architecture & AI Fraud Engine**

PhoenixBank is an enterprise-grade, event-driven banking platform designed for modern security and scalability. Built as a submission for a **DevOps & Security Competition**, this project demonstrates a highly robust microservices architecture leveraging Apache Kafka, HashiCorp Vault, and Machine Learning.

##  Key Features

* **Zero-Trust Security & Key Management**
  * Advanced key management utilizing **Shamir's Secret Sharing (3-of-5 threshold)** via HashiCorp Vault.
  * Strict mobile security policies: Biometric Authentication (Fingerprint/FaceID) enforced on all transactions.
  * OS-level screenshot and screen-recording prevention.

* **Real-time AI Fraud Detection**
  * A dedicated Python (FastAPI) microservice running an **Isolation Forest ML Model** (scikit-learn).
  * Automatically flags anomalies and high-value transactions (> LKR 200,000) for review.

* **Event-Driven Microservices**
  * Decoupled backend architecture powered by **Apache Kafka**.
  * The `transfer-initiated` topic guarantees asynchronous, high-throughput processing between the core ledger and the Fraud Engine.

* **API Gateway & DevOps**
  * Centralized routing using **Kong API Gateway**.
  * Fully containerized stack orchestrated via **Docker Compose**.
  * Continuous Integration (CI) pipeline powered by **GitHub Actions**.

* **Premium User Experience**
  * Responsive Web App (Next.js) and Mobile App (React Native/Expo).
  * "PROSPERUM" inspired Dark Blue & Gold premium corporate UI.

##  Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend (Web)** | React, Next.js, Vanilla CSS |
| **Mobile App** | React Native, Expo |
| **Backend Core** | Node.js, NestJS, PostgreSQL, Redis |
| **AI / Fraud Engine**| Python, FastAPI, scikit-learn, NumPy |
| **DevOps & Infra** | Docker, Docker Compose, GitHub Actions |
| **Security & Bus** | HashiCorp Vault, Apache Kafka, Zookeeper, Kong |

##  Getting Started

### 1. Start the Infrastructure (Docker)
The entire infrastructure (Kafka, Zookeeper, Postgres, Redis, Vault, Kong, and the AI Fraud Engine) is dockerized.
```bash
docker-compose up -d --build
```

### 2. Start the Backend (Core Ledger)
```bash
cd backend
npm install
npm run start:dev
```

### 3. Start the Web Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000` to view the Web App.

### 4. Start the Mobile App
```bash
cd mobile
npm install
npx expo start
```
Use the Expo Go app on your phone or an emulator to scan the QR code.

### 5. Demo Accounts 
For testing and evaluation purposes, you can use the following default demo credentials to log in:
- **Account ID / Email**: `1`
- **Password**: `123`

*(Note: In a production environment, strict password policies and multi-factor authentication are enforced).*

---
*Built by Team Neural Ninjas for the DevOps Competition.*
