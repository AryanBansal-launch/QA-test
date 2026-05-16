import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>This is simple Nextjs Test application</h1>
      Home Page
      <Link href="/about">About</Link>
      <Link href="/contact">Contact</Link>
    </div>
  );
}
