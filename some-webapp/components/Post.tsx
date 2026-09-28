type PostProps = { title: string; body: string; author: string };

export const Post = ({ title, body, author }: PostProps) => (
  <article style={{ borderBottom: "1px solid #e2e2e2", padding: "12px 0" }}>
    <h3 style={{ margin: "0 0 4px" }}>{title}</h3>
    <p style={{ margin: "0 0 4px" }}>{body}</p>
    <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{author}</p>
  </article>
);
