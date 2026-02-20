export const parseStringArray = (value: string | null) => {
  return value ? value.split(",") : [];
};