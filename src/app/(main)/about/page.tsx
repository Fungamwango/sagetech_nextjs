import Image from "next/image";
import Link from "next/link";
import { getPointCostSettings, getPointRewardSettings } from "@/lib/websiteSettings";

function pointLabel(value: number, sign: "+" | "-") {
  return `${sign}${value} pt${value === 1 ? "" : "s"}`;
}

export default async function AboutPage() {
  const [rewards, costs] = await Promise.all([getPointRewardSettings(), getPointCostSettings()]);

  const earnRows = [
    {
      label: "When another user likes your content",
      value: pointLabel(rewards.points_like_reward, "+"),
    },
    {
      label: "When another user comments on your content",
      value: pointLabel(rewards.points_comment_reward, "+"),
    },
    {
      label: "When another user replies to your discussion",
      value: pointLabel(rewards.points_reply_reward, "+"),
    },
    {
      label: "When another user downloads your file",
      value: pointLabel(rewards.points_download_reward, "+"),
    },
    {
      label: "When you publish a normal post",
      value: pointLabel(rewards.points_post_create_reward, "+"),
    },
  ];

  const spendRows = [
    { label: "General text / photo / short-video post", value: pointLabel(costs.cost_general_post, "-") },
    { label: "Song upload", value: pointLabel(costs.cost_song_post, "-") },
    { label: "Video upload", value: pointLabel(costs.cost_video_post, "-") },
    { label: "Document upload", value: pointLabel(costs.cost_document_post, "-") },
    { label: "Product listing", value: pointLabel(costs.cost_product_post, "-") },
    { label: "Advert post", value: pointLabel(costs.cost_advert_post, "-") },
    { label: "Book upload", value: pointLabel(costs.cost_book_post, "-") },
  ];

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
                  className="rounded-full border border-cyan-300/5 bg-cyan-400/[0.06] px-3 py-1.5 text-white/78"
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
              </Link>   <Link
                href="tel:0962464552"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/[0.03] px-4 py-2 text-sm text-cyan-300 transition-colors hover:border-cyan-200/35 hover:bg-white/[0.06] hover:text-cyan-200"
              >
                <i className="fas fa-external-link-alt text-xs" />
                Call / Whatsapp
              </Link> <Link
                href="mailto:chandamark386@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/[0.03] px-4 py-2 text-sm text-cyan-300 transition-colors hover:border-cyan-200/22 hover:bg-white/[0.06] hover:text-cyan-200"
              >
                <i className="fas fa-external-link-alt text-xs" />
                Email
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
        <p className="mb-4 text-sm leading-relaxed text-white/80">
          Points are SageTech&apos;s activity currency. You earn them when people interact with your posts, and you spend them
          on premium actions like music, adverts, documents, and products.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[14px] border border-white/1 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <i className="fas fa-arrow-trend-up text-emerald-400" />
              How Points Are Earned
            </div>
            <div className="space-y-2 text-sm">
              {earnRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <span className="text-white/60">{row.label}</span>
                  <span className="text-emerald-400">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-white/1 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <i className="fas fa-arrow-trend-down text-rose-400" />
              How Points Are Used
            </div>
            <div className="space-y-2 text-sm">
              {spendRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <span className="text-white/60">{row.label}</span>
                  <span className={costs.cost_general_post === 0 && row.label === "General text / photo / short-video post" ? "text-cyan-300" : "text-rose-400"}>
                    {costs.cost_general_post === 0 && row.label === "General text / photo / short-video post" ? "Free" : row.value}
                  </span>
                </div>
              ))}
            </div>
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
