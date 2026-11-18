import React from 'react';
import { Search, Calendar, HardHat, DollarSign, RotateCcw, Users } from 'lucide-react';
import type { CODCostCenter, CODClient } from '../context/CODContext';

export interface AdvancedFilterState {
  search: string;
  month: string;      // YYYY-MM
  day: string;        // YYYY-MM-DD
  projectId: string;  // 'ALL' | id
  clientId: string;   // 'ALL' | id
  amountValue: string;
  amountMode: 'exact' | 'min' | 'max';
}

export const INITIAL_ADVANCED_FILTER: AdvancedFilterState = {
  search: '',
  month: '',
  day: '',
  projectId: 'ALL',
  clientId: 'ALL',
  amountValue: '',
  amountMode: 'exact',
};

export function matchesAdvancedFilter(
  item: {
    date: string;
    projectId?: string;
    clientId?: string;
    amount: number;
    searchableText: string;
  },
  filter: AdvancedFilterState
): boolean {
  const q = filter.search.trim().toLowerCase();
  if (q && !item.searchableText.toLowerCase().includes(q)) {
    return false;
  }

  if (filter.month && !item.date.startsWith(filter.month)) {
    return false;
  }

  if (filter.day && item.date !== filter.day) {
    return false;
  }

  if (filter.projectId !== 'ALL' && item.projectId !== filter.projectId) {
    return false;
  }

  if (filter.clientId !== 'ALL' && item.clientId !== filter.clientId) {
    return false;
  }

  const parsedAmount = parseFloat(filter.amountValue);
  if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
    if (filter.amountMode === 'exact') {
      if (Math.abs(item.amount - parsedAmount) > 0.01) return false;
    } else if (filter.amountMode === 'min') {
      if (item.amount < parsedAmount - 0.01) return false;
    } else if (filter.amountMode === 'max') {
      if (item.amount > parsedAmount + 0.01) return false;
    }
  }

  return true;
}

interface AdvancedFilterBarProps {
  filter: AdvancedFilterState;
  onChange: (next: AdvancedFilterState) => void;
  projects: CODCostCenter[];
  clients?: CODClient[];
  placeholder?: string;
  extraSlot?: React.ReactNode;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  filter,
  onChange,
  projects,
  clients = [],
  placeholder = 'Buscar concepto, banco, S.A., cliente...',
  extraSlot,
}) => {
  const hasActiveFilters =
    Boolean(filter.search) ||
    Boolean(filter.month) ||
    Boolean(filter.day) ||
    filter.projectId !== 'ALL' ||
    filter.clientId !== 'ALL' ||
    Boolean(filter.amountValue);

  return (
    <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-end">
        {/* Free text */}
        <div className="lg:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
            Buscador General
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => onChange({ ...filter, search: e.target.value })}
              placeholder={placeholder}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        {/* By Month */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
            <Calendar className="w-3 h-3" />
            <span>Por Mes</span>
          </label>
          <input
            type="month"
            value={filter.month}
            onChange={(e) =>
              onChange({
                ...filter,
                month: e.target.value,
                day: e.target.value ? '' : filter.day,
              })
            }
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* By Exact Day */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
            <Calendar className="w-3 h-3" />
            <span>Por Día Exacto</span>
          </label>
          <input
            type="date"
            value={filter.day}
            onChange={(e) =>
              onChange({
                ...filter,
                day: e.target.value,
                month: e.target.value ? '' : filter.month,
              })
            }
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* By Project */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
            <HardHat className="w-3 h-3" />
            <span>Por Proyecto</span>
          </label>
          <select
            value={filter.projectId}
            onChange={(e) => onChange({ ...filter, projectId: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* By Amount / Cantidad */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
            <DollarSign className="w-3 h-3" />
            <span>Por Cantidad ($)</span>
          </label>
          <div className="flex">
            <select
              value={filter.amountMode}
              onChange={(e) =>
                onChange({
                  ...filter,
                  amountMode: e.target.value as 'exact' | 'min' | 'max',
                })
              }
              title="Criterio de monto"
              className="px-1.5 py-1.5 text-[11px] font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="exact">=</option>
              <option value="min">&gt;=</option>
              <option value="max">&lt;=</option>
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              value={filter.amountValue}
              onChange={(e) => onChange({ ...filter, amountValue: e.target.value })}
              placeholder="Ej. 50000"
              className="w-full min-w-0 px-2 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-r-lg focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {clients.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filter.clientId}
                onChange={(e) => onChange({ ...filter, clientId: e.target.value })}
                className="px-2.5 py-1 text-[11px] font-medium bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">Todos los clientes</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {extraSlot}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange(INITIAL_ADVANCED_FILTER)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar búsqueda</span>
          </button>
        )}
      </div>
    </div>
  );
};
