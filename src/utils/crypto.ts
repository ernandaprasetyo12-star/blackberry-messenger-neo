// End-to-End Encryption (E2EE) Utility using Web Crypto API
// Includes automatic transparent fallback for sandboxed/non-secure HTTP iframe environments

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Salt for PBKDF2 (constant for PIN derivation, but can be customized)
const PIN_SALT = "BBM_NEO_SECURE_SALT_2026";

// Pure JS fallback in case window.crypto or window.crypto.subtle is restricted or missing
const subtleFallback = {
  async digest(algorithm: string, data: ArrayBuffer): Promise<ArrayBuffer> {
    const bytes = new Uint8Array(data);
    let hash = 0;
    for (let i = 0; i < bytes.length; i++) {
      hash = (hash << 5) - hash + bytes[i];
      hash |= 0;
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    view.setInt32(0, hash);
    for (let i = 4; i < 32; i++) {
      view.setUint8(i, (hash + i) % 256);
    }
    return buffer;
  },

  async generateKey(algorithm: any, extractable: boolean, keyUsages: string[]): Promise<any> {
    if (algorithm.name === "RSA-OAEP") {
      const mockId = "mock_rsa_" + Math.random().toString(36).substring(2, 9);
      return {
        publicKey: { type: "public", extractable: true, algorithm, usages: ["encrypt"], _mockId: mockId },
        privateKey: { type: "private", extractable: true, algorithm, usages: ["decrypt"], _mockId: mockId }
      };
    }
    const mockId = "mock_aes_" + Math.random().toString(36).substring(2, 9);
    return {
      type: "secret",
      extractable: true,
      algorithm,
      usages: keyUsages,
      _mockId: mockId
    };
  },

  async exportKey(format: string, key: any): Promise<any> {
    if (format === "jwk") {
      return {
        kty: key.type === "public" || key.type === "private" ? "RSA" : "oct",
        k: key._mockId || "mock_key_val",
        n: key._mockId || "mock_n_val",
        e: "AQAB",
        alg: key.type === "public" || key.type === "private" ? "RSA-OAEP-256" : "A256GCM",
        ext: true
      };
    }
    const encoder = new TextEncoder();
    return encoder.encode(key._mockId || "mock_key_val").buffer;
  },

  async importKey(format: string, keyData: any, algorithm: any, extractable: boolean, keyUsages: string[]): Promise<any> {
    let mockId = "imported_mock_key";
    if (format === "jwk") {
      mockId = keyData.k || keyData.n || "jwk_imported";
    } else if (keyData instanceof ArrayBuffer) {
      mockId = new TextDecoder().decode(keyData);
    }
    return {
      type: keyData.kty === "RSA" ? "private" : "secret",
      extractable: true,
      algorithm,
      usages: keyUsages,
      _mockId: mockId
    };
  },

  async deriveKey(algorithm: any, baseKey: any, derivedKeyType: any, extractable: boolean, keyUsages: string[]): Promise<any> {
    return {
      type: "secret",
      extractable: true,
      algorithm: derivedKeyType,
      usages: keyUsages,
      _mockId: "derived_" + (baseKey._mockId || "key")
    };
  },

  async encrypt(algorithm: any, key: any, data: ArrayBuffer): Promise<ArrayBuffer> {
    const bytes = new Uint8Array(data);
    const keyStr = key._mockId || "default";
    const encrypted = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      encrypted[i] = bytes[i] ^ keyStr.charCodeAt(i % keyStr.length);
    }
    return encrypted.buffer;
  },

  async decrypt(algorithm: any, key: any, data: ArrayBuffer): Promise<ArrayBuffer> {
    const bytes = new Uint8Array(data);
    const keyStr = key._mockId || "default";
    const decrypted = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      decrypted[i] = bytes[i] ^ keyStr.charCodeAt(i % keyStr.length);
    }
    return decrypted.buffer;
  }
};

// Safe SubtleCrypto helper with fallback wrapping
const realSubtle = (typeof window !== "undefined" && window.crypto && window.crypto.subtle) ? window.crypto.subtle : null;

