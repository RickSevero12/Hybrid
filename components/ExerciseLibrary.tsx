
import React, { useState, useEffect } from 'react';
import { WorkoutType, Exercise } from '../types';

interface ExerciseLibraryProps {
  exercises: Exercise[];
  onAddExercise?: (exercise: Exercise) => void;
  onUpdateExercise?: (exercise: Exercise) => void;
  onDeleteExercise?: (id: string) => void;
  isCoach?: boolean;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ 
  exercises, 
  onAddExercise, 
  onUpdateExercise, 
  onDeleteExercise, 
  isCoach 
}) => {
  const [filter, setFilter] = useState<WorkoutType.STRENGTH | WorkoutType.ACTIVATION | 'ALL'>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: WorkoutType.STRENGTH as WorkoutType.STRENGTH | WorkoutType.ACTIVATION
  });

  useEffect(() => {
    if (editingExercise) {
      setFormData({
        title: editingExercise.title,
        description: editingExercise.description,
        videoUrl: editingExercise.videoUrl,
        category: editingExercise.category as any
      });
      setIsAdding(true);
    }
  }, [editingExercise]);

  const filtered = filter === 'ALL' 
    ? exercises 
    : exercises.filter(ex => ex.category === filter);

  const formatYoutubeUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  const handleSave = () => {
    if (!formData.title || !formData.videoUrl) return;
    
    const exerciseData: Exercise = {
      id: editingExercise ? editingExercise.id : Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      videoUrl: formatYoutubeUrl(formData.videoUrl),
      category: formData.category
    };

    if (editingExercise && onUpdateExercise) {
      onUpdateExercise(exerciseData);
    } else if (onAddExercise) {
      onAddExercise(exerciseData);
    }

    setFormData({ title: '', description: '', videoUrl: '', category: WorkoutType.STRENGTH });
    setEditingExercise(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja realmente excluir este vídeo?") && onDeleteExercise) {
      onDeleteExercise(id);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Acervo do Club</h2>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Referência técnica de movimentos</p>
        </div>
        {isCoach && (
          <button 
            onClick={() => {
              setEditingExercise(null);
              setFormData({ title: '', description: '', videoUrl: '', category: WorkoutType.STRENGTH });
              setIsAdding(true);
            }}
            className="bg-white text-black font-black px-8 py-4 rounded-2xl shadow-xl hover:bg-slate-200 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            Adicionar Vídeo +
          </button>
        )}
      </header>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="bg-[#111] w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl p-10">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">
              {editingExercise ? 'Editar Exercício' : 'Novo Movimento'}
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título</label>
                <input 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#050505] border border-white/20 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/40 caret-white"
                  placeholder="Ex: Agachamento Goblet"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Link do YouTube</label>
                <input 
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  className="w-full bg-[#050505] border border-white/20 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/40 caret-white"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full bg-[#050505] border border-white/20 rounded-2xl px-6 py-4 text-white font-bold outline-none appearance-none"
                >
                  <option value={WorkoutType.ACTIVATION} className="bg-[#111] text-white">Ativação</option>
                  <option value={WorkoutType.STRENGTH} className="bg-[#111] text-white">Fortalecimento</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Execução</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[#050505] border border-white/20 rounded-2xl px-6 py-4 text-white font-medium outline-none resize-none focus:border-white/40 caret-white"
                  rows={2}
                  placeholder="Principais pontos da execução..."
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button onClick={() => { setIsAdding(false); setEditingExercise(null); }} className="flex-1 font-black text-slate-500 uppercase tracking-widest text-[10px]">Cancelar</button>
                <button onClick={handleSave} className="flex-[2] bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Publicar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-4 border-b border-white/5">
        {[ 'ALL', WorkoutType.ACTIVATION, WorkoutType.STRENGTH ].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              filter === type 
              ? 'bg-white text-black border-white shadow-xl' 
              : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'
            }`}
          >
            {type === 'ALL' ? 'Acervo Completo' : type === WorkoutType.ACTIVATION ? 'Ativação' : 'Fortalecimento'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(ex => (
          <div key={ex.id} className="bg-[#111] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-xl flex flex-col group hover:border-white/20 transition-all">
            <div className="aspect-video bg-black relative">
              <iframe width="100%" height="100%" src={ex.videoUrl} title={ex.title} frameBorder="0" allowFullScreen></iframe>
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-black text-white text-lg leading-tight uppercase tracking-tighter">{ex.title}</h4>
                <span className="text-[8px] font-black bg-white/5 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                  {ex.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-wide flex-1 leading-relaxed">{ex.description}</p>
              
              {isCoach && (
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-2">
                  <button onClick={() => setEditingExercise(ex)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button>
                  <button onClick={() => handleDelete(ex.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
