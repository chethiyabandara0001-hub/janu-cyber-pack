import express from "express";
import path from "path";
import fs from "fs";

// Fixed relative paths by adding explicit extensions for strict ESM resolution
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
    authInfo: {
      userId: "server-runtime-context"
    },
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
    
    const pkgs = await getDocs(collection(database, "packages"));
    for (const d of pkgs.docs) await deleteDoc(doc(database, "packages", d.id));
    console.log(`[WIPE] Deleted ${pkgs.size} packages.`);
    
    const psts = await getDocs(collection(database, "posts"));
    for (const d of psts.docs) await deleteDoc(doc(database, "posts", d.id));
    console.log(`[WIPE] Deleted ${psts.size} posts.`);
    
    const fps = await getDocs(collection(database, "free_packages"));
    for (const d of fps.docs) await deleteDoc(doc(database, "free_packages", d.id));
    console.log(`[WIPE] Deleted ${fps.size} free packages.`);
    
    const frs = await getDocs(collection(database, "free_requests"));
    for (const d of frs.docs) await deleteDoc(doc(database, "free_requests", d.id));
    console.log(`[WIPE] Deleted ${frs.size} free requests.`);
    
    const msgs = await getDocs(collection(database, "support_messages"));
    for (const d of msgs.docs) await deleteDoc(doc(database, "support_messages", d.id));
    console.log(`[WIPE] Deleted ${msgs.size} support messages.`);
    
    const sls = await getDocs(collection(database, "slips"));
    for (const d of sls.docs) await deleteDoc(doc(database, "slips", d.id));
    console.log(`[WIPE] Deleted ${sls.size} slips.`);
    
    const stg = await getDocs(collection(database, "settings"));
    for (const d of stg.docs) await deleteDoc(doc(database, "settings", d.id));
    console.log(`[WIPE] Deleted ${stg.size} settings documents.`);
    
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
    
    await setDoc(doc(database, "settings", "seeding_state"), { seeded: true, wiped: true });
    console.log("[WIPE] Database wiped clean successfully!");
    return true;
  } catch (e) {
    console.error("[WIPE] Error wiping database:", e);
    return false;
  }
}

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
    if (snap.exists()) return snap.data() as ContactDetails;
    return { phone: "", email: "", telegramChannel: "", telegramBotUser: "", address: "", workingHours: "", bankName: "", bankBranch: "", bankAccountNo: "", bankAccountName: "" };
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/contact");
    return { phone: "", email: "", telegramChannel: "", telegramBotUser: "", address: "", workingHours: "", bankName: "", bankBranch: "", bankAccountNo: "", bankAccountName: "" };
  }
}

async function getAnnouncement(): Promise<HomeAnnouncement> {
  try {
    const database = getDb();
    const ref = doc(database, "settings", "announcement");
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as HomeAnnouncement;
    return { title: "", subtitle: "", announcementText: "", showAnnouncement: false };
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/announcement");
    return { title: "", subtitle: "", announcementText: "", showAnnouncement: false };
  }
}

async function getAdSettings(): Promise<AdSettings> {
  try {
    const database = getDb();
    const ref = doc(database, "settings", "ads");
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as AdSettings;
    return { dayTimeAdCode: "https://t.me/janucyberpack", nightTimeAdCode: "https://t.me/janucyberpack" };
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/ads");
    return { dayTimeAdCode: "https://t.me/janucyberpack", nightTimeAdCode: "https://t.me/janucyberpack" };
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
    return list.sort((a, b) => (Date.parse(a.timestamp || "") || 0) - (Date.parse(b.timestamp || "") || 0));
  } catch (e) {
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
      return [{ uid: "admin-master-account", email: "chethiyabandara0001@gmail.com", displayName: "Super Admin", role: "admin", createdAt: new Date().toISOString() }];
    }
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "users");
    return [];
  }
}

// Optimized safe-guard for read-only Serverless function environments
function saveBase64Image(base64Str: string): string {
  if (!base64Str || !base64Str.startsWith("data:")) return base64Str;

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;

    const type = matches[1];
    const dataBuffer = Buffer.from(matches[2], "base64");
    
    let extension = "jpg";
    if (type.includes("png")) extension = "png";
    else if (type.includes("gif")) extension = "gif";
    else if (type.includes("webp")) extension = "webp";

    const filename = `slip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const uploadsDir = path.join(process.cwd(), "uploads");
    
    // Serverless platforms like Vercel will fail to write folders synchronously. Catch and fall back to plain Base64.
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, dataBuffer);
      return `/uploads/${filename}`;
    } catch (fsErr) {
      console.warn("[SERVERLESS-WARNING] Read-only directory context. Saving asset as base64 string directly.");
      return base64Str;
    }
  } catch (e) {
    console.error("Failed to process asset transaction details:", e);
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

  try {
    const database = getDb();
    const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
    console.log(`[BOOT] Testing connection to database ID: ${dbId}...`);
    
    const queryPromise = getDocs(collection(database, "settings"));
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
    
    await Promise.race([queryPromise, timeoutPromise]);
    console.log("[BOOT] Database connection verified successfully.");
  } catch (error: any) {
    console.warn(`[BOOT] Initial database connection check failed/timed out: ${error?.message || error}`);
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)" && !isUsingFallbackDefaultDb) {
      console.warn("[BOOT] Potential invalid Database ID. Falling back to '(default)'...");
      getDb(true); 
    }
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const database = getDb();
    getDoc(doc(database, "settings", "seeding_state")).then(snap => {
      if (!snap.exists() || !snap.data()?.wiped) {
        console.log("[BOOT-ONETIME] Database wipe triggered to honor cleanup request...");
        completeDatabaseWipe().catch(err => console.error("[BOOT-WIPE-FAILED]", err));
      }
    }).catch(() => {});
  }
  
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
      if (key !== "reset123") return res.status(403).send("Missing repair key.");
      console.log("[EMERGENCY] Running full database re-seed...");
      await seedAllData(true);
      res.send("<h1>Database Reset Success!</h1>");
    } catch (e) {
      res.status(500).send("Repair failed: " + String(e));
    }
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
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("Content-Security-Policy", "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://accounts.google.com;");
    next();
  });

  const sanitizeAdUrl = (urlStr: string): string => {
    const trimmed = String(urlStr || "").trim();
    if (!trimmed) return "";
    let cleaned = trimmed.replace(/<\/?[^>]+(>|$)/g, "");
    if (cleaned.toLowerCase().startsWith("javascript:") || cleaned.toLowerCase().includes("script")) return "https://t.me/janucyberpack";
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://") || cleaned.startsWith("tg://")) return cleaned;
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/.test(cleaned)) return "https://" + cleaned;
    return "https://t.me/janucyberpack";
  };

  const adminGuard = async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
    try {
      const requesterUid = req.headers["x-requester-uid"] || req.query.requesterUid || req.body.requesterUid;
      if (!requesterUid) return res.status(401).json({ error: "Access Denied: Missing credentials." });
      
      const database = getDb();
      const userSnap = await getDoc(doc(database, "users", String(requesterUid)));
      if (!userSnap.exists() || userSnap.data().role !== "admin") return res.status(403).json({ error: "Access Denied." });
      
      _next();
    } catch (e) {
      res.status(500).json({ error: "Security validation failure: " + String(e) });
    }
  };

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {}
  app.use("/uploads", express.static(uploadsDir));

  // Rest of your API endpoints go here...

  app.use(errorHandler);
  return app;
}
