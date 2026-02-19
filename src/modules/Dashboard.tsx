import { useApp } from "../context/AppContext";
import { HeartPulse, Printer, CalendarDays, Star, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

export function Dashboard() {
  const { atendimentos, impressoes, reservas, eventos, setActiveModule } = useApp();

  const today = format(new Date(), "yyyy-MM-dd");

  const statsCards = [
    {
      label: "Atendimentos Hoje",
      value: atendimentos.filter(a => a.data === today).length,
      total: atendimentos.length,
      icon: HeartPulse,
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50",
      textColor: "text-rose-600",
      sub: `${atendimentos.length} total registrado`,
      module: "enfermaria",
    },
    {
      label: "Impressões Hoje",
      value: impressoes.filter(i => i.data === today).reduce((acc, i) => acc + i.pbQtd + i.coloridaQtd, 0),
      total: impressoes.reduce((acc, i) => acc + i.pbQtd + i.coloridaQtd, 0),
      icon: Printer,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      textColor: "text-amber-600",
      sub: `${impressoes.reduce((acc, i) => acc + i.pbQtd + i.coloridaQtd, 0)} total geral`,
      module: "copiadora",
    },
    {
      label: "Reservas Ativas",
      value: reservas.filter(r => r.status === "Confirmada").length,
      total: reservas.length,
      icon: CalendarDays,
      color: "from-green-500 to-emerald-600",
      bg: "bg-green-50",
      textColor: "text-green-600",
      sub: `${reservas.filter(r => r.status === "Pendente").length} pendente(s)`,
      module: "reservas",
    },
    {
      label: "Eventos Planejados",
      value: eventos.filter(e => e.status === "Planejado").length,
      total: eventos.length,
      icon: Star,
      color: "from-purple-500 to-violet-600",
      bg: "bg-purple-50",
      textColor: "text-purple-600",
      sub: `${eventos.filter(e => e.status === "Concluído").length} concluído(s)`,
      module: "eventos",
    },
  ];

  // Chart data: atendimentos last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const label = format(subDays(new Date(), 6 - i), "EEE", { locale: ptBR });
    return {
      day: label.charAt(0).toUpperCase() + label.slice(1),
      atendimentos: atendimentos.filter(a => a.data === d).length,
      impressoes: impressoes.filter(im => im.data === d).reduce((acc, im) => acc + im.pbQtd + im.coloridaQtd, 0),
    };
  });

  // Pie chart: impressoes by setor
  const setorMap: Record<string, number> = {};
  impressoes.forEach(i => {
    setorMap[i.setor] = (setorMap[i.setor] || 0) + i.pbQtd + i.coloridaQtd;
  });
  const pieData = Object.entries(setorMap).map(([name, value]) => ({ name, value }));

  // Upcoming events
  const upcomingEvents = eventos
    .filter(e => e.data >= today && e.status !== "Cancelado")
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 4);

  // Recent atendimentos
  const recentAtend = atendimentos.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Painel de Controle</h2>
            <p className="text-blue-200 text-sm">Visão geral do sistema integrado de gestão escolar</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
            <TrendingUp className="w-5 h-5 text-blue-200" />
            <span className="text-sm font-medium">Ano letivo 2025</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map(card => {
          const Icon = card.icon;
          return (
            <button key={card.label}
              onClick={() => setActiveModule(card.module as Parameters<typeof setActiveModule>[0])}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bg} p-2.5 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">Ver módulo →</span>
              </div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-1`}>
                {card.value}
              </div>
              <p className="text-sm font-semibold text-gray-700">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Atividade dos Últimos 7 Dias</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7} barCategoryGap="30%">
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="atendimentos" name="Atendimentos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="impressoes" name="Impressões" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Impressões por Setor</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming events */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Próximos Eventos</h3>
            <button onClick={() => setActiveModule("eventos")} className="text-xs text-blue-600 hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 && <p className="text-gray-400 text-sm">Nenhum evento próximo.</p>}
            {upcomingEvents.map(evt => (
              <div key={evt.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-purple-100 text-purple-600 rounded-lg p-2 shrink-0 text-center min-w-[44px]">
                  <p className="text-xs font-bold">{format(new Date(evt.data + "T12:00:00"), "dd")}</p>
                  <p className="text-xs">{format(new Date(evt.data + "T12:00:00"), "MMM", { locale: ptBR })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{evt.titulo}</p>
                  <p className="text-xs text-gray-500">{evt.local} · {evt.horaInicio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent atendimentos */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Atendimentos Recentes</h3>
            <button onClick={() => setActiveModule("enfermaria")} className="text-xs text-blue-600 hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {recentAtend.map(atd => (
              <div key={atd.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{atd.paciente}</p>
                  <p className="text-xs text-gray-500 truncate">{atd.motivo} · {atd.horario}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                  atd.status === "Finalizado" ? "bg-green-100 text-green-700" :
                  atd.status === "Encaminhado" ? "bg-amber-100 text-amber-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {atd.status === "Finalizado" ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
                   atd.status === "Encaminhado" ? <AlertCircle className="w-3 h-3 inline mr-1" /> :
                   <Clock className="w-3 h-3 inline mr-1" />}
                  {atd.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
