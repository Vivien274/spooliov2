const encoder = new TextEncoder();

/**
 * Generates an encrypted HMAC-SHA256 session token with a specific expiration time.
 */
export async function signSession(exp: number, secret: string): Promise<string> {
  const timestamp = Date.now();
  const data = `${timestamp}:${exp}`;
  
  const keyBuf = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuf = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(data)
  );
  
  const signatureHex = Array.from(new Uint8Array(signatureBuf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
    
  return `${data}:${signatureHex}`;
}

/**
 * Cryptographically verifies if the given session token is valid and not expired.
 */
export async function verifySession(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    
    const [timestamp, exp, signature] = parts;
    
    // Check if token has expired
    if (Date.now() > parseInt(exp, 10)) {
      return false;
    }
    
    const data = `${timestamp}:${exp}`;
    const keyBuf = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuf,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const expectedBuf = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(data)
    );
    
    const expectedHex = Array.from(new Uint8Array(expectedBuf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
      
    return signature === expectedHex;
  } catch (e) {
    return false;
  }
}
