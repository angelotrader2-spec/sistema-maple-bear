import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Evento } from "../data/mockData";
import { Star, Plus, Search, X, Calendar, MapPin, Users, CheckCircle, Clock, PlayCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusStyle: Record<string, string> = {
  Planejado: "bg-blue-100 text-blue-700",
  "Em andamento": "bg-amber-100 text-amber-700",
  Concluído: "bg-green-100 text-green-700",
  Cancelado: "bg-red-100 text-red-700",
};
const StatusIcon = ({ s }: { s: string }) =>
  s === "Concluído" ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
  s === "Em andamento" ? <PlayCircle className="w-3 h-3 inline mr-1" /> :
  s === "Cancelado" ? <XCircle className="w-3 h-3 inline mr-1" /> :
  <Clock className="w-3 h-3 inline mr-1" />;

const statusGradient: Record<string, string> = {
  Planejado: "from-blue-500 to-indigo-600",
  "Em andamento": "from-amber-500 to-orange-600",
  Concluído: "from-green-500 to-emerald-600",
  Cancelado: "from-gray-400 to-gray-500",
};

export function Eventos() {
  const { eventos, addEvento, updateEvento, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [recursoInput, setRecursoInput] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");

  const [form, setForm] = useState<Partial<Evento>>({
    data: today,
    horaInicio: "08:00",
    horaFim: "17:00",
    status: "Planejado",
    responsavel: currentUser?.name || "",
    setor: "",
    recursos: [],
    participantesEsperados: 50,
  });

  const filtered = eventos.filter(e => {
    const matchSearch = e.titulo.toLowerCase().includes(search.toLowerCase()) ||
      e.local.toLowerCase().includes(search.toLowerCase()) ||
      e.responsavel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? e.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const addRecurso = () => {
    if (recursoInput.trim()) {
      setForm(p => ({ ...p, recursos: [...(p.recursos || []), recursoInput.trim()] }));
      setRecursoInput("");
    }
  };

  const removeRecurso = (idx: number) => {
    setForm(p => ({ ...p, recursos: (p.recursos || []).filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    if (!form.titulo || !form.local || !form.setor) return alert("Preencha os campos obrigatórios.");
    const id = "E" + String(eventos.length + 1).padStart(3, "0");
    addEvento({ ...form, id } as Evento);
    setShowModal(false);
    setForm({ data: today, horaInicio: "08:00", horaFim: "17:00", status: "Planejado", responsavel: currentUser?.name || "", setor: "", recursos: [], participantesEsperados: 50 });
  };

  const stats = {
    planejados: eventos.filter(e => e.status === "Planejado").length,
    andamento: eventos.filter(e => e.status === "Em andamento").length,
    concluidos: eventos.filter(e => e.status === "Concluído").length,
    total: eventos.length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" /> Eventos Escolares
          </h2>
          <p className="text-gray-500 text-sm">Planejamento e acompanhamento de eventos</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-200">
          <Plus className="w-4 h-4" /> Novo Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Planejados", value: stats.planejados, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Em Andamento", value: stats.andamento, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Concluídos", value: stats.concluidos, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total de Eventos", value: stats.total, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar evento, local ou responsável..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50">
          <option value="">Todos os status</option>
          <option value="Planejado">Planejado</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Concluído">Concluído</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      {/* Event cards */}
      <div className="space-y-3">
        {filtered.map(evt => {
          const isExpanded = expandedId === evt.id;
          return (
            <div key={evt.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-start gap-4 p-5">
                <div className={`bg-gradient-to-br ${statusGradient[evt.status]} rounded-xl p-3 text-white text-center min-w-[56px] shrink-0`}>
                  <p className="text-lg font-bold">{format(new Date(evt.data + "T12:00:00"), "dd")}</p>
                  <p className="text-xs opacity-80">{format(new Date(evt.data + "T12:00:00"), "MMM", { locale: ptBR })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <h4 className="font-bold text-gray-800 text-base">{evt.titulo}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusStyle[evt.status]}`}>
                      <StatusIcon s={evt.status} />{evt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{evt.descricao}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />{evt.horaInicio} – {evt.horaFim}</div>
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /><span className="truncate">{evt.local}</span></div>
                    <div className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" />{evt.participantesEsperados} esperados</div>
                    <div className="text-gray-500">{evt.responsavel}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {evt.status === "Planejado" && (
                    <button onClick={() => updateEvento(evt.id, { status: "Em andamento" })}
                      className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-2 py-1 rounded-lg transition-all">
                      Iniciar
                    </button>
                  )}
                  {evt.status === "Em andamento" && (
                    <button onClick={() => updateEvento(evt.id, { status: "Concluído" })}
                      className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-lg transition-all">
                      Concluir
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Detalhes</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Setor:</span> <span className="font-medium text-gray-700">{evt.setor}</span></p>
                      <p><span className="text-gray-500">Público-alvo:</span> <span className="font-medium text-gray-700">{evt.publicoAlvo}</span></p>
                      <p><span className="text-gray-500">Data:</span> <span className="font-medium text-gray-700">{format(new Date(evt.data + "T12:00:00"), "dd/MM/yyyy")}</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recursos Necessários</p>
                    <div className="flex flex-wrap gap-1.5">
                      {evt.recursos.map((r, i) => (
                        <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">{r}</span>
                      ))}
                      {evt.recursos.length === 0 && <p className="text-xs text-gray-400">Nenhum recurso cadastrado.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400">Nenhum evento encontrado.</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Star className="w-5 h-5 text-purple-500" /> Cadastrar Evento</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento *</label>
                <input type="text" value={form.titulo || ""} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Nome do evento"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={form.descricao || ""} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  rows={2} placeholder="Descrição do evento..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input type="date" value={form.data || ""} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                  <input type="time" value={form.horaInicio || ""} onChange={e => setForm(p => ({ ...p, horaInicio: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                  <input type="time" value={form.horaFim || ""} onChange={e => setForm(p => ({ ...p, horaFim: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Local *</label>
                <input type="text" value={form.local || ""} onChange={e => setForm(p => ({ ...p, local: e.target.value }))}
                  placeholder="Local do evento"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <input type="text" value={form.responsavel || ""} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Setor *</label>
                <select value={form.setor || ""} onChange={e => setForm(p => ({ ...p, setor: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <option value="">Selecione</option>
                  {["Direção", "Coordenação Pedagógica", "Secretaria", "Professores", "Administrativo"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Público-alvo</label>
                <input type="text" value={form.publicoAlvo || ""} onChange={e => setForm(p => ({ ...p, publicoAlvo: e.target.value }))}
                  placeholder="Ex: Toda a escola, 9º Ano..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participantes Esperados</label>
                <input type="number" min={1} value={form.participantesEsperados || 50} onChange={e => setForm(p => ({ ...p, participantesEsperados: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recursos Necessários</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={recursoInput} onChange={e => setRecursoInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRecurso())}
                    placeholder="Digite um recurso e pressione Enter ou +"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  <button onClick={addRecurso} className="px-3 py-2.5 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(form.recursos || []).map((r, i) => (
                    <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      {r}
                      <button onClick={() => removeRecurso(i)} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-200">Cadastrar Evento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
