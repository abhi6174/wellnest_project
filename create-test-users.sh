#!/bin/bash

# WELLNEST Quick User Setup Script
# This script creates test users for the WELLNEST system

API_URL="http://localhost:8080/api/fabric"

echo "=========================================="
echo "WELLNEST - Creating Test Users"
echo "=========================================="

# Step 1: Enroll admins
echo ""
echo "Step 1: Enrolling admin users..."
echo "------------------------------"

echo "Enrolling admin for Org1MSP (Hospital)..."
curl -X POST $API_URL/enroll-admin \
  -H "Content-Type: application/json" \
  -d '{"mspId":"Org1MSP"}' \
  -w "\n"

sleep 1

echo "Enrolling admin for Org2MSP (Regulator)..."
curl -X POST $API_URL/enroll-admin \
  -H "Content-Type: application/json" \
  -d '{"mspId":"Org2MSP"}' \
  -w "\n"

sleep 1

# Step 2: Enroll users in Fabric
echo ""
echo "Step 2: Enrolling users in Fabric network..."
echo "------------------------------"

echo "Enrolling doctor1..."
curl -X POST $API_URL/enroll-user \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","mspId":"Org1MSP"}' \
  -w "\n"

sleep 1

echo "Enrolling doctor2..."
curl -X POST $API_URL/enroll-user \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor2","mspId":"Org1MSP"}' \
  -w "\n"

sleep 1

echo "Enrolling patient1..."
curl -X POST $API_URL/enroll-user \
  -H "Content-Type: application/json" \
  -d '{"username":"patient1","mspId":"Org2MSP"}' \
  -w "\n"

sleep 1

echo "Enrolling patient2..."
curl -X POST $API_URL/enroll-user \
  -H "Content-Type: application/json" \
  -d '{"username":"patient2","mspId":"Org2MSP"}' \
  -w "\n"

sleep 1

# Step 3: Register users in MongoDB
echo ""
echo "Step 3: Registering users in MongoDB..."
echo "------------------------------"

echo "Registering doctor1..."
curl -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","password":"password123","mspId":"Org1MSP"}' \
  -w "\n"

sleep 1

echo "Registering doctor2..."
curl -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor2","password":"password123","mspId":"Org1MSP"}' \
  -w "\n"

sleep 1

echo "Registering patient1..."
curl -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d '{"username":"patient1","password":"password123","mspId":"Org2MSP"}' \
  -w "\n"

sleep 1

echo "Registering patient2..."
curl -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d '{"username":"patient2","password":"password123","mspId":"Org2MSP"}' \
  -w "\n"

sleep 1

# Summary
echo ""
echo "=========================================="
echo "✅ Test users created successfully!"
echo "=========================================="
echo ""
echo "You can now login with these credentials:"
echo ""
echo "DOCTORS (Org1MSP - Hospital):"
echo "  Username: doctor1 | Password: password123 | Organization: Org1MSP"
echo "  Username: doctor2 | Password: password123 | Organization: Org1MSP"
echo ""
echo "PATIENTS (Org2MSP - Regulator):"
echo "  Username: patient1 | Password: password123 | Organization: Org2MSP"
echo "  Username: patient2 | Password: password123 | Organization: Org2MSP"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8080"
echo ""
echo "=========================================="
