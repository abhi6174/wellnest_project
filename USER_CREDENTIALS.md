# WELLNEST User Credentials & Registration Guide

## Overview

The WELLNEST system uses Hyperledger Fabric for identity management. Users must be **enrolled** in the Fabric network before they can **login** to the application.

---

## Default Credentials

### Fabric CA Admin (For Enrolling Users)

The Fabric Certificate Authority (CA) has default admin credentials:

- **Username:** `admin`
- **Password:** `adminpw`
- **CA Port (Org1):** 7054
- **CA Port (Org2):** 8054

---

## User Enrollment Process

Before any user can login, they must be enrolled in the Hyperledger Fabric network. Here's the workflow:

### Step 1: Enroll Admin User

**API Endpoint:** `POST http://localhost:8080/api/fabric/enroll-admin`

**Request Body:**
```json
{
  "mspId": "Org1MSP"
}
```

**What it does:** Creates an admin identity in the wallet for Org1MSP (Hospital)

**Repeat for Org2:**
```json
{
  "mspId": "Org2MSP"
}
```

---

### Step 2: Enroll Regular Users

**API Endpoint:** `POST http://localhost:8080/api/fabric/enroll-user`

**Request Body:**
```json
{
  "username": "doctor1",
  "mspId": "Org1MSP"
}
```

This enrolls a user into the Fabric network and creates their wallet credentials.

---

## Pre-Created Users (If Wallets Exist)

Check your `connection-profiles` directory for existing wallet files. Common setup includes:

### Organization 1 (Org1MSP) - Hospital/Doctors

- **admin** (admin user for Org1)
- **doctor1**, **doctor2**, etc. (enrolled doctors)

### Organization 2 (Org2MSP) - Regulators/Patients

- **admin** (admin user for Org2)
- **patient1**, **patient2**, etc. (enrolled patients)

---

## Complete User Registration Workflow

### For Doctors (Org1MSP - Hospital)

1. **Enroll Admin for Org1:**
   ```bash
   curl -X POST http://localhost:8080/api/fabric/enroll-admin \
     -H "Content-Type: application/json" \
     -d '{"mspId": "Org1MSP"}'
   ```

2. **Enroll Doctor:**
   ```bash
   curl -X POST http://localhost:8080/api/fabric/enroll-user \
     -H "Content-Type: application/json" \
     -d '{"username": "doctor1", "mspId": "Org1MSP"}'
   ```

3. **Register Doctor in MongoDB:**
   ```bash
   curl -X POST http://localhost:8080/api/fabric/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "doctor1",
       "password": "password123",
       "mspId": "Org1MSP"
     }'
   ```

4. **Login:**
   ```bash
   curl -X POST http://localhost:8080/api/fabric/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "doctor1",
       "password": "password123",
       "mspId": "Org1MSP"
     }'
   ```

### For Patients (Org2MSP - Regulator)

1. **Enroll Admin for Org2:**
   ```bash
   curl -X POST http://localhost:8080/api/fabric/enroll-admin \
     -H "Content-Type: application/json" \
     -d '{"mspId": "Org2MSP"}'
   ```

2. **Enroll Patient:**
   ```bash
   curl -X POST http://localhost:8080/api/fabric/enroll-user \
     -H "Content-Type: application/json" \
     -d '{"username": "patient1", "mspId": "Org2MSP"}'
   ```

3. **Register Patient in MongoDB:**
   ```bash
   curl -X POST http://localhost:8080/api/fabric/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "patient1",
       "password": "password123",
       "mspId": "Org2MSP"
     }'
   ```

4. **Login:**
   ```bash
   curl -X POST http://localhost:8080/api/fabric/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "patient1",
       "password": "password123",
       "mspId": "Org2MSP"
     }'
   ```

---

## Login Credentials Summary

After enrollment and registration, you can use these credentials:

### Test Users (Example)

| Username | Password | Organization | Role | MSP ID |
|----------|----------|--------------|------|--------|
| admin | adminpw | N/A | Admin | N/A |
| doctor1 | password123 | Hospital | Doctor | Org1MSP |
| doctor2 | password123 | Hospital | Doctor | Org1MSP |
| patient1 | password123 | Regulator | Patient | Org2MSP |
| patient2 | password123 | Regulator | Patient | Org2MSP |

**Note:** You must complete the enrollment and registration steps above before these credentials will work!

---

## Using the Frontend

### Login Page Fields

