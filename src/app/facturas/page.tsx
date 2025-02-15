"use client";

import { Receipt } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

import { FacturasTable } from '@/components/facturas/facturas-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { obtenerFacturasDelMes } from '@/lib/services/factura.service';
import { FacturaCompleta } from '@/lib/types/facturas';

export default function FacturasPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [facturas, setFacturas] = useState<FacturaCompleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        const response = await obtenerFacturasDelMes(month, year);
        setFacturas(response);
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [month, year]);

const totalSum = facturas.reduce((sum, factura) => sum + factura.bills.reduce((sum, bill) => sum + bill.monto_valor, 0), 0);
const totalExtras = facturas.reduce((sum, factura) => sum + (factura.extras?.reduce((sum, extra) => sum + extra.monto, 0) ?? 0), 0);
const totalConExtras = totalSum + totalExtras;

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <MonthYearPicker
              onChange={(selectedMonth, selectedYear) => {
                setMonth(selectedMonth);
                setYear(selectedYear);
              }}
            />
            <div className="mb-4">
              <h2 className="text-xl font-bold">Resumen del Mes</h2>
              <p>Total de Facturas: {facturas.length}</p>
              <p>Total de Facturas Activos: {facturas.filter(factura => factura.contracts.estado === 'activo').length}</p>
              <p>Gran Total: ${totalSum.toLocaleString("es")}</p>
              <p>Total de Extras: ${totalExtras.toLocaleString("es")}</p>
              <p>Total con Extras: ${totalConExtras.toLocaleString("es")}</p>
            </div>
          </div>
          <Suspense fallback={<div>Cargando...</div>}>
            <FacturasTable
              facturas={facturas}
              loading={loading}
              month={month}
              year={year}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
