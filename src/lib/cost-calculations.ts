
import { PrinterConfig, PrintPiece } from "./quotations";

// Calculation helpers
export const calcCostoGramo = (costo1kg: number) => costo1kg / 1000;

export const calcCostoMaterial = (costo1kg: number, consumoGramos: number) =>
    calcCostoGramo(costo1kg) * consumoGramos;

export const calcCostoEnergia = (printer: PrinterConfig | undefined, tiempoMinutos: number) => {
    if (!printer) return 0;
    // =((((1*consumoWh)/1000)*costoPorKwh)/60)*tiempoMinutos
    const consumoKwh = (printer.consumoWh / 1000) * (tiempoMinutos / 60);
    return consumoKwh * printer.costoPorKwh;
};

export const calcCostoUsoMaquina = (printer: PrinterConfig | undefined, tiempoMinutos: number) => {
    if (!printer) return 0;
    // =$O$11*G4 donde O$11 es tiempo en minutos y G4 es costo por minuto
    return tiempoMinutos * printer.costoMinuto;
};

export const calcSobrecostoPorFallo = (costoMaterial: number, costoEnergia: number, costoUsoMaquina: number, porcentajeFallo: number = 0.3) => {
    // Sobrecosto es un porcentaje del costo base (material + energía + uso máquina)
    return (costoMaterial + costoEnergia + costoUsoMaquina) * porcentajeFallo;
};

export const calcPorcentajeGanancia = (consumoGramos: number): number => {
    // =SI((D4)<900; SI(D4<20; 170%; 60%-(D4)*0.06/100); 15%)
    if (consumoGramos < 900) {
        if (consumoGramos < 20) {
            return 1.7; // 170%
        }
        return 0.6 - (consumoGramos * 0.06 / 100); // 60% - consumption*0.06/100
    }
    return 0.15; // 15%
};

export const calcCostoImpresion = (piece: PrintPiece, printer: PrinterConfig | undefined) => {
    const costoMaterial = calcCostoMaterial(piece.costo1kg, piece.consumoGramos);
    const costoEnergia = calcCostoEnergia(printer, piece.tiempoMinutos);
    const costoUsoMaquina = calcCostoUsoMaquina(printer, piece.tiempoMinutos);
    const sobrecostoFallo = calcSobrecostoPorFallo(costoMaterial, costoEnergia, costoUsoMaquina);
    const porcentajeGanancia = calcPorcentajeGanancia(piece.consumoGramos);

    // Fórmula: (E+H+I+J)+((E+H+I+J)*K)
    const base = costoMaterial + costoEnergia + costoUsoMaquina + sobrecostoFallo;
    return base + (base * porcentajeGanancia);
};

export const calcPostprocesado = (piece: PrintPiece) => {
    const costoPrimerMl = piece.primerCosto200ml / 200;
    const costoPrimer = costoPrimerMl * piece.consumoPrimerGramos;
    const horasPostprocesado = piece.tiempoPostprocesado / 60;
    const costoTiempo = horasPostprocesado * piece.costoPorHoraPostprocesado;
    return costoPrimer + piece.costoLijadoPintura + costoTiempo;
};

export const calcDescuentoGrupo = (totalFilamentoGramos: number): number => {
    // =MIN(D6/1000 * 10%; 10%)
    return Math.min((totalFilamentoGramos / 1000) * 0.1, 0.1);
};

export const calculateQuotationTotals = (pieces: PrintPiece[], printers: PrinterConfig[]) => {
    const totalFilamento = pieces.reduce((s, p) => s + p.consumoGramos, 0);
    const pieceCalcs = pieces.map(piece => {
        const printer = printers.find(p => p.id === piece.printerId);
        const costoMaterial = calcCostoMaterial(piece.costo1kg, piece.consumoGramos);
        const costoEnergia = calcCostoEnergia(printer, piece.tiempoMinutos);
        const costoUsoMaquina = calcCostoUsoMaquina(printer, piece.tiempoMinutos);
        const sobrecostoFallo = calcSobrecostoPorFallo(costoMaterial, costoEnergia, costoUsoMaquina);

        const costoImpresion = calcCostoImpresion(piece, printer);
        const costoPostprocesado = calcPostprocesado(piece);
        const costoVenta = costoImpresion + costoPostprocesado;

        // Desglose Postprocesado
        const costoPrimerMl = piece.primerCosto200ml / 200;
        const costoPrimer = costoPrimerMl * piece.consumoPrimerGramos;
        const horasPostprocesado = piece.tiempoPostprocesado / 60;
        const costoTiempoPostproc = horasPostprocesado * piece.costoPorHoraPostprocesado;

        const costoProduccionImpresion = costoMaterial + costoEnergia + costoUsoMaquina + sobrecostoFallo;

        return {
            costoVenta,
            costoProduccionImpresion,
            costoProduccionPostprocesado: costoPostprocesado,
            // Detalles
            detalles: {
                material: costoMaterial,
                energia: costoEnergia,
                maquina: costoUsoMaquina,
                fallos: sobrecostoFallo,
                primer: costoPrimer,
                lijado: piece.costoLijadoPintura,
                tiempoPostproc: costoTiempoPostproc
            }
        };
    });

    const ventaTotalBruta = pieceCalcs.reduce((s, c) => s + c.costoVenta, 0);
    const totalCostoImpresion = pieceCalcs.reduce((s, c) => s + c.costoProduccionImpresion, 0);
    const totalCostoPostprocesado = pieceCalcs.reduce((s, c) => s + c.costoProduccionPostprocesado, 0);
    const costoTotalProduccion = totalCostoImpresion + totalCostoPostprocesado;

    // Aggregated details
    const detalles = {
        material: pieceCalcs.reduce((s, c) => s + c.detalles.material, 0),
        energia: pieceCalcs.reduce((s, c) => s + c.detalles.energia, 0),
        maquina: pieceCalcs.reduce((s, c) => s + c.detalles.maquina, 0),
        fallos: pieceCalcs.reduce((s, c) => s + c.detalles.fallos, 0),
        primer: pieceCalcs.reduce((s, c) => s + c.detalles.primer, 0),
        lijado: pieceCalcs.reduce((s, c) => s + c.detalles.lijado, 0),
        tiempoPostproc: pieceCalcs.reduce((s, c) => s + c.detalles.tiempoPostproc, 0),
    };

    // Aplicar descuento grupal a la venta
    const descuentoGrupo = pieces.length > 1 ? calcDescuentoGrupo(totalFilamento) : 0;
    const valorVentaFinal = ventaTotalBruta * (1 - descuentoGrupo);

    const gananciaNeta = valorVentaFinal - costoTotalProduccion;

    return {
        valorVentaFinal,
        totalCostoImpresion,
        totalCostoPostprocesado,
        costoTotalProduccion,
        gananciaNeta,
        detalles // Return detail breakdown
    };
};
