import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Customer from '@/models/Customer';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  await connectDB();
  try {
    const customer = await Customer.findOne({ slug: params.slug });
    if (!customer) return NextResponse.json({ success: false, message: 'Klien tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  await connectDB();
  try {
    await Customer.findOneAndDelete({ slug: params.slug });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  await connectDB();
  try {
    const body = await req.json();
    const updated = await Customer.findOneAndUpdate(
      { slug: params.slug },
      { $push: { courses: body.course } },
      { new: true }
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
