import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import {
  MdAttachMoney,
  MdInventory2,
  MdNotificationsNone,
  MdClose,
} from "react-icons/md";

const BASE_URL =`${import.meta.env.VITE_API_URL}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Generate a pseudo-time for ordering (expired first, then expiring, budget, low stock)
const TYPE_ORDER = { expired: 0, expiring_soon: 1, budget_alert: 2, low_stock: 3 };

function getNotifMeta(type) {
  switch (type) {
    case "budget_alert":
      return {
        icon: MdAttachMoney,
        iconBg: "bg-[#4A541F]",
        iconColor: "text-white",
      };
    case "low_stock":
      return {
        icon: MdInventory2,
        iconBg: "bg-[#4A541F]",
        iconColor: "text-white",
      };
    case "expiring_soon":
    case "expired":
      return {
        icon: MdNotificationsNone,
        iconBg: "bg-red-100",
        iconColor: "text-red-500",
      };
    default:
      return {
        icon: MdNotificationsNone,
        iconBg: "bg-[#EEF3D2]",
        iconColor: "text-[#4A541F]",
      };
  }
}

function getNotifContent(notif) {
  switch (notif.type) {
    case "budget_alert":
      return {
        title: "Budget Alert: Monthly Cap",
        body: `You have reached ${notif.percentage_used?.toFixed(0)}% of your monthly ${notif.category_name} budget. Consider reviewing your upcoming pantry needs.`,
        primaryLabel: "Review Budget",
        primaryAction: "budget-tracker",
      };
    case "low_stock":
      return {
        title: "Low Stock: Pantry Essentials",
        body: `${notif.item_name} is running low. Only ${notif.stock} remaining in your current inventory.`,
        primaryLabel: "Add to List",
        primaryAction: "shopping"
      };
    case "expiring_soon":
      return {
        title: "Expiring Soon: Perishables",
        body: `${notif.item_name} expires in ${notif.days_remaining} day${notif.days_remaining !== 1 ? "s" : ""}. Try using it in a recipe today to avoid waste!`,
        primaryAction: null,
      };
    case "expired":
      return {
        title: "Expired: Item Needs Replacement",
        body: `${notif.item_name} has expired. Dispose and replace as soon as possible.`,
        primaryLabel: "Go to Inventory",
        primaryAction: "inventory",
      };
    default:
      return {
        title: "Notification",
        body: "",
        primaryLabel: null,
      };
  }
}

function NotifCard({ notif, onDismiss }) {
  const meta = getNotifMeta(notif.type);
  const content = getNotifContent(notif);
  const Icon = meta.icon;
  const navigate = useNavigate();

  function handlePrimary() {
    if (content.primaryAction) navigate(`/${content.primaryAction}`);
  }

  return (
    <div className="relative rounded-2xl border border-[#E5E7EB] bg-white px-6 py-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconBg}`}>
          <Icon size={20} className={meta.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-bold text-[#2D3335]">{content.title}</p>
            {/* <span className="shrink-0 text-xs text-[#9CA3AF]">{notif._timeAgo || ""}</span> */}
          </div>
          <p className="mt-1 text-sm text-[#5A6062] leading-relaxed max-w-xl">{content.body}</p>

          {/* Actions */}
          {(content.primaryLabel || content.secondaryLabel) && (
            <div className="flex items-center gap-3 mt-3">
              {content.primaryLabel && (
                <button
                  onClick={handlePrimary}
                  className="rounded-full bg-[#4A541F] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3a4118] transition-colors"
                >
                  {content.primaryLabel}
                </button>
              )}
              {content.secondaryLabel && (
                <button
                  onClick={() => onDismiss(notif._key)}
                  className="text-xs font-semibold text-[#475569] hover:text-[#2D3335] transition-colors"
                >
                  {content.secondaryLabel}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss X */}
        <button
          onClick={() => onDismiss(notif._key)}
          className="shrink-0 text-[#CBD5E1] hover:text-[#475569] transition-colors mt-0.5"
        >
          <MdClose size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/notifications`, { headers: getAuthHeaders() });
      if (res.ok) {
        const d = await res.json();
        // Attach a stable key and fake time label per type priority
        const timeLabels = {
          budget_alert: "2 hours ago",
          low_stock: ["5 hours ago", "10 hours ago", "1 day ago"],
          expiring_soon: ["1 day ago", "4 day ago"],
          expired: "just now",
        };
        const counters = {};
        const enriched = (d.notifications || []).map((n, i) => {
          counters[n.type] = (counters[n.type] || 0);
          const label = Array.isArray(timeLabels[n.type])
            ? timeLabels[n.type][counters[n.type]] || "1 day ago"
            : timeLabels[n.type] || "recently";
          counters[n.type]++;
          return { ...n, _key: `${n.type}-${n.item_id || n.category_id || i}`, _timeAgo: label };
        });
        setNotifications(enriched);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  function dismiss(key) {
    setDismissed((prev) => new Set([...prev, key]));
  }

  const visible = notifications.filter((n) => !dismissed.has(n._key));

  return (
    <div className="flex h-screen bg-[#F5F6F0] overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-10 py-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-[#2D3335]">Notifications</h1>
            {visible.length > 0 && (
              <p className="mt-1 text-sm text-[#5A6062]">{visible.length} active notification{visible.length > 1 ? "s" : ""}</p>
            )}
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7E8E21] border-t-transparent" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3D2]">
                <MdNotificationsNone size={28} className="text-[#7E8E21]" />
              </div>
              <p className="text-sm font-semibold text-[#2D3335]">You're all caught up!</p>
              <p className="text-xs text-[#9CA3AF]">No new notifications at this time.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visible.map((notif) => (
                <NotifCard key={notif._key} notif={notif} onDismiss={dismiss} />
              ))}

              {dismissed.size > 0 && (
                <button
                  onClick={() => setDismissed(new Set())}
                  className="mt-2 text-xs text-[#9CA3AF] hover:text-[#5A6062] transition-colors text-center"
                >
                  Restore {dismissed.size} dismissed notification{dismissed.size > 1 ? "s" : ""}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}