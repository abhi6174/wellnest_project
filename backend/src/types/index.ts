export interface PatientStatus {
    patientId: string;
    status: string;
    doctorId?: string;
}

export interface Transaction {
    txId: string;
    timestamp: string;
    value: any;
    isDelete?: boolean;
}

export interface GatewayChannelPair {
    gateway: any;
    channel: any;
}
