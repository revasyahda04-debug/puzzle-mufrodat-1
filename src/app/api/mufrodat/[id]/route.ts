import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Akses guru diperlukan." }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    const item = await prisma.mufrodat.update({
      where: { id },
      data: {
        arabic: body.arabic, latin: body.latin, meaning: body.meaning, category: body.category,
        letters: body.letters, audioUrl: body.audioUrl || null, imageUrl: body.imageUrl || null,
        active: body.active ?? true
      }
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui materi." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Akses guru diperlukan." }, { status: 403 });
  const { id } = await params;
  await prisma.mufrodat.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
