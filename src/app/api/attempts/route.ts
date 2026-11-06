import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  try {
    const { mufrodatId, answer } = await req.json();
    const item = await prisma.mufrodat.findUnique({ where: { id: String(mufrodatId) } });
    if (!item || !item.active) return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 });
    const normalize = (s: string) => s.normalize("NFC").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/\s/g, "");
    const isCorrect = normalize(String(answer)) === normalize(item.arabic);
    const score = isCorrect ? 10 : 0;
    const attempt = await prisma.attempt.create({
      data: { userId: user.id, mufrodatId: item.id, answer: String(answer), isCorrect, score }
    });
    return NextResponse.json({ isCorrect, score, attemptId: attempt.id });
  } catch {
    return NextResponse.json({ error: "Jawaban tidak dapat diperiksa." }, { status: 400 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id }, include: { mufrodat: true }, orderBy: { createdAt: "desc" }, take: 50
  });
  const totalScore = attempts.reduce((sum, item) => sum + item.score, 0);
  return NextResponse.json({ attempts, totalScore });
}
