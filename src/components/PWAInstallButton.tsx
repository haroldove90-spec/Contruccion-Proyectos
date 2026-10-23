import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Check, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 3000);
      }
    } else {
      // In desktop/browser where prompt is ambient or already triggered, give simple guidance
      setShowIOSModal(true);
    }
  };

  if (isInstalled || installedSuccess) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">App Instalada</span>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar Proyectos Construcciones en tu dispositivo"
        className={`inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 rounded-lg shadow-xs transition-colors cursor-pointer ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        }`}
      >
        <Download className="w-4 h-4 stroke-[2.2]" />
        <span>Instalar</span>
      </button>

      {/* Modal Guía de Instalación para iOS / Escritorio */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Instalar Proyectos Construcciones
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {isIOS ? (
                <>
                  <p className="font-medium text-slate-800">
                    Para instalar en iPhone o iPad (Safari):
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Toca el botón <strong>Compartir</strong> (ícono cuadrado con flecha hacia arriba en la barra de Safari).
                    </li>
                    <li>
                      Baja en las opciones y selecciona{' '}
                      <strong>&quot;Agregar a la pantalla de inicio&quot;</strong>.
                    </li>
                    <li>
                      Toca <strong>&quot;Agregar&quot;</strong> arriba a la derecha para tener acceso directo como app nativa.
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-medium text-slate-800">
                    Instalar en Android o Computadora:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      En Chrome/Edge: Presiona el ícono de instalación en la barra de direcciones o en el menú de tres puntos ({'⋮'}) &gt; &quot;Instalar Proyectos Construcciones&quot;.
                    </li>
                    <li>
                      Tendrás acceso offline rápido para residentes y compras en campo sin necesidad de app store.
                    </li>
                  </ul>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowIOSModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
