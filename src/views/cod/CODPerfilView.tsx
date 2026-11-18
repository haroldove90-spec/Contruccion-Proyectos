import React, { useState, useEffect } from 'react';
import { useCOD } from '../../context/CODContext';
import {
  User,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  UserPlus,
  Trash2,
  Edit3,
  X,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';

export const CODPerfilView: React.FC = () => {
  const {
    currentUser,
    users,
    updateCurrentUserProfile,
    changeCurrentUserPassword,
    upsertTeamUser,
    deleteTeamUser,
  } = useCOD();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [position, setPosition] = useState(currentUser?.position || '');
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'ok' | 'error';
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'ok' | 'error';
    text: string;
  } | null>(null);

  // Admin-only team member state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [teamFullName, setTeamFullName] = useState('');
  const [teamUsername, setTeamUsername] = useState('');
  const [teamRole, setTeamRole] = useState<'admin' | 'administracion'>('administracion');
  const [teamPassword, setTeamPassword] = useState('');
  const [teamPosition, setTeamPosition] = useState('');
  const [teamFeedback, setTeamFeedback] = useState<{
    type: 'ok' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setUsername(currentUser.username);
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setPosition(currentUser.position || '');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateCurrentUserProfile({
      fullName,
      username,
      email,
      phone,
      position,
    });
    if (res.ok) {
      setProfileFeedback({
        type: 'ok',
        text: 'Datos personales guardados y sincronizados.',
      });
    } else {
      setProfileFeedback({ type: 'error', text: res.error });
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'La nueva contraseña y su confirmación no coinciden.',
      });
      return;
    }
    const res = changeCurrentUserPassword(currentPassword, newPassword);
    if (res.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({
        type: 'ok',
        text: 'Contraseña actualizada correctamente.',
      });
    } else {
      setPasswordFeedback({ type: 'error', text: res.error });
    }
  };

  const handleSaveTeamUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = upsertTeamUser({
      id: editingUserId || undefined,
      fullName: teamFullName,
      username: teamUsername,
      role: teamRole,
      password: teamPassword || undefined,
      position: teamPosition,
    });
    if (res.ok) {
      setTeamFeedback({
        type: 'ok',
        text: editingUserId
          ? `Usuario @${res.user.username} actualizado.`
          : `Usuario @${res.user.username} creado correctamente.`,
      });
      setEditingUserId(null);
      setTeamFullName('');
      setTeamUsername('');
      setTeamRole('administracion');
      setTeamPassword('');
      setTeamPosition('');
    } else {
      setTeamFeedback({ type: 'error', text: res.error });
    }
  };

  const startEditUser = (u: (typeof users)[number]) => {
    setEditingUserId(u.id);
    setTeamFullName(u.fullName);
    setTeamUsername(u.username);
    setTeamRole(u.role);
    setTeamPassword('');
    setTeamPosition(u.position || '');
    setTeamFeedback(null);
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setTeamFullName('');
    setTeamUsername('');
    setTeamRole('administracion');
    setTeamPassword('');
    setTeamPosition('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-black text-xl shrink-0">
            {currentUser.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {currentUser.fullName}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                  isAdmin
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isAdmin ? 'Admin' : 'Administración'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Usuario: <span className="font-mono font-bold text-slate-700">@{currentUser.username}</span>
              {currentUser.position ? ` · ${currentUser.position}` : ''}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
          Actualiza tus datos personales y credenciales en cualquier momento.
        </div>
      </div>

      {/* Personal Data & Password Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Datos Personales */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-[#0B2545]" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Datos Personales
            </h2>
          </div>

          {profileFeedback && (
            <div
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                profileFeedback.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {profileFeedback.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileFeedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Usuario de Acceso *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  Puesto / Cargo
                </span>
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej. Director General / Contadora"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  Correo Electrónico
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  Teléfono
                </span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 81 1234 5678"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Guardar Datos Personales</span>
            </button>
          </div>
        </form>

        {/* Form 2: Cambiar Contraseña */}
        <form
          onSubmit={handleSavePassword}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Seguridad y Contraseña
              </h2>
            </div>

            {passwordFeedback && (
              <div
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                  passwordFeedback.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {passwordFeedback.type === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordFeedback.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña Actual *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Actualizar Contraseña</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admin-only Team & Role Management */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-5 py-4 bg-[#0B2545] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Gestión de Usuarios y Roles (Admin / Administración)
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Exclusivo rol Admin: administra accesos, asigna roles y restablece contraseñas del equipo
              </p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {teamFeedback && (
              <div
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                  teamFeedback.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {teamFeedback.type === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{teamFeedback.text}</span>
              </div>
            )}

            <form
              onSubmit={handleSaveTeamUser}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end bg-slate-50 border border-slate-200 rounded-xl p-4"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={teamFullName}
                  onChange={(e) => setTeamFullName(e.target.value)}
                  placeholder="Ej. María López"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Usuario *
                </label>
                <input
                  type="text"
                  required
                  value={teamUsername}
                  onChange={(e) => setTeamUsername(e.target.value)}
                  placeholder="Ej. maria_admin"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Rol *
                </label>
                <select
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value as 'admin' | 'administracion')}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="administracion">Administración</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Puesto
                </label>
                <input
                  type="text"
                  value={teamPosition}
                  onChange={(e) => setTeamPosition(e.target.value)}
                  placeholder="Ej. Auxiliar Contable"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {editingUserId ? 'Nueva Clave (Opcional)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  value={teamPassword}
                  onChange={(e) => setTeamPassword(e.target.value)}
                  placeholder={editingUserId ? 'Sin cambio' : 'Mín. 6 caracteres'}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer h-[34px]"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{editingUserId ? 'Guardar' : 'Alta'}</span>
                </button>
                {editingUserId && (
                  <button
                    type="button"
                    onClick={cancelEditUser}
                    className="px-2.5 py-2 bg-white border border-slate-300 text-slate-600 rounded-xl cursor-pointer h-[34px]"
                    title="Cancelar edición"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-4 text-left font-bold">Nombre</th>
                    <th className="py-2.5 px-4 text-left font-bold">Usuario</th>
                    <th className="py-2.5 px-4 text-left font-bold">Rol</th>
                    <th className="py-2.5 px-4 text-left font-bold">Puesto / Contacto</th>
                    <th className="py-2.5 px-4 text-center font-bold w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {u.fullName}{' '}
                          {isSelf && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded ml-1">
                              Tú
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">@{u.username}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-slate-900 text-amber-400'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {u.role === 'admin' ? 'Admin' : 'Administración'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {[u.position, u.email, u.phone].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditUser(u)}
                              title="Editar usuario / rol / contraseña"
                              className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => deleteTeamUser(u.id)}
                              title={isSelf ? 'No puedes eliminar tu propio usuario' : 'Eliminar usuario'}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
    </div>
  );
};
