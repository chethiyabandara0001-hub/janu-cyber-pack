import express from "express";
import path from "path";
import fs from "fs";

// FIXED: Added the explicit .ts extensions so modern Node/ESM engines can locate files
import { Package, Post, PaymentSlip, ContactDetails, HomeAnnouncement, FreePackage, FreeRequest, AdSettings, SupportMessage } from "./src/types.ts";
import { INITIAL_PACKAGES, INITIAL_POSTS, INITIAL_CONTACT, INITIAL_ANNOUNCEMENT } from "./src/mockData.ts";

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
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || "ai-studio-05efdffc-31e5-48da-b96f-d2964f93684b",
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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

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
    authInfo: { userId: "server-runtime-context" },
    operationType,
    path
  };
  console.error('[FIRESTORE-ERROR]:', JSON.stringify(errInfo));
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

      // 3. Seed Settings Documents
      try {
        await setDoc(doc(database, "settings", "contact"), INITIAL_CONTACT);
        await setDoc(doc(database, "settings", "announcement"), INITIAL_ANNOUNCEMENT);

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
            { id: "free-dialog-mobile-social", isp: "Dialog" as const, packageType: "Mobile" as const, packageName: "Social Media Pack", price: "Free", code: "WGRD-DIALOG-SOC-99X-FREE", createdAt: new Date().toISOString() },
            { id: "free-dialog-mobile-zoom", isp: "Dialog" as const, packageType: "Mobile" as const, packageName: "Zoom Unlimited", price: "Free", code: "VMESS-DIALOG-ZM-22K-FREE", createdAt: new Date().toISOString() },
            { id: "free-mobitel-mobile-tiktok", isp: "Mobitel" as const, packageType: "Mobile" as const, packageName: "TikTok Heavy", price: "Free", code: "TROJAN-MOBITEL-TT-44W-FREE", createdAt: new Date().toISOString() },
            { id: "free-hutch-router-anytime", isp: "Hutch" as const, packageType: "Router" as const, packageName: "Anytime Free VPN", price: "Free", code: "SSH-HUTCH-RTR-77N-FREE", createdAt: new Date().toISOString() },
            { id: "free-airtel-fiber-yt", isp: "Airtel" as const, packageType: "Fiber" as const, packageName: "YouTube Unlimited", price: "Free", code: "V2RAY-AIRTEL-YT-88Q-FREE", createdAt: new Date().toISOString() }
          ];
          for (const p of initialFree) await setDoc(doc(database, "free_packages", p.id), p);
          console.log("[SEED] Seeded Free Packages successfully.");
        }
      } catch (err) {
        console.error("[SEED] Error seeding free packages:", err);
      }

      // 5. Seed Admin Profile
      try {
        await setDoc(doc(database, "users", "admin-master-account"), {
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

      await setDoc(seedStateRef, { seeded: true });
      return true;
    } catch (globalErr) {
      console.error("[CRITICAL-SEED-ERROR] Seeding failed:", globalErr);
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
    
    const collections = ["packages", "posts", "free_packages", "free_requests", "support_messages", "slips", "settings"];
    for (const col of collections) {
      const snap = await getDocs(collection(database, col));
      for (const d of snap.docs) await deleteDoc(doc(database, col, d.id));
    }
    
    const usrs = await getDocs(collection(database, "users"));
    let deletedUsersCount = 0;
    for (const d of usrs.docs) {
      const u = d.data();
      if (u.role !== "admin" && u.email?.toLowerCase() !== "chethiyabandara0001@gmail.com") {
        await deleteDoc(doc(database, "users", d.id));
        deletedUsersCount++;
      }
    }
    
    await setDoc(doc(database, "settings", "seeding_state"), { seeded: true, wiped: true });
    console.log("[WIPE] Cleanup sequence finished successfully.");
    return true;
  } catch (e) {
    console.error("[WIPE] Error wiping database:", e);
    return false;
  }
}

// Data Resolvers
async function getPackages(): Promise<Package[]> {
  try {
    const snap = await getDocs(collection(getDb(), "packages"));
    const list: Package[] = [];
    snap.forEach(d => list.push(d.data() as Package));
    return list;
  } catch (e) { handleFirestoreError(e, OperationType.GET, "packages"); return []; }
}

async function getPosts(): Promise<Post[]> {
  try {
    const snap = await getDocs(collection(getDb(), "posts"));
    const list: Post[] = [];
    snap.forEach(d => list.push(d.data() as Post));
    return list;
  } catch (e) { handleFirestoreError(e, OperationType.GET, "posts"); return []; }
}

async function getContact(): Promise<ContactDetails> {
  try {
    const snap = await getDoc(doc(getDb(), "settings", "contact"));
    if (snap.exists()) return snap.data() as ContactDetails;
    return { phone: "", email: "", telegramChannel: "", telegramBotUser: "", address: "", workingHours: "", bankName: "", bankBranch: "", bankAccountNo: "", bankAccountName: "" };
  } catch (e) { handleFirestoreError(e, OperationType.GET, "settings/contact"); return { phone: "", email: "", telegramChannel: "", telegramBotUser: "", address: "", workingHours: "", bankName: "", bankBranch: "", bankAccountNo: "", bankAccountName: "" }; }
}

async function getAnnouncement(): Promise<HomeAnnouncement> {
  try {
    const snap = await getDoc(doc(getDb(), "settings", "announcement"));
    if (snap.exists()) return snap.data() as HomeAnnouncement;
    return { title: "", subtitle: "", announcementText: "", showAnnouncement: false };
  } catch (e) { handleFirestoreError(e, OperationType.GET, "settings/announcement"); return { title: "", subtitle: "", announcementText: "", showAnnouncement: false }; }
}

async function getAdSettings(): Promise<AdSettings> {
  try {
    const snap = await getDoc(doc(getDb(), "settings", "ads"));
    if (snap.exists()) return snap.data() as AdSettings;
    return { dayTimeAdCode: "https://t.me/janucyberpack", nightTimeAdCode: "https://t.me/janucyberpack" };
  } catch (e) { handleFirestoreError(e, OperationType.GET, "settings/ads"); return { dayTimeAdCode: "https://t.me/janucyberpack", nightTimeAdCode: "https://t.me/janucyberpack" }; }
}

async function getSupportMessages(): Promise<SupportMessage[]> {
  try {
    const snap = await getDocs(collection(getDb(), "support_messages"));
    const list: SupportMessage[] = [];
    snap.forEach(d => {
      const data = d.data() as SupportMessage;
      if (!data.timestamp) data.timestamp = new Date().toISOString();
      list.push(data);
    });
    return list.sort((a, b) => (Date.parse(a.timestamp || "") || 0) - (Date.parse(b.timestamp || "") || 0));
  } catch (e) { handleFirestoreError(e, OperationType.GET, "support_messages"); return []; }
}

async function getUsers(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(getDb(), "users"));
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    if (list.length === 0) {
      return [{ uid: "admin-master-account", email: "chethiyabandara0001@gmail.com", displayName: "Super Admin", role: "admin", createdAt: new Date().toISOString() }];
    }
    return list;
  } catch (e) { handleFirestoreError(e, OperationType.GET, "users"); return []; }
}

