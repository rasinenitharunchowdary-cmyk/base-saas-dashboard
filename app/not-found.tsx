import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <span className="not-found-icon" aria-hidden="true"><Compass size={30} /></span>
      <p className="page-eyebrow">404 · Page not found</p>
      <h1>This view wandered off the map.</h1>
      <p>The page may have moved, or the link might be out of date. Your workspace is still right where you left it.</p>
      <Link className="button button-primary" href="/"><ArrowLeft size={17} /> Back to overview</Link>
    </main>
  );
}
