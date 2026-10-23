import React, { useState } from 'react';
import { ExecutivePDFModal } from '../components/ExecutivePDFModal';
import {
  FileCode2,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Server,
  Smartphone,
  Users,
  Download,
  Printer,
  FileText,
} from 'lucide-react';

export const PropuestaTecnicaView: React.FC = () => {
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Modal Ficha Técnica en PDF */}
      <ExecutivePDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
      />

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
              Requerimiento 6 · Propuesta Técnica & Comercial
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-2">
              Propuesta de Implementación ERP para Grupo Constructor
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Análisis comparativo de arquitectura a la medida vs ERP genérico (Odoo), cronograma de despliegue por fases y desglose de inversión.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPDFModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Ver / Descargar PDF para Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Análisis Técnico: A la Medida vs Odoo */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Server className="w-5 h-5 text-amber-600" />
          <span>1. Propuesta Técnica: ¿A la Medida o sobre ERP Base (Odoo)?</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
          {/* Opción Recomendada: A la Medida */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="font-bold text-emerald-900 text-sm">
                Desarrollo a la Medida PWA (Recomendado)
              </span>
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                100% Alineado
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-slate-700 text-xs">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Integración WhatsApp & OCR Nativa:</strong> Permite el flujo sin fricción donde campo manda foto + &quot;Obra Juárez 150&quot; sin tocar pantallas complejas.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Principio de Carga Única Estricto:</strong> Banco, Centro de Costos, CXP y Contabilidad se mueven en 1 clic sin pasos intermedios.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cero costo de licencias por usuario:</strong> Escalable para socios, compras y residentes sin pagar mensualidad por usuario.
                </span>
              </li>
            </ul>
          </div>

          {/* Comparativa Odoo */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-700 text-sm">
                ERP Genérico / Odoo
              </span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                Alternativa Base
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-slate-600 text-xs">
              <li>
                • <strong>Curva de adopción alta en campo:</strong> Interfaz pesada de formularios que los residentes suelen rechazar.
              </li>
              <li>
                • <strong>Integración WhatsApp compleja:</strong> Requiere conectores de terceros y servidores dedicados de alto consumo.
              </li>
              <li>
                • <strong>Licenciamiento costoso:</strong> Cobro recurrente por usuario/mes en módulos Enterprise.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Tiempo de Implementación por Fases */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <span>2. Cronograma de Implementación por Fases (12 Semanas)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-mono font-bold text-amber-600">FASE 1 · Semanas 1 a 4</span>
            <h3 className="font-bold text-slate-900 mt-1">Núcleo Operativo & WhatsApp OCR</h3>
            <ul className="mt-2 space-y-1.5 text-slate-600 text-xs">
              <li>• Alta de Centros de Costos y 3 S.A.</li>
              <li>• Bot de WhatsApp con extracción OCR/IA</li>
              <li>• Principio de Carga Única probado en campo</li>
              <li>• Catálogo de Proveedores y Cajas Chicas</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-mono font-bold text-blue-600">FASE 2 · Semanas 5 a 8</span>
            <h3 className="font-bold text-slate-900 mt-1">Tesorería & Estimaciones</h3>
            <ul className="mt-2 space-y-1.5 text-slate-600 text-xs">
              <li>• Gestión multibancos y conciliación diaria</li>
              <li>• Cuentas por Pagar (CXP) y Cuentas por Cobrar (CXC)</li>
              <li>• Generación de Estimaciones con fondo garantía</li>
              <li>• Asignación fiscal por Sociedad Anónima</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-mono font-bold text-emerald-600">FASE 3 · Semanas 9 a 12</span>
            <h3 className="font-bold text-slate-900 mt-1">PWA Offline & Reportes P&L</h3>
            <ul className="mt-2 space-y-1.5 text-slate-600 text-xs">
              <li>• Instalación PWA en Android, iOS y Desktop</li>
              <li>• Reportes en tiempo real y Utilidad Real</li>
              <li>• Capacitación a los 5 usuarios clave</li>
              <li>• Entrega y puesta en marcha oficial</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Costo y Presupuesto Estructurado */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600" />
          <span>3. Estructura de Inversión y Soporte</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              Desarrollo e Implementación
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              $185,000 MXN
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Pago único dividido en 3 hitos de entrega
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              Servidores Cloud & API OCR
            </span>
            <div className="text-xl font-bold font-mono text-blue-700 mt-1">
              $3,800 MXN / mes
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Infraestructura segura, respaldos y consumo IA
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              Soporte Técnico y SLA
            </span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
              $4,500 MXN / mes
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Atención prioritaria y mantenimiento evolutivo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
