import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

const prisma = new PrismaClient();

// Input validation schema
const loginSchema = z.object({
  email: z.string().min(5, "Email or Phone number is required"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find admin by email or phone
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: email },
          { phoneNumber: email }
        ]
      }
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;

    // return new NextResponse(JSON.stringify({
    //   message: "Login successful",
    //   admin: adminWithoutPassword
    // }), {
    //   status: 200,
    //   headers: {
    //     "Set-Cookie": [
    //       serialize("token", token, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === "production",
    //         sameSite: "lax",
    //         path: "/",
    //         maxAge: 7 * 24 * 60 * 60, // 7 days
    //       }),
    //       serialize("isAuthenticated", "true", {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === "production",
    //         sameSite: "lax",
    //         path: "/",
    //         maxAge: 7 * 24 * 60 * 60,
    //       })
    //     ].join("; "),
    //     "Content-Type": "application/json"
    //   }
    // });
    return new NextResponse(JSON.stringify({
      message: "Login successful",
      admin: adminWithoutPassword
    }), {
      status: 200,
      headers: {
        "Set-Cookie": [
          serialize("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          }),
          serialize("isAuthenticated", "true", {
            httpOnly: false, // Frontend se access ke liye
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
          })
        ],
        "Content-Type": "application/json"
      }
    });
    
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
