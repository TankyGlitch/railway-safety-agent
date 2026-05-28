# R.E.A.C.T. AI (Rail Emergency Action & Coordination Tool)

> **R.E.A.C.T. AI:** An intelligent crisis agent built on Google Cloud & MongoDB to instantly freeze transit traffic and seamlessly orchestrate multi-agency emergency rescue operations.

---

## 📌 Project Overview
R.E.A.C.T. AI is a backend emergency orchestration platform designed to handle the critical "golden hour" following a railway incident in India. Instead of relying on manual communication chains, this project integrates an AI agent with live operational databases. The moment an incident is flagged, the agent dynamically triggers backend functions to halt trains in affected sectors, locate nearby hospitals with open trauma beds, and fetch active local emergency frequencies.

## 🛠️ Built With
* **Language:** Python 3.x
* **Database:** MongoDB Atlas (Cloud-hosted JSON document data model)
* **AI Ecosystem:** Google Cloud Platform (Vertex AI architecture via Model Context Protocol tools)
* **Security Layer:** `python-dotenv` for secure local credential isolation

---

## 📂 Repository Structure
```text
├── app.py              # Main application logic and operational emergency tools
├── test_connection.py  # Minimal script verifying the secure handshake with MongoDB
├── .env.example        # Template for required environment variables (keeps secrets secure)
├── .gitignore          # Prevents sensitive files like .env from leaking to GitHub
├── LICENSE             # MIT Open Source License file
└── README.md           # Project documentation (You are here!)