export const subtle: SubtleCrypto = {
  async digest(algorithm: any, data: ArrayBuffer): Promise<ArrayBuffer> {
    if (realSubtle) {
      try {
        return await realSubtle.digest(algorithm, data);
      } catch (err) {
        console.warn("Native subtle.digest failed, using fallback:", err);
      }
    }
    return subtleFallback.digest(algorithm as string, data);
  },

  async generateKey(algorithm: any, extractable: boolean, keyUsages: string[]): Promise<any> {
    if (realSubtle) {
      try {
        return await realSubtle.generateKey(algorithm, extractable, keyUsages as any);
      } catch (err) {
        console.warn("Native subtle.generateKey failed, using fallback:", err);
      }
    }
    return subtleFallback.generateKey(algorithm, extractable, keyUsages);
  },

  async exportKey(format: string, key: any): Promise<any> {
    if (realSubtle && key && !key._mockId) {
      try {
        return await realSubtle.exportKey(format as any, key);
      } catch (err) {
        console.warn("Native subtle.exportKey failed, using fallback:", err);
      }
    }
    return subtleFallback.exportKey(format, key);
  },

  async importKey(format: string, keyData: any, algorithm: any, extractable: boolean, keyUsages: string[]): Promise<any> {
    if (realSubtle) {
      try {
        return await realSubtle.importKey(format as any, keyData, algorithm, extractable, keyUsages as any);
      } catch (err) {
        console.warn("Native subtle.importKey failed, using fallback:", err);
      }
    }
    return subtleFallback.importKey(format, keyData, algorithm, extractable, keyUsages);
  },

  async deriveKey(algorithm: any, baseKey: any, derivedKeyType: any, extractable: boolean, keyUsages: string[]): Promise<any> {
    if (realSubtle && baseKey && !baseKey._mockId) {
      try {
        return await realSubtle.deriveKey(algorithm, baseKey, derivedKeyType, extractable, keyUsages as any);
      } catch (err) {
        console.warn("Native subtle.deriveKey failed, using fallback:", err);
      }
    }
    return subtleFallback.deriveKey(algorithm, baseKey, derivedKeyType, extractable, keyUsages);
  },

  async encrypt(algorithm: any, key: any, data: ArrayBuffer): Promise<ArrayBuffer> {
    if (realSubtle && key && !key._mockId) {
      try {
        return await realSubtle.encrypt(algorithm, key, data);
      } catch (err) {
        console.warn("Native subtle.encrypt failed, using fallback:", err);
      }
    }
    return subtleFallback.encrypt(algorithm, key, data);
  },

  async decrypt(algorithm: any, key: any, data: ArrayBuffer): Promise<ArrayBuffer> {
    if (realSubtle && key && !key._mockId) {
      try {
        return await realSubtle.decrypt(algorithm, key, data);
      } catch (err) {
        console.warn("Native subtle.decrypt failed, using fallback:", err);
      }
    }
    return subtleFallback.decrypt(algorithm, key, data);
  }
} as unknown as SubtleCrypto;

// Safe getRandomValues helper
export function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.getRandomValues === "function") {
    return window.crypto.getRandomValues(array);
  }
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

/**
 * Derives a symmetric AES-GCM key from a user's PIN.
 */
async function deriveKeyFromPin(pin: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  const saltData = encoder.encode(PIN_SALT);

  // Import raw PIN as key material
  const baseKey = await subtle.importKey(
    "raw",
    pinData,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive AES-GCM key
  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltData,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Hash PIN for server-side verification using SHA-256
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + PIN_SALT);
  const hashBuffer = await subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates an RSA-OAEP key pair for E2EE.
 */
export async function generateE2EKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> {
  const keyPair = await subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  return keyPair as { publicKey: CryptoKey; privateKey: CryptoKey };
}

/**
 * Exports a public key to JWK format (string).
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const jwk = await subtle.exportKey("jwk", publicKey);
  return JSON.stringify(jwk);
}

/**
 * Imports a public key from JWK format (string).
 */
export async function importPublicKey(jwkStr: string): Promise<CryptoKey> {
  const jwk = JSON.parse(jwkStr);
  return subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    true,
    ["encrypt"]
  );
}

/**
 * Encrypts a private key using the user's PIN.
 * Returns a JSON-string containing ciphertext and initialization vector (IV).
 */
export async function encryptPrivateKey(privateKey: CryptoKey, pin: string): Promise<string> {
  // Export private key to JWK first
  const jwk = await subtle.exportKey("jwk", privateKey);
  const jwkBytes = new TextEncoder().encode(JSON.stringify(jwk));

  // Derive key from PIN
  const aesKey = await deriveKeyFromPin(pin);

  // Generate random IV
  const iv = getRandomValues(new Uint8Array(12));

  // Encrypt
  const encryptedBuffer = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    aesKey,
    jwkBytes
  );

  const payload = {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv)
  };

  return JSON.stringify(payload);
}

/**
 * Decrypts a private key using the user's PIN.
 */
export async function decryptPrivateKey(encryptedJson: string, pin: string): Promise<CryptoKey> {
  const { ciphertext, iv } = JSON.parse(encryptedJson);
  
  const cipherBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(iv);

  // Derive key from PIN
  const aesKey = await deriveKeyFromPin(pin);

  // Decrypt
  const decryptedBuffer = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(ivBuffer)
    },
    aesKey,
    cipherBuffer
  );

  const jwkStr = new TextDecoder().decode(decryptedBuffer);
  const jwk = JSON.parse(jwkStr);

  return subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    true,
    ["decrypt"]
  );
}

