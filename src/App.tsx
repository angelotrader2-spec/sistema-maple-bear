import { ReactElement } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./modules/Dashboard";
import { Enfermaria } from "./modules/Enfermaria";
import { Copiadora } from "./modules/Copiadora";
import { Reservas } from "./modules/Reservas";
import { Eventos } from "./modules/Eventos";

function AppContent() {
  const { currentUser, activeModule } = useApp();

  if (!currentUser) return <Login />;

  const moduleMap: Record<string, ReactElement> = {
    dashboard: <Dashboard />,
    enfermaria: <Enfermaria />,
    copiadora: <Copiadora />,
    reservas: <Reservas />,
    eventos: <Eventos />,
  };

  return (
    <Layout>
      {moduleMap[activeModule] || <Dashboard />}
    </Layout>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
