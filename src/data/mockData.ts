import { addDays, subDays, format } from "date-fns";

export type UserRole = "admin" | "coordenacao" | "enfermaria" | "secretaria" | "professor";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  password: string;
}

export interface Atendimento {
  id: string;
  data: string;
  horario: string;
  paciente: string;
  tipo: "aluno" | "colaborador";
  turma?: string;
  motivo: string;
  procedimentos: string;
  responsavel: string;
  status: "Em atendimento" | "Finalizado" | "Encaminhado";
}

export interface Impressao {
  id: string;
  data: string;
  setor: string;
  usuario: string;
  pbQtd: number;
  coloridaQtd: number;
  descricao: string;
}

export interface Reserva {
  id: string;
  espaco: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  responsavel: string;
  setor: string;
  finalidade: string;
  status: "Confirmada" | "Pendente" | "Cancelada";
  participantes: number;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  responsavel: string;
  setor: string;
  status: "Planejado" | "Em andamento" | "Concluído" | "Cancelado";
  recursos: string[];
  publicoAlvo: string;
  participantesEsperados: number;
}

const today = new Date();
const fmt = (d: Date) => format(d, "yyyy-MM-dd");

export const USERS: User[] = [
  { id: "1", name: "Ana Souza", role: "admin", avatar: "AS", email: "admin@escola.edu.br", password: "admin123" },
  { id: "2", name: "Carlos Lima", role: "coordenacao", avatar: "CL", email: "coord@escola.edu.br", password: "coord123" },
  { id: "3", name: "Maria Oliveira", role: "enfermaria", avatar: "MO", email: "enf@escola.edu.br", password: "enf123" },
  { id: "4", name: "João Pedro", role: "secretaria", avatar: "JP", email: "sec@escola.edu.br", password: "sec123" },
  { id: "5", name: "Paula Ferreira", role: "professor", avatar: "PF", email: "prof@escola.edu.br", password: "prof123" },
];

export const ATENDIMENTOS: Atendimento[] = [
  { id: "A001", data: fmt(today), horario: "08:15", paciente: "Lucas Mendes", tipo: "aluno", turma: "7º Ano B", motivo: "Dor de cabeça", procedimentos: "Verificação de PA, repouso, aviso aos pais", responsavel: "Maria Oliveira", status: "Finalizado" },
  { id: "A002", data: fmt(today), horario: "09:40", paciente: "Sofia Costa", tipo: "aluno", turma: "9º Ano A", motivo: "Náusea e tontura", procedimentos: "Aferição de PA, hidratação, encaminhamento médico", responsavel: "Maria Oliveira", status: "Encaminhado" },
  { id: "A003", data: fmt(subDays(today, 1)), horario: "10:20", paciente: "Prof. Roberto Alves", tipo: "colaborador", motivo: "Dor lombar", procedimentos: "Aplicação de analgésico, orientações posturais", responsavel: "Maria Oliveira", status: "Finalizado" },
  { id: "A004", data: fmt(subDays(today, 1)), horario: "14:00", paciente: "Pedro Henrique", tipo: "aluno", turma: "5º Ano C", motivo: "Queda no pátio / escoriação", procedimentos: "Limpeza e curativo na mão direita", responsavel: "Maria Oliveira", status: "Finalizado" },
  { id: "A005", data: fmt(subDays(today, 2)), horario: "07:55", paciente: "Isabela Ramos", tipo: "aluno", turma: "8º Ano A", motivo: "Crise de ansiedade", procedimentos: "Acolhimento, técnicas de respiração, contato com responsável", responsavel: "Maria Oliveira", status: "Encaminhado" },
  { id: "A006", data: fmt(subDays(today, 3)), horario: "11:30", paciente: "Thiago Martins", tipo: "aluno", turma: "6º Ano B", motivo: "Febre (38,2°C)", procedimentos: "Antitérmico, repouso, pais contatados", responsavel: "Maria Oliveira", status: "Finalizado" },
  { id: "A007", data: fmt(subDays(today, 4)), horario: "15:10", paciente: "Carla Diretora", tipo: "colaborador", motivo: "Cefaleia intensa", procedimentos: "Repouso e analgésico", responsavel: "Maria Oliveira", status: "Finalizado" },
  { id: "A008", data: fmt(subDays(today, 5)), horario: "08:50", paciente: "Gabriel Santos", tipo: "aluno", turma: "3º Ano EF", motivo: "Dor de garganta", procedimentos: "Verificação, gargarejo, aviso aos pais", responsavel: "Maria Oliveira", status: "Finalizado" },
];

