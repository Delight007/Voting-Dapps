import { FaClock, FaRedoAlt, FaUserEdit } from "react-icons/fa";

export default function AdminActions() {
  const actions = [
    {
      label: "Set Voting Period",
      icon: FaClock,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Change Owner",
      icon: FaUserEdit,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      label: "Reset Contract",
      icon: FaRedoAlt,
      color: "bg-red-600 hover:bg-red-700",
    },
  ];

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 p-5 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4">Admin Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all ${action.color} shadow-md shadow-${action.color.split(" ")[1]}/30 hover:shadow-lg`}
          >
            <action.icon />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
