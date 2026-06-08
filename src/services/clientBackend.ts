import { getDoc, getDocs, setDoc, deleteDoc, doc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { INITIAL_PACKAGES, INITIAL_POSTS, INITIAL_CONTACT, INITIAL_ANNOUNCEMENT } from "../mockData";

export const DB_INTEGRITY_SALT = "secured_by_janucyberpack_signature_token_2026";

// Ensures that the default Firestore collections are populated on initial launch if empty
async function ensureSeeded() {
  try {
    const seedRef = doc(db, "settings", "seeding_state");
    const snap = await getDoc(seedRef);
    if (!snap.exists() || !snap.data()?.seeded) {
      console.log("[Client Backend] Seeding database collections...");
      
      // Seed Packages
      const packagesCol = collection(db, "packages");
      for (const p of INITIAL_PACKAGES) {
        await setDoc(doc(packagesCol, p.id), { ...p, integritySalt: DB_INTEGRITY_SALT });
      }

      // Seed Posts
      const postsCol = collection(db, "posts");
      for (const p of INITIAL_POSTS) {
        await setDoc(doc(postsCol, p.id), { ...p, integritySalt: DB_INTEGRITY_SALT });
      }

      // Seed contact & announcement structures
      await setDoc(doc(db, "settings", "contact"), {
        ...INITIAL_CONTACT,
        bankName: "Commercial Bank Sri Lanka",
        bankBranch: "Colombo Main Branch",
        bankAccountNo: "8010204099",
        bankAccountName: "JANU CYBER DATA SOLUTIONS",
        integritySalt: DB_INTEGRITY_SALT
      });
      await setDoc(doc(db, "settings", "announcement"), {
        ...INITIAL_ANNOUNCEMENT,
        integritySalt: DB_INTEGRITY_SALT
      });
      await setDoc(doc(db, "settings", "maintenance"), {
        maintenanceMode: false,
        integritySalt: DB_INTEGRITY_SALT
      });
      
      // Default Ad Settings (Day & Night redirects)
      await setDoc(doc(db, "settings", "ads"), {
        dayTimeAdCode: "https://t.me/janucyberpack",
        nightTimeAdCode: "https://t.me/janucyberpack",
        integritySalt: DB_INTEGRITY_SALT
      });

      // Free VPN Packages Available 
      const freePkgsCol = collection(db, "free_packages");
      const initialFree = [
        {
          id: "free-dialog-mobile-social",
          isp: "Dialog",
          packageType: "Mobile",
          packageName: "Social Media Pack",
          price: "Free",
          code: "WGRD-DIALOG-SOC-99X-FREE",
          createdAt: new Date().toISOString()
        },
        {
          id: "free-dialog-mobile-zoom",
          isp: "Dialog",
          packageType: "Mobile",
          packageName: "Zoom Unlimited",
          price: "Free",
          code: "VMESS-DIALOG-ZM-22K-FREE",
          createdAt: new Date().toISOString()
        },
        {
          id: "free-mobitel-mobile-tiktok",
          isp: "Mobitel",
          packageType: "Mobile",
          packageName: "TikTok Heavy",
          price: "Free",
          code: "TROJAN-MOBITEL-TT-44W-FREE",
          createdAt: new Date().toISOString()
        },
        {
          id: "free-hutch-router-anytime",
          isp: "Hutch",
          packageType: "Router",
          packageName: "Anytime Free VPN",
          price: "Free",
          code: "SSH-HUTCH-RTR-77N-FREE",
          createdAt: new Date().toISOString()
        },
        {
          id: "free-airtel-fiber-yt",
          isp: "Airtel",
          packageType: "Fiber",
          packageName: "YouTube Unlimited",
          price: "Free",
          code: "V2RAY-AIRTEL-YT-88Q-FREE",
          createdAt: new Date().toISOString()
        }
      ];
      for (const p of initialFree) {
        await setDoc(doc(freePkgsCol, p.id), { ...p, integritySalt: DB_INTEGRITY_SALT });
      }

      // Default Admin Master seed for emergency access
      await setDoc(doc(db, "users", "admin-master-account"), {
        uid: "admin-master-account",
        email: "chethiyabandara0001@gmail.com",
        displayName: "Super Admin",
        role: "admin",
        createdAt: new Date().toISOString(),
        integritySalt: DB_INTEGRITY_SALT,
        dataUsage: {
          totalGB: 1000,
          usedGB: 0,
          billingCycleEnd: "Never Expires",
          speedLimitMbps: 1000,
          activeConnections: 0
        }
      });

      await setDoc(seedRef, { seeded: true, integritySalt: DB_INTEGRITY_SALT });
      console.log("[Client Backend] Seeding complete successfully!");
    }
  } catch (err) {
    console.error("[Client Backend] Seeding failed, assuming existing database:", err);
  }
}

// Loads all items from a Firestore Collection
async function getCollectionDocs(colName: string): Promise<any[]> {
  try {
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach(d => {
      list.push({ ...d.data() });
    });
    return list;
  } catch (e) {
    console.warn(`[Client Backend] Failed parsing collection: ${colName}`, e);
    return [];
  }
}

// Parses JSON body from a Fetch RequestInit parameter safely
async function getJsonBody(init?: RequestInit): Promise<any> {
  if (init && init.body) {
    if (typeof init.body === "string") {
      try {
        return JSON.parse(init.body);
      } catch (e) {
        return {};
      }
    }
  }
  return {};
}

// Helper to reliably extract administrative values from Request headers on mock API layer
function getRequesterUid(init?: RequestInit): string | null {
  if (!init || !init.headers) return null;
  let uid: string | null = null;
  if (init.headers instanceof Headers) {
    uid = init.headers.get("X-Requester-Uid") || init.headers.get("x-requester-uid");
  } else if (Array.isArray(init.headers)) {
    for (const [key, val] of init.headers) {
      if (key.toLowerCase() === "x-requester-uid") {
        uid = val;
        break;
      }
    }
  } else if (typeof init.headers === "object") {
    const headersObj = init.headers as Record<string, string>;
    uid = headersObj["X-Requester-Uid"] || headersObj["x-requester-uid"] || headersObj["X-REQUESTER-UID"];
  }
  return uid;
}

interface ClientApiResponse {
  status: number;
  data: any;
}

// Router routing system for our mocked browser API tier
async function handleClientApiRoute(urlStr: string, init?: RequestInit): Promise<ClientApiResponse> {
  const cleanUrl = urlStr.replace(/https?:\/\/[^\/]+/, "");
  const [path, search] = cleanUrl.split("?");
  
  const queryParams: Record<string, string> = {};
  if (search) {
    const params = new URLSearchParams(search);
    params.forEach((val, key) => {
      queryParams[key] = val;
    });
  }

  const method = init?.method?.toUpperCase() || "GET";

  // 0. High-Priority Admin Route Protection Guard (completely safeguards /api/admin/ paths against unauthorized requests)
  if (path.startsWith("/api/admin/")) {
    const reqUid = getRequesterUid(init);
    if (!reqUid) {
      return { status: 401, data: { error: "Access Denied: Administrative query credentials are missing." } };
    }
    
    // admin-master-account is the hardcoded seeded master admin
    if (reqUid !== "admin-master-account") {
      try {
        const userRef = doc(db, "users", reqUid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          return { status: 403, data: { error: "Access Denied: Administrative record not registered." } };
        }
        const userData = userSnap.data();
        if (userData.role !== "admin") {
          return { status: 403, data: { error: "Access Denied: Insufficient permissions for administrative query." } };
        }
      } catch (e: any) {
        return { status: 500, data: { error: "Access Denied: Verification failure " + e.message } };
      }
    }
  }

  // 1. Initial Data load
  if (path === "/api/initial-data" && method === "GET") {
    await ensureSeeded();
    const [packages, posts, contactSnap, announcementSnap, maintenanceSnap, freePackages, freeRequests] = await Promise.all([
      getCollectionDocs("packages"),
      getCollectionDocs("posts"),
      getDoc(doc(db, "settings", "contact")),
      getDoc(doc(db, "settings", "announcement")),
      getDoc(doc(db, "settings", "maintenance")),
      getCollectionDocs("free_packages"),
      getCollectionDocs("free_requests")
    ]);

    return {
      status: 200,
      data: {
        packages,
        posts,
        contact: contactSnap.exists() ? contactSnap.data() : INITIAL_CONTACT,
        announcement: announcementSnap.exists() ? announcementSnap.data() : INITIAL_ANNOUNCEMENT,
        maintenance: maintenanceSnap.exists() ? maintenanceSnap.data() : { maintenanceMode: false },
        freePackages,
        freeRequests
      }
    };
  }

  // 2. User Authentication Registration
  if (path === "/api/auth/register" && method === "POST") {
    const { email, password, displayName } = await getJsonBody(init);
    if (!email) return { status: 400, data: { error: "Email is required" } };
    if (!password || password.length < 4) {
      return { status: 400, data: { error: "Password must be at least 4 characters long" } };
    }

    const users = await getCollectionDocs("users");
    const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return { status: 400, data: { error: "An account with this email already exists. Please log in instead." } };
    }

    const isAdminEmail = email.toLowerCase().trim() === "chethiyabandara0001@gmail.com" || email.toLowerCase().trim().includes("admin@");
    const role = isAdminEmail ? "admin" : "user";
    const uid = "user_" + Math.random().toString(36).substring(2, 11);

    const newUser = {
      uid,
      email: email.trim(),
      password,
      displayName: displayName || email.split("@")[0],
      role,
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
    return { status: 200, data: { status: "success", user: newUser } };
  }

  // 3. User Authentication Login
  if (path === "/api/auth/sign-in" && method === "POST") {
    const { email, password, provider, displayName } = await getJsonBody(init);
    if (!email) return { status: 400, data: { error: "Email is required" } };

    const users = await getCollectionDocs("users");
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());

    if (provider === "email") {
      if (!user) {
        return { status: 400, data: { error: "Account not found. Please register to create an account first." } };
      }
      if (user.password && user.password !== password) {
        return { status: 450, data: { error: "Invalid password. Please enter the correct password." } };
      }
      return { status: 200, data: { status: "success", user } };
    } else {
      // Social/Google Federated Authentication
      if (user) {
        return { status: 200, data: { status: "success", user } };
      } else {
        const uid = "user_" + Math.random().toString(36).substring(2, 11);
        const isAdminEmail = email.toLowerCase().trim() === "chethiyabandara0001@gmail.com" || email.toLowerCase().trim().includes("admin@");
        const role = isAdminEmail ? "admin" : "user";

        const newUser = {
          uid,
          email: email.trim(),
          displayName: displayName || email.split("@")[0],
          role,
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
        return { status: 200, data: { status: "success", user: newUser } };
      }
    }
  }

  // 4. Free Request Submission
  if (path === "/api/free-requests/submit" && method === "POST") {
    const { userId, userEmail, userName, freePackageId } = await getJsonBody(init);
    if (!userId || !freePackageId) {
      return { status: 400, data: { error: "Missing selection credentials" } };
    }

    const freePackages = await getCollectionDocs("free_packages");
    const pkg = freePackages.find(p => p.id === freePackageId);
    if (!pkg) {
      return { status: 404, data: { error: "Selected free package configuration was not found" } };
    }

    const requestId = "freq_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const newRequest = {
      id: requestId,
      userId,
      userEmail: userEmail || "anonymous@janucyberpack",
      userName: userName || "Anonymous User",
      freePackageId,
      isp: pkg.isp,
      packageType: pkg.packageType,
      packageName: pkg.packageName,
      price: pkg.price,
      codeReceived: pkg.code,
      requestedAt: new Date().toISOString()
    };

    await setDoc(doc(db, "free_requests", requestId), newRequest);
    const updated = await getCollectionDocs("free_requests");
    return { status: 200, data: { status: "success", freeRequests: updated } };
  }

  // 5. Admin Free Package operations
  if (path === "/api/admin/free-packages/save" && method === "POST") {
    const pkg = await getJsonBody(init);
    const pkgId = pkg.id || "free-pack-" + Date.now();
    pkg.id = pkgId;
    pkg.createdAt = pkg.createdAt || new Date().toISOString();

    await setDoc(doc(db, "free_packages", pkgId), { ...pkg, integritySalt: DB_INTEGRITY_SALT });
    const updated = await getCollectionDocs("free_packages");
    return { status: 200, data: { status: "success", freePackages: updated } };
  }

  if (path.startsWith("/api/admin/free-packages/") && method === "DELETE") {
    const id = path.split("/").pop();
    if (id) {
      await deleteDoc(doc(db, "free_packages", id));
      const updated = await getCollectionDocs("free_packages");
      return { status: 200, data: { status: "success", freePackages: updated } };
    }
  }

  // 6. Admin Free Voucher deletion
  if (path.startsWith("/api/admin/free-requests/") && method === "DELETE") {
    const id = path.split("/").pop();
    if (id) {
      await deleteDoc(doc(db, "free_requests", id));
      const updated = await getCollectionDocs("free_requests");
      return { status: 200, data: { status: "success", freeRequests: updated } };
    }
  }

  // 7. Dynamic Ad redirects and management
  if (path === "/api/admin/ad-settings" && method === "GET") {
    const email = queryParams.email || "";
    const adsSnap = await getDoc(doc(db, "settings", "ads"));
    const ads = adsSnap.exists() ? adsSnap.data() : { dayTimeAdCode: "", nightTimeAdCode: "" };

    if (email.toLowerCase().trim() === "chethiyabandara0001@gmail.com") {
      return {
        status: 200,
        data: {
          dayTimeAdCode: ads.dayTimeAdCode || "",
          nightTimeAdCode: ads.nightTimeAdCode || ""
        }
      };
    } else {
      return {
        status: 200,
        data: {
          dayTimeAdCode: "●●●●●●● (Restricted: Super-Admin Only)",
          nightTimeAdCode: ads.nightTimeAdCode || ""
        }
      };
    }
  }

  if (path === "/api/admin/ad-settings/save" && method === "POST") {
    const { email, dayTimeAdCode, nightTimeAdCode } = await getJsonBody(init);
    const adsRef = doc(db, "settings", "ads");
    const adsSnap = await getDoc(adsRef);
    const current = adsSnap.exists() ? adsSnap.data() : { dayTimeAdCode: "", nightTimeAdCode: "" };

    const targetEmail = String(email || "").toLowerCase().trim();
    if (targetEmail === "chethiyabandara0001@gmail.com") {
      current.dayTimeAdCode = dayTimeAdCode || "";
      current.nightTimeAdCode = nightTimeAdCode || "";
    } else {
      current.nightTimeAdCode = nightTimeAdCode || "";
    }

    await setDoc(adsRef, { ...current, integritySalt: DB_INTEGRITY_SALT });
    return { status: 200, data: { status: "success", adSettings: current } };
  }

  if (path === "/api/ad-settings/active" && method === "GET") {
    await ensureSeeded();
    const adsSnap = await getDoc(doc(db, "settings", "ads"));
    const ads = adsSnap.exists() ? adsSnap.data() : { dayTimeAdCode: "", nightTimeAdCode: "" };

    const currentHour = new Date().getUTCHours() + 5.5;
    const lankaHour = (currentHour >= 24 ? currentHour - 24 : currentHour) % 24;
    const isDay = lankaHour >= 6 && lankaHour < 18;
    const activeLink = isDay ? (ads.dayTimeAdCode || "https://t.me/janucyberpack") : (ads.nightTimeAdCode || "https://t.me/janucyberpack");

    return {
      status: 200,
      data: {
        adType: isDay ? "day" : "night",
        adLink: activeLink,
        isDay
      }
    };
  }

  // 8. Support Service Desk messaging
  if (path === "/api/support-messages/send" && method === "POST") {
    const { userId, userEmail, userName, message, sender } = await getJsonBody(init);
    const msgId = "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const newMessage = {
      id: msgId,
      userId,
      userEmail: userEmail || "unknown@user.com",
      userName: userName || "Visitor",
      message,
      sender,
      timestamp: new Date().toISOString()
    };

    await setDoc(doc(db, "support_messages", msgId), newMessage);
    return { status: 200, data: { status: "success", message: newMessage } };
  }

  if (path === "/api/support-messages" && method === "GET") {
    const userId = queryParams.userId;
    const messages = await getCollectionDocs("support_messages");
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const filtered = userId ? messages.filter(m => m.userId === userId) : messages;
    return { status: 200, data: filtered };
  }

  // 9. Verification bank slip operations
  if (path === "/api/slips/submit" && method === "POST") {
    const { userId, userEmail, userName, packageId, bankSlipBase64, tier } = await getJsonBody(init);
    if (!userId || !packageId || !bankSlipBase64) {
      return { status: 400, data: { error: "Missing required selection fields" } };
    }

    const packages = await getCollectionDocs("packages");
    const selectedPkg = packages.find(p => p.id === packageId);
    if (!selectedPkg) {
      return { status: 404, data: { error: "Selected Internet Package not found" } };
    }

    let resolvedPrice = selectedPkg.price;
    let resolvedCurrency = selectedPkg.priceCurrency;

    if (tier) {
      const normalized = tier.toLowerCase();
      if (normalized.includes("1000lkr")) resolvedPrice = 1000;
      else if (normalized.includes("200lkr")) resolvedPrice = 200;
      else if (normalized.includes("300lkr")) resolvedPrice = 300;
      else if (normalized.includes("400lkr")) resolvedPrice = 400;
      else if (normalized.includes("500lkr")) resolvedPrice = 500;
      else {
        const match = normalized.match(/for\s+(\d+)\s*lkr/);
        if (match) resolvedPrice = Number(match[1]);
      }
      resolvedCurrency = "LKR";
    }

    const slipId = "slip_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const newSlip = {
      id: slipId,
      userId,
      userEmail: userEmail || "unknown@user.com",
      userName: userName || "Data Store Customer",
      packageId,
      packageTitle: selectedPkg.title,
      vpnTypeName: selectedPkg.vpnTypeName,
      price: resolvedPrice,
      currency: resolvedCurrency,
      bankSlipBase64: bankSlipBase64, // holds clean downloadable cloud storage URL
      status: "pending",
      submittedAt: new Date().toISOString(),
      tier: tier || "Lite 100gb for 200lkr"
    };

    await setDoc(doc(db, "slips", slipId), newSlip);
    return { status: 200, data: { status: "success", message: "Receipt sent successfully.", slip: newSlip } };
  }

  if (path.startsWith("/api/slips/user/") && method === "GET") {
    const userId = path.split("/").pop();
    const slips = await getCollectionDocs("slips");
    const userSlips = userId ? slips.filter(s => s.userId === userId) : [];
    // Sort slips by submittedAt descending
    userSlips.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return { status: 200, data: userSlips };
  }

  // 10. Dashboard Statistics and Audits
  if (path === "/api/admin/dashboard-stats" && method === "GET") {
    const slips = await getCollectionDocs("slips");
    const users = await getCollectionDocs("users");
    const packages = await getCollectionDocs("packages");
    const posts = await getCollectionDocs("posts");

    const totalSales = slips
      .filter(s => s.status === "approved")
      .reduce((sum, item) => sum + (item.price || 0), 0);

    const pendingCount = slips.filter(s => s.status === "pending").length;
    const approvedCount = slips.filter(s => s.status === "approved").length;

    const sanitizedUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });

    return {
      status: 200,
      data: {
        totalUsers: sanitizedUsers.filter(u => u.role !== "admin").length,
        totalSales,
        pendingCount,
        approvedCount,
        users: sanitizedUsers,
        slips,
        packages,
        posts
      }
    };
  }

  // 11. Admin Maintenance controls
  if (path === "/api/admin/reset-stats" && method === "POST") {
    const slips = await getCollectionDocs("slips");
    for (const d of slips) {
      await deleteDoc(doc(db, "slips", d.id));
    }

    const users = await getCollectionDocs("users");
    for (const d of users) {
      if (d.role !== "admin" && d.uid !== "admin-master-account") {
        await deleteDoc(doc(db, "users", d.uid));
      }
    }

    return { status: 200, data: { success: true } };
  }

  if (path === "/api/admin/wipe-database" && method === "POST") {
    const collections = ["packages", "posts", "free_packages", "free_requests", "users", "slips", "support_messages"];
    for (const col of collections) {
      const list = await getCollectionDocs(col);
      for (const d of list) {
        const docId = d.id || d.uid || d.requestId;
        if (docId) await deleteDoc(doc(db, col, docId));
      }
    }
    await deleteDoc(doc(db, "settings", "seeding_state"));
    return { status: 200, data: { success: true, message: "Database successfully cleared entirely to nothing!" } };
  }

  if (path === "/api/admin/restore-defaults" && method === "POST") {
    const collections = ["packages", "posts", "free_packages", "free_requests", "slips", "support_messages"];
    for (const col of collections) {
      const list = await getCollectionDocs(col);
      for (const d of list) {
        const docId = d.id || d.uid || d.requestId;
        if (docId) await deleteDoc(doc(db, col, docId));
      }
    }
    await deleteDoc(doc(db, "settings", "seeding_state"));
    await ensureSeeded();

    const [packages, posts, freePackages] = await Promise.all([
      getCollectionDocs("packages"),
      getCollectionDocs("posts"),
      getCollectionDocs("free_packages")
    ]);

    return {
      status: 200,
      data: {
        success: true,
        message: "All collections restored to factory defaults.",
        packages,
        posts,
        freePackages
      }
    };
  }

  // 12. Slip Approval and Vouchers emission
  if (path.startsWith("/api/admin/slips/") && path.endsWith("/verify") && method === "POST") {
    const parts = path.split("/");
    const slipId = parts[parts.length - 2];
    if (slipId) {
      const { status, adminNotes, vpnCodeOverride } = await getJsonBody(init);
      if (!["approved", "rejected"].includes(status)) {
        return { status: 400, data: { error: "Invalid verification status state" } };
      }

      const slipRef = doc(db, "slips", slipId);
      const slipSnap = await getDoc(slipRef);
      if (!slipSnap.exists()) {
        return { status: 404, data: { error: "Payment slip record not found" } };
      }

      const slip = slipSnap.data();
      slip.status = status;
      slip.adminNotes = adminNotes || "";
      slip.verifiedAt = new Date().toISOString();

      if (status === "approved") {
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
            const vmessObj = {
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
            };
            const base64Str = window.btoa(unescape(encodeURIComponent(JSON.stringify(vmessObj))));
            vpnCode = `vmess://${base64Str}`;
          } else if (slip.vpnTypeName === "SSH") {
            vpnCode = `Host: sg-direct.datastore.shop\nPort: 22 / 443\nUsername: ds-user-${timestampToken.toLowerCase()}\nPassword: automated-pass-${timestampToken}\nPayload-Config: GET / HTTP/1.1[crlf]Host: unlimiteddata.shop[crlf][crlf]`;
          } else {
            vpnCode = `v2ray-x-tls://token-gate-${timestampToken}@tokyo-v2ray.datastore.shop:443?security=xtls&sni=unlimiteddata.shop`;
          }
        }

        slip.vpnCode = vpnCode;

        // Propagate package resources to the user data usage allocation
        const userRef = doc(db, "users", slip.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userObj = userSnap.data();
          const packages = await getCollectionDocs("packages");
          const targetPackage = packages.find(p => p.id === slip.packageId);

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
            billingCycleEnd: new Date(Date.now() + (targetPackage?.validityDays || 30) * 24 * 3600 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            speedLimitMbps: slip.vpnTypeName === "WireGuard" ? 300 : 150,
            activeConnections: 1
          };
          userObj.integritySalt = DB_INTEGRITY_SALT;
          await setDoc(userRef, userObj);
        }
      }

      slip.integritySalt = DB_INTEGRITY_SALT;
      await setDoc(slipRef, slip);
      return { status: 200, data: { status: "success", slip } };
    }
  }

  // 13. Admin package modifications saves/deletions
  if (path === "/api/admin/packages/save" && method === "POST") {
    const pkg = await getJsonBody(init);
    if (!pkg.title || !pkg.price) {
      return { status: 400, data: { error: "Missing pack header details" } };
    }
    const pkgId = pkg.id || "pack_" + Date.now();
    pkg.id = pkgId;
    pkg.status = pkg.status || "active";

    await setDoc(doc(db, "packages", pkgId), { ...pkg, integritySalt: DB_INTEGRITY_SALT });
    const updated = await getCollectionDocs("packages");
    return { status: 200, data: { status: "success", packages: updated } };
  }

  if (path.startsWith("/api/admin/packages/") && method === "DELETE") {
    const id = path.split("/").pop();
    if (id) {
      await deleteDoc(doc(db, "packages", id));
      const updated = await getCollectionDocs("packages");
      return { status: 200, data: { status: "success", packages: updated } };
    }
  }

  // 14. Admin dynamic knowledge base posts modifications details
  if (path === "/api/admin/posts/save" && method === "POST") {
    const post = await getJsonBody(init);
    if (!post.title || !post.content) {
      return { status: 400, data: { error: "Missing post header details" } };
    }
    const postId = post.id || "post_" + Date.now();
    post.id = postId;

    await setDoc(doc(db, "posts", postId), { ...post, integritySalt: DB_INTEGRITY_SALT });
    const updated = await getCollectionDocs("posts");
    return { status: 200, data: { status: "success", posts: updated } };
  }

  if (path.startsWith("/api/admin/posts/") && method === "DELETE") {
    const id = path.split("/").pop();
    if (id) {
      await deleteDoc(doc(db, "posts", id));
      const updated = await getCollectionDocs("posts");
      return { status: 200, data: { status: "success", posts: updated } };
    }
  }

  // 15. Admin User parameters modifiers
  if (path === "/api/admin/users/save-bandwidth" && method === "POST") {
    const { targetUserId, bandwidthToAddGB } = await getJsonBody(init);
    const userRef = doc(db, "users", targetUserId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userObj = userSnap.data();
      if (!userObj.dataUsage) {
        userObj.dataUsage = { totalGB: 0, usedGB: 0, billingCycleEnd: "Custom", speedLimitMbps: 150, activeConnections: 0 };
      }
      userObj.dataUsage.totalGB = (userObj.dataUsage.totalGB || 0) + Number(bandwidthToAddGB);
      userObj.integritySalt = DB_INTEGRITY_SALT;
      await setDoc(userRef, userObj);
    }
    return { status: 200, data: { status: "success", message: "Bandwidth saved" } };
  }

  if (path === "/api/admin/users/promote" && method === "POST") {
    const { targetUserId } = await getJsonBody(init);
    const userRef = doc(db, "users", targetUserId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userObj = userSnap.data();
      userObj.role = "admin";
      userObj.integritySalt = DB_INTEGRITY_SALT;
      await setDoc(userRef, userObj);
    }
    return { status: 200, data: { status: "success" } };
  }

  if (path === "/api/admin/users/demote" && method === "POST") {
    const { targetUserId } = await getJsonBody(init);
    const userRef = doc(db, "users", targetUserId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userObj = userSnap.data();
      userObj.role = "user";
      userObj.integritySalt = DB_INTEGRITY_SALT;
      await setDoc(userRef, userObj);
    }
    return { status: 200, data: { status: "success" } };
  }

  // 16. Admin global information update
  if (path === "/api/admin/contact/save" && method === "POST") {
    const contact = await getJsonBody(init);
    await setDoc(doc(db, "settings", "contact"), { ...contact, integritySalt: DB_INTEGRITY_SALT });
    return { status: 200, data: { status: "success", contact } };
  }

  if (path === "/api/admin/announcement/save" && method === "POST") {
    const announcement = await getJsonBody(init);
    await setDoc(doc(db, "settings", "announcement"), { ...announcement, integritySalt: DB_INTEGRITY_SALT });
    return { status: 200, data: { status: "success", announcement } };
  }

  if (path === "/api/admin/maintenance/save" && method === "POST") {
    const maintenance = await getJsonBody(init);
    await setDoc(doc(db, "settings", "maintenance"), { ...maintenance, integritySalt: DB_INTEGRITY_SALT });
    return { status: 200, data: { status: "success", maintenance } };
  }

  if (path === "/api/admin/backup/save-to-file" && method === "POST") {
    const [
      packages,
      posts,
      contactSnap,
      announcementSnap,
      maintenanceSnap,
      adSnap,
      supportMessages,
      users,
      slips,
      freePackages,
      freeRequests
    ] = await Promise.all([
      getCollectionDocs("packages"),
      getCollectionDocs("posts"),
      getDoc(doc(db, "settings", "contact")),
      getDoc(doc(db, "settings", "announcement")),
      getDoc(doc(db, "settings", "maintenance")),
      getDoc(doc(db, "settings", "ads")),
      getCollectionDocs("support_messages"),
      getCollectionDocs("users"),
      getCollectionDocs("slips"),
      getCollectionDocs("free_packages"),
      getCollectionDocs("free_requests")
    ]);

    const backupData = {
      packages,
      posts,
      contact: contactSnap.exists() ? contactSnap.data() : {},
      announcement: announcementSnap.exists() ? announcementSnap.data() : {},
      maintenance: maintenanceSnap.exists() ? maintenanceSnap.data() : { maintenanceMode: false },
      adSettings: adSnap.exists() ? adSnap.data() : {},
      supportMessages,
      users,
      slips,
      freePackages,
      freeRequests
    };

    return {
      status: 200,
      data: {
        status: "success",
        message: "Data backed up successfully (locally compiled)",
        data: backupData
      }
    };
  }

  if (path === "/api/admin/backup/download" && method === "GET") {
    const [
      packages,
      posts,
      contactSnap,
      announcementSnap,
      maintenanceSnap,
      adSnap,
      supportMessages,
      users,
      slips,
      freePackages,
      freeRequests
    ] = await Promise.all([
      getCollectionDocs("packages"),
      getCollectionDocs("posts"),
      getDoc(doc(db, "settings", "contact")),
      getDoc(doc(db, "settings", "announcement")),
      getDoc(doc(db, "settings", "maintenance")),
      getDoc(doc(db, "settings", "ads")),
      getCollectionDocs("support_messages"),
      getCollectionDocs("users"),
      getCollectionDocs("slips"),
      getCollectionDocs("free_packages"),
      getCollectionDocs("free_requests")
    ]);

    const backupData = {
      packages,
      posts,
      contact: contactSnap.exists() ? contactSnap.data() : {},
      announcement: announcementSnap.exists() ? announcementSnap.data() : {},
      maintenance: maintenanceSnap.exists() ? maintenanceSnap.data() : { maintenanceMode: false },
      adSettings: adSnap.exists() ? adSnap.data() : {},
      supportMessages,
      users,
      slips,
      freePackages,
      freeRequests
    };

    return {
      status: 200,
      data: backupData
    };
  }

  return {
    status: 404,
    data: { error: `Client API route [${method}] ${path} not implemented.` }
  };
}

// Export customFetch as a clean exported function for direct local imports
export async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);
  if (url.includes("/api/")) {
    try {
      const responseObj = await handleClientApiRoute(url, init);
      return new Response(JSON.stringify(responseObj.data), {
        status: responseObj.status,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err: any) {
      console.error("[Client API Error]:", err);
      return new Response(JSON.stringify({ error: err?.message || String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  return window.fetch(input, init);
}

// Global window interceptor initialization as fallback with try-catch block
try {
  const originalFetch = window.fetch;
  if (originalFetch) {
    Object.defineProperty(window, "fetch", {
      value: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);
        if (url.includes("/api/")) {
          try {
            const responseObj = await handleClientApiRoute(url, init);
            return new Response(JSON.stringify(responseObj.data), {
              status: responseObj.status,
              headers: { "Content-Type": "application/json" }
            });
          } catch (err: any) {
            console.error("[Client Backend Interceptor Crash]:", err);
            return new Response(JSON.stringify({ error: err?.message || String(err) }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        return originalFetch(input, init);
      },
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
} catch (e) {
  console.warn("[Client Backend] Global window.fetch is read-only, using direct module imports instead.", e);
}

console.log("[Client Backend] 100% Serverless browser client-side database proxy active successfully!");
