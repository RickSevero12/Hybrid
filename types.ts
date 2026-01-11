export enum WorkoutType { RUNNING = 'RUNNING', STRENGTH = 'STRENGTH', ACTIVATION = 'ACTIVATION' }
export interface WorkoutFeedback { difficulty: number; notes: string; completedAt: string; }
export interface Exercise { id: string; title: string; description: string; videoUrl: string; category: WorkoutType.STRENGTH | WorkoutType.ACTIVATION; }
export interface SpeedZones { z1: string; z2: string; z3: string; z4: string; z5: string; }
export interface Workout { id: string; studentId: string; date: string; title: string; description: string; type: WorkoutType.RUNNING | WorkoutType.STRENGTH; warmupText?: string; cooldownText?: string; activationExercises?: string[]; strengthExercises?: string[]; feedback?: WorkoutFeedback; }
export interface PaymentRecord { id: string; date: string; amount: number; method: 'Pix' | 'Cartão' | 'Dinheiro' | 'Transferência'; status: 'Pago' | 'Pendente' | 'Atrasado'; transactionId?: string; }
export interface Student { id: string; name: string; email: string; password?: string; level: 'Beginner' | 'Intermediate' | 'Advanced'; paymentDueDate: string; status: 'active' | 'inactive'; isVerified: boolean; paymentHistory: PaymentRecord[]; speedZones?: SpeedZones; planValue: number; }
export interface User { id: string; role: 'COACH' | 'STUDENT'; name: string; email: string; status?: 'active' | 'inactive'; isVerified?: boolean; }

// Gateway configuration for financial management
export interface GatewayConfig {
  provider: 'None' | 'Stripe' | 'MercadoPago';
  apiKey: string;
  pixKey: string;
  autoWithdraw: boolean;
}