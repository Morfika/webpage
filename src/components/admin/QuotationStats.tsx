import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, FileSpreadsheet, Info } from "lucide-react";
import { Quotation, PrinterConfig } from "@/lib/quotations";
import { calculateQuotationTotals } from "@/lib/cost-calculations";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface QuotationStatsProps {
    quotations: Quotation[];
    printers: PrinterConfig[];
}

const QuotationStats = ({ quotations, printers }: QuotationStatsProps) => {
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
    });

    const formatCOP = (n: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

    const dailyStats = useMemo(() => {
        const grouped: Record<string, {
            date: Date;
            totalVenta: number;
            totalCostoImpresion: number;
            totalCostoPostproc: number;
            gananciaNeta: number;
            count: number;
            detalles: {
                material: number;
                energia: number;
                maquina: number;
                fallos: number;
                primer: number;
                lijado: number;
                tiempoPostproc: number;
            }
        }> = {};

        quotations.forEach((q) => {
            const qDate = new Date(q.createdAt);
            const qTime = qDate.getTime();
            const fromTime = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)).getTime() : 0;
            const toTime = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)).getTime() : Infinity;

            if (qTime < fromTime || qTime > toTime) return;

            const dayKey = format(qDate, "yyyy-MM-dd");

            if (!grouped[dayKey]) {
                grouped[dayKey] = {
                    date: qDate,
                    totalVenta: 0,
                    totalCostoImpresion: 0,
                    totalCostoPostproc: 0,
                    gananciaNeta: 0,
                    count: 0,
                    detalles: { material: 0, energia: 0, maquina: 0, fallos: 0, primer: 0, lijado: 0, tiempoPostproc: 0 }
                };
            }

            const {
                valorVentaFinal, totalCostoImpresion, totalCostoPostprocesado, gananciaNeta, detalles
            } = calculateQuotationTotals(q.pieces, printers);

            grouped[dayKey].totalVenta += valorVentaFinal;
            grouped[dayKey].totalCostoImpresion += totalCostoImpresion;
            grouped[dayKey].totalCostoPostproc += totalCostoPostprocesado;
            grouped[dayKey].gananciaNeta += gananciaNeta;
            grouped[dayKey].count += 1;

            // Acumular detalles
            grouped[dayKey].detalles.material += detalles.material;
            grouped[dayKey].detalles.energia += detalles.energia;
            grouped[dayKey].detalles.maquina += detalles.maquina;
            grouped[dayKey].detalles.fallos += detalles.fallos;
            grouped[dayKey].detalles.primer += detalles.primer;
            grouped[dayKey].detalles.lijado += detalles.lijado;
            grouped[dayKey].detalles.tiempoPostproc += detalles.tiempoPostproc;
        });

        return Object.values(grouped).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [quotations, printers, dateRange]);

    const grandTotal = dailyStats.reduce((acc, curr) => ({
        totalVenta: acc.totalVenta + curr.totalVenta,
        totalCostoImpresion: acc.totalCostoImpresion + curr.totalCostoImpresion,
        totalCostoPostproc: acc.totalCostoPostproc + curr.totalCostoPostproc,
        gananciaNeta: acc.gananciaNeta + curr.gananciaNeta,
        count: acc.count + curr.count,
        detalles: {
            material: acc.detalles.material + curr.detalles.material,
            energia: acc.detalles.energia + curr.detalles.energia,
            maquina: acc.detalles.maquina + curr.detalles.maquina,
            fallos: acc.detalles.fallos + curr.detalles.fallos,
            primer: acc.detalles.primer + curr.detalles.primer,
            lijado: acc.detalles.lijado + curr.detalles.lijado,
            tiempoPostproc: acc.detalles.tiempoPostproc + curr.detalles.tiempoPostproc,
        }
    }), {
        totalVenta: 0, totalCostoImpresion: 0, totalCostoPostproc: 0, gananciaNeta: 0, count: 0,
        detalles: { material: 0, energia: 0, maquina: 0, fallos: 0, primer: 0, lijado: 0, tiempoPostproc: 0 }
    });

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Filters Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-morfika-glow" />
                    <h3 className="font-bold text-lg">Reporte de Resultados</h3>
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !dateRange.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                            {format(dateRange.to, "LLL dd, y", { locale: es })}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y", { locale: es })
                                    )
                                ) : (
                                    <span>Seleccionar fechas</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange.from}
                                selected={dateRange}
                                onSelect={(range: any) => setDateRange(range)}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Ventas */}
                <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ventas Totales</span>
                    <span className="text-2xl font-bold text-foreground">{formatCOP(grandTotal.totalVenta)}</span>
                </div>

                {/* Costos Impresión (Clickable) */}
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors group relative">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                Costos Impresión <Info className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                            </span>
                            <span className="text-2xl font-bold text-orange-500/80">{formatCOP(grandTotal.totalCostoImpresion)}</span>
                            <span className="text-[10px] text-muted-foreground text-center line-clamp-1">
                                (Click para detalles)
                            </span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm border-b pb-1 mb-2">Desglose Impresión</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Material:</span>
                                <span>{formatCOP(grandTotal.detalles.material)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Energía:</span>
                                <span>{formatCOP(grandTotal.detalles.energia)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Uso Máquina:</span>
                                <span>{formatCOP(grandTotal.detalles.maquina)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Fallos (Sobrecosto):</span>
                                <span className="text-destructive">{formatCOP(grandTotal.detalles.fallos)}</span>
                            </div>
                            <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                                <span>Total:</span>
                                <span>{formatCOP(grandTotal.totalCostoImpresion)}</span>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Costos Postproc. (Clickable) */}
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors group relative">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                Costos Postproc. <Info className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                            </span>
                            <span className="text-2xl font-bold text-blue-500/80">{formatCOP(grandTotal.totalCostoPostproc)}</span>
                            <span className="text-[10px] text-muted-foreground text-center line-clamp-1">
                                (Click para detalles)
                            </span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm border-b pb-1 mb-2">Desglose Postprocesado</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Primer/Imprimación:</span>
                                <span>{formatCOP(grandTotal.detalles.primer)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Lija y Pintura:</span>
                                <span>{formatCOP(grandTotal.detalles.lijado)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Mano de Obra (Tiempo):</span>
                                <span>{formatCOP(grandTotal.detalles.tiempoPostproc)}</span>
                            </div>
                            <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                                <span>Total:</span>
                                <span>{formatCOP(grandTotal.totalCostoPostproc)}</span>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Ganancia */}
                <div className="bg-card border border-morfika-glow/50 bg-morfika-glow/5 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(var(--morfika-glow-rgb),0.1)]">
                    <span className="text-xs text-morfika-glow uppercase tracking-wider mb-1 font-semibold">Ganancia Neta</span>
                    <span className="text-2xl font-bold text-morfika-glow">{formatCOP(grandTotal.gananciaNeta)}</span>
                    <span className="text-[10px] text-morfika-glow/70">
                        {grandTotal.totalVenta > 0 ? ((grandTotal.gananciaNeta / grandTotal.totalVenta) * 100).toFixed(1) : 0}% Margen
                    </span>
                </div>
            </div>

            {/* Results Table (Horizontal) */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm item-center text-left">
                        <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
                                <th className="px-4 py-3 whitespace-nowrap text-center">Cts</th>
                                <th className="px-4 py-3 whitespace-nowrap text-right text-foreground">Venta Total</th>
                                <th className="px-4 py-3 whitespace-nowrap text-right">Costo Impresión</th>
                                <th className="px-4 py-3 whitespace-nowrap text-right">Costo Postproc.</th>
                                <th className="px-4 py-3 whitespace-nowrap text-right text-morfika-glow">Ganancia Neta</th>
                                <th className="px-4 py-3 whitespace-nowrap text-right">% Margen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {dailyStats.length > 0 ? (
                                dailyStats.map((day) => (
                                    <tr key={day.date.toISOString()} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {format(day.date, "EEEE, d 'de' MMMM", { locale: es })}
                                        </td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">
                                            <span className="bg-muted px-2 py-0.5 rounded text-xs">{day.count}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">{formatCOP(day.totalVenta)}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">{formatCOP(day.totalCostoImpresion)}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">{formatCOP(day.totalCostoPostproc)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-morfika-glow">{formatCOP(day.gananciaNeta)}</td>
                                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                                            {((day.gananciaNeta / day.totalVenta) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        No hay datos para el rango de fechas seleccionado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {dailyStats.length > 0 && (
                            <tfoot className="bg-muted/50 font-medium border-t border-border">
                                <tr>
                                    <td className="px-4 py-3">Total Periodo</td>
                                    <td className="px-4 py-3 text-center">{grandTotal.count}</td>
                                    <td className="px-4 py-3 text-right">{formatCOP(grandTotal.totalVenta)}</td>
                                    <td className="px-4 py-3 text-right">{formatCOP(grandTotal.totalCostoImpresion)}</td>
                                    <td className="px-4 py-3 text-right">{formatCOP(grandTotal.totalCostoPostproc)}</td>
                                    <td className="px-4 py-3 text-right text-morfika-glow">{formatCOP(grandTotal.gananciaNeta)}</td>
                                    <td className="px-4 py-3 text-right">
                                        {grandTotal.totalVenta > 0 ? ((grandTotal.gananciaNeta / grandTotal.totalVenta) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuotationStats;
