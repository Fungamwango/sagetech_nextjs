import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="mb-4 text-lg font-bold text-white">
        <i className="fas fa-info-circle mr-2 text-cyan-400" />
        About SageTech
      </h1>

      <section
        className="sage-card overflow-hidden"
        style={{ background: "linear-gradient(180deg, rgba(11,25,34,0.96), rgba(5,18,24,0.9), rgba(0,128,128,0.14))" }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative mx-auto h-[152px] w-[152px] overflow-hidden rounded-full border border-cyan-300/25 md:mx-0">
              <Image
                src="/files/chanda_mark.jpg"
                alt="Chanda Fungamwango"
                fill
                className="object-cover"
                sizes="152px"
                priority
              />
            </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-400/75">Creator Credit</p>
            <h2 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "serif" }}>
              Chanda Fungamwango
            </h2>
            <p className="mt-1 text-sm text-white/62">
              Software Engineer • Educator
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72">
              SageTech was created by Chanda Fungamwango, a high-tech and skeptical-minded builder focused on practical software,
              modern web systems, and disciplined problem-solving. His work combines teaching clarity with engineering depth across
              full stack web development, software engineering, product thinking, and systems design.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {[
                "Full Stack Web Developer",
                "Software Engineer",
                "Systems Builder",
                "Technical Problem Solver",
                "Science Educator",
              ].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-cyan-300/18 bg-cyan-400/[0.06] px-3 py-1.5 text-white/78"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="https://chandamark.pages.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/22 bg-white/[0.03] px-4 py-2 text-sm text-cyan-300 transition-colors hover:border-cyan-200/35 hover:bg-white/[0.06] hover:text-cyan-200"
              >
                <i className="fas fa-external-link-alt text-xs" />
                View portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sage-card">
        <div className="text-center py-2">
          <h2 className="mb-2 text-3xl font-bold text-white" style={{ fontFamily: "serif" }}>
            Sage<span className="text-cyan-400">Tech</span>
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/62">
            An all-in-one platform for sharing, discovery, AI assistance, learning, marketplace activity, and digital creativity.
          </p>
        </div>
      </section>

      <section className="sage-card">
        <h2 className="mb-3 text-base font-bold text-white">What SageTech Offers</h2>
        <ul className="space-y-2">
          {[
            { icon: "fas fa-users", text: "Connect with people and grow your network" },
            { icon: "fas fa-music", text: "Share music, videos, documents, and general posts" },
            { icon: "fas fa-robot", text: "Use AI tools for answers and content generation" },
            { icon: "fas fa-store", text: "List products and handle marketplace requests" },
            { icon: "fas fa-coins", text: "Earn and spend points across premium actions" },
            { icon: "fas fa-language", text: "Access dictionary tools for Bemba and more languages" },
            { icon: "fas fa-tools", text: "Use practical digital tools for real-world tasks" },
          ].map((item) => (
            <li key={item.icon} className="flex items-center gap-3 text-sm text-white/72">
              <i className={`${item.icon} w-4 text-cyan-400`} />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sage-card">
        <h2 className="mb-3 text-base font-bold text-white">Points System</h2>
        <p className="mb-3 text-sm text-white/60">Earn and spend points to unlock more activity across the platform.</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Receive a like</span>
            <span className="text-green-400">+0.01 pts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Receive a comment</span>
            <span className="text-green-400">+0.02 pts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Content downloaded</span>
            <span className="text-green-400">+0.03 pts</span>
          </div>
          <div className="my-2 h-px bg-white/10" />
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Upload a song</span>
            <span className="text-red-400">-80 pts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Upload a video</span>
            <span className="text-red-400">-5 pts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Upload a photo</span>
            <span className="text-red-400">-0.5 pts</span>
          </div>
        </div>
      </section>

      <section className="sage-card">
        <h2 className="mb-2 text-base font-bold text-white">User Levels</h2>
        <div className="space-y-2 text-sm">
          {[
            { level: "Amateur", range: "0-99 pts", color: "text-gray-400" },
            { level: "Intermediate", range: "100-999 pts", color: "text-green-400" },
            { level: "Expert", range: "1,000-4,999 pts", color: "text-blue-400" },
            { level: "Master", range: "5,000-9,999 pts", color: "text-purple-400" },
            { level: "Professor", range: "10,000+ pts", color: "text-yellow-400" },
          ].map((level) => (
            <div key={level.level} className="flex justify-between gap-4">
              <span className={`font-semibold ${level.color}`}>{level.level}</span>
              <span className="text-white/40">{level.range}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
