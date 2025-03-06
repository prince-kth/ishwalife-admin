import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";



const prisma = new PrismaClient();

// Input validation schema
const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = adminSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, phoneNumber, password } = validation.data;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email or phone number already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;

    return NextResponse.json({
      message: "Admin created successfully",
      admin: adminWithoutPassword,
      token
    }, { status: 201 });

  } catch (error) {
    console.error("Admin creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 