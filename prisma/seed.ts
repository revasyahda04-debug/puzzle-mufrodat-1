import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "guru@example.com";
  const password = process.env.ADMIN_PASSWORD || "GantiPasswordKuat123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name: process.env.ADMIN_NAME || "Guru", passwordHash, role: Role.ADMIN },
    create: {
      name: process.env.ADMIN_NAME || "Guru",
      email,
      passwordHash,
      role: Role.ADMIN
    }
  });

  const items = [
    { arabic: "كِتَابٌ", latin: "Kitaabun", meaning: "Buku", category: "Alat Sekolah", letters: "ك|ت|ا|ب" },
    { arabic: "قَلَمٌ", latin: "Qalamun", meaning: "Pena", category: "Alat Sekolah", letters: "ق|ل|م" },
    { arabic: "مِمْحَاةٌ", latin: "Mimhaatun", meaning: "Penghapus", category: "Alat Sekolah", letters: "م|م|ح|ا|ة" },
    { arabic: "مَدْرَسَةٌ", latin: "Madrasatun", meaning: "Sekolah", category: "Tempat", letters: "م|د|ر|س|ة" },
    { arabic: "بَابٌ", latin: "Baabun", meaning: "Pintu", category: "Benda di Kelas", letters: "ب|ا|ب" },
    { arabic: "كُرْسِيٌّ", latin: "Kursiyyun", meaning: "Kursi", category: "Benda di Kelas", letters: "ك|ر|س|ي" }
  ];

  for (const item of items) {
    const exists = await prisma.mufrodat.findFirst({
      where: { arabic: item.arabic, category: item.category }
    });
    if (!exists) await prisma.mufrodat.create({ data: item });
  }
  console.log(`Admin siap: ${email}`);
}

main().finally(async () => prisma.$disconnect());
