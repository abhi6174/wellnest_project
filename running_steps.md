WellNest Project - Run Commands Guide
Based on your project structure, here are all the commands you need:

🔗 BLOCKCHAIN FOLDER
Navigate to blockchain folder:

bash
cd /home/abhi/wellnest_project/blockchain
Step 1: Create Artifacts (Crypto materials & Genesis block)

bash
cd artifacts/channel
./create-artifacts.sh
cd ../..
Step 2: Start the Blockchain Network

bash
cd artifacts
docker compose -f docker-compose-persistance.yaml up -d
cd ..
Step 3: Create Channel

bash
./createChannel.sh
Step 4: Deploy Chaincode

bash
./deployChaincode.sh
Step 5: Generate Connection Profiles

bash
./ccp-generate.sh
🖥️ BACKEND FOLDER
Navigate to backend folder:

bash
cd /home/abhi/wellnest_project/backend

Install Dependencies (first time only)

bash
npm install

**OPTION 1: Development Mode (Recommended)**

Start MongoDB via Docker:
bash
docker compose up -d mongodb

Run Backend Server (Development mode with hot reload):
bash
npm run dev

**OPTION 2: Production Mode**

Run both MongoDB and Backend in Docker:
bash
docker compose up -d

NOTE: MongoDB runs on port 27017. Backend runs on port 8080 (production) or as defined in .env (development)
🎨 FRONTEND FOLDER
Navigate to frontend folder:

bash
cd /home/abhi/wellnest_project/frontend
Install Dependencies (first time only)

bash
npm install
Run Frontend Server (Development mode)

bash
npm run dev
Or Build for Production

bash
npm run build
npm run preview
🧹 CLEANING & RESTARTING COMMANDS
Clean Docker Volumes & Restart Network:

Navigate to blockchain folder:

bash
cd /home/abhi/wellnest_project/blockchain/artifacts
Stop all containers:

bash
docker compose -f docker-compose-persistance.yaml down
Remove all volumes (CAUTION: This deletes all blockchain data):

bash
docker compose -f docker-compose-persistance.yaml down -v
docker volume prune -f
Remove persistent volumes on host:

bash
sudo rm -rf /var/ehr
Remove generated artifacts:

bash
cd channel
rm -rf crypto-config
rm -f genesis.block mychannel.tx
cd ..
Complete Cleanup Script:

bash
cd /home/abhi/wellnest_project/blockchain
./cleanup.sh
Restart Network from Scratch: After cleanup, follow the blockchain steps again:

bash
# 1. Create artifacts
cd artifacts/channel
./create-artifacts.sh
cd ../..
# 2. Start network
cd artifacts
docker compose -f docker-compose-persistance.yaml up -d
cd ..
# 3. Create channel
./createChannel.sh
# 4. Deploy chaincode
./deployChaincode.sh
# 5. Generate connection profiles
./ccp-generate.sh
📋 QUICK START (All Components)
Terminal 1 - Blockchain:

bash
cd /home/abhi/wellnest_project/blockchain
cd artifacts/channel && ./create-artifacts.sh && cd ../..
cd artifacts && docker compose -f docker-compose-persistance.yaml up -d && cd ..
./createChannel.sh
./deployChaincode.sh
./ccp-generate.sh
Terminal 2 - Backend:

bash
cd /home/abhi/wellnest_project/backend
npm install  # first time only
npm run dev
Terminal 3 - Frontend:

bash
cd /home/abhi/wellnest_project/frontend
npm install  # first time only
npm run dev
🔍 USEFUL MONITORING COMMANDS
View Docker containers:

bash
docker ps
View Docker logs:

bash
docker logs -f <container_name>
# Example: docker logs -f peer0.org1.example.com
Check network:

bash
docker network ls
Check volumes:

bash
docker volume ls