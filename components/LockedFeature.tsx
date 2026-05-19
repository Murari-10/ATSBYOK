"use client";

interface LockedFeatureProps {
  label: string;
  requiredPlan: string;
  onUpgrade: () => void;
}

export default function LockedFeature({
  label,
  requiredPlan,
  onUpgrade,
}: LockedFeatureProps) {
  return (
    <div className="relative rounded-xl border-2 border-dashed border-gray-200 p-6 bg-gray-50">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 rounded-xl backdrop-blur-sm">
        <div className="text-2xl">🔒</div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">Requires {requiredPlan} plan</p>
        <button
          onClick={onUpgrade}
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Upgrade to unlock
        </button>
      </div>
      <div className="opacity-10 pointer-events-none text-sm text-gray-400">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </div>
    </div>
  );
}
