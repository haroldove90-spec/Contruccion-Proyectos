import React, { useMemo, useState } from 'react';
import { useCOD } from '../../context/CODContext';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Landmark,
  Building2,
  HardHat,
  CheckCheck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

export const CODNotificacionesView: React.FC = () => {
  const {
    currentUser,
    notifications,
    unreadNotificationsCount,
    approveExpense,
    rejectExpense,
    approveLoanDirect,
    rejectLoanDirect,
    markNotificationRead,
    markAllNotificationsRead,
  } = useCOD();

  const [tab, setTabState] = useState<'all' | 'unread' | 'pending' | 'sent'>(() => {
    try {
      const saved = localStorage.getItem('pc_cdo_notif_tab') || sessionStorage.getItem('pc_cdo_notif_tab');
      if (saved === 'all' || saved === 'unread' || saved === 'pending' || saved === 'sent') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'all';
  });
  const setTab = (next: 'all' | 'unread' | 'pending' | 'sent') => {
    setTabState(next);
    try {
      localStorage.setItem('pc_cdo_notif_tab', next);
      sessionStorage.setItem('pc_cdo_notif_tab', next);
    } catch {
      // ignore
    }
  };
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const visibleNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications
      .filter((n) => {
        const isForMyRole = n.targetRole === currentUser.role;
        const isSentByMe = n.createdByUserId === currentUser.id;
        if (tab === 'sent') return isSentByMe;
        if (tab === 'unread') {
          return isForMyRole && !n.readByUserIds.includes(currentUser.id);
        }
        if (tab === 'pending') {
          return (isForMyRole || isSentByMe) && n.actionStatus === 'pendiente';
        }
        return isForMyRole || isSentByMe;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, currentUser, tab]);

  if (!currentUser) return null;

  const handleApprove = (notif: (typeof notifications)[number]) => {
    if (notif.expenseId) {
      approveExpense(notif.expenseId);
    } else if (notif.loanId) {
      approveLoanDirect(notif.loanId);
    }
  };

  const handleRejectConfirm = (notif: (typeof notifications)[number]) => {
    if (notif.expenseId) {
      rejectExpense(notif.expenseId, rejectionReason);
    } else if (notif.loanId) {
      rejectLoanDirect(notif.loanId, rejectionReason);
    }
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            <span>Centro de Notificaciones y Autorizaciones</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Recibe solicitudes de Administración para autorizar egresos, retiros bancarios, préstamos y créditos'
              : 'Envía solicitudes al Admin al registrar egresos/préstamos y recibe aquí las confirmaciones o rechazos'}
          </p>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer self-start"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Marcar todas como leídas ({unreadNotificationsCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'all', label: 'Todas' },
            { id: 'pending', label: 'Pendientes de Autorizar' },
            { id: 'unread', label: `Sin leer (${unreadNotificationsCount})` },
            { id: 'sent', label: 'Enviadas por mí' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              tab === item.id
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="space-y-3">
        {visibleNotifications.map((n) => {
          const isTarget = n.targetRole === currentUser.role;
          const isUnread = isTarget && !n.readByUserIds.includes(currentUser.id);
          const isPending = n.actionStatus === 'pendiente';
          const canApproveReject = isAdmin && isTarget && isPending;

          return (
            <div
              key={n.id}
              onClick={() => isUnread && markNotificationRead(n.id)}
              className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs transition-all ${
                isPending
                  ? 'border-amber-300 ring-1 ring-amber-100'
                  : n.type === 'egreso_autorizado'
                  ? 'border-emerald-200'
                  : n.type === 'egreso_rechazado'
                  ? 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Sin leer" />
                    )}

                    {n.actionStatus === 'pendiente' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
                        <Clock className="w-3 h-3" />
                        Pendiente de Autorización
                      </span>
                    )}
                    {n.actionStatus === 'autorizado' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        Autorizado
                      </span>
                    )}
                    {n.actionStatus === 'rechazado' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase">
                        <XCircle className="w-3 h-3" />
                        Rechazado
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-slate-400">
                      {fmtDate(n.timestamp)}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                  {/* Quick Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {n.accountName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold">
                        <Landmark className="w-3 h-3 text-[#0B2545]" />
                        Cuenta Origen: {n.accountName}
                      </span>
                    )}
                    {n.companyName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {n.companyName}
                      </span>
                    )}
                    {n.projectName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-medium">
                        <HardHat className="w-3 h-3 text-amber-600" />
                        {n.projectName}
                      </span>
                    )}
                    <span className="text-slate-500">
                      Solicitó/Envió: <strong className="text-slate-800">{n.createdByName}</strong>
                    </span>
                  </div>

                  {n.rejectionReason && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Motivo del rechazo: {n.rejectionReason}</span>
                    </div>
                  )}
                </div>

                {/* Amount + Admin Action Buttons */}
                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                  {n.amount !== undefined && (
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Importe</div>
                      <div className="text-lg font-black font-mono tabular-nums text-[#0B2545]">
                        ${fmt(n.amount)}
                      </div>
                    </div>
                  )}

                  {canApproveReject && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(n);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Autorizar Salida</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRejectingId(rejectingId === n.id ? null : n.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason inline prompt */}
              {rejectingId === n.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-end gap-2"
                >
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-bold text-rose-800 mb-1">
                      Motivo del rechazo (se notificará a Administración):
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ej. Cambiar cuenta de origen / falta comprobante..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRejectConfirm(n)}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Confirmar Rechazo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason('');
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {visibleNotifications.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              No hay notificaciones en esta bandeja
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cuando Administración registre un egreso, préstamo o crédito bancario, llegará aquí automáticamente para autorización del Admin y posterior confirmación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
