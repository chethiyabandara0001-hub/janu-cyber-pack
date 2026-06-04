import express from "express";
import path from "path";
import fs from "fs";

// Import types
import { Package, Post, PaymentSlip, ContactDetails, HomeAnnouncement, FreePackage, FreeRequest, AdSettings, SupportMessage } from "./src/types";
import { INITIAL_PACKAGES, INITIAL_POSTS, INITIAL_CONTACT, INITIAL_ANNOUNCEMENT } from "./src/mockData";

// Initialize Firebase JS SDK
import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, collection 
} from "firebase/firestore";

let firebaseConfig: any;
try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
  } else {
    let currentDirName = ".";
    try {
      currentDirName = __dirname;
    } catch (e) {
      currentDirName = ".";
    }
    const localPath = path.join(currentDirName, "firebase-applet-config.json");
    const parentPath = path.join(currentDirName, "..", "firebase-applet-config.json");
    if (fs.existsSync(localPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(localPath, "utf8"));
    } else if (fs.existsSync(parentPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(parentPath, "utf8"));
    } else {
      throw new Error("File not found");
    }
  }
} catch (err) {
  // Robust hardcoded fallback of the production keys to prevent Vercel boot failures
  firebaseConfig = {
    projectId: "gen-lang-client-0008438867",
    appId: "1:796923319104:web:5408ce4861d12aec6460a5",
    apiKey: "AIzaSyClstsLmizDZJ6OD_WnKaSE06yIwHdtq-8",
    authDomain: "gen-lang-client-0008438867.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-05efdffc-31e5-48da-b96f-d2964f93684b",
    storageBucket: "gen-lang-client-0008438867.firebasestorage.app",
    messagingSenderId: "796923319104",
    measurementId: ""
  };
}

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Error handling in compliance with Phase 3 of Firebase Integration Skill
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: "server-runtime-context"
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed tracking helper to prevent auto reset of empty collections
async function checkSeeded(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "settings", "seeding_state"));
    return snap.exists() && snap.data()?.seeded === true;
  } catch (e) {
    return false;
  }
}

async function markSeeded(): Promise<void> {
  try {
    await setDoc(doc(db, "settings", "seeding_state"), { seeded: true });
  } catch (e) {}
}

// Helper methods to connect Firestore queries securely
async function getPackages(): Promise<Package[]> {
  try {
    const snap = await getDocs(collection(db, "packages"));
    const list: Package[] = [];
    snap.forEach(d => list.push(d.data() as Package));
    if (list.length === 0) {
      const alreadySeeded = await checkSeeded();
      if (!alreadySeeded) {
        // Bootstrap seed collection
        for (const pkg of INITIAL_PACKAGES) {
          await setDoc(doc(db, "packages", pkg.id), pkg);
          list.push(pkg);
        }
        await markSeeded();
      }
    }
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "packages");
    return [];
  }
}

async function getPosts(): Promise<Post[]> {
  try {
    const snap = await getDocs(collection(db, "posts"));
    const list: Post[] = [];
    snap.forEach(d => list.push(d.data() as Post));
    if (list.length === 0) {
      const alreadySeeded = await checkSeeded();
      if (!alreadySeeded) {
        for (const post of INITIAL_POSTS) {
          await setDoc(doc(db, "posts", post.id), post);
          list.push(post);
        }
        await markSeeded();
      }
    }
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "posts");
    return [];
  }
}

async function getContact(): Promise<ContactDetails> {
  try {
    const ref = doc(db, "settings", "contact");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as ContactDetails;
    } else {
      await setDoc(ref, INITIAL_CONTACT);
      return INITIAL_CONTACT;
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/contact");
    return INITIAL_CONTACT;
  }
}

async function getAnnouncement(): Promise<HomeAnnouncement> {
  try {
    const ref = doc(db, "settings", "announcement");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as HomeAnnouncement;
    } else {
      await setDoc(ref, INITIAL_ANNOUNCEMENT);
      return INITIAL_ANNOUNCEMENT;
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/announcement");
    return INITIAL_ANNOUNCEMENT;
  }
}

async function getAdSettings(): Promise<AdSettings> {
  try {
    const ref = doc(db, "settings", "ads");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as AdSettings;
    } else {
      const defaultAds: AdSettings = {
        dayTimeAdCode: "https://t.me/janucyberpack",
        nightTimeAdCode: "https://t.me/janucyberpack"
      };
      await setDoc(ref, defaultAds);
      return defaultAds;
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "settings/ads");
    return {
      dayTimeAdCode: "https://t.me/janucyberpack",
      nightTimeAdCode: "https://t.me/janucyberpack"
    };
  }
}

