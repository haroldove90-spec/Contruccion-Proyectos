import React from 'react';
import { BrandLogo } from './BrandLogo';
import {
  Printer,
  X,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Zap,
  Server,
  Smartphone,
  Layers,
  Building2,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

interface ExecutivePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutivePDFModal: React.FC<ExecutivePDFModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-6 overflow-y-auto">
      {/* Floating Action Controls (Hidden when printing) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Guardar / Imprimir PDF</span>
        </button>

        <button
          onClick={onClose}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg transition-colors cursor-pointer"
          title="Cerrar vista"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Document Content formatted as Executive PDF Report */}
      <div className="printable-dossier w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-12 my-8 border border-slate-200">
        {/* ==================== PORTADA EJECUTIVA ==================== */}
        <div className="border-b-2 border-slate-900 pb-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <BrandLogo size="lg" showText={true} />
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md uppercase tracking-wider block sm:inline-block">
                Documento Técnico Oficial
              </span>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                Ref: ERP-CONST-2026-v2.4
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              FICHA TÉCNICA Y ESPECIFICACIONES GENERALES DEL SISTEMA ERP
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-600 mt-2">
              Plataforma de Administración Integral, Centros de Costos, Carga Única vía WhatsApp OCR y Reportes Financieros en Tiempo Real para Grupo Constructor
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">EMPRESA:</span>
              <span className="font-bold text-slate-800">Proyectos Construcciones</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">ALCANCE:</span>
              <span className="font-bold text-slate-800">Grupo con 3 Sociedades Anónimas</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">USUARIOS:</span>
              <span className="font-bold text-slate-800">Socios, Admin y Residentes Campo</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">FECHA DE EMISIÓN:</span>
              <span className="font-bold text-slate-800 font-mono">23 Octubre 2026</span>
            </div>
          </div>
        </div>

        {/* ==================== 1. RESUMEN Y PROBLEMÁTICA ==================== */}
        <section className="mb-8 avoid-break-inside">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="text-amber-600">01.</span>
            <span>Quiénes Somos y Problemática que Resuelve</span>
          </h2>

          <div className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
            <p>
              <strong>Perfil del Grupo:</strong> Consorcio constructor integrado por tres Sociedades Anónimas independientes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block">1. Edificaciones Civiles</span>
                <span className="text-slate-500">Obra civil pesada y edificación vertical.</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block">2. Mobiliario Urbano</span>
                <span className="text-slate-500">Mobiliario arquitectónico y acabados.</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block">3. Cimbra Técnica</span>
                <span className="text-slate-500">Encofrados y prefabricados de concreto.</span>
              </div>
            </div>
            <p>
              <strong>Diagnóstico del Problema Previo:</strong> La información corporativa se encontraba dispersa en hojas de Excel desactualizadas, compras en campo sin comprobación inmediata y tesorería fragmentada entre cuentas de bancos sin visibilidad diaria por obra. Esto generaba duplicidad de captura y desconocimiento de la utilidad real de cada proyecto hasta el cierre definitivo.
            </p>
            <p>
              <strong>Solución Implementada:</strong> Un sistema centralizado en la nube con acceso multiplataforma, donde cada obra se gestiona como un Centro de Costos independiente con control estricto de presupuesto, estimaciones y tesorería.
            </p>
          </div>
        </section>

        {/* ==================== 2. EL PRINCIPIO DE CARGA ÚNICA ==================== */}
        <section className="mb-8 avoid-break-inside page-break-before">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="text-amber-600">02.</span>
            <span>Requerimiento Clave: Principio de Carga Única & WhatsApp OCR</span>
          </h2>

          <div className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
            <p>
              El corazón de la eficiencia del sistema radica en la <strong>Carga Única</strong>. Para eliminar por completo la fricción administrativa en campo, el residente o comprador no necesita llenar formatos complejos:
            </p>

            {/* Diagrama de Flujo en el PDF */}
            <div className="p-4 bg-slate-900 text-white rounded-xl my-4 text-xs">
              <div className="font-bold text-amber-400 mb-2 uppercase tracking-wider">
                Flujo Operativo Automatizado:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-amber-400 font-bold block">PASO 1</span>
                  <span>Foto de ticket por WhatsApp + texto (&quot;Obra Juárez 150&quot;).</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-amber-400 font-bold block">PASO 2</span>
                  <span>Módulo OCR/IA extrae: Proveedor, Monto ($), IVA y Fecha.</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-amber-400 font-bold block">PASO 3</span>
                  <span>Identificación automática de Centro de Costos y cuenta.</span>
                </div>
                <div className="bg-emerald-900/60 p-2.5 rounded-lg border border-emerald-500">
                  <span className="text-emerald-300 font-bold block">PASO 4</span>
                  <span>Carga Única: Afectación simultánea cuádruple en 1 segundo.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1.5">
                Impacto Simultáneo de la Transacción Única:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1. Centros de Costos:</strong> Suma al gasto real y recalcula % financiero.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>2. Tesorería:</strong> Descuenta saldo de la cuenta bancaria o caja chica.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>3. Cuentas por Pagar:</strong> Registra comprobante y liquida pasivo con proveedor.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>4. Contabilidad General:</strong> Genera la póliza con cargo a obra/IVA y abono a banco.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ==================== 3. MÓDULOS DEL SISTEMA ==================== */}
        <section className="mb-8 avoid-break-inside">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="text-amber-600">03.</span>
            <span>Checklist de Módulos Funcionales</span>
          </h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 border border-slate-200 rounded-xl bg-white">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>A. Centros de Costos / Proyectos</span>
              </h3>
              <p className="text-slate-600 mt-1">
                Alta de obra, presupuesto inicial contratado, cliente, S.A. facturadora asignada, estatus y métricas de avance financiero.
              </p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl bg-white">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>B. Compras y Gastos</span>
              </h3>
              <p className="text-slate-600 mt-1">
                Órdenes de compra por centro de costo, proveedores, folios fiscales de tickets/facturas y registro manual o vía WhatsApp OCR.
              </p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl bg-white">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>C. Tesorería Multibancos</span>
              </h3>
              <p className="text-slate-600 mt-1">
                Gestión de cuentas (BBVA, Banorte, Santander), cajas chicas de efectivo en obra, tarjetas corporativas, transferencias y conciliación diaria.
              </p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl bg-white">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>D. Cuentas por Pagar y Cobrar</span>
              </h3>
              <p className="text-slate-600 mt-1">
                Vencimientos con proveedores (CXP) y saldos de estimaciones a clientes (CXC) con conciliación de cobranza bancaria directa.
              </p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl bg-white">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>E. Ventas y Estimaciones</span>
              </h3>
              <p className="text-slate-600 mt-1">
                Generador de estimaciones basadas en avance físico, cálculo de retención de garantía (5%) y facturación por la S.A. correspondiente.
              </p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl bg-white">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>F. Programa de Obra</span>
              </h3>
              <p className="text-slate-600 mt-1">
                Comparativa gráfica de Avance Físico (%) vs Gasto Ejercido (%) con detección automática de alertas de sobrecosto y actualización en sitio.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== 4. REPORTES FINANCIEROS ==================== */}
        <section className="mb-8 avoid-break-inside page-break-before">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="text-amber-600">04.</span>
            <span>Reportes Financieros en Tiempo Real (Lo Más Importante)</span>
          </h2>

          <div className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
            <p>
              El sistema erradica los cierres a ciegas mediante cuatro instrumentos financieros dinámicos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">1. Estado de Resultados (P&L)</span>
                <span className="text-slate-600">
                  Desglose por obra, por Sociedad Anónima y consolidado del grupo: Ingresos brutos facturados - Costos directos de materiales/mano de obra - Costos indirectos = Utilidad neta real de operación.
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">2. Balance por Centro de Costos</span>
                <span className="text-slate-600">
                  Matriz comparativa de Presupuestado vs Gastado vs Cobrado vs Margen neto porcentual y en pesos mexicanos.
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">3. Flujo de Efectivo Inmediato</span>
                <span className="text-slate-600">
                  Posición neta a 30 días sumando liquidez disponible en bancos y cajas + cobranza en trámite menos pasivos comprometidos con proveedores.
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">4. Utilidad Real de Proyecto</span>
                <span className="text-slate-600">
                  Cálculo certero del margen de ganancia sin esperar a la finalización de la obra o finiquitos contables anuales.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 5. ESPECIFICACIONES TÉCNICAS & PWA ==================== */}
        <section className="mb-8 avoid-break-inside">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="text-amber-600">05.</span>
            <span>Especificaciones Técnicas, PWA y Seguridad</span>
          </h2>

          <div className="mt-3 text-xs text-slate-700 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Arquitectura y Frontend:</span>
                <span className="text-slate-600 block">
                  • React 19 + TypeScript con Vite 8.
                </span>
                <span className="text-slate-600 block">
                  • Tailwind CSS v4 para diseño responsivo y tipografía de alta legibilidad (*Plus Jakarta Sans* y *JetBrains Mono tabular-nums*).
                </span>
                <span className="text-slate-600 block">
                  • Menú lateral desplegable en escritorio y Bottom Bar táctil fija en móviles y tablets.
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Capacidades PWA (App Instalable):</span>
                <span className="text-slate-600 block">
                  • Nombre oficial: <strong>Proyectos Construcciones</strong>.
                </span>
                <span className="text-slate-600 block">
                  • Instalable directamente en Android, iPhone/iPad (iOS Safari) y computadoras sin intermediación de App Stores.
                </span>
                <span className="text-slate-600 block">
                  • Service Worker con precaché de recursos para funcionamiento ágil en obra con baja cobertura.
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block mb-1">
                Perfiles de Acceso (5 Usuarios Iniciales):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <strong>Socio Director:</strong> Visión financiera consolidada, P&L y utilidades.
                </div>
                <div>
                  <strong>Administración:</strong> Tesorería, bancos, CXP/CXC y estimaciones.
                </div>
                <div>
                  <strong>Residente Obra:</strong> Programa de obra y avance físico en campo.
                </div>
                <div>
                  <strong>Compras:</strong> Captura WhatsApp OCR y catálogo de proveedores.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 04. PRESUPUESTO ECONÓMICO Y SOPORTE ==================== */}
        <section className="mb-4 avoid-break-inside">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="text-amber-600">04.</span>
            <span>PRESUPUESTO ECONÓMICO Y SOPORTE</span>
          </h2>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                DESARROLLO LLAVE EN MANO
              </span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1 tracking-wider text-amber-600">
                COTIZAR
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Cotizar según módulos y usuarios
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                INFRAESTRUCTURA CLOUD & OCR
              </span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1 tracking-wider text-blue-700">
                COTIZAR
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Cotizar según consumo y volumen
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                SOPORTE Y MANTENIMIENTO SLA
              </span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1 tracking-wider text-emerald-700">
                COTIZAR
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Cotizar según póliza de servicio
              </span>
            </div>
          </div>
        </section>

        {/* Footer Documento */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Proyectos Construcciones · Dossier para Cliente</span>
          <span>Página Oficial de Especificaciones Técnicas</span>
        </div>
      </div>
    </div>
  );
};
