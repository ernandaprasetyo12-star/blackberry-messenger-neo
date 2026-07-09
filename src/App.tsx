import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Users, 
  Rss, 
  Settings as SettingsIcon, 
  Lock, 
  Send, 
  Sparkles, 
  User as UserIcon, 
  Image, 
  Smile, 
  RefreshCw, 
  Radio, 
  ChevronRight, 
  Bell, 
  Key, 
  Volume2, 
  VolumeX, 
  Search, 
  Plus, 
  ArrowLeft,
  X,
  HelpCircle,
  FileText,
  LogOut
} from "lucide-react";
import { User, Message, Group, FeedUpdate, ChatSession } from "./types";
import { 
  subtle,
  hashPin, 
  generateE2EKeyPair, 
  exportPublicKey, 
  encryptPrivateKey, 
  decryptPrivateKey, 
  encryptMessagePayload, 
  decryptMessagePayload,
  encryptGroupPayload,
  decryptGroupPayload
} from "./utils/crypto";
import { playPingSound, playMessageSound, setMuteState, getMuteState } from "./utils/audio";

const CLASSIC_STICKERS = [
  { id: "stk_smile", char: "😀", name: "Senyum" },
  { id: "stk_wink", char: "😉", name: "Kedip" },
  { id: "stk_cool", char: "😎", name: "Keren" },
  { id: "stk_love", char: "😍", name: "Cinta" },
  { id: "stk_angry", char: "😡", name: "Marah" },
  { id: "stk_cry", char: "😭", name: "Nangis" },
  { id: "stk_surprised", char: "😮", name: "Terkejut" },
  { id: "stk_sleep", char: "😴", name: "Tidur" },
  { id: "stk_sweat", char: "😅", name: "Gugup" },
  { id: "stk_thumbsup", char: "👍", name: "Jempol" },
  { id: "stk_star", char: "⭐", name: "Bintang" },
  { id: "stk_heart", char: "❤️", name: "Hati" }
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&h=150",
];

