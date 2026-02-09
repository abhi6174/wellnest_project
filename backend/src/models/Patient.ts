import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
    patientId: string;
    ehrId: string;
    ehrDocument: string; // Encrypted EHR data
}

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
    ehrDocument: {
        type: String,
        required: true,
    },
}, {
    collection: 'patients',
    timestamps: true,
});

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
