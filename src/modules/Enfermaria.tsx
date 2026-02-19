import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Atendimento } from "../data/mockData";
import { Plus, Search, HeartPulse, Filter, CheckCircle, AlertCircle, Clock, X, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColor: Record<string, string> = {
  "Finalizado": "bg-green-100 text-green-700",
  "Encaminhado": "bg-amber-100 text-amber-700",
  "Em atendimento": "bg-blue-100 text-blue-700",
};
const StatusIcon = ({ s }: { s: string }) =>
  s === "Finalizado" ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
  s === "Encaminhado" ? <AlertCircle className="w-3 h-3 inline mr-1" /> :
  <Clock className="w-3 h-3 inline mr-1" />;

export function Enfermaria() {
  const { atendimentos, addAtendimento, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<"" | "aluno" | "colaborador">("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"lista" | "relatorio">("lista");

  const [form, setForm] = useState<Partial<Atendimento>>({
    data: format(new Date(), "yyyy-MM-dd"),
    horario: format(new Date(), "HH:mm"),
    tipo: "aluno",
    status: "Em atendimento",
    responsavel: currentUser?.name || "",
  });

  const filtered = atendimentos.filter(a => {
    const matchSearch = a.paciente.toLowerCase().includes(search.toLowerCase()) ||
      a.motivo.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo ? a.tipo === filterTipo : true;
    const matchStatus = filterStatus ? a.status === filterStatus : true;
    return matchSearch && matchTipo && matchStatus;
  });

  const handleSave = () => {
    if (!form.paciente || !form.motivo || !form.procedimentos) return alert("Preencha os campos obrigatórios.");
    const id = "A" + String(atendimentos.length + 1).padStart(3, "0");
    addAtendimento({ ...form, id } as Atendimento);
    setShowModal(false);
    setForm({ data: format(new Date(), "yyyy-MM-dd"), horario: format(new Date(), "HH:mm"), tipo: "aluno", status: "Em atendimento", responsavel: currentUser?.name || "" });
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const stats = {
    hoje: atendimentos.filter(a => a.data === today).length,
    semana: atendimentos.filter(a => {
      const d = new Date(a.data + "T12:00:00");
      return d >= subDays(new Date(), 7);
    }).length,
    encaminhados: atendimentos.filter(a => a.status === "Encaminhado").length,
    alunos: atendimentos.filter(a => a.tipo === "aluno").length,
  };

  const last7Chart = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const label = format(subDays(new Date(), 6 - i), "EEE", { locale: ptBR });
    return {
      day: label.charAt(0).toUpperCase() + label.slice(1, 3),
      total: atendimentos.filter(a => a.data === d).length,
      alunos: atendimentos.filter(a => a.data === d && a.tipo === "aluno").length,
      colaboradores: atendimentos.filter(a => a.data === d && a.tipo === "colaborador").length,
    };
  });

  const motivoMap: Record<string, number> = {};
  atendimentos.forEach(a => { motivoMap[a.motivo] = (motivoMap[a.motivo] || 0) + 1; });
  const topMotivos = Object.entries(motivoMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" /> Enfermaria
          </h2>
          <p className="text-gray-500 text-sm">Controle de atendimentos e saúde escolar</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-200">
          <Plus className="w-4 h-4" /> Novo Atendimento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Hoje", value: stats.hoje, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Últimos 7 dias", value: stats.semana, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Encaminhados", value: stats.encaminhados, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Atendimentos Alunos", value: stats.alunos, color: "text-green-600", bg: "bg-green-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["lista", "relatorio"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "lista" ? "Lista de Atendimentos" : "Relatório"}
          </button>
        ))}
      </div>

      {activeTab === "lista" && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente ou motivo..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value as "" | "aluno" | "colaborador")}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50">
                <option value="">Todos os tipos</option>
                <option value="aluno">Aluno</option>
                <option value="colaborador">Colaborador</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50">
                <option value="">Todos os status</option>
                <option value="Em atendimento">Em atendimento</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Encaminhado">Encaminhado</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["ID", "Data/Hora", "Paciente", "Tipo", "Motivo", "Procedimentos", "Responsável", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{a.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-gray-800">{format(new Date(a.data + "T12:00:00"), "dd/MM/yyyy")}</p>
                        <p className="text-xs text-gray-400">{a.horario}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{a.paciente}</p>
                        {a.turma && <p className="text-xs text-gray-400">{a.turma}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.tipo === "aluno" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                          {a.tipo === "aluno" ? "Aluno" : "Colaborador"}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[150px]">
                        <p className="truncate text-gray-700">{a.motivo}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="truncate text-gray-600 text-xs">{a.procedimentos}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{a.responsavel}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusColor[a.status]}`}>
                          <StatusIcon s={a.status} />{a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400">Nenhum atendimento encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "relatorio" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Atendimentos Últimos 7 Dias</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last7Chart}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="alunos" name="Alunos" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="colaboradores" name="Colaboradores" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" /> Principais Motivos de Atendimento
            </h3>
            <div className="space-y-3">
              {topMotivos.map(([motivo, count]) => (
                <div key={motivo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate mr-2">{motivo}</span>
                    <span className="text-gray-500 font-medium shrink-0">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                      style={{ width: `${(count / atendimentos.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 lg:col-span-2">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Resumo Estatístico</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Geral", value: atendimentos.length },
                { label: "Alunos Atendidos", value: atendimentos.filter(a => a.tipo === "aluno").length },
                { label: "Colaboradores", value: atendimentos.filter(a => a.tipo === "colaborador").length },
                { label: "Taxa Encaminhamento", value: `${Math.round((atendimentos.filter(a => a.status === "Encaminhado").length / atendimentos.length) * 100)}%` },
              ].map(s => (
                <div key={s.label} className="bg-rose-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-rose-600">{s.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{s.label}</p>
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
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><HeartPulse className="w-5 h-5 text-rose-500" /> Novo Atendimento</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Data *", key: "data", type: "date" },
                { label: "Horário *", key: "horario", type: "time" },
                { label: "Nome do Paciente *", key: "paciente", type: "text", placeholder: "Nome completo", span: true },
                { label: "Turma (se aluno)", key: "turma", type: "text", placeholder: "Ex: 7º Ano B" },
              ].map(f => (
                <div key={f.key} className={f.span ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder || ""} value={(form[f.key as keyof typeof form] as string) || ""}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as "aluno" | "colaborador" }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                  <option value="aluno">Aluno</option>
                  <option value="colaborador">Colaborador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Atendimento["status"] }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                  <option value="Em atendimento">Em atendimento</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Encaminhado">Encaminhado</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do Atendimento *</label>
                <input type="text" value={form.motivo || ""} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ex: Dor de cabeça, febre, queda..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Procedimentos Realizados *</label>
                <textarea value={form.procedimentos || ""} onChange={e => setForm(p => ({ ...p, procedimentos: e.target.value }))}
                  placeholder="Descreva os procedimentos realizados..."
                  rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável pelo Atendimento</label>
                <input type="text" value={form.responsavel || ""} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-200">Salvar Atendimento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
