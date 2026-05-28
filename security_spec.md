# Security Specification and Threat Model

This specification details the mathematical and relational data invariants of the Internet Data Store App Firestore database, followed by the "Dirty Dozen" malicious payloads designed during development to represent potential exploit vectors.

## Part 1: Data Invariants

1. **User Identity Invariant (Attribute-based)**:
   - A user profile doc `/users/{userId}` can only be read or written if `userId == request.auth.uid`.
   - A normal user cannot set their own role to `admin` or modify their `dataUsage` parameters. Modifying `role` and `dataUsage` is restricted to admins only.
   - Initial onboarding allows a new user to register `role='user'` and sets their base usage.

2. **Package Configuration Integrity**:
   - Only admins can create, update, or delete internet packages (`/packages/{packageId}`).
   - Anyone (anonymous or authenticated) can read active internet packages, but inactive packages can only be read by admins.

3. **News Posts Feed Integrity**:
   - Only admins can create, update, or delete posts (`/posts/{postId}`).
   - Anyone can read news posts.

4. **Payment Slip Validation & Atomicity**:
   - A user who submits a payment slip must match the slip's owner (`slip.userId == request.auth.uid`).
   - Normal users can read and create their own slips but CANNOT update or delete them.
   - Admins can read all slips, and perform transition updates (e.g. `pending -> approved` or `rejected`).
   - Slips can never be deleted by normal users or admins to preserve financial auditability of slips.
   - Once a slip has been transitioned into a terminal state (`approved` or `rejected`), it is locked and immutable (except for admin overrides).

5. **Settings Configuration Integrity**:
   - Only admins can update the `settings/contact` and `settings/announcement` configuration documents.
   - Anyone can read settings.

---

## Part 2: The "Dirty Dozen" Malicious Payloads

The following twelve payloads represent structural, permission, identity, or boundary-breaking attempts that MUST be rejected with `PERMISSION_DENIED` by the final Access Control Rules.

### Attack 1: User Identity Spoofing (Write other user's profile)
*   **Path attempted**: `/users/victim_user_123`
*   **Auth token state**: Authenticated as `attacker_user_456` (Verified email)
*   **Malicious payload**:
    ```json
    {
      "uid": "victim_user_123",
      "email": "victim@example.com",
      "displayName": "Hacked Victim",
      "role": "user",
      "createdAt": "2026-05-27T11:58:00Z"
    }
    ```
