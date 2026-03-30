import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function LeaderboardPage() {
  const [currentUser, leaders] = await Promise.all([
    getCurrentUser(),
    db
      .select({
        id: users.id,
        username: users.username,
        picture: users.picture,
        points: users.points,
        awards: users.awards,
        level: users.level,
        isOnline: users.isOnline,
      })
      .from(users)
      .orderBy(desc(users.points))
      .limit(50),
  ]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-1">
        <i className="fas fa-trophy text-yellow-400 mr-2" />
        Leaderboard
      </h1>
      <p className="text-sm text-white/50 mb-4">Top users by points</p>

      <div className="space-y-2">
        {leaders.map((user, index) => {
          const isMe = currentUser?.id === user.id;
          return (
            <Link
              href={`/profile/${user.id}`}
              key={user.id}
              className={`sage-card flex items-center gap-3 hover:border-cyan-800/50 hover:bg-cyan-900/10 transition-all fade-in ${isMe ? "border-cyan-700/60 bg-cyan-900/20" : ""}`}
            >
              <span className="w-8 text-center text-sm font-bold text-white/40">
                {index < 3 ? medals[index] : `${index + 1}.`}
              </span>

              <div className="relative flex-shrink-0">
                <Image
                  src={user.picture || "/files/default-avatar.svg"}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-white/20"
                />
                {user.isOnline && <span className="absolute bottom-0 right-0 online-dot" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold capitalize truncate ${isMe ? "text-cyan-400" : "text-white"}`}>
                  {user.username} {isMe && "(you)"}
                </p>
                <p className={`text-xs level-${user.level?.toLowerCase() ?? "amateur"}`}>
                  {user.level ?? "Amateur"}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-cyan-400">
                  {parseFloat(String(user.points ?? 0)).toFixed(2)}
                </p>
                <p className="text-xs text-white/40">pts</p>
              </div>
            </Link>
          );
        })}
      </div>

      {leaders.length === 0 && (
        <div className="text-center py-16">
          <i className="fas fa-trophy text-4xl text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No users yet</p>
        </div>
      )}
    </div>
  );
}
