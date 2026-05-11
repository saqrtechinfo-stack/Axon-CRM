// app/api/leads/[leadId]/attachments/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!, // service key for server-side
);

// GET — fetch attachments for a lead
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attachments = await prisma.attachment.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(attachments);
}

// POST — upload file + save record
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `leads/${leadId}/${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("lead-attachments")
    .upload(fileName, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get signed URL (private bucket)
  const {
    data: { signedUrl },
  } = await supabase.storage
    .from("lead-attachments")
    .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

  // Save record to DB
  const attachment = await prisma.attachment.create({
    data: {
      name: file.name,
      url: fileName, // store path, not URL (URL expires)
      size: file.size,
      type: file.type,
      leadId,
    },
  });

  return NextResponse.json({ ...attachment, signedUrl });
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { attachmentId } = await req.json();

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from storage
  await supabase.storage.from("lead-attachments").remove([attachment.url]); // url is the path

  // Delete from DB
  await prisma.attachment.delete({ where: { id: attachmentId } });

  return NextResponse.json({ success: true });
}
