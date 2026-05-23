import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Customer from '@/models/Customer';

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  await connectDB();
  const { courseIdx, sessionIdx, field, newValue } = await req.json();
  const updatePath = `courses.${courseIdx}.sessions.${sessionIdx}.${field}`;

  try {
    const updated = await Customer.findOneAndUpdate(
      { slug: params.slug },
      { $set: { [updatePath]: newValue } },
      { new: true }
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
