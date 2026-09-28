import { NewPostDto } from "../types/newPostDto";
import { PostDto } from "../types/postDto";

// Server-side only: the Next.js server talks to the NestJS backend directly,
// so this never runs in the browser and never needs CORS configured on the backend.
const baseUrl = process.env.BACKEND_URL ?? "http://localhost:3006";

export async function fetchPosts(): Promise<PostDto[]> {
  const result = await fetch(baseUrl + "/posts", { cache: "no-store" });

  if (!result.ok) {
    throw new Error("Could not fetch posts");
  }

  return result.json();
}

export async function fetchPost(id: number): Promise<PostDto> {
  const result = await fetch(`${baseUrl}/posts/${id}`, {
    cache: "no-store",
  });

  if (!result.ok) {
    throw new Error("Could not fetch post");
  }

  return result.json();
}

export async function addPost(post: NewPostDto): Promise<PostDto> {
  const result = await fetch(baseUrl + "/posts", {
    method: "POST",
    body: JSON.stringify(post),
    headers: { "Content-Type": "application/json" },
  });

  if (!result.ok) {
    throw new Error("Could not save post");
  }

  return result.json();
}

export async function updatePost(
  id: number,
  post: Partial<NewPostDto>
): Promise<PostDto> {
  const result = await fetch(`${baseUrl}/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(post),
    headers: { "Content-Type": "application/json" },
  });

  if (!result.ok) {
    throw new Error("Could not update post");
  }

  return result.json();
}

export async function deletePost(id: number): Promise<void> {
  const result = await fetch(`${baseUrl}/posts/${id}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    throw new Error("Could not delete post");
  }
}