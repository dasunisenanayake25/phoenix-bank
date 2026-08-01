import { Injectable, BadRequestException } from '@nestjs/common';
import * as sss from 'shamirs-secret-sharing';

@Injectable()
export class KeyCeremonyService {
  /**
   * Reconstructs the master key from shares and simulates signing ledger entries.
   * Ensures the key only exists in memory and is wiped afterwards.
   */
  public reconstructAndSign(sharesHex: string[]): {
    success: boolean;
    signedEntries: number;
    signatures: string[];
  } {
    if (!sharesHex || sharesHex.length < 3) {
      throw new BadRequestException(
        'At least 3 shares are required to reconstruct the key.',
      );
    }

    let reconstructedKey: Buffer | null = null;

    try {
      // Convert hex strings back to buffers
      const shareBuffers = sharesHex.map((hex) => Buffer.from(hex, 'hex'));

      // Reconstruct the key
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      reconstructedKey = sss.combine(shareBuffers);

      // Verify the reconstructed key is valid (assuming it should be 32 bytes)
      if (!reconstructedKey || reconstructedKey.length !== 32) {
        throw new Error('Reconstructed key is invalid or corrupt.');
      }

      // -------------------------------------------------------------
      // MOCK: Simulate signing a batch of pending audit ledger entries
      // -------------------------------------------------------------
      const signedEntries = 12; // Example static count for demo
      const signatures: string[] = [];
      for (let i = 0; i < signedEntries; i++) {
        // Just mock some signature strings for demo purposes,
        // normally we would use crypto.sign with reconstructedKey
        signatures.push(`mock_sig_${Date.now()}_${i}`);
      }

      return {
        success: true,
        signedEntries,
        signatures,
      };
    } catch (error) {
      throw new BadRequestException(
        `Key reconstruction failed: ${(error as Error).message}`,
      );
    } finally {
      // CRITICAL: Ensure the key is zeroed out and removed from memory
      if (reconstructedKey) {
        reconstructedKey.fill(0);
        reconstructedKey = null;
      }
    }
  }
}
