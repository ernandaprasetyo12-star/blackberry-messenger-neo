import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

interface DbSchema {
  users: Array<{
    id: string;
    email: string;
    name: string;
    pin: string;
    avatar: string;
    status: string;
    music: { title: string; artist: string } | null;
    pinHash: string;
    encryptedPrivateKey: string;
    publicKey: string;
    recoveryEmail: string;
  }>;
  messages: Array<{
    id: string;
    chatId: string;
    senderId: string;
    senderPin: string;
    senderName: string;
    receiverId: string;
    encryptedContent: string;
    image: string | null;
    sticker: string | null;
    isPing: boolean;
    timestamp: number;
    isGroup: boolean;
  }>;
  groups: Array<{
    id: string;
    name: string;
    avatar: string;
    creatorId: string;
    members: string[];
    createdAt: number;
  }>;
  feeds: Array<{
    id: string;
    userId: string;
    userName: string;
    userPin: string;
    userAvatar: string;
    content: string;
    music: { title: string; artist: string } | null;
    timestamp: number;
    type: 'status' | 'music' | 'avatar_change';
  }>;
}

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load/save Database
function loadDb(): DbSchema {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: DbSchema = {
      users: [],
      messages: [],
      groups: [],
      feeds: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to parse DB, resetting", err);
    return { users: [], messages: [], groups: [], feeds: [] };
  }
}