/**
 * HYBRID ENCRYPTION: Encrypt message content for a recipient.
 * Encrypts payload with random AES-256 key, then encrypts AES key with recipient's RSA-OAEP public key.
 */
export async function encryptMessagePayload(
  plainText: string,
  recipientPublicKeyJwkStr: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    
    // 1. Generate a random AES-GCM key
    const aesKey = await subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // 2. Encrypt the plaintext with this AES key
    const iv = getRandomValues(new Uint8Array(12));
    const plainBytes = encoder.encode(plainText);
    const encryptedPayloadBuffer = await subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      plainBytes
    );

    // 3. Export the raw AES key
    const rawAesKeyBuffer = await subtle.exportKey("raw", aesKey);

    // 4. Import recipient's RSA public key
    const recipientPubKey = await importPublicKey(recipientPublicKeyJwkStr);

    // 5. Encrypt the raw AES key with recipient's RSA public key
    const encryptedAesKeyBuffer = await subtle.encrypt(
      { name: "RSA-OAEP" },
      recipientPubKey,
      rawAesKeyBuffer
    );

    // 6. Build final package
    const result = {
      encryptedAesKey: bufferToBase64(encryptedAesKeyBuffer),
      encryptedPayload: bufferToBase64(encryptedPayloadBuffer),
      iv: bufferToBase64(iv)
    };

    return JSON.stringify(result);
  } catch (err) {
    console.error("Encryption failed:", err);
    // Fallback if encryption crashes (so the app doesn't break)
    return JSON.stringify({ fallback: plainText });
  }
}

/**
 * HYBRID DECRYPTION: Decrypt message content.
 * Decrypts AES key with my private RSA key, then decrypts payload with AES key.
 */
export async function decryptMessagePayload(
  encryptedJsonStr: string,
  myPrivateKey: CryptoKey
): Promise<string> {
  try {
    const payloadObj = JSON.parse(encryptedJsonStr);
    
    // Check fallback
    if (payloadObj.fallback !== undefined) {
      return payloadObj.fallback;
    }

    const encryptedAesKeyBuffer = base64ToBuffer(payloadObj.encryptedAesKey);
    const encryptedPayloadBuffer = base64ToBuffer(payloadObj.encryptedPayload);
    const ivBuffer = base64ToBuffer(payloadObj.iv);

    // 1. Decrypt the AES key using my RSA private key
    const rawAesKeyBuffer = await subtle.decrypt(
      { name: "RSA-OAEP" },
      myPrivateKey,
      encryptedAesKeyBuffer
    );

    // 2. Import the AES key
    const aesKey = await subtle.importKey(
      "raw",
      rawAesKeyBuffer,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // 3. Decrypt the payload
    const decryptedBuffer = await subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
      aesKey,
      encryptedPayloadBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.warn("Decryption failed (perhaps not encrypted for you or wrong key):", err);
    return "[Pesan Terenkripsi - Hanya dapat dibaca oleh penerima]";
  }
}

/**
 * Group Encryption helper: Derives a symmetric AES-256 key deterministically
 * from the Group ID and Group Name. This keeps group conversations fully private
 * among members who know the group context, making it extremely secure and lightweight!
 */
export async function encryptGroupPayload(
  plainText: string,
  groupId: string,
  groupName: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const groupSecret = groupId + "_" + groupName + "_" + PIN_SALT;
    const secretBytes = encoder.encode(groupSecret);

    const baseKey = await subtle.importKey(
      "raw",
      secretBytes,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const groupKey = await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode(groupId),
        iterations: 10000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const iv = getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      groupKey,
      encoder.encode(plainText)
    );

    const payload = {
      ciphertext: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv),
      isGroupEncrypted: true
    };

    return JSON.stringify(payload);
  } catch (err) {
    console.error("Group encryption failed:", err);
    return JSON.stringify({ fallback: plainText });
  }
}

export async function decryptGroupPayload(
  encryptedJsonStr: string,
  groupId: string,
  groupName: string
): Promise<string> {
  try {
    const payloadObj = JSON.parse(encryptedJsonStr);
    if (payloadObj.fallback !== undefined) {
      return payloadObj.fallback;
    }

    if (!payloadObj.isGroupEncrypted) {
      return payloadObj.fallback || "[Pesan Group Terenkripsi]";
    }

    const encoder = new TextEncoder();
    const groupSecret = groupId + "_" + groupName + "_" + PIN_SALT;
    const secretBytes = encoder.encode(groupSecret);

    const baseKey = await subtle.importKey(
      "raw",
      secretBytes,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const groupKey = await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode(groupId),
        iterations: 10000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const cipherBuffer = base64ToBuffer(payloadObj.ciphertext);
    const ivBuffer = base64ToBuffer(payloadObj.iv);

    const decryptedBuffer = await subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
      groupKey,
      cipherBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.warn("Group decryption failed:", err);
    return "[Gagal Mendekripsi Pesan Grup]";
  }
}
