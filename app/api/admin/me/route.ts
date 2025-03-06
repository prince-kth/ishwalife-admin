import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";



const prisma = new PrismaClient();

import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value; // JWT from cookies
    console.log("Received Token from Cookies:", token);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { id: number };
    console.log("Decoded JWT:", decoded);

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, phoneNumber: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);

  } catch (error) {
    console.log("Fetch admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// export async function GET(req: Request) {
//   try {
//     const token = req.headers.get("authorization")?.split(" ")[1];

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { id: number };
//     console.log("Decoded token:", decoded);

//     const admin = await prisma.admin.findUnique({
//       where: { id: decoded.id },
//       select: { id: true, name: true, email: true, phoneNumber: true },
//     });

//     if (!admin) {
//       return NextResponse.json({ error: "Admin not found" }, { status: 404 });
//     }

//     return NextResponse.json(admin);

//   } catch (error) {
//     console.log("Fetch admin error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
