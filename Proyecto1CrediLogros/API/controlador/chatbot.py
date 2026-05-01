def procesar_mensaje(mensaje):
    msg = mensaje.lower()

    if "credito" in msg or "crédito" in msg or "prestamo" in msg:
        return "Tenemos dos tipos de crédito: Nuevo Credito y Reenovacion de Credito. ¿Cuál te interesa?"

    elif "requisitos" in msg or "requiere" in msg:
        return "Los requisitos básicos son: cédula, Volante De Matricula y buen historial crediticio."

    elif "interes" in msg or "tasa" in msg or "porcentaje" in msg:
        return "Las tasas de interés varían según el tipo de crédito y tu perfil financiero."

    elif "plazo" in msg or "tiempo" in msg or "duracion" in msg:
        return "Los plazos disponibles van desde 12 hasta 60 meses."

    elif "monto" in msg or "cuanto" in msg or "cantidad" in msg:
        return "El monto depende de tu capacidad de pago, desde $1,000 hasta $50,000."

    elif "solicitar" in msg or "aplicar" in msg or "como obtener" in msg:
        return "Puedes solicitar un crédito acercándote a nuestras oficinas o a través de nuestro formulario en línea."

    elif "asesor" in msg or "ayuda" in msg or "hablar" in msg:
        return "Puedes hablar con un asesor aquí: https://wa.me/573001234567"

    else:
        return "No entendí tu pregunta. Puedes consultar sobre créditos, requisitos, intereses, plazos o cómo solicitar uno."