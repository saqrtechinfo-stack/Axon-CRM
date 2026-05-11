// app/api/attachments/[attachmentId]/sign/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  const { attachmentId } = await params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data } = await supabase.storage
    .from("lead-attachments")
    .createSignedUrl(attachment.url, 300); // 5 min for download

  return NextResponse.json({ signedUrl: data?.signedUrl });
}
