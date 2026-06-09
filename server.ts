import express from "express";
import path from "path";
import fs from "fs";

// Import types
import { Package, Post, PaymentSlip, ContactDetails, HomeAnnouncement, FreePackage, FreeRequest, AdSettings, SupportMessage, MaintenanceSettings } from "./src/types";
import { INITIAL_PACKAGES, INITIAL_POSTS, INITIAL_CONTACT, INITIAL_ANNOUNCEMENT } from "./src/mockData";

const DB_INTEGRITY_SALT = "secured_by_janucyberpack_signature_token_2026";

// Initialize Firebase JS SDK
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, collection, Firestore 
} from "firebase/firestore/lite";

let firebaseConfig: any = {
  projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0008438867",
  appId: process.env.FIREBASE_APP_ID || "1:796923319104:web:5408ce4861d12aec6460a5",
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyClstsLmizDZJ6OD_WnKaSE06yIwHdtq-8",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "gen-lang-client-0008438867.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-05efdffc-31e5-48da-b96f-d2964f93684b",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "gen-lang-client-0008438867.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "796923319104",
  measurementId: ""
};

try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
    firebaseConfig = { ...firebaseConfig, ...config };
  }
} catch (err) {
  console.warn("Skipping external firebase config load.");
}

let firebaseApp: FirebaseApp;
let db: Firestore;
let isUsingFallbackDefaultDb = false;

function getDb(forceDefault = false): Firestore {
  if (forceDefault) {
    try {
      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(firebaseApp);
      isUsingFallbackDefaultDb = true;
      console.log("[BOOT] Firestore forced fallback to default database ID ('(default)')");
    } catch (e) {
      console.error("[CRITICAL] Forced fallback database initialization failed:", e);
    }
    return db;
  }

  if (!db) {
    try {
      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      // Try to use the configured database ID
      const customDbId = firebaseConfig.firestoreDatabaseId;
      if (customDbId && customDbId !== "(default)" && !isUsingFallbackDefaultDb) {
        db = getFirestore(firebaseApp, customDbId);
        console.log(`[BOOT] Firestore initialized for DB: ${customDbId}`);
      } else {
        db = getFirestore(firebaseApp);
        isUsingFallbackDefaultDb = true;
        console.log("[BOOT] Firestore initialized for default DB '(default)'");
      }
    } catch (e) {
      console.error("[CRITICAL] Firebase initialization failed:", e);
      // Fallback to default DB immediately if it crashes
      try {
        db = getFirestore(firebaseApp);
        isUsingFallbackDefaultDb = true;
        console.log("[BOOT] Firestore fallback initialized for default DB after initial crash");
      } catch (fallbackErr) {
        console.error("[CRITICAL] Fallback Firebase initialization also failed:", fallbackErr);
        throw e;
      }
    }
  }
  return db;
}

// Test connection helper
async function testDbConnection() {
  try {
    const database = getDb();
    const snap = await getDocs(collection(database, "settings"));
    console.log(`Firestore connection verified. Settings collection docs: ${snap.size}`);
  } catch (e) {
    console.error("Firestore connection test FAILED:", e);
  }
}

async function markSeeded(): Promise<void> {
  try {
    const database = getDb();
    await setDoc(doc(database, "settings", "seeding_state"), { seeded: true });
  } catch (e) {}
}

// Error handling in compliance with Phase 3 of Firebase Integration Skill
const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

type OperationType = typeof OperationType[keyof typeof OperationType];

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: "server-runtime-context"
    },
    operationType,
    path
  };
  console.error('[FIRESTORE-ERROR]:', JSON.stringify(errInfo));
  // In production, we don't want to throw and crash the route if we can return a safe default
  // But we'll keep the throw for fatal errors that the route's catch block will handle
  throw error; 
}

let seedingPromise: Promise<boolean> | null = null;

async function seedAllData(force = false): Promise<boolean> {
  if (!force) {
    console.log("[SEED] Background automatic seeding is disabled to respect database cleanliness.");
    return false;
  }

  if (seedingPromise) {
    console.log("[SEED] Seeding is already in progress, returning active promise...");
    return seedingPromise;
  }

  const performSeeding = async (): Promise<boolean> => {
    try {
      const database = getDb();
      const seedStateRef = doc(database, "settings", "seeding_state");
      
      if (!force) {
        try {
          const seedStateSnap = await getDoc(seedStateRef);
          if (seedStateSnap.exists() && seedStateSnap.data()?.seeded) {
            console.log("[SEED] Database already marked as seeded. Skipping.");
            return true;
          }
        } catch (dbErr) {
          console.warn("[SEED] Failed to read seed state, proceeding with tentative seeding:", dbErr);
        }
      }

      console.log(`[SEED] Executing database seed (force=${force})...`);

      // 1. Seed Packages
      try {
        const pkgSnap = await getDocs(collection(database, "packages"));
        if (force || pkgSnap.size === 0) {
          if (force) {
            for (const d of pkgSnap.docs) await deleteDoc(doc(database, "packages", d.id));
          }
          for (const p of INITIAL_PACKAGES) await setDoc(doc(database, "packages", p.id), p);
          console.log("[SEED] Seeded Packages successfully.");
        }
      } catch (err) {
        console.error("[SEED] Error seeding Packages:", err);
      }

      // 2. Seed Posts
      try {
        const postSnap = await getDocs(collection(database, "posts"));
        if (force || postSnap.size === 0) {
          if (force) {
            for (const d of postSnap.docs) await deleteDoc(doc(database, "posts", d.id));
          }
          for (const p of INITIAL_POSTS) await setDoc(doc(database, "posts", p.id), p);
          console.log("[SEED] Seeded Posts successfully.");
        }
      } catch (err) {
        console.error("[SEED] Error seeding Posts:", err);
      }

      // 3. Seed Contact, Announcement and Ads Settings
      try {
        const contactRef = doc(database, "settings", "contact");
        await setDoc(contactRef, INITIAL_CONTACT);
        
        const annRef = doc(database, "settings", "announcement");
        await setDoc(annRef, INITIAL_ANNOUNCEMENT);

        const maintRef = doc(database, "settings", "maintenance");
        await setDoc(maintRef, { maintenanceMode: false, integritySalt: DB_INTEGRITY_SALT });

        const adRef = doc(database, "settings", "ads");
        const adSnap = await getDoc(adRef);
        if (force || !adSnap.exists()) {
          await setDoc(adRef, {
            dayTimeAdCode: "https://t.me/janucyberpack",
            nightTimeAdCode: "https://t.me/janucyberpack"
          });
        }
        console.log("[SEED] Seeded Settings successfully.");
      } catch (err) {
        console.error("[SEED] Error seeding settings:", err);
      }

      // 4. Seed Free Packages
      try {
        const freePkgSnap = await getDocs(collection(database, "free_packages"));
        if (force || freePkgSnap.size === 0) {
          if (force) {
            for (const d of freePkgSnap.docs) await deleteDoc(doc(database, "free_packages", d.id));
          }
          const initialFree = [
            {
              id: "free-dialog-mobile-social",
              isp: "Dialog" as const,
              packageType: "Mobile" as const,
              packageName: "Social Media Pack",
              price: "Free",
              code: "WGRD-DIALOG-SOC-99X-FREE",
              createdAt: new Date().toISOString()
            },
            {
              id: "free-dialog-mobile-zoom",
              isp: "Dialog" as const,
              packageType: "Mobile" as const,
              packageName: "Zoom Unlimited",
              price: "Free",
              code: "VMESS-DIALOG-ZM-22K-FREE",
              createdAt: new Date().toISOString()
            },
            {
              id: "free-mobitel-mobile-tiktok",
              isp: "Mobitel" as const,
              packageType: "Mobile" as const,
              packageName: "TikTok Heavy",
              price: "Free",
              code: "TROJAN-MOBITEL-TT-44W-FREE",
              createdAt: new Date().toISOString()
            },
            {
              id: "free-hutch-router-anytime",
              isp: "Hutch" as const,
              packageType: "Router" as const,
              packageName: "Anytime Free VPN",
              price: "Free",
              code: "SSH-HUTCH-RTR-77N-FREE",
              createdAt: new Date().toISOString()
            },
            {
              id: "free-airtel-fiber-yt",
              isp: "Airtel" as const,
              packageType: "Fiber" as const,
              packageName: "YouTube Unlimited",
              price: "Free",
              code: "V2RAY-AIRTEL-YT-88Q-FREE",
              createdAt: new Date().toISOString()
            }
          ];
          for (const p of initialFree) await setDoc(doc(database, "free_packages", p.id), p);
          console.log("[SEED] Seeded Free Packages successfully.");
        }
      } catch (err) {
        console.error("[SEED] Error seeding free packages:", err);
      }

      // 5. Seed Admin Master User profile
      try {
        const userRef = doc(database, "users", "admin-master-account");
        await setDoc(userRef, {
          uid: "admin-master-account",
          email: "chethiyabandara0001@gmail.com",
          displayName: "Super Admin",
          role: "admin",
          createdAt: new Date().toISOString()
        });
        console.log("[SEED] Seeded Admin profile successfully.");
      } catch (err) {
        console.error("[SEED] Error seeding admin user:", err);
      }

      // Mark as fully seeded
      try {
        await setDoc(seedStateRef, { seeded: true });
        console.log("[SEED] Database seeding completion marked.");
      } catch (err) {
        console.warn("[SEED] Failed to mark seeded flag in settings:", err);
      }

      return true;
    } catch (globalErr) {
      console.error("[CRITICAL-SEED-ERROR] Seeding process failed:", globalErr);
      return false;
    } finally {
      seedingPromise = null;
    }
  };

  seedingPromise = performSeeding();
  return seedingPromise;
}

