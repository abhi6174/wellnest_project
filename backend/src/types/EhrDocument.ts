export interface EhrDocument {
    ehrId?: string;
    diagnosis: string;
    treatment: string;
    medications: string;
    doctorNotes: string;
    patientHistory: string;
    allergies: string;
    labResults: string;
    imagingReports: string;
    vitalSigns: string;
    familyHistory: string;
    lifestyleFactors: string;
    immunizations: string;
    carePlan: string;
    followUpInstructions: string;
}
