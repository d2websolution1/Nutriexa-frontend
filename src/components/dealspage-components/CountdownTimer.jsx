import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";

function getTimeLeft(targetDate) {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ endsAt }) {
  // Defaults to end of current week (Sunday midnight) if no date passed
  const target =
    endsAt ||
    (() => {
      const d = new Date();
      const daysUntilSunday = 7 - d.getDay();
      d.setDate(d.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
      d.setHours(0, 0, 0, 0);
      return d;
    })();

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-4 bg-white rounded-lg border border-gray-100 shadow-sm px-6 py-4">
      <div className="flex items-center gap-2 text-[#1a1a1a] text-sm font-semibold">
        <FiClock size={18} className="text-[#4CAF37]" />
        Deals end in:
      </div>
      <div className="flex items-center gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center bg-[#1a1a1a] text-white rounded-md px-3 py-1.5 min-w-[52px]"
          >
            <span className="text-lg font-extrabold leading-none">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase text-gray-300 mt-0.5">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}