export function formatDateWithOffset(isoDate: string, offset?: number): string {
  
  const date = new Date(isoDate);

  // Default to 0 if offset is undefined
  const shift = offset ?? 0;

  const shiftedDate = new Date(date.getTime() + shift * 60 * 60 * 1000);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-GB", options).format(shiftedDate);
}