import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST() {
  const jar = await cookies();
  jar.set("mufrodat_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
