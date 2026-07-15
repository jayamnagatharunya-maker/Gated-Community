import React, { useState, useEffect } from "react";
import {
  Smartphone,
  SmartphoneIcon,
  Layers,
  Compass,
  Mic,
  Building2,
  Users,
  Shield,
  Clock,
  LogOut,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Heart,
  Plus,
  Send,
  MapPin,
  QrCode,
  FileText,
  Activity,
  User,
  Bell,
  Trash2,
  Lock,
  Menu,
  ChevronRight,
  Flame,
  ShieldAlert,
  HeartPulse,
  Volume2
} from "lucide-react";
import { User as UserType, Society, Block, Flat, Notice, Visitor, SOSAlert, SupportTicket } from "../types";

interface SimulatorProps {
  societies: Society[];
  notices: Notice[];
  visitors: Visitor[];
  sosAlerts: SOSAlert[];
  tickets: SupportTicket[];
  showToast: (msg: string, type?: "success" | "error") => void;
  onRefreshAdmin: () => void;
}

export default function SmartphoneSimulator({
  societies,
  notices,
  visitors,
  sosAlerts,
  tickets,
  showToast,
  onRefreshAdmin
}: SimulatorProps) {
  // Mobile Simulator States
  const [simToken, setSimToken] = useState<string | null>(localStorage.getItem("simToken"));
  const [simUser, setSimUser] = useState<UserType | null>(null);
  const [simTab, setSimTab] = useState<"login" | "register" | "verify" | "home">("login");
  const [simSmsAlert, setSimSmsAlert] = useState<string | null>(null);

  // Sub-tabs on Home Dashboard
  const [simHomeTab, setSimHomeTab] = useState<"notices" | "visitors" | "tickets" | "guard">("notices");

  // Mobile Auth Forms
  const [simLoginEmail, setSimLoginEmail] = useState("");
  const [simLoginPassword, setSimLoginPassword] = useState("");

  const [simRegStep, setSimRegStep] = useState<1 | 2>(1);
  const [simRegEmail, setSimRegEmail] = useState("");
  const [simRegPassword, setSimRegPassword] = useState("");
  const [simRegName, setSimRegName] = useState("");
  const [simRegPhone, setSimRegPhone] = useState("");
  const [simRegRole, setSimRegRole] = useState<"Resident" | "Guardian" | "Volunteer" | "Security">("Resident");

  // Multi-step Registration Details
  const [simRegSocietyId, setSimRegSocietyId] = useState("");
  const [simRegBlockId, setSimRegBlockId] = useState("");
  const [simRegFlatNo, setSimRegFlatNo] = useState("");

  const [simRegResidentName, setSimRegResidentName] = useState("");
  const [simRegRelationship, setSimRegRelationship] = useState("Parent");
  const [simRegEmergencyContact, setSimRegEmergencyContact] = useState("");

  const [simRegSkills, setSimRegSkills] = useState<string[]>([]);
  const [simRegAvailability, setSimRegAvailability] = useState("Evening");

  const [simRegGateNumber, setSimRegGateNumber] = useState("Gate 1 (Main)");
  const [simRegShift, setSimRegShift] = useState("Day");
  const [simRegAssignedTower, setSimRegAssignedTower] = useState("");

  // OTP inputs
  const [simOtpInput, setSimOtpInput] = useState("");
  const [simLastDevOtp, setSimLastDevOtp] = useState<string | null>(null);

  // Dynamic dropdown cascaders for register
  const [simBlocksList, setSimBlocksList] = useState<Block[]>([]);

  // Interactive visitor creation forms
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [selectedPass, setSelectedPass] = useState<Visitor | null>(null);
  const [visName, setVisName] = useState("");
  const [visPhone, setVisPhone] = useState("");
  const [visVehicle, setVisVehicle] = useState("");
  const [visPurpose, setVisPurpose] = useState("Delivery");

  // Interactive support ticket filing
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [tktTitle, setTktTitle] = useState("");
  const [tktDesc, setTktDesc] = useState("");
  const [tktCategory, setTktCategory] = useState<any>("Plumbing");
  const [tktPriority, setTktPriority] = useState<any>("Medium");

  // Guard walk-in visitor entry
  const [guardVisName, setGuardVisName] = useState("");
  const [guardVisFlat, setGuardVisFlat] = useState("");
  const [guardVisPhone, setGuardVisPhone] = useState("");
  const [guardVisVehicle, setGuardVisVehicle] = useState("");
  const [guardVisPurpose, setGuardVisPurpose] = useState("Delivery");

  // Dynamic multi-step SOS states (Day 8: Location Capture & Emergency Message Creation)
  const [sosWizardStep, setSosWizardStep] = useState<"idle" | "capture-location" | "add-message" | "review" | "tracking">("idle");
  const [sosLat, setSosLat] = useState<number | null>(null);
  const [sosLng, setSosLng] = useState<number | null>(null);
  const [sosAddress, setSosAddress] = useState("");
  const [sosCategory, setSosCategory] = useState<"HEALTH" | "FIRE" | "THEFT" | "OTHER">("OTHER");
  const [sosPriority, setSosPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [sosMessage, setSosMessage] = useState("");
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const [activeLiveSosAlert, setActiveLiveSosAlert] = useState<any | null>(null);
  const [additionalSosComment, setAdditionalSosComment] = useState("");

  // Day 5 & 6 Emergency Contacts and Profile Setup states
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRelationship, setContactRelationship] = useState("Spouse");
  const [contactType, setContactType] = useState<"Primary" | "Secondary" | "Other">("Other");
  const [verifyingContactId, setVerifyingContactId] = useState<string | null>(null);
  const [verificationOtpInput, setVerificationOtpInput] = useState("");
  const [verificationOtpCode, setVerificationOtpCode] = useState<string | null>(null);

  const [profileSocId, setProfileSocId] = useState("");
  const [profileBlkId, setProfileBlkId] = useState("");
  const [profileFlatNo, setProfileFlatNo] = useState("");

  const fetchEmergencyContacts = async () => {
    if (!simToken) return;
    try {
      const res = await fetch("/api/residents/emergency-contacts", {
        headers: { Authorization: `Bearer ${simToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmergencyContacts(data);
      }
    } catch (e) {
      console.error("Error fetching emergency contacts:", e);
    }
  };

  const handleSaveEmergencyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactRelationship) {
      showToast("Please complete all contact fields.", "error");
      return;
    }
    try {
      const res = await fetch("/api/residents/emergency-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${simToken}`
        },
        body: JSON.stringify({
          id: editingContactId || undefined,
          name: contactName,
          phone: contactPhone,
          relationship: contactRelationship,
          type: contactType
        })
      });
      if (res.ok) {
        showToast(editingContactId ? "Emergency Contact updated!" : "Emergency Contact added!", "success");
        setEditingContactId(null);
        setContactName("");
        setContactPhone("");
        setContactRelationship("Spouse");
        setContactType("Other");
        fetchEmergencyContacts();
        onRefreshAdmin();
      }
    } catch (err) {
      showToast("Failed to save emergency contact", "error");
    }
  };

  const handleDeleteEmergencyContact = async (contactId: string) => {
    try {
      const res = await fetch(`/api/residents/emergency-contacts/${contactId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${simToken}` }
      });
      if (res.ok) {
        showToast("Emergency contact removed successfully.", "success");
        fetchEmergencyContacts();
        onRefreshAdmin();
      }
    } catch (err) {
      showToast("Failed to delete contact", "error");
    }
  };

  const handleTriggerContactVerify = async (contactId: string) => {
    try {
      const res = await fetch(`/api/residents/emergency-contacts/${contactId}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${simToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyingContactId(contactId);
        setVerificationOtpCode(data.otp);
        setVerificationOtpInput("");
        showToast(`Verification OTP dispatched to contact's handset!`, "success");
      }
    } catch (err) {
      showToast("Failed to dispatch OTP code", "error");
    }
  };

  const handleConfirmContactVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationOtpInput || !verifyingContactId) return;
    try {
      const res = await fetch(`/api/residents/emergency-contacts/${verifyingContactId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${simToken}`
        },
        body: JSON.stringify({ otp: verificationOtpInput })
      });
      if (res.ok) {
        showToast("Guardian/Contact verified and authorized successfully!", "success");
        setVerifyingContactId(null);
        setVerificationOtpCode(null);
        fetchEmergencyContacts();
        onRefreshAdmin();
      } else {
        showToast("Invalid OTP code. Please try again.", "error");
      }
    } catch (err) {
      showToast("Verification request failed", "error");
    }
  };

  const handleSaveProfileMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileSocId || !profileBlkId || !profileFlatNo.trim()) {
      showToast("Please select society, block, and enter flat number.", "error");
      return;
    }
    try {
      const res = await fetch("/api/residents/map-flat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${simToken}`
        },
        body: JSON.stringify({
          societyId: profileSocId,
          blockId: profileBlkId,
          flatNo: profileFlatNo
        })
      });
      if (res.ok) {
        showToast("Society flat mapping submitted! Awaiting administrator approval.", "success");
        fetchSimUser();
        onRefreshAdmin();
      }
    } catch (err) {
      showToast("Failed to submit flat mapping", "error");
    }
  };

  // Auto sync active live SOS alert for current resident from global SOS alerts
  useEffect(() => {
    if (simUser) {
      const activeAlert = sosAlerts.find(
        (s: any) => s.residentId === simUser.id && s.status !== "Resolved" && s.status !== "Cancelled"
      );
      if (activeAlert) {
        setActiveLiveSosAlert(activeAlert);
        setSosWizardStep("tracking");
      } else {
        setActiveLiveSosAlert(null);
        if (sosWizardStep === "tracking") {
          setSosWizardStep("idle");
        }
      }
    }
  }, [sosAlerts, simUser]);

  // Local state for active local user data polling and dynamic synchronization
  useEffect(() => {
    if (simToken) {
      fetchSimUser();
      const interval = setInterval(() => {
        fetchSimUser();
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setSimUser(null);
      setSimTab("login");
    }
  }, [simToken]);

  useEffect(() => {
    if (simRegSocietyId) {
      fetchBlocksForSociety(simRegSocietyId);
    } else if (profileSocId) {
      fetchBlocksForSociety(profileSocId);
    } else {
      setSimBlocksList([]);
    }
  }, [simRegSocietyId, profileSocId]);

  const fetchBlocksForSociety = async (socId: string) => {
    try {
      const res = await fetch(`/api/societies/${socId}/blocks`);
      if (res.ok) {
        const data = await res.json();
        setSimBlocksList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSimUser = async () => {
    try {
      const res = await fetch("/api/auth/current-user", {
        headers: { Authorization: `Bearer ${simToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSimUser(data.user);
        
        // Fetch contacts if user is Resident
        if (data.user.role === "Resident") {
          fetchEmergencyContacts();
        }

        if (data.user.verified) {
          setSimTab("home");
          // set default home tabs based on roles
          if (data.user.role === "Security") {
            setSimHomeTab("guard");
          } else if (data.user.role !== "Security" && data.user.role !== "Volunteer" && simHomeTab === "guard") {
            setSimHomeTab("notices");
          }
        } else {
          setSimTab("verify");
        }
      } else {
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simLoginEmail || !simLoginPassword) return;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: simLoginEmail, password: simLoginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSimToken(data.token);
        localStorage.setItem("simToken", data.token);
        setSimUser(data.user);
        showToast(`Logged into Mobile App as ${data.user.name}!`, "success");
        if (data.user.verified) {
          setSimTab("home");
          setSimHomeTab(data.user.role === "Security" ? "guard" : "notices");
        } else {
          setSimTab("verify");
        }
        setSimLoginEmail("");
        setSimLoginPassword("");
        onRefreshAdmin();
      } else {
        showToast(data.error || "Credentials invalid", "error");
      }
    } catch (e) {
      showToast("Server connection failure", "error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (simRegStep === 1) {
      if (!simRegEmail || !simRegPassword || !simRegName || !simRegPhone) {
        showToast("Please complete all fields.", "error");
        return;
      }
      setSimRegStep(2);
      return;
    }

    // Assemble role details
    let details: any = {};
    if (simRegRole === "Resident") {
      details = {
        societyId: simRegSocietyId,
        blockId: simRegBlockId,
        flatNo: simRegFlatNo
      };
    } else if (simRegRole === "Guardian") {
      details = {
        residentName: simRegResidentName,
        relationship: simRegRelationship,
        emergencyContact: simRegEmergencyContact
      };
    } else if (simRegRole === "Volunteer") {
      details = {
        skills: simRegSkills,
        availability: simRegAvailability
      };
    } else if (simRegRole === "Security") {
      details = {
        gateNumber: simRegGateNumber,
        shift: simRegShift,
        assignedTower: simRegAssignedTower
      };
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: simRegEmail,
          password: simRegPassword,
          role: simRegRole,
          name: simRegName,
          phone: simRegPhone,
          details
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSimToken(data.token);
        localStorage.setItem("simToken", data.token);
        setSimUser(data.user);
        setSimLastDevOtp(data.devOtpCode);
        setSimTab("verify");

        // trigger SMS notification banner
        setSimSmsAlert(`💬 SMS to ${simRegPhone}: "Your verification code is ${data.devOtpCode}"`);
        showToast("Mobile account created! Check the OTP code.", "success");

        // Reset
        setSimRegStep(1);
        setSimRegEmail("");
        setSimRegPassword("");
        setSimRegName("");
        setSimRegPhone("");
        setSimRegRole("Resident");
        onRefreshAdmin();
      } else {
        showToast(data.error || "Registration failed", "error");
      }
    } catch (e) {
      showToast("Server connection error", "error");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simOtpInput) return;

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({ otp: simOtpInput })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Phone number verified successfully!", "success");
        setSimUser(data.user);
        setSimTab("home");
        setSimHomeTab(data.user.role === "Security" ? "guard" : "notices");
        setSimOtpInput("");
        setSimSmsAlert(null);
        setSimLastDevOtp(null);
        onRefreshAdmin();
      } else {
        showToast(data.error || "Invalid OTP code", "error");
      }
    } catch (e) {
      showToast("OTP verification failed", "error");
    }
  };

  const handleLogout = () => {
    setSimToken(null);
    setSimUser(null);
    localStorage.removeItem("simToken");
    setSimTab("login");
    setSimSmsAlert(null);
    setSimLastDevOtp(null);
    showToast("Logged out of Simulated Mobile App.");
    onRefreshAdmin();
  };

  const handleCaptureLocation = async () => {
    setIsCapturingLocation(true);
    setSosAddress("");
    // Simulate GPS ping loading for high fidelity feel
    setTimeout(async () => {
      // Bengaluru coordinate space
      const baseLat = 12.9716;
      const baseLng = 77.5946;
      const randomLat = Number((baseLat + (Math.random() - 0.5) * 0.015).toFixed(6));
      const randomLng = Number((baseLng + (Math.random() - 0.5) * 0.015).toFixed(6));
      setSosLat(randomLat);
      setSosLng(randomLng);

      try {
        const res = await fetch(`/api/geocode/reverse?lat=${randomLat}&lng=${randomLng}`);
        if (res.ok) {
          const data = await res.json();
          setSosAddress(data.address);
        } else {
          setSosAddress("Emerald Heights Towers, Block B, Outer Ring Road, Bangalore");
        }
      } catch (e) {
        setSosAddress("Emerald Heights Towers, Block B, Outer Ring Road, Bangalore");
      }
      setIsCapturingLocation(false);
    }, 1200);
  };

  const handleVoiceTranscribe = async () => {
    setIsTranscribingVoice(true);
    setSosMessage("");
    try {
      const res = await fetch("/api/sos/voice-transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({ category: sosCategory })
      });
      if (res.ok) {
        const data = await res.json();
        setSosMessage(data.text);
      } else {
        setSosMessage("Help! Emergency assistance required at my unit! Please dispatch patrol.");
      }
    } catch (e) {
      setSosMessage("Help! Emergency assistance required at my unit! Please dispatch patrol.");
    }
    setIsTranscribingVoice(false);
  };

  const handleBroadcastSos = async () => {
    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({
          category: sosCategory,
          message: sosMessage || `Emergency ${sosCategory} beacon broadcasted.`,
          latitude: sosLat,
          longitude: sosLng,
          address: sosAddress || "Emerald Heights Complex",
          priority: sosPriority,
          phone: simUser?.phone,
          voiceTranscribed: isTranscribingVoice,
          flatNo: simUser?.details?.flatNo
        })
      });
      if (res.ok) {
        showToast("🚨 SOS Distress Alert broadcasted to security & neighbors!", "error");
        setSosWizardStep("tracking");
        onRefreshAdmin();
      } else {
        showToast("Failed to broadcast emergency alarm", "error");
      }
    } catch (e) {
      showToast("Network error broadcasting alarm", "error");
    }
  };

  const handleSendSosComment = async () => {
    if (!additionalSosComment.trim() || !activeLiveSosAlert) return;
    try {
      const res = await fetch(`/api/sos/${activeLiveSosAlert.id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({
          message: additionalSosComment,
          senderName: simUser?.name
        })
      });
      if (res.ok) {
        setAdditionalSosComment("");
        onRefreshAdmin();
      } else {
        showToast("Failed to send update", "error");
      }
    } catch (e) {
      showToast("Network error sending update", "error");
    }
  };

  const handleCancelActiveSos = async () => {
    if (!activeLiveSosAlert) return;
    try {
      const res = await fetch(`/api/sos/${activeLiveSosAlert.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({ status: "Cancelled" })
      });
      if (res.ok) {
        showToast("SOS Alert successfully cancelled", "success");
        setSosWizardStep("idle");
        setActiveLiveSosAlert(null);
        onRefreshAdmin();
      } else {
        showToast("Failed to cancel alert", "error");
      }
    } catch (e) {
      showToast("Network error cancelling alert", "error");
    }
  };

  const handleCreateVisitorPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName) return;

    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({
          visitorName: visName,
          phone: visPhone,
          vehicleNo: visVehicle,
          purpose: visPurpose,
          flatNo: simUser?.details?.flatNo || "N/A",
          residentName: simUser?.name || "Occupant"
        })
      });
      if (res.ok) {
        showToast("🎫 Pre-Approved Visitor QR pass generated!", "success");
        setShowAddVisitor(false);
        setVisName("");
        setVisPhone("");
        setVisVehicle("");
        setVisPurpose("Delivery");
        onRefreshAdmin();
      } else {
        showToast("Failed to create pass", "error");
      }
    } catch (e) {
      showToast("Server connection error", "error");
    }
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktTitle || !tktDesc) return;

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({
          title: tktTitle,
          description: tktDesc,
          category: tktCategory,
          priority: tktPriority
        })
      });
      if (res.ok) {
        showToast("🛠️ Support request dispatched to Admin!", "success");
        setShowAddTicket(false);
        setTktTitle("");
        setTktDesc("");
        onRefreshAdmin();
      } else {
        showToast("Failed to submit support request", "error");
      }
    } catch (e) {
      showToast("Server connection error", "error");
    }
  };

  const handleGuardWalkInCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardVisName || !guardVisFlat) return;

    try {
      const res = await fetch("/api/visitors/log-check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({
          visitorName: guardVisName,
          flatNo: guardVisFlat,
          phone: guardVisPhone,
          vehicleNo: guardVisVehicle,
          purpose: guardVisPurpose
        })
      });
      if (res.ok) {
        showToast("✅ Walk-in Visitor Checked-In successfully!", "success");
        setGuardVisName("");
        setGuardVisFlat("");
        setGuardVisPhone("");
        setGuardVisVehicle("");
        setGuardVisPurpose("Delivery");
        onRefreshAdmin();
      } else {
        showToast("Failed to check-in visitor", "error");
      }
    } catch (e) {
      showToast("Server connection failure", "error");
    }
  };

  const handleGuardPreApprovedCheckIn = async (id: string) => {
    try {
      const res = await fetch("/api/visitors/log-check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showToast("✅ Visitor Pass Checked-In!", "success");
        onRefreshAdmin();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  const handleGuardCheckOut = async (id: string) => {
    try {
      const res = await fetch(`/api/visitors/log-check-out/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${simToken}` }
      });
      if (res.ok) {
        showToast("👋 Visitor Checked-Out successfully!", "success");
        onRefreshAdmin();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  const handleGuardAcknowledgeSos = async (id: string, status: "Responding" | "Resolved") => {
    try {
      const res = await fetch(`/api/sos/acknowledge/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${simToken}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`SOS updated to ${status}!`, "success");
        onRefreshAdmin();
      }
    } catch (e) {
      showToast("Action failed", "error");
    }
  };

  // Helper lists filtered for current simulated resident
  const myVisitors = visitors.filter(v => v.residentId === simUser?.id || (simUser?.details?.flatNo && v.flatNo === simUser?.details?.flatNo));
  const myTickets = tickets.filter(t => t.residentId === simUser?.id);
  const activeSOS = sosAlerts.filter(s => s.status !== "Resolved");

  return (
    <div id="smartphone-wrapper" className="w-full max-w-[390px] h-[760px] bg-[#0c0c0e] rounded-[48px] border-8 border-[#1e1e24] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative select-none">
      
      {/* Physical speaker notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-[#1e1e24] rounded-b-2xl z-40 flex items-center justify-center">
        <div className="w-3.5 h-3.5 bg-black rounded-full mr-3.5 border-2 border-zinc-800"></div>
        <div className="w-12 h-1 bg-neutral-800 rounded-full"></div>
      </div>

      {/* Top Bar Indicators */}
      <div className="h-11 bg-[#0c0c0e] px-6 pt-6 flex justify-between items-center text-[10px] font-semibold text-zinc-400 z-30">
        <span>09:41 AM</span>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#10b981] animate-pulse" />
          <span>5G</span>
          <div className="w-4 h-2 border border-zinc-400 rounded-2xs relative flex items-center p-0.5">
            <div className="w-2.5 h-full bg-[#10b981] rounded-3xs"></div>
          </div>
        </div>
      </div>

      {/* Simulated Push Notification SMS Banner */}
      {simSmsAlert && (
        <div className="absolute top-12 left-3 right-3 bg-[#161618]/95 border-l-4 border-[#10b981] p-3 rounded-xl shadow-xl z-50 animate-bounce text-left">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-wider font-mono">SMS Gateway</span>
            <button onClick={() => setSimSmsAlert(null)} className="text-zinc-500 hover:text-white text-xs font-bold font-mono px-1">×</button>
          </div>
          <p className="text-[11px] text-zinc-200 font-medium mt-1 leading-normal">{simSmsAlert}</p>
        </div>
      )}

      {/* Simulated Sound/Emergency Red Screen Flash for security guard */}
      {simUser?.role === "Security" && activeSOS.length > 0 && (
        <div className="absolute bottom-16 left-3 right-3 bg-red-950/95 border-2 border-red-500 p-3 rounded-2xl shadow-2xl z-40 animate-pulse text-left space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>CRITICAL SOS PANIC SIREN</span>
          </div>
          <p className="text-[11px] text-white">
            Flat <strong>{activeSOS[0].flatNo}</strong> ({activeSOS[0].residentName}) has triggered a live medical/safety panic SOS!
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleGuardAcknowledgeSos(activeSOS[0].id, "Responding")}
              className="flex-1 py-1 bg-amber-500 text-black font-bold text-[10px] rounded"
            >
              Acknowledge Unit
            </button>
            <button
              onClick={() => handleGuardAcknowledgeSos(activeSOS[0].id, "Resolved")}
              className="flex-1 py-1 bg-green-500 text-black font-bold text-[10px] rounded"
            >
              Resolve Emergency
            </button>
          </div>
        </div>
      )}

      {/* Screen View Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col bg-[#121214] text-zinc-200">
        
        {/* VIEW A: LOGIN */}
        {simTab === "login" && (
          <div className="flex-1 flex flex-col justify-center space-y-5 text-left">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#10b981] to-emerald-400 rounded-2xl flex items-center justify-center font-bold text-black text-2xl mx-auto shadow-lg shadow-emerald-950/50">
                S
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Society360</h2>
              <p className="text-xs text-zinc-500">Gated Neighborhood Emergency &amp; Resident Grid</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Security Email</label>
                <input
                  type="email"
                  required
                  value={simLoginEmail}
                  onChange={(e) => setSimLoginEmail(e.target.value)}
                  placeholder="resident@society.com"
                  className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Secret Password</label>
                <input
                  type="password"
                  required
                  value={simLoginPassword}
                  onChange={(e) => setSimLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-bold rounded-xl text-xs shadow-md transition-all mt-1"
              >
                Connect Credentials
              </button>
            </form>

            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 block text-center uppercase tracking-wider font-bold">Instantly Demo Roles</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSimLoginEmail("resident@society.com");
                    setSimLoginPassword("resident123");
                  }}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-semibold text-white text-center flex items-center justify-center gap-1"
                >
                  🏡 Resident
                </button>
                <button
                  onClick={() => {
                    setSimLoginEmail("security@society.com");
                    setSimLoginPassword("security123");
                  }}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-semibold text-white text-center flex items-center justify-center gap-1"
                >
                  🛡️ Security
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setSimTab("register");
                  setSimRegStep(1);
                }}
                className="text-xs text-[#10b981] font-semibold hover:underline"
              >
                No account? Register Community Link
              </button>
            </div>
          </div>
        )}

        {/* VIEW B: REGISTER */}
        {simTab === "register" && (
          <div className="flex-1 flex flex-col justify-center space-y-4 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-[#10b981] font-bold">STEP {simRegStep} OF 2</span>
              <button onClick={() => setSimTab("login")} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Join Resident Safety Grid</h3>
              <p className="text-xs text-zinc-500">Provision your digital security companion account</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              {simRegStep === 1 ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={simRegName}
                      onChange={(e) => setSimRegName(e.target.value)}
                      placeholder="Jane Cooper"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={simRegEmail}
                      onChange={(e) => setSimRegEmail(e.target.value)}
                      placeholder="jane@mymail.com"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold">Verified Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={simRegPhone}
                      onChange={(e) => setSimRegPhone(e.target.value)}
                      placeholder="+1 555-0199"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold">Account Password</label>
                    <input
                      type="password"
                      required
                      value={simRegPassword}
                      onChange={(e) => setSimRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Community Role</label>
                    <select
                      value={simRegRole}
                      onChange={(e) => setSimRegRole(e.target.value as any)}
                      className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    >
                      <option value="Resident">Resident Occupant</option>
                      <option value="Guardian">Family Guardian Link</option>
                      <option value="Volunteer">Disaster Response Volunteer</option>
                      <option value="Security">Security Guard</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#10b981] text-black font-bold rounded-xl text-xs mt-1 shadow-md"
                  >
                    Continue to Specific Details
                  </button>
                </>
              ) : (
                <>
                  {simRegRole === "Resident" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Select Society</label>
                        <select
                          required
                          value={simRegSocietyId}
                          onChange={(e) => setSimRegSocietyId(e.target.value)}
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="">-- Choose Gated Society --</option>
                          {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Select Tower Block</label>
                        <select
                          required
                          value={simRegBlockId}
                          onChange={(e) => setSimRegBlockId(e.target.value)}
                          disabled={!simRegSocietyId}
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-40"
                        >
                          <option value="">-- Choose Tower Block --</option>
                          {simBlocksList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold">Apartment / Flat Unit No</label>
                        <input
                          type="text"
                          required
                          value={simRegFlatNo}
                          onChange={(e) => setSimRegFlatNo(e.target.value)}
                          placeholder="e.g. Apt 302-B"
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>
                    </div>
                  )}

                  {simRegRole === "Guardian" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold">Primary Resident Name</label>
                        <input
                          type="text"
                          required
                          value={simRegResidentName}
                          onChange={(e) => setSimRegResidentName(e.target.value)}
                          placeholder="Sarah Connor"
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Relationship Link</label>
                        <select
                          value={simRegRelationship}
                          onChange={(e) => setSimRegRelationship(e.target.value)}
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="Spouse">Spouse / Partner</option>
                          <option value="Parent">Parent</option>
                          <option value="Child">Child</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Other">Extended Family</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold">Resident Emergency Phone</label>
                        <input
                          type="tel"
                          required
                          value={simRegEmergencyContact}
                          onChange={(e) => setSimRegEmergencyContact(e.target.value)}
                          placeholder="+1 555-9872"
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>
                    </div>
                  )}

                  {simRegRole === "Volunteer" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Select Certified Safety Skills</label>
                        <div className="space-y-1 bg-[#161618] border border-zinc-800 p-2 rounded-xl">
                          {["First Aid & CPR", "Disaster Response", "Fire Marshall trained", "Senior Care Support"].map(sk => (
                            <label key={sk} className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={simRegSkills.includes(sk)}
                                onChange={(e) => {
                                  if (e.target.checked) setSimRegSkills([...simRegSkills, sk]);
                                  else setSimRegSkills(simRegSkills.filter(s => s !== sk));
                                }}
                                className="accent-[#10b981]"
                              />
                              <span>{sk}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Shift Availability</label>
                        <select
                          value={simRegAvailability}
                          onChange={(e) => setSimRegAvailability(e.target.value)}
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="Morning">Morning Shifts</option>
                          <option value="Afternoon">Afternoon Shifts</option>
                          <option value="Evening">Evening Shifts</option>
                          <option value="Anytime">24/7 Call Responder</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {simRegRole === "Security" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Gate Assignment Location</label>
                        <select
                          value={simRegGateNumber}
                          onChange={(e) => setSimRegGateNumber(e.target.value)}
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="Gate 1 (Main Entrance)">Gate 1 (Main Entrance)</option>
                          <option value="Gate 2 (North Garden)">Gate 2 (North Garden)</option>
                          <option value="Gate 3 (Service Entry)">Gate 3 (Service Entry)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Assigned Shift</label>
                        <select
                          value={simRegShift}
                          onChange={(e) => setSimRegShift(e.target.value)}
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="Day">Day Shift (06:00 - 18:00)</option>
                          <option value="Night">Night Shift (18:00 - 06:00)</option>
                          <option value="Rotational">Rotational Flex Shift</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold">Tower Patrol Range</label>
                        <input
                          type="text"
                          value={simRegAssignedTower}
                          onChange={(e) => setSimRegAssignedTower(e.target.value)}
                          placeholder="e.g. Tower A &amp; B patrol"
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setSimRegStep(1)}
                      className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-semibold rounded-xl text-xs"
                    >
                      Go Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-bold rounded-xl text-xs"
                    >
                      Activate Grid
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        )}

        {/* VIEW C: OTP VERIFY */}
        {simTab === "verify" && (
          <div className="flex-1 flex flex-col justify-center space-y-4 text-left">
            <div className="text-center space-y-1">
              <span className="text-[#10b981] text-xs font-bold font-mono tracking-widest uppercase">DISPATCHING CODE</span>
              <h3 className="text-base font-bold text-white">Enter SMS OTP Code</h3>
              <p className="text-xs text-zinc-500">
                A simulated verification code was sent to <strong className="text-white">{simUser?.phone}</strong>
              </p>
            </div>

            {simLastDevOtp && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold block">Terminal OTP Bypass:</span>
                <p className="text-xs text-zinc-300 font-mono leading-tight">
                  Dispatched code: <strong className="text-white bg-black/50 px-1.5 py-0.5 rounded text-xs">{simLastDevOtp}</strong>
                </p>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                value={simOtpInput}
                onChange={(e) => setSimOtpInput(e.target.value)}
                placeholder="6-digit OTP code"
                className="w-full text-center tracking-[0.25em] font-mono text-lg bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-[#10b981]"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-[#10b981] text-black font-bold rounded-xl text-xs shadow-md"
              >
                Verify &amp; Authenticate Link
              </button>
            </form>

            <button
              onClick={handleLogout}
              className="text-xs text-zinc-500 hover:text-white text-center block mx-auto pt-2"
            >
              Abort verification &amp; clear session
            </button>
          </div>
        )}

        {/* VIEW D: HOME DASHBOARD */}
        {simTab === "home" && simUser && (
          <div className="flex-1 flex flex-col justify-between text-left space-y-3">
            
            {/* Companion App mini header */}
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Connected Profile</span>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {simUser.name}
                </h4>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                simUser.role === "Resident" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/10" :
                simUser.role === "Security" ? "bg-cyan-950/40 text-cyan-400 border border-cyan-500/10" :
                simUser.role === "Volunteer" ? "bg-amber-950/40 text-amber-400 border border-amber-500/10" :
                "bg-blue-950/40 text-blue-400 border border-blue-500/10"
              }`}>
                {simUser.role}
              </span>
            </div>

            {/* Day 5 Resident Onboarding Profile Setup Screen */}
            {simUser.role === "Resident" && (!simUser.details?.societyId || !simUser.details?.flatNo) ? (
              <div className="flex-1 flex flex-col justify-center px-4 space-y-4 my-2 text-left">
                <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-full border border-[#10b981]/20 w-12 h-12 flex items-center justify-center mx-auto animate-pulse">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1 text-center">
                  <h4 className="font-extrabold text-white text-sm">Society Profile Onboarding</h4>
                  <p className="text-xs text-zinc-400">
                    Select your gated society and tower/flat unit to associate your mobile device.
                  </p>
                </div>

                <form onSubmit={handleSaveProfileMapping} className="space-y-3 bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Gated Society</label>
                    <select
                      value={profileSocId}
                      onChange={(e) => {
                        setProfileSocId(e.target.value);
                        setProfileBlkId("");
                      }}
                      className="w-full bg-[#161618] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    >
                      <option value="">-- Choose Society --</option>
                      {societies.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Tower / Block</label>
                    <select
                      value={profileBlkId}
                      onChange={(e) => setProfileBlkId(e.target.value)}
                      disabled={!profileSocId}
                      className="w-full bg-[#161618] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#10b981] disabled:opacity-40"
                    >
                      <option value="">-- Choose Tower --</option>
                      {simBlocksList.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Flat Unit No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 405-A"
                      value={profileFlatNo}
                      onChange={(e) => setProfileFlatNo(e.target.value)}
                      className="w-full bg-[#161618] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Submit Association Setup
                  </button>
                </form>
              </div>
            ) : !simUser.isApproved ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center px-4 space-y-4 my-2">
                <div className={`p-3 rounded-full border ${
                  simUser.details?.approvalStatus === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  <Clock className={`w-8 h-8 ${simUser.details?.approvalStatus !== "Rejected" ? "animate-spin-slow" : ""}`} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">
                    {simUser.details?.approvalStatus === "Rejected" ? "Profile Authorization Rejected" : "Profile Authorization Pending"}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-normal">
                    {simUser.details?.approvalStatus === "Rejected" ? (
                      `Hello ${simUser.name}, the society administrator has rejected your flat mapping request. Please contact safety admin to verify.`
                    ) : (
                      `Hello ${simUser.name}, your credentials and mapping details have been logged. Awaiting society administrator approval.`
                    )}
                  </p>
                </div>

                {simUser.role === "Resident" && (
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-[11px] font-mono text-zinc-300 text-left space-y-1 w-full">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Society:</span>
                      <span className="text-white font-bold">{societies.find(s => s.id === simUser.details?.societyId)?.name || "Associated"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tower Block:</span>
                      <span className="text-white font-bold">{simBlocksList.find(b => b.id === simUser.details?.blockId)?.name || simUser.details?.blockId || "Associated"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Flat Unit:</span>
                      <span className="text-[#10b981] font-bold">{simUser.details?.flatNo || "Pending"}</span>
                    </div>
                  </div>
                )}

                <div className="text-[10px] bg-[#161618] border border-zinc-850 p-3 rounded-xl text-zinc-400 text-left">
                  💡 <strong>To authorize instantly:</strong> Click on the <strong>Resident Approvals &amp; Flat Mapping</strong> tab in the main Admin View on the left, and approve <strong>{simUser.name}</strong>!
                </div>
              </div>
            ) : (
              
              /* Approved screens based on role */
              <div className="flex-1 flex flex-col space-y-3 overflow-y-auto">
                
                {/* ROLE: RESIDENT OR GUARDIAN - Tabs navigation */}
                {simUser.role !== "Security" && simUser.role !== "Volunteer" && (
                  <>
                    {/* Day 8 Multi-Step Location Capture & SOS Message Creator */}
                    <div className="p-3 bg-gradient-to-b from-[#18181b] to-black/85 border border-red-500/15 rounded-2xl space-y-3 shadow-lg text-left">
                      
                      {/* Step Header */}
                      <div className="flex justify-between items-center pb-1.5 border-b border-zinc-800/60">
                        <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-[11px] uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-red-500" />
                          <span>
                            {sosWizardStep === "idle" && "SOS Security trigger"}
                            {sosWizardStep === "capture-location" && "Step 1: GPS Triangulation"}
                            {sosWizardStep === "add-message" && "Step 2: Emergency details"}
                            {sosWizardStep === "review" && "Step 3: Confirm distress"}
                            {sosWizardStep === "tracking" && "🚨 Active Distress Tracking"}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono font-semibold text-zinc-500 uppercase">
                          {sosWizardStep !== "idle" && sosWizardStep !== "tracking" && `${["capture-location", "add-message", "review"].indexOf(sosWizardStep) + 1} of 3`}
                          {sosWizardStep === "tracking" && "Live Dispatch"}
                        </span>
                      </div>

                      {/* STEP 0: IDLE */}
                      {sosWizardStep === "idle" && (
                        <div className="space-y-3.5 text-center py-4">
                          <p className="text-[10px] text-zinc-400 leading-relaxed px-1">
                            Sends high-priority distress coordinates, triggers patrol dispatch, alerts neighborhood responders and emergency contacts.
                          </p>
                          
                          {/* Prominent Circular One-Tap SOS Button */}
                          <div className="relative flex justify-center items-center my-5">
                            {/* Radiating circles */}
                            <div className="absolute w-24 h-24 bg-red-600/10 rounded-full animate-ping"></div>
                            <div className="absolute w-16 h-16 bg-red-600/20 rounded-full animate-ping" style={{ animationDelay: "0.5s" }}></div>
                            <button
                              type="button"
                              onClick={() => {
                                setSosWizardStep("capture-location");
                                handleCaptureLocation();
                              }}
                              className="relative z-10 w-20 h-20 bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 hover:scale-105 active:scale-95 transition-all text-white rounded-full flex flex-col justify-center items-center shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400"
                            >
                              <span className="font-extrabold text-sm tracking-widest text-shadow">SOS</span>
                              <span className="text-[7.5px] uppercase font-mono font-bold text-red-100 tracking-wider">ONE-TAP</span>
                            </button>
                          </div>

                          <span className="text-[8.5px] font-mono uppercase text-red-400 animate-pulse font-semibold">
                            ⚠️ In emergency, tap circle to initialize broadcast
                          </span>
                        </div>
                      )}

                      {/* STEP 1: CAPTURE LOCATION (GPS Triangulation & Map Preview) */}
                      {sosWizardStep === "capture-location" && (
                        <div className="space-y-3">
                          <p className="text-[10px] text-zinc-400 leading-relaxed">
                            Detecting physical GPS satellite coordinates of handset for responder route navigation.
                          </p>

                          {/* Dynamic SVG Map Preview container */}
                          <div className="relative w-full h-[120px] bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-inner">
                            {/* Grid overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:14px_14px]"></div>
                            
                            {/* Streets Vector */}
                            <svg className="absolute inset-0 w-full h-full text-zinc-800 opacity-40 stroke-current" strokeWidth="1.5">
                              <line x1="0" y1="35" x2="300" y2="35" />
                              <line x1="0" y1="85" x2="300" y2="85" />
                              <line x1="100" y1="0" x2="100" y2="150" />
                              <line x1="210" y1="0" x2="210" y2="150" />
                              <line x1="0" y1="10" x2="300" y2="110" strokeWidth="0.5" strokeDasharray="2,2" />
                              <circle cx="150" cy="60" r="25" fill="none" strokeWidth="0.75" strokeDasharray="3,3" />
                              <circle cx="150" cy="60" r="45" fill="none" strokeWidth="0.75" strokeDasharray="3,3" />
                            </svg>

                            {isCapturingLocation ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75">
                                <div className="relative flex items-center justify-center">
                                  <div className="absolute w-12 h-12 border border-red-500 rounded-full animate-ping opacity-75"></div>
                                  <Compass className="w-8 h-8 text-red-500 animate-spin" />
                                </div>
                                <span className="text-[8px] font-mono text-red-400 mt-2 tracking-widest animate-pulse uppercase">Pinging Handset GPS...</span>
                              </div>
                            ) : (
                              sosLat && sosLng && (
                                <div className="absolute inset-0">
                                  {/* Pulsing Beacon Blip */}
                                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                    <div className="absolute w-8 h-8 bg-red-500/25 border border-red-500/40 rounded-full animate-ping"></div>
                                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full border border-white flex items-center justify-center">
                                      <div className="w-1 h-1 bg-white rounded-full"></div>
                                    </div>
                                  </div>
                                  {/* GPS Info labels */}
                                  <div className="absolute bottom-1.5 left-2 bg-black/80 px-1.5 py-0.5 rounded border border-zinc-800 font-mono text-[7px] text-zinc-400">
                                    LAT: {sosLat}, LNG: {sosLng}
                                  </div>
                                  <div className="absolute top-1.5 right-2 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono text-[7px] text-emerald-400">
                                    LOCK: 3D SAT (±3m)
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          {sosLat && sosLng ? (
                            <div className="space-y-1.5">
                              <div className="p-2 bg-emerald-950/15 border border-emerald-500/20 rounded-xl">
                                <span className="text-[8px] text-emerald-400 uppercase block font-mono font-bold tracking-wider">Resolved Dispatch Address</span>
                                <p className="text-[10px] text-zinc-300 leading-snug mt-0.5">{sosAddress || "Locating emergency address..."}</p>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleCaptureLocation}
                              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-bold text-[9.5px] rounded-xl flex items-center justify-center gap-1.5 shadow"
                            >
                              <Compass className="w-3.5 h-3.5 text-zinc-400 animate-spin-slow" />
                              Re-Ping Handset Coordinates
                            </button>
                          )}

                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setSosWizardStep("idle")}
                              className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-[10px] rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!sosLat || isCapturingLocation}
                              onClick={() => setSosWizardStep("add-message")}
                              className={`flex-1 py-1.5 font-bold text-[10px] rounded-lg transition-all ${
                                sosLat ? "bg-red-600 hover:bg-red-500 text-white shadow" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                              }`}
                            >
                              Add Message &gt;
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: EMERGENCY DETAILS (Category Selection & Distress Message) */}
                      {sosWizardStep === "add-message" && (
                        <div className="space-y-3.5">
                          
                          {/* 4-Column Master Emergency Grid selection */}
                          <div className="space-y-1.5">
                            <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono tracking-wider block">Incident Category</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "HEALTH", name: "🩺 Medical", desc: "Cardiac, Stroke, Trauma", color: "border-emerald-500/20 bg-emerald-950/5 text-emerald-400 hover:bg-emerald-950/10", active: "border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500" },
                                { id: "FIRE", name: "🔥 Fire Hazard", desc: "Gas, Electric, Sparks", color: "border-orange-500/20 bg-orange-950/5 text-orange-400 hover:bg-orange-950/10", active: "border-orange-500 bg-orange-500/15 text-orange-300 ring-1 ring-orange-500" },
                                { id: "THEFT", name: "🚨 Intruder", desc: "Burglary, Break-in", color: "border-red-500/20 bg-red-950/5 text-red-400 hover:bg-red-950/10", active: "border-red-500 bg-red-500/15 text-red-300 ring-1 ring-red-500" },
                                { id: "OTHER", name: "⚠️ Utility Alert", desc: "Pipe Burst, Elevator", color: "border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:bg-zinc-900", active: "border-zinc-400 bg-zinc-800/50 text-white ring-1 ring-zinc-500" }
                              ].map((cat) => {
                                const isSelected = sosCategory === cat.id;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                      setSosCategory(cat.id as any);
                                      if (cat.id === "HEALTH" || cat.id === "FIRE") setSosPriority("CRITICAL");
                                      else if (cat.id === "THEFT") setSosPriority("HIGH");
                                      else setSosPriority("MEDIUM");
                                    }}
                                    className={`p-2 rounded-xl border text-left transition-all ${isSelected ? cat.active : cat.color}`}
                                  >
                                    <span className="font-bold text-[10px] block">{cat.name}</span>
                                    <span className="text-[7.5px] text-zinc-500 block leading-tight mt-0.5">{cat.desc}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="space-y-0.5">
                              <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono tracking-wider">Priority Level</label>
                              <select
                                value={sosPriority}
                                onChange={(e) => setSosPriority(e.target.value as any)}
                                className="w-full bg-[#161619] border border-zinc-800 rounded-lg px-2 py-1.5 text-[9.5px] text-white focus:border-red-500 focus:outline-none font-medium"
                              >
                                <option value="LOW">LOW SEVERITY</option>
                                <option value="MEDIUM">MEDIUM URGENCY</option>
                                <option value="HIGH">HIGH SEVERITY</option>
                                <option value="CRITICAL">🚨 CRITICAL LIFE SAFETY</option>
                              </select>
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono tracking-wider">Dispatch Target</label>
                              <div className="w-full bg-[#161619] border border-zinc-800 rounded-lg px-2 py-1.5 text-[9.5px] text-zinc-400 font-mono font-bold truncate">
                                {simUser?.details?.flatNo || "My Flat"}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[8px] text-zinc-500 font-bold uppercase font-mono tracking-wider">Distress Explanation</label>
                              <button
                                type="button"
                                onClick={handleVoiceTranscribe}
                                disabled={isTranscribingVoice}
                                className="text-[8.5px] text-red-400 font-extrabold hover:text-red-300 flex items-center gap-0.5"
                              >
                                <Mic className="w-2.5 h-2.5 animate-pulse" />
                                {isTranscribingVoice ? "Recording..." : "🎤 AI Voice Dispatch"}
                              </button>
                            </div>

                            {isTranscribingVoice ? (
                              <div className="py-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col items-center justify-center space-y-1.5">
                                <div className="flex items-center gap-1">
                                  <div className="w-1 h-3 bg-red-500 rounded animate-bounce"></div>
                                  <div className="w-1.5 h-5 bg-red-500 rounded animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                                  <div className="w-1 h-4 bg-red-500 rounded animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                                  <div className="w-1 h-2 bg-red-500 rounded animate-bounce" style={{ animationDelay: "0.45s" }}></div>
                                  <div className="w-1.5 h-6 bg-rose-500 rounded animate-bounce" style={{ animationDelay: "0.6s" }}></div>
                                </div>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Transcribing panic distress statement with Gemini...</span>
                              </div>
                            ) : (
                              <textarea
                                value={sosMessage}
                                onChange={(e) => setSosMessage(e.target.value)}
                                rows={2}
                                placeholder="Describe the crisis or tap 'AI Voice Dispatch' above to transcribe a voice call."
                                className="w-full bg-[#161619] border border-zinc-800 rounded-xl p-2 text-[10px] text-white focus:outline-none focus:border-red-500 placeholder:text-zinc-600 leading-snug"
                              />
                            )}
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setSosWizardStep("capture-location")}
                              className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-[10px] rounded-lg"
                            >
                              &lt; Back
                            </button>
                            <button
                              type="button"
                              disabled={isTranscribingVoice}
                              onClick={() => setSosWizardStep("review")}
                              className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded-lg shadow"
                            >
                              Review distress &gt;
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: REVIEW & CONFIRM (Verification screen before broadcast) */}
                      {sosWizardStep === "review" && (
                        <div className="space-y-3">
                          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] text-red-400 leading-snug font-medium flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                            <div>
                              <strong>Security Dispatch Agreement:</strong> Pressing broadcast alerts security desks, patrol guards, nearby resident volunteers, and emergency contacts instantly.
                            </div>
                          </div>

                          <div className="bg-[#121214] border border-zinc-850 p-3 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between text-[11px] font-bold border-b border-zinc-800/55 pb-1.5">
                              <span className="text-zinc-400 uppercase tracking-wider font-mono text-[8.5px]">Incident Classification</span>
                              <span className="text-red-500 font-mono font-extrabold tracking-wide">{sosCategory} • {sosPriority}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-[8px] text-zinc-500 uppercase block font-mono">My Residence</span>
                                <span className="text-white font-semibold">{simUser?.details?.flatNo || "Not Selected"}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-zinc-500 uppercase block font-mono">My Contact No</span>
                                <span className="text-zinc-300 font-semibold">{simUser?.phone || "Unknown"}</span>
                              </div>
                            </div>
                            <div className="space-y-0.5 pt-1">
                              <span className="text-[8px] text-zinc-500 uppercase block font-mono">Triangulated Address</span>
                              <span className="text-[10px] text-zinc-300 block leading-tight">{sosAddress || "GPS location coordinates not resolved."}</span>
                            </div>
                            <div className="space-y-0.5 pt-1">
                              <span className="text-[8px] text-zinc-500 uppercase block font-mono">Distress Message Summary</span>
                              <p className="text-[10px] italic text-zinc-400 leading-relaxed bg-[#0b0b0c] p-2 border border-zinc-800 rounded-lg">
                                "{sosMessage || "Immediate safety/medical dispatch requested."}"
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSosWizardStep("add-message")}
                              className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-[10px] rounded-lg"
                            >
                              &lt; Edit
                            </button>
                            <button
                              type="button"
                              onClick={handleBroadcastSos}
                              className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10.5px] rounded-lg tracking-wider shadow animate-pulse flex items-center justify-center gap-1"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              BROADCAST SOS
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STATE 4: TRACKING DISPATCH */}
                      {sosWizardStep === "tracking" && activeLiveSosAlert && (
                        <div className="space-y-3">
                          
                          {/* Live Progress Tracker */}
                          <div className="p-2.5 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-mono font-bold animate-pulse text-[8px]">EMERGENCY ACTIVE</span>
                              <span className="text-[9px] text-zinc-400 font-mono">{activeLiveSosAlert.category} • {activeLiveSosAlert.priority}</span>
                            </div>

                            {/* Status Steps */}
                            <div className="grid grid-cols-3 gap-0.5 text-center text-[8.5px] font-bold">
                              <div className={`p-1 rounded-l-lg ${activeLiveSosAlert.status === "Active" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500"}`}>
                                Broadcast
                              </div>
                              <div className={`p-1 ${activeLiveSosAlert.status === "Responding" ? "bg-amber-600 text-white animate-pulse" : "bg-zinc-800 text-zinc-500"}`}>
                                Responding
                              </div>
                              <div className={`p-1 rounded-r-lg ${activeLiveSosAlert.status === "Resolved" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500"}`}>
                                Resolved
                              </div>
                            </div>

                            {activeLiveSosAlert.acknowledgedBy && (
                              <div className="text-[10px] text-zinc-300 font-medium flex items-center gap-1 pt-1 justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                <span>Responder: <strong>{activeLiveSosAlert.acknowledgedBy}</strong> en route</span>
                              </div>
                            )}
                          </div>

                          {/* Live Messages/Updates Log Terminal */}
                          <div className="space-y-1.5">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase font-mono">Live Incident Log &amp; Responder Comments</span>
                            <div className="bg-[#0b0b0d] border border-zinc-800 rounded-xl p-2 h-[80px] overflow-y-auto space-y-1.5 text-[10px] font-mono text-zinc-300">
                              {(activeLiveSosAlert.updates || []).map((up: any, index: number) => (
                                <div key={up.id || index} className="border-b border-zinc-900 pb-1 last:border-0">
                                  <div className="flex justify-between text-[8px] text-zinc-500">
                                    <strong className="text-[#10b981]">{up.senderName}</strong>
                                    <span>{new Date(up.time).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-zinc-300 leading-tight mt-0.5">{up.message}</p>
                                </div>
                              ))}
                              {(activeLiveSosAlert.updates || []).length === 0 && (
                                <p className="text-zinc-600 text-center py-4">Waiting for responder logs...</p>
                              )}
                            </div>
                          </div>

                          {/* App Comment form */}
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={additionalSosComment}
                              onChange={(e) => setAdditionalSosComment(e.target.value)}
                              placeholder="Send additional update text..."
                              className="flex-1 bg-[#1c1c1f] border border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleSendSosComment}
                              className="bg-zinc-800 text-white px-2 py-1 rounded-lg text-[9px] font-bold"
                            >
                              Send
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleCancelActiveSos}
                            className="w-full py-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-red-400 hover:text-red-300 font-bold text-[10px] rounded-lg tracking-wider transition-all"
                          >
                            Cancel Distress Beacon
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Sub Tab Buttons */}
                    <div className="flex border-b border-zinc-800 p-0.5 bg-zinc-900/50 rounded-xl gap-0.5">
                      <button
                        onClick={() => setSimHomeTab("notices")}
                        className={`flex-1 py-1 text-[9px] font-bold rounded-lg ${simHomeTab === "notices" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
                      >
                        Bulletins
                      </button>
                      <button
                        onClick={() => setSimHomeTab("visitors")}
                        className={`flex-1 py-1 text-[9px] font-bold rounded-lg ${simHomeTab === "visitors" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
                      >
                        Visitors
                      </button>
                      <button
                        onClick={() => setSimHomeTab("tickets")}
                        className={`flex-1 py-1 text-[9px] font-bold rounded-lg ${simHomeTab === "tickets" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
                      >
                        Helpdesk
                      </button>
                      <button
                        onClick={() => setSimHomeTab("contacts")}
                        className={`flex-1 py-1 text-[9px] font-bold rounded-lg ${simHomeTab === "contacts" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
                      >
                        Guardians
                      </button>
                    </div>

                    {/* TAB CONTENT: NOTICES/BULLETINS */}
                    {simHomeTab === "notices" && (
                      <div className="space-y-2 flex-1 overflow-y-auto">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-500 font-bold block uppercase">Live Bulletins</span>
                          <span className="text-[9px] bg-emerald-950/30 text-emerald-400 px-1.5 py-0.5 rounded font-mono">{notices.length} active</span>
                        </div>
                        {notices.map(n => (
                          <div key={n.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{n.title}</span>
                              <span className={`text-[8px] font-bold px-1.5 rounded font-mono ${
                                n.category === "Security" ? "bg-red-500/10 text-red-400" :
                                n.category === "Maintenance" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-400"
                              }`}>{n.category}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-normal">{n.content}</p>
                            <span className="text-[8px] text-zinc-500 block text-right font-mono">{new Date(n.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TAB CONTENT: VISITORS (PRE-APPROVALS) */}
                    {simHomeTab === "visitors" && (
                      <div className="space-y-2 flex-1 overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase block">My Visitor Passes</span>
                          <button
                            onClick={() => setShowAddVisitor(!showAddVisitor)}
                            className="text-[9px] bg-[#10b981] text-black px-2 py-0.5 rounded font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3 animate-pulse" />
                            Pre-Approve
                          </button>
                        </div>

                        {showAddVisitor ? (
                          <form onSubmit={handleCreateVisitorPass} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl space-y-2.5 text-xs">
                            <h4 className="font-bold text-white text-[11px]">Generate QR Pre-Approval</h4>
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                required
                                value={visName}
                                onChange={(e) => setVisName(e.target.value)}
                                placeholder="Visitor Name"
                                className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                              />
                              <input
                                type="text"
                                value={visPhone}
                                onChange={(e) => setVisPhone(e.target.value)}
                                placeholder="Phone number"
                                className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                              />
                              <input
                                type="text"
                                value={visVehicle}
                                onChange={(e) => setVisVehicle(e.target.value)}
                                placeholder="Vehicle No (optional)"
                                className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                              />
                              <select
                                value={visPurpose}
                                onChange={(e) => setVisPurpose(e.target.value)}
                                className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                              >
                                <option value="Delivery">Delivery / Courier</option>
                                <option value="Guest">Social Guest</option>
                                <option value="Repair">Maintenance / Utility</option>
                              </select>
                            </div>
                            <div className="flex justify-end gap-1 text-[10px] pt-1">
                              <button type="button" onClick={() => setShowAddVisitor(false)} className="text-zinc-500 hover:text-white px-2">Cancel</button>
                              <button type="submit" className="bg-[#10b981] text-black font-semibold rounded px-2.5 py-1">Generate Pass</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-2 flex-1 overflow-y-auto relative">
                            {/* Tap-to-view Full Screen Digital Pass Overlay */}
                            {selectedPass && (
                              <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-4 rounded-xl">
                                <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-[280px] overflow-hidden shadow-2xl text-center">
                                  {/* Ticket Header */}
                                  <div className="bg-[#10b981] p-2.5 text-black text-center relative">
                                    <h4 className="font-extrabold text-[10px] tracking-wider uppercase">GATED VISITOR ACCESS</h4>
                                    <p className="text-[8px] font-mono font-bold">PRE-APPROVED PASS</p>
                                    
                                    {/* Left half-circle ticket cutout */}
                                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-zinc-950 rounded-full border border-zinc-850"></div>
                                    {/* Right half-circle ticket cutout */}
                                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-zinc-950 rounded-full border border-zinc-850"></div>
                                  </div>

                                  {/* Ticket Body */}
                                  <div className="p-4 space-y-3 bg-zinc-950/70">
                                    <div className="space-y-0.5">
                                      <span className="text-[7.5px] text-zinc-500 uppercase font-mono block">Authorized Guest</span>
                                      <strong className="text-white text-sm font-black block leading-none">{selectedPass.visitorName}</strong>
                                    </div>

                                    {/* Dotted divider line */}
                                    <div className="border-t border-dashed border-zinc-800 my-1"></div>

                                    <div className="grid grid-cols-2 gap-1.5 text-[8.5px] text-zinc-400 text-left">
                                      <div>
                                        <span className="text-[7px] text-zinc-600 uppercase font-mono block">Apartment Unit</span>
                                        <span className="text-zinc-200 font-semibold">Flat {selectedPass.flatNo}</span>
                                      </div>
                                      <div>
                                        <span className="text-[7px] text-zinc-600 uppercase font-mono block">Vehicle Number</span>
                                        <span className="text-zinc-200 font-mono font-semibold">{selectedPass.vehicleNo}</span>
                                      </div>
                                      <div>
                                        <span className="text-[7px] text-zinc-600 uppercase font-mono block">Purpose of Visit</span>
                                        <span className="text-zinc-200 font-semibold">{selectedPass.purpose}</span>
                                      </div>
                                      <div>
                                        <span className="text-[7px] text-zinc-600 uppercase font-mono block">Contact Phone</span>
                                        <span className="text-zinc-200 font-semibold truncate block">{selectedPass.phone || "None"}</span>
                                      </div>
                                    </div>

                                    {/* Simulated Barcode / QR Box */}
                                    <div className="bg-white p-2 rounded-xl inline-block shadow-inner mx-auto my-1">
                                      <div className="relative w-24 h-24 bg-white flex flex-col justify-between p-1 border border-zinc-200 rounded">
                                        <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
                                          <rect x="0" y="0" width="25" height="25" />
                                          <rect x="2" y="2" width="21" height="21" fill="white" />
                                          <rect x="6" y="6" width="13" height="13" />

                                          <rect x="75" y="0" width="25" height="25" />
                                          <rect x="77" y="2" width="21" height="21" fill="white" />
                                          <rect x="81" y="6" width="13" height="13" />

                                          <rect x="0" y="75" width="25" height="25" />
                                          <rect x="2" y="77" width="21" height="21" fill="white" />
                                          <rect x="6" y="81" width="13" height="13" />

                                          <rect x="35" y="5" width="8" height="8" />
                                          <rect x="50" y="15" width="8" height="8" />
                                          <rect x="35" y="35" width="12" height="12" />
                                          <rect x="60" y="45" width="8" height="15" />
                                          <rect x="15" y="45" width="15" height="8" />
                                          <rect x="45" y="60" width="12" height="8" />
                                          <rect x="75" y="75" width="15" height="15" />
                                          <rect x="35" y="80" width="8" height="12" />
                                        </svg>
                                      </div>
                                      <span className="font-mono text-[8px] text-zinc-900 font-extrabold tracking-wider block mt-1">
                                        {selectedPass.qrCodeValue}
                                      </span>
                                    </div>

                                    <div className="space-y-0.5 pt-1">
                                      <span className="text-[7.5px] font-mono text-zinc-500 block">Status: {selectedPass.status}</span>
                                      <p className="text-[8px] text-zinc-400">
                                        Provide this code to the security guard or scanner at Gated Security desks.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Close Button */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPass(null)}
                                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-[10px] border-t border-zinc-800"
                                  >
                                    Close Digital Pass
                                  </button>
                                </div>
                              </div>
                            )}

                            {myVisitors.map(v => (
                              <div
                                key={v.id}
                                onClick={() => setSelectedPass(v)}
                                className="p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl space-y-2 text-xs transition-all cursor-pointer relative overflow-hidden group"
                              >
                                {/* Ticket cutout notch left/right decoration */}
                                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-950 rounded-full border border-zinc-850"></div>
                                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-950 rounded-full border border-zinc-850"></div>

                                <div className="flex justify-between items-center px-1">
                                  <strong className="text-white font-bold group-hover:text-[#10b981] transition-colors">{v.visitorName}</strong>
                                  <span className={`text-[8px] font-bold px-1.5 rounded-full font-mono ${
                                    v.status === "Pre-Approved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                    v.status === "Checked-In" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse" :
                                    "bg-zinc-800 text-zinc-500"
                                  }`}>{v.status}</span>
                                </div>

                                <div className="text-[10px] text-zinc-400 flex items-center justify-between px-1">
                                  <span className="truncate">Vehicle: {v.vehicleNo} | For: {v.purpose}</span>
                                  {v.status === "Pre-Approved" && (
                                    <span className="font-mono text-[8px] text-[#10b981] bg-[#10b981]/5 px-1 py-0.5 rounded flex items-center gap-0.5 border border-emerald-500/10 font-bold shrink-0">
                                      <QrCode className="w-2.5 h-2.5" />
                                      {v.qrCodeValue}
                                    </span>
                                  )}
                                </div>

                                {v.checkInTime && (
                                  <span className="text-[8px] text-zinc-500 block font-mono px-1">
                                    Checked-In: {new Date(v.checkInTime).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            ))}
                            {myVisitors.length === 0 && (
                              <div className="text-center py-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                <QrCode className="w-6 h-6 text-zinc-600 mx-auto mb-1" />
                                <p className="text-[10px] text-zinc-500">No pre-approved passes configured for Flat {simUser?.details?.flatNo}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB CONTENT: SUPPORT TICKETS HELPDESK */}
                    {simHomeTab === "tickets" && (
                      <div className="space-y-2 flex-1 overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase block">Maintenance Helpdesk</span>
                          <button
                            onClick={() => setShowAddTicket(!showAddTicket)}
                            className="text-[9px] bg-[#10b981] text-black px-2 py-0.5 rounded font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3 animate-pulse" />
                            File Request
                          </button>
                        </div>

                        {showAddTicket ? (
                          <form onSubmit={handleCreateSupportTicket} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl space-y-2.5 text-xs">
                            <h4 className="font-bold text-white text-[11px]">Submit Maintenance Complaint</h4>
                            <div className="space-y-2">
                              <input
                                type="text"
                                required
                                value={tktTitle}
                                onChange={(e) => setTktTitle(e.target.value)}
                                placeholder="Issue Title (e.g. Corridor Leak)"
                                className="w-full bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                              />
                              <textarea
                                required
                                rows={2}
                                value={tktDesc}
                                onChange={(e) => setTktDesc(e.target.value)}
                                placeholder="Provide description of the repair needed..."
                                className="w-full bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                              />
                              <div className="grid grid-cols-2 gap-1.5">
                                <select
                                  value={tktCategory}
                                  onChange={(e) => setTktCategory(e.target.value as any)}
                                  className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                                >
                                  <option value="Plumbing">Plumbing</option>
                                  <option value="Electrical">Electrical</option>
                                  <option value="Lift">Lift Issue</option>
                                  <option value="Security">Security Gate</option>
                                  <option value="Other">Other</option>
                                </select>
                                <select
                                  value={tktPriority}
                                  onChange={(e) => setTktPriority(e.target.value as any)}
                                  className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium Priority</option>
                                  <option value="High">Urgent / High</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1 text-[10px] pt-1">
                              <button type="button" onClick={() => setShowAddTicket(false)} className="text-zinc-500 hover:text-white px-2">Cancel</button>
                              <button type="submit" className="bg-[#10b981] text-black font-semibold rounded px-2.5 py-1">File Ticket</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-2 flex-1 overflow-y-auto">
                            {myTickets.map(t => (
                              <div key={t.id} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <strong className="text-white font-semibold">{t.title}</strong>
                                  <span className={`text-[8px] font-bold px-1.5 rounded-full font-mono ${
                                    t.status === "Open" ? "bg-blue-500/10 text-blue-400" :
                                    t.status === "In Progress" ? "bg-amber-500/10 text-amber-400 animate-pulse" :
                                    "bg-emerald-500/10 text-emerald-400"
                                  }`}>{t.status}</span>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-normal">{t.description}</p>
                                <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 pt-1">
                                  <span>Category: {t.category} | Priority: {t.priority}</span>
                                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                            {myTickets.length === 0 && (
                              <div className="text-center py-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                <FileText className="w-6 h-6 text-zinc-600 mx-auto mb-1" />
                                <p className="text-[10px] text-zinc-500">No complaints registered in helpdesk system.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {simHomeTab === "contacts" && (
                      <div className="space-y-3 flex-1 overflow-y-auto text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase block">Family Guardians</span>
                          <button
                            onClick={() => {
                              setEditingContactId("new");
                              setContactName("");
                              setContactPhone("");
                              setContactRelationship("Spouse");
                              setContactType("Primary");
                            }}
                            className="text-[10px] text-[#10b981] font-bold hover:underline"
                          >
                            + New Contact
                          </button>
                        </div>

                        {/* ADD/EDIT CONTACT FORM */}
                        {editingContactId && (
                          <form onSubmit={handleSaveEmergencyContact} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 text-xs">
                            <h5 className="font-bold text-white text-[11px] border-b border-zinc-800 pb-1">
                              {editingContactId === "new" ? "Add Safety Guardian" : "Edit Guardian Details"}
                            </h5>
                            <div className="space-y-2">
                              <div className="space-y-0.5">
                                <label className="text-[9px] text-zinc-500 font-bold uppercase">Name</label>
                                <input
                                  type="text"
                                  value={contactName}
                                  onChange={(e) => setContactName(e.target.value)}
                                  placeholder="Contact Name"
                                  className="w-full bg-[#161618] border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-[9px] text-zinc-500 font-bold uppercase">Phone Handset</label>
                                <input
                                  type="text"
                                  value={contactPhone}
                                  onChange={(e) => setContactPhone(e.target.value)}
                                  placeholder="+91 XXXXX XXXXX"
                                  className="w-full bg-[#161618] border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] text-zinc-500 font-bold uppercase">Relationship</label>
                                  <select
                                    value={contactRelationship}
                                    onChange={(e) => setContactRelationship(e.target.value)}
                                    className="w-full bg-[#161618] border border-zinc-800 rounded-lg p-1 text-[11px] text-white"
                                  >
                                    <option value="Spouse">Spouse</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Child">Child</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Doctor">Doctor</option>
                                  </select>
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] text-zinc-500 font-bold uppercase">Priority Type</label>
                                  <select
                                    value={contactType}
                                    onChange={(e) => setContactType(e.target.value as any)}
                                    className="w-full bg-[#161618] border border-zinc-800 rounded-lg p-1 text-[11px] text-white"
                                  >
                                    <option value="Primary">Primary Guardian</option>
                                    <option value="Secondary">Secondary Guardian</option>
                                    <option value="Other">Emergency Contact</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1 border-t border-zinc-800/60 mt-2">
                              <button
                                type="button"
                                onClick={() => setEditingContactId(null)}
                                className="text-zinc-400 hover:text-white px-2 py-0.5 text-[10px]"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="bg-[#10b981] text-black font-extrabold px-3 py-1 rounded-lg text-[10px]"
                              >
                                Save Contact
                              </button>
                            </div>
                          </form>
                        )}

                        {/* LIST EMERGENCY CONTACTS */}
                        <div className="space-y-2">
                          {emergencyContacts.map(c => (
                            <div key={c.id} className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl space-y-2.5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-extrabold text-white text-xs">{c.name}</h6>
                                  <span className="text-[10px] text-zinc-500 block">{c.relationship} • {c.phone}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    c.type === "Primary" ? "bg-red-950/40 text-red-400" :
                                    c.type === "Secondary" ? "bg-amber-950/40 text-amber-400" :
                                    "bg-zinc-800 text-zinc-300"
                                  }`}>
                                    {c.type} Guardian
                                  </span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                                    c.isVerified ? "bg-emerald-950/40 text-emerald-400" : "bg-orange-950/40 text-orange-400"
                                  }`}>
                                    {c.isVerified ? "Verified" : "Unverified"}
                                  </span>
                                </div>
                              </div>

                              {/* VERIFICATION INTERACTIVE TERMINAL */}
                              {verifyingContactId === c.id ? (
                                <form onSubmit={handleConfirmContactVerify} className="p-2 bg-black/50 border border-orange-500/10 rounded-lg space-y-1.5 mt-1">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-orange-400 font-bold">Simulated OTP Sent:</span>
                                    <span className="font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.2 rounded font-extrabold">{verificationOtpCode}</span>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="6-digit OTP code"
                                      value={verificationOtpInput}
                                      onChange={(e) => setVerificationOtpInput(e.target.value)}
                                      className="flex-1 bg-[#141416] border border-zinc-800 rounded px-2 py-0.5 text-xs text-white font-mono text-center"
                                    />
                                    <button
                                      type="submit"
                                      className="bg-[#10b981] text-black text-[10px] font-bold px-2 rounded"
                                    >
                                      Verify
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                !c.isVerified && (
                                  <button
                                    onClick={() => handleTriggerContactVerify(c.id)}
                                    className="w-full py-1 bg-orange-950/20 text-orange-400 hover:bg-orange-950/40 border border-orange-500/20 text-[10px] font-bold rounded-lg transition-all"
                                  >
                                    Send Verification OTP SMS
                                  </button>
                                )
                              )}

                              {/* EDIT / DELETE CONTROL ROW */}
                              <div className="flex justify-end gap-2 text-[10px] text-zinc-500 pt-1 border-t border-zinc-850/30">
                                <button
                                  onClick={() => {
                                    setEditingContactId(c.id);
                                    setContactName(c.name);
                                    setContactPhone(c.phone);
                                    setContactRelationship(c.relationship);
                                    setContactType(c.type);
                                  }}
                                  className="hover:text-white"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEmergencyContact(c.id)}
                                  className="hover:text-red-400"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}

                          {emergencyContacts.length === 0 && (
                            <div className="text-center py-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                              <Users className="w-6 h-6 text-zinc-600 mx-auto mb-1" />
                              <p className="text-[10px] text-zinc-500">No emergency contacts or guardians configured.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ROLE: GUARDIAN AND VOLUNTEER EMERGENCY OVERLAYS */}
                {simUser.role === "Guardian" && simHomeTab === "notices" && (
                  <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs space-y-2">
                    <span className="font-bold text-white flex items-center gap-1">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Family Safety Link
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      You are actively monitoring **{simUser.details?.residentName}** ({simUser.details?.relationship}).
                    </p>
                    <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 uppercase block">Registered Emergency Phone:</span>
                      <strong className="text-[#10b981] font-mono font-bold block">{simUser.details?.emergencyContact}</strong>
                    </div>
                  </div>
                )}

                {simUser.role === "Volunteer" && (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-[#10b981]/5 border border-[#10b981]/20 rounded-2xl text-xs space-y-2">
                      <span className="font-bold text-[#10b981] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Active Safety Responder Panel
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        You will receive real-time notices and dispatch updates.
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-black/40 border border-zinc-800 p-2 rounded-xl">
                        <div>
                          <span className="text-zinc-500 block">Shift Availability:</span>
                          <strong className="text-white block">{simUser.details?.availability}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Skills Stack:</span>
                          <span className="text-amber-400 font-bold block truncate">{simUser.details?.skills?.slice(0, 2).join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Community SOS Alerts</span>
                      {activeSOS.length > 0 ? (
                        activeSOS.map(a => (
                          <div key={a.id} className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between items-center text-red-400 font-bold">
                              <span>ACTIVE HAZARD</span>
                              <span className="animate-pulse">●</span>
                            </div>
                            <p className="text-zinc-300">
                              Flat <strong>{a.flatNo}</strong> ({a.residentName}) reported safety/medical emergency!
                            </p>
                            <span className="text-[9px] text-zinc-500 block font-mono">{new Date(a.time).toLocaleTimeString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                          <CheckCircle2 className="w-6 h-6 text-[#10b981] mx-auto mb-1" />
                          <p className="text-[10px] text-zinc-500">Gated community safe. No active emergencies.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ROLE: SECURITY GUARD VIEW */}
                {simUser.role === "Security" && (
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    
                    {/* Guard Location Header */}
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs space-y-1 text-zinc-300">
                      <span className="text-[9px] text-zinc-500 uppercase block font-bold">Duty Details</span>
                      <p className="text-white font-bold">{simUser.details?.gateNumber || "Gate 1"}</p>
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Shift: {simUser.details?.shift} Shift</span>
                        <span>Patrols: {simUser.details?.assignedTower || "Tower A & B"}</span>
                      </div>
                    </div>

                    {/* Interactive Visitors Gate Logging */}
                    <div className="space-y-2.5 flex-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Gate Visitor Entry Logger</span>
                      
                      {/* Sub tab navigation */}
                      <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[10px] font-bold">
                        <button
                          onClick={() => setSimHomeTab("guard")}
                          className={`py-1 rounded-lg ${simHomeTab === "guard" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
                        >
                          Manual walk-in
                        </button>
                        <button
                          onClick={() => setSimHomeTab("visitors")}
                          className={`py-1 rounded-lg ${simHomeTab === "visitors" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
                        >
                          Scan QR Passes
                        </button>
                      </div>

                      {/* Manual Entry Form */}
                      {simHomeTab === "guard" && (
                        <form onSubmit={handleGuardWalkInCheckIn} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl space-y-2 text-xs">
                          <h4 className="font-bold text-white text-[11px]">Log Walk-in Guest</h4>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              required
                              value={guardVisName}
                              onChange={(e) => setGuardVisName(e.target.value)}
                              placeholder="Guest Name"
                              className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                            />
                            <input
                              type="text"
                              required
                              value={guardVisFlat}
                              onChange={(e) => setGuardVisFlat(e.target.value)}
                              placeholder="Apartment Unit"
                              className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                            />
                            <input
                              type="text"
                              value={guardVisPhone}
                              onChange={(e) => setGuardVisPhone(e.target.value)}
                              placeholder="Phone Contact"
                              className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                            />
                            <select
                              value={guardVisPurpose}
                              onChange={(e) => setGuardVisPurpose(e.target.value)}
                              className="bg-[#1c1c1f] border border-zinc-800 rounded px-2 py-1 text-[10px] text-white"
                            >
                              <option value="Delivery">Delivery / Food</option>
                              <option value="Guest">Social Visit</option>
                              <option value="Repair">Maintenance Contractor</option>
                            </select>
                          </div>
                          <button
                            type="submit"
                            className="w-full py-1.5 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-semibold rounded text-[10px] mt-1 shadow"
                          >
                            Submit Gate Authorization
                          </button>
                        </form>
                      )}

                      {/* QR Passes listing checkin/checkout */}
                      {simHomeTab === "visitors" && (
                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[190px]">
                          {visitors.map(v => (
                            <div key={v.id} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1.5 text-[11px] text-zinc-300">
                              <div className="flex justify-between items-center">
                                <strong>{v.visitorName}</strong>
                                <span className={`text-[8px] font-bold px-1.5 rounded-full ${
                                  v.status === "Pre-Approved" ? "bg-blue-500/10 text-blue-400" :
                                  v.status === "Checked-In" ? "bg-emerald-500/10 text-emerald-400 animate-pulse" :
                                  "bg-zinc-800 text-zinc-500"
                                }`}>{v.status}</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 leading-none">
                                Dest: Flat {v.flatNo} ({v.residentName}) • {v.purpose}
                              </p>
                              {v.status === "Pre-Approved" && (
                                <button
                                  onClick={() => handleGuardPreApprovedCheckIn(v.id)}
                                  className="w-full py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded text-[9px]"
                                >
                                  Authorize QR Code Entry
                                </button>
                              )}
                              {v.status === "Checked-In" && (
                                <button
                                  onClick={() => handleGuardCheckOut(v.id)}
                                  className="w-full py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded text-[9px]"
                                >
                                  Log Gate Check-Out
                                </button>
                              )}
                            </div>
                          ))}
                          {visitors.length === 0 && (
                            <p className="text-[10px] text-zinc-500 text-center py-4">No active visitor passes found.</p>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-md transition-all mt-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Companion App
            </button>
          </div>
        )}

      </div>

      {/* iOS Physical-look Home indicator bar */}
      <div className="h-6 bg-[#0c0c0e] flex justify-center items-center pb-2.5 z-30">
        <div className="w-32 h-1 bg-zinc-700 rounded-full"></div>
      </div>

    </div>
  );
}
