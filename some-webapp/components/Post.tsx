"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type PostProps = {
  id: number;
  title: string;
  body: string;
  author: string;
};

export const Post = ({ id, title, body, author }: PostProps) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const result = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!result.ok) {
        throw new Error("Could not delete post");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <article
      style={{
        borderBottom: "1px solid #e2e2e2",
        padding: "12px 0",
      }}
    >
      <h3 style={{ margin: "0 0 4px" }}>{title}</h3>

      <p style={{ margin: "0 0 4px" }}>{body}</p>

      <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
        {author}
      </p>

      <Link href={`/edit-post/${id}`}>
        <button type="button">Edit</button>
      </Link>

      <button type="button" onClick={handleDelete}>
        Delete
      </button>
    </article>
  );
};
