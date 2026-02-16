
import { supabase } from "./supabase";
import { uploadImage } from "./supabase";

// --- Types ---
export interface PrinterConfig {
    id: string;
    name: string;
    consumoWh: number;
    costoPorKwh: number;
    costoMinuto: number;
}

export interface PrintPiece {
    id: string; // Puede ser UUID o temp ID
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
    tiempoPostprocesado: number;
    costoPorHoraPostprocesado: number;
}

export interface Quotation {
    id: string;
    clientName: string;
    pieces: PrintPiece[];
    createdAt: string;
}

// --- Printers ---
export const getPrintersDB = async (): Promise<PrinterConfig[]> => {
    const { data, error } = await supabase.from('printers').select('*').order('name');
    if (error) {
        console.error('Error fetching printers:', error);
        return [];
    }
    return data.map((p) => ({
        id: p.id,
        name: p.name,
        consumoWh: Number(p.consumo_wh),
        costoPorKwh: Number(p.costo_kwh),
        costoMinuto: Number(p.costo_minuto),
    }));
};

export const savePrinterDB = async (printer: PrinterConfig): Promise<string> => {
    const p = {
        name: printer.name,
        consumo_wh: printer.consumoWh,
        costo_kwh: printer.costoPorKwh,
        costo_minuto: printer.costoMinuto,
    };

    if (printer.id && printer.id.length > 20) { // UUID check roughly (UUID is 36 chars)
        const { error } = await supabase.from('printers').update(p).eq('id', printer.id);
        if (error) throw error;
        return printer.id;
    } else {
        const { data, error } = await supabase.from('printers').insert(p).select().single();
        if (error) throw error;
        return data.id;
    }
};

export const deletePrinterDB = async (id: string) => {
    const { error } = await supabase.from('printers').delete().eq('id', id);
    if (error) throw error;
};

// --- Quotations ---
export const getQuotationsDB = async (): Promise<Quotation[]> => {
    const { data: qData, error: qError } = await supabase
        .from('quotations')
        .select('*, quotation_items(*)')
        .order('created_at', { ascending: false });

    if (qError) {
        console.error('Error fetching quotations:', qError);
        return [];
    }

    return qData.map((q: any) => ({
        id: q.id,
        clientName: q.client_name,
        createdAt: q.created_at,
        pieces: (q.quotation_items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            image: item.image_url || "",
            material: item.material,
            costo1kg: Number(item.costo_1kg),
            consumoGramos: Number(item.consumo_gramos),
            tiempoMinutos: Number(item.tiempo_minutos),
            printerId: item.printer_id || "",
            primerCosto200ml: Number(item.primer_costo_200ml),
            consumoPrimerGramos: Number(item.consumo_primer_gramos),
            costoLijadoPintura: Number(item.costo_lijado_pintura),
            tiempoPostprocesado: Number(item.tiempo_postprocesado),
            costoPorHoraPostprocesado: Number(item.costo_hora_postprocesado),
        })),
    }));
};

export const saveQuotationDB = async (quotation: Quotation, isUpdate: boolean): Promise<string> => {
    // 1. Save Header
    let qId = quotation.id;

    if (isUpdate && qId.length > 20) {
        const { error } = await supabase
            .from('quotations')
            .update({ client_name: quotation.clientName })
            .eq('id', qId);
        if (error) throw error;

        // Delete existing items to replace them (simplest way to handle updates on items)
        await supabase.from('quotation_items').delete().eq('quotation_id', qId);
    } else {
        const { data, error } = await supabase
            .from('quotations')
            .insert({ client_name: quotation.clientName })
            .select()
            .single();
        if (error) throw error;
        qId = data.id;
    }

    // 2. Save Items
    // Note: We don't save the piece ID if it's new because database generates UUID
    const items = quotation.pieces.map((p) => ({
        quotation_id: qId,
        name: p.name,
        image_url: p.image.startsWith('http') ? p.image : null, // Only save uploaded URLs
        material: p.material,
        costo_1kg: p.costo1kg,
        consumo_gramos: p.consumoGramos,
        tiempo_minutos: p.tiempoMinutos,
        printer_id: (p.printerId && p.printerId.length > 20) ? p.printerId : null, // Validate UUID
        primer_costo_200ml: p.primerCosto200ml,
        consumo_primer_gramos: p.consumoPrimerGramos,
        costo_lijado_pintura: p.costoLijadoPintura,
        tiempo_postprocesado: p.tiempoPostprocesado,
        costo_hora_postprocesado: p.costoPorHoraPostprocesado,
    }));

    if (items.length > 0) {
        const { error: itemsError } = await supabase.from('quotation_items').insert(items);
        if (itemsError) throw itemsError;
    }

    return qId;
};

export const deleteQuotationDB = async (id: string) => {
    const { error } = await supabase.from('quotations').delete().eq('id', id);
    if (error) throw error;
};

// Helper for image upload in quotations
export const uploadQuotationImage = async (file: File) => {
    return await uploadImage(file, 'quotations');
};
