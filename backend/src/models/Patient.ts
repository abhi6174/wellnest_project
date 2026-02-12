import mongoose, { Document, Schema } from 'mongoose';

export interface IEhrRecord {
    recordId: string;
    timestamp: string;
    doctorId: string;
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
    hash: string;
}

export interface IPatient extends Document {
    patientId: string;
    ehrId: string;
    records: IEhrRecord[];
}

const EhrRecordSchema = new Schema({
    recordId: { type: String, required: true },
    timestamp: { type: String, required: true },
    doctorId: { type: String, required: true },
    diagnosis: { type: String, default: '' },
    treatment: { type: String, default: '' },
    medications: { type: String, default: '' },
    doctorNotes: { type: String, default: '' },
    patientHistory: { type: String, default: '' },
    allergies: { type: String, default: '' },
    labResults: { type: String, default: '' },
    imagingReports: { type: String, default: '' },
    vitalSigns: { type: String, default: '' },
    familyHistory: { type: String, default: '' },
    lifestyleFactors: { type: String, default: '' },
    immunizations: { type: String, default: '' },
    carePlan: { type: String, default: '' },
    followUpInstructions: { type: String, default: '' },
    hash: { type: String, required: true }
}, { _id: false });

const PatientSchema = new Schema<IPatient>({
    patientId: {
        type: String,
        required: true,
        unique: true,
    },
    ehrId: {
        type: String,
        required: true,
    },
    records: {
        type: [EhrRecordSchema],
        default: []
    }
}, {
    collection: 'patients',
    timestamps: true,
});

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