function saveDb(db: DbSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize DB
  const db = loadDb();

  // In-memory store for 5-digit recovery verification codes
  const recoveryCodes = new Map<string, { code: string; expires: number }>();

  // API Routes
  
  // 1. REGISTER
  app.post("/api/auth/register", (req, res) => {
    const { email, name, pin, pinHash, encryptedPrivateKey, publicKey, avatar } = req.body;
    
    if (!email || !name || !pin || !pinHash || !encryptedPrivateKey || !publicKey) {
      return res.status(400).json({ error: "Kolom pendaftaran tidak lengkap" });
    }

    const currentDb = loadDb();
    
    // Check PIN uniqueness (must be unique)
    const normalizedPin = pin.trim().toUpperCase();
    const existingPin = currentDb.users.find(u => u.pin === normalizedPin);
    if (existingPin) {
      return res.status(400).json({ error: "PIN BBM sudah digunakan oleh pengguna lain. Silakan pilih PIN lain." });
    }

    // Check Email uniqueness
    const existingEmail = currentDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ error: "Email sudah terdaftar. Silakan masuk atau lakukan pemulihan akun." });
    }

    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      email: email.toLowerCase(),
      name,
      pin: normalizedPin,
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
      status: "Aktif menggunakan BBM Neo",
      music: null,
      pinHash,
      encryptedPrivateKey,
      publicKey,
      recoveryEmail: email.toLowerCase()
    };

    currentDb.users.push(newUser);
    
    // Add an automatic feed update for user joining BBM Neo
    currentDb.feeds.unshift({
      id: "feed_" + Math.random().toString(36).substring(2, 11),
      userId: newUser.id,
      userName: newUser.name,
      userPin: newUser.pin,
      userAvatar: newUser.avatar,
      content: `Baru saja bergabung dengan BBM Neo! Sapa saya di PIN: ${newUser.pin}`,
      music: null,
      timestamp: Date.now(),
      type: 'status'
    });

    saveDb(currentDb);
    res.json({ user: newUser, token: "tok_" + newUser.id });
  });

  // 2. LOGIN
  app.post("/api/auth/login", (req, res) => {
    const { nameOrEmailOrPin, pinHash } = req.body;
    if (!nameOrEmailOrPin || !pinHash) {
      return res.status(400).json({ error: "Nama/Email/PIN dan sandi keamanan diperlukan" });
    }

    const currentDb = loadDb();
    const searchStr = nameOrEmailOrPin.trim().toLowerCase();
    
    // Find user by name, email, or PIN
    const user = currentDb.users.find(u => 
      u.name.toLowerCase() === searchStr || 
      u.email.toLowerCase() === searchStr || 
      u.pin.toLowerCase() === searchStr
    );

    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    if (user.pinHash !== pinHash) {
      return res.status(401).json({ error: "PIN atau kata sandi tidak cocok. Silakan coba lagi." });
    }

    res.json({ user, token: "tok_" + user.id });
  });

  // 2.5. REQUEST RECOVERY CODE
  app.post("/api/auth/request-recovery-code", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email pemulihan diperlukan" });
    }

    const currentDb = loadDb();
    const user = currentDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "Alamat email ini tidak terdaftar di sistem kami." });
    }

    // Generate random 5-digit verification code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Store in-memory with a 10-minute expiry
    recoveryCodes.set(email.toLowerCase(), {
      code,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Return code so client can display simulation inbox
    res.json({ 
      success: true, 
      code, 
      email: user.email, 
      message: `Kode verifikasi 5-digit telah dikirimkan ke email terdaftar Anda: ${user.email}` 
    });
  });

  // 3. RECOVER ACCOUNT
  app.post("/api/auth/recover", (req, res) => {
    const { email, code, newPinHash, newEncryptedPrivateKey, newPublicKey } = req.body;
    if (!email || !code || !newPinHash || !newEncryptedPrivateKey || !newPublicKey) {
      return res.status(400).json({ error: "Kolom pemulihan tidak lengkap. Pastikan kode verifikasi dimasukkan." });
    }

    const emailKey = email.toLowerCase();
    const record = recoveryCodes.get(emailKey);
    if (!record) {
      return res.status(400).json({ error: "Silakan minta kode pemulihan baru terlebih dahulu." });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ error: "Kode verifikasi 5-digit salah atau tidak cocok!" });
    }

    if (Date.now() > record.expires) {
      recoveryCodes.delete(emailKey);
      return res.status(400).json({ error: "Kode verifikasi telah kedaluwarsa. Silakan minta kode baru." });
    }

    const currentDb = loadDb();
    const userIndex = currentDb.users.findIndex(u => u.email.toLowerCase() === emailKey);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: "Email pemulihan tidak ditemukan." });
    }

    currentDb.users[userIndex].pinHash = newPinHash;
    currentDb.users[userIndex].encryptedPrivateKey = newEncryptedPrivateKey;
    currentDb.users[userIndex].publicKey = newPublicKey;

    saveDb(currentDb);
    recoveryCodes.delete(emailKey); // Clear code after successful use
    res.json({ success: true, message: "Akun berhasil dipulihkan, silakan masuk dengan PIN baru Anda." });
  });

  // 4. GET ALL USERS (FOR CONTACTS)
  app.get("/api/users", (req, res) => {
    const currentDb = loadDb();
    // Return safe user lists (no pinHash, no privateKey)
    const safeUsers = currentDb.users.map(({ pinHash, encryptedPrivateKey, ...rest }) => rest);
    res.json(safeUsers);
  });

  // 5. UPDATE PROFILE / CHANGE PIN
  app.post("/api/user/update-profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer tok_", "");
    const { status, music, avatar, pin, pinHash, encryptedPrivateKey, publicKey, name } = req.body;

    const currentDb = loadDb();
    const userIndex = currentDb.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    const user = currentDb.users[userIndex];

    // Handle PIN Change
    if (pin && pin.trim().toUpperCase() !== user.pin) {
      const newPin = pin.trim().toUpperCase();
      // Validate unique
      const existingPin = currentDb.users.find(u => u.pin === newPin && u.id !== userId);
      if (existingPin) {
        return res.status(400).json({ error: "PIN BBM baru tersebut sudah digunakan oleh orang lain." });
      }
      user.pin = newPin;
    }

    if (pinHash) user.pinHash = pinHash;
    if (encryptedPrivateKey) user.encryptedPrivateKey = encryptedPrivateKey;
    if (publicKey) user.publicKey = publicKey;

    let isAvatarChanged = false;
    if (avatar && typeof avatar === 'string' && avatar.trim() !== "" && avatar !== user.avatar) {
      user.avatar = avatar;
      isAvatarChanged = true;
    } else {
      user.avatar = user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150";
    }

    let isNameChanged = false;
    if (name && typeof name === 'string' && name.trim() !== "" && name !== user.name) {
      user.name = name;
      isNameChanged = true;
    } else {
      user.name = user.name || "User";
    }

    if (status !== undefined) user.status = status;
    if (music !== undefined) user.music = music;

    currentDb.users[userIndex] = user;

    // Create a feed update if user updated avatar or status
    if (isAvatarChanged) {
      currentDb.feeds.unshift({
        id: "feed_" + Math.random().toString(36).substring(2, 11),
        userId: user.id,
        userName: user.name,
        userPin: user.pin,
        userAvatar: user.avatar,
        content: `Mengubah foto profil barunya.`,
        music: null,
        timestamp: Date.now(),
        type: 'avatar_change'
      });
    } else if (isNameChanged) {
      currentDb.feeds.unshift({
        id: "feed_" + Math.random().toString(36).substring(2, 11),
        userId: user.id,
        userName: user.name,
        userPin: user.pin,
        userAvatar: user.avatar,
        content: `Mengubah nama profilnya menjadi ${user.name}.`,
        music: null,
        timestamp: Date.now(),
        type: 'status'
      });
    } else if (status) {
      currentDb.feeds.unshift({
        id: "feed_" + Math.random().toString(36).substring(2, 11),
        userId: user.id,
        userName: user.name,
        userPin: user.pin,
        userAvatar: user.avatar,
        content: status,
        music: null,
        timestamp: Date.now(),
        type: 'status'
      });
    } else if (music) {
      currentDb.feeds.unshift({
        id: "feed_" + Math.random().toString(36).substring(2, 11),
        userId: user.id,
        userName: user.name,
        userPin: user.pin,
        userAvatar: user.avatar,
        content: `Sedang Mendengarkan: ${music.title} - ${music.artist}`,
        music: music,
        timestamp: Date.now(),
        type: 'music'
      });
    }

    saveDb(currentDb);
    res.json(user);
  });

  // 6. SYNC DATA (REAL-TIME POLLING)
  // Client calls this to get incremental updates for messages, feeds, and groups
  app.get("/api/sync", (req, res) => {
    const { since, userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId diperlukan untuk sinkronisasi" });
    }

    const currentDb = loadDb();
    const sinceTime = since ? parseInt(since as string, 10) : 0;

    // Filter messages for this user (either sent by them, or received by them, or in groups they belong to)
    const userGroups = currentDb.groups.filter(g => g.members.includes(userId as string));
    const userGroupIds = userGroups.map(g => g.id);

    const filteredMessages = currentDb.messages.filter(msg => {
      const isTimeOk = msg.timestamp > sinceTime;
      if (!isTimeOk) return false;

      if (msg.isGroup) {
        return userGroupIds.includes(msg.receiverId);
      } else {
        return msg.senderId === userId || msg.receiverId === userId;
      }
    });

    const filteredFeeds = currentDb.feeds.filter(feed => feed.timestamp > sinceTime);
    const filteredGroups = currentDb.groups.filter(g => g.members.includes(userId as string));
    const allUsers = currentDb.users.map(({ pinHash, encryptedPrivateKey, ...rest }) => rest);

    res.json({
      messages: filteredMessages,
      feeds: filteredFeeds,
      groups: filteredGroups,
      users: allUsers,
      timestamp: Date.now()
    });
  });

  // 7. SEND MESSAGE
  app.post("/api/messages", (req, res) => {
    const { chatId, senderId, senderPin, senderName, receiverId, encryptedContent, image, sticker, isPing, isGroup } = req.body;
    
    if (!senderId || !receiverId || (!encryptedContent && !image && !sticker && !isPing)) {
      return res.status(400).json({ error: "Format pesan tidak valid" });
    }

    const currentDb = loadDb();

    // Verify recipient / group exists
    if (isGroup) {
      const groupExists = currentDb.groups.some(g => g.id === receiverId);
      if (!groupExists) {
        return res.status(404).json({ error: "Grup tidak ditemukan" });
      }
    } else {
      const userExists = currentDb.users.some(u => u.id === receiverId);
      if (!userExists) {
        return res.status(404).json({ error: "Penerima tidak ditemukan" });
      }
    }

    const newMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      chatId: chatId || (isGroup ? receiverId : [senderId, receiverId].sort().join("_")),
      senderId,
      senderPin,
      senderName,
      receiverId,
      encryptedContent: encryptedContent || "",
      image: image || null,
      sticker: sticker || null,
      isPing: !!isPing,
      timestamp: Date.now(),
      isGroup: !!isGroup
    };

    currentDb.messages.push(newMessage);
    saveDb(currentDb);

    res.json(newMessage);
  });

  // 8. CREATE GROUP
  app.post("/api/groups", (req, res) => {
    const { name, avatar, creatorId, members } = req.body;
    if (!name || !creatorId || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: "Informasi grup tidak lengkap" });
    }

    const currentDb = loadDb();
    
    const newGroup = {
      id: "grp_" + Math.random().toString(36).substring(2, 11),
      name,
      avatar: avatar || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=150&h=150",
      creatorId,
      members: Array.from(new Set([creatorId, ...members])), // Ensure creator is included
      createdAt: Date.now()
    };

    currentDb.groups.push(newGroup);

    // Save a message into the group announcing creation
    currentDb.messages.push({
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      chatId: newGroup.id,
      senderId: "system",
      senderPin: "BBM_NEO",
      senderName: "BBM System",
      receiverId: newGroup.id,
      encryptedContent: `Grup "${name}" telah dibuat oleh pembuat. Silakan mulai obrolan aman!`,
      image: null,
      sticker: null,
      isPing: false,
      timestamp: Date.now(),
      isGroup: true
    });

    saveDb(currentDb);
    res.json(newGroup);
  });

  // 9. JOIN GROUP (VIA PIN SEARCH OR INVITE)
  app.post("/api/groups/:groupId/join", (req, res) => {
    const { userId } = req.body;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId diperlukan" });
    }

    const currentDb = loadDb();
    const groupIndex = currentDb.groups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) {
      return res.status(404).json({ error: "Grup tidak ditemukan" });
    }

    const group = currentDb.groups[groupIndex];
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      currentDb.groups[groupIndex] = group;

      const user = currentDb.users.find(u => u.id === userId);
      
      // Add join message
      currentDb.messages.push({
        id: "msg_" + Math.random().toString(36).substring(2, 11),
        chatId: group.id,
        senderId: "system",
        senderPin: "BBM_NEO",
        senderName: "BBM System",
        receiverId: group.id,
        encryptedContent: `${user ? user.name : "Pengguna baru"} bergabung ke grup.`,
        image: null,
        sticker: null,
        isPing: false,
        timestamp: Date.now(),
        isGroup: true
      });

      saveDb(currentDb);
    }

    res.json(group);
  });

  // Vite development vs Production serving
  if (process.env.NODE_ENV !== "production") {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BBM Neo server running on http://localhost:${PORT}`);
  });
}

startServer();
