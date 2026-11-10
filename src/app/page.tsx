import { withBase } from "@/lib/withBase";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold tracking-wide text-paper">
        DEMO
      </span>
      {/* Plain <img> + withBase() proves /public assets resolve under /thbt-demo/ */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase("/coin.svg")} alt="THBT coin" width={120} height={120} />
      <h1 className="text-4xl font-bold sm:text-6xl">
        Hello <span className="text-brand">THBT</span>
      </h1>
      <p className="max-w-md text-base opacity-70">
        M0 check: if you can see the orange coin and this styled text, the base path,
        Tailwind CSS and static assets are all loading correctly.
      </p>
    </main>
  );
}
