import { WorkerHub } from './components/WorkerHub'
import { ShopUpgrades } from './components/ShopUpgrades'
import { CustomerList } from './components/CustomerList'
import { CraftingHub } from './components/CraftingHub'
import { World } from './components/World'
import { useGameState, UI_PHASES } from './hooks/useGameState'
import { MATERIALS, CRAFTED_ITEMS, RARITIES, GATHER_TABLE, WORKER_TYPES, WORKER_VARIANTS } from './utils/workerRNG'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './App.css'

import { BackgroundWorkers } from './components/BackgroundWorkers';

function App() {
    const {
        honor, setHonor, phase, timeLeft, dayCount, lastRecruit, isRolling, performRecruitRoll,
        autoRoll, setAutoRoll, fastRoll, setFastRoll, luckBoost, setLuckBoost,
        inventory, setInventory, workers, setWorkers, equippedWorkers, equipBest, craftItem,
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
    } = useGameState();

    const [mainTab, setMainTab] = useState('SHOP');
    const [activeTab, setActiveTab] = useState(null);
    const [invSubTab, setInvSubTab] = useState('materials');
    const [indexSubTab, setIndexSubTab] = useState('materials');
    const [workerVariantTab, setWorkerVariantTab] = useState('NORMAL');
    const [epicReveal, setEpicReveal] = useState(null); // null, 'LEGENDARY', or 'MYTHIC'
    const [variantReveal, setVariantReveal] = useState(null); // null or variant object
    const [shuffleText, setShuffleText] = useState("");

    const rollAudio = useRef(new Audio('/sounds/castanet-roll-120bpm-83002.mp3'));

    useEffect(() => {
        let interval;
        if (isRolling) {
            // Only show animation text if NOT fast rolling
            if (!fastRoll) {
                const names = ["SHUFFLING...", "ROLLING...", "CURSING...", "VOID CALLING...", "RECRUITING..."];
                interval = setInterval(() => {
                    setShuffleText(names[Math.floor(Math.random() * names.length)]);
                }, 80);
            }

            // Audio Logic
            rollAudio.current.currentTime = 0;
            rollAudio.current.playbackRate = fastRoll ? 5.0 : 1.0; // 5x speed for fast roll
            rollAudio.current.loop = false; // Don't loop, play once to match duration
            rollAudio.current.play().catch(e => console.log("Audio play blocked"));
        } else {
            setShuffleText("");
            rollAudio.current.pause();
            rollAudio.current.currentTime = 0;
        }
        return () => {
            clearInterval(interval);
            rollAudio.current.pause();
        };
    }, [isRolling, fastRoll]);

    useEffect(() => {
        if (rollAudio.current) {
            rollAudio.current.volume = masterVolume;
        }
    }, [masterVolume]);

    useEffect(() => {
        if (lastRecruit && (lastRecruit.rarityKey === 'MYTHIC' || lastRecruit.rarityKey === 'LEGENDARY') && !isRolling) {
            setEpicReveal(lastRecruit.rarityKey);
            const timer = setTimeout(() => setEpicReveal(null), 3000);
            return () => {
                clearTimeout(timer);
                setEpicReveal(null);
            };
        } else if (isRolling) {
            setEpicReveal(null);
        }
    }, [lastRecruit, isRolling]);

    // Variant reveal animation (for non-Normal variants)
    useEffect(() => {
        if (lastRecruit && lastRecruit.variantKey && lastRecruit.variantKey !== 'NORMAL' && !isRolling) {
            setVariantReveal(lastRecruit);
            const timer = setTimeout(() => setVariantReveal(null), 2000);
            return () => {
                clearTimeout(timer);
                setVariantReveal(null);
            };
        } else if (isRolling) {
            setVariantReveal(null);
        }
    }, [lastRecruit, isRolling]);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const getInfo = useCallback((id, type) => {
        if (type === 'material') {
            const m = MATERIALS.find(mat => mat.id === id);
            if (!m) return null;
            const rarity = RARITIES[m.rarity];

            let totalChance = 0;
            Object.values(GATHER_TABLE).forEach(pool => {
                const loot = pool.find(l => l.id === id);
                if (loot) totalChance = Math.max(totalChance, loot.chance);
            });
            const chanceText = totalChance > 0 ? `1/${Math.round(1 / totalChance)}` : "Quest Only";

            return {
                name: m.name,
                rarity: rarity.name,
                color: rarity.color,
                chance: chanceText,
                desc: `A ${rarity.name.toLowerCase()} resource used in alchemy.`
            };
        } else {
            const i = CRAFTED_ITEMS.find(item => item.id === id);
            return i ? { name: i.name, rarity: "CRAFTED", color: "#3b82f6", desc: `Specialized tool or artifact.` } : null;
        }
    }, []);

    const getEmoji = useCallback((id, type = 'material') => {
        if (type === 'material') {
            return MATERIALS.find(m => m.id === id)?.emoji || '📦';
        }
        return CRAFTED_ITEMS.find(i => i.id === id)?.emoji || '⚔️';
    }, []);

    // Listen for switchToShop event from World component
    useEffect(() => {
        const handleSwitch = () => setMainTab('SHOP');
        window.addEventListener('switchToShop', handleSwitch);
        return () => window.removeEventListener('switchToShop', handleSwitch);
    }, []);

    return (
        <div className={`app-container ${phase} ${epicReveal ? 'screen-shake' : ''}`}>
            <BackgroundWorkers equippedWorkers={equippedWorkers} gatherEvents={gatherEvents} masterVolume={masterVolume} />

            {/* MAIN TAB NAVIGATION */}
            <div style={{
                position: 'fixed',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '20px',
                zIndex: 1000
            }}>
                <button 
                    className="rbx-btn"
                    onClick={() => setMainTab('SHOP')}
                    style={{
                        padding: '15px 40px',
                        fontSize: '1.2rem',
                        fontWeight: '900',
                        background: mainTab === 'SHOP' ? '#3b82f6' : '#1a1a1a',
                        border: '2px solid ' + (mainTab === 'SHOP' ? '#3b82f6' : '#333'),
                        opacity: mainTab === 'SHOP' ? 1 : 0.5
                    }}
                >
                    SHOP
                </button>
                <button 
                    className="rbx-btn"
                    onClick={() => {
                        if (worldCooldown > 0) return; // Block if on cooldown
                        setMainTab('WORLD');
                    }}
                    style={{
                        padding: '15px 40px',
                        fontSize: '1.2rem',
                        fontWeight: '900',
                        background: mainTab === 'WORLD' ? '#3b82f6' : '#1a1a1a',
                        border: '2px solid ' + (mainTab === 'WORLD' ? '#3b82f6' : '#333'),
                        opacity: worldCooldown > 0 ? 0.3 : (mainTab === 'WORLD' ? 1 : 0.5),
                        cursor: worldCooldown > 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    {worldCooldown > 0 ? `WORLD (${worldCooldown}d)` : 'WORLD'}
                </button>
            </div>

            {/* LEGENDARY REVEAL */}
            {epicReveal === 'LEGENDARY' && (
                <div className="legendary-reveal-container">
                    <div className="legendary-sunburst" />
                    <div className="legendary-particles" />
                    <div className="legendary-reveal-text">LEGENDARY!</div>
                    <div className="legendary-subtitle">1 in 10,000</div>
                </div>
            )}

            {/* MYTHIC REVEAL */}
            {epicReveal === 'MYTHIC' && (
                <div className="mythic-reveal-container">
                    <div className="mythic-void-pulse" />
                    <div className="mythic-lightning" />
                    <div className="mythic-stars" />
                    <div className="mythic-reveal-text">MYTHIC!</div>
                    <div className="mythic-subtitle">1 in 100,000</div>
                </div>
            )}

            {/* VARIANT REVEAL (small banner) */}
            {variantReveal && (
                <div className={`variant-reveal-banner variant-${variantReveal.variantKey.toLowerCase()}`}>
                    <div className="variant-reveal-icon">{variantReveal.emoji}</div>
                    <div className="variant-reveal-info">
                        <div className="variant-reveal-label">✨ {variantReveal.variant.name} Variant!</div>
                        <div className="variant-reveal-name">{variantReveal.type} - {variantReveal.rarity.name}</div>
                    </div>
                </div>
            )}

            {/* HUD - Always visible */}
            <div className="hud">
                <div className="hud-left">
                    <div className="stat-pill"><span>HONOR</span><span style={{ color: '#fff' }}>{honor.toLocaleString()} 🔮</span></div>
                    <div className="stat-pill"><span>TIME</span><span style={{ color: '#60a5fa' }}>{formatTime(timeLeft)}</span></div>
                    <div className="stat-pill"><span>GEMS</span><span style={{ color: '#f472b6' }}>{gems.toLocaleString()} 💎</span></div>
                </div>
                <div className="hud-right">
                    <div className="stat-pill"><span>SHOP LVL</span><span style={{ color: '#fbbf24' }}>{shopLevel} 🏪</span></div>
                    <div className="stat-pill"><span>DAY</span><span style={{ color: '#f87171' }}>{dayCount}</span></div>
                    <div className="stat-pill">
                        <span style={{ color: phase === UI_PHASES.NIGHT ? '#a855f7' : '#fbbf24' }}>
                            {phase === UI_PHASES.NIGHT ? "NIGHT 🌙" : "DAY ☀️"}
                        </span>
                    </div>
                </div>
            </div>

            {/* LEFT MENU - Always visible */}
            <div className="side-menu left">
                <div className={`menu-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>📦</div>
                <div className={`menu-btn ${activeTab === 'workers' ? 'active' : ''}`} onClick={() => setActiveTab('workers')}>👷</div>
                <div className={`menu-btn ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')}>🛒</div>
            </div>

            {/* INDEX & SETTINGS (BOTTOM LEFT) - Always visible */}
            <div className={`menu-btn ${activeTab === 'index' ? 'active' : ''}`}
                style={{ position: 'fixed', bottom: '90px', left: '20px', zIndex: 100 }}
                onClick={() => setActiveTab('index')}>📚</div>
            <div className={`menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
                style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100 }}
                onClick={() => setActiveTab('settings')}>⚙️</div>

            {/* RIGHT MENU - Always visible */}
            <div className="side-menu right">
                <div className={`menu-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
                    <div style={{ position: 'relative' }}>
                        👤
                        {customers.length > 0 && <div className="notification-dot">{customers.length}</div>}
                    </div>
                </div>
                <div className={`menu-btn ${activeTab === 'crafting' ? 'active' : ''}`} onClick={() => setActiveTab('crafting')}>⚒️</div>
                <div className={`menu-btn rebirth-btn ${activeTab === 'rebirth' ? 'active' : ''} ${canRebirth ? 'can-rebirth' : ''}`}
                    onClick={() => setActiveTab('rebirth')}>
                    🔄
                    {rebirthCount > 0 && <div className="rebirth-count">{rebirthCount}</div>}
                </div>
            </div>

            {/* SHOP VIEW */}
            {mainTab === 'SHOP' && (
                <div className="roll-interface">
                    <main className="result-display">
                        {isRolling ? (
                            <div className="shuffling-text">{shuffleText}</div>
                        ) : lastRecruit ? (
                            <div key={lastRecruit.id} className="roll-anim">
                                <div className="aura-rarity" style={{ color: lastRecruit.rarity.color }}>{lastRecruit.rarity.name}</div>
                                <div className="aura-name" style={{ color: lastRecruit.rarity.color }}>
                                    {lastRecruit.type}
                                </div>
                                <div className="aura-chance" style={{ color: lastRecruit.rarity.color }}>{lastRecruit.chance}</div>
                            </div>
                        ) : (
                            <div style={{ opacity: 0.1, fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px' }}>READY</div>
                        )}
                    </main>

                    <button className={`roll-main-btn ${isRolling ? 'rolling' : ''}`} onClick={performRecruitRoll} disabled={isRolling}>
                        {isRolling ? '...' : 'RECRUIT'}
                    </button>
                    <div className="roll-status-row">
                        <div className={`status-toggle ${autoRoll ? 'active' : ''}`} onClick={() => setAutoRoll(!autoRoll)}>
                            <span>AUTO</span><div className="toggle-indicator indicator-auto" />
                        </div>
                        <div className={`status-toggle ${luckBoost ? 'active' : ''}`} onClick={() => setLuckBoost(!luckBoost)}>
                            <span>LUCK</span><div className="toggle-indicator indicator-luck" />
                        </div>
                        <div className={`status-toggle ${fastRoll ? 'active' : ''}`} onClick={() => setFastRoll(!fastRoll)}>
                            <span>FAST</span><div className="toggle-indicator indicator-fast" />
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {activeTab === 'workers' && (
                <div className="modal-overlay" onClick={() => setActiveTab(null)}>
                    <div className="modal-content rbx-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>WORKER HUB</h2>
                            <button className="rbx-btn close-btn" onClick={() => setActiveTab(null)}>✕</button>
                        </div>
                        <div className="modal-body-scrollable">
                            <WorkerHub
                                workers={workers}
                                equippedWorkers={equippedWorkers}
                                equipBest={equipBest}
                                autoDeleteRarities={autoDeleteRarities}
                                toggleAutoDelete={toggleAutoDelete}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'customers' && (
                <div className="modal-overlay" onClick={() => setActiveTab(null)}>
                    <div className="modal-content rbx-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>CLIENT LIST</h2>
                            <button className="rbx-btn close-btn" onClick={() => setActiveTab(null)}>✕</button>
                        </div>
                        <CustomerList customers={customers} inventory={inventory} sellToCustomer={sellToCustomer} />
                    </div>
                </div>
            )}

            {activeTab === 'crafting' && (
                <div className="modal-overlay" onClick={() => setActiveTab(null)}>
                    <div className="modal-content rbx-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>WORKSTATION</h2>
                            <button className="rbx-btn close-btn" onClick={() => setActiveTab(null)}>✕</button>
                        </div>
                        <CraftingHub inventory={inventory} craftItem={craftItem} customers={customers} />
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="modal-overlay" onClick={() => setActiveTab(null)}>
                    <div className="modal-content rbx-panel" style={{ maxWidth: '300px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>SETTINGS</h2>
                            <button className="rbx-btn close-btn" onClick={() => setActiveTab(null)}>✕</button>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800 }}>
                                    <span>VOLUME</span>
                                    <span>{Math.round(masterVolume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={masterVolume}
                                    onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: '#3b82f6' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* REBIRTH MODAL */}
            {activeTab === 'rebirth' && (
                <div className="modal-overlay" onClick={() => setActiveTab(null)}>
                    <div className="modal-content rbx-panel rebirth-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔄 REBIRTH</h2>
                            <button className="rbx-btn close-btn" onClick={() => setActiveTab(null)}>✕</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {rebirthCount > 0 && (
                                <div className="rebirth-stats">
                                    <div className="rebirth-stat-title">Rebirth Progress</div>
                                    <div className="rebirth-stat-row">
                                        <span>🔄 Total Rebirths</span>
                                        <span style={{ color: '#a855f7' }}>{rebirthCount}</span>
                                    </div>
                                    <div className="rebirth-stat-row">
                                        <span>🍀 Accumulated Luck</span>
                                        <span style={{ color: '#10b981' }}>+{(rebirthCount * 10)}%</span>
                                    </div>
                                </div>
                            )}

                            <div className="rebirth-section">
                                <div className="rebirth-section-title">📋 Requirements</div>
                                <div className={`rebirth-req ${honor >= 10000 ? 'met' : ''}`}>
                                    {honor >= 10000 ? '✅' : '❌'} 10,000 Honor (You have: {honor.toLocaleString()})
                                </div>
                                <div className={`rebirth-req ${dayCount >= 10 ? 'met' : ''}`}>
                                    {dayCount >= 10 ? '✅' : '❌'} Day 10+ (Current: Day {dayCount})
                                </div>
                            </div>

                            <div className="rebirth-section warning">
                                <div className="rebirth-section-title">⚠️ You Will Lose</div>
                                <div className="rebirth-loss">• All Honor ({honor.toLocaleString()})</div>
                                <div className="rebirth-loss">• All Workers ({workers.length} workers)</div>
                                <div className="rebirth-loss">• All Materials & Crafted Items</div>
                                <div className="rebirth-loss">• Day Count resets to 1</div>
                            </div>

                            <div className="rebirth-section gain">
                                <div className="rebirth-section-title">✨ You Will Gain</div>
                                <div className="rebirth-gain">
                                    <span>🍀 Permanent Luck</span>
                                    <span>+10% Luck</span>
                                </div>
                                <div className="rebirth-gain">
                                    <span>💎 Gems</span>
                                    <span>+{Math.floor(100 * (gemMultiplier || 1))} Gems</span>
                                </div>
                                <div className="rebirth-gain">
                                    <span>🏪 Shop Level</span>
                                    <span>+1 Level (on even rebirths)</span>
                                </div>
                            </div>

                            <button
                                className={`rbx-btn rebirth-confirm-btn ${canRebirth ? '' : 'disabled'}`}
                                onClick={() => {
                                    if (performRebirth()) {
                                        setActiveTab(null);
                                    }
                                }}
                                disabled={!canRebirth}
                            >
                                {canRebirth ? '🔄 PERFORM REBIRTH' : '❌ Requirements Not Met'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INDEX MODAL */}
            {activeTab === 'index' && (
                <div className="modal-overlay" onClick={() => setActiveTab(null)}>
                    <div className="modal-content rbx-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>INDEX</h2>
                            <button className="rbx-btn close-btn" onClick={() => setActiveTab(null)}>✕</button>
                        </div>
                        <div className="tab-bar">
                            <div className={`tab ${indexSubTab === 'materials' ? 'active' : ''}`} onClick={() => setIndexSubTab('materials')}>MATERIALS</div>
                            <div className={`tab ${indexSubTab === 'crafted' ? 'active' : ''}`} onClick={() => setIndexSubTab('crafted')}>CRAFTED</div>
                            <div className={`tab ${indexSubTab === 'workers' ? 'active' : ''}`} onClick={() => setIndexSubTab('workers')}>WORKERS</div>
                        </div>

                        {/* Variant Sub-Tabs (only visible when Workers selected) */}
                        {indexSubTab === 'workers' && (
                            <div className="variant-tabs">
                                {Object.keys(WORKER_VARIANTS).map(varKey => {
                                    const variant = WORKER_VARIANTS[varKey];
                                    const hasVariant = workers.some(w => (w.variantKey || 'NORMAL') === varKey);
                                    const isRainbow = varKey === 'RAINBOW';
                                    return (
                                        <div
                                            key={varKey}
                                            className={`variant-tab ${workerVariantTab === varKey ? 'active' : ''} ${!hasVariant && varKey !== 'NORMAL' ? 'locked' : ''}`}
                                            onClick={() => setWorkerVariantTab(varKey)}
                                            style={{
                                                color: workerVariantTab === varKey ? (isRainbow ? '#fff' : variant.color) : '#666',
                                                background: isRainbow && workerVariantTab === varKey ? 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff)' : 'transparent',
                                                borderColor: workerVariantTab === varKey ? variant.color : 'transparent'
                                            }}
                                        >
                                            {variant.name}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="inventory-grid" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {indexSubTab === 'materials' && MATERIALS.map(mat => {
                                const unlocked = discoveredMaterials.has(mat.id);
                                const rarity = RARITIES[mat.rarity];
                                return (
                                    <div key={mat.id} className={`inv-item index-item ${unlocked ? '' : 'locked'}`}
                                        style={{ borderColor: unlocked ? rarity.color + '55' : '#333' }}>
                                        <div className="item-icon" style={{ filter: unlocked ? 'none' : 'grayscale(1) brightness(0.3)' }}>
                                            {mat.emoji}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '800', marginTop: '4px', color: unlocked ? rarity.color : '#555' }}>
                                            {unlocked ? mat.name : '???'}
                                        </div>
                                        <div style={{ fontSize: '0.5rem', color: unlocked ? rarity.color : '#444', opacity: 0.7 }}>
                                            {rarity.name}
                                        </div>
                                        {unlocked && <div style={{ fontSize: '0.5rem', color: '#3b82f6', marginTop: '2px' }}>x{inventory[mat.id] || 0}</div>}
                                    </div>
                                );
                            })}

                            {indexSubTab === 'crafted' && CRAFTED_ITEMS.map(item => {
                                const unlocked = discoveredCrafted.has(item.id);
                                const tierColors = { BASIC: '#94a3b8', INTERMEDIATE: '#10b981', ADVANCED: '#a855f7', LEGENDARY: '#eab308', MYTHIC: '#ff0055' };
                                const color = tierColors[item.tier] || '#3b82f6';
                                return (
                                    <div key={item.id} className={`inv-item index-item ${unlocked ? '' : 'locked'}`}
                                        style={{ borderColor: unlocked ? color + '55' : '#333' }}>
                                        <div className="item-icon" style={{ filter: unlocked ? 'none' : 'grayscale(1) brightness(0.3)' }}>
                                            {item.emoji}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '800', marginTop: '4px', color: unlocked ? color : '#555' }}>
                                            {unlocked ? item.name : '???'}
                                        </div>
                                        <div style={{ fontSize: '0.5rem', color: unlocked ? color : '#444', opacity: 0.7 }}>
                                            {item.tier}
                                        </div>
                                        {unlocked && <div style={{ fontSize: '0.5rem', color: '#3b82f6', marginTop: '2px' }}>x{inventory.crafted[item.id] || 0}</div>}
                                    </div>
                                );
                            })}

                            {indexSubTab === 'workers' && (
                                <>
                                    {Object.keys(RARITIES).map(rarityKey => {
                                        const rarity = RARITIES[rarityKey];
                                        return WORKER_TYPES.map(wType => {
                                            const workerKey = `${rarityKey}-${wType.type}-${workerVariantTab}`;
                                            const hasWorker = discoveredWorkers.has(workerKey);
                                            const variant = WORKER_VARIANTS[workerVariantTab];
                                            const displayColor = workerVariantTab !== 'NORMAL' ? variant.color : rarity.color;
                                            const isRainbow = workerVariantTab === 'RAINBOW';
                                            return (
                                                <div key={`${rarityKey}-${wType.type}-${workerVariantTab}`}
                                                    className={`inv-item index-item ${hasWorker ? '' : 'locked'} ${isRainbow && hasWorker ? 'rainbow-border' : ''}`}
                                                    style={{ borderColor: hasWorker ? (isRainbow ? 'transparent' : displayColor + '55') : '#333' }}>
                                                    <div className="item-icon" style={{ filter: hasWorker ? 'none' : 'grayscale(1) brightness(0.3)' }}>
                                                        {wType.emoji}
                                                    </div>
                                                    <div style={{ fontSize: '0.55rem', fontWeight: '800', marginTop: '4px', color: hasWorker ? displayColor : '#555' }}>
                                                        {hasWorker ? wType.type : '???'}
                                                    </div>
                                                    <div style={{ fontSize: '0.5rem', color: hasWorker ? rarity.color : '#444', opacity: 0.8 }}>
                                                        {rarity.name}
                                                    </div>
                                                    {workerVariantTab !== 'NORMAL' && hasWorker && (
                                                        <div style={{ fontSize: '0.45rem', color: displayColor, marginTop: '2px', fontWeight: '900' }}>
                                                            ★ {variant.name}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })}
                                </>
                            )}
                        </div>
                        <div style={{ padding: '15px', textAlign: 'center', fontSize: '0.7rem', color: '#666', borderTop: '1px solid #333' }}>
                            Materials: {discoveredMaterials.size}/{MATERIALS.length} |
                            Crafted: {discoveredCrafted.size}/{CRAFTED_ITEMS.length} |
                            Workers: {discoveredWorkers.size}/{Object.keys(RARITIES).length * WORKER_TYPES.length * Object.keys(WORKER_VARIANTS).length}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="modal-overlay" onClick={() => setActiveTab(null)}>
                    <div className="modal-content rbx-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>INVENTORY</h2>
                            <button className="rbx-btn close-btn" onClick={() => setActiveTab(null)}>✕</button>
                        </div>
                        <div className="tab-bar">
                            <div className={`tab ${invSubTab === 'materials' ? 'active' : ''}`} onClick={() => setInvSubTab('materials')}>MATERIALS</div>
                            <div className={`tab ${invSubTab === 'crafted' ? 'active' : ''}`} onClick={() => setInvSubTab('crafted')}>CRAFTED</div>
                        </div>
                        <div className="modal-body-scrollable">
                            <div className="inventory-grid">
                            {invSubTab === 'materials' ? (
                                Object.entries(inventory).map(([id, count]) => {
                                    if (id === 'crafted' || count <= 0) return null;
                                    const info = getInfo(id, 'material');
                                    if (!info) return null;
                                    return (
                                        <div key={id} className={`inv-item rarity-border-${info.rarity.toLowerCase()}`} style={{ borderLeft: `4px solid ${info.color}` }}>
                                            <span className="item-icon">{getEmoji(id, 'material')}</span>
                                            <div className="item-chance-tag">{info.chance}</div>
                                            <span className="item-count">x{count}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <>
                                    {Object.entries(inventory.crafted).map(([id, count]) => {
                                        if (count <= 0) return null;
                                        const info = getInfo(id, 'crafted');
                                        return (
                                            <div key={id} className="inv-item">
                                                <span className="item-icon">{getEmoji(id, 'crafted')}</span>
                                                <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: '2px', textTransform: 'uppercase' }}>{id}</div>
                                                <span className="item-count">x{count}</span>
                                            </div>
                                        );
                                    })}
                                    {Object.keys(inventory.crafted).length === 0 && (
                                        <div style={{ gridColumn: 'span 3', padding: '40px', opacity: 0.2, textAlign: 'center' }}>No Crafted Items Yet</div>
                                    )}
                                </>
                            )}                            </div>                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'shop' && (
                <div className="modal-overlay" onClick={() => setActiveTab(null)}>
                    <div className="modal-content rbx-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>SHOP</h2>
                            <button className="rbx-btn close-btn" onClick={() => setActiveTab(null)}>✕</button>
                        </div>
                        <div className="modal-body-scrollable">
                            <ShopUpgrades
                                honor={honor}
                                setHonor={setHonor}
                                permanentLuck={permanentLuck}
                                setPermanentLuck={setPermanentLuck}
                                gems={gems}
                                setGems={setGems}
                                shopLevel={shopLevel}
                                setShopLevel={setShopLevel}
                                dayDuration={dayDuration}
                                setDayDuration={setDayDuration}
                                nightDuration={nightDuration}
                                setNightDuration={setNightDuration}
                                hasCrafter={hasCrafter}
                                setHasCrafter={setHasCrafter}
                                hasSeller={hasSeller}
                                setHasSeller={setHasSeller}
                                gemMultiplier={gemMultiplier}
                                setGemMultiplier={setGemMultiplier}
                                workerSlots={workerSlots}
                                setWorkerSlots={setWorkerSlots}
                                customerSpawnMod={customerSpawnMod}
                                setCustomerSpawnMod={setCustomerSpawnMod}
                                maxCustomers={maxCustomers}
                                setMaxCustomers={setMaxCustomers}
                                gatherSpeed={gatherSpeed}
                                setGatherSpeed={setGatherSpeed}
                                startingHonor={startingHonor}
                                setStartingHonor={setStartingHonor}
                                bonusDamage={bonusDamage}
                                setBonusDamage={setBonusDamage}
                                bonusMaxHP={bonusMaxHP}
                                setBonusMaxHP={setBonusMaxHP}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* WORLD VIEW */}
            {mainTab === 'WORLD' && (
                <World 
                    honor={honor}
                    setHonor={setHonor}
                    relics={relics}
                    setRelics={setRelics}
                    worldCooldown={worldCooldown}
                    setWorldCooldown={setWorldCooldown}
                    dayCount={dayCount}
                    inventory={inventory}
                    setInventory={setInventory}
                    bonusDamage={bonusDamage}
                    bonusMaxHP={bonusMaxHP}
                />
            )}
        </div>
    )
}

export default App
