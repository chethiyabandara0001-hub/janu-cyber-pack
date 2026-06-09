import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Package, Post, PaymentSlip, ContactDetails, HomeAnnouncement, FreePackage, FreeRequest, AdSettings } from '../types';
// import { customFetch as fetch } from './clientBackend';

/**
 * Uploads an image blob or file directly to Firebase Storage and retrieves its public download URL.
 * @param file The File/Blob to upload
 * @param folder Target folder in Firebase Storage bucket (e.g. 'slips' or 'packages')
 * @returns Promise containing the public HTTPS download URL
 */
export async function uploadImageToStorage(file: Blob | File, folder: string): Promise<string> {
  const fileExtension = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
  const storageRef = ref(storage, `${folder}/${filename}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null, // can listen to progress later if interested
      (error) => {
        console.error('Firebase Storage direct upload failure:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(`Firebase Storage upload successful. Public URL: ${downloadURL}`);
          resolve(downloadURL);
        } catch (err) {
          console.error('Error fetching download URL from uploaded task:', err);
          reject(err);
        }
      }
    );
  });
}

function dataURItoBlob(dataURI: string): Blob {
  const parts = dataURI.split(',');
  const byteString = atob(parts[1]);
  const mimeString = parts[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Clean service wrapper class and methods that abstracts DB writes, Auth, Storage and Server API proxies
 */
export const firebaseService = {
  // Storage upload helper
  uploadImage: async (file: Blob | File, folder: string): Promise<string> => {
    return uploadImageToStorage(file, folder);
  },

  // Helper to upload base64 image strings directly to Storage if needed
  uploadIfBase64: async (imageStr: string, folder: string): Promise<string> => {
    if (!imageStr) return '';
    if (imageStr.startsWith('data:image/')) {
      try {
        const blob = dataURItoBlob(imageStr);
        const url = await uploadImageToStorage(blob, folder);
        return url;
      } catch (e) {
        console.error('Failed to upload image to Firebase Storage, keeping base64 as fallback:', e);
        return imageStr;
      }
    }
    return imageStr;
  },

  // Auth operations
  signInWithEmail: async (email: string, password?: string) => {
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  registerWithEmail: async (email: string, password?: string, displayName?: string, role?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, role })
    });
    return response.json();
  },

  signInWithGoogle: async (credential: string) => {
    const res = await fetch('/api/auth/sign-in', {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({ provider: 'google', credential })
    });
    return res.json();
  },

  // Global data initializer
  fetchInitialData: async () => {
    const res = await fetch('/api/initial-data');
    if (!res.ok) throw new Error('Failed to retrieve initial web packages');
    return res.json();
  },

  // Free VPN plans
  submitFreeRequest: async (userId: string, userEmail: string, userName: string, freePackageId: string) => {
    const response = await fetch('/api/free-requests/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userEmail, userName, freePackageId })
    });
    return response.json();
  },

  saveFreePackage: async (pkg: FreePackage) => {
    const response = await fetch('/api/admin/free-packages/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg)
    });
    return response.json();
  },

  // Ad integrations
  saveAdSettings: async (settings: AdSettings) => {
    const res = await fetch('/api/admin/ad-settings/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  fetchActiveAdSettings: async () => {
    const res = await fetch('/api/ad-settings/active');
    return res.json();
  },

  // Support 1-on-1 direct server messages
  sendSupportMessage: async (userId: string, email: string, name: string, msgText: string, sender: 'user' | 'admin') => {
    const res = await fetch('/api/support-messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userEmail: email, userName: name, message: msgText, sender })
    });
    return res.json();
  },

  fetchSupportMessages: async (userId?: string) => {
    const url = userId ? `/api/support-messages?userId=${userId}` : '/api/support-messages';
    const res = await fetch(url);
    return res.json();
  },

  // Slip wire submission
  submitPaymentSlip: async (slipData: {
    userId: string;
    userEmail: string;
    userName: string;
    packageId: string;
    bankSlipBase64: string; // The Storage public download URL is placed here for backward compatibility
    tier?: string;
  }) => {
    const res = await fetch('/api/slips/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slipData)
    });
    return res.json();
  },

  // Admin control center
  fetchAdminStats: async () => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/dashboard-stats', {
      headers: {
        'X-Requester-Uid': uid
      }
    });
    return res.json();
  },

  resetStats: async () => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/reset-stats', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requester-Uid': uid
      }
    });
    return res.json();
  },

  savePackage: async (pkg: Package) => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/packages/save', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'X-Requester-Uid': uid
      },
      body: JSON.stringify(pkg)
    });
    return res.json();
  },

  savePost: async (post: Post) => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/posts/save', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requester-Uid': uid
      },
      body: JSON.stringify(post)
    });
    return res.json();
  },

  saveUserBandwidth: async (targetUserId: string, bandwidthToAddGB: number) => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/users/save-bandwidth', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requester-Uid': uid
      },
      body: JSON.stringify({ targetUserId, bandwidthToAddGB })
    });
    return res.json();
  },

  promoteUser: async (targetUserId: string) => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/users/promote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requester-Uid': uid
      },
      body: JSON.stringify({ targetUserId })
    });
    return res.json();
  },

  demoteUser: async (targetUserId: string) => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/users/demote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requester-Uid': uid
      },
      body: JSON.stringify({ targetUserId })
    });
    return res.json();
  },

  saveContactDetails: async (contact: ContactDetails) => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/contact/save', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requester-Uid': uid
      },
      body: JSON.stringify(contact)
    });
    return res.json();
  },

  saveAnnouncement: async (announcement: HomeAnnouncement) => {
    let uid = '';
    try {
      const rawUser = localStorage.getItem('janu-cyber-user');
      if (rawUser) uid = JSON.parse(rawUser).uid || '';
    } catch(e) {}
    const res = await fetch('/api/admin/announcement/save', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requester-Uid': uid
      },
      body: JSON.stringify(announcement)
    });
    return res.json();
  }
};
