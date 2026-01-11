
import React, { useState, useEffect } from 'react';
import { Workout, Student, WorkoutType, Exercise, SpeedZones } from '../types';
import { generateWorkoutDescription } from '../services/geminiService';
import { Icons } from '../constants';

interface WorkoutFormModalProps {
  onClose: () => void;
  onSubmit: (workout: Workout) => void;
  onDelete?: (id: string) => void;
  students: Student[];
  exercises: Exercise[];
  initialStudentId?: string;
  workoutToEdit?: Workout | null;
}

const WorkoutFormModal: React.FC<WorkoutFormModalProps> = ({ onClose, onSubmit, onDelete, students, exercises, initialStudentId, workoutToEdit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: '',
    studentId: '',
    title: '',
    description: '', 
    type: WorkoutType.RUNNING,
    date: '', 
    warmupText: '',
    cooldownText: '',
    activationExercises: [] as string[],
    strengthExercises: [] as string[]
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (workoutToEdit) {
      setFormData({
        id: workoutToEdit.id,
        studentId: workoutToEdit.studentId,
        title: workoutToEdit.title,
        description: workoutToEdit.description,
        type: workoutToEdit.type as any,
        date: workoutToEdit.date,
        warmupText: workoutToEdit.warmupText || '',
        cooldownText: workoutToEdit.cooldownText || '',
        activationExercises: workoutToEdit.activationExercises || [],
        strengthExercises: workoutToEdit.strengthExercises || []
      });
      setStep(4);
    } else {
      const now = new Date();
      const diff = now.getDate() - now.getDay();
      const sunday = new Date(now);
      sunday.setDate(diff);
      setFormData(prev => ({ ...prev, date: sunday.toISOString().split('T')[0] }));
      
      if (initialStudentId) {
        setFormData(prev => ({ ...prev, studentId: initialStudentId }));
        setStep(2);
      }
    }
  }, [workoutToEdit, initialStudentId]);

  const handleTextChange = (field: 'warmupText' | 'description' | 'cooldownText', value: string) => {
    if (!formData.studentId) {
      setFormData(prev => ({ ...prev, [field]: value }));
      return;
    }

    const student = students.find(s => s.id === formData.studentId);
    if (!student || !student.speedZones) {
      setFormData(prev => ({ ...prev, [field]: value }));
      return;
    }

    const pattern = /\bz([1-5])(\s)/gi;
    const processedValue = value.replace(pattern, (match, zoneNum, whitespace) => {
      const key = `z${zoneNum}` as keyof SpeedZones;
      const pace = student.speedZones?.[key];
      if (pace && pace.trim() !== '') return `${pace}${whitespace}`;
      return match;
    });

    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const getWeekRange = (dateStr: string) => {
    if (!dateStr) return { start: '', end: '', full: 'Semana não definida' };
    const start = new Date(dateStr + 'T00:00:00');
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      end: end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      full: `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
    };
  };

  const getNearbyWeeks = () => {
    const today = new Date();
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());
    
    const weeks = [];
    for (let i = -1; i <= 4; i++) {
      const d = new Date(currentSunday);
      d.setDate(currentSunday.getDate() + (i * 7));
      const dateStr = d.toISOString().split('T')[0];
      weeks.push({
        dateStr,
        label: i === 0 ? 'Semana Atual' : i === -1 ? 'Semana Passada' : `Daqui a ${i} Semanas`,
        range: getWeekRange(dateStr)
      });
    }
    return weeks;
  };

  const handleGeminiAssist = async () => {
    if (!formData.title || !formData.studentId) return;
    const student = students.find(s => s.id === formData.studentId);
    setIsGenerating(true);
    const result = await generateWorkoutDescription(formData.title, student?.level || 'Intermediate');
    setFormData(prev => ({ ...prev, description: result }));
    setIsGenerating(false);
  };

  const handleDeleteWorkout = () => {
    if (workoutToEdit && onDelete) {
      if (window.confirm("Deseja EXCLUIR permanentemente este treino?")) {
        onDelete(workoutToEdit.id);
      }
    }
  };

  const ExercisePicker = ({ label, category, selected, onToggle }: { label: string, category: WorkoutType, selected: string[], onToggle: (id: string) => void }) => (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {exercises.filter(ex => ex.category === category).map(ex => (
          <button
            key={ex.id}
            type="button"
            onClick={() => onToggle(ex.id)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight border transition-all ${
              selected.includes(ex.id) ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-md p-4 overflow-y-auto">
      <div className={`bg-[#0a0a0a] w-full ${step === 4 ? 'max-w-4xl' : 'max-w-3xl'} rounded-[3rem] border border-white/10 p-8 md:p-12 shadow-2xl my-8 relative animate-in zoom-in-95 duration-200`}>
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
              {workoutToEdit ? 'Editar Treino' : 'Prescrever'}
            </h3>
            <div className="flex items-center gap-3 mt-3">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1 rounded-full transition-all ${step >= s ? 'w-10 bg-white' : 'w-4 bg-white/10'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Etapa 1: Atleta</h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Escolha quem receberá o treino</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {students.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setFormData({...formData, studentId: s.id});
                    setStep(2);
                  }}
                  className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-1 ${
                    formData.studentId === s.id 
                    ? 'bg-white border-white shadow-xl' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className={`text-xs font-black uppercase tracking-tighter truncate ${formData.studentId === s.id ? 'text-black' : 'text-white'}`}>{s.name}</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${formData.studentId === s.id ? 'text-slate-600' : 'text-slate-500'}`}>{s.level}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Etapa 2: Semana</h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Periodização de Domingo a Sábado</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getNearbyWeeks().map(week => (
                <button
                  key={week.dateStr}
                  type="button"
                  onClick={() => {
                    setFormData({...formData, date: week.dateStr});
                    setStep(3);
                  }}
                  className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-1 ${
                    formData.date === week.dateStr 
                    ? 'bg-white border-white shadow-xl' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 group'
                  }`}
                >
                  <span className={`text-[8px] font-black uppercase tracking-widest ${formData.date === week.dateStr ? 'text-black/60' : 'text-slate-600'}`}>{week.label}</span>
                  <span className={`text-sm font-black uppercase tracking-tighter ${formData.date === week.dateStr ? 'text-black' : 'text-white group-hover:text-white'}`}>{week.range.full}</span>
                </button>
              ))}
              
              <div className="relative col-span-full">
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={e => {
                    const d = new Date(e.target.value + 'T00:00:00');
                    if(!isNaN(d.getTime())) {
                      d.setDate(d.getDate() - d.getDay());
                      setFormData({...formData, date: d.toISOString().split('T')[0]});
                      setStep(3);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="p-6 rounded-[2rem] border border-white/5 bg-white/5 text-slate-500 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:border-white/20 transition-all">
                  Outra Semana...
                </div>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full py-4 font-black text-slate-600 hover:text-white uppercase tracking-widest text-[10px]">Voltar</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Etapa 3: Tipo</h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Qual a natureza do estímulo?</p>
            </div>
             <div className="flex flex-col md:flex-row gap-6">
                <button 
                  onClick={() => {
                    setFormData({...formData, type: WorkoutType.RUNNING});
                    setStep(4);
                  }}
                  className="flex-1 p-10 rounded-[2.5rem] bg-white text-black flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 shadow-2xl"
                >
                  <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center text-black">
                    <Icons.Run />
                  </div>
                  <span className="font-black uppercase tracking-widest text-sm">Corrida</span>
                </button>
                <button 
                  onClick={() => {
                    setFormData({...formData, type: WorkoutType.STRENGTH});
                    setStep(4);
                  }}
                  className="flex-1 p-10 rounded-[2.5rem] bg-white/5 border border-white/10 text-white flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/10 hover:scale-105"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white">
                    <Icons.Strength />
                  </div>
                  <span className="font-black uppercase tracking-widest text-sm">Força</span>
                </button>
             </div>
             <button onClick={() => setStep(2)} className="w-full py-4 font-black text-slate-600 hover:text-white uppercase tracking-widest text-[10px]">Voltar</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            {/* TÍTULO EM DESTAQUE NO TOPO DA ETAPA 4 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 w-full space-y-2">
                <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-1">Título da Planilha</label>
                <input 
                  placeholder="Dê um nome a este treino (Ex: Rodagem Z2)" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full bg-white/5 border-2 border-white/20 rounded-[1.5rem] px-6 py-5 text-white font-black text-lg caret-white focus:border-white focus:bg-white/10 transition-all shadow-inner" 
                />
              </div>
              <div className="bg-white/10 px-8 py-5 rounded-[1.5rem] border border-white/10 flex flex-col items-center justify-center min-w-[180px] self-stretch">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Período</span>
                <span className="text-[12px] font-black text-white uppercase tracking-tight">{getWeekRange(formData.date).full}</span>
              </div>
            </div>

            <div className="space-y-8 bg-white/5 p-8 rounded-[3rem] border border-white/5">
              {formData.type === WorkoutType.RUNNING ? (
                <>
                  <div className="pb-4 border-b border-white/5">
                    <ExercisePicker 
                      label="1. Ativação Técnica (Vídeos)" category={WorkoutType.ACTIVATION} 
                      selected={formData.activationExercises} onToggle={id => setFormData(prev => ({...prev, activationExercises: prev.activationExercises.includes(id) ? prev.activationExercises.filter(i => i !== id) : [...prev.activationExercises, id]}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Aquecimento</label>
                      <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Atalhos: z1, z2...</span>
                    </div>
                    <textarea rows={2} value={formData.warmupText} onChange={e => handleTextChange('warmupText', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium resize-none focus:border-white/30 caret-white" placeholder="Descreva o aquecimento..." />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">3. Bloco Principal</label>
                      <button type="button" onClick={handleGeminiAssist} disabled={isGenerating} className="text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-widest">{isGenerating ? 'IA Processando...' : '✨ Assistente Gemini'}</button>
                    </div>
                    <textarea rows={6} value={formData.description} onChange={e => handleTextChange('description', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium resize-none min-h-[160px] focus:border-white/30 caret-white" placeholder="Qual o desafio principal do dia?" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">4. Desaquecimento</label>
                    <textarea rows={2} value={formData.cooldownText} onChange={e => handleTextChange('cooldownText', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium resize-none focus:border-white/30" placeholder="Recuperação final..." />
                  </div>
                </>
              ) : (
                <>
                  <ExercisePicker 
                    label="Exercícios de Fortalecimento (Vídeos)" category={WorkoutType.STRENGTH} 
                    selected={formData.strengthExercises} onToggle={id => setFormData(prev => ({...prev, strengthExercises: prev.strengthExercises.includes(id) ? prev.strengthExercises.filter(i => i !== id) : [...prev.strengthExercises, id]}))} 
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocolo e Séries</label>
                    <textarea rows={6} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium resize-none min-h-[180px] focus:border-white/30" placeholder="Ex: 3 séries de 12 repetições..." />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="flex gap-4 flex-1">
                <button onClick={() => setStep(3)} className="flex-1 py-4 font-black text-slate-600 hover:text-white uppercase tracking-widest text-[10px]">Voltar</button>
                {workoutToEdit && (
                  <button onClick={handleDeleteWorkout} className="flex-1 py-4 font-black text-red-500 hover:text-red-400 uppercase tracking-widest text-[10px]">Excluir</button>
                )}
              </div>
              <button 
                onClick={() => {
                   // Permite publicar mesmo sem título, usando um fallback
                   const finalTitle = formData.title.trim() || `Sessão de ${formData.type === WorkoutType.RUNNING ? 'Corrida' : 'Força'}`;
                   onSubmit({
                      id: formData.id || Math.random().toString(36).substr(2, 9),
                      studentId: formData.studentId,
                      title: finalTitle,
                      description: formData.description,
                      type: formData.type as any,
                      date: formData.date,
                      warmupText: formData.warmupText,
                      cooldownText: formData.cooldownText,
                      activationExercises: formData.activationExercises,
                      strengthExercises: formData.strengthExercises,
                      feedback: workoutToEdit?.feedback
                   });
                }}
                className="flex-[2] bg-white text-black font-black py-6 rounded-2xl uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-200 active:scale-95 transition-all"
              >
                {workoutToEdit ? 'Salvar Alterações' : 'Publicar Planilha'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutFormModal;