export const IMPRESSOES: Impressao[] = [
  { id: "I001", data: fmt(today), setor: "Coordenação Pedagógica", usuario: "Carlos Lima", pbQtd: 120, coloridaQtd: 30, descricao: "Provas bimestrais" },
  { id: "I002", data: fmt(today), setor: "Secretaria", usuario: "João Pedro", pbQtd: 85, coloridaQtd: 10, descricao: "Documentação geral" },
  { id: "I003", data: fmt(subDays(today, 1)), setor: "Direção", usuario: "Ana Souza", pbQtd: 40, coloridaQtd: 25, descricao: "Relatórios de desempenho" },
  { id: "I004", data: fmt(subDays(today, 1)), setor: "Coordenação Pedagógica", usuario: "Carlos Lima", pbQtd: 200, coloridaQtd: 0, descricao: "Material didático - Literatura" },
  { id: "I005", data: fmt(subDays(today, 2)), setor: "Secretaria", usuario: "João Pedro", pbQtd: 60, coloridaQtd: 5, descricao: "Circulares para responsáveis" },
  { id: "I006", data: fmt(subDays(today, 3)), setor: "Professores", usuario: "Paula Ferreira", pbQtd: 150, coloridaQtd: 40, descricao: "Atividades de Artes" },
  { id: "I007", data: fmt(subDays(today, 4)), setor: "Coordenação Pedagógica", usuario: "Carlos Lima", pbQtd: 95, coloridaQtd: 15, descricao: "Fichas de acompanhamento" },
  { id: "I008", data: fmt(subDays(today, 5)), setor: "Secretaria", usuario: "João Pedro", pbQtd: 300, coloridaQtd: 0, descricao: "Boletins escolares" },
];

export const ESPACOS = ["Auditório Principal", "Sala de Reunião A", "Sala de Reunião B", "Laboratório de Informática", "Quadra Poliesportiva", "Biblioteca", "Sala de Artes"];

export const RESERVAS: Reserva[] = [
  { id: "R001", espaco: "Auditório Principal", data: fmt(addDays(today, 2)), horaInicio: "08:00", horaFim: "12:00", responsavel: "Carlos Lima", setor: "Coordenação", finalidade: "Palestra sobre Educação Financeira", status: "Confirmada", participantes: 150 },
  { id: "R002", espaco: "Sala de Reunião A", data: fmt(today), horaInicio: "14:00", horaFim: "16:00", responsavel: "Ana Souza", setor: "Direção", finalidade: "Reunião com Conselho Escolar", status: "Confirmada", participantes: 12 },
  { id: "R003", espaco: "Laboratório de Informática", data: fmt(addDays(today, 1)), horaInicio: "07:30", horaFim: "09:30", responsavel: "Paula Ferreira", setor: "Professores", finalidade: "Aula de Tecnologia - 9º Ano", status: "Confirmada", participantes: 35 },
  { id: "R004", espaco: "Quadra Poliesportiva", data: fmt(addDays(today, 3)), horaInicio: "09:00", horaFim: "11:00", responsavel: "Prof. Marcos", setor: "Professores", finalidade: "Torneio interno de Futsal", status: "Pendente", participantes: 60 },
  { id: "R005", espaco: "Biblioteca", data: fmt(subDays(today, 1)), horaInicio: "10:00", horaFim: "11:00", responsavel: "Carlos Lima", setor: "Coordenação", finalidade: "Encontro do Clube de Leitura", status: "Confirmada", participantes: 20 },
  { id: "R006", espaco: "Sala de Reunião B", data: fmt(addDays(today, 5)), horaInicio: "13:00", horaFim: "14:30", responsavel: "João Pedro", setor: "Secretaria", finalidade: "Treinamento sistema acadêmico", status: "Pendente", participantes: 8 },
  { id: "R007", espaco: "Auditório Principal", data: fmt(addDays(today, 7)), horaInicio: "19:00", horaFim: "22:00", responsavel: "Ana Souza", setor: "Direção", finalidade: "Reunião de Pais e Mestres", status: "Confirmada", participantes: 200 },
];

