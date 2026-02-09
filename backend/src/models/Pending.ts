import mongoose, { Document, Schema } from 'mongoose';

export interface IPending extends Document {
    pid: string; // Patient ID
    did: string; // Doctor ID
    status: string; // 'Pending', 'Accepted', 'Rejected'
}

const PendingSchema = new Schema<IPending>({
    pid: {
        type: String,
        required: true,
    },
    did: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Accepted', 'Rejected', 'Revoked'],
        default: 'Pending',
    },
}, {
    collection: 'pending',
    timestamps: true,
});

// Index for faster queries
PendingSchema.index({ pid: 1, did: 1 });

export const Pending = mongoose.model<IPending>('Pending', PendingSchema);
