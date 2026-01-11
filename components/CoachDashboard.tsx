import React, { useState, useMemo } from 'react';
import { Workout, Student, WorkoutType, Exercise, PaymentRecord, SpeedZones } from '../types';
import WorkoutFormModal from './WorkoutFormModal';
import ExerciseLibrary from './ExerciseLibrary';
import StudentManagement from './StudentManagement';

interface CoachDashboardProps {
  workouts: Workout[];
  onAddWorkout: (workout: Workout) => void;
  onUpdateWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  activeTab: string;
  libraryExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onUpdateExercise: (exercise: Exercise) => void;
  onDeleteExercise: (id: string) => void;
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (id: string, updates: Partial<Student>) => void;
  onAddPayment: (studentId: string, payment: PaymentRecord) => void;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  workouts, 
  onAddWorkout, 
  onUpdateWorkout,
  onDeleteWorkout,
  activeTab, 
  libraryExercises, 
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  students,
  onAddStudent,
  onUpdateStudent,
  onAddPayment
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isZoneEditorOpen, setIsZoneEditorOpen] = useState(false);
  const [preSelectedStudentId, setPreSelectedStudentId] = useState<string>('');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [coachDetailTab, setCoachDetailTab] = useState<'TREINOS' | 'ZONAS'>('TREINOS');

  const [zoneEditorStep, setZoneEditorStep] = useState<'CHOICE' | 'MANUAL' | 'CALC_INPUT'>('CHOICE');
  const [zoneFormData, setZoneFormData] = useState<SpeedZones>({
    z1: '', z2: '', z3: '', z4: '', z5: ''
  });

  const handleOpenWorkoutModal = (studentId: string = '') => {
    setEditingWorkout(null);
    setPreSelectedStudentId(studentId);
    setIsWorkoutModalOpen(true);
  };

  const handleEditWorkout = (workout: Workout, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkout(workout);
    setIsWorkoutModalOpen(true);
  };

  const handleOpenZoneEditor = (student: Student) => {
    setZoneFormData(student.speedZones || { z1: '', z2: '', z3: '', z4: '', z5: '' });
    setZoneEditorStep('CHOICE');
    setIsZoneEditorOpen(true);
  };

  const handleSaveZones = () => {
    if (selectedStudent) {
      onUpdateStudent(selectedStudent.id, { speedZones: zoneFormData });
      setIsZoneEditorOpen(false);
    }
  };

  const groupedWorkouts = useMemo(() => {
    if (!selectedStudent) return {};
    const filtered = workouts.filter(w => w.studentId === selectedStudent.id);
    const groups: { [key: string]: Workout[] } = {};
    
    filtered.forEach(w => {
      const date = new Date(w.date + 'T00:00:00');
      const diff = date.getDate() - date.getDay();
      const sunday = new Date(date);
      sunday.setDate(diff);
      const label = `Semana de ${sunday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
      if (!groups[label]) groups[label] = [];
      groups[label].push(w);
    });
    return groups;
  }, [workouts, selectedStudent]);

  if (activeTab === 'LIBRARY') {
    return (
      <ExerciseLibrary 
        exercises={libraryExercises} 
        onAddExercise={onAddExercise} 
        onUpdateExercise={onUpdateExercise}
        onDeleteExercise={onDeleteExercise}
        isCoach={true} 
      />
    );
  }

  if (activeTab === 'FINANCE') {
    return <StudentManagement students={students} onAddStudent={onAddStudent} onUpdateStudent={onUpdateStudent} onAddPayment={onAddPayment} />;
  }

  if (activeTab === 'DEPLOY') {
    return (
      <div className="space-y-10 max-w-4xl mx-auto p-4">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Pronto para o Deploy!</h2>
        <p className="text-slate-400 text-sm">Você já subiu os arquivos principais. Continue com o restante da pasta components.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Painel de Controle</h2>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Gestão de Performance</p>
        </div>
        <button 
          onClick={() => handleOpenWorkoutModal()}
          className="bg-white text-black font-black px-8 py-4 rounded-2xl shadow-xl uppercase tracking-widest text-xs"
        >
          Nova Prescrição +
        </button>
      </header>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] pl-4">Atletas do Club</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <div 
              key={student.id}
              className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden group ${
                selectedStudent?.id === student.id 
                  ? 'border-white/20 bg-white/10 ring-1 ring-white/10' 
                  : 'border-white/5 bg-[#111] hover:border-white/10'
              }`}
              onClick={() => {
                setSelectedStudent(student);
                setCoachDetailTab('TREINOS');
              }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-sm border border-white/10">
                  {student.name[0]}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[8px] font-black px-3 py-1 bg-white/5 rounded-full text-slate-400 uppercase tracking-widest border border-white/5">
                    {student.level}
                  </span>
                </div>
              </div>
              <h4 className="font-black text-white text-xl uppercase tracking-tighter mb-1">{student.name}</h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{student.email}</p>
            </div>
          ))}
        </div>
      </section>

      {selectedStudent && (
        <section className="bg-[#111] rounded-[3rem] p-10 border border-white/5 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-6 gap-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Prescrição: {selectedStudent.name}</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleOpenWorkoutModal(selectedStudent.id)}
                className="bg-white/10 hover:bg-white/20 text-white font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest border border-white/10"
              >
                Nova Planilha +
              </button>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-500 hover:text-white uppercase font-black text-[10px] tracking-widest">Fechar</button>
            </div>
          </div>
          
          <div className="space-y-8">
            {Object.keys(groupedWorkouts).length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Sem prescrições registradas.</p>
              </div>
            ) : (
              Object.keys(groupedWorkouts).map(week => (
                <div key={week} className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{week}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedWorkouts[week].map(workout => (
                      <div key={workout.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="font-black uppercase text-sm text-white">{workout.title}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{new Date(workout.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        </div>
                        <button onClick={(e) => handleEditWorkout(workout, e)} className="text-[9px] font-black text-white uppercase bg-white/5 px-4 py-2 rounded-lg">Editar</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {isWorkoutModalOpen && (
        <WorkoutFormModal 
          onClose={() => setIsWorkoutModalOpen(false)} 
          onSubmit={(w) => {
            if (editingWorkout) onUpdateWorkout(w);
            else onAddWorkout(w);
            setIsWorkoutModalOpen(false);
          }}
          onDelete={(id) => {
            onDeleteWorkout(id);
            setIsWorkoutModalOpen(false);
          }}
          students={students}
          exercises={libraryExercises}
          initialStudentId={preSelectedStudentId}
          workoutToEdit={editingWorkout}
        />
      )}
    </div>
  );
};

export default CoachDashboard;
