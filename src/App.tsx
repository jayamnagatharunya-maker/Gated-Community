import React, { useState, useEffect } from "react";
import {
  Building2,
  Smartphone,
  Shield,
  Activity,
  UserCheck,
  CheckCircle,
  Bell,
  X,
  Menu
} from "lucide-react";
import { User, Society, Block, Flat, Notice, Visitor, SOSAlert, SupportTicket } from "./types";
import SmartphoneSimulator from "./components/SmartphoneSimulator";
import AdminPortal from "./components/AdminPortal";

export default function App() {
  // Global synchronization states
  const [societies, setSocieties] = useState<Society[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Responsive mobile toggle (on small viewports, swap between admin pane & simulated smartphone)
  const [simActiveOnMobile, setSimActiveOnMobile] = useState(false);

  // Floating responsive UI toast states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Fetch all synchronized collections from custom backend Express server
  const syncDatabase = async () => {
    try {
      const adminHeaders = {
        "Authorization": "Bearer mock-jwt-token-for-usr-admin"
      };

      // Parallelize fetches for extreme speed and page efficiency
      const [socRes, blkRes, fltRes, usrRes, ntcRes, visRes, sosRes, tktRes] = await Promise.all([
        fetch("/api/societies"),
        fetch("/api/blocks"),
        fetch("/api/flats"),
        fetch("/api/admin/users", { headers: adminHeaders }),
        fetch("/api/notices"),
        fetch("/api/visitors", { headers: adminHeaders }),
        fetch("/api/sos/active"),
        fetch("/api/tickets", { headers: adminHeaders })
      ]);

      let societiesList: Society[] = [];
      if (socRes.ok) {
        societiesList = await socRes.json();
        setSocieties(societiesList);
      }
      if (blkRes.ok) {
        // Blocks need a valid society to resolve, gather them
        const allBlocks: Block[] = [];
        await Promise.all(
          societiesList.map(async (s) => {
            const r = await fetch(`/api/societies/${s.id}/blocks`);
            if (r.ok) {
              const b = await r.json();
              allBlocks.push(...b);
            }
          })
        );
        setBlocks(allBlocks);
      }
      if (fltRes.ok) setFlats(await fltRes.json());
      if (usrRes.ok) setUsers(await usrRes.json());
      if (ntcRes.ok) setNotices(await ntcRes.json());
      if (visRes.ok) setVisitors(await visRes.json());
      if (sosRes.ok) setSosAlerts(await sosRes.json());
      if (tktRes.ok) setTickets(await tktRes.json());
    } catch (e) {
      console.warn("Express server offline or booting up, utilizing local cached lists:", e);
    }
  };

  // Trigger dynamic polling every 3 seconds to keep both views perfectly synchronized
  useEffect(() => {
    syncDatabase();
    const interval = setInterval(() => {
      syncDatabase();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helper to show dynamic floating toast alerts on screen
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-[#10b981] selection:text-black">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold animate-bounce bg-[#161618] border-zinc-800 text-white">
          <span className={toast.type === "success" ? "text-[#10b981]" : toast.type === "error" ? "text-red-500" : "text-cyan-400"}>
            ●
          </span>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:text-[#10b981] font-mono text-sm px-1">×</button>
        </div>
      )}

      {/* Main Workspace Layout Wrapper */}
      <div className="flex-1 flex flex-col xl:flex-row p-4 xl:p-6 gap-6 h-screen overflow-hidden">
        
        {/* VIEW 1: LEFT SIDEBAR - WEB ADMIN PORTAL */}
        <div className={`flex-1 flex flex-col min-w-0 ${simActiveOnMobile ? "hidden xl:flex" : "flex"}`}>
          <AdminPortal
            societies={societies}
            blocks={blocks}
            flats={flats}
            users={users}
            notices={notices}
            tickets={tickets}
            sosAlerts={sosAlerts}
            visitors={visitors}
            showToast={showToast}
            onRefreshAll={syncDatabase}
          />
        </div>

        {/* VIEW 2: RIGHT SIDEBAR - INTERACTIVE SMARTPHONE SIMULATOR */}
        <div className={`xl:w-[390px] flex justify-center items-center shrink-0 ${!simActiveOnMobile ? "hidden xl:flex" : "flex"}`}>
          <SmartphoneSimulator
            societies={societies}
            notices={notices}
            visitors={visitors}
            sosAlerts={sosAlerts}
            tickets={tickets}
            showToast={showToast}
            onRefreshAdmin={syncDatabase}
          />
        </div>

      </div>

      {/* FLOATING ACTION BOTTOM NAV: Toggle for narrow screens / mobile viewports */}
      <div className="xl:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 z-50">
        <button
          onClick={() => setSimActiveOnMobile(false)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
            !simActiveOnMobile
              ? "bg-[#10b981] text-black shadow-md shadow-emerald-950/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Admin Workspace</span>
        </button>

        <button
          onClick={() => setSimActiveOnMobile(true)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
            simActiveOnMobile
              ? "bg-[#10b981] text-black shadow-md shadow-emerald-950/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile App Simulator</span>
        </button>
      </div>

    </div>
  );
}
