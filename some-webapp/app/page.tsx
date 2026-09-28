import Link from "next/link";
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
        <button type="button">New post</button>
      </Link>

      {error ? <p>{error}</p> : null}

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
