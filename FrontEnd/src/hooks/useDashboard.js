import { useEffect, useState, useCallback } from "react";
import { fetchDashboard } from "../api/dashboardApi";

export default function useDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchDashboard()
      .then(setDashboardData)
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { dashboardData, loading, error, refetch: load };
}