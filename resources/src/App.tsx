import React, { useState } from "react";
import { AppProvider, useApp } from "./store";
import { ToastProvider } from "./components/ui/Toast";
import Layout from "./components/layout/Layout";
import TransactionForm from "./components/TransactionForm";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import MonthlyPlan from "./pages/MonthlyPlan";
import Savings from "./pages/Savings";
import Templates from "./pages/Templates";
import Reports from "./pages/Reports";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";

export type Page = "dashboard" | "transactions" | "plan" | "savings" | "templates" | "reports" | "calendar" | "settings";

function AppShell() {
  const { data } = useApp();
  const [page, setPage] = useState<Page>("dashboard");
  const [showAddTx, setShowAddTx] = useState(false);

  if (!data.settings.setupComplete) {
    return <Setup />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={setPage} onAddTransaction={() => setShowAddTx(true)} />;
      case "transactions":
        return <Transactions onAddTransaction={() => setShowAddTx(true)} />;
      case "plan":
        return <MonthlyPlan />;
      case "savings":
        return <Savings />;
      case "templates":
        return <Templates />;
      case "reports":
        return <Reports />;
      case "calendar":
        return <Calendar />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard onNavigate={setPage} onAddTransaction={() => setShowAddTx(true)} />;
    }
  };

  return (
    <Layout
      currentPage={page}
      onNavigate={setPage}
      onAddTransaction={() => setShowAddTx(true)}
    >
      {renderPage()}
      <TransactionForm
        open={showAddTx}
        onClose={() => setShowAddTx(false)}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  );
}
