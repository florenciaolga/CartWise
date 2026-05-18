import { useNavigate, useLocation } from "react-router-dom";
import {MdDashboard, MdShoppingCart, MdAttachMoney, MdInventory2, MdBarChart, MdSettings, MdNotificationsNone} from "react-icons/md";
import { RiWallet3Fill } from "react-icons/ri";

const NAV_ITEMS = [
  { icon: MdDashboard,         label: "Dashboard",      path: "/dashboard"     },
  { icon: MdShoppingCart,      label: "Shopping List",  path: "/shopping"      },
  { icon: MdAttachMoney,       label: "Budget Tracker", path: "/budget-tracker"},
  { icon: MdInventory2,        label: "Inventory",      path: "/inventory"     },
  { icon: MdBarChart,          label: "Reports",        path: "/reports"       },
  { icon: MdSettings,          label: "Settings",       path: "/settings"      },
  { icon: MdNotificationsNone, label: "Notifications",  path: "/notifications" },
];

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150
        ${active ? "text-[#7E8E21]" : "text-[#475569] hover:text-[#7E8E21]"}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  })();

  const name = user.name || "Frank Ocean";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col justify-between border-r border-[#E5E7EB] bg-[#F8FAF2] px-5 py-6">

      <div>
        <div className="mb-8 flex items-center gap-3 px-4">
          <RiWallet3Fill className="text-2xl text-[#48521D]" />
          <div>
            <p className="text-base font-semibold leading-tight text-[#48521D]">CartWise</p>
            <p className="text-[11px] leading-tight text-[#5A6062]">The Curated Ledger</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ icon, label, path: navPath }) => (
            <SidebarItem
              key={label}
              icon={icon}
              label={label}
              active={
                location.pathname === navPath ||
                (navPath === "/dashboard" && location.pathname === "/")
              }
              onClick={() => navigate(navPath)}
            />
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 px-3 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4A541F] text-sm font-bold text-[#E8FFE8]">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#2D3335]">{name}</p>
          <p className="text-[11px] text-[#5A6062]">Premium Plan</p>
        </div>
      </div>

    </aside>
  );
}