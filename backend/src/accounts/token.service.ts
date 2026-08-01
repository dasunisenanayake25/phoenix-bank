import * as crypto from 'crypto';

export class TokenService {
  private static jwtSecret: string | null = null;

  private static async getSecret(): Promise<string> {
    if (this.jwtSecret) return this.jwtSecret;

    // Load from Vault if possible
    try {
      const vaultUrl = process.env.VAULT_ADDR || 'http://localhost:8200';
      const vaultToken = process.env.VAULT_TOKEN || 'phoenix-master-token';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      
      const res = await fetch(`${vaultUrl}/v1/secret/data/phoenix/ledger`, {
        headers: { 'X-Vault-Token': vaultToken },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json() as any;
        const secret = json?.data?.data?.JWT_SECRET;
        if (secret) {
          this.jwtSecret = secret;
          console.log('Successfully fetched JWT_SECRET from HashiCorp Vault.');
          return secret;
        }
      }
    } catch (e) {
      // Ignore and fallback
    }

    const fallbackSecret = process.env.JWT_SECRET || 'phoenix_bank_jwt_secure_key_2065';
    this.jwtSecret = fallbackSecret;
    return fallbackSecret;
  }

  static async generateToken(payload: { id: string; name: string }): Promise<string> {
    const secret = await this.getSecret();
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${data}`)
      .digest('base64url');
      
    return `${header}.${data}.${signature}`;
  }

  static async verifyToken(token: string): Promise<{ id: string; name: string } | null> {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, data, signature] = parts;
    const secret = await this.getSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${data}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    try {
      return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    } catch {
      return null;
    }
  }
}
