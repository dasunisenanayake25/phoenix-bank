'use client';
import { useState } from 'react';

export default function KeyCeremonyPage() {
  const [shares, setShares] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; signedEntries?: number } | null>(null);

  const handleShareChange = (index: number, value: string) => {
    const newShares = [...shares];
    newShares[index] = value;
    setShares(newShares);
  };

  const triggerCeremony = async () => {
    setLoading(true);
    setResult(null);

    // Filter out empty shares
    const validShares = shares.filter(s => s.trim() !== '');

    try {
      const response = await fetch('http://localhost:4001/key-ceremony/reconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares: validShares }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `3 of 5 shares verified. Key reconstructed in memory, ${data.signedEntries} audit entries signed, key discarded.`,
          signedEntries: data.signedEntries,
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to reconstruct the master key.',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error or server unavailable. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1128] text-white flex flex-col items-center py-16 font-sans">
      <div className="max-w-2xl w-full bg-[#111c40] rounded-xl shadow-2xl overflow-hidden border border-[#d4af37]/30">
        <div className="bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] p-6 text-center">
          <h1 className="text-3xl font-bold text-[#0a1128] tracking-wider uppercase">Master Key Ceremony</h1>
          <p className="text-[#0a1128]/80 mt-2 font-medium">Shamir&apos;s Secret Sharing (3-of-5 Threshold)</p>
        </div>
        
        <div className="p-8 space-y-6">
          <p className="text-gray-300 text-center mb-8">
            Please enter exactly 3 key shares provided by the designated key custodians. 
            The master key will be reconstructed securely in memory to sign pending audit logs and immediately discarded.
          </p>

          <div className="space-y-4">
            {[1, 2, 3].map((num, idx) => (
              <div key={num} className="flex flex-col">
                <label className="text-[#d4af37] font-semibold mb-1 uppercase text-sm tracking-wider">Custodian Share {num}</label>
                <input
                  type="text"
                  className="bg-[#0a1128] border border-gray-700 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-md p-3 text-white outline-none transition-all duration-300 font-mono"
                  placeholder="Enter hex share..."
                  value={shares[idx]}
                  onChange={(e) => handleShareChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          <button
            onClick={triggerCeremony}
            disabled={loading || shares.some(s => s.trim() === '')}
            className={`w-full py-4 mt-8 rounded-md font-bold text-lg uppercase tracking-widest transition-all duration-300
              ${loading || shares.some(s => s.trim() === '') 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] hover:from-[#e3c152] hover:to-[#bfa23b] text-[#0a1128] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
              }`}
          >
            {loading ? 'Reconstructing Key...' : 'Trigger Key Ceremony'}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-md border ${result.success ? 'bg-green-900/30 border-green-500 text-green-300' : 'bg-red-900/30 border-red-500 text-red-300'}`}>
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{result.success ? '✓' : '✗'}</div>
                <div>
                  <h3 className="font-bold">{result.success ? 'Ceremony Successful' : 'Ceremony Failed'}</h3>
                  <p className="text-sm mt-1">{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
