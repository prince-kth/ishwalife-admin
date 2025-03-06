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

const updateAdminSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  password: z.string().min(5, "Password must be at least 5 characters").optional(),
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

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = updateAdminSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // If email or phone is being updated, check for conflicts
    if (updateData.email || updateData.phoneNumber) {
      const conflictingAdmin = await prisma.admin.findFirst({
        where: {
          OR: [
            updateData.email ? { email: updateData.email } : {},
            updateData.phoneNumber ? { phoneNumber: updateData.phoneNumber } : {}
          ],
          NOT: { id: parseInt(id) }
        }
      });

      if (conflictingAdmin) {
        return NextResponse.json(
          { error: "Email or phone number already in use" },
          { status: 409 }
        );
      }
    }

    // Hash new password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = updatedAdmin;

    return NextResponse.json({
      message: "Admin updated successfully",
      admin: adminWithoutPassword
    });

  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 