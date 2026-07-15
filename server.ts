import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { AppState, User, Society, Block, Flat, Notice, Visitor, SOSAlert, SupportTicket } from "./src/types";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const HMR_PORT = Number(process.env.HMR_PORT) || 24679;
const DB_FILE_PATH = path.join(process.cwd(), "db_data.json");

// Helper to seed the database with clean, realistic initial data
function getInitialData(): AppState {
  const societies: Society[] = [
    {
      id: "soc-1",
      name: "Emerald Heights",
      address: "123 Green Valley Road, Sector 4",
      description: "A premium gated community featuring green parks, robust smart-gate security, and active support clubs.",
      createdAt: new Date("2026-01-10T10:00:00Z").toISOString(),
    },
    {
      id: "soc-2",
      name: "Serene Oasis",
      address: "456 Desert Palm Blvd, Sector 12",
      description: "A peaceful residential enclave renowned for its active volunteer network and safety protocols.",
      createdAt: new Date("2026-02-15T11:00:00Z").toISOString(),
    },
    {
      id: "soc-3",
      name: "Golden Crest Towers",
      address: "789 Hilltop Avenue, Heights Block",
      description: "High-density residential towers offering dynamic visitor logging and direct emergency services.",
      createdAt: new Date("2026-03-01T09:30:00Z").toISOString(),
    }
  ];

  const blocks: Block[] = [
    {
      id: "blk-1",
      societyId: "soc-1",
      name: "Tower A",
      description: "Located near Main Gate 1, high occupancy block with senior care access",
      createdAt: new Date("2026-01-11T10:00:00Z").toISOString(),
    },
    {
      id: "blk-2",
      societyId: "soc-1",
      name: "Tower B",
      description: "Overlooking central park, includes emergency assembly zone",
      createdAt: new Date("2026-01-11T11:30:00Z").toISOString(),
    },
    {
      id: "blk-3",
      societyId: "soc-2",
      name: "Phase 1 Block C",
      description: "Near the community hall, premium single-floor configurations",
      createdAt: new Date("2026-02-16T12:00:00Z").toISOString(),
    }
  ];

  const flats: Flat[] = [
    {
      id: "flat-1",
      blockId: "blk-1",
      number: "101-A",
      occupancyStatus: "Occupied",
      ownerName: "Alexander Wright",
      phone: "+15559871111",
      createdAt: new Date("2026-01-12T08:00:00Z").toISOString(),
    },
    {
      id: "flat-2",
      blockId: "blk-1",
      number: "102-A",
      occupancyStatus: "Vacant",
      ownerName: "",
      phone: "",
      createdAt: new Date("2026-01-12T08:30:00Z").toISOString(),
    },
    {
      id: "flat-3",
      blockId: "blk-1",
      number: "201-A",
      occupancyStatus: "Occupied",
      ownerName: "Sarah Connor",
      phone: "+15559872222",
      createdAt: new Date("2026-01-12T09:00:00Z").toISOString(),
    },
    {
      id: "flat-4",
      blockId: "blk-2",
      number: "101-B",
      occupancyStatus: "Occupied",
      ownerName: "David Miller",
      phone: "+15559873333",
      createdAt: new Date("2026-01-13T08:00:00Z").toISOString(),
    },
    {
      id: "flat-5",
      blockId: "blk-2",
      number: "202-B",
      occupancyStatus: "Maintenance",
      ownerName: "",
      phone: "",
      createdAt: new Date("2026-01-13T09:00:00Z").toISOString(),
    }
  ];

  const users: User[] = [
    {
      id: "usr-admin",
      email: "admin@society.com",
      password: "admin123",
      role: "Admin",
      name: "System Administrator",
      phone: "+1555000111",
      verified: true,
      isApproved: true,
      createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
      details: {}
    },
    {
      id: "usr-resident",
      email: "resident@society.com",
      password: "resident123",
      role: "Resident",
      name: "Sarah Connor",
      phone: "+15559872222",
      verified: true,
      isApproved: true,
      createdAt: new Date("2026-01-12T09:10:00Z").toISOString(),
      details: {
        societyId: "soc-1",
        blockId: "blk-1",
        flatId: "flat-3",
        flatNo: "201-A"
      }
    },
    {
      id: "usr-guardian",
      email: "guardian@society.com",
      password: "guardian123",
      role: "Guardian",
      name: "John Connor",
      phone: "+15559873344",
      verified: true,
      isApproved: true,
      createdAt: new Date("2026-01-12T10:00:00Z").toISOString(),
      details: {
        residentId: "usr-resident",
        residentName: "Sarah Connor",
        relationship: "Son",
        emergencyContact: "+15559872222"
      }
    },
    {
      id: "usr-volunteer",
      email: "volunteer@society.com",
      password: "volunteer123",
      role: "Volunteer",
      name: "Marcus Wright",
      phone: "+15553334444",
      verified: true,
      isApproved: true,
      createdAt: new Date("2026-01-15T14:30:00Z").toISOString(),
      details: {
        skills: ["First Aid & CPR", "Disaster Response", "Senior Care Support"],
        availability: "Evening"
      }
    },
    {
      id: "usr-security",
      email: "security@society.com",
      password: "security123",
      role: "Security",
      name: "Officer Rogers",
      phone: "+15555556666",
      verified: true,
      isApproved: true,
      createdAt: new Date("2026-01-11T07:00:00Z").toISOString(),
      details: {
        gateNumber: "Gate 1 (Main Entrance)",
        shift: "Day",
        assignedTower: "Tower A"
      }
    }
  ];

  const notices: Notice[] = [
    {
      id: "notice-1",
      title: "Elevator Annual Maintenance",
      content: "Please note that the elevator in Tower A will undergo scheduled preventative maintenance on Thursday from 10:00 AM to 02:00 PM. Please use the stairs or Tower B service lift.",
      category: "Maintenance",
      date: new Date("2026-07-13T09:00:00Z").toISOString(),
      postedBy: "System Administrator"
    },
    {
      id: "notice-2",
      title: "Community Fire Safety Drill",
      content: "A joint fire response drill with local fire rescue teams will be conducted in the Emerald Heights assembly grounds on Friday at 04:00 PM. All residents and staff are strongly encouraged to join.",
      category: "Security",
      date: new Date("2026-07-12T15:00:00Z").toISOString(),
      postedBy: "System Administrator"
    }
  ];

  const visitors: Visitor[] = [
    {
      id: "vis-1",
      residentId: "usr-resident",
      residentName: "Sarah Connor",
      flatNo: "201-A",
      visitorName: "Thomas Anderson",
      phone: "+15554449988",
      vehicleNo: "NEO-101",
      purpose: "Delivery",
      status: "Checked-In",
      checkInTime: new Date("2026-07-14T08:30:00Z").toISOString(),
      qrCodeValue: "S360-VIS-839210",
      createdAt: new Date("2026-07-14T08:00:00Z").toISOString()
    }
  ];

  const sosAlerts: SOSAlert[] = [];

  const tickets: SupportTicket[] = [
    {
      id: "tkt-1",
      residentId: "usr-resident",
      residentName: "Sarah Connor",
      flatNo: "201-A",
      title: "Main gate intercom malfunction",
      description: "When guards call flat 201-A from the intercom system, it disconnects immediately and makes a screeching sound. Needs repair.",
      category: "Electrical",
      priority: "Medium",
      status: "In Progress",
      createdAt: new Date("2026-07-13T11:00:00Z").toISOString()
    }
  ];

  return { users, societies, blocks, flats, notices, visitors, sosAlerts, tickets };
}

