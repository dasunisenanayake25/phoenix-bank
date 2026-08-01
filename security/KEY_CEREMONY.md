# Key Ceremony - Shamir's Secret Sharing

This document outlines the zero-trust Key Ceremony implementation in PhoenixBank, leveraging **Shamir's Secret Sharing (SSS)**.

## Threat Model & Motivation
In a zero-trust banking architecture, the Master Signing Key (used to digitally sign immutable audit ledger entries) represents the ultimate root of trust. If this key is compromised, an attacker could forge legitimate-looking audit trails for fraudulent transactions.

To mitigate this risk:
1. **No Single Point of Compromise**: The master key is never stored in its entirety on disk, in a database, or in an environment variable.
2. **Threshold Cryptography**: We use Shamir's Secret Sharing with a 3-of-5 threshold. The master key is mathematically split into 5 distinct "shares".
3. **Distributed Trust**: The 5 shares are distributed to 5 independent Key Custodians (e.g., C-level executives or security officers). 
4. **Ephemeral Memory Storage**: The key is only reconstructed in memory for the precise moment a batch of ledger entries needs to be signed, and then explicitly zeroed out and discarded.

## How to Demo the Key Ceremony

### 1. Setup & Generation (One-Time)
Run the offline key generation script. This simulates the initial trusted setup where the key is generated and split.
```bash
cd backend
node scripts/generate-shares.js
```
The script will output 5 hexadecimal shares. Distribute these to your demo participants (or copy them for testing).
*Note: The generated key and shares are strictly for demo purposes and are never committed to source control.*

### 2. Execution
1. Navigate to the Admin UI: `http://localhost:3000/admin/key-ceremony`
2. Obtain 3 of the 5 shares from the Custodians.
3. Paste the 3 shares into the UI.
4. Click **Trigger Key Ceremony**.

### 3. What Happens Under the Hood?
- The frontend sends the 3 shares to the backend `POST /key-ceremony/reconstruct` endpoint.
- The NestJS service (`KeyCeremonyService`) attempts to cryptographically combine the shares.
- If successful, the full 32-byte master key is briefly materialized in memory.
- The system signs pending ledger entries.
- Finally, the key buffer is zeroed out (`buffer.fill(0)`) and memory references are dropped to ensure no lingering trace.

## Security Constraints
- **Never** hardcode any shares or master keys in the codebase.
- **Never** log the reconstructed key.
- The Key Ceremony endpoint must be restricted to users with `ADMIN` role (mocked for this specific demo).
