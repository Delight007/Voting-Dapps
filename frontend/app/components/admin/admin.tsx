import { FaUserCheck, FaUserPlus, FaUsers, FaUserTimes } from "react-icons/fa";

interface AdminStatsProps {
  totalVoters: number;
  totalCandidates: number;
  approvedVoters: number;
  approvedCandidates: number;
  pendingVoters?: number;
  pendingCandidates?: number;
}

export default function AdminStats({
  totalVoters,
  totalCandidates,
  approvedVoters,
  approvedCandidates,
  pendingVoters = 0,
  pendingCandidates = 0,
}: AdminStatsProps) {
  const stats = [
    {
      label: "Total Voters",
      value: totalVoters,
      pending: pendingVoters,
      icon: FaUsers,
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Total Candidates",
      value: totalCandidates,
      pending: pendingCandidates,
      icon: FaUserPlus,
      color: "from-purple-500 to-pink-400",
    },
    {
      label: "Approved Voters",
      value: approvedVoters,
      pending: 0,
      icon: FaUserCheck,
      color: "from-emerald-500 to-teal-400",
    },
    {
      label: "Approved Candidates",
      value: approvedCandidates,
      pending: 0,
      icon: FaUserTimes,
      color: "from-amber-500 to-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 p-4 flex items-center gap-4 shadow-lg"
        >
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-xl shadow-lg`}
          >
            <stat.icon />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            {stat.pending > 0 && (
              <span className="text-xs text-yellow-400 font-semibold">
                {stat.pending} pending
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
