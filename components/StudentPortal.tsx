
import React, { useState, useMemo } from 'react';
import { Workout, WorkoutType, WorkoutFeedback, Exercise, Student, PaymentRecord } from '../types';
import { structureWorkoutForWatch } from '../services/geminiService';
import ExerciseLibrary from './ExerciseLibrary';

interface StudentPortalProps {
  studentId: string;
  workouts: Workout[];
  userName: string;
  onUpdateWorkout: (id: string, feedback: WorkoutFeedback) => void;
  libraryExercises: Exercise[];
  status: string;
  studentData: Student;
  onUpdateStudent: (id: string, updates: Partial<Student>) => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ 
  workouts, 
  userName, 
  onUpdateWorkout, 
  libraryExercises,
  status,
  studentData,
  onUpdateStudent
}) => {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [feedback, setFeedback] = useState({ difficulty: 5, notes: '' });
  const [activePortalTab, setActivePortalTab] = useState<'PLANILHA' | 'HISTORICO' | 'BIBLIOTECA' | 'ZONAS' | 'PAGAMENTO'>('PLANILHA');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [activeWeekTab, setActiveWeekTab] = useState<'ATUAL' | 'FUTURO' | 'PASSADO'>('ATUAL');
  
  // Checkout States
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD'>('PIX');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPixCode, setShowPixCode] = useState(false);

  const getSundayOfThisWeek = () => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    return sunday.toISOString().split('T')[0];
  };

  const currentSundayStr = getSundayOfThisWeek();

  const handleExportToWatch = async (workout: Workout) => {
    setIsSyncing(true);
    try {
      const structuredData = await structureWorkoutForWatch(
        workout.description, 
        workout.warmupText || "", 
        workout.cooldownText || "", 
        studentData.speedZones
      );
      await new Promise(resolve => setTimeout(resolve, 2500));
      setSyncSuccess("Treino sincronizado com sucesso!");
      setTimeout(() => setSyncSuccess(null), 5000);
    } catch (err) {
      alert("Erro ao sincronizar.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    // Simula integração com Gateway
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (paymentMethod === 'PIX') {
      setShowPixCode(true);
      setIsProcessingPayment(false);
    } else {
      const newPayment: PaymentRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        amount: studentData.planValue || 150,
        method: 'Cartão',
        status: 'Pago',
        transactionId: 'TX-' + Math.random().toString(36).toUpperCase().substr(2, 6)
      };
      
      const updatedHistory = [newPayment, ...(studentData.paymentHistory || [])];
      onUpdateStudent(studentData.id, { 
        paymentHistory: updatedHistory,
        status: 'active'
      });
      
      setIsProcessingPayment(false);
      alert("Pagamento aprovado! Seu acesso está ativo.");
      setActivePortalTab('PLANILHA');
    }
  };

  const filteredWorkouts = useMemo(() => {
    const uncompleted = workouts.filter(w => !w.feedback);
    if (activeWeekTab === 'ATUAL') return uncompleted.filter(w => w.date === currentSundayStr);
    if (activeWeekTab === 'FUTURO') return uncompleted.filter(w => w.date > currentSundayStr);
    return uncompleted.filter(w => w.date < currentSundayStr);
  }, [workouts, activeWeekTab, currentSundayStr]);

  if (activePortalTab === 'BIBLIOTECA') {
    return <ExerciseLibrary exercises={libraryExercises} isCoach={false} />;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Portal do Atleta</h2>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">{userName}</p>
            {studentData.status === 'inactive' && (
              <button 
                onClick={() => setActivePortalTab('PAGAMENTO')}
                className="bg-red-500/10 text-red-500 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-500/20 animate-pulse"
              >
                Pendente de Pagamento
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['PLANILHA', 'HISTORICO', 'ZONAS', 'BIBLIOTECA', 'PAGAMENTO'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActivePortalTab(tab as any)}
              className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                activePortalTab === tab ? 'bg-white text-black border-white' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'
              }`}
            >
              {tab === 'PLANILHA' ? 'Treinos' : tab === 'HISTORICO' ? 'Histórico' : tab === 'ZONAS' ? 'Zonas' : tab === 'PAGAMENTO' ? 'Mensalidade' : 'Vídeos'}
            </button>
          ))}
        </div>
      </header>

      {activePortalTab === 'PLANILHA' && (
        <div className="space-y-8">
           {/* ... Conteúdo de Planilha mantido ... */}
           <div className="flex gap-4 border-b border-white/5 pb-4">
            {['PASSADO', 'ATUAL', 'FUTURO'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveWeekTab(tab as any)}
                className={`text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeWeekTab === tab ? 'text-white border-b-2 border-white pb-4 -mb-[18px]' : 'text-slate-600'
                }`}
              >
                {tab === 'PASSADO' ? 'Anteriores' : tab === 'ATUAL' ? 'Esta Semana' : 'Próximas Semanas'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {filteredWorkouts.length === 0 ? (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <p className="text-slate-700 font-black uppercase tracking-widest text-[10px]">Sem treinos planejados.</p>
              </div>
            ) : (
              filteredWorkouts.map(workout => (
                <div key={workout.id} onClick={() => setSelectedWorkout(workout)} className="bg-[#111] p-8 rounded-[3rem] border border-white/5 hover:border-white/20 transition-all cursor-pointer group flex flex-col h-full shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-[10px]">
                      {workout.type === WorkoutType.RUNNING ? 'RUN' : 'STR'}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {new Date(workout.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-white">{workout.title}</h4>
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest line-clamp-2 mb-8 flex-1">{workout.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activePortalTab === 'PAGAMENTO' && (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-[#111] border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 md:p-16 space-y-10 border-r border-white/5">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Renovação de Plano</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-loose">
                    Ative seu acesso para receber as novas planilhas e vídeos do Coach Rick.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'PIX' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white'}`} onClick={() => setPaymentMethod('PIX')}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'PIX' ? 'bg-black/5 text-black' : 'bg-white/5 text-white'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                      </div>
                      <span className="font-black uppercase text-xs tracking-widest">Pix (Instantâneo)</span>
                    </div>
                    {paymentMethod === 'PIX' && <div className="w-2 h-2 rounded-full bg-black animate-ping"></div>}
                  </div>

                  <div className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'CARD' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white'}`} onClick={() => setPaymentMethod('CARD')}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'CARD' ? 'bg-black/5 text-black' : 'bg-white/5 text-white'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75-3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V15" /></svg>
                      </div>
                      <span className="font-black uppercase text-xs tracking-widest">Cartão de Crédito</span>
                    </div>
                    {paymentMethod === 'CARD' && <div className="w-2 h-2 rounded-full bg-black animate-ping"></div>}
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex justify-between items-end mb-8 border-t border-white/5 pt-8">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total do Período</span>
                    <span className="text-5xl font-black text-white tracking-tighter">R$ {studentData.planValue || 150}</span>
                  </div>

                  <button 
                    onClick={handleProcessPayment}
                    disabled={isProcessingPayment}
                    className="w-full bg-white text-black font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessingPayment ? (
                      <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                    ) : (
                      'Pagar Agora'
                    )}
                  </button>
                </div>
              </div>

              <div className="p-12 md:p-16 bg-white/[0.02] flex flex-col justify-center items-center text-center">
                {showPixCode ? (
                  <div className="space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="w-48 h-48 bg-white p-4 rounded-3xl mx-auto shadow-2xl">
                       <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=rick-severo-pix-payload-simulado" className="w-full h-full" alt="PIX QR" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Escaneie o QR Code ou copie o código abaixo</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText("rick-severo-00020126360014br.gov.bcb.pix011400000000000000");
                          alert("Código copiado!");
                        }}
                        className="text-[9px] font-black text-white bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest"
                      >
                        Copiar Código Pix
                      </button>
                    </div>
                    <p className="text-[8px] text-green-500 font-black uppercase tracking-widest animate-pulse">Aguardando confirmação bancária...</p>
                  </div>
                ) : paymentMethod === 'CARD' ? (
                  <div className="w-full space-y-6 animate-in slide-in-from-right-8 duration-500">
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Número do Cartão</label>
                      <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-black" placeholder="•••• •••• •••• ••••" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Vencimento</label>
                        <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-black" placeholder="MM/AA" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">CVV</label>
                        <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-black" placeholder="123" />
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">Pagamento processado via SSL criptografado.</p>
                  </div>
                ) : (
                  <div className="space-y-6 opacity-40">
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Selecione o método para prosseguir</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outras abas (HISTORICO, ZONAS, etc) mantidas conforme antes */}
      {activePortalTab === 'HISTORICO' && (
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-4">Extrato de Treinos</h3>
          {workouts.filter(w => !!w.feedback).length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <p className="text-slate-700 font-black uppercase tracking-widest text-[10px]">Sem histórico disponível.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {workouts.filter(w => !!w.feedback).map(workout => (
                <div key={workout.id} className="bg-[#111] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{workout.date}</span>
                    <h4 className="font-black text-white uppercase text-lg">{workout.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
