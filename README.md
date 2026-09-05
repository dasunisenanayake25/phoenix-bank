# PhoenixBank 
**Zero-Trust Banking Architecture & AI Fraud Engine**

PhoenixBank is an enterprise-grade, event-driven banking platform designed for modern security and scalability. Built as a submission for a **DevOps & Security Competition**, this project demonstrates a highly robust microservices architecture leveraging Apache Kafka, HashiCorp Vault, and Machine Learning.

## Key Features

* **Zero-Trust Security & Key Management**
  * **Advanced Key Management** utilizing **Shamir's Secret Sharing (3-of-5 threshold)** via HashiCorp Vault. The master key is split among 5 custodians and reconstructed securely in-memory only for signing, preventing a single point of compromise.
  * **Strict mobile security policies**: Biometric Authentication (Fingerprint/FaceID) enforced on all transactions.
  * **Data Security**: Secure credential rotation, secure CI/CD pipelines, and comprehensive Trivy scanning to enforce zero vulnerabilities.

* **Real-time AI Fraud Detection**
  * A dedicated Python (FastAPI) microservice running an **Isolation Forest ML Model** (scikit-learn).
  * Automatically flags anomalies and high-value transactions for manual review.

* **Event-Driven Microservices**
  * Decoupled backend architecture powered by **Apache Kafka**.
  * The `transfer-initiated` topic guarantees asynchronous, high-throughput processing between the core ledger, payments service, and the Fraud Engine.

* **API Gateway & DevOps**
  * Centralized routing using **Kong API Gateway**.
  * Fully containerized stack orchestrated via **Docker Compose**.
  * Continuous Integration (CI) pipeline powered by **GitHub Actions** with automated testing and Trivy security scanning.

* **Premium User Experience**
  * Responsive Web App (Next.js) and Mobile App (React Native/Expo).
  * "PROSPERUM" inspired Dark Blue & Gold premium corporate UI.

## Future Roadmap (Next Level DevOps)
While the current architecture is production-ready, we have identified the following enhancements for scaling and enterprise-level observability:
1. **Kubernetes (K8s) Migration**: Transitioning from Docker Compose to Helm Charts for automated orchestration, self-healing, and auto-scaling of the microservices.
2. **Observability Stack**: Integrating Prometheus & Grafana for real-time monitoring of Kafka queue depths, AI Fraud Engine metrics, and Node.js performance.
3. **Infrastructure as Code (IaC)**: Implementing Terraform scripts to automatically provision the required cloud infrastructure (VPCs, VM clusters, managed DBs).
4. **Chaos Engineering & Load Testing**: Utilizing tools like k6 to simulate massive transaction spikes, ensuring the Kafka message bus gracefully handles high throughput.
5. **Advanced API Gateway Configs**: Enforcing strict Rate Limiting and WAF (Web Application Firewall) IP restrictions at the Kong API Gateway level to mitigate DDoS attacks.

## Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend (Web)** | React, Next.js, Vanilla CSS |
| **Mobile App** | React Native, Expo |
| **Backend Core** | Node.js, NestJS, PostgreSQL, Redis |
| **AI / Fraud Engine**| Python, FastAPI, scikit-learn, NumPy |
| **DevOps & Infra** | Docker, Docker Compose, GitHub Actions |
| **Security & Bus** | HashiCorp Vault, Apache Kafka, Zookeeper, Kong |

## Getting Started

### 1. Start the Secure Infrastructure
The entire secure infrastructure (Kafka, Zookeeper, Postgres, Redis, Vault, Kong, AI Fraud Engine, and microservices) is orchestrated using Docker Compose.

```bash
# Bring up the complete secure stack
docker-compose -f docker-compose.secure.yml up -d --build
```

### 2. Manual Local Development (Optional)

If you prefer to run the Node.js microservices manually for debugging:

**Backend (Core Ledger)**
```bash
cd backend
npm install
npm run start:dev
```

**Payments Service**
```bash
cd payments
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
- **Account ID / Email**: `test@example.com`
- **Password**: `correcthorsebatterystaple`

*(Note: In a production environment, strict password policies, Vault key management, and multi-factor authentication are enforced).*

---
*Built by Team Neural Ninjas for the DevOps Competition.*