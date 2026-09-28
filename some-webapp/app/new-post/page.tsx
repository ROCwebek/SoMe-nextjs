"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/Button";
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
    <form onSubmit={handleNewPost} className="flex flex-col gap-2">
      {error ? <p>{error}</p> : null}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="rounded border border-line px-2 py-1"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Body"
        rows={4}
        className="rounded border border-line px-2 py-1"
      />
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author"
        className="rounded border border-line px-2 py-1"
      />
      <Button type="submit" className="self-start">
        Save Post
      </Button>
    </form>
  );
}