// Read database file or fallback to initial seed
function readDB(): AppState {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      // Ensure backward compatibility
      if (!parsed.notices) parsed.notices = [];
      if (!parsed.visitors) parsed.visitors = [];
      if (!parsed.sosAlerts) parsed.sosAlerts = [];
      if (!parsed.tickets) parsed.tickets = [];
      return parsed;
    }
  } catch (error) {
    console.error("Error reading database file, resetting to initial seed:", error);
  }
  const initial = getInitialData();
  writeDB(initial);
  return initial;
}

// Write database file
function writeDB(data: AppState): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to database file:", error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Enable CORS for external emulators, Expo Go, and clients
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Initialize DB
  let db = readDB();

  // Lazy-load Gemini client with fallback checks
  let aiInstance: any = null;
  function getGeminiClient() {
    if (!aiInstance) {
      const key = process.env.GEMINI_API_KEY;
      if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
        console.warn("GEMINI_API_KEY is not configured or placeholder is present. Fallback simulated AI mode enabled.");
        return null;
      }
      try {
        aiInstance = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
        return null;
      }
    }
    return aiInstance;
  }

  // Authentication Middleware Helper
  function getAuthenticatedUser(req: express.Request): User | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    // We simulate a JWT token of format: mock-jwt-token-for-<userId>
    if (token.startsWith("mock-jwt-token-for-")) {
      const userId = token.replace("mock-jwt-token-for-", "");
      db = readDB();
      const user = db.users.find(u => u.id === userId);
      if (user) {
        // Exclude password from output
        const { password, ...safeUser } = user;
        return safeUser as User;
      }
    }
    return null;
  }

  // --- API ROUTES ---

  // 1. Auth & Verification APIs
  app.get("/api/auth/current-user", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({ user });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, role, name, phone, details } = req.body;
    if (!email || !password || !role || !name || !phone) {
      res.status(400).json({ error: "Missing required registration fields" });
      return;
    }

    db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: "A user with this email already exists" });
      return;
    }

    // Generate a secure 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const initialDetails = details || {};
    initialDetails.approvalStatus = "Pending";

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      password,
      role,
      name,
      phone,
      verified: false, // Must verify OTP
      otp,
      isApproved: false, // All roles start as unapproved and require admin verification
      createdAt: new Date().toISOString(),
      details: initialDetails
    };

    db.users.push(newUser);
    writeDB(db);

    // Return mock access token instantly with verification details (so the frontend can show the OTP code in the simulator)
    res.status(201).json({
      message: "Registration successful. Verification code generated.",
      token: `mock-jwt-token-for-${newUser.id}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        phone: newUser.phone,
        verified: newUser.verified,
        isApproved: newUser.isApproved,
        details: newUser.details
      },
      devOtpCode: otp // Exposed for simulated SMS/Email capture in UI
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    res.json({
      token: `mock-jwt-token-for-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        verified: user.verified,
        isApproved: user.isApproved,
        details: user.details
      }
    });
  });

  app.post("/api/auth/verify-otp", (req, res) => {
    const { otp } = req.body;
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized or missing credentials" });
      return;
    }

    db = readDB();
    const userInDb = db.users.find(u => u.id === user.id);
    if (!userInDb) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (userInDb.otp === otp) {
      userInDb.verified = true;
      userInDb.otp = undefined; // clear otp
      writeDB(db);
      res.json({
        message: "Email/Phone verified successfully!",
        user: {
          id: userInDb.id,
          email: userInDb.email,
          role: userInDb.role,
          name: userInDb.name,
          phone: userInDb.phone,
          verified: true,
          isApproved: userInDb.isApproved,
          details: userInDb.details
        }
      });
    } else {
      res.status(400).json({ error: "Invalid verification code" });
    }
  });

  // 2. Society CRUD APIs
  app.get("/api/societies", (req, res) => {
    db = readDB();
    res.json(db.societies);
  });

  app.post("/api/societies", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Admin privilege required" });
      return;
    }

    const { name, address, description } = req.body;
    if (!name || !address) {
      res.status(400).json({ error: "Name and address are required" });
      return;
    }

    db = readDB();
    const newSociety: Society = {
      id: `soc-${Date.now()}`,
      name,
      address,
      description: description || "",
      createdAt: new Date().toISOString()
    };

    db.societies.push(newSociety);
    writeDB(db);
    res.status(201).json(newSociety);
  });

  app.delete("/api/societies/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Admin privilege required" });
      return;
    }

    const { id } = req.params;
    db = readDB();
    const index = db.societies.findIndex(s => s.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Society not found" });
      return;
    }

    // Cascade delete blocks and flats
    const blocksToDelete = db.blocks.filter(b => b.societyId === id).map(b => b.id);
    db.flats = db.flats.filter(f => !blocksToDelete.includes(f.blockId));
    db.blocks = db.blocks.filter(b => b.societyId !== id);
    db.societies.splice(index, 1);

    writeDB(db);
    res.json({ message: "Society deleted and all nested blocks/flats successfully removed." });
  });

  // 3. Block CRUD APIs
  app.get("/api/blocks", (req, res) => {
    db = readDB();
    res.json(db.blocks || []);
  });
  app.get("/api/societies/:societyId/blocks", (req, res) => {
    const { societyId } = req.params;
    db = readDB();
    const filteredBlocks = db.blocks.filter(b => b.societyId === societyId);
    res.json(filteredBlocks);
  });

  app.post("/api/societies/:societyId/blocks", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Admin privilege required" });
      return;
    }

    const { societyId } = req.params;
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: "Block/Tower name is required" });
      return;
    }

    db = readDB();
    const newBlock: Block = {
      id: `blk-${Date.now()}`,
      societyId,
      name,
      description: description || "",
      createdAt: new Date().toISOString()
    };

    db.blocks.push(newBlock);
    writeDB(db);
    res.status(201).json(newBlock);
  });

  app.delete("/api/blocks/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Admin privilege required" });
      return;
    }

    const { id } = req.params;
    db = readDB();
    const index = db.blocks.findIndex(b => b.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Block not found" });
      return;
    }

    // Cascade delete flats
    db.flats = db.flats.filter(f => f.blockId !== id);
    db.blocks.splice(index, 1);

    writeDB(db);
    res.json({ message: "Block deleted and nested flats cleared." });
  });

  // 4. Flat CRUD APIs
  app.get("/api/flats", (req, res) => {
    db = readDB();
    res.json(db.flats || []);
  });
  app.get("/api/blocks/:blockId/flats", (req, res) => {
    const { blockId } = req.params;
    db = readDB();
    const filteredFlats = db.flats.filter(f => f.blockId === blockId);
    res.json(filteredFlats);
  });

  app.post("/api/blocks/:blockId/flats", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Admin privilege required" });
      return;
    }

    const { blockId } = req.params;
    const { number, occupancyStatus, ownerName, phone } = req.body;
    if (!number) {
      res.status(400).json({ error: "Flat number is required" });
      return;
    }

    db = readDB();
    const newFlat: Flat = {
      id: `flat-${Date.now()}`,
      blockId,
      number,
      occupancyStatus: occupancyStatus || "Vacant",
      ownerName: ownerName || "",
      phone: phone || "",
      createdAt: new Date().toISOString()
    };

    db.flats.push(newFlat);
    writeDB(db);
    res.status(201).json(newFlat);
  });

  app.delete("/api/flats/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Admin privilege required" });
      return;
    }

    const { id } = req.params;
    db = readDB();
    const index = db.flats.findIndex(f => f.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Flat not found" });
      return;
    }

    db.flats.splice(index, 1);
    writeDB(db);
    res.json({ message: "Flat successfully removed." });
  });

  // Extra helper to list pending approvals for security & volunteers (for Web Admin view)
  app.get("/api/admin/pending-users", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Admin privilege required" });
      return;
    }
    db = readDB();
    const pending = db.users.filter(u => !u.isApproved);
    res.json(pending);
  });

  app.post("/api/admin/approve-user/:userId", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== "Admin" && user.role !== "Security")) {
      res.status(403).json({ error: "Admin or Security privilege required" });
      return;
    }
    const { userId } = req.params;
    const { status } = req.body; // "Approved" | "Rejected" | "Pending"
    const targetStatus = status || "Approved";

    db = readDB();
    const userToApprove = db.users.find(u => u.id === userId);
    if (!userToApprove) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    userToApprove.isApproved = targetStatus === "Approved";
    userToApprove.details = userToApprove.details || {};
    userToApprove.details.approvalStatus = targetStatus;

    writeDB(db);
    res.json({ message: `User ${userToApprove.name} status updated to ${targetStatus}.`, user: userToApprove });
  });

  // Get all users (to help admin manage residents/guardians/etc)
  app.get("/api/admin/users", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== "Admin" && user.role !== "Security")) {
      res.status(403).json({ error: "Admin or Security privilege required" });
      return;
    }
    db = readDB();
    res.json(db.users.map(({ password, ...safeUser }) => safeUser));
  });

  // --- RESIDENT MAPPING & EMERGENCY CONTACTS APIs ---

  // 1. Map Resident to Society, Block, and Flat Number
  app.post("/api/residents/map-flat", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { societyId, blockId, flatNo } = req.body;
    if (!societyId || !blockId || !flatNo) {
      res.status(400).json({ error: "Missing societyId, blockId, or flatNo" });
      return;
    }

    db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    dbUser.details = dbUser.details || {};
    dbUser.details.societyId = societyId;
    dbUser.details.blockId = blockId;
    dbUser.details.flatNo = flatNo;
    dbUser.details.approvalStatus = "Pending";
    dbUser.isApproved = false; // Re-trigger approval after mapping update

    writeDB(db);
    res.json({ message: "Flat mapping submitted successfully", user: dbUser });
  });

  // 2. Get Resident Directory
  app.get("/api/residents/directory", (req, res) => {
    db = readDB();
    const residents = db.users.filter(u => u.role === "Resident");
    res.json(residents.map(({ password, ...safeUser }) => safeUser));
  });

  // 3. Get Emergency Contacts list
  app.get("/api/residents/emergency-contacts", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const contacts = dbUser.details?.emergencyContacts || [];
    res.json(contacts);
  });

  // 4. Add or Update Emergency Contact
  app.post("/api/residents/emergency-contacts", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { id, name, phone, relationship, type } = req.body;
    if (!name || !phone || !relationship || !type) {
      res.status(400).json({ error: "Missing required contact fields" });
      return;
    }

    db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    dbUser.details = dbUser.details || {};
    dbUser.details.emergencyContacts = dbUser.details.emergencyContacts || [];

    // If type is Primary or Secondary, update any existing to "Other"
    if (type === "Primary" || type === "Secondary") {
      dbUser.details.emergencyContacts.forEach((c: any) => {
        if (c.type === type && c.id !== id) {
          c.type = "Other";
        }
      });
    }

    let contact;
    if (id) {
      // Update existing
      contact = dbUser.details.emergencyContacts.find((c: any) => c.id === id);
      if (!contact) {
        res.status(404).json({ error: "Contact not found" });
        return;
      }
      contact.name = name;
      if (contact.phone !== phone) {
        contact.phone = phone;
        contact.isVerified = false; // reset verification if phone changes
      }
      contact.relationship = relationship;
      contact.type = type;
    } else {
      // Add new
      contact = {
        id: `contact-${Date.now()}`,
        name,
        phone,
        relationship,
        type,
        isVerified: false
      };
      dbUser.details.emergencyContacts.push(contact);
    }

    writeDB(db);
    res.json(contact);
  });

  // 5. Delete Emergency Contact
  app.delete("/api/residents/emergency-contacts/:contactId", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { contactId } = req.params;
    db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    dbUser.details = dbUser.details || {};
    dbUser.details.emergencyContacts = dbUser.details.emergencyContacts || [];
    dbUser.details.emergencyContacts = dbUser.details.emergencyContacts.filter((c: any) => c.id !== contactId);

    writeDB(db);
    res.json({ message: "Contact deleted successfully" });
  });

  // 6. Trigger Contact Verification (simulated SMS OTP)
  app.post("/api/residents/emergency-contacts/:contactId/verify", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { contactId } = req.params;
    db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const contact = dbUser.details?.emergencyContacts?.find((c: any) => c.id === contactId);
    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    contact.verificationOtp = otp;

    writeDB(db);
    res.json({ message: "Verification OTP sent successfully", otp });
  });

  // 7. Confirm Contact Verification
  app.post("/api/residents/emergency-contacts/:contactId/confirm", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { contactId } = req.params;
    const { otp } = req.body;
    if (!otp) {
      res.status(400).json({ error: "Missing verification OTP" });
      return;
    }

    db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const contact = dbUser.details?.emergencyContacts?.find((c: any) => c.id === contactId);
    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }

    if (contact.verificationOtp !== otp) {
      res.status(400).json({ error: "Invalid verification code" });
      return;
    }

    contact.isVerified = true;
    delete contact.verificationOtp;

    writeDB(db);
    res.json({ message: "Contact verified successfully", contact });
  });

  // 8. Admin Update Resident Flat Mapping
  app.post("/api/admin/map-resident/:userId", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== "Admin" && user.role !== "Security")) {
      res.status(403).json({ error: "Admin or Security privilege required" });
      return;
    }
    const { userId } = req.params;
    const { societyId, blockId, flatNo } = req.body;
    if (!societyId || !blockId || !flatNo) {
      res.status(400).json({ error: "Missing societyId, blockId, or flatNo" });
      return;
    }

    db = readDB();
    const dbUser = db.users.find(u => u.id === userId);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    dbUser.details = dbUser.details || {};
    dbUser.details.societyId = societyId;
    dbUser.details.blockId = blockId;
    dbUser.details.flatNo = flatNo;
    
    writeDB(db);
    res.json({ message: "Resident flat mapping updated successfully", user: dbUser });
  });

  // --- NOTICES APIS ---
  app.get("/api/notices", (req, res) => {
    db = readDB();
    res.json(db.notices || []);
  });

  app.post("/api/notices", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Only system administrators can post bulletins" });
      return;
    }
    const { title, content, category } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }
    db = readDB();
    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      title,
      content,
      category: category || "General",
      date: new Date().toISOString(),
      postedBy: user.name
    };
    db.notices.push(newNotice);
    writeDB(db);
    res.status(201).json(newNotice);
  });

  app.delete("/api/notices/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Admin privilege required" });
      return;
    }
    db = readDB();
    const { id } = req.params;
    const index = db.notices.findIndex(n => n.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Bulletin not found" });
      return;
    }
    db.notices.splice(index, 1);
    writeDB(db);
    res.json({ message: "Bulletin notice removed successfully." });
  });

  // --- VISITORS APIS ---
  app.get("/api/visitors", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    db = readDB();
    // Residents only see their own visitor pre-approvals or check-ins
    if (user.role === "Resident" || user.role === "Guardian") {
      const flatNo = user.details?.flatNo;
      if (!flatNo) {
        res.json([]);
        return;
      }
      const filtered = db.visitors.filter(v => v.flatNo === flatNo);
      res.json(filtered);
    } else {
      // Admin and security see all visitors
      res.json(db.visitors || []);
    }
  });

  app.post("/api/visitors", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { visitorName, phone, vehicleNo, purpose, flatNo, residentName } = req.body;
    if (!visitorName || !flatNo) {
      res.status(400).json({ error: "Visitor name and flat/apartment unit are required" });
      return;
    }
    db = readDB();
    const newVisitor: Visitor = {
      id: `vis-${Date.now()}`,
      residentId: user.id,
      residentName: residentName || user.name,
      flatNo,
      visitorName,
      phone: phone || "",
      vehicleNo: vehicleNo || "None",
      purpose: purpose || "General",
      status: "Pre-Approved",
      qrCodeValue: `S360-VIS-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };
    db.visitors.push(newVisitor);
    writeDB(db);
    res.status(201).json(newVisitor);
  });

  app.post("/api/visitors/log-check-in", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== "Security" && user.role !== "Admin")) {
      res.status(403).json({ error: "Only security or administrators can check-in visitors" });
      return;
    }
    const { id, visitorName, flatNo, vehicleNo, purpose, phone, residentName } = req.body;
    db = readDB();
    if (id) {
      // This is a pre-approved visitor being checked in
      const visitor = db.visitors.find(v => v.id === id);
      if (!visitor) {
        res.status(404).json({ error: "Pre-approved record not found" });
        return;
      }
      visitor.status = "Checked-In";
      visitor.checkInTime = new Date().toISOString();
      writeDB(db);
      res.json(visitor);
    } else {
      // Walk-in visitor being created and checked-in simultaneously
      if (!visitorName || !flatNo) {
        res.status(400).json({ error: "Visitor name and target apartment are required" });
        return;
      }
      const newVisitor: Visitor = {
        id: `vis-${Date.now()}`,
        residentName: residentName || "Unknown Occupant",
        flatNo,
        visitorName,
        phone: phone || "",
        vehicleNo: vehicleNo || "None",
        purpose: purpose || "Walk-in Entry",
        status: "Checked-In",
        checkInTime: new Date().toISOString(),
        qrCodeValue: `S360-VIS-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString()
      };
      db.visitors.push(newVisitor);
      writeDB(db);
      res.status(201).json(newVisitor);
    }
  });

  app.post("/api/visitors/log-check-out/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== "Security" && user.role !== "Admin")) {
      res.status(403).json({ error: "Only security or administrators can check-out visitors" });
      return;
    }
    const { id } = req.params;
    db = readDB();
    const visitor = db.visitors.find(v => v.id === id);
    if (!visitor) {
      res.status(404).json({ error: "Visitor record not found" });
      return;
    }
    visitor.status = "Checked-Out";
    visitor.checkOutTime = new Date().toISOString();
    writeDB(db);
    res.json(visitor);
  });

  // --- REVERSE GEOCODING API (Using Gemini AI!) ---
  app.get("/api/geocode/reverse", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      res.status(400).json({ error: "Latitude and Longitude query parameters are required." });
      return;
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are a location encoder for a smart gated society management system in Bengaluru, India. 
Reverse geocode the following coordinates to a realistic, highly specific residential address inside a Bengaluru gated community (e.g., matching Tower A/B, Flat 101/201, Emerald Heights, Green Valley Road, Sector 4, Outer Ring Road, Bengaluru, Karnataka 560103).
Latitude: ${lat}
Longitude: ${lng}
Output ONLY the clean, readable address string. Do not include quotes, explanations, labels, or formatting. Keep it to one concise sentence.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        const address = response.text?.trim() || `Flat 201-A, Emerald Heights, Bangalore (Lat: ${lat}, Lng: ${lng})`;
        res.json({ address });
        return;
      } catch (err) {
        console.error("Gemini reverse geocoding failed, falling back:", err);
      }
    }

    // Fallback if Gemini client is not initialized or fails
    const mockAddresses = [
      `Emerald Heights, Tower A, Flat 201-A, Sector 4, Bangalore 560103`,
      `Serene Oasis, Block C, Apt 405, Sector 12, Bangalore 560087`,
      `Golden Crest Towers, Tower B, Flat 802, Hilltop Avenue, Bangalore 560043`
    ];
    // Simple deterministic fallback based on lat/lng digits
    const index = Math.abs(Math.floor((Number(lat) || 0) * (Number(lng) || 0) * 100)) % mockAddresses.length;
    res.json({ address: mockAddresses[index] });
  });

  // --- SOS PANIC APIS ---
  // Get all emergency categories (master data)
  app.get("/api/sos/categories", (req, res) => {
    const categories = [
      { id: "HEALTH", name: "Medical / Health", icon: "HeartPulse", severity: "CRITICAL", description: "Medical emergencies, stroke, heart attack, physical injuries" },
      { id: "FIRE", name: "Fire Hazard", icon: "Flame", severity: "CRITICAL", description: "Kitchen fire, electrical sparking, gas leak, building smoke" },
      { id: "THEFT", name: "Intruder / Theft", icon: "ShieldAlert", severity: "HIGH", description: "Burglar, break-in attempt, suspicious person in corridors" },
      { id: "OTHER", name: "Water / Power / Other", icon: "AlertTriangle", severity: "MEDIUM", description: "Water pipe burst, short circuit, elevator trapping" }
    ];
    res.json(categories);
  });

  app.get("/api/sos/active", (req, res) => {
    db = readDB();
    const activeAlerts = db.sosAlerts.filter(s => s.status !== "Resolved" && s.status !== "Cancelled");
    res.json(activeAlerts);
  });

  // Get all SOS incidents (active & resolved)
  app.get("/api/sos", (req, res) => {
    db = readDB();
    res.json(db.sosAlerts || []);
  });

  // Get details of a single SOS incident
  app.get("/api/sos/:id", (req, res) => {
    db = readDB();
    const alert = db.sosAlerts.find(s => s.id === req.params.id);
    if (!alert) {
      res.status(404).json({ error: "SOS Alert not found" });
      return;
    }
    res.json(alert);
  });

  // Simulated Voice to Text Distress Transcription (Using Gemini AI!)
  app.post("/api/sos/voice-transcribe", async (req, res) => {
    const { category } = req.body;
    const cleanCategory = category || "OTHER";

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are simulating a high-urgency spoken voice distress call for a gated community safety dispatch center.
Generate a realistic, short (10-15 words max), highly urgent spoken statement that a resident in panic would say for a "${cleanCategory}" emergency.
It must sound natural, like raw spoken audio transcribed to text (with emotional urgency).
Do not put quotes, explanatory text, or preamble around your answer. Just output the clean sentence itself.
Examples:
- HEALTH: "Help! My husband collapsed on the floor and is not breathing, please send emergency help!"
- FIRE: "There is thick black smoke coming from the electrical kitchen vent, we need an extinguisher!"
- THEFT: "Someone is trying to break our backyard door lock right now, please send guards!"`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        const text = response.text?.trim() || `Urgent ${cleanCategory} emergency! Please send responders immediately!`;
        res.json({ text });
        return;
      } catch (err) {
        console.error("Gemini voice transcription failed, falling back:", err);
      }
    }

    // Fallback responses
    const fallbacks: Record<string, string> = {
      HEALTH: "My grandfather collapsed in the living room and is unresponsive. Please send medical dispatch immediately!",
      FIRE: "Our kitchen toaster caught fire and the cabinets are burning! We need immediate help!",
      THEFT: "We heard glass breaking downstairs and think someone is in the house. We're locked in the bedroom!",
      OTHER: "A massive water pipe burst inside the main hallway ceiling and is flooding the electrical panel!"
    };
    res.json({ text: fallbacks[cleanCategory] || "Urgent safety alert! We require immediate emergency assistance!" });
  });

  // Main post handler for triggering SOS (supporting both /api/sos/trigger and /api/sos/)
  const handleTriggerSOS = (req: express.Request, res: express.Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { category, message, latitude, longitude, address, priority, phone, voiceTranscribed, flatNo } = req.body;
    db = readDB();

    const newAlert: SOSAlert = {
      id: `sos-${Date.now()}`,
      residentId: user.id,
      residentName: user.name,
      flatNo: flatNo || user.details?.flatNo || "Apt 201-A",
      phone: phone || user.phone,
      time: new Date().toISOString(),
      status: "Active",
      category: category || "OTHER",
      message: message || "Urgent assistance requested!",
      latitude: Number(latitude) || 12.9716,
      longitude: Number(longitude) || 77.5946,
      address: address || "Emerald Heights Residential Complex",
      priority: priority || "HIGH",
      voiceTranscribed: !!voiceTranscribed,
      updates: [
        {
          id: `msg-init-${Date.now()}`,
          time: new Date().toISOString(),
          message: `🚨 Emergency Beacon Broadcasted (${category || "OTHER"}). Priority: ${priority || "HIGH"}.`,
          senderName: "System"
        }
      ]
    };

    db.sosAlerts.push(newAlert);
    writeDB(db);
    res.status(201).json(newAlert);
  };

  app.post("/api/sos/trigger", handleTriggerSOS);
  app.post("/api/sos", handleTriggerSOS);

  // Acknowledge SOS endpoint (supporting both POST acknowledge and PUT status for maximum compatibility)
  app.post("/api/sos/acknowledge/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== "Security" && user.role !== "Admin")) {
      res.status(403).json({ error: "Only security officers or administrators can handle emergency alerts" });
      return;
    }
    const { id } = req.params;
    const { status } = req.body; // "Responding" or "Resolved" or "Cancelled"
    db = readDB();
    const alert = db.sosAlerts.find(s => s.id === id);
    if (!alert) {
      res.status(404).json({ error: "SOS emergency record not found" });
      return;
    }
    alert.status = status || "Responding";
    alert.acknowledgedBy = user.name;
    
    alert.updates = alert.updates || [];
    alert.updates.push({
      id: `msg-ack-${Date.now()}`,
      time: new Date().toISOString(),
      message: `Patrol updated status to: ${alert.status}`,
      senderName: user.name
    });

    writeDB(db);
    res.json(alert);
  });

  app.put("/api/sos/:id/status", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { id } = req.params;
    const { status } = req.body; // "Active" | "Responding" | "Resolved" | "Cancelled"
    db = readDB();
    const alert = db.sosAlerts.find(s => s.id === id);
    if (!alert) {
      res.status(404).json({ error: "SOS emergency record not found" });
      return;
    }
    alert.status = status || "Responding";
    if (user.role === "Security" || user.role === "Admin") {
      alert.acknowledgedBy = user.name;
    }

    alert.updates = alert.updates || [];
    alert.updates.push({
      id: `msg-status-${Date.now()}`,
      time: new Date().toISOString(),
      message: `Emergency status updated to: ${status}`,
      senderName: user.name
    });

    writeDB(db);
    res.json(alert);
  });

  // Appends a message / update log to a specific SOS incident
  app.post("/api/sos/:id/message", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { id } = req.params;
    const { message, senderName } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message content is required" });
      return;
    }

    db = readDB();
    const alert = db.sosAlerts.find(s => s.id === id);
    if (!alert) {
      res.status(404).json({ error: "SOS Alert not found" });
      return;
    }

    alert.updates = alert.updates || [];
    const newUpdate = {
      id: `msg-update-${Date.now()}`,
      time: new Date().toISOString(),
      message,
      senderName: senderName || user.name
    };
    alert.updates.push(newUpdate);

    writeDB(db);
    res.status(201).json(newUpdate);
  });

  // Get log of message updates for a specific SOS incident
  app.get("/api/sos/:id/messages", (req, res) => {
    db = readDB();
    const alert = db.sosAlerts.find(s => s.id === req.params.id);
    if (!alert) {
      res.status(404).json({ error: "SOS Alert not found" });
      return;
    }
    res.json(alert.updates || []);
  });

  // Updates full details of an SOS incident
  app.put("/api/sos/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { id } = req.params;
    db = readDB();
    const alert = db.sosAlerts.find(s => s.id === id);
    if (!alert) {
      res.status(404).json({ error: "SOS Alert not found" });
      return;
    }

    Object.assign(alert, req.body, { id, residentId: alert.residentId }); // safety check to prevent overwriting keys
    writeDB(db);
    res.json(alert);
  });

  // --- MAINTENANCE TICKETS APIS ---
  app.get("/api/tickets", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    db = readDB();
    if (user.role === "Resident" || user.role === "Guardian") {
      res.json(db.tickets.filter(t => t.residentId === user.id) || []);
    } else {
      res.json(db.tickets || []);
    }
  });

  app.post("/api/tickets", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { title, description, category, priority } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: "Title and description are required" });
      return;
    }
    db = readDB();
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      residentId: user.id,
      residentName: user.name,
      flatNo: user.details?.flatNo || "Unknown Location",
      title,
      description,
      category: category || "Other",
      priority: priority || "Low",
      status: "Open",
      createdAt: new Date().toISOString()
    };
    db.tickets.push(newTicket);
    writeDB(db);
    res.status(201).json(newTicket);
  });

  app.post("/api/tickets/update-status/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "Admin") {
      res.status(403).json({ error: "Only system administrators can update ticket status" });
      return;
    }
    const { id } = req.params;
    const { status } = req.body; // "In Progress" or "Resolved"
    db = readDB();
    const ticket = db.tickets.find(t => t.id === id);
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }
    ticket.status = status || "In Progress";
    writeDB(db);
    res.json(ticket);
  });

  // --- VITE DEV / PRODUCTION MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          host: HOST,
          port: HMR_PORT,
          protocol: "ws",
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[FULL-STACK BACKEND] Server running at http://${HOST}:${PORT}`);
  });
}

startServer();
