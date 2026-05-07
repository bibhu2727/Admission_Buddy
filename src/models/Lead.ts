import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  phone: string;
  channel: 'agent' | 'reff' | 'direct';
  remark?: string;
  visitDate: Date;
  status: 'Pending' | 'Converted' | 'No Show' | 'Postponed';
  counselorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    channel: { type: String, enum: ['agent', 'reff', 'direct'], required: true },
    remark: { type: String },
    visitDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Converted', 'No Show', 'Postponed'], default: 'Pending' },
    counselorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Delete cached model in dev to pick up schema changes during HMR
if (mongoose.models.Lead) {
  delete mongoose.models.Lead;
}

export default mongoose.model<ILead>('Lead', LeadSchema);
