import asyncio
import json
import logging
import time
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import IsolationForest

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fraud-detection")

app = FastAPI(
    title="PhoenixBank Fraud & Anomaly Detection Engine",
    description="AI/ML Anomaly Detection service evaluating transaction risks in real-time.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit log storage for flagged anomalies
ANOMALY_LOGS: List[Dict[str, Any]] = []

# --- Machine Learning Model Setup ---
# Train an IsolationForest model on synthetic normal and anomalous transaction patterns
np.random.seed(42)
normal_txs = np.random.normal(loc=15000, scale=10000, size=(500, 1))
anomalous_txs = np.random.uniform(high=500000, low=200000, size=(30, 1))
X_train = np.vstack([normal_txs, anomalous_txs])

ml_model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
ml_model.fit(X_train)

class TransactionPayload(BaseModel):
    fromAccountId: str
    toAccountId: str
    amount: float

class FraudResponse(BaseModel):
    fromAccountId: str
    toAccountId: str
    amount: float
    risk_score: float
    is_anomaly: bool
    recommendation: str
    timestamp: str

def evaluate_fraud_risk(from_id: str, to_id: str, amount: float) -> Dict[str, Any]:
    # Predict using IsolationForest (-1 for anomaly, 1 for normal)
    pred = ml_model.predict([[amount]])[0]
    raw_score = ml_model.decision_function([[amount]])[0]

    # Convert decision score to normalized risk score (0.0 to 1.0)
    # Lower decision function value means more anomalous
    risk_score = round(float(np.clip(1.0 - (raw_score + 0.5), 0.0, 1.0)), 3)
    
    # Business logic override for extreme transaction amounts (> LKR 200,000)
    if amount > 200000:
        is_anomaly = True
        risk_score = max(risk_score, 0.92)
        recommendation = "BLOCK"
    elif pred == -1 or risk_score > 0.65:
        is_anomaly = True
        recommendation = "REVIEW"
    else:
        is_anomaly = False
        recommendation = "APPROVE"

    result = {
        "fromAccountId": from_id,
        "toAccountId": to_id,
        "amount": amount,
        "risk_score": risk_score,
        "is_anomaly": is_anomaly,
        "recommendation": recommendation,
        "timestamp": datetime.now().isoformat()
    }

    if is_anomaly:
        logger.warning(f"FRAUD ANOMALY DETECTED: Account {from_id} -> {to_id} | Amount: LKR {amount} | Risk: {risk_score}")
        ANOMALY_LOGS.insert(0, result)
        if len(ANOMALY_LOGS) > 100:
            ANOMALY_LOGS.pop()

    return result

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "PhoenixBank Fraud Engine",
        "algorithm": "IsolationForest ML",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/fraud/analyze", response_model=FraudResponse)
def analyze_transaction(payload: TransactionPayload):
    return evaluate_fraud_risk(payload.fromAccountId, payload.toAccountId, payload.amount)

@app.get("/fraud/logs")
def get_anomaly_logs():
    return {
        "total_anomalies_flagged": len(ANOMALY_LOGS),
        "recent_anomalies": ANOMALY_LOGS
    }

# Background Kafka consumer task
async def kafka_consumer_loop():
    await asyncio.sleep(2)
    logger.info("Connecting Kafka Consumer for Fraud Engine...")
    try:
        from kafka import KafkaConsumer
        consumer = KafkaConsumer(
            'transfer-initiated',
            bootstrap_servers=['localhost:9092'],
            auto_offset_reset='latest',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        logger.info("Kafka Fraud Consumer active on topic 'transfer-initiated'!")
        for message in consumer:
            data = message.value
            evaluate_fraud_risk(
                str(data.get("fromAccountId", "unknown")),
                str(data.get("toAccountId", "unknown")),
                float(data.get("amount", 0))
            )
    except Exception as e:
        logger.info(f"Kafka consumer standby (Kafka broker will connect when active): {e}")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(kafka_consumer_loop())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
