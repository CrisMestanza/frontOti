const UNIDADES = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const ESPECIALES = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
const DECENAS = ["VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

function seccionATexto(numero) {
    if (numero === 0) return "";
    if (numero === 100) return "CIEN";

    let texto = "";
    const centena = Math.floor(numero / 100);
    const resto = numero % 100;

    if (centena > 0) texto += CENTENAS[centena] + " ";

    if (resto > 0) {
        if (resto < 10) {
            texto += UNIDADES[resto];
        } else if (resto < 20) {
            texto += ESPECIALES[resto - 10];
        } else {
            const decena = Math.floor(resto / 10);
            const unidad = resto % 10;
            if (decena === 2 && unidad > 0) {
                texto += "VEINTI" + UNIDADES[unidad];
            } else {
                texto += DECENAS[decena - 2];
                if (unidad > 0) texto += " Y " + UNIDADES[unidad];
            }
        }
    }

    return texto.trim();
}

function numeroATextoEntero(numero) {
    if (numero === 0) return "CERO";

    let texto = "";
    const millones = Math.floor(numero / 1000000);
    const miles = Math.floor((numero % 1000000) / 1000);
    const cientos = numero % 1000;

    if (millones > 0) {
        texto += millones === 1 ? "UN MILLON " : seccionATexto(millones) + " MILLONES ";
    }

    if (miles > 0) {
        texto += miles === 1 ? "MIL " : seccionATexto(miles) + " MIL ";
    }

    if (cientos > 0) {
        texto += seccionATexto(cientos);
    }

    return texto.trim();
}

// Convierte un monto a su representación en letras para uso en boletas/recibos.
export function numeroALetras(monto, moneda = "SOLES") {
    const valor = Number(monto) || 0;
    const entero = Math.floor(Math.abs(valor));
    const decimal = Math.round((Math.abs(valor) - entero) * 100);
    const decimalStr = String(decimal).padStart(2, "0");

    return `${numeroATextoEntero(entero)} CON ${decimalStr}/100 ${moneda}`;
}
