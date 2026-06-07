import { config } from "dotenv";
config();
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import fetch from "node-fetch";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: "ai-studio-05efdffc-31e5-48da-b96f-d2964f93684b"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, "ai-studio-05efdffc-31e5-48da-b96f-d2964f93684b");

import { INITIAL_PACKAGES, INITIAL_POSTS } from "./src/mockData";

async function run() {
  console.log("Restoring packages...");
  const packagesRef = collection(db, "packages");
  const packagesSnap = await getDocs(packagesRef);
  for (const d of packagesSnap.docs) {
    await deleteDoc(doc(db, "packages", d.id));
  }
  for (const pkg of INITIAL_PACKAGES) {
    await setDoc(doc(db, "packages", pkg.id), pkg);
  }

  console.log("Restoring posts...");
  const postsRef = collection(db, "posts");
  const postsSnap = await getDocs(postsRef);
  for (const d of postsSnap.docs) {
    await deleteDoc(doc(db, "posts", d.id));
  }
  for (const post of INITIAL_POSTS) {
    await setDoc(doc(db, "posts", post.id), post);
  }
  
  console.log("Restoring free packages...");
  const freeRef = collection(db, "free_packages");
  const freeSnap = await getDocs(freeRef);
  for (const d of freeSnap.docs) {
    await deleteDoc(doc(db, "free_packages", d.id));
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
      code: "WGRD-DIALOG-ZOOM-99X-FREE",
      createdAt: new Date().toISOString()
    },
    {
      id: "free-mobitel-any-youtube",
      isp: "Mobitel" as const,
      packageType: "Any" as const,
      packageName: "YouTube Unlimited",
      price: "Free",
      code: "WGRD-MOBITEL-YT-99X-FREE",
      createdAt: new Date().toISOString()
    }
  ];
  for (const fp of initialFree) {
    await setDoc(doc(db, "free_packages", fp.id), fp);
  }
  
  console.log("Marking seeded...");
  await setDoc(doc(db, "settings", "seeding_state"), { seeded: true });

  console.log("Done!");
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
