import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const items = await prisma.mufrodat.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { createdAt: "asc" }]
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Akses guru diperlukan." }, { status: 403 });
  try {
    const body = await req.json();
    const required = ["arabic", "latin", "meaning", "category", "letters"];
    if (required.some((key) => !body[key])) return NextResponse.json({ error: "Lengkapi semua data wajib." }, { status: 400 });
    const item = await prisma.mufrodat.create({
      data: {
        arabic: String(body.arabic), latin: String(body.latin), meaning: String(body.meaning),
        category: String(body.category), letters: String(body.letters),
        audioUrl: body.audioUrl ? String(body.audioUrl) : null,
        imageUrl: body.imageUrl ? String(body.imageUrl) : null
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan materi." }, { status: 400 });
  }
}
