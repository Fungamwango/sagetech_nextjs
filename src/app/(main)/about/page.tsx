export default function AboutPage() {
  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">
        <i className="fas fa-info-circle text-cyan-400 mr-2" />About SageTech
      </h1>

      <div className="sage-card mb-4" style={{ background: "linear-gradient(to bottom, #123, #023, rgba(0,128,128,0.2))" }}>
        <div className="text-center py-4">
          <h2
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "serif" }}
          >
            Sage<span className="text-cyan-400">Tech</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
            Your all-in-one platform to connect with friends, share content, earn points, and grow.
          </p>
        </div>
      </div>

      <div className="sage-card mb-4">
        <h2 className="text-base font-bold text-white mb-3">What We Offer</h2>
        <ul className="space-y-2">
          {[
            { icon: "fas fa-users", text: "Connect with friends and grow your network" },
            { icon: "fas fa-music", text: "Upload and share music, videos & more" },
            { icon: "fas fa-coins", text: "Earn points and monetize your content" },
            { icon: "fas fa-store", text: "Buy and sell products online" },
            { icon: "fas fa-robot", text: "Access powerful AI tools" },
            { icon: "fas fa-language", text: "Learn Bemba with our dictionary" },
            { icon: "fas fa-code", text: "Learn coding with interactive tutorials" },
          ].map((item) => (
            <li key={item.icon} className="flex items-center gap-3 text-sm text-white/70">
              <i className={`${item.icon} text-cyan-400 w-4`} />
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="sage-card mb-4">
        <h2 className="text-base font-bold text-white mb-3">Points System</h2>
        <p className="text-sm text-white/60 mb-3">Earn and spend points to access premium features:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Receive a like</span>
            <span className="text-green-400">+0.01 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Receive a comment</span>
            <span className="text-green-400">+0.02 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Content downloaded</span>
            <span className="text-green-400">+0.03 pts</span>
          </div>
          <div className="h-px bg-white/10 my-2" />
          <div className="flex justify-between">
            <span className="text-white/60">Upload a song</span>
            <span className="text-red-400">-80 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Upload a video</span>
            <span className="text-red-400">-5 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Upload a photo</span>
            <span className="text-red-400">-0.5 pts</span>
          </div>
        </div>
      </div>

      <div className="sage-card">
        <h2 className="text-base font-bold text-white mb-2">User Levels</h2>
        <div className="space-y-2 text-sm">
          {[
            { level: "Amateur", range: "0-99 pts", color: "text-gray-400" },
            { level: "Intermediate", range: "100-999 pts", color: "text-green-400" },
            { level: "Expert", range: "1,000-4,999 pts", color: "text-blue-400" },
            { level: "Master", range: "5,000-9,999 pts", color: "text-purple-400" },
            { level: "Professor", range: "10,000+ pts", color: "text-yellow-400" },
          ].map((l) => (
            <div key={l.level} className="flex justify-between">
              <span className={`font-semibold ${l.color}`}>{l.level}</span>
              <span className="text-white/40">{l.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