async function getSupportMessages(): Promise<SupportMessage[]> {
  try {
    const snap = await getDocs(collection(db, "support_messages"));
    const list: SupportMessage[] = [];
    snap.forEach(d => list.push(d.data() as SupportMessage));
    return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "support_messages");
    return [];
  }
}

async function getUsers(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, "users"));
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    if (list.length === 0) {
      const initialUsers = [
        {
          uid: "user-demotesting-1",
          email: "demo@datastore.shop",
          displayName: "Sample Premium Client",
          role: "user",
          createdAt: new Date().toISOString(),
          dataUsage: {
            totalGB: 100,
            usedGB: 42.8,
            billingCycleEnd: "June 25, 2026",
            speedLimitMbps: 150,
            activeConnections: 2
          }
        },
        {
          uid: "admin-master-account",
          email: "chethiyabandara0001@gmail.com",
          displayName: "Super Admin",
          role: "admin",
          createdAt: new Date().toISOString()
        }
      ];
      for (const u of initialUsers) {
        await setDoc(doc(db, "users", u.uid), u);
        list.push(u);
      }
    }
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "users");
    return [];
  }
}

async function getSlips(): Promise<PaymentSlip[]> {
  try {
    const snap = await getDocs(collection(db, "slips"));
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
    const snap = await getDocs(collection(db, "free_packages"));
    const list: FreePackage[] = [];
    snap.forEach(d => list.push(d.data() as FreePackage));
    if (list.length === 0) {
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
      for (const fp of initialFree) {
        await setDoc(doc(db, "free_packages", fp.id), fp);
        list.push(fp);
      }
    }
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "free_packages");
    return [];
  }
}

async function getFreeRequests(): Promise<FreeRequest[]> {
  try {
    const snap = await getDocs(collection(db, "free_requests"));
    const list: FreeRequest[] = [];
    snap.forEach(d => list.push(d.data() as FreeRequest));
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "free_requests");
    return [];
  }
}

