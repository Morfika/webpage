import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Trash2, Calculator, Cpu, ImagePlus, FileText, X, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

// Types
interface PrinterConfig {
  id: string;
  name: string;
  consumoWh: number; // watts per hour
  costoPorKwh: number; // cost per KWh in COP
  costoMinuto: number; // costo por minuto de uso ($)
}

interface PrintPiece {
  id: string;
  name: string;
  image: string;
  material: string;
  costo1kg: number;
  consumoGramos: number;
  tiempoMinutos: number;
  printerId: string;
  // Post-processing
  primerCosto200ml: number;
  consumoPrimerGramos: number;
  costoLijadoPintura: number;
  tiempoPostprocesado: number; // minutes
  costoPorHoraPostprocesado: number;
}

interface Quotation {
  id: string;
  clientName: string;
  pieces: PrintPiece[];
  createdAt: string;
}

// Storage
const getPrinterConfigs = (): PrinterConfig[] => {
  const stored = localStorage.getItem("morfika_printer_configs");
  return stored ? JSON.parse(stored) : [];
};
const savePrinterConfigs = (configs: PrinterConfig[]) => {
  localStorage.setItem("morfika_printer_configs", JSON.stringify(configs));
};
const getQuotations = (): Quotation[] => {
  const stored = localStorage.getItem("morfika_quotations");
  return stored ? JSON.parse(stored) : [];
};
const saveQuotations = (q: Quotation[]) => {
  localStorage.setItem("morfika_quotations", JSON.stringify(q));
};

// Calculation helpers
const calcCostoGramo = (costo1kg: number) => costo1kg / 1000;

const calcCostoMaterial = (costo1kg: number, consumoGramos: number) =>
  calcCostoGramo(costo1kg) * consumoGramos;

const calcCostoEnergia = (printer: PrinterConfig | undefined, tiempoMinutos: number) => {
  if (!printer) return 0;
  // =((((1*consumoWh)/1000)*costoPorKwh)/60)*tiempoMinutos
  const consumoKwh = (printer.consumoWh / 1000) * (tiempoMinutos / 60);
  return consumoKwh * printer.costoPorKwh;
};

const calcCostoUsoMaquina = (printer: PrinterConfig | undefined, tiempoMinutos: number) => {
  if (!printer) return 0;
  // =$O$11*G4 donde O$11 es tiempo en minutos y G4 es costo por minuto
  return tiempoMinutos * printer.costoMinuto;
};

const calcSobrecostoPorFallo = (costoMaterial: number, costoEnergia: number, costoUsoMaquina: number, porcentajeFallo: number = 0.3) => {
  // Sobrecosto es un porcentaje del costo base (material + energía + uso máquina)
  return (costoMaterial + costoEnergia + costoUsoMaquina) * porcentajeFallo;
};

const calcPorcentajeGanancia = (consumoGramos: number): number => {
  // =SI((D4)<900; SI(D4<20; 170%; 60%-(D4)*0.06/100); 15%)
  if (consumoGramos < 900) {
    if (consumoGramos < 20) {
      return 1.7; // 170%
    }
    return 0.6 - (consumoGramos * 0.06 / 100); // 60% - consumption*0.06/100
  }
  return 0.15; // 15%
};

const calcCostoImpresion = (piece: PrintPiece, printer: PrinterConfig | undefined) => {
  const costoMaterial = calcCostoMaterial(piece.costo1kg, piece.consumoGramos);
  const costoEnergia = calcCostoEnergia(printer, piece.tiempoMinutos);
  const costoUsoMaquina = calcCostoUsoMaquina(printer, piece.tiempoMinutos);
  const sobrecostoFallo = calcSobrecostoPorFallo(costoMaterial, costoEnergia, costoUsoMaquina);
  const porcentajeGanancia = calcPorcentajeGanancia(piece.consumoGramos);

  // Fórmula: (E+H+I+J)+((E+H+I+J)*K)
  const base = costoMaterial + costoEnergia + costoUsoMaquina + sobrecostoFallo;
  return base + (base * porcentajeGanancia);
};

const calcPostprocesado = (piece: PrintPiece) => {
  const costoPrimerMl = piece.primerCosto200ml / 200;
  const costoPrimer = costoPrimerMl * piece.consumoPrimerGramos;
  const horasPostprocesado = piece.tiempoPostprocesado / 60;
  const costoTiempo = horasPostprocesado * piece.costoPorHoraPostprocesado;
  return costoPrimer + piece.costoLijadoPintura + costoTiempo;
};