function saveBase64Image(base64Str: string): string {
  if (!base64Str || !base64Str.startsWith("data:")) return base64Str;
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;

    const type = matches[1];
    const dataBuffer = Buffer.from(matches[2], "base64");
    let extension = type.includes("png") ? "png" : type.includes("gif") ? "gif" : type.includes("webp") ? "webp" : "jpg";

    const filename = `slip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const uploadsDir = path.join(process.cwd(), "uploads");
    
    try {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, filename), dataBuffer);
      return `/uploads/${filename}`;
    } catch (fsErr) {
      // Serverless fallback mechanism to keep the transaction alive if directory access is read-only
      console.warn("[SERVERLESS-FS-CONTEXT] Falling back directly to base64 encoding.");
      return base64Str;
    }
  } catch (e) { return base64Str; }
}

async function getSlips(): Promise<PaymentSlip[]> {
  try {
    const snap = await getDocs(collection(getDb(), "slips"));
    const list: PaymentSlip[] = [];
    snap.forEach(d => list.push(d.data() as PaymentSlip));
    return list;
  } catch (e) { handleFirestoreError(e, OperationType.GET, "slips"); return []; }
}

async function getFreePackages(): Promise<FreePackage[]> {
  try {
    const snap = await getDocs(collection(getDb(), "free_packages"));
    const list: FreePackage[] = [];
    snap.forEach(d => list.push(d.data() as FreePackage));
    return list;
  } catch (e) { handleFirestoreError(e, OperationType.GET, "free_packages"); return []; }
}

async function getFreeRequests(): Promise<FreeRequest[]> {
  try {
    const snap = await getDocs(collection(getDb(), "free_requests"));
    const list: FreeRequest[] = [];
    snap.forEach(d => list.push(d.data() as FreeRequest));
    return list;
  } catch (e) { handleFirestoreError(e, OperationType.GET, "free_requests"); return []; }
}

import cors from "cors";

export async function createExpressApp() {
  const app = express();

  try {
    const database = getDb();
    const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
    console.log(`[BOOT] Checking target Firestore connectivity: ${dbId}...`);
    await Promise.race([
      getDocs(collection(database, "settings")),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
    ]);
  } catch (error: any) {
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)" && !isUsingFallbackDefaultDb) {
      getDb(true); 
    }
  }

  /* * NOTE: Danger block commented out for stable production serverless deployments.
   * If left un-commented, serverless function spin-ups would cause structural wipes across your live collections.
   *
   * if (process.env.NODE_ENV === "production" || process.env.VERCEL) { ... }
   */
  
  const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
    console.error(`[UNHANDLED-EXCEPTION] ${req.method} ${req.url}:`, err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: "Internal Server Error", message: err instanceof Error ? err.message : String(err), type: "unhandled_exception" });
  };

  app.set("trust proxy", 1);
  app.use(cors({ origin: true, credentials: true }));
  
  app.get("/api/admin/emergency-repair", async (req, res) => {
    try {
      const { key } = req.query;
      if (key !== "reset123") return res.status(403).send("Unauthorized key parameter.");
      await seedAllData(true);
      res.send("<h1>Database Reset Success!</h1>");
    } catch (e) { res.status(500).send("Repair failure context: " + String(e)); }
  });

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Requester-Uid, Authorization");
    next();
  });

  app.use((req, res, next) => {
    const ua = req.headers["user-agent"] || "";
    if (ua.toLowerCase().includes("bot") || ua.toLowerCase().includes("crawler")) {
      console.log(`[CRAWLER LOG] Path: ${req.path} | UA: ${ua}`);
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Content-Security-Policy", "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://accounts.google.com;");
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const uploadsDir = path.join(process.cwd(), "uploads");
  try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) {}
  app.use("/uploads", express.static(uploadsDir));

  // Your internal routes go right here...

  app.use(errorHandler);
  return app;
}
