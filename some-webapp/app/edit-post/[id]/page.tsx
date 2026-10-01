"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostDto } from "../../../types/postDto";

export default function EditPost() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");

  // Hent den eksisterende post
  useEffect(() => {
    async function loadPost() {
      try {
        const result = await fetch(`/api/posts/${id}`);

        if (!result.ok) {
          throw new Error("Could not fetch post");
        }

        const post: PostDto = await result.json();

        setTitle(post.title);
        setBody(post.body);
        setAuthor(post.author);
      } catch (error) {
        console.error(error);
        setError("Could not fetch post");
      }
    }

    loadPost();
  }, [id]);

  // Opdater posten
  const handleEditPost = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const result = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          author,
        }),
      });

      if (!result.ok) {
        throw new Error("Could not update post");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Could not update post");
    }
  };

  return (
    <form
      onSubmit={handleEditPost}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
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

      <button type="submit">
        Update Post
      </button>
    </form>
  );
}