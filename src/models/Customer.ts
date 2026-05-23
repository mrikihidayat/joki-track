import mongoose, { Schema, Document } from 'mongoose';

export interface ISession {
  sessionNumber: number;
  type: 'diskusi' | 'tugas';
  price: number;
  status: 'antrian' | 'waiting' | 'done' | 'revisi';
  isPaid: boolean;
}

export interface ICourse {
  courseName: string;
  sessions: ISession[];
}

export interface ICustomer extends Document {
  name: string;
  slug: string;
  courses: ICourse[];
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionNumber: { type: Number, required: true },
  type: { type: String, enum: ['diskusi', 'tugas'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['antrian', 'waiting', 'done', 'revisi'], default: 'antrian' },
  isPaid: { type: Boolean, default: false },
});

const CourseSchema = new Schema<ICourse>({
  courseName: { type: String, required: true },
  sessions: [SessionSchema],
});

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  courses: [CourseSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
