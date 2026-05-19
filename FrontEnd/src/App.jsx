import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import Dashboard from "./pages/DashboardPage";
import BudgetTracker from "./pages/BudgetTracker";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
// import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budget-tracker" element={<BudgetTracker />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

