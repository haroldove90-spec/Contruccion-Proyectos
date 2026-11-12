import React from 'react';
import { useERP } from '../context/ERPContext';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const RoleSelectionScreen: React.FC = () => {
  const { setCurrentRole } = useERP();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="mb-10 flex flex-col items-center">
        <BrandLogo size="xl" showText={true} />
      </div>

      <div className="w-full max-w-md">
        <button
          onClick={() => setCurrentRole('cod')}
          className="w-full group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-lg hover:border-amber-500 transition-all duration-200 text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500 active:scale-[0.99]"
        >
          <div className="w-16 h-16 mb-5 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <ShieldCheck className="w-9 h-9 stroke-[1.8]" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            COD
          </h2>

          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <span>Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
