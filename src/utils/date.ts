export const toISODate = (d = new Date()) => d.toISOString().slice(0, 10);

export const calcAgeFromBirthDate = (birthDate: string | null | undefined) => {
  if (!birthDate) return null;
  const bd = new Date(birthDate);
  if (Number.isNaN(bd.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age -= 1;
  return age;
};
