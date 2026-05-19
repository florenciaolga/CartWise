import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import Dashboard from "./pages/DashboardPage";
import BudgetTracker from "./pages/BudgetTracker";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Notification from "./pages/Notification";
import Settings from "./pages/Settings";
import ShoppingList from "./pages/ShoppingListPage";

function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budget-tracker" element={<BudgetTracker />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/shopping" element={<ShoppingList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

