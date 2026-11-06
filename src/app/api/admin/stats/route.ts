import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Akses guru diperlukan." }, { status: 403 });
  const [students, words, attempts] = await Promise.all([
    prisma.user.count({ where: { role: "SISWA" } }),
    prisma.mufrodat.count({ where: { active: true } }),
    prisma.attempt.count()
  ]);
  return NextResponse.json({ students, words, attempts });
}
