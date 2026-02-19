import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Reserva, ESPACOS } from "../data/mockData";
import { CalendarDays, Plus, Search, X, CheckCircle, Clock, XCircle, Users, MapPin } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusStyle: Record<string, string> = {
  Confirmada: "bg-green-100 text-green-700",
  Pendente: "bg-amber-100 text-amber-700",
  Cancelada: "bg-red-100 text-red-700",
};
const StatusIcon = ({ s }: { s: string }) =>
  s === "Confirmada" ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
  s === "Cancelada" ? <XCircle className="w-3 h-3 inline mr-1" /> :
  <Clock className="w-3 h-3 inline mr-1" />;

export function Reservas() {
  const { reservas, addReserva, updateReserva, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [filterEspaco, setFilterEspaco] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"lista" | "calendario">("lista");
  const [calWeek, setCalWeek] = useState(0);

  const today = format(new Date(), "yyyy-MM-dd");

  const [form, setForm] = useState<Partial<Reserva>>({
    data: today,
    horaInicio: "08:00",
    horaFim: "10:00",
    status: "Confirmada",
    responsavel: currentUser?.name || "",
    setor: "",
    participantes: 10,
  });

  const filtered = reservas.filter(r => {
    const matchSearch = r.finalidade.toLowerCase().includes(search.toLowerCase()) ||
      r.responsavel.toLowerCase().includes(search.toLowerCase());
    const matchEspaco = filterEspaco ? r.espaco === filterEspaco : true;
    const matchStatus = filterStatus ? r.status === filterStatus : true;
    return matchSearch && matchEspaco && matchStatus;
  });

  const checkConflict = (newR: Partial<Reserva>): boolean => {
    if (!newR.espaco || !newR.data || !newR.horaInicio || !newR.horaFim) return false;
    return reservas.some(r =>
      r.espaco === newR.espaco && r.data === newR.data && r.status !== "Cancelada" &&
      !(newR.horaFim! <= r.horaInicio || newR.horaInicio! >= r.horaFim)
    );
  };

  const handleSave = () => {
    if (!form.espaco || !form.finalidade || !form.setor) return alert("Preencha os campos obrigatórios.");
    if (checkConflict(form)) return alert("⚠️ Conflito de horário! Este espaço já está reservado neste período.");
    const id = "R" + String(reservas.length + 1).padStart(3, "0");
    addReserva({ ...form, id } as Reserva);
    setShowModal(false);
    setForm({ data: today, horaInicio: "08:00", horaFim: "10:00", status: "Confirmada", responsavel: currentUser?.name || "", setor: "", participantes: 10 });
  };

  // Calendar week view
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), calWeek * 7 + i - new Date().getDay());
    return { date: format(d, "yyyy-MM-dd"), label: format(d, "EEE dd/MM", { locale: ptBR }), isToday: format(d, "yyyy-MM-dd") === today };
  });

  const hours = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-500" /> Reservas de Espaços
          </h2>
          <p className="text-gray-500 text-sm">Agendamento de auditório, salas e outros ambientes</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-green-200">
          <Plus className="w-4 h-4" /> Nova Reserva
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Confirmadas", value: reservas.filter(r => r.status === "Confirmada").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pendentes", value: reservas.filter(r => r.status === "Pendente").length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Canceladas", value: reservas.filter(r => r.status === "Cancelada").length, color: "text-red-600", bg: "bg-red-50" },
          { label: "Espaços Disponíveis", value: ESPACOS.length, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Espaços */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {ESPACOS.map(espaco => {
          const reservaHoje = reservas.find(r => r.espaco === espaco && r.data === today && r.status === "Confirmada");
          return (
            <div key={espaco} className={`rounded-xl p-3 text-center border ${reservaHoje ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <MapPin className={`w-4 h-4 mx-auto mb-1 ${reservaHoje ? "text-red-500" : "text-green-500"}`} />
              <p className="text-xs font-medium text-gray-700 leading-tight">{espaco}</p>
              <p className={`text-xs mt-1 font-semibold ${reservaHoje ? "text-red-600" : "text-green-600"}`}>
                {reservaHoje ? "Ocupado" : "Livre"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["lista", "calendario"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "lista" ? "Lista de Reservas" : "Calendário Semanal"}
          </button>
        ))}
      </div>

      {activeTab === "lista" && (
        <>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar finalidade ou responsável..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
            </div>
            <select value={filterEspaco} onChange={e => setFilterEspaco(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
              <option value="">Todos os espaços</option>
              {ESPACOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
              <option value="">Todos os status</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="bg-green-50 rounded-xl p-3 text-center min-w-[56px]">
                    <p className="text-lg font-bold text-green-600">{format(new Date(r.data + "T12:00:00"), "dd")}</p>
                    <p className="text-xs text-green-500">{format(new Date(r.data + "T12:00:00"), "MMM", { locale: ptBR })}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h4 className="font-bold text-gray-800">{r.finalidade}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle[r.status]}`}>
                        <StatusIcon s={r.status} />{r.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Espaço</p>
                        <p className="font-medium text-gray-700">{r.espaco}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Horário</p>
                        <p className="font-medium text-gray-700">{r.horaInicio} – {r.horaFim}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Responsável</p>
                        <p className="font-medium text-gray-700">{r.responsavel}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">{r.participantes} participantes</span>
                      </div>
                    </div>
                  </div>
                  {r.status !== "Cancelada" && (
                    <button onClick={() => updateReserva(r.id, { status: "Cancelada" })}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all shrink-0">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-10 text-gray-400">Nenhuma reserva encontrada.</div>}
          </div>
        </>
      )}

      {activeTab === "calendario" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button onClick={() => setCalWeek(w => w - 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">← Anterior</button>
            <span className="font-semibold text-gray-700 text-sm">
              {weekDays[0].label.split(" ")[1]} – {weekDays[6].label.split(" ")[1]}
            </span>
            <button onClick={() => setCalWeek(w => w + 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Próxima →</button>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-8 border-b border-gray-100 bg-gray-50">
                <div className="p-2 text-xs text-gray-400 font-medium">Horário</div>
                {weekDays.map(d => (
                  <div key={d.date} className={`p-2 text-center text-xs font-semibold capitalize ${d.isToday ? "text-green-600 bg-green-50" : "text-gray-600"}`}>
                    {d.label}
                  </div>
                ))}
              </div>
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-[40px]">
                  <div className="p-2 text-xs text-gray-400 border-r border-gray-100">{hour}</div>
                  {weekDays.map(d => {
                    const slot = reservas.filter(r =>
                      r.data === d.date && r.horaInicio <= hour && r.horaFim > hour && r.status !== "Cancelada"
                    );
                    return (
                      <div key={d.date} className={`p-1 border-r border-gray-50 ${d.isToday ? "bg-green-50/30" : ""}`}>
                        {slot.map(s => (
                          <div key={s.id} className={`text-xs p-1 rounded text-white truncate mb-0.5 ${s.status === "Confirmada" ? "bg-green-500" : "bg-amber-400"}`}>
                            {s.espaco.split(" ")[0]}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-green-500" /> Nova Reserva</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Espaço *</label>
                <select value={form.espaco || ""} onChange={e => setForm(p => ({ ...p, espaco: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  <option value="">Selecione o espaço</option>
                  {ESPACOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input type="date" value={form.data || ""} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início *</label>
                  <input type="time" value={form.horaInicio || ""} onChange={e => setForm(p => ({ ...p, horaInicio: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fim *</label>
                  <input type="time" value={form.horaFim || ""} onChange={e => setForm(p => ({ ...p, horaFim: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade *</label>
                <input type="text" value={form.finalidade || ""} onChange={e => setForm(p => ({ ...p, finalidade: e.target.value }))}
                  placeholder="Ex: Reunião pedagógica, palestra..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <input type="text" value={form.responsavel || ""} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Setor *</label>
                <select value={form.setor || ""} onChange={e => setForm(p => ({ ...p, setor: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  <option value="">Selecione</option>
                  {["Direção", "Coordenação", "Secretaria", "Professores", "Administrativo"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº de Participantes</label>
                <input type="number" min={1} value={form.participantes || 10} onChange={e => setForm(p => ({ ...p, participantes: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status || "Confirmada"} onChange={e => setForm(p => ({ ...p, status: e.target.value as Reserva["status"] }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  <option value="Confirmada">Confirmada</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-green-200">Confirmar Reserva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
