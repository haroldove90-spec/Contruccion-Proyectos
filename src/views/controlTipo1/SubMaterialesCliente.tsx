import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { MaterialProveedor, MaterialItem } from '../../types/controlTipo1';
import { exportToCSV, triggerPrintPDF } from '../../utils/exportUtils';
import {
  ShoppingBag,
  FileSpreadsheet,
  Printer,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  CheckCircle2,
  X,
  Receipt,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SubMaterialesCliente: React.FC = () => {
  const { controlTipo1Data, updateControlTipo1Data } = useERP();
  const materialesCliente = controlTipo1Data.materialesCliente;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProveedorId, setSelectedProveedorId] = useState<string>('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ provId: string; item: MaterialItem } | null>(null);
  const [editingProveedor, setEditingProveedor] = useState<MaterialProveedor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'proveedor' | 'item'; provId: string; itemId?: string; name: string } | null>(null);

  // Form states
  const [targetProvId, setTargetProvId] = useState<string>(materialesCliente[0]?.id || '');
  const [itemForm, setItemForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    ordenCompra: '',
    concepto: '',
    factura: '',
    pagoSinIva: 35000,
    iva: 5600,
    total: 40600,
  });

  const [provForm, setProvForm] = useState({
    empresaProveedora: '',
  });

  React.useEffect(() => {
    if (!materialesCliente.find((p) => p.id === targetProvId)) {
      setTargetProvId(materialesCliente[0]?.id || '');
    }
  }, [materialesCliente, targetProvId]);

  // Consolidated calculations
  const totalPagosSinIva = materialesCliente.reduce(
    (acc, p) => acc + p.compras.reduce((cacc, c) => cacc + c.pagoSinIva, 0),
    0
  );
  const totalIva = materialesCliente.reduce(
    (acc, p) => acc + p.compras.reduce((cacc, c) => cacc + c.iva, 0),
    0
  );
  const totalGeneral = materialesCliente.reduce(
    (acc, p) => acc + p.compras.reduce((cacc, c) => cacc + c.total, 0),
    0
  );
  const totalItemsCount = materialesCliente.reduce((acc, p) => acc + p.compras.length, 0);

  // Auto calculate IVA & Total
  const handlePagoSinIvaChange = (val: number) => {
    const calcIva = Number((val * 0.16).toFixed(2));
    const calcTot = Number((val + calcIva).toFixed(2));
    setItemForm((prev) => ({
      ...prev,
      pagoSinIva: val,
      iva: calcIva,
      total: calcTot,
    }));
  };

  const handleOpenNewItem = (preselectedProvId?: string) => {
    setEditingItem(null);
    const pId = preselectedProvId || materialesCliente[0]?.id || '';
    setTargetProvId(pId);
    setItemForm({
      fecha: new Date().toISOString().split('T')[0],
      ordenCompra: `CLI-OC-${String(totalItemsCount + 1).padStart(2, '0')}`,
      concepto: '',
      factura: `CLI-FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      pagoSinIva: 35000,
      iva: 5600,
      total: 40600,
    });
    setShowItemModal(true);
  };

  const handleOpenEditItem = (provId: string, item: MaterialItem) => {
    setEditingItem({ provId, item });
    setTargetProvId(provId);
    setItemForm({
      fecha: item.fecha,
      ordenCompra: item.ordenCompra,
      concepto: item.concepto,
      factura: item.factura,
      pagoSinIva: item.pagoSinIva,
      iva: item.iva,
      total: item.total,
    });
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProvId) return;

    if (editingItem) {
      const updated = materialesCliente.map((prov) => {
        if (prov.id === editingItem.provId) {
          if (editingItem.provId === targetProvId) {
            return {
              ...prov,
              compras: prov.compras.map((c) =>
                c.id === editingItem.item.id
                  ? {
                      ...c,
                      fecha: itemForm.fecha,
                      ordenCompra: itemForm.ordenCompra,
                      concepto: itemForm.concepto,
                      factura: itemForm.factura,
                      pagoSinIva: Number(itemForm.pagoSinIva),
                      iva: Number(itemForm.iva),
                      total: Number(itemForm.total),
                    }
                  : c
              ),
            };
          } else {
            return {
              ...prov,
              compras: prov.compras.filter((c) => c.id !== editingItem.item.id),
            };
          }
        }
        if (prov.id === targetProvId && editingItem.provId !== targetProvId) {
          return {
            ...prov,
            compras: [
              ...prov.compras,
              {
                id: editingItem.item.id,
                fecha: itemForm.fecha,
                ordenCompra: itemForm.ordenCompra,
                concepto: itemForm.concepto,
                factura: itemForm.factura,
                pagoSinIva: Number(itemForm.pagoSinIva),
                iva: Number(itemForm.iva),
                total: Number(itemForm.total),
              },
            ],
          };
        }
        return prov;
      });
      updateControlTipo1Data({ materialesCliente: updated });
    } else {
      const newItem: MaterialItem = {
        id: `matci-${Date.now()}`,
        fecha: itemForm.fecha,
        ordenCompra: itemForm.ordenCompra,
        concepto: itemForm.concepto,
        factura: itemForm.factura,
        pagoSinIva: Number(itemForm.pagoSinIva),
        iva: Number(itemForm.iva),
        total: Number(itemForm.total),
      };
      const updated = materialesCliente.map((prov) =>
        prov.id === targetProvId
          ? { ...prov, compras: [...prov.compras, newItem] }
          : prov
      );
      updateControlTipo1Data({ materialesCliente: updated });
    }
    setShowItemModal(false);
  };

  const handleOpenNewProveedor = () => {
    setEditingProveedor(null);
    setProvForm({ empresaProveedora: '' });
    setShowProveedorModal(true);
  };

  const handleOpenEditProveedor = (p: MaterialProveedor) => {
    setEditingProveedor(p);
    setProvForm({ empresaProveedora: p.empresaProveedora });
    setShowProveedorModal(true);
  };

  const handleSaveProveedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provForm.empresaProveedora.trim()) return;

    if (editingProveedor) {
      const updated = materialesCliente.map((p) =>
        p.id === editingProveedor.id
          ? { ...p, empresaProveedora: provForm.empresaProveedora.trim() }
          : p
      );
      updateControlTipo1Data({ materialesCliente: updated });
    } else {
      const newProv: MaterialProveedor = {
        id: `matc-${Date.now()}`,
        empresaProveedora: provForm.empresaProveedora.trim(),
        compras: [],
      };
      updateControlTipo1Data({ materialesCliente: [...materialesCliente, newProv] });
      setSelectedProveedorId(newProv.id);
    }
    setShowProveedorModal(false);
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'proveedor') {
      const updated = materialesCliente.filter((p) => p.id !== deleteConfirm.provId);
      updateControlTipo1Data({ materialesCliente: updated });
      if (selectedProveedorId === deleteConfirm.provId) {
        setSelectedProveedorId('all');
      }
    } else if (deleteConfirm.type === 'item' && deleteConfirm.itemId) {
      const updated = materialesCliente.map((prov) =>
        prov.id === deleteConfirm.provId
          ? { ...prov, compras: prov.compras.filter((c) => c.id !== deleteConfirm.itemId) }
          : prov
      );
      updateControlTipo1Data({ materialesCliente: updated });
    }
    setDeleteConfirm(null);
  };

  const handleExportCSV = () => {
    const headers = [
      'Empresa Proveedora (Compra Cliente)',
      'Fecha',
      'Orden Compra Cliente',
      'Concepto',
      'Factura',
      'Pago s/IVA',
      'IVA',
      'Total',
    ];

    const rows: (string | number)[][] = [];

    materialesCliente.forEach((prov) => {
      prov.compras.forEach((c) => {
        rows.push([
          prov.empresaProveedora,
          c.fecha,
          c.ordenCompra,
          c.concepto,
          c.factura,
          c.pagoSinIva,
          c.iva,
          c.total,
        ]);
      });
      const pSinIva = prov.compras.reduce((acc, c) => acc + c.pagoSinIva, 0);
      const pIva = prov.compras.reduce((acc, c) => acc + c.iva, 0);
      const pTot = prov.compras.reduce((acc, c) => acc + c.total, 0);
      rows.push([
        `SUBTOTAL ${prov.empresaProveedora}`,
        '',
        '',
        'S U M A S',
        '',
        pSinIva,
        pIva,
        pTot,
      ]);
    });

    rows.push([
      'SUMATORIA TOTAL COMPRAS DE CLIENTE',
      '',
      '',
      'TOTAL GENERAL',
      '',
      totalPagosSinIva,
      totalIva,
      totalGeneral,
    ]);

    exportToCSV(
      `Materiales_Compras_Cliente_P0-00_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  const filteredMaterialesCliente = materialesCliente
    .filter((prov) => (selectedProveedorId === 'all' ? true : prov.id === selectedProveedorId))
    .map((prov) => {
      const matchSearch = (text: string) => text.toLowerCase().includes(searchTerm.toLowerCase());
      const comprasFiltradas = prov.compras.filter((c) => {
        if (!searchTerm) return true;
        return (
          matchSearch(prov.empresaProveedora) ||
          matchSearch(c.concepto) ||
          matchSearch(c.factura) ||
          matchSearch(c.ordenCompra) ||
          matchSearch(c.fecha)
        );
      });
      return {
        ...prov,
        compras: comprasFiltradas,
      };
    })
    .filter((prov) => prov.compras.length > 0 || !searchTerm);

  return (
    <div className="space-y-6 printable-dossier">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-teal-100 text-teal-800 rounded-lg">
              Submódulo 06
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              CONTROL_TIPO1_P0-00 / MATERIALES_COMPRAS_DE_CLIENTE
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-teal-600" />
            Materiales Compras de Cliente
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de insumos, acabados y equipamiento adquiridos directamente por el cliente para el proyecto
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Descargar datos en formato Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exportar Excel
          </button>
          <button
            onClick={() => triggerPrintPDF('Materiales Compras de Cliente - Obra P0-00')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Generar vista de impresión y PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir / PDF
          </button>
          <button
            onClick={handleOpenNewProveedor}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Building2 className="w-4 h-4 text-teal-400" />
            + Proveedor Cliente
          </button>
          <button
            onClick={() => handleOpenNewItem()}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Registrar Compra Cliente
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sumatoria Cliente
            </span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-2">
            ${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Total suministrado por cliente
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Subtotal s/ IVA
            </span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-blue-700 mt-2">
            ${totalPagosSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Base facturada al cliente
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              IVA en Compras (16%)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-emerald-700 mt-2">
            ${totalIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Impuesto comprobado
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Empresas y Registros
            </span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-purple-700 mt-2">
            {materialesCliente.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">
              provs / {totalItemsCount} partidas
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Suministros del cliente
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por orden cliente, factura, material o empresa proveedora..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProveedorId}
            onChange={(e) => setSelectedProveedorId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">🏢 Todos los proveedores del cliente ({materialesCliente.length})</option>
            {materialesCliente.map((p) => (
              <option key={p.id} value={p.id}>
                {p.empresaProveedora} ({p.compras.length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Proveedores Blocks (Template Structure) */}
      <div className="space-y-6">
        {filteredMaterialesCliente.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No se encontraron compras de materiales realizadas por el cliente
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchTerm
                ? 'No hay registros que coincidan con la búsqueda. Intente con otros términos.'
                : 'Registre los insumos suministrados por el cliente para mantener el inventario conciliado.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowProveedorModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Agregar Empresa Proveedora</span>
              </button>
            )}
          </div>
        ) : (
          filteredMaterialesCliente.map((prov) => {
            const pSinIva = prov.compras.reduce((acc, c) => acc + c.pagoSinIva, 0);
            const pIva = prov.compras.reduce((acc, c) => acc + c.iva, 0);
            const pTot = prov.compras.reduce((acc, c) => acc + c.total, 0);

            return (
              <div
                key={prov.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Header Banner */}
                <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest font-mono">
                        EMPRESA PROVEEDORA (SUMINISTRO CLIENTE)
                      </div>
                      <h3 className="text-base font-black tracking-tight text-white">
                        {prov.empresaProveedora}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right sm:border-r sm:border-slate-800 sm:pr-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Subtotal Cliente
                      </div>
                      <div className="text-sm font-black font-mono text-teal-400">
                        ${pTot.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 no-print">
                      <button
                        onClick={() => handleOpenNewItem(prov.id)}
                        className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                        title="Registrar compra del cliente"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Agregar Compra</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditProveedor(prov)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="Editar nombre"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'proveedor',
                            provId: prov.id,
                            name: prov.empresaProveedora,
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                        title="Eliminar proveedor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table of Purchases */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200 font-mono">
                      <tr>
                        <th className="py-2.5 px-3">FECHA</th>
                        <th className="py-2.5 px-3">ORDEN</th>
                        <th className="py-2.5 px-4 min-w-[200px]">CONCEPTO</th>
                        <th className="py-2.5 px-3">FACTURA</th>
                        <th className="py-2.5 px-3 text-right">PAGO s/IVA</th>
                        <th className="py-2.5 px-3 text-right">IVA (16%)</th>
                        <th className="py-2.5 px-3 text-right">TOTAL</th>
                        <th className="py-2.5 px-3 text-center no-print w-20">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prov.compras.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                            No hay compras registradas para este proveedor.
                          </td>
                        </tr>
                      ) : (
                        prov.compras.map((compra) => (
                          <tr key={compra.id} className="hover:bg-teal-50/40 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                              {compra.fecha}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] border border-slate-200">
                                {compra.ordenCompra || 'S/N'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-medium text-slate-900">
                              {compra.concepto}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-blue-700 whitespace-nowrap">
                              {compra.factura || 'N/A'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 font-medium">
                              ${compra.pagoSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              ${compra.iva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 bg-teal-50/50">
                              ${compra.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-center no-print">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenEditItem(prov.id, compra)}
                                  className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                                  title="Editar compra"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'item',
                                      provId: prov.id,
                                      itemId: compra.id,
                                      name: `${compra.concepto} (${compra.factura || compra.ordenCompra})`,
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                  title="Eliminar compra"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {/* Sumas por Proveedor */}
                    <tfoot>
                      <tr className="bg-teal-50/80 border-t-2 border-teal-300 font-bold font-mono text-slate-900">
                        <td colSpan={4} className="py-2.5 px-4 tracking-widest text-teal-900 uppercase">
                          S &nbsp; U &nbsp; M &nbsp; A &nbsp; S
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800">
                          ${pSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800">
                          ${pIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-teal-900 font-black">
                          ${pTot.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="no-print"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Global Summary Footer Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-900 flex items-center justify-center font-black">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-teal-400 uppercase tracking-widest font-mono">
                SUMATORIA TOTAL COMPRAS DE CLIENTE
              </div>
              <h2 className="text-lg font-black text-white">
                Total Compras de Cliente P0-00
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-right font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-bold">
                PAGO S/ IVA
              </span>
              <span className="text-base font-bold text-slate-200">
                ${totalPagosSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-bold">
                IVA (16%)
              </span>
              <span className="text-base font-bold text-slate-200">
                ${totalIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/30">
              <span className="text-[10px] text-teal-400 uppercase block font-bold">
                TOTAL GENERAL
              </span>
              <span className="text-xl font-black text-teal-400">
                ${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Item Form (Agregar / Editar Compra Cliente) */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Editar Compra de Cliente' : 'Registrar Compra Suministrada por Cliente'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Control_Tipo1_P0-00 / Materiales Compras Cliente
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Empresa Proveedora *
                </label>
                <select
                  value={targetProvId}
                  onChange={(e) => setTargetProvId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  required
                >
                  {materialesCliente.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.empresaProveedora}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha de Compra *
                  </label>
                  <input
                    type="date"
                    value={itemForm.fecha}
                    onChange={(e) => setItemForm({ ...itemForm, fecha: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Orden de Compra Cliente
                  </label>
                  <input
                    type="text"
                    value={itemForm.ordenCompra}
                    onChange={(e) => setItemForm({ ...itemForm, ordenCompra: e.target.value })}
                    placeholder="Ej. CLI-OC-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Concepto / Descripción del Suministro *
                </label>
                <textarea
                  value={itemForm.concepto}
                  onChange={(e) => setItemForm({ ...itemForm, concepto: e.target.value })}
                  placeholder="Ej. Porcelanato 60x60, Luminarias LED, Muebles de baño Helvex..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Número de Factura Cliente
                </label>
                <input
                  type="text"
                  value={itemForm.factura}
                  onChange={(e) => setItemForm({ ...itemForm, factura: e.target.value })}
                  placeholder="Ej. CLI-FAC-1102"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold text-blue-700"
                />
              </div>

              {/* Amounts Grid */}
              <div className="p-3.5 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Pago s/IVA (Subtotal) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.pagoSinIva}
                      onChange={(e) => handlePagoSinIvaChange(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      IVA (16%)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={itemForm.iva}
                        onChange={(e) => {
                          const newIva = parseFloat(e.target.value) || 0;
                          setItemForm((prev) => ({
                            ...prev,
                            iva: newIva,
                            total: Number((prev.pagoSinIva + newIva).toFixed(2)),
                          }));
                        }}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      Total con IVA
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-teal-600">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={itemForm.total}
                        onChange={(e) => setItemForm({ ...itemForm, total: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-teal-300 rounded-lg text-teal-900 font-mono font-black focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingItem ? 'Guardar Cambios' : 'Registrar Compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Proveedor Form (Alta / Editar Nombre de Proveedor) */}
      {showProveedorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingProveedor ? 'Editar Proveedor de Cliente' : 'Nuevo Proveedor de Cliente'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Materiales Compras de Cliente P0-00
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowProveedorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProveedor} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Empresa / Proveedor Suministrado por Cliente *
                </label>
                <input
                  type="text"
                  value={provForm.empresaProveedora}
                  onChange={(e) => setProvForm({ empresaProveedora: e.target.value })}
                  placeholder="Ej. Interceramic México (Suministro directo cliente)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProveedorModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingProveedor ? 'Actualizar' : 'Dar de Alta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-11 h-11 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              ¿Eliminar {deleteConfirm.type === 'proveedor' ? 'Empresa Proveedora' : 'Registro de Compra Cliente'}?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Está a punto de eliminar <span className="font-bold text-slate-800">{deleteConfirm.name}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
