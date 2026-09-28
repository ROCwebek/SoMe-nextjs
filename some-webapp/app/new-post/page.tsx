"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { NewPostDto } from "../../types/newPostDto";

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleNewPost = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const result = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({ title, body, author } as NewPostDto),
        headers: { "Content-Type": "application/json" },
      });

      if (!result.ok) {
        throw new Error("Could not save post");
      }

      // the feed page is a server component, so navigating back to it re-fetches
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
      setError("Could not save post");
    }
  };

  return (
    <form onSubmit={handleNewPost} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {error ? <p>{error}</p> : null}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Body"
        rows={4}
      />
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author"
      />
      <button type="submit">Save Post</button>
    </form>
  );
}
