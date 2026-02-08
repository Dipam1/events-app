import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Event API" });
}

export async function POST(request: Request) {
  return NextResponse.json({ message: "Create Event" });
}
