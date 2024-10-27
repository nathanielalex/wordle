import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { Submission } from "@prisma/client";
const prisma = new PrismaClient();

export const POST = async (request: Request) => {
  const body: Submission = await request.json();
  const submission = await prisma.submission.create({
    data: {
      attempts: body.attempts,
      status: body.status,
      username: body.username,
    },
  });
  return NextResponse.json(submission, { status: 201 });
};