*   **Target outcome**: REJECTED (Victim's profile cannot be altered by other users).

### Attack 2: Self-Promotion (Elevation of Privilege)
*   **Path attempted**: `/users/attacker_user_456`
*   **Auth token state**: Authenticated as `attacker_user_456` (Verified email)
*   **Malicious payload**:
    ```json
    {
      "uid": "attacker_user_456",
      "email": "attacker@example.com",
      "displayName": "Sneaky Attacker",
      "role": "admin",
      "createdAt": "2026-05-27T11:58:00Z"
    }
    ```
*   **Target outcome**: REJECTED (Regular users cannot self-assign the `admin` role).

### Attack 3: Unlimited Data Injection (Bandwidth theft)
*   **Path attempted**: `/users/attacker_user_456`
*   **Auth token state**: Authenticated as `attacker_user_456`
*   **Malicious payload**:
    ```json
    {
      "uid": "attacker_user_456",
      "email": "attacker@example.com",
      "displayName": "Sneaky Attacker",
      "role": "user",
      "createdAt": "2026-05-27T11:58:00Z",
      "dataUsage": {
        "totalGB": 999999,
        "usedGB": 0,
        "billingCycleEnd": "Year 3000",
        "speedLimitMbps": 10000,
        "activeConnections": 100
      }
    }
    ```
*   **Target outcome**: REJECTED (Only admins can write or modify `dataUsage` fields).

### Attack 4: Slip Hijacking (Submit slip for another user)
*   **Path attempted**: `/slips/slip_malicious_999`
*   **Auth token state**: Authenticated as `attacker_user_456`
*   **Malicious payload**:
    ```json
    {
      "id": "slip_malicious_999",
      "userId": "victim_user_123",
      "userEmail": "victim@example.com",
      "packageId": "pack_premium",
      "bankSlipBase64": "data:image/png;base64,...",
      "status": "pending",
      "submittedAt": "2026-05-27T11:58:00Z"
    }
    ```
*   **Target outcome**: REJECTED (Cannot submit slip with `userId != request.auth.uid`).

### Attack 5: Self-Approval of Slip (Financial fraud)
*   **Path attempted**: `/slips/slip_attacker_456`
*   **Auth token state**: Authenticated as `attacker_user_456`
*   **Malicious payload (Create with Approved status)**:
    ```json
    {
      "id": "slip_attacker_456",
      "userId": "attacker_user_456",
      "userEmail": "attacker@example.com",
      "packageId": "pack_premium",
      "bankSlipBase64": "data:image/png;base64,...",
      "status": "approved",
      "vpnCode": "vpn_client_private_key_stolen=...",
      "submittedAt": "2026-05-27T11:58:00Z"
    }
    ```
*   **Target outcome**: REJECTED (Normally created slips must begin as `pending`. Normal user cannot create or modify a slip to `approved` status).

### Attack 6: Bypass Queue Verification (Modifying existing slip)
*   **Path attempted**: `/slips/slip_user_existing`
*   **Auth token state**: Authenticated as `attacker_user_456` (Owner of slip)
*   **Malicious payload (Update status field)**:
    ```json
    {
      "status": "approved",
      "vpnCode": "Wireguard config bypass"
    }
    ```
*   **Target outcome**: REJECTED (Normal users do not have slip update permissions; only admin can verify slips).

### Attack 7: ID Poisoning (Path exhaustion attack)
*   **Path attempted**: `/slips/slip_VERY_LONG_GARBAGE_CHARACTER_STRING_GREATER_THAN_128_CHARS_OR_CONTAINING_ILLEGAL_CHARACTERS_$$_%%`
*   **Auth token state**: Authenticated as `attacker_user_456`
*   **Malicious payload**:
    ```json
    {
      "id": "slip_VERY_LONG_GARBAGE_CHARACTER_STRING_GREATER_THAN_128_CHARS_OR_CONTAINING_ILLEGAL_CHARACTERS_$$_%%",
      "userId": "attacker_user_456",
      "packageId": "pack_premium",
      "bankSlipBase64": "data:image/png;base64,...",
      "status": "pending",
      "submittedAt": "2026-05-27T11:58:00Z"
    }
    ```
*   **Target outcome**: REJECTED (Document ID does not conform to ID regex `isValidId()` limits).

### Attack 8: Unauthenticated Configuration Sabotage (Modify contact settings)
*   **Path attempted**: `/settings/contact`
*   **Auth token state**: Unauthenticated
*   **Malicious payload**:
    ```json
    {
      "phone": "+1-900-SCAM-LINE",
      "email": "scam@phishing.site",
      "telegramChannel": "https://t.me/scam_channel"
    }
    ```
*   **Target outcome**: REJECTED (Write rejected for non-admin/unauthenticated users).

### Attack 9: Temporal Spoofing (Arbitrary created timestamps)
*   **Path attempted**: `/slips/slip_temporal_777`
*   **Auth token state**: Authenticated as `attacker_user_456`
*   **Malicious payload**:
    ```json
    {
      "id": "slip_temporal_777",
      "userId": "attacker_user_456",
      "packageId": "pack_premium",
      "bankSlipBase64": "data:image/png;base64,...",
      "status": "pending",
      "submittedAt": "2020-01-01T00:00:00Z"
    }
    ```
*   **Target outcome**: REJECTED (`submittedAt` must strictly equal `request.time`).

### Attack 10: Value Type Injection (Corrupt status field in Slip)
*   **Path attempted**: `/slips/slip_attacker_456`
*   **Auth token state**: Authenticated of admin user `chethiyabandara0001@gmail.com` (verified)
*   **Malicious update payload**:
    ```json
    {
      "status": true,
      "adminNotes": 542289
    }
    ```
*   **Target outcome**: REJECTED (Valuation function enforces types and string enums for statuses: `pending`, `approved`, or `rejected`).

### Attack 11: Immutable Field Tampering (Modifying package ID or email after registration)
*   **Path attempted**: `/users/attacker_user_456`
*   **Auth token state**: Authenticated as `attacker_user_456`
*   **Malicious update payload**:
    ```json
    {
      "email": "someone_else@spoofed.com"
    }
    ```
*   **Target outcome**: REJECTED (Registration email immutable once registered).

### Attack 12: Blanket Reading Attack (Query Scraping)
*   **Path attempted**: Reading all client slips (`/slips`)
*   **Auth token state**: Authenticated as standard user `attacker_user_456` (Verified email)
*   **Query**: `db.collection('slips').get()` (no filter)
*   **Target outcome**: REJECTED (Rule side list restriction requires client queries to specify `resource.data.userId == request.auth.uid`).
