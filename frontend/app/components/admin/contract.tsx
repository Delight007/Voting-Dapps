interface ContractInfoProps {
  owner: string;
  votingStart: string;
  votingEnd: string;
  yourAddress: string;
}

export default function ContractInfo({
  owner,
  votingStart,
  votingEnd,
  yourAddress,
}: ContractInfoProps) {
  const items = [
    { label: "Owner Address", value: owner },
    { label: "Voting Start", value: votingStart },
    { label: "Your Address", value: yourAddress },
    { label: "Voting End", value: votingEnd },
  ];

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 p-5 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4">
        Contract Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="bg-gray-700/50 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {item.label}
            </p>
            <p className="text-sm font-mono text-white truncate">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
