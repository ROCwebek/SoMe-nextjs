import Link from "next/link";

export const NavBar = () => (
  <nav
    style={{
      display: "flex",
      gap: 16,
      padding: "12px 16px",
      borderBottom: "1px solid #e2e2e2",
    }}
  >
    <Link href="/">Feed</Link>
    <Link href="/settings">Settings</Link>
  </nav>
);
