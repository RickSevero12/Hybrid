
import React, { useState } from 'react';

interface AuthFormProps {
  onLogin: (email: string, pass: string) => boolean | 'VERIFY';
  onVerify: (code: string) => boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onVerify }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [step, setStep] = useState<'LOGIN' | 'VERIFY'>('LOGIN');
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onLogin(email, password);
    if (result === 'VERIFY') {
      setStep('VERIFY');
    } else if (!result) {
      setError(true);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onVerify(verificationCode)) {
      setError(true);
    }
  };

  if (step === 'VERIFY') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-[#fdfbf7]">
        <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-[2rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">Segurança do Club</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Insira o código enviado ao seu e-mail</p>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <input 
              type="text" maxLength={6} value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-center text-4xl font-black tracking-[0.4em] outline-none focus:bg-white/10 focus:border-white/30 text-white"
              placeholder="000000" required
            />
            {error && <p className="text-slate-300 text-[10px] font-black text-center uppercase bg-red-950/20 py-3 rounded-xl border border-red-900/50">Código Inválido</p>}
            <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest hover:bg-slate-200">Validar Acesso</button>
          </form>
          <button onClick={() => setStep('LOGIN')} className="w-full text-slate-500 font-black text-[10px] hover:text-white uppercase tracking-widest transition-colors">Voltar ao Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-[#fdfbf7]">
      <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-[2.5rem] shadow-2xl p-12 space-y-12 animate-in fade-in duration-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3 uppercase text-white">
            Hybrid <span className="text-slate-500">Running</span> <br/> Club
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Coach Rick Severo</p>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Membro ID / E-mail</label>
            <input 
              type="email" value={email} onChange={e => { setEmail(e.target.value); setError(false); }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:bg-white/10 focus:border-white/30 transition-all text-white font-bold placeholder-slate-700"
              placeholder="atleta@email.com" required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
            <input 
              type="password" value={password} onChange={e => { setPassword(e.target.value); setError(false); }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:bg-white/10 focus:border-white/30 transition-all text-white font-bold placeholder-slate-700"
              placeholder="••••••••" required
            />
          </div>

          {error && <p className="text-slate-300 text-[9px] font-black text-center uppercase bg-white/5 py-3 rounded-xl border border-white/10">Acesso não autorizado. Verifique suas credenciais.</p>}

          <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest mt-4 hover:bg-slate-200">
            Acessar Plataforma
          </button>
        </form>

        <div className="text-center relative z-10 border-t border-white/10 pt-8">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-relaxed">
            Performance & Conditioning Systems<br/>
            © 2025 Hybrid Running Club
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
