import React, { useState } from 'react';
import { useCOD } from '../../context/CODContext';
import {
  Users,
  HardHat,
  Landmark,
  Building2,
  Tags,
  PlusCircle,
  Edit3,
  Trash2,
  Check,
  X,
  RotateCcw,
  Eraser,
  Banknote,
  AlertTriangle,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type CatalogTab = 'clientes' | 'proyectos' | 'bancos' | 'empresas' | 'conceptos';

export const CODCatalogosView: React.FC = () => {
  const {
    currentUser,
    companies,
    clients,
    costCenters,
    accounts,
    concepts,
    addClient,
    updateClient,
    deleteClient,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
    addAccount,
    updateAccount,
    deleteAccount,
    addCompany,
    updateCompany,
    deleteCompany,
    addConcept,
    deleteConcept,
    clearMovementsToZero,
    clearAllToZero,
    resetCODData,
  } = useCOD();

  const isAdmin = currentUser?.role === 'admin';
  const [activeTab, setActiveTabState] = useState<CatalogTab>(() => {
    try {
      const saved = localStorage.getItem('pc_cdo_catalog_tab') || sessionStorage.getItem('pc_cdo_catalog_tab');
      if (
        saved === 'clientes' ||
        saved === 'proyectos' ||
        saved === 'bancos' ||
        saved === 'empresas' ||
        saved === 'conceptos'
      ) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'clientes';
  });
  const setActiveTab = (tab: CatalogTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('pc_cdo_catalog_tab', tab);
      sessionStorage.setItem('pc_cdo_catalog_tab', tab);
    } catch {
      // ignore
    }
  };
  const [confirmAction, setConfirmAction] = useState<'movements' | 'all' | null>(null);

  // Client form state
  const [clientName, setClientName] = useState('');
  const [clientRfc, setClientRfc] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editClientData, setEditClientData] = useState({ name: '', rfc: '', contact: '' });

  // Project form state
  const [projName, setProjName] = useState('');
  const [projClientId, setProjClientId] = useState(clients[0]?.id || '');
  const [projCompanyId, setProjCompanyId] = useState(companies[0]?.id || '');
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [editProjData, setEditProjData] = useState({ name: '', clientId: '', companyId: '' });

  // Bank / Cash account form state
  const [accName, setAccName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accType, setAccType] = useState<'banco' | 'efectivo'>('banco');
  const [accCompanyId, setAccCompanyId] = useState(companies[0]?.id || '');
  const [accInitial, setAccInitial] = useState('0');
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editAccData, setEditAccData] = useState({
    name: '',
    accountNumber: '',
    type: 'banco' as 'banco' | 'efectivo',
    companyId: '',
    initialBalance: '0',
  });

  // Company (S.A.) form state
  const [compName, setCompName] = useState('');
  const [compRfc, setCompRfc] = useState('');
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [editCompData, setEditCompData] = useState({ name: '', rfc: '' });

  // Concept form state
  const [conceptName, setConceptName] = useState('');
  const [conceptKind, setConceptKind] = useState<'ingreso' | 'egreso'>('ingreso');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    addClient(clientName, clientRfc, clientContact);
    setClientName('');
    setClientRfc('');
    setClientContact('');
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    addCostCenter(projName, projCompanyId || companies[0]?.id || '', projClientId || undefined);
    setProjName('');
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;
    const initVal = parseFloat(accInitial);
    addAccount({
      name: accName,
      accountNumber: accNumber,
      type: accType,
      companyId: accCompanyId || companies[0]?.id || '',
      initialBalance: Number.isFinite(initVal) ? initVal : 0,
    });
    setAccName('');
    setAccNumber('');
    setAccInitial('0');
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;
    addCompany(compName, compName, compRfc);
    setCompName('');
    setCompRfc('');
  };

  const handleAddConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptName.trim()) return;
    addConcept(conceptName, conceptKind);
    setConceptName('');
  };

  const tabs: { id: CatalogTab; label: string; count: number; icon: React.FC<{ className?: string }> }[] = [
    { id: 'clientes', label: 'Clientes', count: clients.length, icon: Users },
    { id: 'proyectos', label: 'Proyectos / Obras', count: costCenters.length, icon: HardHat },
    { id: 'bancos', label: 'Bancos y Cuentas', count: accounts.length, icon: Landmark },
    { id: 'empresas', label: 'Empresas (S.A.)', count: companies.length, icon: Building2 },
    { id: 'conceptos', label: 'Conceptos', count: concepts.length, icon: Tags },
  ];

  return (
    <div className="space-y-5">
      {/* Header + Data Control Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Catálogos y Control Total
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra libremente tus Clientes, Proyectos, Cuentas Bancarias (8 o más), Sociedades Anónimas y Conceptos
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setConfirmAction('movements')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Vaciar Movimientos ($0.00)</span>
            </button>

            <button
              onClick={() => setConfirmAction('all')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Iniciar Todo en Cero</span>
            </button>

            <button
              onClick={resetCODData}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restablecer Ejemplo</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Bar for Destructive Zero Reset */}
      {isAdmin && confirmAction && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {confirmAction === 'movements'
                  ? '¿Vaciar todos los ingresos, egresos y saldos iniciales a $0.00?'
                  : '¿Limpiar todo el sistema para iniciar desde cero?'}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {confirmAction === 'movements'
                  ? 'Tus catálogos de Clientes, Proyectos, Cuentas Bancarias y S.A. se mantendrán intactos.'
                  : 'Se eliminarán los registros de ejemplo y quedará listo para que captures tus propias cuentas, clientes y proyectos.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (confirmAction === 'movements') clearMovementsToZero();
                else clearAllToZero();
                setConfirmAction(null);
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmAction(null)}
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{t.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLIENTES */}
      {activeTab === 'clientes' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddClient}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre o Razón Social del Cliente *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Constructora del Valle S.A. de C.V."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RFC (Opcional)</label>
              <input
                type="text"
                value={clientRfc}
                onChange={(e) => setClientRfc(e.target.value)}
                placeholder="Ej. CVA200101ABC"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white font-mono uppercase"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Contacto</label>
                <input
                  type="text"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="Nombre o Tel."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 flex items-center gap-1.5 h-[34px] self-end"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Agregar</span>
              </button>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B2545] text-white">
                  <th className="py-3 px-4 text-left font-bold">Cliente</th>
                  <th className="py-3 px-4 text-left font-bold">RFC</th>
                  <th className="py-3 px-4 text-left font-bold">Contacto</th>
                  <th className="py-3 px-4 text-center font-bold w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clients.map((cli) => {
                  const isEditing = editingClientId === cli.id;
                  return (
                    <tr key={cli.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editClientData.name}
                            onChange={(e) => setEditClientData({ ...editClientData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs"
                          />
                        ) : (
                          cli.name
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editClientData.rfc}
                            onChange={(e) => setEditClientData({ ...editClientData, rfc: e.target.value })}
                            className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs font-mono"
                          />
                        ) : (
                          cli.rfc || '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editClientData.contact}
                            onChange={(e) => setEditClientData({ ...editClientData, contact: e.target.value })}
                            className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs"
                          />
                        ) : (
                          cli.contact || '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => {
                                  if (editClientData.name.trim()) updateClient(cli.id, editClientData);
                                  setEditingClientId(null);
                                }}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingClientId(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingClientId(cli.id);
                                  setEditClientData({
                                    name: cli.name,
                                    rfc: cli.rfc || '',
                                    contact: cli.contact || '',
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteClient(cli.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No hay clientes registrados. Agrega el primero arriba.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROYECTOS / OBRAS */}
      {activeTab === 'proyectos' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddProject}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Proyecto / Obra *
              </label>
              <input
                type="text"
                required
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                placeholder="Ej. Torre Residencial Norte"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cliente Asignado</label>
              <select
                value={projClientId}
                onChange={(e) => setProjClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
              >
                <option value="">-- Sin cliente específico --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">S.A. Responsable *</label>
                <select
                  value={projCompanyId}
                  onChange={(e) => setProjCompanyId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 flex items-center gap-1.5 h-[34px] self-end"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Agregar</span>
              </button>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B2545] text-white">
                  <th className="py-3 px-4 text-left font-bold">Proyecto / Obra</th>
                  <th className="py-3 px-4 text-left font-bold">Cliente</th>
                  <th className="py-3 px-4 text-left font-bold">S.A. Asociada</th>
                  <th className="py-3 px-4 text-center font-bold w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {costCenters.map((obra) => {
                  const isEditing = editingProjId === obra.id;
                  const coName = companies.find((c) => c.id === obra.companyId)?.name || '—';
                  return (
                    <tr key={obra.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editProjData.name}
                            onChange={(e) => setEditProjData({ ...editProjData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs"
                          />
                        ) : (
                          obra.name
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {isEditing ? (
                          <select
                            value={editProjData.clientId}
                            onChange={(e) => setEditProjData({ ...editProjData, clientId: e.target.value })}
                            className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs"
                          >
                            <option value="">-- Sin cliente --</option>
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          obra.clientName || '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {isEditing ? (
                          <select
                            value={editProjData.companyId}
                            onChange={(e) => setEditProjData({ ...editProjData, companyId: e.target.value })}
                            className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs"
                          >
                            {companies.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          coName
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => {
                                  if (editProjData.name.trim()) {
                                    updateCostCenter(obra.id, {
                                      name: editProjData.name.trim(),
                                      clientId: editProjData.clientId || undefined,
                                      companyId: editProjData.companyId,
                                    });
                                  }
                                  setEditingProjId(null);
                                }}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingProjId(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingProjId(obra.id);
                                  setEditProjData({
                                    name: obra.name,
                                    clientId: obra.clientId || '',
                                    companyId: obra.companyId,
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteCostCenter(obra.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {costCenters.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No hay proyectos registrados. Agrega el primero arriba.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BANCOS Y CUENTAS (Soporta 8+ cuentas bancarias o efectivo) */}
      {activeTab === 'bancos' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddAccount}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
          >
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Banco o Caja (Puedes agregar 8+ cuentas) *
              </label>
              <input
                type="text"
                required
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="Ej. BBVA Cuenta 2 / Santander / Banorte"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Cuenta / CLABE</label>
              <input
                type="text"
                value={accNumber}
                onChange={(e) => setAccNumber(e.target.value)}
                placeholder="Ej. *4821"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo *</label>
              <select
                value={accType}
                onChange={(e) => setAccType(e.target.value as 'banco' | 'efectivo')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
              >
                <option value="banco">Banco</option>
                <option value="efectivo">Efectivo / Caja</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">S.A. Asociada *</label>
              <select
                value={accCompanyId}
                onChange={(e) => setAccCompanyId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Saldo Inicial *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={accInitial}
                  onChange={(e) => setAccInitial(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 flex items-center gap-1 h-[34px] self-end"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Alta</span>
              </button>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B2545] text-white">
                    <th className="py-3 px-4 text-left font-bold">Banco / Cuenta</th>
                    <th className="py-3 px-3 text-left font-bold">No. Cuenta</th>
                    <th className="py-3 px-3 text-center font-bold">Tipo</th>
                    <th className="py-3 px-4 text-left font-bold">S.A. Asociada</th>
                    <th className="py-3 px-4 text-right font-bold">Saldo Inicial</th>
                    <th className="py-3 px-4 text-right font-bold">Saldo Actual</th>
                    <th className="py-3 px-4 text-center font-bold w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {accounts.map((acc) => {
                    const isEditing = editingAccId === acc.id;
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editAccData.name}
                              onChange={(e) => setEditAccData({ ...editAccData, name: e.target.value })}
                              className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {acc.type === 'banco' ? (
                                <Landmark className="w-3.5 h-3.5 text-[#0B2545]" />
                              ) : (
                                <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                              )}
                              <span>{acc.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editAccData.accountNumber}
                              onChange={(e) => setEditAccData({ ...editAccData, accountNumber: e.target.value })}
                              className="w-24 px-2 py-1 border border-amber-400 rounded-lg text-xs font-mono"
                            />
                          ) : (
                            acc.accountNumber || '—'
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isEditing ? (
                            <select
                              value={editAccData.type}
                              onChange={(e) => setEditAccData({ ...editAccData, type: e.target.value as 'banco' | 'efectivo' })}
                              className="px-2 py-1 border border-amber-400 rounded-lg text-xs"
                            >
                              <option value="banco">Banco</option>
                              <option value="efectivo">Efectivo</option>
                            </select>
                          ) : (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {acc.type === 'banco' ? 'Banco' : 'Efectivo'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {isEditing ? (
                            <select
                              value={editAccData.companyId}
                              onChange={(e) => setEditAccData({ ...editAccData, companyId: e.target.value })}
                              className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs"
                            >
                              {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            acc.companyName
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editAccData.initialBalance}
                              onChange={(e) => setEditAccData({ ...editAccData, initialBalance: e.target.value })}
                              className="w-28 px-2 py-1 border border-amber-400 rounded-lg text-xs text-right font-mono"
                            />
                          ) : (
                            `$${fmt(acc.initialBalance)}`
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-[#0B2545]">
                          ${fmt(acc.currentBalance)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => {
                                    const num = parseFloat(editAccData.initialBalance);
                                    updateAccount(acc.id, {
                                      name: editAccData.name.trim() || acc.name,
                                      accountNumber: editAccData.accountNumber.trim() || undefined,
                                      type: editAccData.type,
                                      companyId: editAccData.companyId,
                                      initialBalance: Number.isFinite(num) ? num : acc.initialBalance,
                                    });
                                    setEditingAccId(null);
                                  }}
                                  className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingAccId(null)}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingAccId(acc.id);
                                    setEditAccData({
                                      name: acc.name,
                                      accountNumber: acc.accountNumber || '',
                                      type: acc.type,
                                      companyId: acc.companyId,
                                      initialBalance: String(acc.initialBalance),
                                    });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteAccount(acc.id)}
                                  disabled={accounts.length <= 1}
                                  title={accounts.length <= 1 ? 'Debe existir al menos una cuenta' : 'Eliminar cuenta'}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer disabled:opacity-30"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SOCIEDADES ANÓNIMAS (S.A.) */}
      {activeTab === 'empresas' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddCompany}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Sociedad Anónima (S.A.) *
              </label>
              <input
                type="text"
                required
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="Ej. S.A. Desarrolladora 4"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">RFC (Opcional)</label>
                <input
                  type="text"
                  value={compRfc}
                  onChange={(e) => setCompRfc(e.target.value)}
                  placeholder="RFC"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 flex items-center gap-1.5 h-[34px] self-end"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Agregar S.A.</span>
              </button>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B2545] text-white">
                  <th className="py-3 px-4 text-left font-bold">Sociedad Anónima (Columna en Resumen)</th>
                  <th className="py-3 px-4 text-left font-bold">RFC</th>
                  <th className="py-3 px-4 text-center font-bold w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((co) => {
                  const isEditing = editingCompId === co.id;
                  return (
                    <tr key={co.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editCompData.name}
                            onChange={(e) => setEditCompData({ ...editCompData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs"
                          />
                        ) : (
                          co.name
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editCompData.rfc}
                            onChange={(e) => setEditCompData({ ...editCompData, rfc: e.target.value })}
                            className="w-full px-2 py-1 border border-amber-400 rounded-lg text-xs font-mono"
                          />
                        ) : (
                          co.rfc || '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => {
                                  if (editCompData.name.trim()) {
                                    updateCompany(co.id, {
                                      name: editCompData.name.trim(),
                                      shortName: editCompData.name.trim(),
                                      rfc: editCompData.rfc.trim() || undefined,
                                    });
                                  }
                                  setEditingCompId(null);
                                }}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingCompId(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCompId(co.id);
                                  setEditCompData({ name: co.name, rfc: co.rfc || '' });
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteCompany(co.id)}
                                disabled={companies.length <= 1}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer disabled:opacity-30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CONCEPTOS DE INGRESOS Y EGRESOS */}
      {activeTab === 'conceptos' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddConcept}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Concepto *</label>
              <select
                value={conceptKind}
                onChange={(e) => setConceptKind(e.target.value as 'ingreso' | 'egreso')}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
              >
                <option value="ingreso">Concepto de Ingreso</option>
                <option value="egreso">Concepto de Egreso</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Concepto *</label>
              <input
                type="text"
                required
                value={conceptName}
                onChange={(e) => setConceptName(e.target.value)}
                placeholder="Ej. Pago de Permisos / Anticipo Proyecto"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 h-[34px]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Agregar Concepto</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['ingreso', 'egreso'] as const).map((kind) => {
              const list = concepts.filter((c) => c.kind === kind);
              return (
                <div key={kind} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-3 bg-[#0B2545] text-white text-xs font-bold uppercase tracking-wide">
                    {kind === 'ingreso' ? 'Conceptos de Ingresos' : 'Conceptos de Egresos'} ({list.length})
                  </div>
                  <div className="divide-y divide-slate-100">
                    {list.map((c) => (
                      <div key={c.id} className="px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{c.name}</span>
                        <button
                          onClick={() => deleteConcept(c.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {list.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400">Sin conceptos guardados.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