1. **Username:** Enter the username (e.g., `doctor1`, `patient1`)
2. **Password:** Enter the password you set during registration (e.g., `password123`)
3. **Organization:** Select from dropdown:
   - `Org1MSP` for Doctors (Hospital)
   - `Org2MSP` for Patients (Regulator)

### What Happens After Login

- **JWT Token** is generated and stored in localStorage
- User is redirected based on their MSP ID:
  - `Org1MSP` → Doctor Dashboard (`/doctor`)
  - `Org2MSP` → Patient Dashboard (`/patient`)
  - `admin` → Admin Dashboard (`/admin`)

---

## Quick Start Script

Create test users quickly with this script:

```bash
#!/bin/bash

API_URL="http://localhost:8080/api/fabric"

echo "Enrolling admins..."
curl -X POST $API_URL/enroll-admin -H "Content-Type: application/json" -d '{"mspId":"Org1MSP"}'
curl -X POST $API_URL/enroll-admin -H "Content-Type: application/json" -d '{"mspId":"Org2MSP"}'

echo "\nEnrolling users..."
curl -X POST $API_URL/enroll-user -H "Content-Type: application/json" -d '{"username":"doctor1","mspId":"Org1MSP"}'
curl -X POST $API_URL/enroll-user -H "Content-Type: application/json" -d '{"username":"patient1","mspId":"Org2MSP"}'

echo "\nRegistering users..."
curl -X POST $API_URL/register -H "Content-Type: application/json" -d '{"username":"doctor1","password":"password123","mspId":"Org1MSP"}'
curl -X POST $API_URL/register -H "Content-Type: application/json" -d '{"username":"patient1","password":"password123","mspId":"Org2MSP"}'

echo "\nTest users created successfully!"
echo "You can now login with:"
echo "  Doctor:  username=doctor1, password=password123, org=Org1MSP"
echo "  Patient: username=patient1, password=password123, org=Org2MSP"
```

Save this as `create-test-users.sh` and run:
```bash
chmod +x create-test-users.sh
./create-test-users.sh
```

---

## Troubleshooting

### "Invalid credentials" error

**Cause:** User not enrolled in Fabric or not registered in MongoDB

**Solution:** Complete enrollment and registration steps first

### "User wallet already exists"

**Cause:** User already enrolled in Fabric

**Solution:** Proceed to registration step (they just need MongoDB entry)

### "Authentication failed"

**Cause:** Incorrect password

**Solution:** Use the password you set during registration, or re-register the user

---

## Important Notes

1. **Two-Step Process:** Users need both:
   - Fabric enrollment (creates wallet identity)
   - MongoDB registration (stores username/password hash)

2. **Password Storage:** Passwords are hashed with bcrypt before storing in MongoDB

3. **JWT Expiration:** Tokens expire after 50 minutes (configurable in `.env`)

4. **Organization Mapping:**
   - `Org1MSP` = Doctors (Hospital)
   - `Org2MSP` = Patients (Regulator)

5. **Admin User:** The special `admin` username (lowercase) gets admin dashboard access

---

## API Testing with Postman

### 1. Enroll Admin
- **Method:** POST
- **URL:** `http://localhost:8080/api/fabric/enroll-admin`
- **Body (JSON):**
  ```json
  {"mspId": "Org1MSP"}
  ```

### 2. Enroll User
- **Method:** POST
- **URL:** `http://localhost:8080/api/fabric/enroll-user`
- **Body (JSON):**
  ```json
  {"username": "doctor1", "mspId": "Org1MSP"}
  ```

### 3. Register User
- **Method:** POST
- **URL:** `http://localhost:8080/api/fabric/register`
- **Body (JSON):**
  ```json
  {
    "username": "doctor1",
    "password": "password123",
    "mspId": "Org1MSP"
  }
  ```

### 4. Login
- **Method:** POST
- **URL:** `http://localhost:8080/api/fabric/login`
- **Body (JSON):**
  ```json
  {
    "username": "doctor1",
    "password": "password123",
    "mspId": "Org1MSP"
  }
  ```

**Response:** Returns JWT token to use for authenticated requests

---

## Next Steps After Login

Once logged in with a JWT token:

### As a Doctor (Org1MSP):
- View patient list
- Request access to patient EHR
- View/update patient EHR (once approved)

### As a Patient (Org2MSP):
- View pending access requests from doctors
- Approve/reject doctor access
- View your own EHR
- View transaction history

Happy testing! 🚀
