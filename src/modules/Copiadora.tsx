import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Impressao } from "../data/mockData";
import { Printer, Plus, Search, X, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Copiadora() {
  const { impressoes, addImpressao, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [filterSetor, setFilterSetor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"lista" | "relatorio">("lista");

  const [form, setForm] = useState<Partial<Impressao>>({
    data: format(new Date(), "yyyy-MM-dd"),
    usuario: currentUser?.name || "",
    pbQtd: 0,
    coloridaQtd: 0,
  });

  const setores = Array.from(new Set(impressoes.map(i => i.setor)));

  const filtered = impressoes.filter(i => {
    const matchSearch = i.descricao.toLowerCase().includes(search.toLowerCase()) ||
      i.usuario.toLowerCase().includes(search.toLowerCase());
    const matchSetor = filterSetor ? i.setor === filterSetor : true;
    return matchSearch && matchSetor;
  });

  const totalPB = impressoes.reduce((acc, i) => acc + i.pbQtd, 0);
  const totalColor = impressoes.reduce((acc, i) => acc + i.coloridaQtd, 0);
  const totalGeral = totalPB + totalColor;

  const handleSave = () => {
    if (!form.setor || !form.descricao) return alert("Preencha os campos obrigatórios.");
    const id = "I" + String(impressoes.length + 1).padStart(3, "0");
    addImpressao({ ...form, id } as Impressao);
    setShowModal(false);
    setForm({ data: format(new Date(), "yyyy-MM-dd"), usuario: currentUser?.name || "", pbQtd: 0, coloridaQtd: 0 });
  };

  // Chart: last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const label = format(subDays(new Date(), 6 - i), "EEE", { locale: ptBR });
    const items = impressoes.filter(im => im.data === d);
    return {
      day: label.charAt(0).toUpperCase() + label.slice(1, 3),
      PB: items.reduce((acc, im) => acc + im.pbQtd, 0),
      Colorida: items.reduce((acc, im) => acc + im.coloridaQtd, 0),
    };
  });

  // By setor
  const setorData = setores.map(s => ({
    setor: s.split(" ").slice(0, 2).join(" "),
    PB: impressoes.filter(i => i.setor === s).reduce((acc, i) => acc + i.pbQtd, 0),
    Colorida: impressoes.filter(i => i.setor === s).reduce((acc, i) => acc + i.coloridaQtd, 0),
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-500" /> Copiadora / Impressões
          </h2>
          <p className="text-gray-500 text-sm">Controle e monitoramento de impressões</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-200">
          <Plus className="w-4 h-4" /> Registrar Impressão
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Geral", value: totalGeral.toLocaleString("pt-BR"), color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Preto e Branco", value: totalPB.toLocaleString("pt-BR"), color: "text-gray-700", bg: "bg-gray-100" },
          { label: "Coloridas", value: totalColor.toLocaleString("pt-BR"), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Registros", value: impressoes.length, color: "text-green-600", bg: "bg-green-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Usage bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Distribuição: PB vs Colorida</span>
          <span className="text-gray-500">{Math.round((totalPB / totalGeral) * 100)}% PB · {Math.round((totalColor / totalGeral) * 100)}% Colorida</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-gray-600 transition-all" style={{ width: `${(totalPB / totalGeral) * 100}%` }} />
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${(totalColor / totalGeral) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-600" /><span className="text-xs text-gray-600">Preto e Branco ({totalPB.toLocaleString("pt-BR")})</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-gray-600">Colorida ({totalColor.toLocaleString("pt-BR")})</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["lista", "relatorio"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "lista" ? "Registros" : "Relatório por Setor"}
          </button>
        ))}
      </div>

      {activeTab === "lista" && (
        <>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar descrição ou usuário..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50" />
            </div>
            <select value={filterSetor} onChange={e => setFilterSetor(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50">
              <option value="">Todos os setores</option>
              {setores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["ID", "Data", "Setor", "Usuário", "P&B", "Colorida", "Total", "Descrição"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(i => (
                    <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{format(new Date(i.data + "T12:00:00"), "dd/MM/yyyy")}</td>
                      <td className="px-4 py-3">
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">{i.setor}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{i.usuario}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{i.pbQtd}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{i.coloridaQtd}</td>
                      <td className="px-4 py-3 font-bold text-amber-600">{i.pbQtd + i.coloridaQtd}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px]"><p className="truncate">{i.descricao}</p></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400">Nenhum registro encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "relatorio" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Volume por Dia (Últimos 7 Dias)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={last7}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="PB" stroke="#374151" strokeWidth={2} dot={false} name="P&B" />
                <Line type="monotone" dataKey="Colorida" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" /> Impressões por Setor
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={setorData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="setor" type="category" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="PB" name="P&B" fill="#374151" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Colorida" name="Colorida" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Printer className="w-5 h-5 text-amber-500" /> Registrar Impressão</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input type="date" value={form.data || ""} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input type="text" value={form.usuario || ""} onChange={e => setForm(p => ({ ...p, usuario: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Setor *</label>
                <select value={form.setor || ""} onChange={e => setForm(p => ({ ...p, setor: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Selecione o setor</option>
                  {["Coordenação Pedagógica", "Secretaria", "Direção", "Professores", "Enfermaria", "Administrativo"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Preto e Branco</label>
                <input type="number" min={0} value={form.pbQtd ?? 0} onChange={e => setForm(p => ({ ...p, pbQtd: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Colorida</label>
                <input type="number" min={0} value={form.coloridaQtd ?? 0} onChange={e => setForm(p => ({ ...p, coloridaQtd: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Finalidade *</label>
                <input type="text" value={form.descricao || ""} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Ex: Material didático, provas..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              {(form.pbQtd || 0) + (form.coloridaQtd || 0) > 0 && (
                <div className="col-span-2 bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-amber-700">Total: <strong>{(form.pbQtd || 0) + (form.coloridaQtd || 0)}</strong> impressões
                    ({form.pbQtd || 0} PB + {form.coloridaQtd || 0} coloridas)</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-200">Salvar Registro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
