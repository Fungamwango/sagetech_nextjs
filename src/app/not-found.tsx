import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))" }}
    >
      <div className="text-center">
        <p className="text-6xl font-bold text-white/10 mb-2">404</p>
        <h1 className="text-xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-white/50 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-sage px-8">
          <i className="fas fa-home mr-2" />Go Home
        </Link>
      </div>
    </div>
  );
}
