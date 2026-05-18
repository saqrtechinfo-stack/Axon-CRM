import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { companyId: true },
  });
  if (!dbUser)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string; // "logo" or "signature"

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  const ext = file.name.split(".").pop();
  const fileName = `companies/${dbUser.companyId}/${type}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("lead-attachments")
    .upload(fileName, Buffer.from(bytes), {
      contentType: file.type,
      upsert: true, // overwrite if exists
    });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { publicUrl },
  } = supabase.storage.from("lead-attachments").getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
