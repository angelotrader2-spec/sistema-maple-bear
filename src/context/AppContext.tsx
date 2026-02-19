import { createContext, useContext, useState, ReactNode } from "react";
import {
  User, USERS, Atendimento, ATENDIMENTOS, Impressao, IMPRESSOES,
  Reserva, RESERVAS, Evento, EVENTOS
} from "../data/mockData";

type ActiveModule = "dashboard" | "enfermaria" | "copiadora" | "reservas" | "eventos";

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  activeModule: ActiveModule;
  setActiveModule: (m: ActiveModule) => void;
  atendimentos: Atendimento[];
  addAtendimento: (a: Atendimento) => void;
  impressoes: Impressao[];
  addImpressao: (i: Impressao) => void;
  reservas: Reserva[];
  addReserva: (r: Reserva) => void;
  updateReserva: (id: string, r: Partial<Reserva>) => void;
  eventos: Evento[];
  addEvento: (e: Evento) => void;
  updateEvento: (id: string, e: Partial<Evento>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard");
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>(ATENDIMENTOS);
  const [impressoes, setImpressoes] = useState<Impressao[]>(IMPRESSOES);
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS);
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS);

  const login = (email: string, password: string): boolean => {
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) { setCurrentUser(user); return true; }
    return false;
  };

  const logout = () => { setCurrentUser(null); setActiveModule("dashboard"); };

  const addAtendimento = (a: Atendimento) => setAtendimentos(prev => [a, ...prev]);
  const addImpressao = (i: Impressao) => setImpressoes(prev => [i, ...prev]);
  const addReserva = (r: Reserva) => setReservas(prev => [r, ...prev]);
  const updateReserva = (id: string, r: Partial<Reserva>) =>
    setReservas(prev => prev.map(x => x.id === id ? { ...x, ...r } : x));
  const addEvento = (e: Evento) => setEventos(prev => [e, ...prev]);
  const updateEvento = (id: string, e: Partial<Evento>) =>
    setEventos(prev => prev.map(x => x.id === id ? { ...x, ...e } : x));

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      activeModule, setActiveModule,
      atendimentos, addAtendimento,
      impressoes, addImpressao,
      reservas, addReserva, updateReserva,
      eventos, addEvento, updateEvento,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
