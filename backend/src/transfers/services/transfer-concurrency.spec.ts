import { subtractMinor } from '../../common/money/money';

describe('concurrent balance updates (simulated)', () => {
  it('prevents overspending when serialized with locks', async () => {
    let available = 1000n;
    let lock: Promise<void> = Promise.resolve();

    const withLock = async (fn: () => Promise<void>) => {
      const previous = lock;
      let release!: () => void;
      lock = new Promise<void>((resolve) => {
        release = resolve;
      });
      await previous;
      try {
        await fn();
      } finally {
        release();
      }
    };

    const attempt = (amount: bigint) =>
      withLock(async () => {
        const current = available;
        await Promise.resolve();
        if (current < amount) {
          throw new Error('Insufficient funds');
        }
        available = subtractMinor(current, amount);
      });

    const results = await Promise.allSettled([attempt(600n), attempt(600n)]);

    const successes = results.filter((r) => r.status === 'fulfilled').length;
    expect(successes).toBe(1);
    expect(available).toBe(400n);
  });
});
