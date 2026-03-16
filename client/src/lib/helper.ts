//THE UPDATED ONE BECAUSE OF THE FILTERS ->  Take Note ->
const LABEL_MAP: Record<string, string> = {
  BACKLOG: "بک‌لاگ",
  TODO: "برای انجام",
  IN_PROGRESS: "در حال انجام",
  IN_REVIEW: "در بازبینی",
  DONE: "انجام‌شده",
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "زیاد",
};

export const transformOptions = (
  options: string[],
  iconMap?: Record<string, React.ComponentType<{ className?: string }>>
) =>
  options.map((value) => ({
    label:
      LABEL_MAP[value] ??
      value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    value: value,
    icon: iconMap ? iconMap[value] : undefined,
  }));

export const transformStatusEnum = (status: string): string => {
  return LABEL_MAP[status] ?? status.replace(/_/g, " ");
};

export const formatStatusToEnum = (status: string): string => {
  return status.toUpperCase().replace(/\s+/g, "_");
};

export const getAvatarColor = (initials: string): string => {
  const colors = [
    "bg-red-500 text-white",
    "bg-blue-500 text-white",
    "bg-green-500 text-white",
    "bg-yellow-500 text-black",
    "bg-purple-500 text-white",
    "bg-pink-500 text-white",
    "bg-teal-500 text-white",
    "bg-orange-500 text-black",
    "bg-gray-500 text-white",
  ];

  // Simple hash to map initials to a color index
  const hash = initials
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
};

export const getAvatarFallbackText = (name: string) => {
  if (!name) return "نا";
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2); // Ensure only two initials
  return initials || "NA";
};