export async function createExpressApp() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Backend routes

  // 1. Core Config / Initial Data endpoint
  app.get("/api/initial-data", async (req, res) => {
    try {
      const p = await getPackages();
      const pt = await getPosts();
      const cn = await getContact();
      const an = await getAnnouncement();
      const fp = await getFreePackages();
      const fr = await getFreeRequests();

      res.json({
        packages: p,
        posts: pt,
        contact: cn,
        announcement: an,
        freePackages: fp,
        freeRequests: fr
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
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

      await setDoc(doc(db, "free_requests", requestId), newRequest);

      const updatedRequests = await getFreeRequests();
      res.json({ status: "success", request: newRequest, freeRequests: updatedRequests });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Save/Update Free VPN Package details (Admin Only)
  app.post("/api/admin/free-packages/save", async (req, res) => {
    try {
      const pkg: FreePackage = req.body;
      if (!pkg.isp || !pkg.packageType || !pkg.packageName || !pkg.code) {
        return res.status(400).json({ error: "Missing package parameters" });
      }

      const pkgId = pkg.id || "free_pack_" + Date.now();
      pkg.id = pkgId;
      pkg.price = pkg.price || "Free";

      await setDoc(doc(db, "free_packages", pkgId), pkg);

      const updated = await getFreePackages();
      res.json({ status: "success", freePackages: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Delete Free VPN Package details (Admin Only)
  app.delete("/api/admin/free-packages/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await deleteDoc(doc(db, "free_packages", id));
      const updated = await getFreePackages();
      res.json({ status: "success", freePackages: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Delete Free VPN Request/Voucher details (Admin Only)
  app.delete("/api/admin/free-requests/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await deleteDoc(doc(db, "free_requests", id));
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
        adLink: activeLink,
        isDay
      });
    } catch (e) {
      res.json({ adType: "night", adLink: "https://t.me/janucyberpack", isDay: false });
    }
  });

  // Get ad configurations depending on administrative level
  app.get("/api/admin/ad-settings", async (req, res) => {
    try {
      const email = String(req.query.email || "").toLowerCase().trim();
      const ads = await getAdSettings();

      if (email === "chethiyabandara0001@gmail.com") {
        res.json({
          dayTimeAdCode: ads.dayTimeAdCode || "",
          nightTimeAdCode: ads.nightTimeAdCode || ""
        });
      } else {
        // Subadmins can only know or get nightTimeAdCode
        res.json({
          dayTimeAdCode: "●●●●●●● (Restricted: Super-Admin Only)",
          nightTimeAdCode: ads.nightTimeAdCode || ""
        });
      }
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Save/Update ad configurations
  app.post("/api/admin/ad-settings/save", async (req, res) => {
    try {
      const { email, dayTimeAdCode, nightTimeAdCode } = req.body;
      const targetEmail = String(email || "").toLowerCase().trim();
      
      const current = await getAdSettings();

      if (targetEmail === "chethiyabandara0001@gmail.com") {
        current.dayTimeAdCode = dayTimeAdCode || "";
        current.nightTimeAdCode = nightTimeAdCode || "";
      } else {
        // Standard subadmins are only permitted to update night time code
        current.nightTimeAdCode = nightTimeAdCode || "";
      }

      await setDoc(doc(db, "settings", "ads"), current);
      
      // Return updated according to permissions
      if (targetEmail === "chethiyabandara0001@gmail.com") {
        res.json({ status: "success", adSettings: current });
      } else {
        res.json({
          status: "success",
          adSettings: {
            dayTimeAdCode: "●●●●●●● (Restricted: Super-Admin Only)",
            nightTimeAdCode: current.nightTimeAdCode
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
          await setDoc(doc(db, "users", existingUser.uid), existingUser);
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

      await setDoc(doc(db, "users", uid), newUser);

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
          await setDoc(doc(db, "users", uid), user);
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
            await setDoc(doc(db, "users", user.uid), user);
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
      const snap = await getDoc(doc(db, "users", uid));
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
        bankSlipBase64,
        status: "pending",
        submittedAt: new Date().toISOString(),
        tier: tier || "Lite 100gb for 200lkr"
      };

      await setDoc(doc(db, "slips", slipId), newSlip);

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
      const allMsgs = await getSupportMessages();
      if (userId) {
        const userMsgs = allMsgs.filter(m => m.userId === userId);
        return res.json(userMsgs);
      }
      res.json(allMsgs);
    } catch (e) {
      res.status(500).json({ error: String(e) });
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

      await setDoc(doc(db, "support_messages", msgId), newMsg);

      const allMsgs = await getSupportMessages();
      const userMsgs = allMsgs.filter(m => m.userId === userId);
      res.json({ status: "success", message: newMsg, messages: userMsgs });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4. Admin Management APIs

  // Get analytics & list entities
  app.get("/api/admin/dashboard-stats", async (req, res) => {
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

      res.json({
        totalUsers: usersList.filter(u => u.role !== "admin").length,
        totalSales,
        pendingCount,
        approvedCount,
        users: usersList,
        slips: slipsList,
        packages: packagesList,
        posts: postsList
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Reset Estimated Users Total and Total Sales Approved statistics
  app.post("/api/admin/reset-stats", async (req, res) => {
    try {
      // 1. Delete all slips in Firestore slips collection
      const slipsSnap = await getDocs(collection(db, "slips"));
      for (const d of slipsSnap.docs) {
        await deleteDoc(doc(db, "slips", d.id));
      }

      // 2. Delete non-admin users in Firestore users collection
      const usersSnap = await getDocs(collection(db, "users"));
      for (const d of usersSnap.docs) {
        const u = d.data();
        if (u.role !== "admin" && u.uid !== "admin-master-account") {
          await deleteDoc(doc(db, "users", d.id));
        }
      }

      // 3. Mark seeded so that seed logic doesn't trigger unexpectedly
      await markSeeded();

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Admin approves/verifies the payment and calls simulate Telegram Bot API
  app.post("/api/admin/slips/:slipId/verify", async (req, res) => {
    try {
      const { slipId } = req.params;
      const { status, adminNotes, vpnCodeOverride } = req.body; // status: 'approved' | 'rejected'

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status state" });
      }

      const slipRef = doc(db, "slips", slipId);
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
        const userRef = doc(db, "users", slip.userId);
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
          await setDoc(userRef, userObj);
        }
      }

      await setDoc(slipRef, slip);
      res.json({ status: "success", slip });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Admin updates Core Sections
  // 4a. Save/Update Package details
  app.post("/api/admin/packages/save", async (req, res) => {
    try {
      const pkg: Package = req.body;
      if (!pkg.title || !pkg.price) {
        return res.status(400).json({ error: "Missing pack header details" });
      }

      const pkgId = pkg.id || "pack_" + Date.now();
      pkg.id = pkgId;
      pkg.status = pkg.status || "active";

      await setDoc(doc(db, "packages", pkgId), pkg);

      const updated = await getPackages();
      res.json({ status: "success", packages: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Delete package
  app.delete("/api/admin/packages/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`[SERVER-INFO] Attempting to delete package document from Firestore: ${id}`);
      await deleteDoc(doc(db, "packages", id));
      console.log(`[SERVER-SUCCESS] Successfully deleted package document ${id}. Fetching updated list.`);
      const updated = await getPackages();
      res.json({ status: "success", packages: updated });
    } catch (e) {
      console.error(`[SERVER-ERROR] Failed to delete package: ${id}`, e);
      res.status(500).json({ error: String(e) });
    }
  });

  // 4b. Save/Update Post
  app.post("/api/admin/posts/save", async (req, res) => {
    try {
      const post: Post = req.body;
      if (!post.title || !post.content) {
        return res.status(400).json({ error: "Title and Content are required fields" });
      }

      const postId = post.id || "post_" + Date.now();
      post.id = postId;
      post.date = post.date || new Date().toISOString().substring(0, 10);
      post.author = post.author || "Admin";

      await setDoc(doc(db, "posts", postId), post);

      const updated = await getPosts();
      res.json({ status: "success", posts: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Delete Post
  app.delete("/api/admin/posts/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`[SERVER-INFO] Attempting to delete post document from Firestore: ${id}`);
      await deleteDoc(doc(db, "posts", id));
      console.log(`[SERVER-SUCCESS] Successfully deleted post document ${id}. Fetching updated list.`);
      const updated = await getPosts();
      res.json({ status: "success", posts: updated });
    } catch (e) {
      console.error(`[SERVER-ERROR] Failed to delete post: ${id}`, e);
      res.status(500).json({ error: String(e) });
    }
  });

  // 4c. Update contact details
  app.post("/api/admin/contact/save", async (req, res) => {
    try {
      const ref = doc(db, "settings", "contact");
      const current = await getContact();
      const updated = { ...current, ...req.body };
      await setDoc(ref, updated);
      res.json({ status: "success", contact: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4d. Update home announcement
  app.post("/api/admin/announcement/save", async (req, res) => {
    try {
      const ref = doc(db, "settings", "announcement");
      const current = await getAnnouncement();
      const updated = { ...current, ...req.body };
      await setDoc(ref, updated);
      res.json({ status: "success", announcement: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4e. Update user details directly
  app.post("/api/admin/users/save-bandwidth", async (req, res) => {
    try {
      const { uid, totalGB, usedGB } = req.body;
      const userRef = doc(db, "users", uid);
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
        await setDoc(userRef, userObj);
        return res.json({ status: "success", user: userObj });
      }
      res.status(404).json({ error: "User not found" });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4f. Promote a user to admin by email
  app.post("/api/admin/users/promote", async (req, res) => {
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
        const userRef = doc(db, "users", targetUser.uid);
        targetUser.role = "admin";
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
          dataUsage: {
            totalGB: 150,
            usedGB: 0,
            billingCycleEnd: "30 Days after package purchase",
            speedLimitMbps: 200,
            activeConnections: 0
          }
        };
        await setDoc(doc(db, "users", uid), newAdminPlaceholder);
        const updatedUsersList = await getUsers();
        return res.json({ status: "success", message: `Registered ${targetEmail} as a pending administrator. They will have admin role as soon as they sign up!`, users: updatedUsersList });
      }
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4g. Demote an admin user to standard client role
  app.post("/api/admin/users/demote", async (req, res) => {
    try {
      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const userRef = doc(db, "users", uid);
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
      await setDoc(userRef, userObj);

      const updatedUsersList = await getUsers();
      res.json({ status: "success", message: `Successfully demoted ${userEmail} to a standard client role`, users: updatedUsersList });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Serve static assets in production
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  return app;
}

if (!process.env.VERCEL) {
  createExpressApp().then((app) => {
    app.listen(3000, "0.0.0.0", () => {
      console.log("Server running at http://0.0.0.0:3000");
    });
  });
}
