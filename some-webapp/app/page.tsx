import Link from "next/link";
import { Button } from "../components/Button";
import { Post } from "../components/Post";
import { fetchPosts } from "../lib/api";
import { PostDto } from "../types/postDto";

export default async function Feed() {
  let posts: PostDto[];
  let error = "";

  try {
    posts = await fetchPosts();
  } catch (e) {
    console.error(e);
    posts = [];
    error = "Could not load posts";
  }

  return (
    <div>
      <Link href="/new-post">
        <Button type="button">New post</Button>
      </Link>

      {error ? <p className="mb-2">{error}</p> : null}

      {posts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          title={post.title}
          body={post.body}
          author={post.author}
        />
      ))}
    </div>
  );
}
