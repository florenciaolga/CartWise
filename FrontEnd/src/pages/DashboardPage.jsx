import { RiAddLine } from "react-icons/ri";
import Sidebar from "../components/sidebar";
import useDashboard from "../hooks/useDashboard";
import useQuickAdd from "../hooks/useQuickAdd";
import { getGreeting } from "../utils/greeting";
import { getUser } from "../services/authService";
import BudgetProgressCard from "../components/dashboard/BudgetProgressCard";
import ExpiringSoonCard from "../components/dashboard/ExpiringSoonCard";
import StatCards from "../components/dashboard/StatCards";
import TransactionsCard from "../components/dashboard/TransactionsCard";
import QuickAddModal from "../components/modal/QuickAddModal";

export default function DashboardPage() {
  const { dashboardData, loading, refetch } = useDashboard();
  const quickAdd = useQuickAdd(refetch);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl font-semibold">
        Loading Dashboard...
      </div>
    );
  }

  const user = getUser();

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] font-manrope overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#2D3335]">
              {getGreeting()}, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-[#5A6062] font-medium">
              Here is the state of your household ledger today.
            </p>
          </div>
          <button
            onClick={quickAdd.open}
            className="flex items-center gap-2 rounded-full bg-[#7E8E21] px-5 py-3 text-sm font-bold text-[#E8FFE8] shadow-lg transition hover:bg-[#3d4519] active:scale-95"
          >
            <RiAddLine size={18} />
            Quick Add
          </button>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-5">
          <BudgetProgressCard data={dashboardData?.budget_progress} />
          <ExpiringSoonCard items={dashboardData?.expiring_soon} />
        </div>

        <StatCards data={dashboardData} />

        <div className="grid grid-cols-3 gap-5">
          <TransactionsCard transactions={dashboardData?.recent_transactions} />
        </div>
      </main>

      <QuickAddModal
        isOpen={quickAdd.isOpen}
        onClose={quickAdd.close}
        form={quickAdd.form}
        onChange={quickAdd.handleChange}
        categories={quickAdd.categories}
        onSubmit={quickAdd.handleSubmit}
        isSubmitting={quickAdd.isSubmitting}
        error={quickAdd.error}
      />
    </div>
  );
}