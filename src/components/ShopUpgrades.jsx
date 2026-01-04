import React from 'react';
export function ShopUpgrades({
    mode, honor, setHonor, permanentLuck, setPermanentLuck,
    gems, setGems, shopLevel,
    dayDuration, setDayDuration, nightDuration, setNightDuration,
    hasCrafter, setHasCrafter, hasSeller, setHasSeller,
    gemMultiplier, setGemMultiplier,
    workerSlots, setWorkerSlots, customerSpawnMod, setCustomerSpawnMod,
    maxCustomers, setMaxCustomers, gatherSpeed, setGatherSpeed, startingHonor, setStartingHonor,
    bonusDamage, setBonusDamage, bonusMaxHP, setBonusMaxHP,
    coinDropBonus, setCoinDropBonus
}) {
    const LUCK_COST = 500 * Math.pow(2, (permanentLuck - 1) / 0.1);
    const DAY_COST = 1000 * Math.pow(1.5, (dayDuration - 120) / 30);
    const NIGHT_COST = 1000 * Math.pow(1.5, (nightDuration - 120) / 30);
    const SLOTS_COST = 5000 * Math.pow(3, workerSlots - 3);
    const SPAWN_COST = 10000 * Math.pow(2.5, (customerSpawnMod - 1) / 0.1);
    const DAMAGE_COST = 2000 * Math.pow(1.8, bonusDamage / 5);
    const HP_COST = 1500 * Math.pow(1.6, bonusMaxHP / 25);
    const COIN_BONUS_COST = 5000 * Math.pow(2, (coinDropBonus - 1) / 0.5);
    const buyLuck = () => {
        if (honor >= LUCK_COST) {
            setHonor(prev => prev - Math.floor(LUCK_COST));
            setPermanentLuck(prev => prev + 0.1);
        }
    };
    const buyDay = () => {
        if (honor >= DAY_COST) {
            setHonor(prev => prev - Math.floor(DAY_COST));
            setDayDuration(prev => prev + 30);
        }
    };
    const buyNight = () => {
        if (honor >= NIGHT_COST) {
            setHonor(prev => prev - Math.floor(NIGHT_COST));
            setNightDuration(prev => prev + 30);
        }
    };
    const buySlots = () => {
        if (honor >= SLOTS_COST) {
            setHonor(prev => prev - Math.floor(SLOTS_COST));
            setWorkerSlots(prev => prev + 1);
        }
    };
    const buySpawn = () => {
        if (honor >= SPAWN_COST) {
            setHonor(prev => prev - Math.floor(SPAWN_COST));
            setCustomerSpawnMod(prev => prev + 0.1);
        }
    };
    const buyDamage = () => {
        if (honor >= DAMAGE_COST) {
            setHonor(prev => prev - Math.floor(DAMAGE_COST));
            setBonusDamage(prev => prev + 5);
        }
    };
    const buyHP = () => {
        if (honor >= HP_COST) {
            setHonor(prev => prev - Math.floor(HP_COST));
            setBonusMaxHP(prev => prev + 25);
        }
    };
    const buyCoinBonus = () => {
        if (honor >= COIN_BONUS_COST) {
            setHonor(prev => prev - Math.floor(COIN_BONUS_COST));
            setCoinDropBonus(prev => prev + 0.5);
        }
    };
    const buyCrafter = () => {
        if (gems >= 500 && !hasCrafter) {
            setGems(prev => prev - 500);
            setHasCrafter(true);
        }
    };
    const buySeller = () => {
        if (gems >= 500 && !hasSeller) {
            setGems(prev => prev - 500);
            setHasSeller(true);
        }
    };
    const buyGemMult = () => {
        if (gems >= 250) {
            setGems(prev => prev - 250);
            setGemMultiplier(prev => prev + 0.5);
        }
    };
    const buyLuckEssence = () => {
        if (gems >= 100) {
            setGems(prev => prev - 100);
            setPermanentLuck(prev => prev + 0.05);
        }
    };
    const buyMaxCustomers = () => {
        if (gems >= 300) {
            setGems(prev => prev - 300);
            setMaxCustomers(prev => prev + 2);
        }
    };
    const buyGatherSpeed = () => {
        if (gems >= 400) {
            setGems(prev => prev - 400);
            setGatherSpeed(prev => prev + 0.2);
        }
    };
    const buyStartingHonor = () => {
        if (gems >= 200) {
            setGems(prev => prev - 200);
            setStartingHonor(prev => prev + 1000);
        }
    };
    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ color: '#ffd700', marginBottom: '15px', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1.5px' }}>HONOR UPGRADES</h3>
            <div className="inventory-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <ShopItem title="LUCK UPGRADE" icon="🍀" desc="Permanent recruit luck boost." value={`${permanentLuck.toFixed(2)}x`} cost={LUCK_COST} currency="HONOR" onBuy={buyLuck} afford={honor >= LUCK_COST} />
                <ShopItem title="DAY DURATION" icon="☀️" desc="+30s Day duration." value={`${dayDuration}s`} cost={DAY_COST} currency="HONOR" onBuy={buyDay} afford={honor >= DAY_COST} />
                <ShopItem title="NIGHT DURATION" icon="🌙" desc="+30s Night duration." value={`${nightDuration}s`} cost={NIGHT_COST} currency="HONOR" onBuy={buyNight} afford={honor >= NIGHT_COST} />
                <ShopItem
                    title="DROP MORE COINS"
                    icon="🪙"
                    desc="+50% Coin drops from monsters."
                    value={`${coinDropBonus.toFixed(1)}x`}
                    cost={COIN_BONUS_COST}
                    currency="HONOR"
                    onBuy={buyCoinBonus}
                    afford={honor >= COIN_BONUS_COST}
                />
                {}
                <ShopItem
                    title="WORKER SLOTS"
                    icon="👥"
                    desc="+1 Slot per worker type."
                    value={`${workerSlots} slots`}
                    cost={SLOTS_COST}
                    currency="HONOR"
                    onBuy={buySlots}
                    afford={honor >= SLOTS_COST}
                    locked={shopLevel < 2}
                    lockText="Lvl 2 Shop"
                />
                <ShopItem
                    title="CUSTOMER FLOW"
                    icon="🤝"
                    desc="+10% Customer spawn rate."
                    value={`${Math.round(customerSpawnMod * 100)}%`}
                    cost={SPAWN_COST}
                    currency="HONOR"
                    onBuy={buySpawn}
                    afford={honor >= SPAWN_COST}
                    locked={shopLevel < 4}
                    lockText="Lvl 4 Shop"
                />
            </div>
            <h3 style={{ color: '#ef4444', marginTop: '30px', marginBottom: '15px', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1.5px' }}>⚔️ COMBAT UPGRADES</h3>
            <div className="inventory-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <ShopItem
                    title="ATTACK POWER"
                    icon="⚔️"
                    desc="+5 Base damage in World combat."
                    value={`+${bonusDamage} DMG`}
                    cost={DAMAGE_COST}
                    currency="HONOR"
                    onBuy={buyDamage}
                    afford={honor >= DAMAGE_COST}
                />
                <ShopItem
                    title="MAX HEALTH"
                    icon="❤️"
                    desc="+25 Max HP in World combat."
                    value={`+${bonusMaxHP} HP`}
                    cost={HP_COST}
                    currency="HONOR"
                    onBuy={buyHP}
                    afford={honor >= HP_COST}
                />
            </div>
            <h3 style={{ color: '#ff69b4', marginTop: '30px', marginBottom: '15px', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1.5px' }}>GEM UPGRADES</h3>
            <div className="inventory-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <ShopItem title="AUTO-CRAFTER" icon="⚒️" desc="Automatically crafts requested items if materials exist." cost={500} currency="GEMS" owned={hasCrafter} onBuy={buyCrafter} afford={gems >= 500} />
                <ShopItem title="AUTO-SELLER" icon="💰" desc="Automatically sells items to customers if they are in stock." cost={500} currency="GEMS" owned={hasSeller} onBuy={buySeller} afford={gems >= 500} />
                <ShopItem title="GEM MULTIPLIER" icon="💎" desc={`Increases Gems from rebirth. Current: ${gemMultiplier.toFixed(1)}x`} cost={250} currency="GEMS" onBuy={buyGemMult} afford={gems >= 250} />
                <ShopItem title="LUCK ESSENCE" icon="🧪" desc="+5% Permanent Luck boost." cost={100} currency="GEMS" onBuy={buyLuckEssence} afford={gems >= 100} />
                <ShopItem title="MORE CLIENTS" icon="👥" desc="+2 Max customers at once." value={`${maxCustomers} max`} cost={300} currency="GEMS" onBuy={buyMaxCustomers} afford={gems >= 300} />
                <ShopItem title="GATHER SPEED" icon="⚡" desc="+20% faster resource gathering." value={`${gatherSpeed.toFixed(1)}x`} cost={400} currency="GEMS" onBuy={buyGatherSpeed} afford={gems >= 400} />
                <ShopItem title="STARTING HONOR" icon="🔮" desc="+1000 Honor on rebirth." value={`+${startingHonor}`} cost={200} currency="GEMS" onBuy={buyStartingHonor} afford={gems >= 200} />
            </div>
        </div>
    );
}
function ShopItem({ title, icon, desc, value, cost, currency, onBuy, afford, owned, locked, lockText }) {
    const isGems = currency === 'GEMS';
    const canAfford = afford || (isGems && !owned); 
    return (
        <div className={`inv-item ${locked ? 'locked' : ''}`} style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: locked ? '#111' : '#252525',
            position: 'relative',
            opacity: locked ? 0.6 : 1
        }}>
            {locked && (
                <div className="lock-overlay" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    background: 'rgba(0,0,0,0.4)', color: '#ef4444', fontWeight: '900',
                    fontSize: '0.8rem', textTransform: 'uppercase'
                }}>
                    🔒 {lockText}
                </div>
            )}
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{icon}</div>
            <div style={{ fontWeight: '900', fontSize: '0.7rem', color: isGems ? '#f472b6' : '#fbbf24' }}>{title}</div>
            {value && <div style={{ fontSize: '1.2rem', fontWeight: '900', margin: '5px 0' }}>{value}</div>}
            <div style={{ fontSize: '0.6rem', opacity: 0.5, textAlign: 'center', marginBottom: '15px', height: '30px' }}>{desc}</div>
            <button
                className="rbx-btn"
                style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.8rem',
                    background: owned ? '#444' : (afford ? (isGems ? '#ec4899' : '#10b981') : '#333'),
                    cursor: (afford && !owned && !locked) ? 'pointer' : 'not-allowed',
                    opacity: (afford && !owned && !locked) ? 1 : 0.5
                }}
                disabled={!afford || owned || locked}
                onClick={onBuy}
            >
                {owned ? 'OWNED' : `${Math.floor(cost).toLocaleString()} ${isGems ? '💎' : '🔮'}`}
            </button>
        </div>
    );
}

