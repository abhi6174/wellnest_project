import mongoose, { Document, Schema } from 'mongoose';

export interface IUserEntity extends Document {
    username: string;
    password: string; // Hashed password
    mspId: string; // Organization ID (Org1MSP or Org2MSP)
}

const UserEntitySchema = new Schema<IUserEntity>({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    mspId: {
        type: String,
        required: true,
    },
}, {
    collection: 'users',
    timestamps: true,
});

// Compound index for username and mspId (users are unique per organization)
UserEntitySchema.index({ username: 1, mspId: 1 }, { unique: true });

export const UserEntity = mongoose.model<IUserEntity>('UserEntity', UserEntitySchema);
