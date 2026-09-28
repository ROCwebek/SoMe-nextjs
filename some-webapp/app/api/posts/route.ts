import { NextRequest, NextResponse } from "next/server";
import { addPost } from "../../../lib/api";
import { NewPostDto } from "../../../types/newPostDto";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as NewPostDto;

  try {
    const post = await addPost(body);
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Could not save post" }, { status: 502 });
  }
}
