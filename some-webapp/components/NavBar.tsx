import Link from "next/link";

export const NavBar = () => (
  <nav className="flex gap-4 border-b border-line px-4 py-3">
    <Link href="/" className="text-blue-700 underline">
      Feed
    </Link>
    <Link href="/settings" className="text-blue-700 underline">
      Settings
    </Link>
  </nav>
);
