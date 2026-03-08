import { useCities } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";

// Static city positions on the SVG (relative to a 700x500 viewBox)
const DEFAULT_CITIES: { name: string; x: number; y: number }[] = [
  { name: "Lahore", x: 520, y: 70 },
  { name: "Okara", x: 440, y: 170 },
  { name: "Pakpattan", x: 340, y: 250 },
  { name: "Haroonabad", x: 180, y: 280 },
  { name: "Burewala", x: 120, y: 200 },
  { name: "Arif Wala", x: 260, y: 310 },
  { name: "Chichawatni", x: 350, y: 340 },
  { name: "Sahiwal", x: 390, y: 400 },
];

// COMSATS position (center/destination)
const COMSATS = { x: 390, y: 420 };

function getColorForIndex(i: number) {
  const colors = [
    "#059669",
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#d97706",
    "#0891b2",
    "#16a34a",
    "#dc2626",
  ];
  return colors[i % colors.length];
}

export function MapPage() {
  const navigate = useNavigate();
  const { data: cities = [] } = useCities();

  // Match backend cities to positions by name (case-insensitive)
  const cityWithId = DEFAULT_CITIES.map((pos) => {
    const match = cities.find(
      (c) =>
        c.name.toLowerCase().includes(pos.name.toLowerCase()) ||
        pos.name.toLowerCase().includes(c.name.toLowerCase()),
    );
    return { ...pos, cityId: match?.id?.toString() || null };
  });

  const handleCityClick = (cityId: string | null) => {
    if (cityId) {
      navigate({ to: "/routes/$cityId", params: { cityId } });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Route Map
        </h1>
        <p className="text-muted-foreground">
          All cities connected to COMSATS Sahiwal Campus. Click a city to view
          buses.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-4 md:p-8"
      >
        <div className="relative w-full" style={{ aspectRatio: "7/5" }}>
          <svg
            viewBox="0 0 700 500"
            className="w-full h-full"
            style={{ maxHeight: "600px" }}
            data-ocid="map.canvas_target"
            role="img"
            aria-label="COMSATS Sahiwal Campus bus route map"
          >
            <title>COMSATS Sahiwal Campus Bus Routes</title>
            {/* Background */}
            <defs>
              <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="oklch(0.97 0.012 145)" />
                <stop offset="100%" stopColor="oklch(0.93 0.02 145)" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              x="0"
              y="0"
              width="700"
              height="500"
              fill="url(#bgGrad)"
              rx="12"
            />

            {/* Grid lines (subtle) */}
            {[100, 200, 300, 400, 500, 600].map((x) => (
              <line
                key={x}
                x1={x}
                y1="0"
                x2={x}
                y2="500"
                stroke="oklch(0.86 0.022 145)"
                strokeWidth="0.5"
              />
            ))}
            {[100, 200, 300, 400].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="700"
                y2={y}
                stroke="oklch(0.86 0.022 145)"
                strokeWidth="0.5"
              />
            ))}

            {/* Route lines from each city to COMSATS */}
            {cityWithId.map((city, idx) => {
              const color = getColorForIndex(idx);
              return (
                <motion.line
                  key={`line-${city.name}`}
                  x1={city.x}
                  y1={city.y}
                  x2={COMSATS.x}
                  y2={COMSATS.y}
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.8, delay: 0.2 + idx * 0.08 }}
                />
              );
            })}

            {/* City dots */}
            {cityWithId.map((city, idx) => {
              const color = getColorForIndex(idx);
              const isClickable = !!city.cityId;
              return (
                <motion.g
                  key={`city-${city.name}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3 + idx * 0.07,
                    type: "spring",
                    stiffness: 300,
                  }}
                  style={{ cursor: isClickable ? "pointer" : "default" }}
                  onClick={() => handleCityClick(city.cityId)}
                  data-ocid={`map.city.map_marker.${idx + 1}`}
                >
                  {/* Outer ring */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r="18"
                    fill={`${color}22`}
                    stroke={color}
                    strokeWidth="1.5"
                    className={
                      isClickable ? "hover:opacity-80 transition-opacity" : ""
                    }
                  />
                  {/* Inner dot */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r="8"
                    fill={color}
                    filter="url(#glow)"
                  />
                  {/* City label */}
                  <text
                    x={city.x}
                    y={city.y - 24}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="oklch(0.22 0.04 155)"
                    fontFamily="Cabinet Grotesk, sans-serif"
                  >
                    {city.name}
                  </text>
                  {isClickable && (
                    <text
                      x={city.x}
                      y={city.y - 13}
                      textAnchor="middle"
                      fontSize="8"
                      fill={color}
                      fontFamily="General Sans, sans-serif"
                    >
                      tap to view
                    </text>
                  )}
                </motion.g>
              );
            })}

            {/* COMSATS Sahiwal (destination) */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            >
              {/* Pulsing ring */}
              <circle
                cx={COMSATS.x}
                cy={COMSATS.y}
                r="32"
                fill="oklch(0.46 0.165 152 / 0.1)"
                stroke="oklch(0.46 0.165 152)"
                strokeWidth="1"
                strokeDasharray="4 2"
              >
                <animate
                  attributeName="r"
                  values="28;34;28"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0.2;0.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={COMSATS.x}
                cy={COMSATS.y}
                r="14"
                fill="oklch(0.46 0.165 152)"
                filter="url(#glow)"
              />
              <text
                x={COMSATS.x}
                y={COMSATS.y - 36}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="oklch(0.22 0.04 155)"
                fontFamily="Cabinet Grotesk, sans-serif"
              >
                COMSATS Sahiwal
              </text>
              <text
                x={COMSATS.x}
                y={COMSATS.y - 23}
                textAnchor="middle"
                fontSize="9"
                fill="oklch(0.46 0.165 152)"
                fontFamily="General Sans, sans-serif"
              >
                University Campus
              </text>
              {/* University icon (simple building shape) */}
              <text
                x={COMSATS.x}
                y={COMSATS.y + 5}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontFamily="sans-serif"
              >
                🎓
              </text>
            </motion.g>

            {/* Legend */}
            <g>
              <rect
                x="12"
                y="12"
                width="160"
                height="26"
                rx="6"
                fill="white"
                opacity="0.85"
              />
              <circle cx="28" cy="25" r="5" fill="oklch(0.46 0.165 152)" />
              <line
                x1="35"
                y1="25"
                x2="60"
                y2="25"
                stroke="oklch(0.46 0.165 152)"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <circle
                cx="68"
                cy="25"
                r="5"
                fill="oklch(0.46 0.165 152 / 0.3)"
                stroke="oklch(0.46 0.165 152)"
                strokeWidth="1.5"
              />
              <text
                x="80"
                y="29"
                fontSize="9"
                fill="oklch(0.25 0.05 155)"
                fontFamily="General Sans, sans-serif"
              >
                Bus Route
              </text>
            </g>
          </svg>
        </div>
      </motion.div>

      {/* City chips below map */}
      <div className="mt-6 flex flex-wrap gap-3">
        {cityWithId.map((city, idx) => {
          const color = getColorForIndex(idx);
          return (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCityClick(city.cityId)}
              disabled={!city.cityId}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              data-ocid={`map.city.button.${idx + 1}`}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: color }}
              />
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
