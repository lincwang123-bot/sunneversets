import { Compass, Ellipsis, Github, Terminal } from "lucide-react";

export default function ToolIcon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  if (name.startsWith("Claude"))
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#ce805f" />
        <g stroke="#fff1e5" strokeWidth="1.5" strokeLinecap="round">
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d="M12 4v16" transform={`rotate(${i * 30} 12 12)`} />
          ))}
        </g>
      </svg>
    );
  if (name === "Cursor")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#f0f1f3" d="m12 2 9 5v10l-9 5-9-5V7z" />
        <path fill="#8b8f97" d="m12 2 9 5-9 5-9-5z" />
        <path fill="#363c44" d="m12 12 9-5-5 11-4 4z" />
      </svg>
    );
  if (name === "VS Code")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#38a9ed"
          d="m18 2 5 2v16l-5 2L7 14l-4 3-3-2 5-3-5-4 3-2 4 3zm0 5-7 5 7 5z"
        />
      </svg>
    );
  const Icon =
    name === "GitHub"
      ? Github
      : name === "Safari"
        ? Compass
        : name === "Terminal"
          ? Terminal
          : Ellipsis;
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}
