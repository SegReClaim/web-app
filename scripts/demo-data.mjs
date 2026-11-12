// Fictional records for the isolated local Firebase demo project.
const DAY = 86_400_000;
const NAMES = [
  "Aarav Sharma", "Ananya Patel", "Rohan Mehta", "Ishita Shah",
  "Arjun Nair", "Priya Iyer", "Kabir Singh", "Sneha Deshmukh",
  "Vikram Rao", "Aditi Joshi", "Devansh Gupta", "Meera Krishnan",
];

export function createDemoData({ now = new Date() } = {}) {
  const reference = new Date(now);
  if (!Number.isFinite(reference.getTime())) throw new Error("Invalid demo reference date");
  const documents = [];
  const at = (days, minutes = 0) => new Date(reference.getTime() - days * DAY + minutes * 60_000);
  const add = (path, data) => {
    const record = { ...data, isDemo: true, demoDataset: "segreclaim-local-v1" };
    documents.push({ path, data: record });
    return record;
  };
  const machines = [
    ["demo-mumbai-andheri", "Andheri Community Centre, Mumbai", "online"],
    ["demo-pune-aundh", "Aundh Community Park, Pune", "full"],
    ["demo-bengaluru-indiranagar", "Indiranagar Metro, Bengaluru", "maintenance"],
  ].map(([machineId, locationName, status], i) => add(`machines/${machineId}`, {
    machineId, locationName, status, lastHeartbeat: at(0, -i),
    fillLevels: { plastic: 34 + i * 29, glass: 21 + i * 16, aluminium: 18 + i * 12, paper: 45 + i * 14 },
    firmwareVersion: "1.2.0",
  }));
  const pointRates = { plastic: 0.1, glass: 0.02, aluminium: 0.15, paper: 0.03, metal: 0.08, general: 0 };
  for (const [wasteType, pointsPerGram] of Object.entries(pointRates)) {
    add(`pointRules/${wasteType}`, { wasteType, pointsPerGram, multiplier: 1, active: true });
  }
  const partners = [
    ["demo-green-cup", "Green Cup", "A neighbourhood cafe rewarding everyday recycling."],
    ["demo-earth-basket", "Earth Basket", "Refill essentials and reusable household goods."],
    ["demo-pedal-studio", "Pedal Studio", "A community cycling workshop."],
  ].map(([partnerId, name, description], i) => add(`partners/${partnerId}`, {
    partnerId, name, slug: partnerId, description, logoUrl: "", active: true, sortOrder: i,
    contactEmail: `${partnerId}@example.test`, createdAt: at(100), updatedAt: at(2),
  }));
  const rewards = [
    [0, "demo-filter-coffee", "Filter coffee", "One freshly brewed filter coffee", 60, 60],
    [0, "demo-cafe-saving", "Cafe savings", "Save INR 50 on your next cafe visit", 120, 50],
    [1, "demo-refill-saving", "Refill savings", "Save INR 75 on refill essentials", 160, 75],
    [2, "demo-cycle-check", "Cycle health check", "A basic bicycle safety check", 90, 90],
  ].map(([partnerIndex, rewardId, title, description, pointsCost, rupeeValue], i) => {
    const partner = partners[partnerIndex];
    return add(`partners/${partner.partnerId}/rewards/${rewardId}`, {
      rewardId, partnerId: partner.partnerId, title, description, brandName: partner.name,
      pointsCost, rupeeValue, stockMode: "limited", totalStock: i === 3 ? 7 : 50,
      remaining: i === 3 ? 7 : 50, claimLimitMode: "limited", maxClaimsPerUser: 3,
      active: true, featured: i < 2, sortOrder: i, voucherValidityDays: 30,
      redemptionInstructions: "Present the voucher at the partner counter.",
      createdAt: at(90), updatedAt: at(1),
    });
  });

  NAMES.forEach((displayName, userIndex) => {
    const uid = `demo-user-${String(userIndex + 1).padStart(2, "0")}`;
    const user = add(`users/${uid}`, {
      uid, displayName, email: `${displayName.toLowerCase().replaceAll(" ", ".")}@example.test`,
      // Intentionally non-routable: never contact a real person from demo data.
      phone: `+91000000${String(userIndex + 1).padStart(4, "0")}`, role: "user",
      totalPoints: 0, lifetimePoints: 0, currentStreak: 0, bestStreak: 0,
      lastActivityDate: null, createdAt: at(75 - userIndex * 2),
    });
    if (userIndex === NAMES.length - 1) return; // A newly registered user with no history.
    const count = 7 + userIndex % 5;
    const lastDepositDaysAgo = userIndex % 3 + (userIndex % 4 === 0 ? 0 : 1);
    for (let n = 0; n < count; n++) {
      const transactionId = `demo-tx-${userIndex + 1}-${n + 1}`;
      const createdAt = at(45 - n * (45 - lastDepositDaysAgo) / (count - 1), -userIndex * 37);
      const machine = machines[(userIndex + n) % machines.length];
      const wasteType = ["plastic", "glass", "aluminium", "paper", "metal"][(n + userIndex) % 5];
      const weightGrams = 350 + ((userIndex * 79 + n * 137) % 1400);
      const items = [
        { wasteType, weightGrams, confidenceScore: 0.93 + (n % 6) / 100,
          pointsEarned: Math.floor(weightGrams * pointRates[wasteType]), imageUrl: "" },
      ];
      const totalPoints = items.reduce((sum, item) => sum + item.pointsEarned, 0);
      const tx = {
        transactionId, userId: uid, machineId: machine.machineId, items,
        totalPoints, totalWeightGrams: weightGrams, pointsCalculated: true, createdAt,
      };
      if (n % 2 === 0) {
        const tokenId = `demo-token-${userIndex + 1}-${n + 1}`;
        tx.tokenId = tokenId;
        add(`redemptionTokens/${tokenId}`, {
          tokenId, kioskId: machine.machineId, machineId: machine.machineId,
          credits: totalPoints, category: wasteType, weightGrams, userId: uid,
          status: "redeemed", createdAt, expiresAt: new Date(+createdAt + 300_000),
          claimedAt: new Date(+createdAt + 30_000), redeemedAt: new Date(+createdAt + 45_000),
        });
      } else {
        tx.sessionId = `demo-session-${userIndex + 1}-${n + 1}`;
        add(`sessions/${tx.sessionId}`, {
          sessionId: tx.sessionId, machineId: machine.machineId, userId: uid,
          status: "completed", createdAt, expiresAt: new Date(+createdAt + 300_000),
        });
      }
      add(`transactions/${transactionId}`, tx);
      user.totalPoints += totalPoints;
      user.lifetimePoints += totalPoints;
      user.lastActivityDate = createdAt;
    }
    user.bestStreak = 1;
    user.currentStreak = lastDepositDaysAgo <= 1 ? 1 : 0;
    // Every debit is supported by earned points, including historic expiry examples.
    const claimCount = 1 + userIndex % 3;
    for (let n = 0; n < claimCount; n++) {
      const reward = rewards[(userIndex + n) % rewards.length];
      if (user.totalPoints < reward.pointsCost) break;
      const voucherId = `demo-voucher-${userIndex + 1}-${n + 1}`;
      const claimId = `demo-claim-${userIndex + 1}-${n + 1}`;
      const claimedAt = at(6 - n * 2, -userIndex * 5);
      const status = ["active", "redeemed", "expired"][(userIndex + n) % 3];
      // Expired examples were claimed 35 days ago, after at least the first deposits.
      const actualClaimedAt = status === "expired" ? at(35, userIndex) : claimedAt;
      // Some early balances cannot fund a historic claim: use an active voucher instead.
      const earlyEarnings = documents.filter(({ path, data }) => path.startsWith("transactions/") &&
        data.userId === uid && data.createdAt <= actualClaimedAt)
        .reduce((sum, { data }) => sum + data.totalPoints, 0);
      const earlySpending = documents.filter(({ path, data }) => path.startsWith("vouchers/") &&
        data.userId === uid && data.createdAt <= actualClaimedAt)
        .reduce((sum, { data }) => sum + data.pointsSpent, 0);
      const finalStatus = status === "expired" && earlyEarnings - earlySpending < reward.pointsCost ? "active" : status;
      const effectiveClaimedAt = finalStatus === "active" ? claimedAt : actualClaimedAt;
      add(`vouchers/${voucherId}`, {
        voucherId, userId: uid, partnerId: reward.partnerId, rewardId: reward.rewardId,
        partnerName: reward.brandName, brandName: reward.brandName,
        code: `DEMO-${String(userIndex + 1).padStart(2, "0")}-${String(n + 1).padStart(4, "0")}`,
        description: reward.description, pointsSpent: reward.pointsCost, status: finalStatus,
        createdAt: effectiveClaimedAt, expiresAt: new Date(+effectiveClaimedAt + 30 * DAY),
        ...(finalStatus === "redeemed" ? { redeemedAt: new Date(+effectiveClaimedAt + DAY) } : {}),
      });
      add(`rewardClaims/${claimId}`, {
        claimId, rewardId: reward.rewardId, partnerId: reward.partnerId, userId: uid,
        voucherId, claimedAt: effectiveClaimedAt,
      });
      const counterPath = `userRewardCounters/${uid}_${reward.rewardId}`;
      const existing = documents.find(({ path }) => path === counterPath);
      if (existing) existing.data.count++;
      else add(counterPath, { userId: uid, rewardId: reward.rewardId, count: 1 });
      reward.remaining--;
      user.totalPoints -= reward.pointsCost;
    }
  });

  // Kiosk donations use the legacy schema currently written by the backend.
  machines.forEach((machine, i) => {
    const tokenId = `demo-donation-token-${i + 1}`;
    const createdAt = at(2 + i, -10);
    add(`redemptionTokens/${tokenId}`, {
      tokenId, kioskId: machine.machineId, machineId: machine.machineId,
      credits: 40 + i * 10, category: "plastic", weightGrams: 400 + i * 100,
      userId: null, status: "donated", createdAt,
      expiresAt: new Date(+createdAt + 300_000), donatedAt: new Date(+createdAt + 60_000),
    });
    add(`transactions/demo-donation-${i + 1}`, {
      userId: null, machineId: machine.machineId, kioskId: machine.machineId,
      weightGrams: 400 + i * 100, category: "plastic", credits: 40 + i * 10,
      type: "donation", timestamp: new Date(+createdAt + 60_000), pointsCalculated: true, tokenId,
    });
  });
  ["pending", "claimed", "expired"].forEach((status, i) => {
    const tokenId = `demo-open-token-${status}`;
    const createdAt = status === "expired" ? at(1) : at(0, -1);
    add(`redemptionTokens/${tokenId}`, {
      tokenId, kioskId: machines[0].machineId, machineId: machines[0].machineId,
      credits: 30, category: "plastic", weightGrams: 300,
      userId: status === "claimed" ? "demo-user-01" : null, status, createdAt,
      expiresAt: new Date(+createdAt + 300_000),
      ...(i === 1 ? { claimedAt: new Date(+createdAt + 20_000) } : {}),
    });
  });
  return documents;
}

export function summarizeDemoData(documents) {
  return documents.reduce((summary, { path }) => {
    const collection = path.includes("/rewards/") ? "rewards" : path.split("/")[0];
    summary[collection] = (summary[collection] ?? 0) + 1;
    return summary;
  }, {});
}
