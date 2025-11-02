# 🧠 Backend Architecture Decision Log — Aragon.ai Technical Challenge (Updated)

## Context
This log documents the design decisions and tradeoffs made while planning the **image upload & validation backend** for the Aragon.ai technical challenge.  
The primary goal was to deliver a **secure, scalable, production-aligned system** within a **3-hour implementation window**.  
Early discussions focused on upload strategies (direct backend vs presigned URLs), and later evolved to include storage selection, async processing, and concurrency handling.

---

## 1️⃣ Initial Scope Discussion
**Faraz:**  
“What are the main backend mechanisms we actually need — just upload and validation?”

**ChatGPT:**  
Outlined backend responsibilities:
- Upload & retrieval APIs  
- Validation pipeline  
- Metadata persistence (PostgreSQL + Prisma)  
- Optional async job system  
- Logging, error handling, and health checks  

**Outcome:**  
We established that core backend responsibilities are **upload**, **validation**, **metadata persistence**, and **asynchronous processing**.

---

## 2️⃣ Upload Architecture
**Faraz:**  
“Can we upload directly from the UI to the storage (R2 or S3) using presigned URLs?”

**ChatGPT:**  
Confirmed that **presigned direct-to-storage uploads** are production best practice.  
This offloads bandwidth from the backend, improves scalability, and allows independent validation.

**Outcome:**  
Adopted **presigned URL flow**:  
1. `POST /uploads/sign` → returns presigned PUT URL + imageId.  
2. Client PUTs to storage (Cloudflare R2).  
3. Client calls `POST /uploads/complete` → backend verifies and triggers validation.

---

## 3️⃣ Tradeoff Analysis — Direct Upload vs Presigned
| Aspect | Presigned URL Flow | Direct Backend Upload |
|---------|--------------------|-----------------------|
| Scalability | ✅ Excellent — client→storage | ❌ Limited by backend bandwidth |
| Implementation Time | ⚠️ Slightly longer | ✅ Quicker |
| Control & Validation | ✅ Requires verification step | ✅ Full control inline |
| Production Fit | ✅ Industry-standard | ⚠️ MVP-only |

**Decision:**  
Use **presigned URLs** — slightly more setup, but shows production-grade architecture and scalability.

---

## 4️⃣ Verification Strategy
**Faraz:**  
“What if the client says upload complete but the object isn’t visible yet? Fail or retry?”

**ChatGPT:**  
Explored options:  
1. Fail immediately → fast but harsh UX.  
2. Retry verification → best tradeoff.  
3. Event-driven (webhooks) → ideal for long-term scalability.

**Decision:**  
✅ **Option 2 – Retry verification** with 3 attempts (5–15s delay).  
This tolerates eventual consistency on R2/S3 and improves reliability.

---

## 5️⃣ Async Processing Decision
**Faraz:**  
“Should we use BullMQ, SQS, or something else for background validation?”

**ChatGPT:**  
Critically compared options:
- **BullMQ (Redis)** → easy to set up, persistent retries, good local dev.
- **AWS SQS** → robust but heavy IAM setup and slower to integrate.
- **In-process queue** → fast but no durability.

**Decision:**  
✅ **BullMQ + Redis** — ideal balance of simplicity, reliability, and time-to-implement.  
SQS was dropped due to setup overhead and low visible benefit in an interview demo.

---

## 6️⃣ State Machine & Concurrency
**Faraz:**  
“What’s the lifecycle of an image? How do we handle two workers trying to update the same record?”

**ChatGPT:**  
Designed a clear, auditable state machine:  
`AWAITING_UPLOAD → VERIFYING → PROCESSING → ACCEPTED | REJECTED | UPLOAD_FAILED | ERROR`  

To prevent race conditions:
- **Deduplicate jobs** via `jobId=imageId` in BullMQ.  
- **Atomic conditional updates** (`WHERE id=imageId AND status=expected`) for safe state transitions.  
- **Idempotent worker logic** and transactional final writes.

**Outcome:**  
Guaranteed that each image is processed exactly once, safely retried if needed, and resilient to duplicate deliveries.

---

## 7️⃣ Storage & Infra Tradeoffs
**Faraz:**  
“Should we use AWS S3 instead of Cloudflare R2?”

**ChatGPT:**  
Compared both:
- **S3:** Better for deep AWS integrations (Rekognition, Lambda).  
- **R2:** Cheaper, simpler, S3-compatible, no egress cost, faster to set up.

**Decision:**  
✅ **Cloudflare R2** — chosen for simplicity and alignment with project time constraints, while keeping S3 compatibility for future migration.

---

## 8️⃣ Final Architecture Summary
- **Storage:** Cloudflare R2 (S3 API, presigned PUT URLs)  
- **Database:** PostgreSQL + Prisma (atomic transitions, strong consistency)  
- **Queue:** BullMQ + Redis (retry, delay, visibility)  
- **Concurrency Control:** DB-level conditional updates + job deduplication  
- **Workers:** Idempotent validation pipeline (safe re-runs)  
- **Validation:** Format, size, resolution, pHash, blur & face stubs  
- **UI:** React (converted from Aragon HTML) — mirrors original visual design  

---

## ✅ Final Outcome
This architecture is:
- **Scalable** — client→storage uploads, async workers  
- **Reliable** — verified uploads, retries, idempotent jobs  
- **Extensible** — can swap R2 → S3 or BullMQ → SQS later  
- **Realistic** — production patterns under interview constraints  
- **Demonstrative** — clearly shows backend craftsmanship and tradeoff reasoning

---
