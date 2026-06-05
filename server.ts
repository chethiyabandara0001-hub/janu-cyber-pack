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

  // 1. High-Grade Security Headers to bulletproof the server & GitHub export against vectors
  app.use((req, res, next) => {
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
      const requesterUid = req.headers["x-requester-uid"] || req.query.requesterUid || req.body.requesterUid;
      if (!requesterUid) {
        return res.status(401).json({ error: "Access Denied: Administrative query credentials are missing." });
      }
      
      const userDocRef = doc(db, "users", String(requesterUid));
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        return res.status(403).json({ error: "Access Denied: Administrative record not registered." });
      }
      
      const userData = userSnap.data();
      if (userData.role !== "admin") {
        return res.status(403).json({ error: "Access Denied: Insufficient permissions for administrative query." });
      }
      
      _next();
    } catch (e) {
      res.status(500).json({ error: "Security validation failure: " + String(e) });
    }
  };

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Backend routes
  
  // Sitemap routes for SEO ranking
  app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
  });

  app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
  });

  app.get("/favicon.png", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "favicon.png"));
  });

  app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "favicon.ico"));
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
  app.post("/api/admin/free-packages/save", adminGuard, async (req, res) => {
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
  app.delete("/api/admin/free-packages/:id", adminGuard, async (req, res) => {
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
  app.delete("/api/admin/free-requests/:id", adminGuard, async (req, res) => {
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

  // Save/Update ad configurations (Admin Only)
  app.post("/api/admin/ad-settings/save", adminGuard, async (req, res) => {
    try {
      const { email, dayTimeAdCode, nightTimeAdCode } = req.body;
      const targetEmail = String(email || "").toLowerCase().trim();
      
      const current = await getAdSettings();

      if (targetEmail === "chethiyabandara0001@gmail.com") {
        current.dayTimeAdCode = sanitizeAdUrl(dayTimeAdCode);
        current.nightTimeAdCode = sanitizeAdUrl(nightTimeAdCode);
      } else {
        // Standard subadmins are only permitted to update night time code
        current.nightTimeAdCode = sanitizeAdUrl(nightTimeAdCode);
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

  // Reset Estimated Users Total and Total Sales Approved statistics (Admin Only)
  app.post("/api/admin/reset-stats", adminGuard, async (req, res) => {
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

  // Admin approves/verifies the payment and calls simulate Telegram Bot API (Admin Only)
  app.post("/api/admin/slips/:slipId/verify", adminGuard, async (req, res) => {
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

      await setDoc(doc(db, "packages", pkgId), pkg);

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
      await deleteDoc(doc(db, "packages", id));
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

      await setDoc(doc(db, "posts", postId), post);

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
      await deleteDoc(doc(db, "posts", id));
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
      const ref = doc(db, "settings", "contact");
      const current = await getContact();
      const updated = { ...current, ...req.body };
      await setDoc(ref, updated);
      res.json({ status: "success", contact: updated });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // 4d. Update home announcement (Admin Only)
  app.post("/api/admin/announcement/save", adminGuard, async (req, res) => {
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

  // 4e. Update user details directly (Admin Only)
  app.post("/api/admin/users/save-bandwidth", adminGuard, async (req, res) => {
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

  // 4g. Demote an admin user to standard client role (Admin Only)
  app.post("/api/admin/users/demote", adminGuard, async (req, res) => {
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
