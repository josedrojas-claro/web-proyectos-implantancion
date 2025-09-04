export const formatToNicaragua = (iso) => {
  if (!iso) return "No disponible";
  try {
    const options = {
      timeZone: "America/Managua",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // cambia a true si quieres formato 12h con AM/PM
    };
    return new Intl.DateTimeFormat("es-NI", options).format(new Date(iso));
  } catch {
    return "Fecha inválida";
  }
};
