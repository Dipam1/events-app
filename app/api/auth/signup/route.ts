import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  role: z.enum(["USER", "ADMIN", "ORGANIZER"]).default("USER"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const validatedData = signupSchema.safeParse(Object.fromEntries(body));
    console.log(validatedData);

    if (!validatedData.success) {
      const details = z.treeifyError(validatedData.error);
      return NextResponse.json(
        { error: "Invalid input", details },
        { status: 400 },
      );
    }
    const { name, email, password, phoneNumber, role } = validatedData.data;
    const SALT_ROUNDS = 10;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
      name,
      email,
      passwordHash,
      phoneNumber,
      role,
      isVerified: role === "USER" ? true : false,
      createdAt: new Date(),
      updatedAt: new Date(),
      profilePictureUrl: "",
    };
    const createdUser = await prisma.user.create({
      data: user,
    });
    console.log(createdUser);
    const { passwordHash: _, ...userWithoutPassword } = createdUser;
    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
