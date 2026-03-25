```bash
Wellnest - Running steps
🚀 Installation & Setup
1. Clone the Repository
git clone <repository-url>
Software Dependencies
1. Docker & Docker Compose
 Install latest docker and docker compose for ubuntu
2. Hyperledger Fabric Binaries
# Download Fabric binaries and Docker images
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.4.0 1.5.0
Put the below content on bashrc
export PATH=$PWD/fabric-samples/bin:$PATH
3. Go Programming Language
# Download and install Go 1.21+
wget https://golang.org/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz

# Add to ~/.bashrc
echo 'export GOROOT=/usr/local/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOROOT/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
source ~/.bashrc



cd wellnest_project
. If already ran the network.clean up blockchain and backend folder
	Blockchain folder cleanup
    # 1. Go to the artifacts directory
        cd blockchain/artifacts
      # 2. Stop the network and remove containers/volumes
        docker compose -f docker-compose-persistance.yaml down -v
     # 3. Prune unused docker volumes (removing stale chaincode data)
        docker volume prune -f
     # 4. Wipe the host persistent storage (CRITICAL for fixing 'Creator Org Unknown')
        sudo rm -rf /var/ehr/*
    Backend folder cleanup
# 1. Stop the network and remove containers/volumes
	In backend/
        docker compose down -v
# 3. Clear Wallet Data
rm -rf connection-profiles/org1/wallet/*     connection-profiles/org2/wallet/*


2. Set up Blockchain Network
Step 2.1: Generate Crypto Materials and Artifacts
cd blockchain/artifacts/channel
chmod +x create-artifacts.sh
./create-artifacts.sh
This script will:
Generate cryptographic materials for organizations and orderers
Create genesis block for the system channel
Generate channel configuration transaction for 'mychannel'
Step 2.2: Start Hyperledger Fabric Network
cd ../../../blockchain/artifacts
docker compose -f docker-compose-persistance.yaml up -d
This will start:
2 Certificate Authorities (CA) for Org1 and Org2
1 Orderer nodes 
4 Peer nodes (2 per organization)
4 CouchDB instances for state database
In a terminal check via 
		docker ps -a
	Check if an orderer node exited, if yes, then cleanup blockchain network
	
Wait for 30-60 seconds for all containers to be fully operational.
Step 2.3: Create Channel and Deploy Chaincode
In Blockchain/ folder
chmod +x createChannel.sh deployChaincode.sh ccp-generate.sh

# Create channel 'mychannel' and join all peers
./createChannel.sh

# Package, install, approve, and commit the EHR chaincode
./deployChaincode.sh
check if the output  has 
{ org1msp: true,
	Org2msp: true,
}  
Then it is success 

# Generate connection profiles for organizations
./ccp-generate.sh
	This generates connection-org.json in backend/connection-profiles/org
Important: The deployChaincode.sh script will:
Package the EHR smart contract from blockchain/chaincode
Install chaincode on all 4 peers
Approve chaincode for both organizations
Commit chaincode definition to the channel
Initialize the ledger
3. Set up Backend (Node.js)
Step 3.1: Start MongoDB Container
cd backend
sudo systemctl stop mongod  # To stop the local mongodb from interfering with port
docker compose up -d mongodb
This starts MongoDB with:
Username: admin
Password: password
Database: test
Port: 27017
Step 3.2: Build and Run node.js Application
Make sure you are having node.js 22 version
# install dependencies for first time 
npm install

# Run the application
npm run dev
The backend will start on http://localhost:8080 and will:
Connect to the Hyperledger Fabric network
Provide REST APIs for EHR operations
Handle user authentication and authorization
Manage fabric user registration and enrollment
Backend API Endpoints:
POST /fabric/login - User authentication
POST /fabric/register - Register new users
POST /fabric/submit - Submit transactions to blockchain
GET /fabric/query - Query blockchain data
4. Set up Frontend (React.js)
cd frontend

# Install dependencies


npm install

# Start development server
npm run dev
The frontend will be available at http://localhost:5173 (Vite default port).
5. Chatbot Service running
cd chatbot-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.scripts.ingest_medical_book
uvicorn app.main:app --reload
Create a .env file 
GROQ_API_KEY=your_actual_groq_api_key_here






🔧 Configuration
Environment Variables
Backend Configuration
Update backend/.env
	# Server Configuration
PORT=8080
NODE_ENV=development


# MongoDB Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/test?authSource=admin
MONGODB_USERNAME=admin
MONGODB_PASSWORD=password


# JWT Configuration
JWT_SECRET=mySecretKey123912738aopsgjnspkmndfsopkvajoirjg94gf2opfng2moknm
JWT_EXPIRATION_MS=3000000
# Fabric Network Configuration
FABRIC_CONNECTION_PROFILE_PATH=./connection-profiles
FABRIC_WALLET_PATH=./connection-profiles
# Encryption Configuration
ENCRYPTION_SECRET_KEY=MySuperSecretKey






Blockchain Network Configuration
Connection profiles are automatically generated in:
backend/src/main/resources/static/connection-profiles/org1
backend/src/main/resources/static/connection-profiles/org2
👥 User Roles & Organizations
Organization 1 (Org1MSP) - Healthcare Providers
Role: Doctors and medical staff
Capabilities: Create, update, and access patient records
Default Admin: admin:adminpw
Organization 2 (Org2MSP) - Patients
Role: Patients and healthcare consumers
Capabilities: View their own records, grant/revoke access permissions
Default Admin: admin:adminpw
🔐 Smart Contract Functions
The EHR chaincode (blockchain/chaincode/lib/ehr-contract.js) provides:
createEHRRecord(doctorId, patientId, hash, timestamp) - Create new EHR record
updateEHRRecord(doctorId, patientId, newHash, timestamp) - Update existing record
getEHRRecord(patientId, doctorId) - Retrieve specific record
getAllEHRRecordByPatient(patientId) - Get all records for a patient
getAllEHRRecordByDoctor(doctorId) - Get all records by a doctor
recordAccess(doctorId, patientId, hash, timestamp) - Log access attempt
activateAccess(doctorId, patientId, hash, timestamp) - Grant access
revokeAccess(doctorId, patientId, hash, timestamp) - Revoke access
getAccessHistory(patientId, doctorId) - View access audit trail


```
