import { connectDatabase } from './src/config/database';
import { userInfoService } from './src/services/UserInfoService';
import { fabricUserRegistration } from './src/services/FabricUserRegistration';
import { ehrService } from './src/services/EhrService';
import { IEhrRecord } from './src/models/Patient';
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

async function runSeed() {
    console.log('🌱 Starting Custom Dummy Data Seeding Script for P2...');
    
    // Connect to database
    await connectDatabase();
    
    const doctorId = "D1"; // Setting doctor D1 as per your request
    const mspId = 'Org2MSP'; // Patient Org

    // Read and parse the raw patientdata.txt file
    const dataFilePath = path.join(__dirname, '../patientdata.txt');
    let rawText = fs.readFileSync(dataFilePath, 'utf8');
    
    // Clean out the "You said" part if it exists
    rawText = rawText.replace('You said', '').trim();
    
    let parsedRecords: any[];
    try {
        parsedRecords = JSON.parse(rawText);
    } catch (e) {
        console.error("❌ Failed to parse patientdata.txt JSON. Please make sure it is valid JSON.");
        process.exit(1);
    }

    const patient = {
        username: "P2",
        password: "p",
        records: parsedRecords
    };

    console.log(`\n--- Processing ${patient.username} ---`);

    // 1. Check if patient exists, register if not
    let userExists = await userInfoService.findByUsername(patient.username, mspId);
    if (!userExists) {
        console.log(`[1/3] Adding ${patient.username} to DB...`);
        await userInfoService.addUser({ username: patient.username, password: patient.password, mspId });
        
        console.log(`[2/3] Adding ${patient.username} to Fabric Wallet...`);
        await fabricUserRegistration.addUser(patient.username, patient.password, mspId);
    } else {
         console.log(`[1-2/3] ${patient.username} already exists in DB/Fabric. Skipping registration.`);
    }

    console.log(`[3/3] Generating ${patient.records.length} custom EHR records for ${patient.username}...`);
    
    for (let j = 0; j < patient.records.length; j++) {
        const record = patient.records[j];
        
        console.log(`    -> Submitting record ${j+1}/${patient.records.length} to MongoDB and Blockchain...`);
        try {
           // This will also trigger the API webhook to ChromaDB & Groq LLM
           await ehrService.addRecord(patient.username, doctorId, record as Partial<IEhrRecord>, 'Org1MSP');
           console.log(`       ✅ Record ${j+1} successfully added!`);
           
           // Adding a small delay to not overwhelm the LLM API rate limits
           await new Promise(r => setTimeout(r, 2000));
        } catch(e) {
            console.error(`       ❌ Failed to add record ${j+1}:`, e);
        }
    }

    console.log('\n✅ Custom Seeding Complete!');
    
    mongoose.connection.close();
    process.exit(0);
}

runSeed().catch(err => {
    console.error('Fatal Error during seeding:', err);
    process.exit(1);
});