export const EVENTOS: Evento[] = [
  { id: "E001", titulo: "Gincana Cultural", descricao: "Gincana anual envolvendo todas as turmas do Ensino Fundamental", data: fmt(addDays(today, 10)), horaInicio: "07:30", horaFim: "17:00", local: "Quadra Poliesportiva e Pátio", responsavel: "Carlos Lima", setor: "Coordenação Pedagógica", status: "Planejado", recursos: ["Troféus", "Lona", "Microfone", "Caixas de som", "Materiais de arte"], publicoAlvo: "Ensino Fundamental I e II", participantesEsperados: 400 },
  { id: "E002", titulo: "Feira de Ciências", descricao: "Exposição de projetos científicos dos alunos do 6º ao 9º ano", data: fmt(addDays(today, 15)), horaInicio: "09:00", horaFim: "16:00", local: "Auditório Principal e Corredores", responsavel: "Paula Ferreira", setor: "Professores", status: "Planejado", recursos: ["Mesas", "Cartazes", "Projetores", "Extensões elétricas"], publicoAlvo: "6º ao 9º Ano", participantesEsperados: 250 },
  { id: "E003", titulo: "Reunião de Pais e Mestres", descricao: "Reunião bimestral com entrega de boletins", data: fmt(addDays(today, 7)), horaInicio: "19:00", horaFim: "21:30", local: "Auditório Principal", responsavel: "Ana Souza", setor: "Direção", status: "Planejado", recursos: ["Cadeiras extras", "Projetor", "Boletins impressos"], publicoAlvo: "Responsáveis", participantesEsperados: 200 },
  { id: "E004", titulo: "Semana da Consciência Negra", descricao: "Programação cultural e educativa sobre a temática afro-brasileira", data: fmt(addDays(today, 20)), horaInicio: "07:30", horaFim: "17:00", local: "Vários espaços", responsavel: "Carlos Lima", setor: "Coordenação Pedagógica", status: "Planejado", recursos: ["Materiais culturais", "Palestras externas", "Exposição"], publicoAlvo: "Toda a comunidade escolar", participantesEsperados: 500 },
  { id: "E005", titulo: "Formatura do 9º Ano", descricao: "Cerimônia de formatura dos alunos concluintes do Ensino Fundamental", data: fmt(addDays(today, 45)), horaInicio: "19:30", horaFim: "23:00", local: "Auditório Principal", responsavel: "Ana Souza", setor: "Direção", status: "Planejado", recursos: ["Beca", "Diploma", "Decoração", "Buffet", "Fotógrafo"], publicoAlvo: "9º Ano e familiares", participantesEsperados: 180 },
  { id: "E006", titulo: "Passeio Pedagógico – Museu", descricao: "Visita ao Museu de Ciências Naturais", data: fmt(subDays(today, 3)), horaInicio: "07:00", horaFim: "17:00", local: "Museu de Ciências Naturais", responsavel: "Paula Ferreira", setor: "Professores", status: "Concluído", recursos: ["Ônibus", "Crachás", "Kit lanche"], publicoAlvo: "7º e 8º Ano", participantesEsperados: 80 },
];