const calcDescuentoGrupo = (totalFilamentoGramos: number): number => {
  // =MIN(D6/1000 * 10%; 10%)
  return Math.min((totalFilamentoGramos / 1000) * 0.1, 0.1);
};

const defaultPiece = (): PrintPiece => ({
  id: Date.now().toString(),
  name: "",
  image: "",
  material: "PLA",
  costo1kg: 70000,
  consumoGramos: 0,
  tiempoMinutos: 0,
  printerId: "",
  primerCosto200ml: 0,
  consumoPrimerGramos: 0,
  costoLijadoPintura: 0,
  tiempoPostprocesado: 5,
  costoPorHoraPostprocesado: 20000,
});

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

// ─── Main Component ─────────────────────────────────────────────
const PrintCostCalculator = () => {
  const { toast } = useToast();
  const [printers, setPrinters] = useState<PrinterConfig[]>(getPrinterConfigs());
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);
  const [pieces, setPieces] = useState<PrintPiece[]>([defaultPiece()]);
  const [clientName, setClientName] = useState("");
  const [quotations, setQuotations] = useState<Quotation[]>(getQuotations());
  const [currentQuotationId, setCurrentQuotationId] = useState<string | null>(null);
  const [showPrinterManager, setShowPrinterManager] = useState(false);
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);
  const [timeInputMode, setTimeInputMode] = useState<Record<string, "minutes" | "hm">>({});

  useEffect(() => { savePrinterConfigs(printers); }, [printers]);
  useEffect(() => { saveQuotations(quotations); }, [quotations]);

  const getPrinter = (id: string) => printers.find((p) => p.id === id);

  // Derived calculations for all pieces
  const pieceCalcs = useMemo(() => {
    return pieces.map((piece) => {
      const printer = getPrinter(piece.printerId);
      const costoGramo = calcCostoGramo(piece.costo1kg);
      const costoMaterial = calcCostoMaterial(piece.costo1kg, piece.consumoGramos);
      const costoEnergia = calcCostoEnergia(printer, piece.tiempoMinutos);
      const costoUsoMaquina = calcCostoUsoMaquina(printer, piece.tiempoMinutos);
      const sobrecostoFallo = calcSobrecostoPorFallo(costoMaterial, costoEnergia, costoUsoMaquina);
      const porcentajeGanancia = calcPorcentajeGanancia(piece.consumoGramos);
      const costoImpresion = calcCostoImpresion(piece, printer);
      const costoPostprocesado = calcPostprocesado(piece);
      const costoVenta = costoImpresion + costoPostprocesado;
      return {
        costoGramo, costoMaterial, costoEnergia, costoUsoMaquina,
        sobrecostoFallo, porcentajeGanancia, costoImpresion,
        costoPostprocesado, costoVenta,
      };
    });
  }, [pieces, printers]);

  const totalFilamento = pieces.reduce((s, p) => s + p.consumoGramos, 0);
  const ventaTotal = pieceCalcs.reduce((s, c) => s + c.costoVenta, 0);
  const descuentoGrupo = pieces.length > 1 ? calcDescuentoGrupo(totalFilamento) : 0;
  const valorVenta = ventaTotal * (1 - descuentoGrupo);
  const gananciaNeta = valorVenta - pieceCalcs.reduce((s, c) => s + (c.costoMaterial + c.costoEnergia + c.costoUsoMaquina + c.sobrecostoFallo), 0);

  const updatePiece = (id: string, updates: Partial<PrintPiece>) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addPiece = () => setPieces((prev) => [...prev, defaultPiece()]);
  const removePiece = (id: string) => setPieces((prev) => prev.filter((p) => p.id !== id));

  const handleSaveQuotation = () => {
    if (!clientName.trim()) {
      toast({ title: "Ingresa el nombre del cliente", variant: "destructive" });
      return;
    }

    if (currentQuotationId) {
      // Update existing
      setQuotations((prev) => prev.map((q) =>
        q.id === currentQuotationId
          ? { ...q, clientName, pieces: [...pieces], createdAt: new Date().toISOString() }
          : q
      ));
      toast({ title: "Cotización actualizada" });
    } else {
      // Create new
      const q: Quotation = {
        id: Date.now().toString(),
        clientName,
        pieces: [...pieces],
        createdAt: new Date().toISOString(),
      };
      setQuotations((prev) => [q, ...prev]);
      toast({ title: "Cotización guardada" });
    }

    // Reset form
    setPieces([defaultPiece()]);
    setClientName("");
    setCurrentQuotationId(null);
  };

  const loadQuotation = (q: Quotation) => {
    setClientName(q.clientName);
    setPieces(q.pieces);
    setCurrentQuotationId(q.id);
    toast({ title: "Cotización cargada para editar" });
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setPieces([defaultPiece()]);
    setClientName("");
    setCurrentQuotationId(null);
  };

  const savePrinterItem = (printer: PrinterConfig) => {
    if (!printer.name.trim()) return;
    const isNew = !printers.find((p) => p.id === printer.id);
    if (isNew) {
      setPrinters((prev) => [...prev, { ...printer, id: Date.now().toString() }]);
    } else {
      setPrinters((prev) => prev.map((p) => (p.id === printer.id ? printer : p)));
    }
    setEditingPrinter(null);
    toast({ title: "Impresora guardada" });
  };

  const handleImageUpload = (pieceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updatePiece(pieceId, { image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const getTimeDisplay = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-6 h-6 text-morfika-glow" />
          {currentQuotationId ? "Editando Cotización" : "Cotizador de Impresión"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPrinterManager(true)}>
            <Cpu className="w-4 h-4 mr-2" />
            Impresoras
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-morfika-purple/10 border border-morfika-purple/30 rounded-xl p-4 text-sm text-muted-foreground">
        Los costos aquí enunciados son meramente relacionados al proceso de impresión 3D, no incluyen diseño ni postprocesado (a menos que se agregue abajo).
      </div>

      {/* Client name */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground whitespace-nowrap">Cliente:</label>
        <Input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nombre del cliente"
          className="max-w-xs"
        />
      </div>

      {/* ─── Pieces ───────────────────────────────────────────── */}
      {pieces.map((piece, idx) => {
        const calc = pieceCalcs[idx];
        const mode = timeInputMode[piece.id] || "minutes";
        return (
          <div key={piece.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Piece header */}
            <div className="bg-morfika-purple/10 px-6 py-3 flex justify-between items-center border-b border-border">
              <div className="flex items-center gap-3">
                <span className="bg-morfika-purple/30 text-morfika-glow w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <Input
                  value={piece.name}
                  onChange={(e) => updatePiece(piece.id, { name: e.target.value })}
                  placeholder="Nombre de la pieza"
                  className="bg-transparent border-0 text-foreground font-semibold text-lg p-0 h-auto focus-visible:ring-0 max-w-[300px]"
                />
              </div>
              {pieces.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removePiece(piece.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Image & basic info */}
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                {/* Image upload */}
                <div className="flex flex-col items-center gap-2">
                  <label className="cursor-pointer group">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(piece.id, e)} />
                    <div className="w-28 h-28 rounded-xl border-2 border-dashed border-border group-hover:border-morfika-glow/50 transition-colors flex items-center justify-center overflow-hidden bg-muted/30">
                      {piece.image ? (
                        <img src={piece.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                  </label>
                  <span className="text-xs text-muted-foreground">Subir foto</span>
                </div>

                {/* Printing fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-morfika-glow uppercase tracking-wide">Impresión</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Material */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Material</label>
                      <Select value={piece.material} onValueChange={(v) => updatePiece(piece.id, { material: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLA">PLA</SelectItem>
                          <SelectItem value="PETG">PETG</SelectItem>
                          <SelectItem value="ABS">ABS</SelectItem>
                          <SelectItem value="TPU">TPU</SelectItem>
                          <SelectItem value="Nylon">Nylon</SelectItem>
                          <SelectItem value="Resina">Resina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Costo 1kg */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Costo 1kg ($)</label>
                      <Input type="number" value={piece.costo1kg || ""} onChange={(e) => updatePiece(piece.id, { costo1kg: Number(e.target.value) })} />
                    </div>
                    {/* Consumo */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Consumo (g)</label>
                      <Input type="number" value={piece.consumoGramos || ""} onChange={(e) => updatePiece(piece.id, { consumoGramos: Number(e.target.value) })} />
                    </div>
                    {/* Impresora */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Impresora</label>
                      <Select value={piece.printerId} onValueChange={(v) => updatePiece(piece.id, { printerId: v })}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {printers.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Tiempo */}
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-muted-foreground">Tiempo</label>
                        <button
                          className="text-[10px] text-morfika-glow underline"
                          onClick={() => setTimeInputMode((prev) => ({ ...prev, [piece.id]: mode === "minutes" ? "hm" : "minutes" }))}
                        >
                          {mode === "minutes" ? "H:M" : "Min"}
                        </button>
                      </div>
                      {mode === "minutes" ? (
                        <Input
                          type="number"
                          value={piece.tiempoMinutos || ""}
                          onChange={(e) => updatePiece(piece.id, { tiempoMinutos: Number(e.target.value) })}
                          placeholder="minutos"
                        />
                      ) : (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={Math.floor(piece.tiempoMinutos / 60) || ""}
                            onChange={(e) => updatePiece(piece.id, { tiempoMinutos: Number(e.target.value) * 60 + (piece.tiempoMinutos % 60) })}
                            placeholder="h"
                            className="w-16"
                          />
                          <Input
                            type="number"
                            value={piece.tiempoMinutos % 60 || ""}
                            onChange={(e) => updatePiece(piece.id, { tiempoMinutos: Math.floor(piece.tiempoMinutos / 60) * 60 + Number(e.target.value) })}
                            placeholder="m"
                            className="w-16"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Calculated printing costs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-muted/20 rounded-xl p-4">
                    <CostBadge label="Costo/g" value={formatCOP(calc?.costoGramo || 0)} />
                    <CostBadge label="Costo Material" value={formatCOP(calc?.costoMaterial || 0)} />
                    <CostBadge label="Costo Energía" value={formatCOP(calc?.costoEnergia || 0)} />
                    <CostBadge label="Uso Máquina" value={formatCOP(calc?.costoUsoMaquina || 0)} />
                    <CostBadge label="Sobrecosto Fallo" value={formatCOP(calc?.sobrecostoFallo || 0)} />
                    <CostBadge label="% Ganancia" value={`${((calc?.porcentajeGanancia || 0) * 100).toFixed(0)}%`} accent />
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Tiempo: {getTimeDisplay(piece.tiempoMinutos)}</span>
                    <div className="flex-1" />
                    <div className="bg-morfika-purple/20 border border-morfika-purple/40 rounded-xl px-5 py-2">
                      <span className="text-xs text-muted-foreground block">Costo Impresión</span>
                      <span className="text-lg font-bold text-morfika-glow">{formatCOP(calc?.costoImpresion || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post-processing */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-morfika-glow uppercase tracking-wide flex items-center gap-2 select-none">
                  <span className="transition-transform group-open:rotate-90">▶</span>
                  Postprocesado (opcional)
                </summary>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Primer costo 200ml ($)</label>
                    <Input type="number" value={piece.primerCosto200ml || ""} onChange={(e) => updatePiece(piece.id, { primerCosto200ml: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Consumo Primer (ml)</label>
                    <Input type="number" value={piece.consumoPrimerGramos || ""} onChange={(e) => updatePiece(piece.id, { consumoPrimerGramos: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Lijado y Pintura ($)</label>
                    <Input type="number" value={piece.costoLijadoPintura || ""} onChange={(e) => updatePiece(piece.id, { costoLijadoPintura: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Tiempo postproc. (min)</label>
                    <Input type="number" value={piece.tiempoPostprocesado || ""} onChange={(e) => updatePiece(piece.id, { tiempoPostprocesado: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Costo/hora postproc. ($)</label>
                    <Input type="number" value={piece.costoPorHoraPostprocesado || ""} onChange={(e) => updatePiece(piece.id, { costoPorHoraPostprocesado: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="mt-3 bg-muted/20 rounded-xl p-3 flex justify-end">
                  <CostBadge label="Costo Postprocesado" value={formatCOP(calc?.costoPostprocesado || 0)} />
                </div>
              </details>

              {/* Piece total */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-morfika-purple/30 to-morfika-blue/30 border border-morfika-glow/30 rounded-xl px-6 py-3 text-right">
                  <span className="text-xs text-muted-foreground block">Costo de Venta</span>
                  <span className="text-xl font-bold text-foreground">{formatCOP(calc?.costoVenta || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add piece */}
      <Button variant="outline" onClick={addPiece} className="w-full border-dashed border-2">
        <Plus className="w-4 h-4 mr-2" />
        Agregar Pieza
      </Button>

      {/* ─── Group Summary ────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground">Resumen de Cotización</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <CostBadge label="Piezas" value={String(pieces.length)} />
          <CostBadge label="Filamento Total" value={`${totalFilamento}g`} />
          <CostBadge label="Venta Total" value={formatCOP(ventaTotal)} />
          <CostBadge label="Desc. Grupo" value={`${(descuentoGrupo * 100).toFixed(2)}%`} accent />
          <CostBadge label="Valor Venta" value={formatCOP(valorVenta)} accent />
          <CostBadge label="Ganancia Neta" value={formatCOP(gananciaNeta)} />
        </div>

        <p className="text-xs text-muted-foreground">
          El descuento grupal se aplica sobre el total: MIN(filamento_total_g / 1000 × 10%, 10%). Máximo 10% con 1kg+.
        </p>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={cancelEditing}>
            {currentQuotationId ? "Cancelar Edición" : "Limpiar"}
          </Button>
          <Button className="btn-glow border-0" onClick={handleSaveQuotation}>
            <Save className="w-4 h-4 mr-2" />
            {currentQuotationId ? "Actualizar Cotización" : "Guardar Cotización"}
          </Button>
        </div>
      </div>

      {/* ─── Saved Quotations ─────────────────────────────────── */}
      {quotations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-morfika-glow" />
            Cotizaciones Guardadas
          </h3>
          <div className="grid gap-3">
            {quotations.map((q) => {
              const qTotalFil = q.pieces.reduce((s, p) => s + p.consumoGramos, 0);
              const qCalcs = q.pieces.map((piece) => {
                const printer = getPrinter(piece.printerId);
                return calcCostoImpresion(piece, printer) + calcPostprocesado(piece);
              });
              const qTotal = qCalcs.reduce((s, c) => s + c, 0);
              const qDesc = q.pieces.length > 1 ? calcDescuentoGrupo(qTotalFil) : 0;
              const qValor = qTotal * (1 - qDesc);
              return (
                <div key={q.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{q.clientName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {q.pieces.length} pieza{q.pieces.length > 1 ? "s" : ""} · {new Date(q.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <span className="font-bold text-morfika-glow">{formatCOP(qValor)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => loadQuotation(q)} title="Ver / Editar">
                      <FileText className="w-4 h-4 text-morfika-glow" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setQuotations((prev) => prev.filter((x) => x.id !== q.id));
                      toast({ title: "Cotización eliminada" });
                      if (currentQuotationId === q.id) cancelEditing();
                    }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Printer Manager Modal ────────────────────────────── */}
      {showPrinterManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowPrinterManager(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Gestión de Impresoras</h3>
              <button onClick={() => setShowPrinterManager(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {printers.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-muted/20 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.consumoWh}Wh · {formatCOP(p.costoPorKwh)}/kWh · {formatCOP(p.costoMinuto)}/min</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingPrinter(p)}>Editar</Button>
                  <Button variant="ghost" size="icon" onClick={() => setPrinters((prev) => prev.filter((x) => x.id !== p.id))}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {printers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hay impresoras registradas</p>
              )}
            </div>

            {/* Add/Edit printer form */}
            {editingPrinter ? (
              <div className="space-y-3 border-t border-border pt-4">
                <Input placeholder="Nombre" value={editingPrinter.name} onChange={(e) => setEditingPrinter({ ...editingPrinter, name: e.target.value })} />
                <Input type="number" placeholder="Consumo (Wh)" value={editingPrinter.consumoWh || ""} onChange={(e) => setEditingPrinter({ ...editingPrinter, consumoWh: Number(e.target.value) })} />
                <Input type="number" placeholder="Costo por kWh ($)" value={editingPrinter.costoPorKwh || ""} onChange={(e) => setEditingPrinter({ ...editingPrinter, costoPorKwh: Number(e.target.value) })} />
                <Input type="number" placeholder="Costo por minuto ($)" value={editingPrinter.costoMinuto || ""} onChange={(e) => setEditingPrinter({ ...editingPrinter, costoMinuto: Number(e.target.value) })} />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingPrinter(null)} className="flex-1">Cancelar</Button>
                  <Button className="flex-1 btn-glow border-0" onClick={() => savePrinterItem(editingPrinter)}>Guardar</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setEditingPrinter({ id: "", name: "", consumoWh: 400, costoPorKwh: 907, costoMinuto: 25 })}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Impresora
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Small reusable badge
const CostBadge = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="text-center">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={`text-sm font-bold ${accent ? "text-morfika-glow" : "text-foreground"}`}>{value}</p>
  </div>
);

export default PrintCostCalculator;