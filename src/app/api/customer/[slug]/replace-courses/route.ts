import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Customer from '@/models/Customer';

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  await connectDB();
  try {
    const { courses } = await req.json();
    const updated = await Customer.findOneAndUpdate(
      { slug: params.slug },
      { $set: { courses } },
      { new: true }
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
