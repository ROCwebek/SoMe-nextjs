import { NextRequest, NextResponse } from "next/server";
import { updatePost, deletePost } from "../../../../lib/api";
import { NewPostDto } from "../../../../types/newPostDto";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as Partial<NewPostDto>;

  try {
    const post = await updatePost(Number(id), body);

    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { message: "Could not update post" },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deletePost(Number(id));

    return NextResponse.json({ message: "Post deleted" });
  } catch {
    return NextResponse.json(
      { message: "Could not delete post" },
      { status: 502 }
    );
  }
}