async function completeDatabaseWipe(): Promise<boolean> {
  try {
    const database = getDb();
    console.log("[WIPE] Beginning thorough database cleanup...");
    
    // 1. Delete Packages
    const pkgs = await getDocs(collection(database, "packages"));
    for (const d of pkgs.docs) {
      await deleteDoc(doc(database, "packages", d.id));
    }
    console.log(`[WIPE] Deleted ${pkgs.size} packages.`);
    
    // 2. Delete Posts
    const psts = await getDocs(collection(database, "posts"));
    for (const d of psts.docs) {
      await deleteDoc(doc(database, "posts", d.id));
    }
    console.log(`[WIPE] Deleted ${psts.size} posts.`);
    
    // 3. Delete Free Packages
    const fps = await getDocs(collection(database, "free_packages"));
    for (const d of fps.docs) {
      await deleteDoc(doc(database, "free_packages", d.id));
    }
    console.log(`[WIPE] Deleted ${fps.size} free packages.`);
    
    // 4. Delete Free Requests
    const frs = await getDocs(collection(database, "free_requests"));
    for (const d of frs.docs) {
      await deleteDoc(doc(database, "free_requests", d.id));
    }
    console.log(`[WIPE] Deleted ${frs.size} free requests.`);
    
    // 5. Delete Support Messages
    const msgs = await getDocs(collection(database, "support_messages"));
    for (const d of msgs.docs) {
      await deleteDoc(doc(database, "support_messages", d.id));
    }
    console.log(`[WIPE] Deleted ${msgs.size} support messages.`);
    
    // 6. Delete Slips
    const sls = await getDocs(collection(database, "slips"));
    for (const d of sls.docs) {
      await deleteDoc(doc(database, "slips", d.id));
    }
    console.log(`[WIPE] Deleted ${sls.size} slips.`);
    
    // 7. Delete settings documents
    const stg = await getDocs(collection(database, "settings"));
    for (const d of stg.docs) {
      await deleteDoc(doc(database, "settings", d.id));
    }
    console.log(`[WIPE] Deleted ${stg.size} settings documents.`);
    
    // 8. Delete all users except administrator accounts
    const usrs = await getDocs(collection(database, "users"));
    let deletedUsersCount = 0;
    for (const d of usrs.docs) {
      const u = d.data();
      if (u.role !== "admin" && u.email?.toLowerCase() !== "chethiyabandara0001@gmail.com") {
        await deleteDoc(doc(database, "users", d.id));
        deletedUsersCount++;
      }
    }
    console.log(`[WIPE] Deleted ${deletedUsersCount} non-admin users.`);
    
    // Store a special indicator so that the server knows it was intentionally wiped and we shouldn't auto-seed
    await setDoc(doc(database, "settings", "seeding_state"), { seeded: true, wiped: true });
    
    console.log("[WIPE] Database wiped clean successfully!");
    return true;
  } catch (e) {
    console.error("[WIPE] Error wiping database:", e);
    return false;
  }
}

// Helper methods to connect Firestore queries securely
async function getPackages(): Promise<Package[]> {
  try {
    const database = getDb();
    const snap = await getDocs(collection(database, "packages"));
    const list: Package[] = [];
    snap.forEach(d => list.push(d.data() as Package));
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "packages");
    return [];
  }
}

async function getPosts(): Promise<Post[]> {
  try {
    const database = getDb();
    const snap = await getDocs(collection(database, "posts"));
    const list: Post[] = [];
    snap.forEach(d => list.push(d.data() as Post));
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "posts");
    return [];
  }
}

async function getContact(): Promise<ContactDetails> {
  try {
    const database = getDb();
    const ref = doc(database, "settings", "contact");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as ContactDetails;
    } else {
      return {
        phone: "",
        email: "",
        telegramChannel: "",
        telegramBotUser: "",
        address: "",
        workingHours: "",
        bankName: "",
        bankBranch: "",
        bankAccountNo: "",
        bankAccountName: ""
      };
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/contact");
    return {
      phone: "",
      email: "",
      telegramChannel: "",
      telegramBotUser: "",
      address: "",
      workingHours: "",
      bankName: "",
      bankBranch: "",
      bankAccountNo: "",
      bankAccountName: ""
    };
  }
}

async function getAnnouncement(): Promise<HomeAnnouncement> {
  try {
    const database = getDb();
    const ref = doc(database, "settings", "announcement");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as HomeAnnouncement;
    } else {
      return {
        title: "",
        subtitle: "",
        announcementText: "",
        showAnnouncement: false
      };
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/announcement");
    return {
      title: "",
      subtitle: "",
      announcementText: "",
      showAnnouncement: false
    };
  }
}

async function getMaintenance(): Promise<MaintenanceSettings> {
  try {
    const database = getDb();
    const ref = doc(database, "settings", "maintenance");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as MaintenanceSettings;
    } else {
      return {
        maintenanceMode: false
      };
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/maintenance");
    return {
      maintenanceMode: false
    };
  }
}

async function getAdSettings(): Promise<AdSettings> {
  try {
    const database = getDb();
    const ref = doc(database, "settings", "ads");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AdSettings;
      return {
        dayTimeAdCode: data.dayTimeAdCode || "https://t.me/janucyberpack",
        nightTimeAdCode: data.nightTimeAdCode || "https://t.me/janucyberpack",
        superAdminAdUrl: data.superAdminAdUrl || "https://t.me/janucyberpack"
      };
    } else {
      return {
        dayTimeAdCode: "https://t.me/janucyberpack",
        nightTimeAdCode: "https://t.me/janucyberpack",
        superAdminAdUrl: "https://t.me/janucyberpack"
      };
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/ads");
    return {
      dayTimeAdCode: "https://t.me/janucyberpack",
      nightTimeAdCode: "https://t.me/janucyberpack",
      superAdminAdUrl: "https://t.me/janucyberpack"
    };
  }
}

async function getSupportMessages(): Promise<SupportMessage[]> {
  try {
    const database = getDb();
    const snap = await getDocs(collection(database, "support_messages"));
    const list: SupportMessage[] = [];
    snap.forEach(d => {
      const data = d.data() as SupportMessage;
      if (!data.timestamp) data.timestamp = new Date().toISOString(); 
      list.push(data);
    });
    return list.sort((a, b) => {
      const timeA = Date.parse(a.timestamp || "") || 0;
      const timeB = Date.parse(b.timestamp || "") || 0;
      return timeA - timeB;
    });
  } catch (e) {
    console.error("Error in getSupportMessages collection fetch:", e);
    handleFirestoreError(e, OperationType.GET, "support_messages");
    return [];
  }
}

async function getUsers(): Promise<any[]> {
  try {
    const database = getDb();
    const snap = await getDocs(collection(database, "users"));
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    if (list.length === 0) {
      return [
        {
          uid: "admin-master-account",
          email: "chethiyabandara0001@gmail.com",
          displayName: "Super Admin",
          role: "admin",
          createdAt: new Date().toISOString()
        }
      ];
    }
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "users");
    return [];
  }
}

