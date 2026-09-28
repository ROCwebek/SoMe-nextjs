type PostProps = { title: string; body: string; author: string };

export const Post = ({ title, body, author }: PostProps) => (
  <article className="border-b border-line py-3">
    <h3 className="mb-1 text-lg font-bold">{title}</h3>
    <p className="mb-1">{body}</p>
    <p className="text-sm text-muted">{author}</p>
  </article>
);
