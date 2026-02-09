import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Profile API" });
}

export async function PUT(request: Request) {
  return NextResponse.json({ message: "Update Profile" });
}
