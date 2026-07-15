export type UserRole = "Admin" | "Resident" | "Guardian" | "Volunteer" | "Security";

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  phone: string;
  verified: boolean;
  otp?: string;
  isApproved: boolean;
  createdAt: string;
  details: {
    approvalStatus?: "Pending" | "Approved" | "Rejected";
    emergencyContacts?: any[];
    // Resident specific
    societyId?: string;
    blockId?: string;
    flatId?: string;
    flatNo?: string;
    // Guardian specific
    residentId?: string;
    residentName?: string;
    relationship?: string;
    emergencyContact?: string;
    // Volunteer specific
    skills?: string[];
    availability?: string; // "Morning" | "Afternoon" | "Evening" | "Anytime"
    // Security specific
    gateNumber?: string;
    shift?: string; // "Day" | "Night" | "Rotational"
    assignedTower?: string;
  };
}

export interface Society {
  id: string;
  name: string;
  address: string;
  description: string;
  createdAt: string;
}

export interface Block {
  id: string;
  societyId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Flat {
  id: string;
  blockId: string;
  number: string;
  occupancyStatus: "Occupied" | "Vacant" | "Maintenance";
  ownerName: string;
  phone: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  societies: Society[];
  blocks: Block[];
  flats: Flat[];
  notices: Notice[];
  visitors: Visitor[];
  sosAlerts: SOSAlert[];
  tickets: SupportTicket[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: "Security" | "Maintenance" | "Event" | "General";
  date: string;
  postedBy: string;
}

export interface Visitor {
  id: string;
  residentId?: string;
  residentName: string;
  flatNo: string;
  visitorName: string;
  phone: string;
  vehicleNo: string;
  purpose: string;
  status: "Pre-Approved" | "Checked-In" | "Checked-Out";
  checkInTime?: string;
  checkOutTime?: string;
  qrCodeValue: string;
  createdAt: string;
}

export interface SOSAlert {
  id: string;
  residentId: string;
  residentName: string;
  flatNo: string;
  phone: string;
  time: string;
  status: "Active" | "Responding" | "Resolved" | "Cancelled";
  category: "HEALTH" | "FIRE" | "THEFT" | "OTHER";
  message: string;
  latitude: number;
  longitude: number;
  address: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  voiceTranscribed?: boolean;
  acknowledgedBy?: string;
  updates?: Array<{
    id: string;
    time: string;
    message: string;
    senderName: string;
  }>;
}

export interface SupportTicket {
  id: string;
  residentId: string;
  residentName: string;
  flatNo: string;
  title: string;
  description: string;
  category: "Plumbing" | "Electrical" | "Lift" | "Security" | "Other";
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
}
