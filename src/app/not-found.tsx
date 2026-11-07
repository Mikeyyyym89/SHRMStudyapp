import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold text-slate-900">404</h1>
      <p className="mt-3 text-lg text-slate-600">
        That page or course could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Back to courses
      </Link>
    </div>
  );
}
