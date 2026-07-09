export interface User {
  id: string;
  email: string;
  name: string;
  pin: string; // 8-character uppercase hex (e.g., '2B8C9F72')
  avatar: string; // base64 or URL
  status: string; // "Available", "Busy", etc.
  music: { title: string; artist: string } | null;
  pinHash: string; // Hashed PIN for login
  encryptedPrivateKey: string; // Encrypted private key for E2EE sync
  publicKey: string; // Public key for others to encrypt messages for this user
  contactSource?: 'google' | 'phone';
}

export interface Message {
  id: string;
  chatId: string; // peer-to-peer (sorted user1_user2) or groupId
  senderId: string;
  senderPin: string;
  senderName: string;
  receiverId: string; // userId or groupId
  encryptedContent: string; // cipher text encrypted with standard E2EE
  image: string | null; // Base64 encrypted or raw
  sticker: string | null; // sticker identifier
  isPing: boolean;
  timestamp: number;
  isGroup: boolean;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  creatorId: string;
  members: string[]; // List of user IDs
  createdAt: number;
}

export interface FeedUpdate {
  id: string;
  userId: string;
  userName: string;
  userPin: string;
  userAvatar: string;
  content: string;
  music: { title: string; artist: string } | null;
  timestamp: number;
  type: 'status' | 'music' | 'avatar_change';
}

export interface ChatSession {
  id: string;
  type: 'peer' | 'group';
  targetId: string; // userId or groupId
  name: string;
  avatar: string;
  pin?: string; // If peer
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
}
