import React, { useState } from "react";
import {
  Building2,
  Users,
  Shield,
  Clock,
  Plus,
  Trash2,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  FileText,
  Wrench,
  Search,
  Check,
  MapPin,
  Calendar,
  Smartphone,
  Wifi,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  History,
  Info
} from "lucide-react";
import { User, Society, Block, Flat, Notice, SupportTicket, SOSAlert, Visitor } from "../types";

interface AdminPortalProps {
  societies: Society[];
  blocks: Block[];
  flats: Flat[];
  users: User[];
  notices: Notice[];
  tickets: SupportTicket[];
  sosAlerts: SOSAlert[];
  visitors?: Visitor[];
  showToast: (msg: string, type?: "success" | "error") => void;
  onRefreshAll: () => void;
}

export default function AdminPortal({
  societies,
  blocks,
  flats,
  users,
  notices,
  tickets,
  sosAlerts,
  visitors = [],
  showToast,
  onRefreshAll
}: AdminPortalProps) {
  // Tabs: "societies" | "users" | "approvals" | "notices" | "tickets" | "sos" | "visitors"
  const [activeTab, setActiveTab] = useState<"societies" | "users" | "approvals" | "notices" | "tickets" | "sos" | "visitors">("societies");

  // Filter / Search state
  const [userSearch, setUserSearch] = useState("");

  // Create Society form
  const [socName, setSocName] = useState("");
  const [socAddress, setSocAddress] = useState("");
  const [socDesc, setSocDesc] = useState("");

  // Create Block form
  const [selectedSocId, setSelectedSocId] = useState("");
  const [blockName, setBlockName] = useState("");
  const [blockDesc, setBlockDesc] = useState("");

  // Create Flat form
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [flatOwner, setFlatOwner] = useState("");
  const [flatPhone, setFlatPhone] = useState("");
  const [flatStatus, setFlatStatus] = useState<"Occupied" | "Vacant" | "Maintenance">("Occupied");

  // Create Notice form
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeContent, setNewNoticeContent] = useState("");
  const [newNoticeCategory, setNewNoticeCategory] = useState<"Security" | "Maintenance" | "Event" | "General">("General");

  // SOS Dispatch Command states
  const [selectedSosId, setSelectedSosId] = useState<string | null>(null);
  const [dispatcherMessage, setDispatcherMessage] = useState("");

  // Visitor pass & scanner states
  const [scannedCode, setScannedCode] = useState("");
  const [scannedVisitor, setScannedVisitor] = useState<Visitor | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [visitorFilter, setVisitorFilter] = useState<"All" | "Pre-Approved" | "Checked-In" | "Checked-Out">("All");
  const [visitorSearch, setVisitorSearch] = useState("");

  // Walk-in Registration Form States
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInVehicle, setWalkInVehicle] = useState("");
  const [walkInPurpose, setWalkInPurpose] = useState("Delivery");
  const [walkInFlatNo, setWalkInFlatNo] = useState("");
  const [walkInResidentName, setWalkInResidentName] = useState("");

  const playScannerChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high chime A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContext fallback
    }
  };

  const handleScanCode = (code: string) => {
    if (!code.trim()) return;
    setIsScanning(true);
    setScannedVisitor(null);
    setScannedCode(code);
    
    setTimeout(() => {
      setIsScanning(false);
      const matched = visitors.find(v => v.qrCodeValue.toUpperCase() === code.toUpperCase().trim());
      if (matched) {
        setScannedVisitor(matched);
        playScannerChime();
        showToast(`🎫 Pass found: ${matched.visitorName} for flat ${matched.flatNo}`, "success");
      } else {
        setScannedVisitor(null);
        showToast("⚠️ Invalid QR/Pass Code: No matching record found.", "error");
      }
    }, 900); // 900ms mock delay to simulate scan hardware decoding
  };

  const handleVerifyCheckIn = async (visitorId: string) => {
    try {
      const res = await fetch("/api/visitors/log-check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({ id: visitorId })
      });
      if (res.ok) {
        showToast("✅ Visitor Checked-In successfully!", "success");
        setScannedCode("");
        setScannedVisitor(null);
        onRefreshAll();
      } else {
        showToast("Failed to complete check-in", "error");
      }
    } catch (err) {
      showToast("Server connection failure", "error");
    }
  };

  const handleVerifyCheckOut = async (visitorId: string) => {
    try {
      const res = await fetch(`/api/visitors/log-check-out/${visitorId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        }
      });
      if (res.ok) {
        showToast("👋 Visitor Checked-Out successfully!", "success");
        setScannedCode("");
        setScannedVisitor(null);
        onRefreshAll();
      } else {
        showToast("Failed to complete check-out", "error");
      }
    } catch (err) {
      showToast("Server connection failure", "error");
    }
  };

  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInFlatNo) {
      showToast("Name and Flat unit are required", "error");
      return;
    }

    try {
      const res = await fetch("/api/visitors/log-check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({
          visitorName: walkInName,
          flatNo: walkInFlatNo,
          phone: walkInPhone,
          vehicleNo: walkInVehicle || "None",
          purpose: walkInPurpose,
          residentName: walkInResidentName || "Occupant"
        })
      });
      if (res.ok) {
        showToast("✅ Walk-In Visitor logged & Checked-In!", "success");
        setWalkInName("");
        setWalkInPhone("");
        setWalkInVehicle("");
        setWalkInPurpose("Delivery");
        setWalkInFlatNo("");
        setWalkInResidentName("");
        onRefreshAll();
      } else {
        showToast("Failed to register walk-in visitor", "error");
      }
    } catch (err) {
      showToast("Server connection failure", "error");
    }
  };

  // Handlers
  const handleSendDispatcherMessage = async (e: React.FormEvent, sosId: string) => {
    e.preventDefault();
    if (!dispatcherMessage.trim()) return;

    try {
      const res = await fetch(`/api/sos/${sosId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({ message: dispatcherMessage, senderName: "Dispatch HQ" })
      });
      if (res.ok) {
        showToast("Dispatch log updated and broadcasted to resident!", "success");
        setDispatcherMessage("");
        onRefreshAll();
      }
    } catch (err) {
      showToast("Failed to post dispatch log", "error");
    }
  };

  const handleCreateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socName || !socAddress) return;

    try {
      const res = await fetch("/api/societies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({ name: socName, address: socAddress, description: socDesc })
      });
      if (res.ok) {
        showToast(`Gated Society "${socName}" registered!`, "success");
        setSocName("");
        setSocAddress("");
        setSocDesc("");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Server communication error", "error");
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocId || !blockName) return;

    try {
      const res = await fetch(`/api/societies/${selectedSocId}/blocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({ name: blockName, description: blockDesc })
      });
      if (res.ok) {
        showToast(`Tower block "${blockName}" appended successfully!`, "success");
        setBlockName("");
        setBlockDesc("");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Server communication error", "error");
    }
  };

  const handleCreateFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlockId || !flatNumber) return;

    try {
      const res = await fetch(`/api/blocks/${selectedBlockId}/flats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({
          number: flatNumber,
          occupancyStatus: flatStatus,
          ownerName: flatOwner,
          phone: flatPhone
        })
      });
      if (res.ok) {
        showToast(`Flat Unit "${flatNumber}" added to tower.`, "success");
        setFlatNumber("");
        setFlatOwner("");
        setFlatPhone("");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Server communication error", "error");
    }
  };

  const handleDeleteFlat = async (id: string) => {
    if (!window.confirm("Remove this unit registration from block database?")) return;
    try {
      const res = await fetch(`/api/flats/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        }
      });
      if (res.ok) {
        showToast("Flat Unit removed successfully.");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  // State for resident mapping and approval filters
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [mapSocId, setMapSocId] = useState("");
  const [mapBlkId, setMapBlkId] = useState("");
  const [mapFlatNo, setMapFlatNo] = useState("");
  const [approvalSearch, setApprovalSearch] = useState("");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("All");
  const [approvalRoleFilter, setApprovalRoleFilter] = useState("All");

  const handleApproveUser = async (userId: string, status: "Approved" | "Rejected" | "Pending" = "Approved") => {
    try {
      const res = await fetch(`/api/admin/approve-user/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`User profile set to ${status}!`, "success");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  const handleSaveResidentMapping = async (userId: string) => {
    if (!mapSocId || !mapBlkId || !mapFlatNo.trim()) {
      showToast("Please select society, block and enter flat number.", "error");
      return;
    }
    try {
      const res = await fetch(`/api/admin/map-resident/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({
          societyId: mapSocId,
          blockId: mapBlkId,
          flatNo: mapFlatNo
        })
      });
      if (res.ok) {
        showToast("Resident flat mapping updated successfully!", "success");
        setEditingUserId(null);
        onRefreshAll();
      } else {
        showToast("Failed to update flat mapping.", "error");
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({
          title: newNoticeTitle,
          content: newNoticeContent,
          category: newNoticeCategory
        })
      });
      if (res.ok) {
        showToast("Bulletin Board message broadcasted successfully!", "success");
        setNewNoticeTitle("");
        setNewNoticeContent("");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm("Take down this notice board posting?")) return;
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        }
      });
      if (res.ok) {
        showToast("Notice taken down successfully.");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: "In Progress" | "Resolved") => {
    try {
      const res = await fetch(`/api/tickets/update-status/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Complaint ticket status updated to ${status}!`, "success");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  const handleAcknowledgeSos = async (id: string, status: "Responding" | "Resolved") => {
    try {
      const res = await fetch(`/api/sos/acknowledge/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-jwt-token-for-usr-admin"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Emergency alert updated to ${status}.`, "success");
        onRefreshAll();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  // Derived lists
  const pendingUsers = users.filter(u => !u.isApproved);
  const activeSOS = sosAlerts.filter(s => s.status !== "Resolved");

  const filteredUsers = users.filter(u => {
    const term = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(term) ||
           u.email.toLowerCase().includes(term) ||
           u.phone.includes(term) ||
           u.role.toLowerCase().includes(term);
  });

  return (
    <div id="admin-panel" className="flex-1 bg-[#121214] border border-zinc-800 rounded-3xl p-6 flex flex-col space-y-6 overflow-hidden">
      
      {/* Real-time Flashing Siren Indicator for SOS Emergencies */}
      {activeSOS.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500 text-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl text-white">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-sm tracking-wide text-red-400 uppercase">🚨 UNRESOLVED SOS EMERGENCY PATROL DISPATCH</h4>
              <p className="text-xs text-zinc-300">
                A resident has pressed the mobile distress trigger: Flat <strong>{activeSOS[0].flatNo}</strong> ({activeSOS[0].residentName}) • Call Link: <a href={`tel:${activeSOS[0].phone}`} className="underline font-bold text-white">{activeSOS[0].phone}</a>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAcknowledgeSos(activeSOS[0].id, "Responding")}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl"
            >
              Acknowledge Dispatch
            </button>
            <button
              onClick={() => handleAcknowledgeSos(activeSOS[0].id, "Resolved")}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      )}

      {/* Admin Panel Header & Statistics Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#10b981]" />
            Gated Community Management Gird
          </h2>
          <p className="text-xs text-zinc-400">Web Administrator Gated Operations Hub &amp; Emergency Patrol Dispatcher</p>
        </div>

        {/* Floating statistics counter pill */}
        <div className="flex items-center gap-4 text-xs font-mono font-semibold bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-left border-r border-zinc-800 pr-3">
            <span className="text-zinc-500 text-[10px] uppercase block">Apartment Complexes</span>
            <strong className="text-white text-sm">{societies.length}</strong>
          </div>
          <div className="text-left border-r border-zinc-800 pr-3">
            <span className="text-zinc-500 text-[10px] uppercase block">Patrol Guards</span>
            <strong className="text-cyan-400 text-sm">{users.filter(u => u.role === "Security").length}</strong>
          </div>
          <div className="text-left">
            <span className="text-zinc-500 text-[10px] uppercase block">Support Tickets</span>
            <strong className="text-amber-400 text-sm">{tickets.filter(t => t.status === "Open").length} open</strong>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation Bar */}
      <div className="flex border-b border-zinc-800 overflow-x-auto gap-4">
        {[
          { key: "societies", label: "Societies & Structure", icon: Building2 },
          { key: "users", label: "Residents & Staff Logs", icon: Users },
          { key: "approvals", label: "Shift Approvals", icon: Shield, badge: pendingUsers.length },
          { key: "notices", label: "Notice Board & Bulletins", icon: FileText },
          { key: "tickets", label: "Support Tickets", icon: Wrench, badge: tickets.filter(t => t.status !== "Resolved").length },
          { key: "sos", label: "SOS Dispatch & Incident Map", icon: AlertTriangle, badge: activeSOS.length },
          { key: "visitors", label: "Visitors & Pass Scanner", icon: QrCode, badge: visitors.filter(v => v.status === "Pre-Approved").length }
        ].map(tb => (
          <button
            key={tb.key}
            onClick={() => setActiveTab(tb.key as any)}
            className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tb.key
                ? "border-[#10b981] text-[#10b981]"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <tb.icon className="w-4 h-4" />
            <span>{tb.label}</span>
            {tb.badge !== undefined && tb.badge > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                tb.key === "approvals" ? "bg-[#10b981] text-black" : "bg-amber-500 text-black animate-pulse"
              }`}>
                {tb.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto">
        
        {/* PANEL 1: SOCIETIES & STRUCTURE */}
        {activeTab === "societies" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left side: Setup forms */}
            <div className="lg:col-span-1 space-y-5">
              
              {/* Form A: Register Society */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#10b981]" />
                  Register New Complex
                </h3>
                <form onSubmit={handleCreateSociety} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Complex Name</label>
                    <input
                      type="text"
                      required
                      value={socName}
                      onChange={(e) => setSocName(e.target.value)}
                      placeholder="e.g. Emerald Heights Society"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Physical Address</label>
                    <input
                      type="text"
                      required
                      value={socAddress}
                      onChange={(e) => setSocAddress(e.target.value)}
                      placeholder="e.g. 102 Park Avenue, NY"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Complex Notes / Decsription</label>
                    <textarea
                      value={socDesc}
                      onChange={(e) => setSocDesc(e.target.value)}
                      placeholder="Premium apartment complex notes..."
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                      rows={2}
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-[#10b981] text-black font-extrabold text-xs rounded-xl shadow-md">
                    Provision Complex
                  </button>
                </form>
              </div>

              {/* Form B: Append Tower Block */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#10b981]" />
                  Append Tower Block
                </h3>
                <form onSubmit={handleCreateBlock} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-0.5">Select Target Complex</label>
                    <select
                      required
                      value={selectedSocId}
                      onChange={(e) => setSelectedSocId(e.target.value)}
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">-- Choose Society --</option>
                      {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Block / Tower Name</label>
                    <input
                      type="text"
                      required
                      value={blockName}
                      onChange={(e) => setBlockName(e.target.value)}
                      placeholder="e.g. Tower Alpha (Wing B)"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-[#10b981] text-black font-extrabold text-xs rounded-xl shadow-md">
                    Provision Wing Block
                  </button>
                </form>
              </div>

              {/* Form C: Add Apartment Flat */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#10b981]" />
                  Link Individual Flat Unit
                </h3>
                <form onSubmit={handleCreateFlat} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-0.5">Select Tower Block</label>
                    <select
                      required
                      value={selectedBlockId}
                      onChange={(e) => setSelectedBlockId(e.target.value)}
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">-- Choose Wing Block --</option>
                      {blocks.map(b => (
                        <option key={b.id} value={b.id}>
                          {societies.find(s => s.id === b.societyId)?.name} &gt; {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Flat / Apartment Number</label>
                    <input
                      type="text"
                      required
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="e.g. Flat 302-A"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Owner Name</label>
                      <input
                        type="text"
                        value={flatOwner}
                        onChange={(e) => setFlatOwner(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Contact Phone</label>
                      <input
                        type="tel"
                        value={flatPhone}
                        onChange={(e) => setFlatPhone(e.target.value)}
                        placeholder="+1-555"
                        className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Occupancy Status</label>
                    <select
                      value={flatStatus}
                      onChange={(e) => setFlatStatus(e.target.value as any)}
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Occupied">Occupied</option>
                      <option value="Vacant">Vacant Shell</option>
                      <option value="Maintenance">Under Renovation</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-[#10b981] text-black font-extrabold text-xs rounded-xl shadow-md">
                    Register Flat Unit
                  </button>
                </form>
              </div>

            </div>

            {/* Right side: Active Structure List (Tree Map representation) */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#10b981]" />
                Registered Societies Database
              </h3>
              
              {societies.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-zinc-500">No registered housing estates found. Add one on the left!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {societies.map(soc => {
                    const socBlocks = blocks.filter(b => b.societyId === soc.id);
                    return (
                      <div key={soc.id} className="border border-zinc-800 bg-[#161618] rounded-2xl p-4 text-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <h4 className="font-extrabold text-sm text-[#10b981]">{soc.name}</h4>
                            <span className="text-zinc-500 text-[10px] font-mono">{soc.address}</span>
                          </div>
                          <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">ID: {soc.id}</span>
                        </div>

                        {/* Blocks list */}
                        {socBlocks.length === 0 ? (
                          <p className="text-[11px] text-zinc-500 italic pl-4">No wings or tower blocks mapped to this society.</p>
                        ) : (
                          <div className="space-y-3 pl-4 border-l-2 border-[#10b981]/20">
                            {socBlocks.map(blk => {
                              const blkFlats = flats.filter(f => f.blockId === blk.id);
                              return (
                                <div key={blk.id} className="space-y-2">
                                  <h5 className="font-bold text-white text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                                    {blk.name}
                                  </h5>

                                  {/* Flats mapping */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {blkFlats.map(flt => (
                                      <div key={flt.id} className="bg-zinc-900 border border-zinc-800/80 p-2.5 rounded-xl space-y-1 relative group">
                                        <div className="flex justify-between items-center">
                                          <strong className="text-white font-bold">{flt.number}</strong>
                                          <span className={`text-[8px] px-1.5 rounded font-mono ${
                                            flt.occupancyStatus === "Occupied" ? "bg-emerald-950 text-emerald-400" :
                                            flt.occupancyStatus === "Vacant" ? "bg-zinc-800 text-zinc-400" :
                                            "bg-amber-950 text-amber-400"
                                          }`}>{flt.occupancyStatus}</span>
                                        </div>
                                        {flt.ownerName && (
                                          <p className="text-[10px] text-zinc-400 leading-none">Owner: {flt.ownerName}</p>
                                        )}
                                        <button
                                          onClick={() => handleDeleteFlat(flt.id)}
                                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 p-1"
                                          title="Delete Flat Unit"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    {blkFlats.length === 0 && (
                                      <p className="text-[10px] text-zinc-500 col-span-full italic">No flat mappings linked.</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* PANEL 2: USERS DATABASE */}
        {activeTab === "users" && (
          <div className="space-y-4 text-left">
            {/* Real-time Simulator & Device Sync Information card */}
            <div className="bg-[#161618] border border-zinc-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#10b981]/10 rounded-xl text-[#10b981] mt-0.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    Live Mobile Simulator Device Sync (Expo Go / Emulator)
                    <span className="flex items-center gap-1 text-[10px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                      <Wifi className="w-3 h-3 animate-pulse" /> Active Connection Allowed
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    To register, login, or trigger real-time SOS/Visitor logs using an external Android Emulator or physical device running Expo Go, ensure your mobile codebase is configured to target this backend API base URL:
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 border border-zinc-800 p-3 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono block">Detected Backend URL (Target API)</span>
                  <code className="text-xs text-[#10b981] font-mono break-all font-bold">
                    {window.location.origin}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    showToast("API URL copied to clipboard!", "success");
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg shadow transition-all whitespace-nowrap self-start sm:self-center"
                >
                  Copy URL
                </button>
              </div>
              <div className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                💡 <strong>Host network warning:</strong> If running Expo Go on a physical phone locally, you must replace <code className="text-zinc-400">localhost</code> or <code className="text-zinc-400">127.0.0.1</code> with your machine's local LAN IP (e.g., <code className="text-zinc-400">192.168.x.x</code>) so that your phone can route requests across your local Wi-Fi router.
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by name, role, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>
              <span className="text-xs text-zinc-500 font-mono">{filteredUsers.length} active matching</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-zinc-300">
                  <thead className="text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-950 font-bold font-mono">
                    <tr>
                      <th className="px-5 py-3">Member Name</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Phone / Email</th>
                      <th className="px-5 py-3">Specific details</th>
                      <th className="px-5 py-3">Approved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-900/60">
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-white">{u.name}</div>
                          <span className="text-[9px] text-zinc-500 font-mono">UID: {u.id}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            u.role === "Admin" ? "bg-red-500/10 text-red-400" :
                            u.role === "Resident" ? "bg-emerald-500/10 text-emerald-400" :
                            u.role === "Security" ? "bg-cyan-500/10 text-cyan-400" :
                            u.role === "Volunteer" ? "bg-amber-500/10 text-amber-400" :
                            "bg-blue-500/10 text-blue-400"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 space-y-0.5">
                          <div>{u.phone}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{u.email}</div>
                        </td>
                        <td className="px-5 py-4 text-zinc-400">
                          {u.role === "Resident" && (
                            <span>Apt: <strong>{u.details?.flatNo || "N/A"}</strong></span>
                          )}
                          {u.role === "Security" && (
                            <span className="block font-mono text-[11px]">
                              Gate: {u.details?.gateNumber} • Shift: {u.details?.shift}
                            </span>
                          )}
                          {u.role === "Volunteer" && (
                            <span className="block">
                              Skills: <strong className="text-amber-400">{u.details?.skills?.join(", ")}</strong>
                            </span>
                          )}
                          {u.role === "Guardian" && (
                            <span className="block text-[11px]">
                              Guardian for: <strong>{u.details?.residentName}</strong> ({u.details?.relationship})
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${u.isApproved ? "text-emerald-400" : "text-amber-400"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isApproved ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                            {u.isApproved ? "Authorized" : "Pending Shift"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: DEVICE APPROVALS & RESIDENT FLAT MAPPING */}
        {activeTab === "approvals" && (
          <div className="space-y-4 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2 border-b border-zinc-850">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Shield className="w-5 h-5 text-[#10b981]" />
                  Resident Approvals &amp; Society Flat-Mapping Grid
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Search, review registrations, map occupants to official tower units, and authorize account access.
                </p>
              </div>
            </div>

            {/* SEARCH AND FILTER BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, phone, flat..."
                  value={approvalSearch}
                  onChange={(e) => setApprovalSearch(e.target.value)}
                  className="w-full bg-[#161618] border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <select
                  value={approvalStatusFilter}
                  onChange={(e) => setApprovalStatusFilter(e.target.value)}
                  className="w-full bg-[#161618] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#10b981]"
                >
                  <option value="All">All Approval Statuses</option>
                  <option value="Pending">Pending Approvals</option>
                  <option value="Approved">Approved / Authorized</option>
                  <option value="Rejected">Rejected Profiles</option>
                </select>
              </div>

              <div>
                <select
                  value={approvalRoleFilter}
                  onChange={(e) => setApprovalRoleFilter(e.target.value)}
                  className="w-full bg-[#161618] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#10b981]"
                >
                  <option value="All">All Roles</option>
                  <option value="Resident">Resident</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Security">Security Guard</option>
                </select>
              </div>
            </div>

            {/* USERS LISTING */}
            {(() => {
              const filteredUsers = users.filter(u => {
                if (u.role === "Admin") return false;

                const matchesSearch = 
                  u.name.toLowerCase().includes(approvalSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(approvalSearch.toLowerCase()) ||
                  u.phone.includes(approvalSearch) ||
                  (u.details?.flatNo?.toLowerCase().includes(approvalSearch.toLowerCase()));

                const statusValue = u.details?.approvalStatus || (u.isApproved ? "Approved" : "Pending");
                const matchesStatus = approvalStatusFilter === "All" || statusValue.toLowerCase() === approvalStatusFilter.toLowerCase();
                
                const matchesRole = approvalRoleFilter === "All" || u.role.toLowerCase() === approvalRoleFilter.toLowerCase();

                return matchesSearch && matchesStatus && matchesRole;
              });

              if (filteredUsers.length === 0) {
                return (
                  <div className="bg-zinc-900 border border-zinc-850 p-12 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto mb-1 animate-pulse" />
                    <h4 className="font-bold text-white text-sm">No residents or personnel match filters</h4>
                    <p className="text-xs text-zinc-500">Try adjusting your filters or search terms.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map(u => {
                    const mappedSociety = societies.find(s => s.id === u.details?.societyId);
                    const mappedBlock = blocks.find(b => b.id === u.details?.blockId);
                    const currentStatus = u.details?.approvalStatus || (u.isApproved ? "Approved" : "Pending");

                    return (
                      <div key={u.id} className="p-4 bg-[#141416] border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                                {u.name}
                              </h4>
                              <span className="text-[10px] text-zinc-500 block">ID: {u.id}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">{u.role}</span>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-extrabold uppercase font-mono tracking-wider ${
                                currentStatus === "Approved" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/10" :
                                currentStatus === "Rejected" ? "bg-rose-950/40 text-rose-400 border border-rose-500/10" :
                                "bg-amber-950/40 text-amber-400 border border-amber-500/10"
                              }`}>
                                {currentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-400 font-mono">
                            <div>
                              <span className="text-zinc-600 text-[9px] block uppercase font-bold">Contact Phone:</span>
                              {u.phone}
                            </div>
                            <div>
                              <span className="text-zinc-600 text-[9px] block uppercase font-bold">Email:</span>
                              <span className="truncate block">{u.email}</span>
                            </div>
                          </div>

                          {/* FLAT / ROLE SPECIFIC INFO SECTION */}
                          <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-2 text-xs">
                            {u.role === "Resident" && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500 text-[9.5px] uppercase font-bold">Official Flat Unit Mapping</span>
                                  {editingUserId !== u.id && (
                                    <button
                                      onClick={() => {
                                        setEditingUserId(u.id);
                                        setMapSocId(u.details?.societyId || "");
                                        setMapBlkId(u.details?.blockId || "");
                                        setMapFlatNo(u.details?.flatNo || "");
                                      }}
                                      className="text-[10px] text-[#10b981] hover:underline font-bold"
                                    >
                                      Edit Mapping
                                    </button>
                                  )}
                                </div>

                                {editingUserId === u.id ? (
                                  <div className="space-y-2.5 pt-1.5">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[9px] text-zinc-500 uppercase block font-bold">Society</label>
                                        <select
                                          value={mapSocId}
                                          onChange={(e) => {
                                            setMapSocId(e.target.value);
                                            setMapBlkId("");
                                          }}
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-lg p-1 text-[11px] text-white"
                                        >
                                          <option value="">-- Society --</option>
                                          {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[9px] text-zinc-500 uppercase block font-bold">Block</label>
                                        <select
                                          value={mapBlkId}
                                          onChange={(e) => setMapBlkId(e.target.value)}
                                          disabled={!mapSocId}
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-lg p-1 text-[11px] text-white disabled:opacity-40"
                                        >
                                          <option value="">-- Block --</option>
                                          {blocks.filter(b => b.societyId === mapSocId).map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] text-zinc-500 block uppercase font-bold">Flat Number</label>
                                      <input
                                        type="text"
                                        value={mapFlatNo}
                                        onChange={(e) => setMapFlatNo(e.target.value)}
                                        placeholder="e.g. 202-B"
                                        className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-white"
                                      />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                      <button
                                        onClick={() => setEditingUserId(null)}
                                        className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveResidentMapping(u.id)}
                                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg"
                                      >
                                        Save Mapping
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[11.5px] text-zinc-300 space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-zinc-500">Society:</span>
                                      <span className="font-bold text-white">{mappedSociety?.name || "Unassociated"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-500">Block / Tower:</span>
                                      <span className="font-bold text-white">{mappedBlock?.name || "Unassociated"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-500">Apartment:</span>
                                      <span className="font-extrabold text-[#10b981] font-mono">{u.details?.flatNo || "Pending..."}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {u.role === "Security" && (
                              <div className="space-y-1">
                                <span className="text-zinc-500 text-[9px] block uppercase font-bold">Assigned Guard Station</span>
                                <div className="text-zinc-300 font-mono text-[11px]">
                                  Gate: <strong>{u.details?.gateNumber}</strong> | Shift: {u.details?.shift}
                                </div>
                              </div>
                            )}

                            {u.role === "Volunteer" && (
                              <div className="space-y-1">
                                <span className="text-zinc-500 text-[9px] block uppercase font-bold">First Aid Response</span>
                                <div className="text-zinc-300 text-[11px]">
                                  Availability: <strong className="text-amber-400">{u.details?.availability}</strong>
                                  <span className="block mt-0.5 text-[10px] text-zinc-400">Skills: {u.details?.skills?.join(", ")}</span>
                                </div>
                              </div>
                            )}

                            {u.role === "Guardian" && (
                              <div className="space-y-1">
                                <span className="text-zinc-500 text-[9px] block uppercase font-bold">Guardian Association</span>
                                <div className="text-zinc-300 text-[11px]">
                                  Monitoring: <strong className="text-sky-400">{u.details?.residentName}</strong> ({u.details?.relationship})
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ACTIONS FOOTER */}
                        <div className="flex gap-2 pt-2 border-t border-zinc-850/60">
                          {currentStatus !== "Approved" && (
                            <button
                              onClick={() => handleApproveUser(u.id, "Approved")}
                              className="flex-1 py-1.5 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve Profile
                            </button>
                          )}
                          {currentStatus !== "Rejected" && (
                            <button
                              onClick={() => handleApproveUser(u.id, "Rejected")}
                              className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 border border-zinc-800 font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1"
                            >
                              Reject Profile
                            </button>
                          )}
                          {(currentStatus === "Approved" || currentStatus === "Rejected") && (
                            <button
                              onClick={() => handleApproveUser(u.id, "Pending")}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs rounded-xl border border-zinc-850"
                              title="Reset status back to Pending"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* PANEL 4: NOTICE BOARD */}
        {activeTab === "notices" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left form */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#10b981]" />
                  Broadcast Bulletin Notice
                </h3>
                <form onSubmit={handleCreateNotice} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Bulletin Title</label>
                    <input
                      type="text"
                      required
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      placeholder="e.g. Scheduled Power Outage"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Bulletin Category</label>
                    <select
                      value={newNoticeCategory}
                      onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="General">General Broadcast</option>
                      <option value="Security">Security Advisory</option>
                      <option value="Maintenance">Maintenance alert</option>
                      <option value="Event">Community Event</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Bulletin Content</label>
                    <textarea
                      required
                      value={newNoticeContent}
                      onChange={(e) => setNewNoticeContent(e.target.value)}
                      placeholder="Type details that residents will immediately see on their companion applications..."
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                      rows={4}
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#10b981] text-black font-extrabold text-xs rounded-xl shadow-md">
                    Publish to Residents' Phones
                  </button>
                </form>
              </div>
            </div>

            {/* Right List */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#10b981]" />
                Active Bulletin Board Logs
              </h3>

              <div className="space-y-3">
                {notices.map(not => (
                  <div key={not.id} className="border border-zinc-800 bg-[#161618] rounded-2xl p-4 text-xs space-y-2 flex justify-between items-start">
                    <div className="space-y-1 text-left flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm">{not.title}</h4>
                        <span className={`text-[8px] font-bold px-1.5 rounded font-mono uppercase ${
                          not.category === "Security" ? "bg-red-500/10 text-red-400" :
                          not.category === "Maintenance" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-400"
                        }`}>{not.category}</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">{not.content}</p>
                      <div className="flex gap-4 text-[9px] text-zinc-500 font-mono">
                        <span>Posted by: {not.postedBy}</span>
                        <span>Date: {new Date(not.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNotice(not.id)}
                      className="text-zinc-500 hover:text-red-500 p-1.5"
                      title="Take Down Bulletin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {notices.length === 0 && (
                  <p className="text-xs text-zinc-500 text-center py-6">No bulletins published to the neighborhood board.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* PANEL 5: SUPPORT TICKETS */}
        {activeTab === "tickets" && (
          <div className="space-y-4 text-left">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <Wrench className="w-5 h-5 text-[#10b981]" />
              Resident Helpdesk Support Queue
            </h3>
            <p className="text-xs text-zinc-400">
              Residents can file electrical, plumbing, lift, or general security issues directly from their phones. Assign work and update progress below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map(t => (
                <div key={t.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{t.title}</h4>
                        <span className="text-[10px] text-zinc-500 block">Flat {t.flatNo} • Filed by {t.residentName}</span>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                        t.status === "Open" ? "bg-blue-500/10 text-blue-400" :
                        t.status === "In Progress" ? "bg-amber-500/10 text-amber-400 animate-pulse" :
                        "bg-green-500/10 text-green-400"
                      }`}>{t.status}</span>
                    </div>

                    <p className="text-xs text-zinc-300 bg-black/30 p-2.5 rounded-xl border border-zinc-800/60 leading-normal">
                      {t.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono pt-1">
                      <span>Category: <strong className="text-white">{t.category}</strong></span>
                      <span>Priority: <span className={`font-bold ${t.priority === "High" ? "text-red-400" : "text-zinc-400"}`}>{t.priority}</span></span>
                    </div>
                  </div>

                  {/* Actions depending on state */}
                  {t.status === "Open" && (
                    <button
                      onClick={() => handleUpdateTicketStatus(t.id, "In Progress")}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl"
                    >
                      Assign Staff / Start Work
                    </button>
                  )}
                  {t.status === "In Progress" && (
                    <button
                      onClick={() => handleUpdateTicketStatus(t.id, "Resolved")}
                      className="w-full py-1.5 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl"
                    >
                      Resolve &amp; Close Ticket
                    </button>
                  )}
                  {t.status === "Resolved" && (
                    <div className="py-1.5 bg-zinc-950 text-center rounded-xl border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider font-mono">
                      Ticket Resolved ✅
                    </div>
                  )}
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="col-span-full text-center py-10 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">The helpdesk queue is completely clear. No tickets submitted.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 6: SOS DISPATCH & INCIDENT COMMAND CENTER */}
        {activeTab === "sos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* Left Column: List of Alert Logs */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-white">Distress Beacon Feed</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase">Incident records in database</p>
                </div>
                <span className="text-[10px] bg-red-950/40 text-red-400 px-2.5 py-0.5 rounded-full font-mono border border-red-500/10 font-bold">
                  {sosAlerts.length} Total
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
                {sosAlerts.slice().reverse().map(alert => {
                  const isActive = alert.id === (selectedSosId || (sosAlerts.length > 0 ? sosAlerts[sosAlerts.length - 1].id : null));
                  return (
                    <button
                      key={alert.id}
                      onClick={() => setSelectedSosId(alert.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all block space-y-2 cursor-pointer ${
                        isActive
                          ? "bg-red-950/20 border-red-500/40 shadow-md shadow-red-950/20"
                          : "bg-[#161618] border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md font-mono ${
                          alert.priority === "CRITICAL" ? "bg-red-600 text-white animate-pulse" :
                          alert.priority === "HIGH" ? "bg-red-900 text-red-200" :
                          "bg-zinc-800 text-zinc-300"
                        }`}>
                          {alert.priority} • {alert.category}
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase flex items-center gap-1 ${
                          alert.status === "Active" ? "text-red-400" :
                          alert.status === "Responding" ? "text-amber-400" :
                          "text-emerald-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            alert.status === "Active" ? "bg-red-500 animate-ping" :
                            alert.status === "Responding" ? "bg-amber-400" :
                            "bg-emerald-400"
                          }`} />
                          {alert.status}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-white text-xs">{alert.residentName}</h4>
                        <p className="text-[10px] text-zinc-400">Flat {alert.flatNo} • {new Date(alert.time).toLocaleTimeString()}</p>
                      </div>

                      <p className="text-[10px] text-zinc-500 truncate italic">
                        "{alert.message}"
                      </p>
                    </button>
                  );
                })}

                {sosAlerts.length === 0 && (
                  <p className="text-xs text-zinc-500 text-center py-10">No emergency beacons triggered yet.</p>
                )}
              </div>
            </div>

            {/* Right Column: Active Incident Command Center */}
            <div className="lg:col-span-7 space-y-4">
              {(() => {
                const currentAlert = sosAlerts.find(s => s.id === (selectedSosId || (sosAlerts.length > 0 ? sosAlerts[sosAlerts.length - 1].id : null)));
                if (!currentAlert) {
                  return (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
                      <AlertTriangle className="w-12 h-12 text-zinc-600 mx-auto" />
                      <div>
                        <h4 className="font-bold text-white text-sm">No Incident Selected</h4>
                        <p className="text-xs text-zinc-500 leading-normal">
                          Select a distress beacon from the history list on the left to initialize the Emergency Dispatch Command Center.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start pb-3 border-b border-zinc-800">
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block">Incident Command Center</span>
                        <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          Emergency Beacon #{currentAlert.id.replace("sos-", "")}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase font-mono ${
                          currentAlert.status === "Active" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          currentAlert.status === "Responding" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {currentAlert.status} STATUS
                        </span>
                        <span className="text-[10px] text-zinc-500 block font-mono mt-1">
                          {new Date(currentAlert.time).toLocaleDateString()} {new Date(currentAlert.time).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-xl space-y-1 text-xs">
                        <span className="text-[9px] text-zinc-500 uppercase block font-mono font-bold">Resident Contact</span>
                        <strong className="text-white block">{currentAlert.residentName}</strong>
                        <span className="text-zinc-400 block">Apartment: Flat {currentAlert.flatNo}</span>
                        <a href={`tel:${currentAlert.phone}`} className="text-red-400 hover:underline block font-mono font-bold mt-1 text-[10.5px]">
                          📞 {currentAlert.phone}
                        </a>
                      </div>

                      <div className="p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-xl space-y-1 text-xs">
                        <span className="text-[9px] text-zinc-500 uppercase block font-mono font-bold">Incident Profile</span>
                        <div className="flex gap-1.5 items-center">
                          <span className="text-zinc-400">Category:</span>
                          <strong className="text-white font-mono">{currentAlert.category}</strong>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <span className="text-zinc-400">Severity:</span>
                          <strong className="text-red-400 font-mono">{currentAlert.priority}</strong>
                        </div>
                        {currentAlert.acknowledgedBy && (
                          <div className="text-[10px] text-zinc-400 mt-1 font-medium">
                            Assigned Guard: <span className="text-[#10b981] font-bold">{currentAlert.acknowledgedBy}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resolved Location Geocode Address */}
                    <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-emerald-400 uppercase font-mono font-bold tracking-wider">🎯 Cell Triangulated Dispatch Area</span>
                        <span className="text-[9px] font-mono text-zinc-500">Lat: {currentAlert.latitude.toFixed(5)} / Lng: {currentAlert.longitude.toFixed(5)}</span>
                      </div>
                      <p className="text-[11.5px] text-white leading-relaxed font-semibold">
                        {currentAlert.address}
                      </p>
                    </div>

                    {/* Audio Transcript Box */}
                    <div className="p-3.5 bg-black/40 border border-zinc-800/80 rounded-xl space-y-2 text-xs">
                      <span className="text-[9px] text-[#10b981] uppercase font-mono font-bold tracking-wider">🎙️ Spoken Distress Call Transcript (AI Geocoded)</span>
                      <div className="p-3 bg-[#0d0d0f] border border-zinc-900 rounded-lg flex items-start gap-2.5">
                        <span className="p-1 bg-red-950/60 text-red-400 rounded-md mt-0.5">
                          <Volume2 className="w-4 h-4 text-red-500 animate-pulse" />
                        </span>
                        <p className="text-zinc-200 text-xs italic leading-normal font-medium">
                          "{currentAlert.message}"
                        </p>
                      </div>
                    </div>

                    {/* Operational Dispatch Logs Terminals */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[9px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Operational Dispatch log &amp; patrol updates</span>
                      <div className="bg-[#0b0b0d] border border-zinc-800 rounded-xl p-3 h-[100px] overflow-y-auto space-y-2 font-mono text-[10.5px]">
                        {(currentAlert.updates || []).map((log: any, idx: number) => (
                          <div key={log.id || idx} className="border-b border-zinc-900 pb-1.5 last:border-0">
                            <div className="flex justify-between text-[9px] text-zinc-500">
                              <strong className="text-emerald-400">{log.senderName}</strong>
                              <span>{new Date(log.time).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-zinc-300 leading-snug mt-0.5">{log.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Dispatch Form & Acknowledge status buttons */}
                    <div className="space-y-2.5 pt-1">
                      <form onSubmit={(e) => handleSendDispatcherMessage(e, currentAlert.id)} className="flex gap-2">
                        <input
                          type="text"
                          value={dispatcherMessage}
                          onChange={(e) => setDispatcherMessage(e.target.value)}
                          placeholder="Type dispatch comment / log update..."
                          className="flex-1 bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="submit"
                          className="bg-zinc-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-750 transition-all whitespace-nowrap"
                        >
                          Send Log
                        </button>
                      </form>

                      {/* Status Buttons */}
                      <div className="flex gap-2.5">
                        {currentAlert.status === "Active" && (
                          <button
                            type="button"
                            onClick={() => handleAcknowledgeSos(currentAlert.id, "Responding")}
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all uppercase tracking-wider"
                          >
                            Assign Guard Responding
                          </button>
                        )}
                        {currentAlert.status !== "Resolved" && (
                          <button
                            type="button"
                            onClick={() => handleAcknowledgeSos(currentAlert.id, "Resolved")}
                            className="flex-1 py-2 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-extrabold text-xs rounded-xl shadow transition-all uppercase tracking-wider"
                          >
                            Mark Incident Resolved
                          </button>
                        )}
                        {currentAlert.status === "Resolved" && (
                          <div className="w-full py-2 bg-zinc-950 text-center border border-zinc-800 rounded-xl text-[#10b981] font-bold text-xs uppercase tracking-wider font-mono">
                            Incident Resolved ✅ Archived
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* PANEL 7: VISITORS & PASS SCANNER */}
        {activeTab === "visitors" && (
          <div className="p-4 xl:p-6 space-y-6 animate-fade-in">
            
            {/* Top Stat Summary Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <span className="text-[10px] text-zinc-500 uppercase block font-mono font-bold">Total Visitor Records</span>
                <strong className="text-white text-2xl font-black block mt-1">{visitors.length}</strong>
                <span className="text-[9px] text-zinc-400 block mt-1 font-mono">Pre-approved + Walk-ins</span>
              </div>
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
                <span className="text-[10px] text-emerald-400 uppercase block font-mono font-bold">Currently Inside (Checked-In)</span>
                <strong className="text-emerald-400 text-2xl font-black block mt-1">
                  {visitors.filter(v => v.status === "Checked-In").length}
                </strong>
                <span className="text-[9px] text-emerald-500/80 block mt-1 font-mono">Requires checkout on departure</span>
              </div>
              <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-2xl">
                <span className="text-[10px] text-blue-400 uppercase block font-mono font-bold">Awaiting Arrival</span>
                <strong className="text-blue-400 text-2xl font-black block mt-1">
                  {visitors.filter(v => v.status === "Pre-Approved").length}
                </strong>
                <span className="text-[9px] text-blue-400/80 block mt-1 font-mono">Pre-approved QR passes issued</span>
              </div>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <span className="text-[10px] text-zinc-500 uppercase block font-mono font-bold">Checked-Out Today</span>
                <strong className="text-white text-2xl font-black block mt-1">
                  {visitors.filter(v => v.status === "Checked-Out").length}
                </strong>
                <span className="text-[9px] text-zinc-400 block mt-1 font-mono">Departures completed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: INTERACTIVE PASS SCANNER TERMINAL & QUICK REGISTER (5 COLS) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. SECURE PASS SCANNER TERMINAL */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-[#10b981]" />
                      <div>
                        <h3 className="font-extrabold text-sm text-white">QR / Pass Scanner Terminal</h3>
                        <p className="text-[9px] text-zinc-500">Gated entry-point verification node</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold font-mono bg-[#10b981]/10 text-[#10b981] animate-pulse border border-[#10b981]/25 uppercase">
                      ● Terminal Live
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Scanner Viewfinder Box */}
                    <div className="relative w-full h-[160px] bg-black border border-zinc-800 rounded-xl overflow-hidden flex flex-col items-center justify-center">
                      {/* Technical alignment corners */}
                      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-zinc-700"></div>
                      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-zinc-700"></div>
                      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-zinc-700"></div>
                      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-zinc-700"></div>
                      
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.04]"></div>

                      {isScanning ? (
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                          {/* Animated Scanning Beam line */}
                          <div className="absolute left-0 right-0 h-0.5 bg-[#10b981] shadow-[0_0_15px_#10b981] animate-bounce w-full top-1/2"></div>
                          <Activity className="w-10 h-10 text-[#10b981] animate-spin" />
                          <span className="text-[10px] text-[#10b981] font-mono mt-3 uppercase tracking-widest animate-pulse font-bold">
                            Decoding digital credential...
                          </span>
                        </div>
                      ) : scannedVisitor ? (
                        <div className="relative z-10 text-center p-4 space-y-2.5 animate-fade-in w-full bg-emerald-950/10 h-full flex flex-col justify-center items-center">
                          <div className="w-10 h-10 bg-[#10b981]/20 border border-[#10b981] rounded-full flex items-center justify-center text-[#10b981]">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[8px] font-mono uppercase bg-[#10b981] text-black px-1.5 py-0.5 rounded font-extrabold tracking-wider">
                              AUTHENTICATED PASS
                            </span>
                            <h4 className="font-extrabold text-white text-sm mt-1">{scannedVisitor.visitorName}</h4>
                            <p className="text-[9.5px] text-zinc-400 font-mono">
                              Unit {scannedVisitor.flatNo} • {scannedVisitor.purpose}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative z-10 text-center p-4 space-y-2 text-zinc-500">
                          <QrCode className="w-10 h-10 text-zinc-700 mx-auto animate-pulse" />
                          <p className="text-[10px] max-w-[240px] leading-relaxed mx-auto">
                            Position visitor QR pass inside viewer, enter code below, or select a pre-approved pass to simulate check-in.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Code Input Form */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono tracking-wider block">Manual Pass Code Entry</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. S360-VIS-582931"
                          value={scannedCode}
                          onChange={(e) => setScannedCode(e.target.value)}
                          className="flex-1 bg-[#161619] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-zinc-700 focus:outline-none focus:border-[#10b981]"
                        />
                        <button
                          type="button"
                          onClick={() => handleScanCode(scannedCode)}
                          disabled={!scannedCode.trim() || isScanning}
                          className="px-4 py-2 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider disabled:opacity-45"
                        >
                          Scan
                        </button>
                      </div>
                    </div>

                    {/* Scanned Card Details & Action Panel */}
                    {scannedVisitor && (
                      <div className="bg-zinc-950 border border-[#10b981]/20 p-3.5 rounded-xl space-y-3.5 animate-fade-in text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase font-mono block">Resident Host</span>
                            <span className="text-white font-semibold">{scannedVisitor.residentName}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase font-mono block">Apartment Unit</span>
                            <span className="text-white font-semibold">Flat {scannedVisitor.flatNo}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase font-mono block">Vehicle Number</span>
                            <span className="text-zinc-300 font-mono font-medium">{scannedVisitor.vehicleNo}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase font-mono block">Purpose / Phone</span>
                            <span className="text-zinc-300 truncate">{scannedVisitor.purpose} • {scannedVisitor.phone || "None"}</span>
                          </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setScannedCode("");
                              setScannedVisitor(null);
                            }}
                            className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-[10.5px] rounded-lg"
                          >
                            Clear
                          </button>
                          {scannedVisitor.status === "Pre-Approved" && (
                            <button
                              type="button"
                              onClick={() => handleVerifyCheckIn(scannedVisitor.id)}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10.5px] rounded-lg flex items-center justify-center gap-1 shadow-lg"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              GRANT ENTRY
                            </button>
                          )}
                          {scannedVisitor.status === "Checked-In" && (
                            <button
                              type="button"
                              onClick={() => handleVerifyCheckOut(scannedVisitor.id)}
                              className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[10.5px] rounded-lg flex items-center justify-center gap-1 shadow-lg"
                            >
                              LOG DEPARTURE
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pre-Approved passes shortcuts for easy scanning */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono tracking-wider">Active QR Codes (Click to scan)</label>
                        <span className="text-[8px] font-mono text-[#10b981]">{visitors.filter(v => v.status === "Pre-Approved").length} Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-[84px] overflow-y-auto pr-1">
                        {visitors.filter(v => v.status === "Pre-Approved").map(v => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleScanCode(v.qrCodeValue)}
                            className="p-1.5 bg-[#161619] hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-[9px] truncate flex items-center gap-1"
                          >
                            <QrCode className="w-2.5 h-2.5 text-[#10b981] shrink-0" />
                            <div className="truncate flex-1">
                              <span className="text-white block font-semibold truncate leading-none">{v.visitorName}</span>
                              <span className="text-[7.5px] text-zinc-500 font-mono leading-none">{v.qrCodeValue}</span>
                            </div>
                          </button>
                        ))}
                        {visitors.filter(v => v.status === "Pre-Approved").length === 0 && (
                          <div className="col-span-2 py-3 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-600 font-mono text-[9px]">
                            No active pre-approved passes.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. MANUAL WALK-IN REGISTER (Unexpected visitors like plumbers, courier) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#10b981]" />
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Manual Walk-In Logger</h4>
                      <p className="text-[9px] text-zinc-500">Register unexpected guests, delivery, or utility contractors</p>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterWalkIn} className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono">Visitor Name *</label>
                        <input
                          type="text"
                          required
                          value={walkInName}
                          onChange={(e) => setWalkInName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-[#161619] border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono">Contact Phone</label>
                        <input
                          type="text"
                          value={walkInPhone}
                          onChange={(e) => setWalkInPhone(e.target.value)}
                          placeholder="Phone number"
                          className="w-full bg-[#161619] border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white placeholder:text-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono">Apartment Flat Unit *</label>
                        <input
                          type="text"
                          required
                          value={walkInFlatNo}
                          onChange={(e) => setWalkInFlatNo(e.target.value)}
                          placeholder="e.g. T1-402"
                          className="w-full bg-[#161619] border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono">Occupant Name</label>
                        <input
                          type="text"
                          value={walkInResidentName}
                          onChange={(e) => setWalkInResidentName(e.target.value)}
                          placeholder="e.g. Aasim"
                          className="w-full bg-[#161619] border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white placeholder:text-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono">Vehicle No</label>
                        <input
                          type="text"
                          value={walkInVehicle}
                          onChange={(e) => setWalkInVehicle(e.target.value)}
                          placeholder="e.g. KA-03-HA-1234"
                          className="w-full bg-[#161619] border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono">Purpose of Visit</label>
                        <select
                          value={walkInPurpose}
                          onChange={(e) => setWalkInPurpose(e.target.value)}
                          className="w-full bg-[#161619] border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white"
                        >
                          <option value="Delivery">Delivery / Courier</option>
                          <option value="Guest">Social Guest</option>
                          <option value="Repair">Maintenance / Utility</option>
                          <option value="Cab">Cab / Uber / Taxi</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-zinc-850 hover:bg-zinc-800 text-white font-bold text-[10px] rounded-lg border border-zinc-750 transition-all uppercase tracking-wider"
                    >
                      LOG WALK-IN AND CHECK-IN
                    </button>
                  </form>
                </div>

              </div>

              {/* RIGHT COLUMN: LIVE VISITOR REGISTRY LEDGER (7 COLS) */}
              <div className="lg:col-span-7 space-y-4">
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[520px]">
                  
                  {/* Registry Header */}
                  <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 space-y-3 shrink-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <History className="w-4 h-4 text-zinc-400" />
                        <h3 className="font-extrabold text-sm text-white">Live Visitor Pass Ledger</h3>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        Total {visitors.length} logged
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search visitor, flat, vehicle, purpose..."
                          value={visitorSearch}
                          onChange={(e) => setVisitorSearch(e.target.value)}
                          className="w-full bg-[#161619] border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#10b981]"
                        />
                      </div>
                      {/* Tabs */}
                      <div className="flex bg-black/40 p-0.5 rounded-lg border border-zinc-800 shrink-0">
                        {["All", "Pre-Approved", "Checked-In", "Checked-Out"].map((tabOpt) => (
                          <button
                            key={tabOpt}
                            type="button"
                            onClick={() => setVisitorFilter(tabOpt as any)}
                            className={`px-2 py-1 text-[9.5px] font-bold rounded-md transition-all ${
                              visitorFilter === tabOpt
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {tabOpt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Registry Table */}
                  <div className="flex-1 overflow-y-auto">
                    {(() => {
                      const filteredList = visitors.filter((v) => {
                        // search filter
                        const s = visitorSearch.toLowerCase();
                        if (
                          s &&
                          !v.visitorName.toLowerCase().includes(s) &&
                          !v.flatNo.toLowerCase().includes(s) &&
                          !v.purpose.toLowerCase().includes(s) &&
                          !(v.vehicleNo || "").toLowerCase().includes(s) &&
                          !(v.qrCodeValue || "").toLowerCase().includes(s)
                        ) {
                          return false;
                        }

                        // tab filter
                        if (visitorFilter === "Pre-Approved" && v.status !== "Pre-Approved") return false;
                        if (visitorFilter === "Checked-In" && v.status !== "Checked-In") return false;
                        if (visitorFilter === "Checked-Out" && v.status !== "Checked-Out") return false;

                        return true;
                      });

                      if (filteredList.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                            <QrCode className="w-10 h-10 text-zinc-700 animate-pulse" />
                            <h4 className="text-xs font-bold text-zinc-400">No Visitor Records Match Filters</h4>
                            <p className="text-[10px] text-zinc-500 max-w-[250px]">
                              Try adjusting your search criteria, selecting a different tab, or creating a new manual walk-in entry.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="divide-y divide-zinc-850">
                          {filteredList.slice().reverse().map((v) => (
                            <div key={v.id} className="p-3.5 hover:bg-zinc-950/30 transition-all flex items-center justify-between text-xs gap-4">
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <strong className="text-white font-bold">{v.visitorName}</strong>
                                  <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    v.status === "Pre-Approved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" :
                                    v.status === "Checked-In" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 animate-pulse" :
                                    "bg-zinc-850 text-zinc-500"
                                  }`}>{v.status}</span>
                                  {v.purpose === "Walk-in Entry" && (
                                    <span className="text-[7.5px] font-mono text-amber-400 bg-amber-950/15 border border-amber-500/20 rounded px-1">Walk-In</span>
                                  )}
                                </div>
                                <div className="text-[10.5px] text-zinc-400 leading-snug">
                                  Host: <strong className="text-zinc-300">{v.residentName}</strong> (Flat {v.flatNo}) • Purpose: {v.purpose}
                                </div>
                                <div className="text-[9.5px] text-zinc-500 font-mono flex flex-wrap gap-2.5">
                                  <span>Vehicle: {v.vehicleNo}</span>
                                  {v.phone && <span>Phone: {v.phone}</span>}
                                  <span>QR: <strong className="text-zinc-400">{v.qrCodeValue}</strong></span>
                                </div>
                              </div>

                              <div className="shrink-0 flex flex-col items-end gap-1.5 text-right font-mono text-[9px] text-zinc-500">
                                {v.checkInTime && (
                                  <div className="flex flex-col">
                                    <span>Check-In</span>
                                    <span className="text-zinc-400 font-bold">{new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                )}
                                {v.checkOutTime && (
                                  <div className="flex flex-col">
                                    <span>Check-Out</span>
                                    <span className="text-zinc-400 font-bold">{new Date(v.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                )}

                                {/* Action button inside the row */}
                                {v.status === "Pre-Approved" && (
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyCheckIn(v.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9.5px] rounded border border-emerald-500 tracking-wider shadow"
                                  >
                                    CHECK-IN
                                  </button>
                                )}
                                {v.status === "Checked-In" && (
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyCheckOut(v.id)}
                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[9.5px] rounded border border-amber-500 tracking-wider shadow"
                                  >
                                    CHECK-OUT
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
