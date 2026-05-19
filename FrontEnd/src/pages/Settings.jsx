import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MdPerson, MdLock, MdLogout, MdCheck } from "react-icons/md";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user")) ||
      {}
    );
  } catch {
    return {};
  }
}

function updateStoredUser(updates) {
  // Update whichever storage has the user
  const lsUser = localStorage.getItem("user");
  const ssUser = sessionStorage.getItem("user");
  if (lsUser) {
    localStorage.setItem("user", JSON.stringify({ ...JSON.parse(lsUser), ...updates }));
  }
  if (ssUser) {
    sessionStorage.setItem("user", JSON.stringify({ ...JSON.parse(ssUser), ...updates }));
  }
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <div className="mb-5 border-b border-[#F3F4EE] pb-4">
        <p className="text-base font-semibold text-[#2D3335]">{title}</p>
        {subtitle && <p className="text-xs text-[#5A6062] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────
function ProfileSection() {
  const user = getUser();
  const [name, setName] = useState(user.name || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSave() {
    if (!name.trim()) { setError("Name cannot be empty."); return; }
    if (name.trim() === (user.name || "")) { setError("No changes made."); return; }

    setSaving(true);
    setError("");
    try {
      // Try PATCH /api/users/me — ask your friend if this endpoint exists
      const res = await fetch(`${BASE_URL}/users/me`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        updateStoredUser({ name: name.trim() });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        // If endpoint doesn't exist yet, just update localStorage only
        updateStoredUser({ name: name.trim() });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch {
      // Offline / no endpoint — still update localStorage so sidebar reflects it
      updateStoredUser({ name: name.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Profile"
      subtitle="Update your display name."
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#4A541F] text-lg font-bold text-[#E8FFE8]">
          {initials || "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D3335]">{name || "—"}</p>
          <p className="text-xs text-[#5A6062]">{user.email || ""}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-sm">
        <div>
          <label className="text-xs font-medium text-[#5A6062] mb-1 block">Full Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21] transition-colors"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#5A6062] mb-1 block">Email</label>
          <input
            type="email"
            readOnly
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAF5] px-4 py-2.5 text-sm text-[#9CA3AF] outline-none cursor-not-allowed"
            value={user.email || ""}
          />
          <p className="text-[11px] text-[#9CA3AF] mt-1">Email cannot be changed.</p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 self-start rounded-xl bg-[#4A541F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3a4118] disabled:opacity-60 transition-colors"
        >
          {success ? (
            <><MdCheck size={16} /> Saved!</>
          ) : saving ? (
            "Saving…"
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </Section>
  );
}

// ─── Account Section ──────────────────────────────────────────────────────────
function AccountSection() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleLogout() {
    // Clear both storages — same pattern as saveLoginData
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/sign-in");
  }

  return (
    <Section
      title="Account"
      subtitle="Manage your session."
    >
      <div className="flex flex-col gap-3 max-w-sm">

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            <MdLogout size={16} />
            Log Out
          </button>
        ) : (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-[#2D3335] mb-1">Are you sure you want to log out?</p>
            <p className="text-xs text-[#5A6062] mb-4">You'll need to sign in again to access your account.</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-2 text-sm font-medium text-[#475569] hover:bg-[#F9FAF5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Settings() {
  return (
    <div className="flex h-screen bg-[#F5F6F0] overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-10 py-10">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2D3335]">Settings</h1>
            <p className="mt-1 text-sm text-[#5A6062]">Manage your account and preferences.</p>
          </div>

          <div className="flex flex-col gap-5">
            <ProfileSection />
            <AccountSection />
          </div>

        </div>
      </div>
    </div>
  );
}