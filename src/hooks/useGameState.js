import { useState, useEffect, useRef, useCallback } from 'react';
import { rollWorker, RARITIES, CRAFTED_ITEMS, MATERIALS, GATHER_TABLE } from '../utils/workerRNG';

export const UI_PHASES = {
    DAY: 'day',
    NIGHT: 'night',
};

const BASE_PHASE_DURATION = 120; // 2 minutes base
const GATHER_INTERVAL = 3000;
const CUSTOMER_INTERVAL = 8000; // New customer every 8 seconds base

export function useGameState() {
    const [honor, setHonor] = useState(0);
    const [phase, setPhase] = useState(UI_PHASES.DAY);
    const [timeLeft, setTimeLeft] = useState(BASE_PHASE_DURATION);
    const [dayCount, setDayCount] = useState(1);
    const [lastRecruit, setLastRecruit] = useState(null);

    const [autoRoll, setAutoRoll] = useState(false);
    const [fastRoll, setFastRoll] = useState(false);
    const [luckBoost, setLuckBoost] = useState(false);
    const [isRolling, setIsRolling] = useState(false);

    const [workers, setWorkers] = useState([]);
    const [equippedWorkers, setEquippedWorkers] = useState({
        Gatherer: [], Salesman: [], Researcher: [], Smith: [], Oracle: [], Mechanic: [], Chef: [], Guard: []
    });

    const [inventory, setInventory] = useState(() => {
        const initial = MATERIALS.reduce((acc, mat) => {
            acc[mat.id] = 0;
            return acc;
        }, {});
        return { ...initial, crafted: {} };
    });

    const [customers, setCustomers] = useState([]);

    // DISCOVERY TRACKING - persists even when deleted
    const [discoveredMaterials, setDiscoveredMaterials] = useState(new Set());
    const [discoveredCrafted, setDiscoveredCrafted] = useState(new Set());
    const [discoveredWorkers, setDiscoveredWorkers] = useState(new Set()); // Format: "rarityKey-type-variantKey"

    const [permanentLuck, setPermanentLuck] = useState(1.0);
    const [autoDeleteRarities, setAutoDeleteRarities] = useState([]);
    const [masterVolume, setMasterVolume] = useState(0.5);
    const [rebirthCount, setRebirthCount] = useState(0);

    // GEM & SHOP SYSTEM
    const [gems, setGems] = useState(0);
    const [shopLevel, setShopLevel] = useState(1);
    const [dayDuration, setDayDuration] = useState(BASE_PHASE_DURATION);
    const [nightDuration, setNightDuration] = useState(BASE_PHASE_DURATION);
    const [hasCrafter, setHasCrafter] = useState(false);
    const [hasSeller, setHasSeller] = useState(false);
    const [gemMultiplier, setGemMultiplier] = useState(1.0);
    const [workerSlots, setWorkerSlots] = useState(3);
    const [customerSpawnMod, setCustomerSpawnMod] = useState(1.0);
    const [maxCustomers, setMaxCustomers] = useState(8);
    const [gatherSpeed, setGatherSpeed] = useState(1.0); // multiplier for gather interval
    const [startingHonor, setStartingHonor] = useState(0);

    // WORLD & RELIC SYSTEM
    const [relics, setRelics] = useState([]);
    const [worldCooldown, setWorldCooldown] = useState(0);

    // COMBAT STATS
    const [bonusDamage, setBonusDamage] = useState(0); // flat bonus damage
    const [bonusMaxHP, setBonusMaxHP] = useState(0); // flat bonus max HP

    const toggleAutoDelete = useCallback((rarityKey) => {
        setAutoDeleteRarities(prev => {
            const isAddingToAutoDelete = !prev.includes(rarityKey);
            if (isAddingToAutoDelete) {
                // Purge existing unequipped workers of this rarity
                setWorkers(currentWorkers => {
                    const equippedIds = Object.values(equippedWorkers).flat().map(w => w.id);
                    return currentWorkers.filter(w =>
                        w.rarityKey !== rarityKey || equippedIds.includes(w.id)
                    );
                });
                return [...prev, rarityKey];
            } else {
                return prev.filter(r => r !== rarityKey);
            }
        });
    }, [equippedWorkers]);

    useEffect(() => {
        let timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    const nextPhase = phase === UI_PHASES.DAY ? UI_PHASES.NIGHT : UI_PHASES.DAY;

                    // NIGHT TRANSITION PENALTY - lose 20% honor per unfulfilled customer
                    if (nextPhase === UI_PHASES.NIGHT && customers.length > 0) {
                        setHonor(currentHonor => {
                            const penaltyPerClient = Math.floor(currentHonor * 0.2);
                            const totalPenalty = penaltyPerClient * customers.length;
                            return Math.max(0, currentHonor - totalPenalty);
                        });
                        setCustomers([]);
                    }

                    // Decrement world cooldown on new day
                    if (nextPhase === UI_PHASES.DAY && worldCooldown > 0) {
                        setWorldCooldown(prev => Math.max(0, prev - 1));
                    }

                    setPhase(nextPhase);
                    if (nextPhase === UI_PHASES.DAY) setDayCount(d => d + 1);
                    return nextPhase === UI_PHASES.DAY ? dayDuration : nightDuration;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, dayDuration, nightDuration, customers]);

    const performRecruitRoll = useCallback(() => {
        if (isRolling) return;
        setIsRolling(true);
        const rollTime = fastRoll ? 160 : 800; // 800ms is half of sound (1608ms), fast is 5x faster
        setTimeout(() => {
            let currentLuck = luckBoost ? permanentLuck : 1.0;
            
            // Apply luck boost relic
            const luckRelic = relics.find(r => r.effect === 'luck_boost');
            if (luckRelic) {
                currentLuck *= (1 + luckRelic.value);
            }

            // Check for double roll relic
            const doubleRollRelic = relics.find(r => r.effect === 'double_roll');
            const rollCount = doubleRollRelic ? 2 : 1;

            for (let i = 0; i < rollCount; i++) {
                const worker = rollWorker(currentLuck);

                // Auto-delete logic: check if rolled rarity is in the delete list
                // BUT: always keep variant workers regardless of rarity
                const isVariant = worker.variantKey && worker.variantKey !== 'NORMAL';
                if (!autoDeleteRarities.includes(worker.rarityKey) || isVariant) {
                    setWorkers(prev => [...prev, worker]);
                }

                // Always track discovered workers, even if auto-deleted
                const workerKey = `${worker.rarityKey}-${worker.type}-${worker.variantKey || 'NORMAL'}`;
                setDiscoveredWorkers(prev => {
                    const next = new Set(prev);
                    next.add(workerKey);
                    return next;
                });

                if (i === rollCount - 1) {
                    setLastRecruit(worker);
                }
            }

            setIsRolling(false);
        }, rollTime);
    }, [isRolling, fastRoll, luckBoost, permanentLuck, autoDeleteRarities, relics]);

    useEffect(() => {
        if (autoRoll && !isRolling) performRecruitRoll();
    }, [autoRoll, isRolling, performRecruitRoll]);

    const equipBest = useCallback(() => {
        const types = ['Gatherer', 'Salesman', 'Researcher', 'Smith', 'Oracle', 'Mechanic', 'Chef', 'Guard'];
        const newEquipped = { Gatherer: [], Salesman: [], Researcher: [], Smith: [], Oracle: [], Mechanic: [], Chef: [], Guard: [] };
        const rWeights = { MYTHIC: 6, LEGENDARY: 5, EPIC: 4, RARE: 3, UNCOMMON: 2, COMMON: 1 };
        types.forEach(type => {
            newEquipped[type] = workers.filter(w => w.type === type).sort((a, b) => rWeights[b.rarityKey] - rWeights[a.rarityKey]).slice(0, workerSlots);
        });
        setEquippedWorkers(newEquipped);
    }, [workers]);

    const [gatherEvents, setGatherEvents] = useState([]);

    // GATHERING LOGIC (NO PASSIVE HONOR)
    useEffect(() => {
        const gatherInterval = setInterval(() => {
            let matsFound = {};
            const newEvents = [];

            Object.keys(equippedWorkers).forEach(type => {
                equippedWorkers[type].forEach(w => {
                    // Rarity multipliers for gathering
                    const rarityMultipliers = {
                        COMMON: { chance: 1.0, amount: 1 },
                        UNCOMMON: { chance: 1.5, amount: 1 },
                        RARE: { chance: 2.0, amount: 2 },
                        EPIC: { chance: 3.0, amount: 3 },
                        LEGENDARY: { chance: 5.0, amount: 5 },
                        MYTHIC: { chance: 10.0, amount: 10 }
                    };
                    const multiplier = rarityMultipliers[w.rarityKey] || rarityMultipliers.COMMON;

                    // Apply gather boost relic
                    let gatherMultiplier = { ...multiplier };
                    const gatherRelic = relics.find(r => r.effect === 'gather_boost');
                    if (gatherRelic) {
                        gatherMultiplier.chance *= (1 + gatherRelic.value);
                        gatherMultiplier.amount = Math.floor(gatherMultiplier.amount * (1 + gatherRelic.value));
                    }

                    const tryGather = (matId, baseChance, idFallback = null) => {
                        const boostedChance = Math.min(0.99, baseChance * gatherMultiplier.chance);
                        if (Math.random() < boostedChance) {
                            const amount = gatherMultiplier.amount;
                            const finalId = MATERIALS.find(m => m.id === matId) ? matId : idFallback;
                            if (!finalId) return;

                            matsFound[finalId] = (matsFound[finalId] || 0) + amount;
                            newEvents.push({
                                eventId: `gather-${Date.now()}-${Math.random()}`,
                                workerId: w.id,
                                matId: finalId,
                                amount: amount,
                                chance: baseChance
                            });
                        }
                    };

                    const lootPool = GATHER_TABLE[type] || [];
                    lootPool.forEach(loot => {
                        tryGather(loot.id, loot.chance, loot.id_fallback);
                    });
                });
            });

            if (Object.keys(matsFound).length > 0) {
                setInventory(prev => {
                    let updated = { ...prev };
                    Object.keys(matsFound).forEach(k => {
                        updated[k] = (updated[k] || 0) + matsFound[k];
                    });
                    return updated;
                });
                // Track discovered materials
                setDiscoveredMaterials(prev => {
                    const next = new Set(prev);
                    Object.keys(matsFound).forEach(k => next.add(k));
                    return next;
                });
                setGatherEvents(prev => [...prev.slice(-30), ...newEvents]);
            }
        }, GATHER_INTERVAL / gatherSpeed);
        return () => clearInterval(gatherInterval);
    }, [equippedWorkers, phase, gatherSpeed, relics]);

    // CUSTOMER SYSTEM
    useEffect(() => {
        const custTimer = setInterval(() => {
            if (phase === UI_PHASES.NIGHT) return;

            const maxClients = Math.min(maxCustomers, dayCount <= 4 ? 3 : maxCustomers);
            if (customers.length >= maxClients) return;

            const salesmanPower = equippedWorkers.Salesman.reduce((acc, w) => {
                const p = { COMMON: 1, UNCOMMON: 2, RARE: 4, EPIC: 10, LEGENDARY: 25, MYTHIC: 100 }[w.rarityKey] || 1;
                return acc + p;
            }, 0);

            // Chance to spawn depends on salesman power and mod
            if (Math.random() < (0.3 + (salesmanPower * 0.05)) * customerSpawnMod) {
                // Filter items based on day count - only BASIC tier items during first 5 days
                const availableItems = dayCount <= 5 
                    ? CRAFTED_ITEMS.filter(item => item.tier === 'BASIC')
                    : CRAFTED_ITEMS;
                
                const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                const tierMultipliers = { BASIC: 1, INTERMEDIATE: 5, ADVANCED: 25, LEGENDARY: 500, MYTHIC: 10000 };
                const tierMult = tierMultipliers[randomItem.tier] || 1;
                const baseReward = 50 + (Object.values(randomItem.recipe).reduce((a, b) => a + b, 0) * 20);
                const reward = baseReward * tierMult;

                const names = ["Cursed Collector", "Void Merchant", "Soul Seeker", "Dark Noble", "Grave Robber", "Lost Spirit"];
                const newCust = {
                    id: Date.now(),
                    name: names[Math.floor(Math.random() * names.length)] + " #" + (Math.floor(Math.random() * 900) + 100),
                    request: randomItem,
                    reward: Math.floor(reward * (1 + salesmanPower * 0.1))
                };
                setCustomers(prev => [...prev, newCust]);
            }
        }, CUSTOMER_INTERVAL);
        return () => clearInterval(custTimer);
    }, [customers, equippedWorkers.Salesman, phase, dayCount]);

    const sellToCustomer = useCallback((custId) => {
        const cust = customers.find(c => c.id === custId);
        if (!cust) return false;

        const itemCount = inventory.crafted[cust.request.id] || 0;
        if (itemCount > 0) {
            const salesmanPower = equippedWorkers.Salesman.reduce((acc, w) => {
                const p = { COMMON: 1, UNCOMMON: 2, RARE: 4, EPIC: 10, LEGENDARY: 25, MYTHIC: 100 }[w.rarityKey] || 1;
                return acc + p;
            }, 0);
            let bonusMultiplier = 1 + (salesmanPower * 0.1);

            // Apply honor boost relic
            const honorRelic = relics.find(r => r.effect === 'honor_boost');
            if (honorRelic) {
                bonusMultiplier *= (1 + honorRelic.value);
            }

            setInventory(prev => {
                const next = { ...prev, crafted: { ...prev.crafted } };
                next.crafted[cust.request.id]--;
                return next;
            });
            setHonor(prev => prev + Math.floor(cust.reward * bonusMultiplier));
            setCustomers(prev => prev.filter(c => c.id !== custId));
            return true;
        }
        return false;
    }, [customers, inventory, equippedWorkers.Salesman, relics]);

    const craftItem = useCallback((item, quantity = 1) => {
        const canCraft = Object.entries(item.recipe).every(([matId, count]) => (inventory[matId] || 0) >= (count * quantity));
        if (canCraft) {
            setInventory(prev => {
                const next = { ...prev, crafted: { ...prev.crafted } };
                Object.entries(item.recipe).forEach(([matId, count]) => next[matId] -= (count * quantity));
                next.crafted[item.id] = (next.crafted[item.id] || 0) + quantity;
                return next;
            });
            // Track discovered crafted items
            setDiscoveredCrafted(prev => {
                const next = new Set(prev);
                next.add(item.id);
                return next;
            });
            return true;
        }
        return false;
    }, [inventory]);

    // REBIRTH SYSTEM
    const canRebirth = honor >= 10000 && dayCount >= 10;

    const performRebirth = useCallback(() => {
        if (!canRebirth) return false;

        const gemReward = Math.floor(100 * gemMultiplier);
        setGems(prev => prev + gemReward);
        setPermanentLuck(prev => prev + 0.1);

        const nextRebirthCount = rebirthCount + 1;
        if (nextRebirthCount % 2 === 0) {
            setShopLevel(prev => prev + 1);
        }

        setHonor(startingHonor);
        setPhase(UI_PHASES.DAY);
        setTimeLeft(dayDuration);
        setDayCount(1);
        setWorkers([]);
        setEquippedWorkers({ Gatherer: [], Salesman: [], Researcher: [], Smith: [], Oracle: [], Mechanic: [], Chef: [], Guard: [] });
        setInventory(() => {
            const initial = MATERIALS.reduce((acc, mat) => { acc[mat.id] = 0; return acc; }, {});
            return { ...initial, crafted: {} };
        });
        setCustomers([]);
        setLastRecruit(null);
        setGatherEvents([]);
        setRebirthCount(nextRebirthCount);
        return true;
    }, [canRebirth, gemMultiplier, rebirthCount, dayDuration, startingHonor]);

    // AUTO-WORKERS
    useEffect(() => {
        if (!hasCrafter && !hasSeller) return;
        const interval = setInterval(() => {
            if (customers.length === 0) return;
            if (hasCrafter) {
                for (const cust of customers) {
                    if ((inventory.crafted[cust.request.id] || 0) < 1) {
                        if (craftItem(cust.request)) break;
                    }
                }
            }
            if (hasSeller) {
                for (const cust of customers) {
                    if ((inventory.crafted[cust.request.id] || 0) >= 1) {
                        sellToCustomer(cust.id);
                        break;
                    }
                }
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [hasCrafter, hasSeller, customers, inventory, craftItem, sellToCustomer]);

    return {
        honor, setHonor, phase, timeLeft, dayCount, lastRecruit, isRolling, performRecruitRoll,
        autoRoll, setAutoRoll, fastRoll, setFastRoll, luckBoost, setLuckBoost,
        inventory, workers, setWorkers, equippedWorkers, equipBest, craftItem,
        permanentLuck, setPermanentLuck,
        customers, sellToCustomer, gatherEvents,
        autoDeleteRarities, toggleAutoDelete,
        masterVolume, setMasterVolume,
        rebirthCount, canRebirth, performRebirth,
        gems, setGems, shopLevel, setShopLevel,
        dayDuration, setDayDuration, nightDuration, setNightDuration,
        hasCrafter, setHasCrafter, hasSeller, setHasSeller, gemMultiplier, setGemMultiplier,
        workerSlots, setWorkerSlots, customerSpawnMod, setCustomerSpawnMod,
        discoveredMaterials, discoveredCrafted, discoveredWorkers,
        maxCustomers, setMaxCustomers, gatherSpeed, setGatherSpeed, startingHonor, setStartingHonor,
        relics, setRelics, worldCooldown, setWorldCooldown,
        bonusDamage, setBonusDamage, bonusMaxHP, setBonusMaxHP
    };
}
