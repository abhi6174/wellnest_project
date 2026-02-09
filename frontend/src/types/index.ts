// EHR Document Interface
export interface EhrDocument {
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    allergies: string;
    diagnosis: string;
    treatment: string;
    medications: string;
    labResults: string;
    vitalSigns: string;
    doctorNotes: string;
    familyHistory: string;
    immunizationRecords: string;
    previousSurgeries: string;
    chronicConditions: string;
}

// Patient Status Interface
export interface PatientStatus {
    did?: string;
    pid: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
}

// Transaction Interface
export interface Transaction {
    timestamp: string;
    txId: string;
    did: string;
    pid: string;
    hash: string;
    event: string;
}

// User/Auth Interfaces
export interface User {
    username: string;
    mspId: string;
}

export interface LoginRequest {
    username: string;
    password: string;
    mspId: string;
}

export interface JwtPayload {
    username: string;
    mspId: string;
    exp: number;
    iat: number;
}

// API Response Interface
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

// Pending Request Interface
export interface PendingRequest {
    pid: string;
    did: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
}

// Registration Form Data
export interface RegistrationFormData {
    username: string;
    password: string;
    file?: File | null;
}