function BbmLogoSvg({ className = "w-40 h-40" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.25))" }}
    >
      <defs>
        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="silverStroke" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="blueStroke" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.4"/>
        </filter>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5"/>
        </filter>
      </defs>

      {/* Back Silver Bubble */}
      <g filter="url(#innerGlow)">
        <path 
          d="M 60 40 L 160 40 C 176.5 40 190 53.5 190 70 L 190 140 C 190 156.5 176.5 170 160 170 L 150 170 L 150 190 L 125 170 L 60 170 C 43.5 170 30 156.5 30 140 L 30 70 C 30 53.5 43.5 40 60 40 Z" 
          fill="url(#silverGrad)" 
          stroke="url(#silverStroke)" 
          strokeWidth="3" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 60 43 L 160 43 C 174.9 43 187 55.1 187 70 L 187 140 C 187 154.9 174.9 167 160 167 L 148 167 L 148 183 L 127 167 L 60 167 C 45.1 167 33 154.9 33 140 L 33 70 C 33 55.1 45.1 43 60 43 Z" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="1.5" 
          strokeLinejoin="round" 
          opacity="0.6"
        />
      </g>

      {/* Front Blue Bubble */}
      <g filter="url(#innerGlow)">
        <path 
          d="M 40 20 L 140 20 C 156.5 20 170 33.5 170 50 L 170 120 C 170 136.5 156.5 150 140 150 L 75 150 L 50 170 L 50 150 L 40 150 C 23.5 150 10 136.5 10 120 L 10 50 C 10 33.5 23.5 20 40 20 Z" 
          fill="url(#blueGrad)" 
          stroke="url(#blueStroke)" 
          strokeWidth="3" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 40 23 L 140 23 C 154.9 23 167 35.1 167 50 L 167 120 C 167 134.9 154.9 147 140 147 L 73 147 L 53 163 L 53 147 L 40 147 C 25.1 147 13 134.9 13 120 L 13 50 C 13 35.1 25.1 23 40 23 Z" 
          fill="none" 
          stroke="#7dd3fc" 
          strokeWidth="1.5" 
          strokeLinejoin="round" 
          opacity="0.5"
        />
      </g>

      {/* BlackBerry Logo Dots (Metal) */}
      <g filter="url(#logoShadow)" fill="url(#metalGrad)">
        {/* Top Row */}
        <path d="M 68 52 L 78 52 Q 84 52 84 58 Q 84 64 78 64 L 65 64 Z" />
        <path d="M 98 52 L 108 52 Q 114 52 114 58 Q 114 64 108 64 L 95 64 Z" />
        
        {/* Middle Row */}
        <path d="M 53 72 L 63 72 Q 69 72 69 78 Q 69 84 63 84 L 50 84 Z" />
        <path d="M 83 72 L 93 72 Q 99 72 99 78 Q 99 84 93 84 L 80 84 Z" />
        <path d="M 113 72 L 123 72 Q 129 72 129 78 Q 129 84 123 84 L 110 84 Z" />
        
        {/* Bottom Row */}
        <path d="M 68 92 L 78 92 Q 84 92 84 98 Q 84 104 78 104 L 65 104 Z" />
        <path d="M 98 92 L 108 92 Q 114 92 114 98 Q 114 104 108 104 L 95 104 Z" />
      </g>
    </svg>
  );
}

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPrivateKey, setUserPrivateKey] = useState<CryptoKey | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Startup Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setShowSplash(false);
        }, 500);
      }
      setSplashProgress(progress);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Auth Forms
  const [authMode, setAuthMode] = useState<"welcome" | "login" | "register" | "recover">("welcome");
  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regPinPass, setRegPinPass] = useState("");
  const [regAvatar, setRegAvatar] = useState(PRESET_AVATARS[0]);

  const [loginCredential, setLoginCredential] = useState("");
  const [loginPinPass, setLoginPinPass] = useState("");

  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverNewPin, setRecoverNewPin] = useState("");
  const [recoverStep, setRecoverStep] = useState<"request" | "verify">("request");
  const [recoverCode, setRecoverCode] = useState("");
  const [incomingCodeSim, setIncomingCodeSim] = useState<{ email: string; code: string } | null>(null);

  // BBM Original Settings
  const [settingShowMusic, setSettingShowMusic] = useState(() => localStorage.getItem("bbm_set_show_music") !== "false");
  const [settingShowTimezone, setSettingShowTimezone] = useState(() => localStorage.getItem("bbm_set_show_timezone") !== "false");
  const [settingHighE2E, setSettingHighE2E] = useState(() => localStorage.getItem("bbm_set_high_e2e") !== "false");
  const [settingShowReceipts, setSettingShowReceipts] = useState(() => localStorage.getItem("bbm_set_show_receipts") !== "false");
  const [settingAutoAccept, setSettingAutoAccept] = useState(() => localStorage.getItem("bbm_set_auto_accept") === "true");
  const [settingEnterToSend, setSettingEnterToSend] = useState(() => localStorage.getItem("bbm_set_enter_send") !== "false");
  const [settingSaveHistory, setSettingSaveHistory] = useState(() => localStorage.getItem("bbm_set_save_history") !== "false");
  const [settingBbmTone, setSettingBbmTone] = useState(() => localStorage.getItem("bbm_set_bbm_tone") !== "false");
  const [settingVibrate, setSettingVibrate] = useState(() => localStorage.getItem("bbm_set_vibrate") !== "false");

  // Logout and privacy modals
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showBbidLearnMore, setShowBbidLearnMore] = useState(false);
  const [recoverNewPinPass, setRecoverNewPinPass] = useState("");

  // Navigation: "chats" | "contacts" | "groups" | "updates" | "settings"
  const [activeTab, setActiveTab] = useState<"chats" | "contacts" | "groups" | "updates" | "settings">("chats");

  // Sync state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [allFeeds, setAllFeeds] = useState<FeedUpdate[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const [contactTypes, setContactTypes] = useState<Record<string, 'google' | 'phone' | 'global'>>({});

  useEffect(() => {
    if (currentUser) {
      try {
        const stored = localStorage.getItem(`bbm_contacts_${currentUser.id}`);
        if (stored) setContactTypes(JSON.parse(stored));
      } catch {}
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && Object.keys(contactTypes).length > 0) {
      localStorage.setItem(`bbm_contacts_${currentUser.id}`, JSON.stringify(contactTypes));
    }
  }, [contactTypes, currentUser]);

  // Active conversation state
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});

  // Message composer
  const [messageText, setMessageText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showStickerPanel, setShowStickerPanel] = useState(false);

  // Profile customization dialogs
  const [customStatus, setCustomStatus] = useState("");
  const [nowPlayingTitle, setNowPlayingTitle] = useState("");
  const [nowPlayingArtist, setNowPlayingArtist] = useState("");

  // Modals / Overlays
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);

  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [newPinValue, setNewPinValue] = useState("");
  const [confirmPinPass, setConfirmPinPass] = useState("");

  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  // Edit profile states
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editNameCurrent, setEditNameCurrent] = useState("");
  const [editNameNew, setEditNameNew] = useState("");
  const [editNameConfirm, setEditNameConfirm] = useState("");

  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [editStatusValue, setEditStatusValue] = useState("");

  // Connection offline simulation
  const [isOffline, setIsOffline] = useState(false);

  // UI state
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(getMuteState());
  const [searchFilter, setSearchFilter] = useState("");

  // Refs
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Generate randomized 8-char hex BBM PIN helper
  const generateRandomPin = () => {
    const chars = "0123456789ABCDEF";
    let pin = "";
    for (let i = 0; i < 8; i++) {
      pin += chars[Math.floor(Math.random() * chars.length)];
    }
    setRegPin(pin);
  };

  useEffect(() => {
    if (!regPin) {
      generateRandomPin();
    }
  }, []);

  // Show status notification
  const triggerNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Restore session on load
  useEffect(() => {
    const savedUser = localStorage.getItem("bbm_neo_user");
    const savedToken = localStorage.getItem("bbm_neo_token");
    const savedPrivateKey = localStorage.getItem("bbm_neo_private_key");

    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setAuthToken(savedToken);
      
      if (savedPrivateKey) {
        // Try to decrypt or parse private key if pin was saved or we ask user
        // For persistent seamless E2EE experience, we cache decrypted private key in memory.
        // On app reload, if we have private key JWK stored directly in session (safely for this simulation), load it
        try {
          const jwk = JSON.parse(savedPrivateKey);
          subtle.importKey(
            "jwk",
            jwk,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["decrypt"]
          ).then(key => {
            setUserPrivateKey(key);
          }).catch(err => {
            console.error("Failed to restore private key:", err);
          });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Poll sync API every 1.5 seconds to feel completely real-time
  useEffect(() => {
    if (!currentUser) return;

    const performSync = async () => {
      try {
        const response = await fetch(`/api/sync?since=${lastSyncTime}&userId=${currentUser.id}`);
        if (!response.ok) return;

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return;
        }

        const data = await response.json();
        
        // Detect server reset (user is no longer in the DB)
        if (data.users && !data.users.find((u: User) => u.id === currentUser.id)) {
          setCurrentUser(null);
          setUserPrivateKey(null);
          setAuthToken(null);
          setActiveChatSession(null);
          localStorage.removeItem("bbm_neo_user");
          localStorage.removeItem("bbm_neo_token");
          localStorage.removeItem("bbm_neo_private_key");
          triggerNotification("Sesi kadaluarsa (Sistem direset). Silakan login kembali.", "error");
          return;
        }

        // Merge updates
        setAllUsers(data.users || []);
        
        if (data.messages && data.messages.length > 0) {
          setAllMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = data.messages.filter((m: Message) => !existingIds.has(m.id));
            
            // Play notification sound if there are new incoming messages
            const incoming = newMsgs.filter((m: Message) => m.senderId !== currentUser.id);
            if (incoming.length > 0) {
              const hasPing = incoming.some((m: Message) => m.isPing);
              if (hasPing) {
                playPingSound();
                triggerNotification(`🚨 PING!!! dari ${incoming[0].senderName}`, "error");
              } else {
                playMessageSound();
                triggerNotification(`💬 Pesan baru dari ${incoming[0].senderName}`, "success");
              }
            }

            return [...prev, ...newMsgs];
          });
        }

        if (data.feeds && data.feeds.length > 0) {
          setAllFeeds(prev => {
            const existingIds = new Set(prev.map(f => f.id));
            const newFeeds = data.feeds.filter((f: FeedUpdate) => !existingIds.has(f.id));
            return [...newFeeds, ...prev];
          });
        }

        if (data.groups) {
          setAllGroups(data.groups);
        }

        setLastSyncTime(data.timestamp || Date.now());
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    performSync(); // Run immediately
    const interval = setInterval(performSync, 1500);
    return () => clearInterval(interval);
  }, [currentUser, lastSyncTime]);

  // Handle decryption of messages dynamically when they are loaded
  useEffect(() => {
    const decryptAll = async () => {
      if (!currentUser || !userPrivateKey) return;

      const newDecrypted: Record<string, string> = { ...decryptedMessages };
      let updated = false;

      for (const msg of allMessages) {
        if (newDecrypted[msg.id]) continue;

        if (msg.isGroup) {
          // Find group info to decrypt
          const group = allGroups.find(g => g.id === msg.receiverId);
          if (group) {
            const plain = await decryptGroupPayload(msg.encryptedContent, group.id, group.name);
            newDecrypted[msg.id] = plain;
            updated = true;
          } else {
            newDecrypted[msg.id] = "[Grup terenkripsi - Gagal mengurai detail]";
          }
        } else {
          // Peer-to-peer message
          if (msg.senderId === currentUser.id) {
            // Decrypt my own messages: They are encrypted for recipient's public key.
            // To make E2E sync complete across multiple devices, we decrypt with sender private key 
            // if we also encrypted for both or if we fall back to decrypted memory.
            // To keep it clean, if it is my own message, we can decrypt using our own private key
            // since we encrypted it using recipient key. Actually, we store the original plaintext in sending flow
            // or decrypt it if we also stored the text.
            const plain = await decryptMessagePayload(msg.encryptedContent, userPrivateKey);
            newDecrypted[msg.id] = plain;
            updated = true;
          } else {
            // Incoming message encrypted with my public key
            const plain = await decryptMessagePayload(msg.encryptedContent, userPrivateKey);
            newDecrypted[msg.id] = plain;
            updated = true;
          }
        }
      }

      if (updated) {
        setDecryptedMessages(newDecrypted);
      }
    };

    decryptAll();
  }, [allMessages, currentUser, userPrivateKey, allGroups]);

  // Auto scroll to chat bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, activeChatSession]);

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regName || !regPin || !regPinPass) {
      triggerNotification("Silakan lengkapi semua kolom pendaftaran!", "error");
      return;
    }

    try {
      // Create user's public/private keypair for true End-to-End Encryption
      const keyPair = await generateE2EKeyPair();
      const pubKeyJwk = await exportPublicKey(keyPair.publicKey);
      
      // Derive hashed PIN password for login validation
      const pinPassHash = await hashPin(regPinPass);
      
      // Encrypt the Private Key with PIN-derived key so it can be stored on the server safely (E2EE sync)
      const encryptedPrivKey = await encryptPrivateKey(keyPair.privateKey, regPinPass);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          name: regName,
          pin: regPin,
          pinHash: pinPassHash,
          encryptedPrivateKey: encryptedPrivKey,
          publicKey: pubKeyJwk,
          avatar: regAvatar
        })
      });

      const data = await response.json();
      if (!response.ok) {
        triggerNotification(data.error || "Gagal mendaftar.", "error");
        return;
      }

      // Store in state & localStorage
      setCurrentUser(data.user);
      setUserPrivateKey(keyPair.privateKey);
      setAuthToken(data.token);

      localStorage.setItem("bbm_neo_user", JSON.stringify(data.user));
      localStorage.setItem("bbm_neo_token", data.token);
      
      // Save Private Key JWK in local session storage safely to avoid decrypting on every refresh
      const privateJwk = await subtle.exportKey("jwk", keyPair.privateKey);
      localStorage.setItem("bbm_neo_private_key", JSON.stringify(privateJwk));

      triggerNotification("Selamat datang di BBM Neo! Registrasi sukses.", "success");
    } catch (err) {
      console.error(err);
      triggerNotification("Gagal menghasilkan kunci keamanan E2EE.", "error");
    }
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCredential || !loginPinPass) {
      triggerNotification("Masukkan Email/Nama/PIN dan PIN keamanan Anda", "error");
      return;
    }

    try {
      const pinPassHash = await hashPin(loginPinPass);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameOrEmailOrPin: loginCredential,
          pinHash: pinPassHash
        })
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 404) {
          triggerNotification("Akun tidak ditemukan (Server Reset). Membuat ulang akun...", "info");
          
          // Auto-register to heal the ephemeral database
          const keyPair = await generateE2EKeyPair();
          const pubKeyJwk = await exportPublicKey(keyPair.publicKey);
          const encryptedPrivKey = await encryptPrivateKey(keyPair.privateKey, loginPinPass);

          const regResponse = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: loginCredential.includes('@') ? loginCredential : `${loginCredential}@bbm.neo`,
              name: loginCredential,
              pin: Math.random().toString(36).substring(2, 10).toUpperCase(),
              pinHash: pinPassHash,
              encryptedPrivateKey: encryptedPrivKey,
              publicKey: pubKeyJwk,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginCredential}`
            })
          });
          
          if (!regResponse.ok) {
            triggerNotification("Gagal membuat ulang akun.", "error");
            return;
          }
          const regData = await regResponse.json();
          setCurrentUser(regData.user);
          setUserPrivateKey(keyPair.privateKey);
          setAuthToken(regData.token);
          localStorage.setItem("bbm_neo_user", JSON.stringify(regData.user));
          localStorage.setItem("bbm_neo_token", regData.token);
          const privateJwk = await subtle.exportKey("jwk", keyPair.privateKey);
          localStorage.setItem("bbm_neo_private_key", JSON.stringify(privateJwk));
          triggerNotification(`Masuk sebagai ${regData.user.name} (${regData.user.pin})`, "success");
          return;
        }

        triggerNotification(data.error || "Login gagal.", "error");
        return;
      }

      // Decrypt the user's private key using their PIN
      const user = data.user;
      let privateKey: CryptoKey;

      if (!user.encryptedPrivateKey) {
        // Self-healing: Initialize E2EE keys on successful login if they are missing
        triggerNotification("Menginisialisasi kunci keamanan E2EE pertama kali...", "info");
        try {
          const keyPair = await generateE2EKeyPair();
          const pubKeyJwk = await exportPublicKey(keyPair.publicKey);
          const encryptedPrivKey = await encryptPrivateKey(keyPair.privateKey, loginPinPass);

          // Call backend to persist them
          const updateResponse = await fetch("/api/user/update-profile", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.token}`
            },
            body: JSON.stringify({
              encryptedPrivateKey: encryptedPrivKey,
              publicKey: pubKeyJwk
            })
          });

          if (!updateResponse.ok) {
            const updateErr = await updateResponse.json();
            console.error("Failed to persist initialized E2EE keys:", updateErr);
          }

          user.encryptedPrivateKey = encryptedPrivKey;
          user.publicKey = pubKeyJwk;
          privateKey = keyPair.privateKey;
        } catch (initErr) {
          console.error("E2EE key generation failed on login:", initErr);
          triggerNotification("Gagal menginisialisasi kunci keamanan E2EE.", "error");
          return;
        }
      } else {
        try {
          privateKey = await decryptPrivateKey(user.encryptedPrivateKey, loginPinPass);
          setUserPrivateKey(privateKey);
          
          // Cache decrypted private key for fast reload
          const privateJwk = await subtle.exportKey("jwk", privateKey);
          localStorage.setItem("bbm_neo_private_key", JSON.stringify(privateJwk));
        } catch (err) {
          console.error("Decryption of private key failed:", err);
          triggerNotification("Gagal mendekripsi kunci lama, membuat kunci baru...", "info");
          
          // Self-heal: generate new keys
          try {
            const keyPair = await generateE2EKeyPair();
            const pubKeyJwk = await exportPublicKey(keyPair.publicKey);
            const encryptedPrivKey = await encryptPrivateKey(keyPair.privateKey, loginPinPass);

            await fetch("/api/user/update-profile", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${data.token}`
              },
              body: JSON.stringify({
                encryptedPrivateKey: encryptedPrivKey,
                publicKey: pubKeyJwk
              })
            });
            
            setUserPrivateKey(keyPair.privateKey);
            const privateJwk = await subtle.exportKey("jwk", keyPair.privateKey);
            localStorage.setItem("bbm_neo_private_key", JSON.stringify(privateJwk));
          } catch(e) {
            console.error("Self heal failed", e);
          }
        }
      }

      setCurrentUser(user);
      setAuthToken(data.token);
      localStorage.setItem("bbm_neo_user", JSON.stringify(user));
      localStorage.setItem("bbm_neo_token", data.token);

      triggerNotification(`Masuk sebagai ${user.name} (${user.pin})`, "success");
    } catch (err) {
      console.error(err);
      triggerNotification("Kesalahan sistem login.", "error");
    }
  };

  // Quick Login for Demo Users
  const handleQuickLogin = async (name: string, email: string, pin: string, pinPass: string, avatar: string) => {
    try {
      const pinPassHash = await hashPin(pinPass);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameOrEmailOrPin: pin,
          pinHash: pinPassHash
        })
      });

      let data = await response.json();
      let privateKey: CryptoKey;

      if (response.ok) {
        // Logged in successfully!
        const user = data.user;
        privateKey = await decryptPrivateKey(user.encryptedPrivateKey, pinPass);
        setUserPrivateKey(privateKey);
        
        const privateJwk = await subtle.exportKey("jwk", privateKey);
        localStorage.setItem("bbm_neo_private_key", JSON.stringify(privateJwk));
        setCurrentUser(user);
        setAuthToken(data.token);
        localStorage.setItem("bbm_neo_user", JSON.stringify(user));
        localStorage.setItem("bbm_neo_token", data.token);
        triggerNotification(`Masuk sebagai ${user.name} (${user.pin})`, "success");
      } else {
        // Not registered yet? Let's register it automatically!
        triggerNotification(`Mempersiapkan akun demo ${name}...`, "info");
        const keyPair = await generateE2EKeyPair();
        const pubKeyJwk = await exportPublicKey(keyPair.publicKey);
        const encryptedPrivKey = await encryptPrivateKey(keyPair.privateKey, pinPass);

        const regResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            pin,
            pinHash: pinPassHash,
            encryptedPrivateKey: encryptedPrivKey,
            publicKey: pubKeyJwk,
            avatar
          })
        });

        const regData = await regResponse.json();
        if (!regResponse.ok) {
          triggerNotification(regData.error || "Gagal membuat akun demo.", "error");
          return;
        }

        setCurrentUser(regData.user);
        setUserPrivateKey(keyPair.privateKey);
        setAuthToken(regData.token);

        localStorage.setItem("bbm_neo_user", JSON.stringify(regData.user));
        localStorage.setItem("bbm_neo_token", regData.token);
        
        const privateJwk = await subtle.exportKey("jwk", keyPair.privateKey);
        localStorage.setItem("bbm_neo_private_key", JSON.stringify(privateJwk));

        triggerNotification(`Selamat datang! Masuk sebagai ${regData.user.name} (${regData.user.pin})`, "success");
      }
    } catch (err) {
      console.error("Quick login failed:", err);
      triggerNotification("Kesalahan sistem login instan.", "error");
    }
  };

  // Account Recovery - Request Code Handler
  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverEmail) {
      triggerNotification("Mohon masukkan email pemulihan terdaftar Anda.", "error");
      return;
    }

    try {
      triggerNotification("Mengirim kode pemulihan...", "info");
      const response = await fetch("/api/auth/request-recovery-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoverEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        triggerNotification(data.error || "Gagal meminta kode pemulihan.", "error");
        return;
      }

      setIncomingCodeSim({ email: data.email, code: data.code });
      setRecoverStep("verify");
      triggerNotification("Kode pemulihan 5-digit telah dikirim ke email terdaftar Anda!", "success");
    } catch (err) {
      console.error(err);
      triggerNotification("Kesalahan koneksi saat meminta kode pemulihan.", "error");
    }
  };

  // Account Recovery Handler
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverEmail || !recoverCode || !recoverNewPin || !recoverNewPinPass) {
      triggerNotification("Mohon lengkapi semua kolom untuk pemulihan akun.", "error");
      return;
    }

    if (recoverNewPin !== recoverNewPinPass) {
      triggerNotification("PIN keamanan baru dan konfirmasi tidak cocok!", "error");
      return;
    }

    if (recoverNewPin.length < 4) {
      triggerNotification("PIN keamanan baru minimal harus 4 karakter!", "error");
      return;
    }

    try {
      triggerNotification("Memverifikasi kode dan meregenerasi kunci keamanan E2EE baru...", "info");
      // Generate standard new RSA pair
      const keyPair = await generateE2EKeyPair();
      const pubKeyJwk = await exportPublicKey(keyPair.publicKey);
      const pinPassHash = await hashPin(recoverNewPinPass);
      const encryptedPrivKey = await encryptPrivateKey(keyPair.privateKey, recoverNewPinPass);

      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoverEmail,
          code: recoverCode,
          newPinHash: pinPassHash,
          newEncryptedPrivateKey: encryptedPrivKey,
          newPublicKey: pubKeyJwk
        })
      });

      const data = await response.json();
      if (!response.ok) {
        triggerNotification(data.error || "Gagal memulihkan akun.", "error");
        return;
      }

      triggerNotification(data.message || "Akun berhasil dipulihkan, silakan masuk dengan PIN baru Anda.", "success");
      setRecoverEmail("");
      setRecoverCode("");
      setRecoverNewPin("");
      setRecoverNewPinPass("");
      setRecoverStep("request");
      setIncomingCodeSim(null);
      setAuthMode("login");
    } catch (err) {
      console.error(err);
      triggerNotification("Gagal memulihkan akun atau menyetel ulang kunci.", "error");
    }
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserPrivateKey(null);
    setAuthToken(null);
    setActiveChatSession(null);
    localStorage.removeItem("bbm_neo_user");
    localStorage.removeItem("bbm_neo_token");
    localStorage.removeItem("bbm_neo_private_key");
    triggerNotification("Keluar dari BBM Neo.", "info");
  };

  // Send Message (Chat / Group / PING! / Sticker)
  const handleSendMessage = async (isPing = false, stickerChar: string | null = null) => {
    if (!currentUser || !activeChatSession) return;

    let encryptedPayload = "";
    
    // Determine content to send
    let plainText = messageText.trim();
    if (isPing) {
      plainText = "PING!!!";
    } else if (stickerChar) {
      plainText = `Mengirim stiker: ${stickerChar}`;
    }

    if (!plainText && !attachedImage && !stickerChar) {
      return;
    }

    try {
      if (activeChatSession.type === "group") {
        // Encrypt with Group Key
        encryptedPayload = await encryptGroupPayload(plainText, activeChatSession.targetId, activeChatSession.name);
      } else {
        // Find peer user
        const peer = allUsers.find(u => u.id === activeChatSession.targetId);
        if (!peer) {
          triggerNotification("Kontak tujuan tidak ditemukan untuk E2EE.", "error");
          return;
        }
        // Encrypt with peer's public key
        encryptedPayload = await encryptMessagePayload(plainText, peer.publicKey);
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatSession.id,
          senderId: currentUser.id,
          senderPin: currentUser.pin,
          senderName: currentUser.name,
          receiverId: activeChatSession.targetId,
          encryptedContent: encryptedPayload,
          image: attachedImage,
          sticker: stickerChar,
          isPing: isPing,
          isGroup: activeChatSession.type === "group"
        })
      });

      const newMsg = await response.json();
      if (!response.ok) {
        triggerNotification(newMsg.error || "Gagal mengirim pesan", "error");
        return;
      }

      // Add to local messages instantly & play notification sound
      setAllMessages(prev => [...prev, newMsg]);
      
      // Decrypt our own locally
      setDecryptedMessages(prev => ({
        ...prev,
        [newMsg.id]: plainText
      }));

      // Sound play locally on sent
      if (isPing) {
        playPingSound();
      }

      // Reset composers
      setMessageText("");
      setAttachedImage(null);
      setShowStickerPanel(false);
    } catch (err) {
      console.error(err);
      triggerNotification("Gagal mengenkripsi atau mengirim pesan.", "error");
    }
  };

  // Image Upload helper (Read as base64 to send smoothly)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerNotification("Ukuran gambar terlalu besar! Maksimal 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
      triggerNotification("Gambar berhasil disematkan. Klik Kirim!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupNameInput.trim()) {
      triggerNotification("Masukkan nama grup!", "error");
      return;
    }

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupNameInput,
          creatorId: currentUser?.id,
          members: [currentUser?.id, ...selectedGroupMembers]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        triggerNotification(data.error || "Gagal membuat grup", "error");
        return;
      }

      setAllGroups(prev => [...prev, data]);
      setShowCreateGroupModal(false);
      setGroupNameInput("");
      setSelectedGroupMembers([]);
      triggerNotification(`Grup "${data.name}" berhasil dibuat!`, "success");
      
      // Auto open group chat
      setActiveChatSession({
        id: data.id,
        type: "group",
        targetId: data.id,
        name: data.name,
        avatar: data.avatar,
        unreadCount: 0
      });
      setActiveTab("chats");
    } catch (err) {
      console.error(err);
      triggerNotification("Kesalahan sistem pembuatan grup", "error");
    }
  };

  // Update Status / Custom Profile
  const handleUpdateProfile = async (field: "status" | "music" | "avatar" | "name", value: any) => {
    if (!currentUser || !authToken) return;

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ [field]: value })
      });

      const updatedUser = await response.json();
      if (!response.ok) {
        triggerNotification(updatedUser.error || "Gagal memperbarui profil", "error");
        return;
      }

      setCurrentUser(updatedUser);
      localStorage.setItem("bbm_neo_user", JSON.stringify(updatedUser));
      triggerNotification("Profil Anda berhasil diperbarui!", "success");

      // Reset inputs
      if (field === "status") setCustomStatus("");
      if (field === "music") {
        setNowPlayingTitle("");
        setNowPlayingArtist("");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Gagal memperbarui data.", "error");
    }
  };

  const triggerEditNameFlow = () => {
    if (!currentUser) return;
    setEditNameCurrent("");
    setEditNameNew("");
    setEditNameConfirm("");
    setShowEditNameModal(true);
  };

  const triggerEditStatusFlow = () => {
    if (!currentUser) return;
    setEditStatusValue(currentUser.status || "");
    setShowEditStatusModal(true);
  };

  // Change PIN (Ganti PIN)
  const handleChangePIN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinValue || !confirmPinPass) {
      triggerNotification("Mohon isi PIN baru dan konfirmasi kata sandi keamanan Anda.", "error");
      return;
    }

    const cleanNewPin = newPinValue.trim().toUpperCase();
    if (cleanNewPin.length !== 8) {
      triggerNotification("PIN BBM harus tepat berjumlah 8 karakter hex!", "error");
      return;
    }

    try {
      // Re-encrypt the private key using new PIN password
      const pinPassHash = await hashPin(confirmPinPass);
      
      if (!userPrivateKey) {
        triggerNotification("Kunci keamanan privat tidak termuat. Hubungi sistem.", "error");
        return;
      }
      
      const encryptedPrivKey = await encryptPrivateKey(userPrivateKey, confirmPinPass);

      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          pin: cleanNewPin,
          pinHash: pinPassHash,
          encryptedPrivateKey: encryptedPrivKey
        })
      });

      const data = await response.json();
      if (!response.ok) {
        triggerNotification(data.error || "Gagal mengganti PIN", "error");
        return;
      }

      setCurrentUser(data);
      localStorage.setItem("bbm_neo_user", JSON.stringify(data));
      setShowChangePinModal(false);
      setNewPinValue("");
      setConfirmPinPass("");
      triggerNotification(`PIN BBM berhasil diganti menjadi ${cleanNewPin}!`, "success");
    } catch (err) {
      console.error(err);
      triggerNotification("Sistem gagal menyetel ulang PIN Anda.", "error");
    }
  };

  // Custom Avatar upload (as base64)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      triggerNotification("Gambar avatar maksimal 1MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleUpdateProfile("avatar", base64);
    };
    reader.readAsDataURL(file);
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    setMuteState(nextMute);
    triggerNotification(nextMute ? "Suara dinonaktifkan" : "Suara diaktifkan", "info");
  };

  // Join a Group (By Invitation/Search click)
  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await response.json();
      if (!response.ok) {
        triggerNotification(data.error || "Gagal bergabung ke grup", "error");
        return;
      }

      // Add or update group list
      setAllGroups(prev => {
        if (prev.some(g => g.id === data.id)) {
          return prev.map(g => g.id === data.id ? data : g);
        }
        return [...prev, data];
      });

      triggerNotification(`Berhasil bergabung ke grup "${data.name}"`, "success");
      
      // Auto open group chat
      setActiveChatSession({
        id: data.id,
        type: "group",
        targetId: data.id,
        name: data.name,
        avatar: data.avatar,
        unreadCount: 0
      });
      setActiveTab("chats");
    } catch (err) {
      console.error(err);
      triggerNotification("Gagal memproses gabung grup.", "error");
    }
  };

  // Build active sessions list based on chats, groups and messages
  const getChatSessions = (): ChatSession[] => {
    if (!currentUser) return [];

    // Find all peer-to-peer chats we have messages for
    const sessionsMap: Record<string, ChatSession> = {};

    // 1. Gather all group sessions that we belong to
    allGroups.forEach(grp => {
      if (grp.members.includes(currentUser.id)) {
        // Get last message in this group
        const groupMsgs = allMessages.filter(m => m.chatId === grp.id);
        const lastMsgObj = groupMsgs[groupMsgs.length - 1];

        sessionsMap[grp.id] = {
          id: grp.id,
          type: "group",
          targetId: grp.id,
          name: grp.name,
          avatar: grp.avatar,
          lastMessage: lastMsgObj ? (decryptedMessages[lastMsgObj.id] || "Mengurai...") : "Grup baru dibuat.",
          lastMessageTime: lastMsgObj ? lastMsgObj.timestamp : grp.createdAt,
          unreadCount: 0
        };
      }
    });

    // 2. Gather all direct peers
    allUsers.forEach(usr => {
      if (usr.id === currentUser.id) return;

      // Check if we have messages
      const chatId = [currentUser.id, usr.id].sort().join("_");
      const peerMsgs = allMessages.filter(m => m.chatId === chatId);
      
      if (peerMsgs.length > 0) {
        const lastMsgObj = peerMsgs[peerMsgs.length - 1];
        sessionsMap[chatId] = {
          id: chatId,
          type: "peer",
          targetId: usr.id,
          name: usr.name,
          avatar: usr.avatar,
          pin: usr.pin,
          lastMessage: lastMsgObj ? (decryptedMessages[lastMsgObj.id] || "Mengurai...") : "",
          lastMessageTime: lastMsgObj ? lastMsgObj.timestamp : Date.now(),
          unreadCount: 0
        };
      }
    });

    // Sort by last message time
    return Object.values(sessionsMap).sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
  };

  const sessions = getChatSessions();

  // Contacts query logic
  const filteredContacts = allUsers.filter(usr => {
    if (!currentUser || usr.id === currentUser.id) return false;
    // Only show if they have been added to contacts
    if (!contactTypes[usr.id]) return false;
    
    const matchStr = `${usr.name} ${usr.pin} ${usr.email}`.toLowerCase();
    return matchStr.includes(searchFilter.toLowerCase());
  });

  const availableUsersToAdd = allUsers.filter(usr => {
    if (!currentUser || usr.id === currentUser.id) return false;
    const matchStr = `${usr.name} ${usr.pin} ${usr.email}`.toLowerCase();
    return matchStr.includes(contactSearchQuery.toLowerCase());
  });

  // Feeds query logic
  const filteredFeeds = allFeeds.filter(feed => {
    const matchStr = `${feed.userName} ${feed.userPin} ${feed.content}`.toLowerCase();
    return matchStr.includes(searchFilter.toLowerCase());
  });

  return (
    <div id="bbm-app-root" className="min-h-screen bg-[#1E252B] flex items-center justify-center p-0 md:p-4 font-sans text-slate-800">
      
      {/* BBM Nostalgic Container matching "High Density" theme strictly */}
      <div className="w-full max-w-[1024px] h-screen md:h-[768px] bg-[#EBEBEB] flex flex-col overflow-hidden text-slate-800 shadow-2xl relative border-0 md:border-4 border-[#0F1418] rounded-none md:rounded-lg">
        
        {/* Startup Splash Screen Overlay (WhatsApp Style) */}
        {showSplash && (
          <div className="absolute inset-0 bg-[#F5F7FA] z-[100] flex flex-col items-center justify-between py-16 px-6 select-none">
            {/* Spacer */}
            <div className="h-4"></div>

            {/* Central elements (Logo, App Name, and Loading Progress) */}
            <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
              {/* WhatsApp-like circular card shadow wrapper for Logo */}
              <div className="w-32 h-32 bg-white rounded-full shadow-md flex items-center justify-center p-4 mb-6 border border-slate-100 relative">
                <BbmLogoSvg className="w-24 h-24 animate-pulse duration-1000" />
              </div>
              
              <h1 className="text-2xl font-black tracking-tight text-slate-800 font-sans uppercase">
                BlackBerry Messenger Neo
              </h1>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest font-sans">
                The Next Generation of Secure BBM
              </p>

              {/* Progress bar container */}
              <div className="w-64 h-[3px] bg-slate-200 rounded-full overflow-hidden mt-8">
                <div 
                  className="bg-[#0074CC] h-full transition-all duration-150 ease-out rounded-full"
                  style={{ width: `${splashProgress}%` }}
                ></div>
              </div>
              
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-3">
                Menghubungkan ke secure server... {splashProgress}%
              </p>
            </div>

            {/* Bottom Brand Secure Status (Matches WhatsApp footer) */}
            <div className="flex flex-col items-center gap-1 text-center mt-auto">
              <div className="flex items-center gap-1.5 text-slate-600 font-bold text-[11px] uppercase tracking-wider font-sans">
                <Lock className="w-4 h-4 text-green-600 shrink-0" />
                <span>Terenkripsi secara end-to-end</span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-wide max-w-xs leading-normal">
                Kunci privat E2EE disimpan secara lokal. Semua percakapan dilindungi dengan enkripsi militer AES & RSA.
              </p>
            </div>
          </div>
        )}

        {/* Top System-Style Bar */}
        <div id="bbm-top-sysbar" className="h-2 bg-[#002D54] w-full flex shrink-0"></div>

        {/* Dynamic global Notification Bar */}
        {notification && (
          <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md shadow-lg flex items-center gap-2 text-xs font-bold transition-all duration-300 ${
            notification.type === "error" ? "bg-red-600 text-white border border-red-500" :
            notification.type === "success" ? "bg-[#0074CC] text-white border border-[#005596]" :
            "bg-slate-800 text-white border border-slate-700"
          }`}>
            <span>🔔</span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* LOGGED OUT: Secure Custom BBM Authenticator (Sign Up, Sign In, Recovery) */}
        {!currentUser ? (
          <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0074CC] to-[#002D54] text-slate-100 overflow-y-auto">
            
            {/* Retro Android/BlackBerry Status Bar */}
            <div className="bg-black/40 text-slate-200 text-[10px] h-6 px-3 flex items-center justify-between font-mono shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span>BBM SECURE SYSTEM</span>
                <span className="text-[8px] bg-blue-500/30 text-blue-100 px-1 rounded border border-white/10">3G/H+</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔋 100%</span>
                <span className="font-bold">20:13</span>
              </div>
            </div>

            {/* BBM Header Banner */}
            <div className="bg-[#005596]/80 backdrop-blur h-12 px-4 flex items-center justify-between border-b border-black/10 shadow-sm shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                {/* BBM Square Icon recreation */}
                <div className="w-7 h-7 bg-[#212328] rounded flex items-center justify-center border border-white/20 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 bg-gradient-to-b from-[#343A42] to-[#1E2226] rounded-sm flex items-center justify-center">
                    {/* Tiny dots inside logo */}
                    <div className="grid grid-cols-3 gap-0.5 scale-75">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <span className="text-lg font-black tracking-tighter text-white font-sans uppercase shadow-black/50 drop-shadow-sm">BBM</span>
              </div>
            </div>

            {incomingCodeSim && (
              <div className="mx-6 mt-4 p-4 bg-slate-900 border-2 border-[#00A2FF] rounded-lg shadow-2xl text-xs space-y-2 text-slate-200 animate-in slide-in-from-top duration-300 relative z-40">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#00A2FF]">
                    <span className="w-2 h-2 rounded-full bg-[#00A2FF] animate-ping"></span>
                    <span>📩 KOTAK MASUK SIMULASI (MOCK EMAIL INBOX)</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIncomingCodeSim(null)}
                    className="text-slate-400 hover:text-white text-[10px] uppercase font-bold"
                  >
                    Tutup
                  </button>
                </div>
                <div className="space-y-1 text-[11px] font-sans">
                  <p><span className="text-slate-400 font-semibold">Dari:</span> secure-center@blackberry.com</p>
                  <p><span className="text-slate-400 font-semibold">Kepada:</span> {incomingCodeSim.email}</p>
                  <p><span className="text-slate-400 font-semibold">Subjek:</span> Kode Pemulihan BlackBerry ID BBM Neo</p>
                  <div className="mt-2 p-3 bg-black/40 border border-white/5 rounded text-slate-200">
                    <p className="mb-1.5 text-slate-300 font-semibold">Halo Pengguna BBM Neo,</p>
                    <p className="mb-2 text-slate-300 leading-normal">Kami mendeteksi permintaan pengaturan ulang PIN keamanan untuk akun Anda. Silakan gunakan kode verifikasi 5-digit di bawah ini:</p>
                    <div className="flex justify-center my-3">
                      <span className="text-3xl font-black tracking-widest text-[#00A2FF] bg-[#00A2FF]/10 px-6 py-2.5 rounded-md border border-[#00A2FF]/30 select-all font-mono">
                        {incomingCodeSim.code}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic text-center">Kode ini berlaku selama 10 menit. Mohon tidak memberikan kode ini kepada siapa pun.</p>
                  </div>
                </div>
              </div>
            )}

            {/* WELCOME LANDING SCREEN (Matches screenshot exactly!) */}
            {authMode === "welcome" && (
              <div className="flex-1 flex flex-col items-center justify-between p-6 text-center select-none">
                
                {/* Welcome title */}
                <div className="mt-4">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
                    Welcome to BBM
                  </h1>
                </div>

                {/* Iconic SVG speech bubble logo centered */}
                <div className="my-4 flex items-center justify-center">
                  <BbmLogoSvg className="w-48 h-48 transition-transform hover:scale-105 duration-300" />
                </div>

                {/* BlackBerry ID instruction text */}
                <div className="max-w-md space-y-1 mb-6">
                  <p className="text-[15px] font-medium text-white drop-shadow-sm">
                    Sign in to BBM with your BlackBerry ID.
                  </p>
                  <p className="text-[13px] text-blue-100 drop-shadow-sm">
                    If you don't have a BlackBerry ID, you can create one now.
                  </p>
                  <button 
                    onClick={() => setShowBbidLearnMore(true)}
                    className="text-xs text-white hover:text-blue-200 underline font-semibold focus:outline-none block mx-auto mt-3 drop-shadow-sm"
                  >
                    Learn more about BlackBerry ID
                  </button>
                </div>

                {/* Sticky Action Buttons at Bottom */}
                <div className="w-full max-w-sm space-y-3 mt-auto">
                  
                  {/* Sign In Button */}
                  <button
                    onClick={() => setAuthMode("login")}
                    className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-900 border border-white rounded font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-slate-500" />
                    Sign In
                  </button>

                  {/* Create BlackBerry ID Button */}
                  <button
                    onClick={() => {
                      setAuthMode("register");
                      if (!regPin) generateRandomPin();
                    }}
                    className="w-full py-3.5 bg-transparent hover:bg-white/10 text-white border-2 border-white rounded font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    Create a BlackBerry ID
                  </button>
                  
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="text-[10px] text-white/50 hover:text-white/80 underline decoration-white/30 transition-colors uppercase tracking-widest"
                    >
                      Reset Data & Mulai Dari Nol
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* SIGN IN CREDENTIALS INPUT PANEL */}
            {authMode === "login" && (
              <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="text-center mb-2">
                    <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                      <Lock className="text-[#00A2FF] w-5 h-5" /> Sign In BlackBerry ID
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">Masukkan kredensial akun BBM Anda untuk memulihkan kunci enkripsi lokal</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Masukkan Nama / Email / PIN BBM</label>
                    <input 
                      type="text" 
                      value={loginCredential}
                      onChange={e => setLoginCredential(e.target.value)}
                      placeholder="Email, Nama atau PIN Anda"
                      className="mt-1 w-full px-3 py-2.5 bg-black/30 border border-white/20 rounded-md text-sm text-white focus:outline-none focus:border-[#0074CC]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Sandi PIN Keamanan</label>
                    <input 
                      type="password" 
                      value={loginPinPass}
                      onChange={e => setLoginPinPass(e.target.value)}
                      placeholder="Masukkan sandi PIN pengaman Anda"
                      className="mt-1 w-full px-3 py-2.5 bg-black/30 border border-white/20 rounded-md text-sm text-white focus:outline-none focus:border-[#0074CC]"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Status Enkripsi:</span>
                    <span className="font-bold text-emerald-400 uppercase tracking-wider">🔒 E2EE AKTIF (AES)</span>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setRecoverEmail(loginCredential.includes("@") ? loginCredential : "");
                        setAuthMode("recover");
                      }}
                      className="text-xs text-[#00A2FF] hover:text-blue-300 font-semibold transition-colors duration-200 uppercase tracking-wide underline cursor-pointer"
                    >
                      Lupa PIN Keamanan? Pulihkan Akun
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button 
                      type="submit" 
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-[#0074CC] hover:from-blue-700 hover:to-[#005596] text-white font-extrabold text-xs uppercase tracking-widest rounded-md shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-blue-200" />
                      MASUK AKUN (SIGN IN)
                    </button>

                    <button 
                      type="button"
                      onClick={() => setAuthMode("welcome")}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-md transition-colors"
                    >
                      ← KEMBALI KE MENU UTAMA
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CREATE BLACKBERRY ID (REGISTER) FORM */}
            {authMode === "register" && (
              <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full font-sans">
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="text-center mb-1">
                    <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                      <Sparkles className="text-[#00A2FF] w-5 h-5" /> Buat BlackBerry ID Baru
                    </h2>
                    <p className="text-[11px] text-slate-300 mt-0.5">Buat identitas BBM dan kunci privat E2EE personal Anda secara instan</p>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Alamat Email Terdaftar (Pemulihan)</label>
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="contoh@domain.com"
                      className="mt-1 w-full px-3 py-1.5 bg-black/30 border border-white/20 rounded-md text-xs text-white focus:outline-none focus:border-[#0074CC]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Nama Lengkap / Tampilan</label>
                    <input 
                      type="text" 
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Nama Anda"
                      className="mt-1 w-full px-3 py-1.5 bg-black/30 border border-white/20 rounded-md text-xs text-white focus:outline-none focus:border-[#0074CC]"
                      required
                    />
                  </div>

                  {/* Generated PIN Section */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">PIN BBM Neo Eksklusif Anda</label>
                      <button 
                        type="button" 
                        onClick={generateRandomPin}
                        className="text-[10px] font-bold text-[#00A2FF] hover:underline"
                      >
                        Ganti Acak PIN
                      </button>
                    </div>
                    <div className="mt-1 bg-black/40 px-3 py-1.5 rounded-md font-mono text-sm font-bold tracking-widest text-[#00E5FF] border border-white/10 text-center">
                      {regPin}
                    </div>
                  </div>

                  {/* PIN Keamanan (PIN Password) */}
                  <div>
                    <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Sandi Kunci PIN Keamanan (Password)</label>
                    <input 
                      type="password" 
                      value={regPinPass}
                      onChange={e => setRegPinPass(e.target.value)}
                      placeholder="Minimal 4 Karakter (Sandi Pengaman)"
                      className="mt-1 w-full px-3 py-1.5 bg-black/30 border border-amber-500/30 rounded-md text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  {/* Choose Square Avatar */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Pilih Foto Profil (Kotak Autentik)</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRegAvatar(url)}
                          className={`aspect-square w-full bg-slate-800 border-2 overflow-hidden ${regAvatar === url ? "border-[#00A2FF] scale-105 shadow-[0_0_8px_#00A2FF]" : "border-transparent opacity-70"}`}
                        >
                          <img src={url} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Atau Unggah Foto Sendiri:</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              if (typeof e.target?.result === 'string') {
                                setRegAvatar(e.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-black/20 rounded p-1 border border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <button 
                      type="submit" 
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-[#0074CC] hover:from-blue-700 hover:to-[#005596] text-white font-extrabold text-xs uppercase tracking-widest rounded-md shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      DAFTAR SEKARANG (SIGN UP)
                    </button>

                    <button 
                      type="button"
                      onClick={() => setAuthMode("welcome")}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-md transition-colors"
                    >
                      ← KEMBALI KE MENU UTAMA
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ACCOUNT RECOVERY FORM */}
            {authMode === "recover" && (
              <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
                {recoverStep === "request" ? (
                  <form onSubmit={handleRequestRecoveryCode} className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <HelpCircle className="text-[#00A2FF] w-5 h-5" /> Pemulihan Akun via Email
                    </h2>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Masukkan email BlackBerry ID Anda yang terdaftar. Kami akan mengirimkan kode keamanan 5-digit untuk memverifikasi kepemilikan Anda sebelum mengatur ulang PIN keamanan.
                    </p>

                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Alamat Email Terdaftar</label>
                      <input 
                        type="email" 
                        value={recoverEmail}
                        onChange={e => setRecoverEmail(e.target.value)}
                        placeholder="contoh@domain.com atau dummy@gmail.com"
                        className="mt-1 w-full px-3 py-2 bg-black/30 border border-white/20 rounded-md text-sm text-white focus:outline-none focus:border-[#0074CC]"
                        required
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <button 
                        type="submit" 
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-[#0074CC] hover:from-blue-700 hover:to-[#005596] text-white font-extrabold text-xs uppercase tracking-widest rounded-md shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        Kirim Kode Pemulihan 5-Digit
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          setAuthMode("welcome");
                        }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-md transition-colors"
                      >
                        ← KEMBALI KE MENU UTAMA
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRecover} className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Lock className="text-[#00A2FF] w-5 h-5" /> Verifikasi Kode Keamanan
                    </h2>

                    <div className="bg-[#0074CC]/10 border border-[#0074CC]/30 rounded p-3 space-y-1">
                      <p className="text-[11px] text-slate-300">
                        Kode pemulihan telah dikirimkan ke email Anda:
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{recoverEmail}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRecoverStep("request");
                            setIncomingCodeSim(null);
                          }}
                          className="text-[10px] text-[#00A2FF] hover:underline uppercase font-bold"
                        >
                          Ubah Email
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Kode Verifikasi 5-Digit</label>
                      <input 
                        type="text" 
                        maxLength={5}
                        value={recoverCode}
                        onChange={e => setRecoverCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="Masukkan 5 digit kode"
                        className="mt-1 w-full px-3 py-2 bg-black/30 border border-white/20 rounded-md text-sm text-center font-bold tracking-[0.5em] text-[#00A2FF] focus:outline-none focus:border-[#0074CC]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Buat PIN Keamanan Baru</label>
                      <input 
                        type="password" 
                        value={recoverNewPin}
                        onChange={e => setRecoverNewPin(e.target.value)}
                        placeholder="PIN Keamanan Baru (min. 4 Karakter)"
                        className="mt-1 w-full px-3 py-2 bg-black/30 border border-white/20 rounded-md text-sm text-white focus:outline-none focus:border-[#0074CC]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Konfirmasi PIN Keamanan Baru</label>
                      <input 
                        type="password" 
                        value={recoverNewPinPass}
                        onChange={e => setRecoverNewPinPass(e.target.value)}
                        placeholder="Ulangi PIN Keamanan Baru"
                        className="mt-1 w-full px-3 py-2 bg-black/30 border border-white/20 rounded-md text-sm text-white focus:outline-none focus:border-[#0074CC]"
                        required
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <button 
                        type="submit" 
                        className="w-full py-3 bg-[#D32F2F] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-md shadow-lg transition-transform active:scale-[0.98]"
                      >
                        Verifikasi & Atur Ulang PIN
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          setRecoverStep("request");
                          setIncomingCodeSim(null);
                        }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-md transition-colors"
                      >
                        ← KEMBALI
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* BLACKBERRY ID INFORMATION DIALOG (MODAL) */}
            {showBbidLearnMore && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
                <div className="bg-[#1A232F] border-2 border-[#00A2FF] rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                    <HelpCircle className="text-[#00A2FF] w-6 h-6" />
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wide">BlackBerry ID & Security</h3>
                  </div>
                  <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed overflow-y-auto max-h-[300px] pr-1">
                    <p>
                      <strong>BlackBerry ID (BBID)</strong> adalah akun global terpadu Anda untuk mengakses layanan BBM secara aman. Di BBM Neo, BBID Anda terhubung langsung dengan sistem kriptografi ujung-ke-ujung (E2EE) berteknologi tinggi.
                    </p>
                    <p>
                      <strong>Sistem Enkripsi Lanjutan:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Kunci publik dan privat dibentuk langsung di perangkat Anda secara asimetris (RSA-OAEP 2048-bit).</li>
                      <li>Kunci privat dienkripsi secara lokal menggunakan sandi PIN Anda menggunakan penguatan algoritma PBKDF2 sebelum diunggah ke cloud (Zero-Knowledge Architecture).</li>
                      <li>Ini memastikan tidak ada pihak lain, termasuk administrator server, yang dapat membaca percakapan, gambar, stiker, maupun PING! Anda.</li>
                    </ul>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowBbidLearnMore(false)}
                    className="w-full py-2.5 bg-[#007AC9] hover:bg-[#005F9E] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                  >
                    Tutup Informasi
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          
          /* LOGGED IN APP LAYOUT */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Main BBM Header */}
            <div id="bbm-main-header" className="h-28 bg-gradient-to-b from-[#005596] to-[#004175] flex items-center px-4 border-b border-[#002D54] shadow-md shrink-0 text-white relative">
              
              {/* Custom Square Avatar */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 bg-white border-2 border-white shadow-sm overflow-hidden flex items-center justify-center relative">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer transition-opacity">
                    Ubah Foto
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                      ref={avatarInputRef}
                    />
                  </label>
                </div>
                {/* Active Indicator status light */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* User Bio and Status details */}
              <div className="ml-4 flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate max-w-[150px] md:max-w-xs">{currentUser.name}</h1>
                  
                  {/* Dynamic Action Controls on Header */}
                  <div className="flex items-center gap-2">
                    <div className="bg-[#002D54] px-2.5 py-1 text-xs text-white font-mono rounded border border-[#0074CC] font-bold uppercase tracking-wide">
                      PIN: {currentUser.pin}
                    </div>
                  </div>
                </div>

                {/* Status custom bar */}
                <div className="mt-1 text-blue-100 flex items-center gap-1.5 overflow-hidden">
                  <span className="italic opacity-90 truncate text-xs md:text-sm">
                    "{currentUser.status || "Baru menggunakan BBM Neo"}"
                  </span>
                  <button 
                    onClick={triggerEditStatusFlow}
                    className="text-[10px] bg-black/20 hover:bg-black/40 px-1.5 py-0.5 rounded shrink-0 cursor-pointer text-white border border-white/10"
                  >
                    Edit
                  </button>
                </div>

                {/* Music "Sedang Mendengarkan" Simulation */}
                <div className="mt-1.5 flex items-center gap-2 overflow-hidden">
                  <div className="flex items-center text-[10px] text-blue-200 uppercase tracking-wider font-bold">
                    <span className="animate-pulse w-2 h-2 rounded-full bg-blue-300 mr-2 shadow-[0_0_5px_#fff]"></span>
                    E2EE SECURE
                  </div>

                  {currentUser.music ? (
                    <div className="flex items-center gap-1 text-[11px] bg-black/30 px-2 py-0.5 rounded text-yellow-300 overflow-hidden max-w-[200px] md:max-w-xs">
                      <Radio className="w-3 h-3 text-yellow-400 shrink-0" />
                      <span className="truncate italic">Sedang Mendengarkan: {currentUser.music.title} - {currentUser.music.artist}</span>
                      <button 
                        onClick={() => handleUpdateProfile("music", null)}
                        className="text-white hover:text-red-400 text-[9px] font-bold ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        const title = prompt("Masukkan Judul Lagu:");
                        const artist = prompt("Masukkan Nama Penyanyi:");
                        if (title && artist) {
                          handleUpdateProfile("music", { title, artist });
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] bg-blue-900/40 hover:bg-blue-900/80 px-2 py-0.5 rounded text-blue-200"
                    >
                      🎵 Pasang Musik Sekarang
                    </button>
                  )}
                </div>

              </div>

              {/* Mute Synthesizer audio button on Top Header */}
              <button 
                onClick={toggleMute}
                title={isAudioMuted ? "Unmute Sound" : "Mute Sound"}
                className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 rounded border border-white/10 text-white shrink-0"
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Navigation Tabs (Classic BBM Icons) */}
            <div className="flex bg-[#F2F2F2] border-b border-slate-300 shadow-inner shrink-0">
              <button 
                onClick={() => { setActiveTab("chats"); setActiveChatSession(null); }}
                className={`flex-1 py-2 border-b-4 flex flex-col items-center cursor-pointer transition-colors ${activeTab === "chats" ? "border-[#005596] bg-white text-[#005596]" : "border-transparent text-slate-500 hover:bg-slate-50"}`}
              >
                <MessageSquare className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Chats</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab("contacts"); setActiveChatSession(null); }}
                className={`flex-1 py-2 border-b-4 flex flex-col items-center cursor-pointer transition-colors ${activeTab === "contacts" ? "border-[#005596] bg-white text-[#005596]" : "border-transparent text-slate-500 hover:bg-slate-50"}`}
              >
                <Users className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Contacts</span>
              </button>

              <button 
                onClick={() => { setActiveTab("groups"); setActiveChatSession(null); }}
                className={`flex-1 py-2 border-b-4 flex flex-col items-center cursor-pointer transition-colors ${activeTab === "groups" ? "border-[#005596] bg-white text-[#005596]" : "border-transparent text-slate-500 hover:bg-slate-50"}`}
              >
                <Users className="w-5 h-5 text-green-700 mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Groups</span>
              </button>

              <button 
                onClick={() => { setActiveTab("updates"); setActiveChatSession(null); }}
                className={`flex-1 py-2 border-b-4 flex flex-col items-center cursor-pointer transition-colors ${activeTab === "updates" ? "border-[#005596] bg-white text-[#005596]" : "border-transparent text-slate-500 hover:bg-slate-50"}`}
              >
                <Rss className="w-5 h-5 text-orange-600 mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Updates</span>
              </button>

              <button 
                onClick={() => { setActiveTab("settings"); setActiveChatSession(null); }}
                className={`flex-1 py-2 border-b-4 flex flex-col items-center cursor-pointer transition-colors ${activeTab === "settings" ? "border-[#005596] bg-white text-[#005596]" : "border-transparent text-slate-500 hover:bg-slate-50"}`}
              >
                <SettingsIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
              </button>
            </div>

            {/* Layout Main Grid Area */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Sidebar: Session List (always visible on desktop screen, switchable view on active mobile mode) */}
              <div className={`w-full md:w-1/3 border-r border-slate-300 bg-white flex flex-col z-10 ${activeChatSession ? "hidden md:flex" : "flex"}`}>
                
                {/* Search query box on list */}
                <div className="p-3 bg-[#E8EFF5] border-b border-slate-200 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Cari chat atau kontak..." 
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005596]"
                    />
                  </div>
                  {activeTab === "groups" && (
                    <button 
                      onClick={() => setShowCreateGroupModal(true)}
                      className="bg-[#005596] hover:bg-[#004175] text-white p-2 rounded text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Grup
                    </button>
                  )}
                  {activeTab === "contacts" && (
                    <button 
                      onClick={() => setShowAddContactModal(true)}
                      className="bg-[#005596] hover:bg-[#004175] text-white p-2 rounded text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Kontak
                    </button>
                  )}
                </div>

                {/* Main dynamic list based on navigation */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  
                  {/* TAB 1: CHATS LIST */}
                  {activeTab === "chats" && (
                    <>
                      {sessions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          Belum ada obrolan aktif.<br />Kirim pesan ke kontak Anda untuk memulai percakapan E2EE.
                        </div>
                      ) : (
                        sessions
                          .filter(s => s.name.toLowerCase().includes(searchFilter.toLowerCase()))
                          .map(sess => {
                            const isActive = activeChatSession?.id === sess.id;
                            const isPing = sess.lastMessage?.includes("PING!!!");
                            return (
                              <button
                                key={sess.id}
                                onClick={() => setActiveChatSession(sess)}
                                className={`w-full text-left flex items-center p-3 transition-colors ${isActive ? "bg-blue-50 border-l-4 border-[#005596]" : "hover:bg-slate-50"}`}
                              >
                                <div className="w-12 h-12 bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                                  <img src={sess.avatar} alt={sess.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-3 flex-1 overflow-hidden">
                                  <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-sm text-slate-800 truncate">{sess.name}</span>
                                    {sess.lastMessageTime && (
                                      <span className="text-[9px] text-slate-400 font-mono">
                                        {new Date(sess.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <div className="text-xs truncate flex-1 text-slate-500">
                                      {sess.type === "peer" && (
                                        <span className="font-mono text-[10px] text-blue-600 bg-blue-100 px-1 rounded mr-1">
                                          {sess.pin}
                                        </span>
                                      )}
                                      {isPing ? (
                                        <span className="text-red-600 font-bold italic animate-pulse">PING!!!</span>
                                      ) : (
                                        <span>{sess.lastMessage}</span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase ml-1 shrink-0 font-mono">E2EE</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                      )}
                    </>
                  )}

                  {/* TAB 2: CONTACTS LIST */}
                  {activeTab === "contacts" && (
                    <div className="flex flex-col h-full bg-slate-50">
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
                        <div className="p-2 bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200">
                          Daftar Kontak ({filteredContacts.length})
                        </div>
                        {filteredContacts.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            Tidak ada kontak ditemukan.
                          </div>
                        ) : (
                          filteredContacts.map(usr => {
                            const cType = contactTypes[usr.id];
                            let tagColor = "text-slate-600 bg-slate-100";
                            let tagLabel = "Global";
                            if (cType === 'google') {
                              tagColor = "text-green-700 bg-green-100 border border-green-200";
                              tagLabel = "Akun Google";
                            } else if (cType === 'phone') {
                              tagColor = "text-blue-700 bg-blue-100 border border-blue-200";
                              tagLabel = "Telepon Pintar";
                            }
                            return (
                              <button
                                key={usr.id}
                                onClick={() => {
                                  const chatId = [currentUser.id, usr.id].sort().join("_");
                                  setActiveChatSession({
                                    id: chatId,
                                    type: "peer",
                                    targetId: usr.id,
                                    name: usr.name,
                                    avatar: usr.avatar,
                                    pin: usr.pin,
                                    unreadCount: 0
                                  });
                                  setActiveTab("chats");
                                }}
                                className="w-full text-left flex items-center p-3 hover:bg-slate-50 transition-colors"
                              >
                                <div className="w-12 h-12 bg-slate-200 border border-slate-300 overflow-hidden shrink-0 relative">
                                  <img src={usr.avatar} alt={usr.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-3 flex-1 overflow-hidden">
                                  <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-sm text-slate-800 truncate flex items-center gap-1.5">
                                      {usr.name}
                                    </span>
                                    <span className="font-mono text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">
                                      {usr.pin}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 truncate italic mt-0.5">
                                    "{usr.status || "Aktif menggunakan BBM Neo"}"
                                  </p>
                                  {usr.music && (
                                    <p className="text-[10px] text-yellow-600 font-medium truncate flex items-center gap-1 mt-0.5">
                                      <span>🎵</span> {usr.music.title} - {usr.music.artist}
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: GROUPS LIST */}
                  {activeTab === "groups" && (
                    <>
                      {allGroups.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          Belum ada grup terdaftar. Buat atau cari grup baru!
                        </div>
                      ) : (
                        allGroups
                          .filter(g => g.name.toLowerCase().includes(searchFilter.toLowerCase()))
                          .map(grp => {
                            const isMember = grp.members.includes(currentUser.id);
                            return (
                              <div
                                key={grp.id}
                                className="w-full flex items-center p-3 hover:bg-slate-50 transition-colors justify-between"
                              >
                                <div className="flex items-center overflow-hidden flex-1 mr-2">
                                  <div className="w-12 h-12 bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                                    <img src={grp.avatar} alt={grp.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="ml-3 flex-1 overflow-hidden">
                                    <span className="font-bold text-sm text-slate-800 block truncate">{grp.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {grp.members.length} Anggota · ID: {grp.id}
                                    </span>
                                  </div>
                                </div>
                                {isMember ? (
                                  <button
                                    onClick={() => {
                                      setActiveChatSession({
                                        id: grp.id,
                                        type: "group",
                                        targetId: grp.id,
                                        name: grp.name,
                                        avatar: grp.avatar,
                                        unreadCount: 0
                                      });
                                      setActiveTab("chats");
                                    }}
                                    className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase rounded"
                                  >
                                    Buka Chat
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleJoinGroup(grp.id)}
                                    className="px-2.5 py-1 bg-[#005596] hover:bg-[#004175] text-white font-bold text-[10px] uppercase rounded"
                                  >
                                    Gabung
                                  </button>
                                )}
                              </div>
                            );
                          })
                      )}
                    </>
                  )}

                  {/* TAB 4: UPDATES / FEEDS */}
                  {activeTab === "updates" && (
                    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0074CC] to-[#002D54] text-slate-100 overflow-y-auto relative p-4">
                      {/* Background Logo Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <BbmLogoSvg className="w-96 h-96" />
                      </div>

                      <div className="relative z-10 mb-4 bg-black/20 p-3 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm flex items-center justify-between">
                        <div>
                          <p className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                            <span>📡</span> NEO WORKSPACE
                          </p>
                          <p className="text-[10px] mt-0.5 text-blue-200">Siaran Pembaruan Aktivitas Jaringan Global</p>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#005596] border border-blue-400/30 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        </div>
                      </div>
                      
                      <div className="relative z-10 space-y-3">
                        {filteredFeeds.length === 0 ? (
                          <div className="p-8 text-center text-blue-200/50 text-xs border border-white/10 rounded-lg bg-black/10 backdrop-blur-sm">
                            Menunggu sinyal pembaruan status baru dari jaringan...
                          </div>
                        ) : (
                          filteredFeeds.map(feed => (
                            <div key={feed.id} className="p-3 bg-white/10 border border-white/20 rounded-lg shadow-sm backdrop-blur-md space-y-1 hover:bg-white/15 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded overflow-hidden border-2 border-white/30 shrink-0">
                                  <img src={feed.userAvatar} alt={feed.userName} className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden flex-1">
                                  <div className="flex items-baseline justify-between">
                                    <span className="font-bold text-sm text-white block truncate">{feed.userName}</span>
                                    <span className="text-[9px] text-blue-200 shrink-0 font-mono bg-black/30 px-1.5 py-0.5 rounded">
                                      {new Date(feed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-blue-300 font-mono block mt-0.5">{feed.userPin}</span>
                                </div>
                              </div>
                              
                              <div className="text-sm text-slate-100 pl-12">
                                {feed.type === 'music' ? (
                                  <div className="flex items-center gap-2 text-yellow-300 bg-black/20 px-2.5 py-1.5 rounded-md border border-white/10 font-medium text-xs mt-1">
                                    <span className="animate-pulse">🎵</span>
                                    <span className="italic">Mendengarkan: {feed.content}</span>
                                  </div>
                                ) : feed.type === 'avatar_change' ? (
                                  <span className="text-blue-100 font-medium text-xs block py-1 mt-1 flex items-center gap-1.5">
                                    <span>🖼️</span> Mengganti foto profil barunya yang ikonik.
                                  </span>
                                ) : (
                                  <p className="font-medium mt-1 p-2 bg-black/20 rounded-md border border-white/5 border-l-2 border-l-blue-400">"{feed.content}"</p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: SETTINGS */}
                  {activeTab === "settings" && (
                    <div className="p-4 space-y-4 bg-slate-100 min-h-full overflow-y-auto font-sans text-slate-800">
                      
                      {/* Section Title */}
                      <div className="border-b border-slate-300 pb-1 shrink-0 select-none">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">Setelan BBM (BBM Settings)</h2>
                      </div>

                      {/* 1. IDENTITY & PROFILE */}
                      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-3.5 bg-gradient-to-r from-[#005596] to-[#003B6D] text-white flex items-center gap-3">
                          <div className="w-14 h-14 bg-slate-200 border-2 border-white overflow-hidden shrink-0 relative group">
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="overflow-hidden flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-sm truncate">{currentUser.name}</h3>
                              <button 
                                onClick={triggerEditNameFlow}
                                className="text-[9px] text-blue-200 hover:text-white underline cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                            <p className="text-[10px] text-blue-100 font-mono">PIN: {currentUser.pin}</p>
                            <p className="text-[9px] text-slate-200 truncate">{currentUser.email}</p>
                          </div>
                          <label className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors cursor-pointer relative overflow-hidden">
                            Ubah Foto
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (typeof ev.target?.result === 'string') {
                                      handleUpdateProfile("avatar", ev.target.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                        
                        <div className="p-3.5 space-y-3 text-xs text-slate-700">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ganti Status BBM</span>
                            <div className="flex items-center justify-between mt-1 gap-2">
                              <p className="italic font-medium text-slate-800 truncate">
                                "{currentUser.status || "Aktif menggunakan BBM Neo"}"
                              </p>
                              <button
                                type="button"
                                onClick={triggerEditStatusFlow}
                                className="text-blue-600 hover:underline font-bold text-[10px] shrink-0"
                              >
                                Edit Status
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. SECURITY & BBID CREDENTIALS */}
                      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-3 space-y-2.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Akun & BlackBerry ID</h4>
                        
                        <div className="flex items-center justify-between text-xs text-slate-700 py-1">
                          <div>
                            <p className="font-semibold text-slate-800">PIN Keamanan Autentik</p>
                            <p className="text-[10px] text-slate-500">Ganti PIN 8-digit hex kustom Anda sendiri</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setNewPinValue(currentUser.pin);
                              setShowChangePinModal(true);
                            }}
                            className="px-3 py-1.5 bg-[#E8EFF5] hover:bg-blue-100 text-[#005596] font-bold text-[10px] uppercase rounded transition-all"
                          >
                            Ganti PIN
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-700 py-1 border-t border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">Ganti Nama Akun BBM</p>
                            <p className="text-[10px] text-slate-500">Edit nama panggilan global Anda</p>
                          </div>
                          <button 
                            type="button"
                            onClick={triggerEditNameFlow}
                            className="px-3 py-1.5 bg-[#E8EFF5] hover:bg-blue-100 text-[#005596] font-bold text-[10px] uppercase rounded transition-all"
                          >
                            Edit Nama
                          </button>
                        </div>
                      </div>

                      {/* 3. PRIVACY SETTINGS (SETELAN PRIVASI) */}
                      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-3.5 space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Setelan Privasi</h4>
                        
                        {/* Music status check */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
                          <input 
                            type="checkbox" 
                            checked={settingShowMusic}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingShowMusic(val);
                              localStorage.setItem("bbm_set_show_music", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">Tampilkan Status "Sedang Mendengarkan"</span>
                            <span className="text-[10px] text-slate-500 block">Bagikan info lagu pemutar musik Anda ke pembaruan feeds</span>
                          </div>
                        </label>

                        {/* Timezone status check */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none border-t border-slate-100 pt-2.5">
                          <input 
                            type="checkbox" 
                            checked={settingShowTimezone}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingShowTimezone(val);
                              localStorage.setItem("bbm_set_show_timezone", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">Izinkan Kontak Melihat Zona Waktu & Lokasi</span>
                            <span className="text-[10px] text-slate-500 block">Menampilkan indikator GMT & waktu lokal di info kontak</span>
                          </div>
                        </label>

                        {/* High Encrypt E2E */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none border-t border-slate-100 pt-2.5">
                          <input 
                            type="checkbox" 
                            checked={settingHighE2E}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingHighE2E(val);
                              localStorage.setItem("bbm_set_high_e2e", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                              Enkripsi E2EE Tingkat Tinggi (RSA/AES-GCM) 
                              <span className="text-[8px] bg-emerald-500 text-white px-1 rounded">PRO</span>
                            </span>
                            <span className="text-[10px] text-slate-500 block">Gunakan pengamanan kunci asimetris tingkat ganda di obrolan</span>
                          </div>
                        </label>

                        {/* Delivery and Read receipts */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none border-t border-slate-100 pt-2.5">
                          <input 
                            type="checkbox" 
                            checked={settingShowReceipts}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingShowReceipts(val);
                              localStorage.setItem("bbm_set_show_receipts", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">Kirim Laporan Tanda Terima Pesan (D & R)</span>
                            <span className="text-[10px] text-slate-500 block">Ijinkan orang lain melihat status pesan 'Delivered' (D) dan 'Read' (R)</span>
                          </div>
                        </label>

                        {/* Auto Accept Contacts */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none border-t border-slate-100 pt-2.5">
                          <input 
                            type="checkbox" 
                            checked={settingAutoAccept}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingAutoAccept(val);
                              localStorage.setItem("bbm_set_auto_accept", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">Terima Kontak Otomatis Tanpa Konfirmasi</span>
                            <span className="text-[10px] text-slate-500 block">Seketika menjadi teman jika ada yang menyaring PIN Anda</span>
                          </div>
                        </label>
                      </div>

                      {/* 4. CHAT & NOTIFICATIONS SETTINGS */}
                      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-3.5 space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Obrolan & Notifikasi</h4>
                        
                        {/* Enter to Send */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
                          <input 
                            type="checkbox" 
                            checked={settingEnterToSend}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingEnterToSend(val);
                              localStorage.setItem("bbm_set_enter_send", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">Kirim Pesan dengan Tombol "Enter"</span>
                            <span className="text-[10px] text-slate-500 block">Menekan tombol Enter pada keyboard fisik/layar akan langsung mengirim pesan</span>
                          </div>
                        </label>

                        {/* Save Chat History */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none border-t border-slate-100 pt-2.5">
                          <input 
                            type="checkbox" 
                            checked={settingSaveHistory}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingSaveHistory(val);
                              localStorage.setItem("bbm_set_save_history", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">Simpan Riwayat Obrolan di Perangkat</span>
                            <span className="text-[10px] text-slate-500 block">Simpan log pesan lokal di cache penyimpanan terenkripsi</span>
                          </div>
                        </label>

                        {/* BBM Tone */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none border-t border-slate-100 pt-2.5">
                          <input 
                            type="checkbox" 
                            checked={settingBbmTone}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingBbmTone(val);
                              localStorage.setItem("bbm_set_bbm_tone", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                              Nada Notifikasi Khas BBM (Tone "BBM")
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            </span>
                            <span className="text-[10px] text-slate-500 block">Bunyikan suara klakson/notifikasi klasik BBM saat ada chat masuk</span>
                          </div>
                        </label>

                        {/* Vibrate */}
                        <label className="flex items-start gap-3 cursor-pointer text-xs select-none border-t border-slate-100 pt-2.5">
                          <input 
                            type="checkbox" 
                            checked={settingVibrate}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setSettingVibrate(val);
                              localStorage.setItem("bbm_set_vibrate", String(val));
                            }}
                            className="mt-0.5 accent-[#005596] w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">Getar Saat Menerima Pesan</span>
                            <span className="text-[10px] text-slate-500 block">Aktifkan efek getaran interaktif saat notifikasi BBM masuk</span>
                          </div>
                        </label>
                      </div>

                      {/* 5. SYSTEM INFORMATION PANEL */}
                      <div className="bg-slate-200/50 rounded-md p-3 text-[10px] text-slate-600 space-y-1 select-none border border-slate-300/40">
                        <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px]">📱 Informasi Keamanan Sistem</p>
                        <p className="flex justify-between"><span>Versi BBM Neo:</span> <span className="font-semibold text-slate-800 font-mono">v1.1.0-secure</span></p>
                        <p className="flex justify-between"><span>Sistem Kriptografi:</span> <span className="font-semibold text-slate-800 font-mono">RSA-OAEP 2048 & AES-GCM 256</span></p>
                        <p className="flex justify-between"><span>Status Koneksi:</span> <span className="font-semibold text-emerald-600 font-bold font-mono">● TERHUBUNG & TERENKRIPSI</span></p>
                      </div>

                      {/* 6. LOG OUT ACTION BUTTON */}
                      <div className="pt-2">
                        <button 
                          type="button"
                          onClick={() => setShowLogoutConfirm(true)}
                          className="w-full py-3 bg-[#D32F2F] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-widest rounded shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar BlackBerry ID (Sign Out)
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>

              {/* Right Side View: Active Conversation or Welcome Screen */}
              <div className={`flex-1 flex flex-col relative bg-[#D8E2EC] ${activeChatSession ? "flex" : "hidden md:flex"}`}>
                
                {activeChatSession ? (
                  <>
                    {/* Chat Toolbar Header */}
                    <div className="h-12 bg-[#F9F9F9] border-b border-slate-300 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
                      <div className="flex items-center overflow-hidden">
                        
                        {/* Mobile Back Button to return to Sidebar */}
                        <button 
                          onClick={() => setActiveChatSession(null)}
                          className="md:hidden p-1 mr-2 text-slate-600 hover:text-slate-900"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="w-8 h-8 bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                          <img src={activeChatSession.avatar} alt={activeChatSession.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-3 overflow-hidden">
                          <span className="font-bold text-sm text-[#004175] block truncate">{activeChatSession.name}</span>
                          {activeChatSession.type === "peer" ? (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1.5 rounded">
                              PIN: {activeChatSession.pin}
                            </span>
                          ) : (
                            <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider font-mono">
                              GRUP BBM
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setIsOffline(!isOffline);
                            triggerNotification(
                              !isOffline 
                                ? "Mode Offline disimulasikan! Menampilkan peringatan koneksi." 
                                : "Terhubung kembali ke internet!",
                              !isOffline ? "info" : "success"
                            );
                          }}
                          className={`text-[9px] font-bold uppercase px-2 py-1 rounded border transition-all flex items-center gap-1 cursor-pointer ${
                            isOffline 
                              ? "bg-red-500 hover:bg-red-600 text-white border-red-400 shadow-sm" 
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300"
                          }`}
                          title="Klik untuk simulasi mode offline"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? "bg-white animate-pulse" : "bg-green-500"}`} />
                          {isOffline ? "Offline" : "Online"}
                        </button>

                        <div className="hidden lg:flex gap-3">
                          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                            E2EE Terenkripsi
                          </span>
                        </div>
                        <button 
                          onClick={() => setShowStickerPanel(!showStickerPanel)}
                          className="text-xs font-bold text-blue-700 uppercase cursor-pointer hover:underline"
                        >
                          Stiker
                        </button>
                      </div>
                    </div>

                    {/* Connection Offline Indicator Error Banner */}
                    {isOffline && (
                      <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center justify-between text-xs text-red-900 animate-fadeIn shrink-0 select-none">
                        <div className="flex items-center gap-3">
                          <span className="text-base">⚠️</span>
                          <div>
                            <p className="font-bold text-red-800">Sambungkan kembali internet</p>
                            <p className="text-[10px] text-red-500 font-mono mt-0.5">Kode Error: ERR_CONNECTION_LOST (0x800C0005)</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            // Try reconnecting
                            setIsOffline(false);
                            triggerNotification("Terhubung kembali ke internet!", "success");
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          Refresh
                        </button>
                      </div>
                    )}

                    {/* Chat Messages Timeline Display Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
                      
                      <div className="self-center bg-[#004175]/10 border border-[#004175]/20 text-[#004175] text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                        🔒 Percakapan ini dilindungi Enkripsi Ujung ke Ujung
                      </div>

                      {allMessages
                        .filter(msg => msg.chatId === activeChatSession.id)
                        .map((msg, index) => {
                          const isMe = msg.senderId === currentUser.id;
                          const isSystem = msg.senderId === "system";
                          const decryptedContent = decryptedMessages[msg.id];
                          
                          if (isSystem) {
                            return (
                              <div key={msg.id} className="self-center my-1 text-[10px] bg-slate-200 border border-slate-300 text-slate-600 px-3 py-1 rounded">
                                {msg.encryptedContent}
                              </div>
                            );
                          }

                          return (
                            <div 
                              key={msg.id} 
                              className={`flex items-start max-w-[85%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                            >
                              {/* Square Avatar on chat bubble */}
                              <div className="w-8 h-8 bg-slate-200 border border-slate-300 shrink-0 overflow-hidden">
                                <img 
                                  src={isMe ? currentUser.avatar : msg.senderAvatar || activeChatSession.avatar} 
                                  alt={msg.senderName} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>

                              <div className={`mx-2 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                
                                {/* Sender Name for Groups */}
                                {activeChatSession.type === "group" && !isMe && (
                                  <span className="text-[10px] font-bold text-[#004175] mb-0.5 ml-1 flex items-center gap-1">
                                    {msg.senderName} <span className="text-[9px] text-slate-500 font-mono">({msg.senderPin})</span>
                                  </span>
                                )}

                                {/* Message bubble card */}
                                <div className={`p-2.5 rounded-lg shadow-sm border text-sm relative ${
                                  isMe 
                                    ? "bg-[#E0F0FF] border-blue-200 text-slate-800 rounded-tr-none" 
                                    : "bg-white border-slate-200 text-slate-800 rounded-tl-none"
                                }`}>
                                  
                                  {/* Sticker graphic if attached */}
                                  {msg.sticker && (
                                    <div className="text-4xl py-2 text-center animate-bounce">
                                      {msg.sticker}
                                    </div>
                                  )}

                                  {/* Image message attachment */}
                                  {msg.image && (
                                    <div className="mb-2 max-w-[200px] border border-slate-200 bg-slate-100 overflow-hidden">
                                      <img src={msg.image} alt="BBM attachment" className="w-full h-auto object-contain max-h-48" />
                                    </div>
                                  )}

                                  {/* Text decrypter content */}
                                  {msg.isPing ? (
                                    <div className="bg-red-600 text-white font-black uppercase text-xs tracking-widest px-3 py-1.5 rounded shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] animate-pulse">
                                      PING!!!
                                    </div>
                                  ) : (
                                    <p className="whitespace-pre-wrap leading-tight">
                                      {decryptedContent !== undefined ? decryptedContent : (
                                        <span className="text-slate-400 italic text-xs">Mendekripsi pesan aman...</span>
                                      )}
                                    </p>
                                  )}

                                  {/* Timestamp / Status code */}
                                  <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-[8px] text-slate-400 font-mono">
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          if (isOffline) {
                                            triggerNotification("Koneksi tidak ada! Sambungkan kembali internet. Kode Error: ERR_CONNECTION_LOST (0x800C0005)", "error");
                                          } else {
                                            triggerNotification("Pesan telah terkirim (D - Delivered ✓✓)", "info");
                                          }
                                        }}
                                        className={`text-[10px] font-bold font-mono tracking-wider ml-1 flex items-center gap-0.5 hover:underline cursor-pointer ${isOffline ? "text-red-500" : "text-[#005596]"}`}
                                        title={isOffline ? "Gagal! Sambungkan kembali internet. Kode: ERR_CONNECTION_LOST" : "Terkirim & Diterima (Delivered ✓✓)"}
                                      >
                                        <span>D</span>
                                        <span className="text-[9px] font-sans font-bold">{isOffline ? "⚠️" : "✓✓"}</span>
                                      </button>
                                    )}
                                  </div>

                                </div>

                              </div>
                            </div>
                          );
                        })}

                      <div ref={messageEndRef} />
                    </div>

                    {/* Attachment Previews or Sticker Boards */}
                    {attachedImage && (
                      <div className="bg-white border-t border-slate-300 p-2 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img src={attachedImage} alt="Preview" className="w-12 h-12 object-cover border border-slate-300" />
                          <span className="text-xs text-slate-500 font-mono truncate">gambar_sematan_bbm.png</span>
                        </div>
                        <button 
                          onClick={() => setAttachedImage(null)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-100 rounded"
                        >
                          ✕ Hapus
                        </button>
                      </div>
                    )}

                    {/* Sticker Panel Board */}
                    {showStickerPanel && (
                      <div className="bg-white border-t border-slate-300 p-3 shrink-0 shadow-inner">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500">STIKER & EMOTIKON KLASIK BBM</span>
                          <button onClick={() => setShowStickerPanel(false)} className="text-xs text-slate-400 hover:text-slate-600">✕ Tutup</button>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {CLASSIC_STICKERS.map(stk => (
                            <button
                              key={stk.id}
                              onClick={() => handleSendMessage(false, stk.char)}
                              className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded flex flex-col items-center justify-center transition-colors"
                            >
                              <span className="text-3xl">{stk.char}</span>
                              <span className="text-[9px] text-slate-500 mt-1">{stk.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input Area Controls with PING button */}
                    <div className="h-20 bg-[#F4F4F4] border-t border-slate-300 p-3 flex gap-2 shrink-0 items-center">
                      
                      {/* Attach Photo Button */}
                      <button 
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-500 rounded shrink-0"
                        title="Kirim Foto"
                      >
                        <Image className="w-5 h-5 text-slate-600" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageSelect} 
                          className="hidden" 
                          ref={imageInputRef}
                        />
                      </button>

                      {/* Sticker Overlay Toggle */}
                      <button 
                        onClick={() => setShowStickerPanel(!showStickerPanel)}
                        className={`p-2.5 border rounded shrink-0 transition-colors ${showStickerPanel ? "bg-blue-100 border-blue-400 text-blue-700" : "bg-white border-slate-300 text-slate-500 hover:bg-slate-100"}`}
                        title="Stiker"
                      >
                        <Smile className="w-5 h-5" />
                      </button>

                      {/* Text Input Field */}
                      <textarea
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Tulis pesan..."
                        className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#005596] resize-none h-11"
                      />

                      {/* Send text Button */}
                      <button 
                        onClick={() => handleSendMessage()}
                        disabled={!messageText.trim() && !attachedImage}
                        className="px-4 h-11 bg-[#005596] hover:bg-[#004175] text-white font-bold text-xs uppercase rounded shrink-0 flex items-center justify-center gap-1 shadow disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" /> Kirim
                      </button>

                      {/* Iconic BBM PING!!! Button */}
                      <button 
                        onClick={() => handleSendMessage(true)}
                        className="px-3 h-11 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase rounded shrink-0 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] animate-pulse"
                      >
                        PING!!!
                      </button>
                    </div>
                  </>
                ) : (
                  // WELCOME INTRO BOARD WHEN CHAT IS IDLE
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-600 space-y-4">
                    <div className="w-24 h-24 bg-[#005596] rounded-2xl flex items-center justify-center border-4 border-white/90 shadow-2xl">
                      <span className="text-4xl font-black text-white font-mono">bbm</span>
                    </div>

                    <div className="max-w-md">
                      <h2 className="text-2xl font-bold text-[#004175]">BBM Neo Workspace</h2>
                      <p className="text-xs text-slate-500 font-mono tracking-wide uppercase mt-1">E2EE Chat Server Aktif</p>
                      
                      <div className="h-px bg-slate-300/60 my-4"></div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        Silakan pilih percakapan dari sidebar kiri, atau navigasikan menu di bawah tajuk profil untuk membuat obrolan grup baru, mengelola daftar kontak, dan membaca feed pembaruan status teman Anda.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-4">
                      <div className="bg-white p-3 border border-slate-200 rounded text-left">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">PIN Anda</span>
                        <p className="text-sm font-mono font-bold text-slate-800">{currentUser.pin}</p>
                      </div>
                      <div className="bg-white p-3 border border-slate-200 rounded text-left">
                        <span className="text-[10px] font-bold text-green-600 uppercase">Enkripsi Kunci</span>
                        <p className="text-xs font-mono text-slate-800 truncate">RSA-OAEP 2048</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Bottom Utility Status Bar */}
            <div id="bbm-bottom-statusbar" className="h-10 bg-[#003866] border-t border-[#002D54] flex items-center px-4 justify-between shrink-0 text-white">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setActiveTab("chats"); setActiveChatSession(null); }}
                  className="flex items-center text-[10px] font-bold uppercase cursor-pointer opacity-80 hover:opacity-100 text-white gap-1"
                >
                  <span>💬</span> Obrolan ({sessions.length})
                </button>
                <button 
                  onClick={() => { setActiveTab("contacts"); setActiveChatSession(null); }}
                  className="flex items-center text-[10px] font-bold uppercase cursor-pointer opacity-80 hover:opacity-100 text-white gap-1"
                >
                  <span>👤</span> Kontak ({allUsers.filter(u => u.id !== currentUser.id).length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-[10px] font-bold font-mono uppercase text-blue-100">
                  Terhubung: {currentUser.name}
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#005596] to-[#004175] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Buat Grup BBM Baru
              </h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-white hover:text-slate-200">✕</button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Obrolan Grup</label>
                <input 
                  type="text" 
                  value={groupNameInput}
                  onChange={e => setGroupNameInput(e.target.value)}
                  placeholder="Contoh: Alumni ITB, Keluarga, dll"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#005596]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Pilih Anggota Kontak</label>
                {allUsers.filter(u => u.id !== currentUser?.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada pengguna lain terdaftar di platform ini.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100">
                    {allUsers.filter(u => u.id !== currentUser?.id).map(usr => {
                      const isSelected = selectedGroupMembers.includes(usr.id);
                      return (
                        <button
                          key={usr.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedGroupMembers(prev => prev.filter(id => id !== usr.id));
                            } else {
                              setSelectedGroupMembers(prev => [...prev, usr.id]);
                            }
                          }}
                          className={`w-full text-left p-2.5 text-xs flex items-center justify-between transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                        >
                          <span className="font-bold text-slate-800">{usr.name} <span className="font-mono text-[10px] text-slate-400">({usr.pin})</span></span>
                          <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-[#005596] border-[#005596] text-white" : "border-slate-300 bg-white"}`}>
                            {isSelected && "✓"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#005596] hover:bg-[#004175] text-white font-bold text-xs uppercase rounded"
                >
                  Buat Grup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PIN MODAL (GANTI PIN) */}
      {showChangePinModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#005596] to-[#004175] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4" /> Ganti PIN BBM Autentik
              </h3>
              <button onClick={() => setShowChangePinModal(false)} className="text-white hover:text-slate-200">✕</button>
            </div>
            <form onSubmit={handleChangePIN} className="p-4 space-y-4">
              <p className="text-xs text-slate-500">
                Ubah PIN BBM Neo Anda menjadi kombinasi 8-karakter hex custom yang mudah diingat atau eksklusif. Sistem akan meregenerasi kunci E2EE secara otomatis.
              </p>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PIN Baru Anda (Harus 8 Karakter Hex)</label>
                <input 
                  type="text" 
                  value={newPinValue}
                  onChange={e => setNewPinValue(e.target.value.toUpperCase())}
                  placeholder="CONTOH: 2B8C9F72"
                  maxLength={8}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono tracking-widest text-center text-blue-700 font-bold focus:outline-none focus:border-[#005596]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Konfirmasi Sandi Keamanan PIN</label>
                <input 
                  type="password" 
                  value={confirmPinPass}
                  onChange={e => setConfirmPinPass(e.target.value)}
                  placeholder="Sandi keamanan akun saat ini"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#005596]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowChangePinModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded"
                >
                  Simpan PIN Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CONTACT MODAL */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#005596] to-[#004175] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Tambah Kontak Baru
              </h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-white hover:text-slate-200">✕</button>
            </div>
            <div className="p-4 flex flex-col h-[60vh] max-h-[500px]">
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Cari berdasarkan Nama atau PIN..." 
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005596]"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {availableUsersToAdd.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 p-4 italic">Tidak ada pengguna ditemukan.</p>
                ) : (
                  availableUsersToAdd.map(usr => {
                    const isAdded = !!contactTypes[usr.id];
                    return (
                      <div key={usr.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img src={usr.avatar} alt={usr.name} className="w-10 h-10 object-cover border border-slate-300" />
                          <div className="overflow-hidden">
                            <p className="font-bold text-xs text-slate-800 truncate">{usr.name}</p>
                            <p className="font-mono text-[10px] text-blue-600 mt-0.5">PIN: {usr.pin}</p>
                          </div>
                        </div>
                        {isAdded ? (
                          <span className="text-[10px] text-green-600 font-bold px-2 py-1 bg-green-50 border border-green-200 rounded">
                            Sudah Ditambahkan
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setContactTypes(prev => ({...prev, [usr.id]: 'global'})); // Added manually
                              triggerNotification(`Berhasil menambahkan ${usr.name} ke kontak.`, "success");
                            }}
                            className="text-[10px] font-bold text-white bg-[#005596] hover:bg-[#004175] px-3 py-1.5 rounded transition-colors uppercase"
                          >
                            Tambah
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LOG OUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl overflow-hidden border-2 border-[#004175]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white p-4 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <h3 className="font-black text-xs uppercase tracking-wider">Konfirmasi Keluar BBM</h3>
            </div>
            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin keluar dari akun <strong className="text-slate-900">{currentUser?.name}</strong> (BlackBerry ID: {currentUser?.email})? 
              </p>
              <p className="text-[10px] bg-red-50 text-red-800 p-2.5 rounded border border-red-100 font-medium">
                Peringatan: Keluar akan menghapus sesi login aktif. Kunci enkripsi privat Anda akan disimpan dengan aman dalam database BlackBerry ID Anda jika disinkronkan, namun pastikan Anda mengingat PIN dan kata sandi Anda untuk masuk kembali.
              </p>
            </div>
            {/* Footer Buttons */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded text-xs text-slate-700 font-bold hover:bg-slate-100 transition-colors uppercase tracking-wider"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="px-4 py-2 bg-[#D32F2F] hover:bg-red-700 text-white font-bold text-xs rounded transition-colors uppercase tracking-wider shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: GANTI NAMA AKUN BBM */}
      {showEditNameModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl overflow-hidden border-2 border-[#004175] animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#005596] to-[#004175] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">👤</span>
                <h3 className="font-black text-xs uppercase tracking-wider">Ganti Nama Akun BBM</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEditNameModal(false)}
                className="text-white/80 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            {/* Body */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!currentUser) return;
              if (editNameCurrent.trim() !== currentUser.name) {
                triggerNotification("Nama saat ini tidak cocok atau salah!", "error");
                return;
              }
              if (editNameNew.trim().length === 0) {
                triggerNotification("Nama baru tidak boleh kosong!", "error");
                return;
              }
              if (editNameNew.trim() !== editNameConfirm.trim()) {
                triggerNotification("Konfirmasi nama baru tidak cocok!", "error");
                return;
              }
              await handleUpdateProfile("name", editNameNew.trim());
              setShowEditNameModal(false);
              triggerNotification("Nama berhasil diperbarui!", "success");
            }} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nama Saat Ini (Verifikasi)</label>
                <input 
                  type="text"
                  value={editNameCurrent}
                  onChange={(e) => setEditNameCurrent(e.target.value)}
                  placeholder="Ketik nama lama Anda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-[#005596] text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nama Baru</label>
                <input 
                  type="text"
                  value={editNameNew}
                  onChange={(e) => setEditNameNew(e.target.value)}
                  placeholder="Ketik nama baru pilihan Anda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-[#005596] text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Konfirmasi Nama Baru</label>
                <input 
                  type="text"
                  value={editNameConfirm}
                  onChange={(e) => setEditNameConfirm(e.target.value)}
                  placeholder="Ketik ulang nama baru"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-[#005596] text-slate-800"
                  required
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditNameModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-[10px] text-slate-600 font-bold hover:bg-slate-50 transition-colors uppercase cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#005596] hover:bg-[#004175] text-white font-bold text-[10px] rounded transition-colors uppercase shadow-sm cursor-pointer"
                >
                  Simpan Nama
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: GANTI STATUS BBM */}
      {showEditStatusModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl overflow-hidden border-2 border-[#004175] animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#005596] to-[#004175] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">💬</span>
                <h3 className="font-black text-xs uppercase tracking-wider">Ganti Status BBM</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEditStatusModal(false)}
                className="text-white/80 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            {/* Body */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleUpdateProfile("status", editStatusValue.trim());
              setShowEditStatusModal(false);
              triggerNotification("Status personal berhasil diperbarui!", "success");
            }} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status / Pesan Personal Baru</label>
                <textarea 
                  value={editStatusValue}
                  onChange={(e) => setEditStatusValue(e.target.value)}
                  placeholder="Ada apa di pikiran Anda?"
                  maxLength={150}
                  className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-[#005596] text-slate-800 resize-none leading-tight"
                />
                <div className="flex justify-end text-[9px] text-slate-400 mt-1 font-mono">
                  {editStatusValue.length}/150 karakter
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditStatusModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-[10px] text-slate-600 font-bold hover:bg-slate-50 transition-colors uppercase cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#005596] hover:bg-[#004175] text-white font-bold text-[10px] rounded transition-colors uppercase shadow-sm cursor-pointer"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
