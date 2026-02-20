export const parseNumberArray = (value: string | null, fallback: number[]) => {
  if (!value) return fallback;
  const parsed = value.split(",").map(Number);
  return parsed.every((n) => !isNaN(n)) ? parsed : fallback;
};