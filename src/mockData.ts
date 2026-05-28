/**
 * Static or Dynamic Initial Seed Data for Data Store App
 */
import { Package, Post, ContactDetails, HomeAnnouncement } from './types';

export const INITIAL_PACKAGES: Package[] = [
  {
    id: 'pack-wg-unlimited',
    title: 'Super WireGuard Premium Unlimited',
    description: 'High speed, ultra-secure tunneling protocol optimized for maximum bandwidth. Perfect for continuous heavy media streaming and ultra low-latency gaming with extreme privacy protocols.',
    price: 1500,
    priceCurrency: 'LKR',
    validityDays: 30,
    bandwidthGB: 'Unlimited',
    vpnTypeName: 'WireGuard',
    imageURL: '',
    isFeatured: true,
    status: 'active'
  },
  {
    id: 'pack-vmess-pro',
    title: 'VMess Stealth Protocol 100GB',
    description: 'Bypass toughest region-blocks and strong firewalls using advanced VMess protocol with encrypted headers. Includes high-performance dynamic route optimization.',
    price: 950,
    priceCurrency: 'LKR',
    validityDays: 30,
    bandwidthGB: '100 GB',
    vpnTypeName: 'Vmess',
    imageURL: '',
    isFeatured: true,
    status: 'active'
  },
  {
    id: 'pack-ssh-tunnel',
    title: 'Secure SSH Direct Tunnel',
    description: 'Classic high-speed SSH Direct tunnel server with custom payloads supported. Best for custom-config injection, network tinkering, and low-latency packet tunneling.',
    price: 600,
    priceCurrency: 'LKR',
    validityDays: 30,
    bandwidthGB: '75 GB',
    vpnTypeName: 'SSH',
    imageURL: '',
    isFeatured: false,
    status: 'active'
  },
  {
    id: 'pack-v2ray-ultra',
    title: 'V2Ray X-TLS Extreme Unlimited',
    description: 'State of the art dynamic transport protocol. Unblock any website and secure connection utilizing modern encryption with dynamic routing controls.',
    price: 1750,
    priceCurrency: 'LKR',
    validityDays: 30,
    bandwidthGB: 'Unlimited',
    vpnTypeName: 'V2Ray',
    imageURL: '',
    isFeatured: true,
    status: 'active'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'How to setup WireGuard on Windows, Android and iOS',
    excerpt: 'Step-by-step beginner-friendly tutorial to load your custom high-speed WireGuard configuration file.',
    content: `### Setting up WireGuard on Your Devices

WireGuard is an extremely simple yet fast and modern VPN that utilizes state-of-the-art cryptography. It is designed as a general-purpose VPN for running on embedded interfaces and supercomputers alike. Here is how to configure it:

1. **Download the App**: Install WireGuard from the official stores for Windows, macOS, Android, or iOS.
2. **Import Configuration**: Open the app and import the \`.conf\` file or scan the QR Code received in your inbox.
3. **Connect**: Tap or click "Activate" to instantly encrypt your entire network connection!

No logs are kept, and speeds are up to 6x faster than standard OpenVPN!`,
    category: 'featured',
    author: 'Admin Support',
    date: '2026-05-24',
    imageURL: ''
  },
  {
    id: 'post-2',
    title: 'Bypassing ISP Throttling with Stealthed VMess Protocol',
    excerpt: 'Learn about VMess dynamic transport headers and why it is the ultimate option in highly restricted networks.',
    content: `### Stealthed VMess and V2Ray Explained

VMess is a state-space network protocol designed for clients to proxy connections through highly secured outbound networks.

* **Dynamic Websocket Tunneling**: Encapsulates packets to look like harmless HTTPS web chats.
* **Header Customization**: Prevents Deep Packet Inspection (DPI) trackers from matching patterns.
* **Multi-Node Fallbacks**: Intelligently tests and swaps servers if network latency rises.`,
    category: 'recent',
    author: 'Network Team',
    date: '2026-05-26',
    imageURL: ''
  },
  {
    id: 'post-3',
    title: 'Data Store Server Upgrades: Double Bandwidth Nodes',
    excerpt: 'We have upgraded our core Singapore, Tokyo, and US gateway endpoints to 10Gbps uplinks.',
    content: `We are thrilled to announce that our primary server hubs are now fully upgraded!

All customers holding active **WireGuard** and **VMess** subscriptions will automatically benefit from:
- Improved latencies by an average of 40%
- Double bandwidth allocations for cap-based plans at no extra cost
- Enhanced multi-user stability during peak hours

Thank you for trusting **Data Store** as your primary premium VPN network provider!`,
    category: 'news',
    author: 'Engineering',
    date: '2026-05-27',
    imageURL: ''
  }
];

export const INITIAL_CONTACT: ContactDetails = {
  phone: '+94 77 123 4567',
  email: 'support@datastore.shop',
  telegramChannel: 'https://t.me/DataStoreVPNChannel',
  telegramBotUser: '@DataStoreVPNSecureBot',
  address: 'No 45, Galle Road, Colombo 03, Sri Lanka',
  workingHours: '24/7 Priority Automated System / 08:30 AM - 10:00 PM Live Admin Support'
};

export const INITIAL_ANNOUNCEMENT: HomeAnnouncement = {
  title: '🎉 Premium Network Upgrades Completed 🎉',
  subtitle: 'Enjoy lightning fast internet with low-latency and absolute privacy.',
  announcementText: 'We have completed our global node synchronization. All premium WireGuard, Vmess, and SSH servers are fully online on full speeds. Upload any payment slips under your account for automatic delivery in minutes!',
  showAnnouncement: true
};
