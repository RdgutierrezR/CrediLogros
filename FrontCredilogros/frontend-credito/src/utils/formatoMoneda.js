export const formatearCOP = (valor) => {
  if (!valor && valor !== 0) return "";
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  if (isNaN(numero)) return "";
  return `$${Math.floor(numero).toLocaleString("es-CO")}`;
};

export const parsearCOP = (texto) => {
  if (!texto) return "";
  return texto.replace(/[^\d]/g, "");
};