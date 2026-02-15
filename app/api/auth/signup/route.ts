import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { emitSignupSuccess } from "@/lib/events/sendSignupEmail";

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
    const { passwordHash: _, ...userWithoutPassword } = createdUser;

    // Fire-and-forget emit; do not block the signup response on email delivery
    try {
      void emitSignupSuccess({ id: createdUser.id, email: createdUser.email, name: createdUser.name });
    } catch (emitErr) {
      console.error("emitSignupSuccess error:", emitErr);
    }

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
