import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password || String(password).length < 8) {
      return NextResponse.json({ error: "Nama, email, dan password minimal 8 karakter wajib diisi." }, { status: 400 });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });

    // Pendaftaran publik selalu menjadi SISWA; peran ADMIN hanya dibuat melalui seed.
    const user = await prisma.user.create({
      data: { name: String(name).trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(String(password), 12), role: "SISWA" }
    });
    await createSession(user);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Tidak dapat membuat akun." }, { status: 400 });
  }
}
