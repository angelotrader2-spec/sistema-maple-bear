import { useState } from "react";
import { useApp } from "../context/AppContext";
import { USERS } from "../data/mockData";
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";

export function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) setError("E-mail ou senha inválidos.");
    else setError("");
  };

  const quickLogin = (idx: number) => {
    const u = USERS[idx];
    setEmail(u.email);
    setPassword(u.password);
  };

  const roleLabel: Record<string, string> = {
    admin: "Administração",
    coordenacao: "Coordenação",
    enfermaria: "Enfermaria",
    secretaria: "Secretaria",
    professor: "Professor",
  };

  const roleColor: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    coordenacao: "bg-blue-100 text-blue-700 border-blue-200",
    enfermaria: "bg-rose-100 text-rose-700 border-rose-200",
    secretaria: "bg-amber-100 text-amber-700 border-amber-200",
    professor: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden">
        {/* Left panel */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl">
                <GraduationCap className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl leading-tight">EduGestão</h1>
                <p className="text-blue-200 text-xs">Sistema Integrado Escolar</p>
              </div>
            </div>
            <h2 className="text-white text-3xl font-bold mb-3">Bem-vindo de volta!</h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Plataforma centralizada para gestão de enfermaria, copiadora, reservas de espaços e eventos escolares.
            </p>
          </div>
          <div className="mt-8">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">Acesso rápido (demo)</p>
            <div className="grid grid-cols-1 gap-2">
              {USERS.map((u, i) => (
                <button key={u.id} onClick={() => quickLogin(i)}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl px-3 py-2 text-left group">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{u.name}</p>
                    <p className="text-blue-300 text-xs">{roleLabel[u.role]}</p>
                  </div>
                  <span className="text-blue-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">Entrar na plataforma</h3>
          <p className="text-gray-500 text-sm mb-8">Digite suas credenciais de acesso</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="usuario@escola.edu.br"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 text-sm">
              Acessar o sistema
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Perfis disponíveis no sistema</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(roleLabel).map(([role, label]) => (
                <span key={role} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${roleColor[role]}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
