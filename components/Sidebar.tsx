import React from 'react';
import { Icons } from '../constants';

interface SidebarProps {
  role: 'COACH' | 'STUDENT';
  activeTab: string;
  onTabChange: (tab: any) => void;
  userName: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, onTabChange, userName, onLogout }) => {
  const tabs = role === 'COACH' 
    ? [
        { id: 'DASHBOARD', label: 'Dashboard', icon: Icons.User },
        { id: 'LIBRARY', label: 'Biblioteca', icon: Icons.Strength },
        { id: 'FINANCE', label: 'Financeiro', icon: Icons.Finance },
        { id: 'DEPLOY', label: 'Baixar App', icon: () => (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        )},
      ]
    : [
        { id: 'STUDENT_PORTAL', label: 'Meus Treinos', icon: Icons.Run },
      ];

  return (
    <>
      {/* Sidebar para Desktop (Computador) */}
      <div className="hidden md:flex flex-col w-64 bg-[#0a0a0a] border-r border-white/10 h-screen sticky top-0 p-8">
        <div className="mb-12 text-center">
          <h1 className="text-xl font-black text-white leading-tight tracking-tighter uppercase mb-2">
            Hybrid <br/> Running Club
          </h1>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] border-t border-white/10 pt-2">
            Coach Rick Severo
          </p>
        </div>
        
        <nav className="flex-1 space-y-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black uppercase text-[10px] transition-all border ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white border-white/20 shadow-lg' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}>
                <tab.icon />
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-4 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-sm border border-white/10">
              {userName[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black text-white truncate">{userName}</span>
              <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{role}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2 text-[9px] font-black text-slate-500 hover:text-white transition-colors text-center uppercase tracking-[0.2em]"
          >
            Encerrar Sessão
          </button>
        </div>
      </div>

      {/* Menu Inferior para Mobile (Celular) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 border-t border-white/10 z-50 px-6 py-4 flex justify-around backdrop-blur-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              activeTab === tab.id ? 'text-white' : 'text-slate-400'
            }`}
          >
            <tab.icon />
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
