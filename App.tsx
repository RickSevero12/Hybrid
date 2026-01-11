import React, { useState } from 'react';
import { User, Student, Workout, WorkoutFeedback, Exercise, PaymentRecord } from './types';
import { MOCK_STUDENTS, MOCK_EXERCISES } from './constants';
import CoachDashboard from './components/CoachDashboard';
import StudentPortal from './components/StudentPortal';
import Sidebar from './components/Sidebar';
import AuthForm from './components/AuthForm';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [libraryExercises, setLibraryExercises] = useState<Exercise[]>(MOCK_EXERCISES);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'STUDENT_PORTAL' | 'LIBRARY' | 'FINANCE' | 'DEPLOY'>('DASHBOARD');

  const handleLogin = (email: string, pass: string): boolean | 'VERIFY' => {
    // Login do Coach (Rick)
    if (email === 'rick@coach.com' && pass === 'rick123') {
      setCurrentUser({ id: 'c1', role: 'COACH', name: 'Rick Severo', email });
      setActiveTab('DASHBOARD');
      return true;
    }
    // Login do Aluno
    const student = students.find(s => s.email === email && s.password === pass);
    if (student) {
      if (!student.isVerified) {
        setPendingUser(student);
        return 'VERIFY';
      }
      setCurrentUser({ id: student.id, role: 'STUDENT', name: student.name, email, status: student.status, isVerified: student.isVerified });
      setActiveTab('STUDENT_PORTAL');
      return true;
    }
    return false;
  };

  const handleVerify = (code: string): boolean => {
    if (code === '123456' && pendingUser) {
      const updatedStudents = students.map(s => s.id === pendingUser.id ? { ...s, isVerified: true } : s);
      setStudents(updatedStudents);
      setCurrentUser({ id: pendingUser.id, role: 'STUDENT', name: pendingUser.name, email: pendingUser.email, status: pendingUser.status, isVerified: true });
      setPendingUser(null);
      setActiveTab('STUDENT_PORTAL');
      return true;
    }
    return false;
  };

  const addWorkout = (workout: Workout) => setWorkouts(prev => [...prev, workout]);
  const updateExistingWorkout = (workout: Workout) => setWorkouts(prev => prev.map(w => w.id === workout.id ? workout : w));
  const deleteWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id));
  
  const addExercise = (exercise: Exercise) => setLibraryExercises(prev => [...prev, exercise]);
  const updateExercise = (exercise: Exercise) => setLibraryExercises(prev => prev.map(ex => ex.id === exercise.id ? exercise : ex));
  const deleteExercise = (id: string) => setLibraryExercises(prev => prev.filter(ex => ex.id !== id));

  const addStudent = (student: Student) => setStudents(prev => [...prev, student]);
  const updateStudent = (id: string, updates: Partial<Student>) => setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  const addPayment = (studentId: string, payment: PaymentRecord) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, paymentHistory: [payment, ...s.paymentHistory] } : s));
  };

  const updateWorkoutFeedback = (workoutId: string, feedback: WorkoutFeedback) => {
    setWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, feedback } : w));
  };

  if (!currentUser) return <AuthForm onLogin={handleLogin} onVerify={handleVerify} />;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#fdfbf7]">
      <Sidebar 
        role={currentUser.role} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userName={currentUser.name} 
        onLogout={() => setCurrentUser(null)} 
      />
      <main className="flex-1 p-4 md:p-8 lg:p-12 pb-24 md:pb-8 overflow-y-auto max-h-screen">
        {currentUser.role === 'COACH' ? (
          <CoachDashboard 
            workouts={workouts} 
            onAddWorkout={addWorkout} 
            onUpdateWorkout={updateExistingWorkout} 
            onDeleteWorkout={deleteWorkout}
            activeTab={activeTab} 
            libraryExercises={libraryExercises} 
            onAddExercise={addExercise} 
            onUpdateExercise={updateExercise}
            onDeleteExercise={deleteExercise} 
            students={students} 
            onAddStudent={addStudent} 
            onUpdateStudent={updateStudent} 
            onAddPayment={addPayment}
          />
        ) : (
          <StudentPortal 
            studentId={currentUser.id} 
            workouts={workouts.filter(w => w.studentId === currentUser.id)}
            userName={currentUser.name} 
            onUpdateWorkout={updateWorkoutFeedback} 
            libraryExercises={libraryExercises}
            status={currentUser.status || 'inactive'} 
            studentData={students.find(s => s.id === currentUser.id)!}
            onUpdateStudent={updateStudent}
          />
        )}
      </main>
    </div>
  );
};

export default App;
