import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard, HeartPulse, Printer, CalendarDays, Star,
  GraduationCap, LogOut, Menu, ChevronRight, Bell
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "enfermaria", label: "Enfermaria", icon: HeartPulse, color: "text-rose-600", bg: "bg-rose-50" },
  { id: "copiadora", label: "Copiadora", icon: Printer, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "reservas", label: "Reservas de Espaços", icon: CalendarDays, color: "text-green-600", bg: "bg-green-50" },
  { id: "eventos", label: "Eventos Escolares", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
];

const roleLabel: Record<string, string> = {
  admin: "Administração",
  coordenacao: "Coordenação",
  enfermaria: "Enfermaria",
  secretaria: "Secretaria",
  professor: "Professor",
};

const roleColor: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  coordenacao: "bg-blue-100 text-blue-700",
  enfermaria: "bg-rose-100 text-rose-700",
  secretaria: "bg-amber-100 text-amber-700",
  professor: "bg-green-100 text-green-700",
};

interface LayoutProps { children: React.ReactNode; }

export function Layout({ children }: LayoutProps) {
  const { currentUser, logout, activeModule, setActiveModule } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static z-30 h-full w-64 bg-white border-r border-gray-100 flex flex-col shadow-xl lg:shadow-sm transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-sm">EduGestão</h1>
              <p className="text-gray-400 text-xs">Gestão Escolar Integrada</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Módulos</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button key={item.id}
                onClick={() => { setActiveModule(item.id as Parameters<typeof setActiveModule>[0]); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${active ? `${item.bg} ${item.color} font-semibold` : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                <Icon className={`w-4.5 h-4.5 ${active ? item.color : "text-gray-400 group-hover:text-gray-600"}`} size={18} />
                <span className="text-sm flex-1">{item.label}</span>
                {active && <ChevronRight className={`w-3.5 h-3.5 ${item.color}`} />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[currentUser.role]}`}>
                {roleLabel[currentUser.role]}
              </span>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-all text-sm">
            <LogOut className="w-4 h-4" />
            Sair do sistema
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="font-bold text-gray-800 text-sm">
                {navItems.find(n => n.id === activeModule)?.label || "Dashboard"}
              </h2>
              <p className="text-gray-400 text-xs hidden sm:block">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {currentUser.avatar}
              </div>
              <span className="text-sm font-medium text-gray-700">{currentUser.name.split(" ")[0]}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
