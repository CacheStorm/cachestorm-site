import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function NotFound() {
  return (
    <div className="container not-found">
      <p className="eyebrow">A CACHE MISS</p>
      <h1>
        404<span className="blue">.</span>
      </h1>
      <h2>This key has expired.</h2>
      <p>
        The page you’re looking for isn’t here. Let’s get you back on the fast
        path.
      </p>
      <Link href="/" className="button primary">
        Back to CacheStorm
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
