
import React, { useState, useMemo } from 'react';
import { Student, PaymentRecord, GatewayConfig } from '../types';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (id: string, updates: Partial<Student>) => void;
  onAddPayment: (studentId: string, payment: PaymentRecord) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, onAddStudent, onUpdateStudent, onAddPayment }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [financeTab, setFinanceTab] = useState<'LISTA' | 'RELATORIOS' | 'CONFIG'>('LISTA');
  const [paymentModal, setPaymentModal] = useState<Student | null>(null);
  
  // Estados para o formulário de pagamento manual
  const [manualPayment, setManualPayment] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'Dinheiro' as any
  });

  const [gateway, setGateway] = useState<GatewayConfig>({
    provider: 'None',
    apiKey: '',
    pixKey: 'coach@rick.com',
    autoWithdraw: true
  });

  const mrr = useMemo(() => {
    return students.reduce((acc, s) => acc + (s.planValue || 150), 0);
  }, [students]);

  const totalBalance = useMemo(() => {
    return students.reduce((acc, s) => {
      return acc + (s.paymentHistory?.reduce((pAcc, p) => pAcc + p.amount, 0) || 0);
    }, 0);
  }, [students]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    level: 'Intermediate' as any,
    dueDate: new Date().toISOString().split('T')[0],
    planValue: 150
  });

  const handleAddStudent = () => {
    if (!formData.name || !formData.email) return;
    onAddStudent({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      password: formData.password || '123456',
      level: formData.level,
      paymentDueDate: formData.dueDate,
      status: 'active',
      isVerified: false,
      paymentHistory: [],
      planValue: formData.planValue
    });
    setIsAdding(false);
  };

  const handleRegisterManualPayment = () => {
    if (!paymentModal || manualPayment.amount <= 0) return;

    const newPayment: PaymentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: manualPayment.date,
      amount: manualPayment.amount,
      method: manualPayment.method,
      status: 'Pago',
      transactionId: 'MANUAL-' + Math.random().toString(36).toUpperCase().substr(2, 5)
    };

    onAddPayment(paymentModal.id, newPayment);
    
    // Atualiza o estado local do modal para mostrar o novo item na lista imediatamente
    setPaymentModal({
      ...paymentModal,
      paymentHistory: [newPayment, ...(paymentModal.paymentHistory || [])]
    });

    // Limpa o formulário
    setManualPayment({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'Dinheiro'
    });
    
    alert("Pagamento manual registrado com sucesso!");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Financeiro</h2>
          <div className="flex gap-4">
             {['LISTA', 'RELATORIOS', 'CONFIG'].map(t => (
               <button 
                 key={t}
                 onClick={() => setFinanceTab(t as any)}
                 className={`text-[9px] font-black uppercase tracking-widest transition-all ${financeTab === t ? 'text-white border-b border-white pb-1' : 'text-slate-600'}`}
               >
                 {t === 'LISTA' ? 'Membros' : t === 'RELATORIOS' ? 'Faturamento' : 'Configurações'}
               </button>
             ))}
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-white text-black font-black px-8 py-4 rounded-2xl shadow-xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
        >
          Novo Atleta +
        </button>
      </header>

      {financeTab === 'LISTA' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Atleta</th>
                    <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Plano</th>
                    <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-black text-white uppercase text-sm tracking-tight">{s.name}</div>
                        <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{s.email}</div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="font-black text-white text-xs">R$ {s.planValue || 150}</div>
                        <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Recorrência</div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {s.status === 'active' ? 'Ativo' : 'Atrasado'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => {
                            setPaymentModal(s);
                            setManualPayment(prev => ({ ...prev, amount: s.planValue || 150 }));
                          }} 
                          className="text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl transition-all"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#111] border border-white/10 p-10 rounded-[3rem] space-y-6">
               <div className="space-y-1">
                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Saldo Total</span>
                 <h4 className="text-4xl font-black text-white tracking-tighter">R$ {totalBalance.toFixed(2)}</h4>
               </div>
               <div className="space-y-1 pt-6 border-t border-white/5">
                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Receita Mensal Esperada</span>
                 <h4 className="text-2xl font-black text-green-500 tracking-tighter">R$ {mrr.toFixed(2)}</h4>
               </div>
               <button className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-200 transition-all">Solicitar Saque</button>
               <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest text-center">Transferência imediata via Pix</p>
            </div>
          </div>
        </div>
      )}

      {financeTab === 'CONFIG' && (
        <div className="max-w-2xl bg-[#111] border border-white/10 rounded-[3rem] p-12 space-y-10 animate-in slide-in-from-left-4 duration-500">
           <div className="space-y-2">
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Gateway de Pagamento</h3>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Conecte sua conta para receber pagamentos automáticos.</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             {['Stripe', 'MercadoPago'].map(p => (
               <button 
                 key={p} 
                 onClick={() => setGateway({...gateway, provider: p as any})}
                 className={`p-8 rounded-[2rem] border transition-all text-left flex flex-col gap-2 ${gateway.provider === p ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-white'}`}
               >
                 <span className="font-black text-sm uppercase">{p}</span>
                 <span className={`text-[8px] font-black uppercase tracking-widest ${gateway.provider === p ? 'text-black/50' : 'text-slate-600'}`}>{gateway.provider === p ? 'Conectado' : 'Desconectado'}</span>
               </button>
             ))}
           </div>

           <div className="space-y-6 pt-6 border-t border-white/5">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Chave Pix para Recebimento</label>
                <input 
                  value={gateway.pixKey} 
                  onChange={e => setGateway({...gateway, pixKey: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black" 
                  placeholder="coach@rick.com"
                />
             </div>
             <button className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl">Salvar Configurações</button>
           </div>
        </div>
      )}

      {/* MODAL DE PAGAMENTO (COACH VIEW) */}
      {paymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-2xl p-10 my-8">
             <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Gestão Financeira: {paymentModal.name}</h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Registro de recebimentos e histórico</p>
                </div>
                <button onClick={() => setPaymentModal(null)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors border border-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* COLUNA: REGISTRO MANUAL */}
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-8">
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-tighter">Registrar Pagamento Manual</h4>
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Para pagamentos recebidos fora do app (Pix direto, Dinheiro, etc)</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor Recebido (R$)</label>
                      <input 
                        type="number"
                        value={manualPayment.amount}
                        onChange={e => setManualPayment({...manualPayment, amount: Number(e.target.value)})}
                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
                        <input 
                          type="date"
                          value={manualPayment.date}
                          onChange={e => setManualPayment({...manualPayment, date: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-white/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Método</label>
                        <select 
                          value={manualPayment.method}
                          onChange={e => setManualPayment({...manualPayment, method: e.target.value as any})}
                          className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black outline-none appearance-none"
                        >
                          <option value="Pix">Pix Direto</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Transferência">Transferência</option>
                          <option value="Cartão">Cartão (Manual)</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={handleRegisterManualPayment}
                      className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl hover:bg-slate-200 transition-all"
                    >
                      Lançar Recebimento
                    </button>
                  </div>
                </div>

                {/* COLUNA: HISTÓRICO */}
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-white uppercase tracking-tighter ml-4">Últimas Transações</h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {paymentModal.paymentHistory?.length === 0 ? (
                      <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-slate-600 font-black uppercase tracking-widest text-[8px]">Nenhum registro encontrado.</p>
                      </div>
                    ) : (
                      paymentModal.paymentHistory?.map(p => (
                        <div key={p.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
                          <div>
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">{new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                            <span className="text-white font-black uppercase text-xs tracking-tight">{p.method}</span>
                            {p.transactionId && <span className="text-[7px] text-slate-700 block mt-1 uppercase tracking-tighter">ID: {p.transactionId}</span>}
                          </div>
                          <div className="text-right">
                              <span className="text-white font-black text-lg block">R$ {p.amount.toFixed(2)}</span>
                              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">{p.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR ALUNO MANTIDO */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-md p-4">
          <div className="bg-[#0a0a0a] w-full max-w-lg rounded-[3rem] border border-white/10 p-10 md:p-14 shadow-2xl space-y-10">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter text-center">Novo Atleta</h3>
            <div className="space-y-6">
              <input placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black" />
              <input placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black" />
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor da Mensalidade (R$)</label>
                <input type="number" value={formData.planValue} onChange={e => setFormData({...formData, planValue: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black" />
              </div>
              <button onClick={handleAddStudent} className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs">Criar Membro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