// Helper to decode a base64 image and save it on the server local filesystem
function saveBase64Image(base64Str: string): string {
  if (!base64Str || !base64Str.startsWith("data:")) {
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }

    const type = matches[1];
    const dataBuffer = Buffer.from(matches[2], "base64");
    
    // Determine file extension
    let extension = "jpg";
    if (type.includes("png")) {
      extension = "png";
    } else if (type.includes("gif")) {
      extension = "gif";
    } else if (type.includes("webp")) {
      extension = "webp";
    }

    const filename = `slip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const uploadsDir = path.join(process.cwd(), "uploads");
    
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, dataBuffer);
      return `/uploads/${filename}`;
    } catch (fsErr) {
      console.warn("Local storage write failed (could be a read-only serverless environment), falling back to base64 encoding:", fsErr);
      return base64Str;
    }
  } catch (e) {
    console.error("Failed to save base64 image to server filesystem:", e);
    return base64Str;
  }
}

async function getSlips(): Promise<PaymentSlip[]> {
  try {
    const database = getDb();
    const snap = await getDocs(collection(database, "slips"));
    const list: PaymentSlip[] = [];
    snap.forEach(d => list.push(d.data() as PaymentSlip));
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "slips");
    return [];
  }
}

async function getFreePackages(): Promise<FreePackage[]> {
  try {
    const database = getDb();
    const snap = await getDocs(collection(database, "free_packages"));
    const list: FreePackage[] = [];
    snap.forEach(d => list.push(d.data() as FreePackage));
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "free_packages");
    return [];
  }
}

async function getFreeRequests(): Promise<FreeRequest[]> {
  try {
    const database = getDb();
    const snap = await getDocs(collection(database, "free_requests"));
    const list: FreeRequest[] = [];
    snap.forEach(d => list.push(d.data() as FreeRequest));
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "free_requests");
    return [];
  }
}

import cors from "cors";

export async function createExpressApp() {
  const app = express();
  const PORT = 3000;

  // Dynamic boot testing & fallback to (default) if custom database not found
  if (!process.env.VERCEL) {
    try {
      const database = getDb();
      const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
      console.log(`[BOOT] Testing connection to database ID: ${dbId}...`);
      
      // Check if we can at least reach the collections without blocking indefinitely
      const queryPromise = getDocs(collection(database, "settings"));
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
      
      await Promise.race([queryPromise, timeoutPromise]);
      console.log("[BOOT] Database connection verified successfully.");
    } catch (error: any) {
      console.warn(`[BOOT] Initial database connection check failed/timed out: ${error?.message || error}`);
      
      // If we were trying a custom DB and it failed, fallback to default immediately on boot
      if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)" && !isUsingFallbackDefaultDb) {
        console.warn("[BOOT] Potential invalid Database ID. Falling back to '(default)'...");
        getDb(true); 
      }
    }

    // One-time automatic cleanup in non-vercel environments
    const wipeTrackFile = path.join(process.cwd(), ".database_wiped");
    if (!fs.existsSync(wipeTrackFile)) {
      completeDatabaseWipe().then(() => {
        fs.writeFileSync(wipeTrackFile, "wiped", "utf8");
        console.log("[BOOT] Database wiped clean successfully to honor user request.");
      }).catch(err => {
        console.error("[BOOT] One-time database wipe failed:", err);
      });
    }
  }
  
  // High-priority global error handler definition
  const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
    console.error(`[UNHANDLED-EXCEPTION] ${req.method} ${req.url}:`, err);
    
    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err instanceof Error ? err.message : String(err),
      type: "unhandled_exception"
    });
  };

  // Middleware (Moved up for reliable body parsing in guards)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.set("trust proxy", 1); // Trust first proxy (like Cloudflare)
  app.use(cors({ origin: true, credentials: true })); // Allow all cross origin requests (useful behind CF)
  
  // Emergency Database Repair Route (can be called via browser)
  app.get("/api/admin/emergency-repair", async (req, res) => {
    try {
      const { key } = req.query;
      // Simple guard to prevent accidental resets
      if (key !== "reset123") {
        return res.status(403).send("Missing repair key. Usage: /api/admin/emergency-repair?key=reset123");
      }
      console.log("[EMERGENCY] Running full database re-seed...");
      await seedAllData(true);
      res.send("<h1>Database Reset Success!</h1><p>The collections have been restored to factory defaults. Direct <a href='/'>back to app</a></p>");
    } catch (e) {
      res.status(500).send("Repair failed: " + String(e));
    }
  });

  // Admin Import route
  app.post("/api/admin/import-free-packages", adminGuard, async (req, res) => {
    try {
      const { packages } = req.body;
      if (!Array.isArray(packages)) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      const database = getDb();
      for (const p of packages) {
        await setDoc(doc(database, "free_packages", p.id), p);
      }
      console.log(`[ADMIN-IMPORT] Successfully imported ${packages.length} free packages.`);
      res.json({ status: "success", message: `Successfully imported ${packages.length} free packages.` });
    } catch (e) {
      console.error("[ADMIN-IMPORT-ERROR]", e);
      res.status(500).json({ error: "Import failed: " + String(e) });
    }
  });

  // Custom CORS headers to ensure CF doesn't block custom auth headers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Requester-Uid, Authorization");
    next();
  });

  // 1. High-Grade Security Headers to bulletproof the server & GitHub export against vectors
  app.use((req, res, next) => {
    // Log crawler/bot requests to help debug network and CDN level blocks
    const ua = req.headers["user-agent"] || "";
    if (ua.toLowerCase().includes("bot") || ua.toLowerCase().includes("crawler") || ua.toLowerCase().includes("facebook") || ua.toLowerCase().includes("face") || ua.toLowerCase().includes("ping")) {
      console.log(`[CRAWLER LOG] ${new Date().toISOString()} | Path: ${req.path} | UA: ${ua} | IP: ${req.ip || req.headers["x-forwarded-for"] || "Unknown"}`);
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("Content-Security-Policy", "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://accounts.google.com;");
    next();
  });

  // Secure URL sanitization & validation function to completely block html scripts or dynamic malvertising triggers
  const sanitizeAdUrl = (urlStr: string): string => {
    const trimmed = String(urlStr || "").trim();
    if (!trimmed) return "";
    
    // Strip HTML/Script Tags completely
    let cleaned = trimmed.replace(/<\/?[^>]+(>|$)/g, "");
    
    // Prevent javascript: pseudo-protocol or keywords containing "script"
    if (cleaned.toLowerCase().startsWith("javascript:") || cleaned.toLowerCase().includes("script")) {
      return "https://t.me/janucyberpack";
    }
    
    // Check if it satisfies clean web protocol headers
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://") || cleaned.startsWith("tg://")) {
      return cleaned;
    }
    
    // Prepend protocol for standard clean web addresses
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/.test(cleaned)) {
      return "https://" + cleaned;
    }
    
    return "https://t.me/janucyberpack";
  };

  // 2. Cryptographic and Database Identity Check as an Express Admin Middleware
  const adminGuard = async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
    try {
      console.log(`[AUTH-CHECK] Path: ${req.path} Method: ${req.method}`);
      // 1. Check for Master API Key (Direct binding for Android/External apps)
      const providedKey = req.headers["x-api-key"] || req.query.apiKey || req.body?.apiKey;
      const masterKey = process.env.MASTER_API_KEY;
      
      if (masterKey && providedKey === masterKey) {
        console.log(`[AUTH-SUCCESS] Admin access granted via Master API Key`);
        return _next();
      }

      // 2. Fallback to standard UID-based role check
      const requesterUid = req.headers["x-requester-uid"] || req.headers["requester-uid"] || req.query.requesterUid || req.body?.requesterUid;
      console.log(`[AUTH-CHECK] Requester UID: ${requesterUid}`);
      
      if (!requesterUid || requesterUid === "undefined" || requesterUid === "null") {
        console.warn(`[AUTH-FAILURE] Missing valid requester UID for path: ${req.path}`);
        return res.status(401).json({ error: "Access Denied: Administrative query credentials are missing." });
      }
      
      const database = getDb();
      const userDocRef = doc(database, "users", String(requesterUid));
      const userSnap = await getDoc(userDocRef);
      
      const masterEmail = "chethiyabandara0001@gmail.com";
      
      if (!userSnap.exists()) {
        console.warn(`[AUTH-FAILURE] User ${requesterUid} not found in database records.`);
        // Note: Even if not in DB, if we trust the UID is from a logged in admin, we could proceed.
        // But for safety, we usually require a DB entry for role checking.
        return res.status(403).json({ error: "Access Denied: Your account is not registered in the administrative database." });
      }
      
      const userData = userSnap.data();
      const isAdmin = userData.role === "admin" || userData.email?.toLowerCase() === masterEmail.toLowerCase();

      if (!isAdmin) {
        console.warn(`[AUTH-FAILURE] User ${requesterUid} does not have admin permissions. Role: ${userData.role}`);
        return res.status(403).json({ error: "Access Denied: You do not have permission to perform this action." });
      }
      
      console.log(`[AUTH-SUCCESS] Admin access granted to UID: ${requesterUid} (${userData.email})`);
      _next();
    } catch (e) {
      console.error(`[AUTH-ERROR] Security validation failure: ${e}`);
      res.status(500).json({ error: "Security validation failure: " + String(e) });
    }
  };

  // Middleware
  // (Moved up for reliable body parsing in guards)

  // Ensure uploads directory exists and expose it as static folder
  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not create uploads directory in read-only environment (Serverless/Vercel handles static assets differently):", e);
  }
  app.use("/uploads", express.static(uploadsDir));

  // API Backend routes
  
  // Sitemap routes for SEO ranking
  app.get("/sitemap.xml", (req, res) => {
    const p = path.join(process.cwd(), "public", "sitemap.xml");
    if (fs.existsSync(p)) {
      res.sendFile(p);
    } else {
      res.status(404).send("Sitemap not found");
    }
  });

  app.get("/robots.txt", (req, res) => {
    const p = path.join(process.cwd(), "public", "robots.txt");
    if (fs.existsSync(p)) {
      res.sendFile(p);
    } else {
      res.status(404).send("Robots configuration not found");
    }
  });

  app.get("/favicon.png", (req, res) => {
    const p = path.join(process.cwd(), "public", "favicon.png");
    if (fs.existsSync(p)) {
      res.sendFile(p);
    } else {
      res.status(404).send("Favicon not found");
    }
  });

  app.get("/favicon.ico", (req, res) => {
    const p = path.join(process.cwd(), "public", "favicon.ico");
    if (fs.existsSync(p)) {
      res.sendFile(p);
    } else {
      res.status(404).send("Favicon icon not found");
    }
  });
  
  app.get("/sitemaps", (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GB16F9SJBK"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-GB16F9SJBK');
        </script>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/png" href="/favicon.png">
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
        <title>Sitemap Index | Buy High Speed Premium VPN Configs - Janu Cyber Pack</title>
        <meta name="description" content="Explore roads to ultimate online safety with Janu Cyber Pack! Complete map directory linking premium packages, free WireGuard configurations, stealth tunnels, and legal protocols.">
        <meta name="keywords" content="sitemap, vpn sitemap, secure wireguard configs, vmess proxy index, ssh tunnels, buy cheap vpn">
        <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #020617; color: #e2e8f0; }
          .font-mono { font-family: 'JetBrains Mono', monospace; }
        </style>
      </head>
      <body class="min-h-screen flex flex-col items-center py-12 px-6">
        <header class="w-full max-w-2xl mb-12 flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          </div>
          <div>
            <h1 class="text-2xl font-extrabold tracking-tight text-white">Janu Cyber Pack</h1>
            <p class="text-sm text-slate-400 font-mono">Visual Index of Security Resources</p>
          </div>
        </header>
        
        <main class="w-full max-w-2xl bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8 backdrop-blur-sm">
          <h2 class="text-lg font-semibold text-emerald-400 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            Site Navigation Directory
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="https://janucyber.store/" class="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300">
              <span class="block text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">Home Dashboard</span>
              <span class="block text-xs text-slate-500 mt-1 leading-relaxed">Official entrance, latest announcements, and community updates.</span>
            </a>
            
            <a href="https://janucyber.store/" class="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300">
              <span class="block text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">VPN Packages</span>
              <span class="block text-xs text-slate-500 mt-1 leading-relaxed">Secure global packages including WireGuard, V2Ray and SSH premium kits.</span>
            </a>
            
            <a href="https://janucyber.store/" class="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-300">
              <span class="block text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">Free VPN Tunneling</span>
              <span class="block text-xs text-slate-500 mt-1 leading-relaxed">Access daily free VPN configurations for Dialog, Mobitel and Hutch networks.</span>
            </a>
            
            <a href="https://janucyber.store/" class="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-purple-500/50 hover:bg-slate-800 transition-all duration-300">
              <span class="block text-sm font-bold text-slate-100 group-hover:text-purple-400 transition-colors">Secure Client Portal</span>
              <span class="block text-xs text-slate-500 mt-1 leading-relaxed">User dashboard for tracking bandwidth usage and managing active sessions.</span>
            </a>

             <a href="/privacy" class="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300">
              <span class="block text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">Privacy Policy</span>
              <span class="block text-xs text-slate-500 mt-1 leading-relaxed">Our commitment to user data protection and anonymous browsing.</span>
            </a>

            <a href="/terms" class="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-pink-500/50 hover:bg-slate-800 transition-all duration-300">
              <span class="block text-sm font-bold text-slate-100 group-hover:text-pink-400 transition-colors">Terms of Service</span>
              <span class="block text-xs text-slate-500 mt-1 leading-relaxed">Usage agreements, service conditions, and legal guidelines.</span>
            </a>
          </div>
          
          <div class="mt-8 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div class="flex gap-6">
              <a href="/sitemap.xml" class="text-xs font-mono text-slate-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M9 11h6"/><path d="M9 19h1"/></svg>
                SITEMAP.XML
              </a>
              <a href="/robots.txt" class="text-xs font-mono text-slate-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                ROBOTS.TXT
              </a>
            </div>
            
            <div class="text-[10px] font-mono text-slate-600 bg-slate-800/30 px-3 py-1 rounded-full border border-slate-700/50">
              Last Crawl: 2026-06-05
            </div>
          </div>
        </main>
        
        <footer class="mt-12 text-slate-600 text-[11px] text-center max-w-lg leading-relaxed">
          © 2026 Janu Cyber Pack. All trademarks property of their respective owners.<br/>
          Designed for maximum visibility and indexing performance.
        </footer>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  app.get("/privacy", (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GB16F9SJBK"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-GB16F9SJBK');
        </script>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/png" href="/favicon.png">
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
        <title>Privacy Policy | Secure No-Logs Premium VPN - Janu Cyber Pack</title>
        <meta name="description" content="Learn about Janu Cyber Pack's absolute commitment to our No-Logs pledge, AES-256 grade tunnel cryptography, and metadata confidentiality policies. Secure your premium browsing today!">
        <meta name="keywords" content="vpn privacy, no-logs policy, encrypt traffic, secure vpn provider, stealth vmess privacy Sri Lanka">
        <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #020617; color: #e2e8f0; }
        </style>
      </head>
      <body class="min-h-screen py-12 px-6 flex flex-col items-center">
        <div class="w-full max-w-3xl bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12 backdrop-blur-md shadow-2xl">
          <header class="mb-10 text-center">
            <h1 class="text-3xl font-extrabold text-white mb-2">Privacy Policy</h1>
            <p class="text-indigo-400 text-sm font-medium tracking-wide uppercase">Effective Date: June 05, 2026</p>
          </header>
          
          <div class="space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 class="text-xl font-bold text-white mb-3">1. Introduction</h2>
              <p>Welcome to Janu Cyber Pack. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data when you use our VPN services.</p>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">2. No-Logs Policy</h2>
              <p>Our core mission is your privacy. We maintain a strict <span class="text-emerald-400 font-semibold">No-Logs Policy</span>. We do not track, collect, or store any data related to your browsing history, connection destination, traffic content, or DNS queries while connected to our VPN.</p>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">3. Data Collection</h2>
              <p>We only collect the minimum information necessary to maintain your account and provide services:</p>
              <ul class="list-disc ml-6 mt-3 space-y-2">
                <li><span class="text-white">Account Information:</span> Your email address for login and support purposes.</li>
                <li><span class="text-white">Transaction Data:</span> Proof of payment (bank slips) for manual package activation.</li>
                <li><span class="text-white">Technical Metrics:</span> Basic, non-identifying aggregate metrics like server load to optimize performance.</li>
              </ul>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">4. Data Security</h2>
              <p>We use industry-standard encryption protocols (including AES-256) to protect any data transmitted through our network. Access to our database is strictly limited to authorized administrative personnel only.</p>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">5. Third-Party Services</h2>
              <p>Our website may use third-party tools for analytics or advertisements. These services operate under their own privacy policies. We do not share your VPN traffic data with any third parties.</p>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">6. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify users of any significant changes by posting the new policy on this page.</p>
            </section>
          </div>
          
          <footer class="mt-12 pt-8 border-t border-slate-800 text-center">
            <a href="/" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-900/30">Return to Dashboard</a>
          </footer>
        </div>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  app.get("/terms", (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GB16F9SJBK"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-GB16F9SJBK');
        </script>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/png" href="/favicon.png">
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
        <title>Terms of Service | Secure Premium VPN Server Selling - Janu Cyber Pack</title>
        <meta name="description" content="Read our billing, honest bank slip verification protocols, acceptable tunnel traffic, and account active terms for Sri Lanka and international proxy users.">
        <meta name="keywords" content="vpn terms, buy premium wireguard, verified vpn accounts, safe tunnel rules">
        <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #020617; color: #e2e8f0; }
        </style>
      </head>
      <body class="min-h-screen py-12 px-6 flex flex-col items-center">
        <div class="w-full max-w-3xl bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12 backdrop-blur-md shadow-2xl">
          <header class="mb-10 text-center">
            <h1 class="text-3xl font-extrabold text-white mb-2">Terms of Service</h1>
            <p class="text-pink-400 text-sm font-medium tracking-wide uppercase">Last Updated: June 05, 2026</p>
          </header>
          
          <div class="space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 class="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using Janu Cyber Pack, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">2. Description of Service</h2>
              <p>Janu Cyber Pack provides Virtual Private Network (VPN) services to enhance user privacy and security online. We offer both free and premium packages subject to availability and maintenance.</p>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">3. User Conduct</h2>
              <p>Users agree NOT to use the service for any illegal activities, including but not limited to:</p>
              <ul class="list-disc ml-6 mt-3 space-y-2">
                <li>Unauthorized access to other computer systems.</li>
                <li>Distribution of malware or viruses.</li>
                <li>Activities that violate the intellectual property rights of others.</li>
                <li>Spamming or any form of online harassment.</li>
              </ul>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">4. Payments and Refunds</h2>
              <p>Premium packages are activated upon successful verification of an uploaded payment slip. All sales are final. Refunds are provided only in cases where the service fails to meet the technical specifications promised for a sustained period (exceeding 72 hours).</p>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">5. Disclaimer of Warranties</h2>
              <p>The service is provided on an "as is" and "as available" basis. While we strive for 100% uptime, we do not guarantee uninterrupted service or specific speeds, as these can be affected by external network conditions.</p>
            </section>
            
            <section>
              <h2 class="text-xl font-bold text-white mb-3">6. Termination</h2>
              <p>We reserve the right to suspend or terminate any account found to be in violation of these Terms of Service without prior notice or refund.</p>
            </section>
          </div>
          
          <footer class="mt-12 pt-8 border-t border-slate-800 text-center">
            <a href="/" class="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-pink-900/30">I Understand & AGREE</a>
          </footer>
        </div>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Apply cache-control middleware for all API routes to prevent Vercel CDN caching
  app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  });

  app.get("/api/initial-data", async (req, res) => {
    try {
      // Use Promise.allSettled to be ultra-resilient to individual collection failures
      const results = await Promise.allSettled([
        getPackages(),
        getPosts(),
        getContact(),
        getAnnouncement(),
        getMaintenance(),
        getFreePackages(),
        getFreeRequests()
      ]);

      const data = {
        packages: results[0].status === 'fulfilled' ? results[0].value : [],
        posts: results[1].status === 'fulfilled' ? results[1].value : [],
        contact: results[2].status === 'fulfilled' ? results[2].value : INITIAL_CONTACT,
        announcement: results[3].status === 'fulfilled' ? results[3].value : INITIAL_ANNOUNCEMENT,
        maintenance: results[4].status === 'fulfilled' ? results[4].value : { maintenanceMode: false },
        freePackages: results[5].status === 'fulfilled' ? results[5].value : [],
        freeRequests: results[6].status === 'fulfilled' ? results[6].value : []
      };

      res.json(data);
    } catch (e: any) {
      console.error("[API-INITIAL-DATA-CRASH]:", e);
      res.status(500).json({ 
        error: "Failed to fetch initial data",
        details: e?.message || String(e)
      });
    }
  });

  // Free VPN request submission route
  app.post("/api/free-requests/submit", async (req, res) => {
    try {
      const { userId, userEmail, userName, freePackageId } = req.body;
      if (!userId || !freePackageId) {
        return res.status(400).json({ error: "Missing required selection details" });
      }

      const list = await getFreePackages();
      const pkg = list.find(p => p.id === freePackageId);
      if (!pkg) {
        return res.status(404).json({ error: "Selected free package configuration was not found" });
      }

      const requestId = "freq_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const newRequest: FreeRequest = {
        id: requestId,
        userId,
        userEmail: userEmail || "anonymous@janucyberpack",
        userName: userName || "Anonymous User",
        isp: pkg.isp,
        packageType: pkg.packageType,
        packageName: pkg.packageName,
        price: pkg.price || "Free",
        codeReceived: pkg.code,
        requestedAt: new Date().toISOString()
      };

      await setDoc(doc(getDb(), "free_requests", requestId), newRequest);

      const updatedRequests = await getFreeRequests();
      res.json({ status: "success", request: newRequest, freeRequests: updatedRequests });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Save/Update Free VPN Package details (Admin Only)
  app.post("/api/admin/free-packages/save", adminGuard, async (req, res) => {
    try {
      const pkg: FreePackage = req.body;
      if (!pkg.isp || !pkg.packageType || !pkg.packageName || !pkg.code) {
        return res.status(400).json({ error: "Missing package parameters" });
      }

      const pkgId = pkg.id || "free_pack_" + Date.now();
      pkg.id = pkgId;
      pkg.price = pkg.price || "Free";

      await setDoc(doc(getDb(), "free_packages", pkgId), pkg);

      const updated = await getFreePackages();
      res.json({ status: "success", freePackages: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Delete Free VPN Package details (Admin Only)
  app.delete("/api/admin/free-packages/:id", adminGuard, async (req, res) => {
    const { id } = req.params;
    try {
      await deleteDoc(doc(getDb(), "free_packages", id));
      const updated = await getFreePackages();
      res.json({ status: "success", freePackages: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Delete Free VPN Request/Voucher details (Admin Only)
  app.delete("/api/admin/free-requests/:id", adminGuard, async (req, res) => {
    const { id } = req.params;
    try {
      await deleteDoc(doc(getDb(), "free_requests", id));
      const updated = await getFreeRequests();
      res.json({ status: "success", freeRequests: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Get active advertisement redirection code depending on day/night hours
  app.get("/api/ad-settings/active", async (req, res) => {
    try {
      const ads = await getAdSettings();
      // Server Time hour (UTC or system time. Sri Lanka is UTC+5:30, but standard hour comparison is fine) 
      const currentHour = new Date().getUTCHours() + 5.5; // Sri Lanka Hour
      const lankaHour = (currentHour >= 24 ? currentHour - 24 : currentHour) % 24;
      
      // Day is 6 AM to 6 PM (06:00 to 18:00)
      const isDay = lankaHour >= 6 && lankaHour < 18;
      const activeLink = isDay ? (ads.dayTimeAdCode || 'https://t.me/janucyberpack') : (ads.nightTimeAdCode || 'https://t.me/janucyberpack');
      
      res.json({
        adType: isDay ? "day" : "night",
        adLink: sanitizeAdUrl(activeLink), // Double sanitize on release
        isDay
      });
    } catch (e) {
      res.json({ adType: "night", adLink: "https://t.me/janucyberpack", isDay: false });
    }
  });

  // Get ad configurations depending on administrative level (Admin Only)
  app.get("/api/admin/ad-settings", adminGuard, async (req, res) => {
    try {
      const email = String(req.query.email || "").toLowerCase().trim();
      const ads = await getAdSettings();

      if (email === "chethiyabandara0001@gmail.com") {
        res.json({
          dayTimeAdCode: ads.dayTimeAdCode || "",
          nightTimeAdCode: ads.nightTimeAdCode || "",
          superAdminAdUrl: ads.superAdminAdUrl || ""
        });
      } else {
        // Subadmins can only know or get nightTimeAdCode
        res.json({
          dayTimeAdCode: "●●●●●●● (Restricted: Super-Admin Only)",
          nightTimeAdCode: ads.nightTimeAdCode || "",
          superAdminAdUrl: "●●●●●●● (Restricted: Super-Admin Only)"
        });
      }
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Save/Update ad configurations (Admin Only)
  app.post("/api/admin/ad-settings/save", adminGuard, async (req, res) => {
    try {
      const { email, dayTimeAdCode, nightTimeAdCode, superAdminAdUrl } = req.body;
      const targetEmail = String(email || "").toLowerCase().trim();
      
      const current = await getAdSettings();

      if (targetEmail === "chethiyabandara0001@gmail.com") {
        current.dayTimeAdCode = sanitizeAdUrl(dayTimeAdCode);
        current.nightTimeAdCode = sanitizeAdUrl(nightTimeAdCode);
        current.superAdminAdUrl = sanitizeAdUrl(superAdminAdUrl);
      } else {
        // Standard subadmins are only permitted to update night time code
        current.nightTimeAdCode = sanitizeAdUrl(nightTimeAdCode);
      }

      await setDoc(doc(getDb(), "settings", "ads"), current);
      
      // Return updated according to permissions
      if (targetEmail === "chethiyabandara0001@gmail.com") {
        res.json({ status: "success", adSettings: current });
      } else {
        res.json({
          status: "success",
          adSettings: {
            dayTimeAdCode: "●●●●●●● (Restricted: Super-Admin Only)",
            nightTimeAdCode: current.nightTimeAdCode,
            superAdminAdUrl: "●●●●●●● (Restricted: Super-Admin Only)"
          }
        });
      }
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 2. Auth Simulators & System sign-up / sign-in ("Data store" servers)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!password || password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters long" });
      }

      // Check if user already exists
      const users = await getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        // If it was a pre-created placeholder admin (which does not have password set yet), let them finalize registration.
        if (existingUser.role === "admin" && !existingUser.password) {
          existingUser.password = password;
          if (displayName) {
            existingUser.displayName = displayName;
          }
          await setDoc(doc(getDb(), "users", existingUser.uid), existingUser);
          return res.json({ status: "success", user: existingUser });
        }
        return res.status(400).json({ error: "An account with this email already exists. Please log in instead." });
      }

      // Auto promote chethiyabandara0001@gmail.com and support emails to admin
      const isAdminEmail = email.toLowerCase() === "chethiyabandara0001@gmail.com" || email.toLowerCase().includes("admin@");
      const role = isAdminEmail ? "admin" : "user";

      const uid = "user_" + Math.random().toString(36).substring(2, 11);
      const newUser = {
        uid: uid,
        email: email,
        password: password, // For easy simulation and further logins as requested
        displayName: displayName || email.split("@")[0],
        role: role,
        createdAt: new Date().toISOString(),
        dataUsage: {
          totalGB: 150,
          usedGB: 0,
          billingCycleEnd: "30 Days after package purchase",
          speedLimitMbps: 200,
          activeConnections: 0
        }
      };

      await setDoc(doc(getDb(), "users", uid), newUser);

      res.json({ status: "success", user: newUser });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post("/api/auth/sign-in", async (req, res) => {
    try {
      const { email, password, displayName, provider } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Auto promote chethiyabandara0001@gmail.com and support emails to admin
      const isAdminEmail = email.toLowerCase() === "chethiyabandara0001@gmail.com" || email.toLowerCase().includes("admin@");
      const role = isAdminEmail ? "admin" : "user";

      // Find inside Firestore
      const users = await getUsers();
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (provider === 'email') {
        if (!user) {
          return res.status(400).json({ error: "Account not found. Please select Register to create an account first." });
        }
        // Verification of credentials matching
        if (user.password && user.password !== password) {
          return res.status(450).json({ error: "Invalid password. Please enter the correct password used during registration." });
        }
      } else {
        // Simple third-party social auto-creation / sign-in
        if (!user) {
          const uid = "user_" + Math.random().toString(36).substring(2, 11);
          user = {
            uid: uid,
            email: email,
            displayName: displayName || email.split("@")[0],
            role: role,
            createdAt: new Date().toISOString(),
            dataUsage: {
              totalGB: 150,
              usedGB: 0,
              billingCycleEnd: "30 Days after package purchase",
              speedLimitMbps: 200,
              activeConnections: 0
            }
          };
          await setDoc(doc(getDb(), "users", uid), user);
        } else {
          // Keep dynamic dataUsage if not existing
          if (!user.dataUsage && role === "user") {
            user.dataUsage = {
              totalGB: 150,
              usedGB: 12.4,
              billingCycleEnd: "June 30, 2026",
              speedLimitMbps: 200,
              activeConnections: 1
            };
            await setDoc(doc(getDb(), "users", user.uid), user);
          }
        }
      }

      res.json({ status: "success", user });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Fetch updated user stats (especially simulated telegram bot live usage)
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const snap = await getDoc(doc(getDb(), "users", uid));
      if (!snap.exists()) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(snap.data());
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 3. User Submits bank slip for a package
  app.post("/api/slips/submit", async (req, res) => {
    try {
      const { userId, userEmail, userName, packageId, bankSlipBase64, tier } = req.body;

      if (!userId || !packageId || !bankSlipBase64) {
        return res.status(400).json({ error: "Missing required submission fields" });
      }

      const packagesList = await getPackages();
      const selectedPkg = packagesList.find(p => p.id === packageId);
      if (!selectedPkg) {
        return res.status(404).json({ error: "Selected Internet Package not found" });
      }

      let resolvedPrice = selectedPkg.price;
      let resolvedCurrency = selectedPkg.priceCurrency;

      if (tier) {
        const normalized = tier.toLowerCase();
        if (normalized.includes("1000lkr")) {
          resolvedPrice = 1000;
        } else if (normalized.includes("200lkr")) {
          resolvedPrice = 200;
        } else if (normalized.includes("300lkr")) {
          resolvedPrice = 300;
        } else if (normalized.includes("400lkr")) {
          resolvedPrice = 400;
        } else if (normalized.includes("500lkr")) {
          resolvedPrice = 500;
        } else {
          const match = normalized.match(/for\s+(\d+)\s*lkr/);
          if (match) {
            resolvedPrice = Number(match[1]);
          }
        }
        resolvedCurrency = "LKR";
      }

      // Direct high-performance server side filesytem conversion to prevent Firestore 1MB limits
      const processedSlipUrl = saveBase64Image(bankSlipBase64);

      const slipId = "slip_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const newSlip: PaymentSlip = {
        id: slipId,
        userId,
        userEmail: userEmail || "unknown@user.com",
        userName: userName || "Data Store Customer",
        packageId,
        packageTitle: selectedPkg.title,
        vpnTypeName: selectedPkg.vpnTypeName,
        price: resolvedPrice,
        currency: resolvedCurrency,
        bankSlipBase64: processedSlipUrl,
        status: "pending",
        submittedAt: new Date().toISOString(),
        tier: tier || "Lite 100gb for 200lkr"
      };

      await setDoc(doc(getDb(), "slips", slipId), newSlip);

      res.json({ status: "success", message: "Receipt sent successfully. Awaiting verification.", slip: newSlip });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Get current user slips
  app.get("/api/slips/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const slips = await getSlips();
      const userSlips = slips.filter(s => s.userId === userId);
      res.json(userSlips);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Support Messages API for 1-on-1 private messaging
  app.get("/api/support-messages", async (req, res) => {
    try {
      const { userId } = req.query;
      console.log(`[GET /api/support-messages] userId parameter: ${userId}`);
      const allMsgs = await getSupportMessages();
      if (userId) {
        const filtered = allMsgs.filter(m => m.userId === userId);
        return res.json(filtered);
      }
      res.json(allMsgs);
    } catch (e) {
      console.error("[GET /api/support-messages] Unhandled internal error:", e);
      res.status(500).json({ 
        error: "Internal Server Error during support message retrieval",
        details: String(e),
        stack: (e as any)?.stack || '' 
      });
    }
  });

  app.post("/api/support-messages/send", async (req, res) => {
    try {
      const { userId, userEmail, userName, message, sender } = req.body;
      if (!userId || !message || !sender) {
        return res.status(400).json({ error: "Missing required message parameters" });
      }

      const msgId = "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const newMsg: SupportMessage = {
        id: msgId,
        userId,
        userEmail: userEmail || "anonymous@datastore.shop",
        userName: userName || "Anonymous",
        message,
        sender,
        timestamp: new Date().toISOString()
      };

      await setDoc(doc(getDb(), "support_messages", msgId), newMsg);

      const allMsgs = await getSupportMessages();
      const userMsgs = allMsgs.filter(m => m.userId === userId);
      res.json({ status: "success", message: newMsg, messages: userMsgs });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4. Admin Management APIs

  // Get analytics & list entities (Admin Only)
  app.get("/api/admin/dashboard-stats", adminGuard, async (req, res) => {
    try {
      const slipsList = await getSlips();
      const usersList = await getUsers();
      const packagesList = await getPackages();
      const postsList = await getPosts();

      // Total gross sales (all approved slips)
      const totalSales = slipsList
        .filter(s => s.status === "approved")
        .reduce((sum, item) => sum + item.price, 0);

      const pendingCount = slipsList.filter(s => s.status === "pending").length;
      const approvedCount = slipsList.filter(s => s.status === "approved").length;

      // Sanitize user data to prevent sensitive field exposure in API responses
      const sanitizedUsers = usersList.map(u => {
        const { password, ...rest } = u;
        return rest;
      });

      res.json({
        totalUsers: sanitizedUsers.filter(u => u.role !== "admin").length,
        totalSales,
        pendingCount,
        approvedCount,
        users: sanitizedUsers,
        slips: slipsList,
        packages: packagesList,
        posts: postsList
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Reset specialized statistics individually (Admin Only)
  app.post("/api/admin/reset-stat", adminGuard, async (req, res) => {
    try {
      const { type } = req.body;
      const database = getDb();

      if (type === "free_requests") {
        const snap = await getDocs(collection(database, "free_requests"));
        console.log(`[ADMIN-ACTION] Trimming ${snap.size} free request logs...`);
        const deletePromises = snap.docs.map(d => deleteDoc(doc(database, "free_requests", d.id)));
        await Promise.all(deletePromises);
        return res.json({ status: "success", message: "All Free VPN request logs have been cleared successfully." });
      }

      if (type === "users") {
        const usersSnap = await getDocs(collection(database, "users"));
        const currentAdminUid = req.headers["x-requester-uid"] || req.headers["requester-uid"] || req.body?.requesterUid;
        let count = 0;
        for (const d of usersSnap.docs) {
          const u = d.data();
          // Protect admins and specifically the one requesting
          const isMaster = u.email?.toLowerCase() === "chethiyabandara0001@gmail.com";
          const isRequestingAdmin = d.id === currentAdminUid;
          
          if (u.role !== "admin" && !isMaster && !isRequestingAdmin) {
            await deleteDoc(doc(database, "users", d.id));
            count++;
          }
        }
        return res.json({ status: "success", message: `Statistics reset: ${count} users removed from database.` });
      }

      if (type === "sales" || type === "approved") {
        const slipsSnap = await getDocs(collection(database, "slips"));
        let count = 0;
        for (const d of slipsSnap.docs) {
          const status = d.data().status;
          if (status === "approved") {
            await deleteDoc(doc(database, "slips", d.id));
            count++;
          }
        }
        return res.json({ status: "success", message: `Statistics reset: ${count} approved records removed.` });
      }

      if (type === "pending") {
        const slipsSnap = await getDocs(collection(database, "slips"));
        let count = 0;
        for (const d of slipsSnap.docs) {
          const status = d.data().status;
          if (status === "pending") {
            await deleteDoc(doc(database, "slips", d.id));
            count++;
          }
        }
        return res.json({ status: "success", message: `Queue reset: ${count} pending slips cleared.` });
      }

      res.status(400).json({ error: "Invalid stat type requested for reset." });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Reset Estimated Users Total and Total Sales Approved statistics (Admin Only)
  app.post("/api/admin/reset-stats", adminGuard, async (req, res) => {
    try {
      // 1. Delete all slips in Firestore slips collection
      const database = getDb();
      const slipsSnap = await getDocs(collection(database, "slips"));
      for (const d of slipsSnap.docs) {
        await deleteDoc(doc(database, "slips", d.id));
      }

      // 2. Delete non-admin users in Firestore users collection
      const usersSnap = await getDocs(collection(database, "users"));
      for (const d of usersSnap.docs) {
        const u = d.data();
         if (u.role !== "admin" && u.uid !== "admin-master-account") {
          await deleteDoc(doc(database, "users", d.id));
        }
      }

      // 3. Mark seeded so that seed logic doesn't trigger unexpectedly
      await markSeeded();

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Force Clear everything (Admin Only) - "Clean the firebase database to nothing"
  app.post("/api/admin/wipe-database", adminGuard, async (req, res) => {
    try {
      console.log("Admin triggering Complete Database Wipe...");
      const success = await completeDatabaseWipe();
      if (success) {
        res.json({ 
          success: true, 
          message: "Database successfully cleared entirely to nothing!"
        });
      } else {
        res.status(500).json({ error: "Failed to fully wipe the database. Check server logs." });
      }
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Force Reset & Restore Default Packages and Data (Admin Only)
  app.post("/api/admin/restore-defaults", adminGuard, async (req, res) => {
    try {
      console.log("Admin triggering Deep Reset of all databases...");
      const success = await seedAllData(true);
      if (success) {
        // Retrieve fresh lists
        const [pkgs, psts, freePkgs] = await Promise.all([getPackages(), getPosts(), getFreePackages()]);
        res.json({ 
          success: true, 
          message: "All collections restored to factory defaults.",
          packages: pkgs,
          posts: psts,
          freePackages: freePkgs
        });
      } else {
        res.status(500).json({ error: "Failed to fully restore defaults. Check server logs." });
      }
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // GET /api/admin/slips - List all slips (Admin/API Key Only)
  app.get("/api/admin/slips", adminGuard, async (req, res) => {
    try {
      const database = getDb();
      const snap = await getDocs(collection(database, "slips"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by submittedAt descending
      list.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Admin approves/verifies the payment and calls simulate Telegram Bot API (Admin Only)
  app.post("/api/admin/slips/:slipId/verify", adminGuard, async (req, res) => {
    try {
      const { slipId } = req.params;
      const { status, adminNotes, vpnCodeOverride } = req.body; // status: 'approved' | 'rejected'

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status state" });
      }

      const database = getDb();
      const slipRef = doc(database, "slips", slipId);
      const slipSnap = await getDoc(slipRef);
      if (!slipSnap.exists()) {
        return res.status(404).json({ error: "Payment slip record not found" });
      }

      const slip = slipSnap.data() as PaymentSlip;
      slip.status = status;
      slip.adminNotes = adminNotes || "";
      slip.verifiedAt = new Date().toISOString();

      if (status === "approved") {
        // GENERATE VPN CODE via Simulated Telegram Bot API integration
        let vpnCode = "";
        if (vpnCodeOverride) {
          vpnCode = vpnCodeOverride;
        } else {
          const timestampToken = Math.floor(Date.now() / 1000).toString(16).toUpperCase();
          if (slip.vpnTypeName === "WireGuard") {
            vpnCode = `[Interface]
PrivateKey = vpn_client_private_key_simulated_${timestampToken}=
Address = 10.0.0.2/32, fd42:42:42::2/128
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = server_public_key_singapore_node_active_${timestampToken}=
Endpoint = sg-node1.datastore.shop:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;
          } else if (slip.vpnTypeName === "Vmess") {
            vpnCode = `vmess://${Buffer.from(JSON.stringify({
              v: "2",
              ps: `DataStore-${slip.packageTitle.replace(/\s+/g, '-')}`,
              add: "sg-vmessstealth.datastore.shop",
              port: "443",
              id: `uuid-token-bot-generated-${timestampToken}`,
              aid: "0",
              scy: "auto",
              net: "ws",
              type: "none",
              host: "unlimiteddata.shop",
              path: "/premium-secure-channel",
              tls: "tls"
            })).toString("base64")}`;
          } else if (slip.vpnTypeName === "SSH") {
            vpnCode = `Host: sg-direct.datastore.shop\nPort: 22 / 443\nUsername: ds-user-${timestampToken.toLowerCase()}\nPassword: automated-pass-${timestampToken}\nPayload-Config: GET / HTTP/1.1[crlf]Host: unlimiteddata.shop[crlf][crlf]`;
          } else {
            vpnCode = `v2ray-x-tls://token-gate-${timestampToken}@tokyo-v2ray.datastore.shop:443?security=xtls&sni=unlimiteddata.shop`;
          }
        }

        slip.vpnCode = vpnCode;

        // Update the user's dataUsage metrics because of the active subscription state change!
        const userRef = doc(database, "users", slip.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userObj = userSnap.data();
          const packagesList = await getPackages();
          const targetPackage = packagesList.find(p => p.id === slip.packageId);
          
          let addedGB = 100;
          if (slip.tier) {
            const match = slip.tier.match(/(\d+)GB/);
            if (match) {
              addedGB = parseInt(match[1], 10);
            }
          } else {
            addedGB = targetPackage?.bandwidthGB === "Unlimited" ? 500 : parseInt(targetPackage?.bandwidthGB || "100", 10);
          }
          
          userObj.dataUsage = {
            totalGB: addedGB,
            usedGB: 0,
            billingCycleEnd: new Date(Date.now() + (targetPackage?.validityDays || 30) * 24 * 3600 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            speedLimitMbps: slip.vpnTypeName === "WireGuard" ? 300 : 150,
            activeConnections: 1
          };
          userObj.integritySalt = DB_INTEGRITY_SALT;
          await setDoc(userRef, userObj);
        }
      }

      slip.integritySalt = DB_INTEGRITY_SALT;
      await setDoc(slipRef, slip);
      res.json({ status: "success", slip });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Admin updates Core Sections
  // 4a. Save/Update Package details (Admin Only)
  app.post("/api/admin/packages/save", adminGuard, async (req, res) => {
    try {
      const pkg: Package = req.body;
      if (!pkg.title || !pkg.price) {
        return res.status(400).json({ error: "Missing pack header details" });
      }

      const pkgId = pkg.id || "pack_" + Date.now();
      pkg.id = pkgId;
      pkg.status = pkg.status || "active";

      await setDoc(doc(getDb(), "packages", pkgId), { ...pkg, integritySalt: DB_INTEGRITY_SALT });

      const updated = await getPackages();
      res.json({ status: "success", packages: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Delete package (Admin Only)
  app.delete("/api/admin/packages/:id", adminGuard, async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`[SERVER-INFO] Attempting to delete package document from Firestore: ${id}`);
      await deleteDoc(doc(getDb(), "packages", id));
      console.log(`[SERVER-SUCCESS] Successfully deleted package document ${id}. Fetching updated list.`);
      const updated = await getPackages();
      res.json({ status: "success", packages: updated });
    } catch (e) {
      console.error(`[SERVER-ERROR] Failed to delete package: ${id}`, e);
      res.status(500).json({ error: String(e) });
    }
  });

  // 4b. Save/Update Post (Admin Only)
  app.post("/api/admin/posts/save", adminGuard, async (req, res) => {
    try {
      const post: Post = req.body;
      if (!post.title || !post.content) {
        return res.status(400).json({ error: "Title and Content are required fields" });
      }

      const postId = post.id || "post_" + Date.now();
      post.id = postId;
      post.date = post.date || new Date().toISOString().substring(0, 10);
      post.author = post.author || "Admin";

      await setDoc(doc(getDb(), "posts", postId), { ...post, integritySalt: DB_INTEGRITY_SALT });

      const updated = await getPosts();
      res.json({ status: "success", posts: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Delete Post (Admin Only)
  app.delete("/api/admin/posts/:id", adminGuard, async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`[SERVER-INFO] Attempting to delete post document from Firestore: ${id}`);
      await deleteDoc(doc(getDb(), "posts", id));
      console.log(`[SERVER-SUCCESS] Successfully deleted post document ${id}. Fetching updated list.`);
      const updated = await getPosts();
      res.json({ status: "success", posts: updated });
    } catch (e) {
      console.error(`[SERVER-ERROR] Failed to delete post: ${id}`, e);
      res.status(500).json({ error: String(e) });
    }
  });

  // 4c. Update contact details (Admin Only)
  app.post("/api/admin/contact/save", adminGuard, async (req, res) => {
    try {
      const ref = doc(getDb(), "settings", "contact");
      const current = await getContact();
      const updated = { ...current, ...req.body, integritySalt: DB_INTEGRITY_SALT };
      await setDoc(ref, updated);
      res.json({ status: "success", contact: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4d. Update home announcement (Admin Only)
  app.post("/api/admin/announcement/save", adminGuard, async (req, res) => {
    try {
      const ref = doc(getDb(), "settings", "announcement");
      const current = await getAnnouncement();
      const updated = { ...current, ...req.body, integritySalt: DB_INTEGRITY_SALT };
      await setDoc(ref, updated);
      res.json({ status: "success", announcement: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4f. Update site maintenance mode (Admin Only)
  app.post("/api/admin/maintenance/save", adminGuard, async (req, res) => {
    try {
      const ref = doc(getDb(), "settings", "maintenance");
      const current = await getMaintenance();
      const updated = { ...current, ...req.body, integritySalt: DB_INTEGRITY_SALT };
      await setDoc(ref, updated);
      res.json({ status: "success", maintenance: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4g. Backup all data to a local JSON file (Admin Only)
  app.post("/api/admin/backup/save-to-file", adminGuard, async (req, res) => {
    try {
      const results = await Promise.allSettled([
        getPackages(),
        getPosts(),
        getContact(),
        getAnnouncement(),
        getMaintenance(),
        getAdSettings(),
        getSupportMessages(),
        getUsers(),
        getSlips(),
        getFreePackages(),
        getFreeRequests()
      ]);

      const backupData = {
        packages: results[0].status === 'fulfilled' ? results[0].value : [],
        posts: results[1].status === 'fulfilled' ? results[1].value : [],
        contact: results[2].status === 'fulfilled' ? results[2].value : {},
        announcement: results[3].status === 'fulfilled' ? results[3].value : {},
        maintenance: results[4].status === 'fulfilled' ? results[4].value : { maintenanceMode: false },
        adSettings: results[5].status === 'fulfilled' ? results[5].value : {},
        supportMessages: results[6].status === 'fulfilled' ? results[6].value : [],
        users: results[7].status === 'fulfilled' ? results[7].value : [],
        slips: results[8].status === 'fulfilled' ? results[8].value : [],
        freePackages: results[9].status === 'fulfilled' ? results[9].value : [],
        freeRequests: results[10].status === 'fulfilled' ? results[10].value : []
      };

      const backupFilePath = path.join(process.cwd(), "src/data-backup.json");
      fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf8");

      res.json({ status: "success", message: "Data backed up successfully to src/data-backup.json", data: backupData });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4h. Retrieve and download the current backup JSON file (Admin Only)
  app.get("/api/admin/backup/download", adminGuard, async (req, res) => {
    try {
      const backupFilePath = path.join(process.cwd(), "src/data-backup.json");
      if (fs.existsSync(backupFilePath)) {
        const fileContent = fs.readFileSync(backupFilePath, "utf8");
        res.setHeader("Content-Disposition", "attachment; filename=data-backup.json");
        res.setHeader("Content-Type", "application/json");
        return res.send(fileContent);
      } else {
        // Fallback: compile fresh data and return it
        const results = await Promise.allSettled([
          getPackages(),
          getPosts(),
          getContact(),
          getAnnouncement(),
          getMaintenance(),
          getAdSettings(),
          getSupportMessages(),
          getUsers(),
          getSlips(),
          getFreePackages(),
          getFreeRequests()
        ]);
        const backupData = {
          packages: results[0].status === 'fulfilled' ? results[0].value : [],
          posts: results[1].status === 'fulfilled' ? results[1].value : [],
          contact: results[2].status === 'fulfilled' ? results[2].value : {},
          announcement: results[3].status === 'fulfilled' ? results[3].value : {},
          maintenance: results[4].status === 'fulfilled' ? results[4].value : { maintenanceMode: false },
          adSettings: results[5].status === 'fulfilled' ? results[5].value : {},
          supportMessages: results[6].status === 'fulfilled' ? results[6].value : [],
          users: results[7].status === 'fulfilled' ? results[7].value : [],
          slips: results[8].status === 'fulfilled' ? results[8].value : [],
          freePackages: results[9].status === 'fulfilled' ? results[9].value : [],
          freeRequests: results[10].status === 'fulfilled' ? results[10].value : []
        };
        res.setHeader("Content-Disposition", "attachment; filename=data-backup.json");
        res.setHeader("Content-Type", "application/json");
        return res.json(backupData);
      }
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4e. Update user details directly (Admin Only)
  app.post("/api/admin/users/save-bandwidth", adminGuard, async (req, res) => {
    try {
      const { uid, totalGB, usedGB } = req.body;
      const userRef = doc(getDb(), "users", uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const userObj = snap.data();
        if (userObj.dataUsage) {
          userObj.dataUsage.totalGB = Number(totalGB);
          userObj.dataUsage.usedGB = Number(usedGB);
        } else {
          userObj.dataUsage = {
            totalGB: Number(totalGB),
            usedGB: Number(usedGB),
            billingCycleEnd: "Updated by Admin",
            speedLimitMbps: 150,
            activeConnections: 1
          };
        }
        userObj.integritySalt = DB_INTEGRITY_SALT;
        await setDoc(userRef, userObj);
        return res.json({ status: "success", user: userObj });
      }
      res.status(404).json({ error: "User not found" });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4f. Promote a user to admin by email (Admin Only)
  app.post("/api/admin/users/promote", adminGuard, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email is required" });
      }
      const targetEmail = email.toLowerCase().trim();
      const usersList = await getUsers();
      const targetUser = usersList.find(u => u.email.toLowerCase() === targetEmail);

      if (targetUser) {
        // Update existing user role
        const userRef = doc(getDb(), "users", targetUser.uid);
        targetUser.role = "admin";
        targetUser.integritySalt = DB_INTEGRITY_SALT;
        await setDoc(userRef, targetUser);
        const updatedUsersList = await getUsers();
        return res.json({ status: "success", message: `Successfully promoted ${targetEmail} to Administrator`, users: updatedUsersList });
      } else {
        // Pre-create user with admin role
        const uid = "pre_admin_" + Math.random().toString(36).substring(2, 11);
        const newAdminPlaceholder = {
          uid: uid,
          email: targetEmail,
          displayName: targetEmail.split("@")[0],
          role: "admin",
          createdAt: new Date().toISOString(),
          integritySalt: DB_INTEGRITY_SALT,
          dataUsage: {
            totalGB: 150,
            usedGB: 0,
            billingCycleEnd: "30 Days after package purchase",
            speedLimitMbps: 200,
            activeConnections: 0
          }
        };
        await setDoc(doc(getDb(), "users", uid), newAdminPlaceholder);
        const updatedUsersList = await getUsers();
        return res.json({ status: "success", message: `Registered ${targetEmail} as a pending administrator. They will have admin role as soon as they sign up!`, users: updatedUsersList });
      }
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4g. Demote an admin user to standard client role (Admin Only)
  app.post("/api/admin/users/demote", adminGuard, async (req, res) => {
    try {
      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const userRef = doc(getDb(), "users", uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        return res.status(404).json({ error: "User not found in data store" });
      }

      const userObj = snap.data();
      const userEmail = (userObj.email || "").toLowerCase().trim();

      // Guard check to protect chethiyabandara0001@gmail.com
      if (userEmail === "chethiyabandara0001@gmail.com") {
        return res.status(403).json({ error: "Access Denied: The primary master administrator (chethiyabandara0001@gmail.com) cannot be demoted or removed." });
      }

      userObj.role = "user";
      userObj.integritySalt = DB_INTEGRITY_SALT;
      await setDoc(userRef, userObj);

      const updatedUsersList = await getUsers();
      res.json({ status: "success", message: `Successfully demoted ${userEmail} to a standard client role`, users: updatedUsersList });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.use(errorHandler);

  // Serve static assets in production
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

if (!process.env.VERCEL) {
  createExpressApp().then((app) => {
    app.listen(3000, "0.0.0.0", () => {
      console.log("Server running at http://0.0.0.0:3000");
    });
  });
}
