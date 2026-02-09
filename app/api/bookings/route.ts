import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Booking API" });
}

export async function POST(request: Request) {
  return NextResponse.json({ message: "Create Booking" });
}
