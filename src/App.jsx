import { WorkerHub } from './components/WorkerHub'
import { ShopUpgrades } from './components/ShopUpgrades'
import { CustomerList } from './components/CustomerList'
import { CraftingHub } from './components/CraftingHub'
import { World } from './components/World'
import { MaterialShop } from './components/MaterialShop'
import { StartScreen } from './components/StartScreen'
import { GameOverScreen } from './components/GameOverScreen'
import { Tutorial } from './components/Tutorial'
import { useGameState, UI_PHASES } from './hooks/useGameState'
import { MATERIALS, CRAFTED_ITEMS, RARITIES, GATHER_TABLE, WORKER_TYPES, WORKER_VARIANTS } from './utils/workerRNG'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './App.css'

import { BackgroundWorkers } from './components/BackgroundWorkers';

function App() {
    const [mainTab, setMainTab] = useState('SHOP');
    const [activeTab, setActiveTab] = useState(null);
    const [invSubTab, setInvSubTab] = useState('materials');
    const [indexSubTab, setIndexSubTab] = useState('materials');
    const [workerVariantTab, setWorkerVariantTab] = useState('NORMAL');
    const [epicReveal, setEpicReveal] = useState(null); 
    const [variantReveal, setVariantReveal] = useState(null); 
    const [shuffleText, setShuffleText] = useState("");
    const [doorTransition, setDoorTransition] = useState(false);
    const [doorBgColor, setDoorBgColor] = useState('#2d5016');
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [maxHonor, setMaxHonor] = useState(0);
    const [invTooltipPos, setInvTooltipPos] = useState({ top: 0, left: 0 });
    const [hoveredInvItem, setHoveredInvItem] = useState(null);
    const [tabTooltipPos, setTabTooltipPos] = useState({ top: 0, left: 0 });
    const [hoveredTab, setHoveredTab] = useState(null);
    const [tabTooltipSide, setTabTooltipSide] = useState('right'); 

    const {
        honor, setHonor, phase, timeLeft, dayCount, lastRecruit, isRolling, performRecruitRoll,
        autoRoll, setAutoRoll, fastRoll, setFastRoll, luckBoost, setLuckBoost,
        inventory, setInventory, addItemToInventory, workers, setWorkers, equippedWorkers, equipBest, craftItem,
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
        bonusDamage, setBonusDamage, bonusMaxHP, setBonusMaxHP,
        coins, addCoins, coinDropBonus, setCoinDropBonus, materialPurchases, setMaterialPurchases,
        showTutorial, setShowTutorial
    } = useGameState(gameStarted);

    const rollAudio = useRef(new Audio('/sounds/castanet-roll-120bpm-83002.mp3'));
    const coinDropAudio = useRef(new Audio('/sounds/coin-drop-1-104046.mp3'));
    const coinPayoutAudio = useRef(new Audio('/sounds/coin-payout-2-213523.mp3'));
    const bingAudio = useRef(new Audio('/sounds/bing1-91919.mp3'));
    const fireballAudio = useRef(new Audio('/sounds/fireball-whoosh-2-179126.mp3'));
    const smallMonsterAttackAudio = useRef(new Audio('/sounds/small-monster-attack-195712.mp3'));
    const largeMonsterAttackAudio = useRef(new Audio('/sounds/large-monster-attack-195713.mp3'));
    const doorOpenAudio = useRef(new Audio('/sounds/open-door-stock-sfx-454246.mp3'));

    useEffect(() => {
        let interval;
        if (isRolling) {
            
            if (!fastRoll) {
                const names = ["SHUFFLING...", "ROLLING...", "CURSING...", "VOID CALLING...", "RECRUITING..."];
                interval = setInterval(() => {
                    setShuffleText(names[Math.floor(Math.random() * names.length)]);
                }, 80);
            }

            rollAudio.current.currentTime = 0;
            rollAudio.current.playbackRate = fastRoll ? 5.0 : 1.0; 
            rollAudio.current.loop = false; 
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

    useEffect(() => {
        if (autoRoll && !isRolling && !epicReveal && !variantReveal) {
            
            const timer = setTimeout(() => {
                if (autoRoll && !isRolling && !epicReveal && !variantReveal) {
                    performRecruitRoll();
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [autoRoll, isRolling, epicReveal, variantReveal, performRecruitRoll]);

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

    useEffect(() => {
        const handleSwitch = (event) => {
            
            if (doorOpenAudio?.current) {
                doorOpenAudio.current.currentTime = 0;
                doorOpenAudio.current.play().catch(e => console.log("Audio play blocked"));
            }
            setDoorBgColor('shop'); 
            setDoorTransition(true);
            setTimeout(() => {
                setMainTab('SHOP');
                setDoorTransition(false);
            }, 500);
        };
        window.addEventListener('switchToShop', handleSwitch);
        return () => window.removeEventListener('switchToShop', handleSwitch);
    }, [doorOpenAudio]);

    useEffect(() => {
        if (honor > maxHonor) {
            setMaxHonor(honor);
        }
    }, [honor, maxHonor]);

    useEffect(() => {
        if (gameStarted && phase === UI_PHASES.DAY && honor === 0 && dayCount > 1) {
            setGameOver(true);
        }
    }, [gameStarted, phase, honor, dayCount]);

    if (!gameStarted) {
        return <StartScreen onStart={() => setGameStarted(true)} />;
    }

    if (gameOver) {
        return (
            <GameOverScreen
                dayCount={dayCount - 1}
                maxHonor={maxHonor}
                onRestart={() => {
                    window.location.reload();
                }}
            />
        );
    }

    return (
        <>
            {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
            
            <div className={`app-container ${phase} ${epicReveal ? 'screen-shake' : ''}`}>
            <BackgroundWorkers equippedWorkers={equippedWorkers} gatherEvents={gatherEvents} masterVolume={masterVolume} />

            {}
            {mainTab !== 'WORLD' && (
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
                        if (worldCooldown > 0) return; 
                        if (mainTab !== 'WORLD') {
                            
                            if (doorOpenAudio?.current) {
                                doorOpenAudio.current.currentTime = 0;
                                doorOpenAudio.current.play().catch(e => console.log("Audio play blocked"));
                            }
                            setDoorBgColor('world'); 
                            setDoorTransition(true);
                            setTimeout(() => {
                                setMainTab('WORLD');
                                setDoorTransition(false);
                            }, 500); 
                        }
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
            )}

            {}
            {epicReveal === 'LEGENDARY' && (
                <div className="legendary-reveal-container">
                    <div className="legendary-sunburst" />
                    <div className="legendary-particles" />
                    <div className="legendary-reveal-text">LEGENDARY!</div>
                    <div className="legendary-subtitle">1 in 10,000</div>
                </div>
            )}

            {}
            {epicReveal === 'MYTHIC' && (
                <div className="mythic-reveal-container">
                    <div className="mythic-void-pulse" />
                    <div className="mythic-lightning" />
                    <div className="mythic-stars" />
                    <div className="mythic-reveal-text">MYTHIC!</div>
                    <div className="mythic-subtitle">1 in 100,000</div>
                </div>
            )}

            {}
            {variantReveal && (
                <div className={`variant-reveal-banner variant-${variantReveal.variantKey.toLowerCase()}`}>
                    <div className="variant-reveal-icon">{variantReveal.emoji}</div>
                    <div className="variant-reveal-info">
                        <div className="variant-reveal-label">✨ {variantReveal.variant.name} Variant!</div>
                        <div className="variant-reveal-name">{variantReveal.type} - {variantReveal.rarity.name}</div>
                    </div>
                </div>
            )}

            {}
            <div className="hud">
                <div className="hud-left">
                    <div className="stat-pill"><span>HONOR</span><span style={{ color: '#fff' }}>{honor.toLocaleString()} 🔮</span></div>
                    <div className="stat-pill">
                        <span>TIME</span>
                        <span style={{ color: phase === UI_PHASES.NIGHT ? '#a855f7' : '#fbbf24' }}>
                            {formatTime(timeLeft)} {phase === UI_PHASES.NIGHT ? "🌙" : "☀️"}
                        </span>
                    </div>
                    <div className="stat-pill"><span>DAY</span><span style={{ color: '#f87171' }}>{dayCount}</span></div>
                </div>
                <div className="hud-right">
                    <div className="stat-pill"><span>SHOP LVL</span><span style={{ color: '#fbbf24' }}>{shopLevel} 🏪</span></div>
                    <div className="stat-pill"><span>GEMS</span><span style={{ color: '#f472b6' }}>{gems.toLocaleString()} 💎</span></div>
                    <div className="stat-pill"><span>COINS</span><span style={{ color: '#ffd700' }}>{coins.toLocaleString()} 🪙</span></div>
                </div>
            </div>

            {}
            <div className="side-menu left">
                <div 
                    className={`menu-btn ${activeTab === 'inventory' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('inventory')}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                        setTabTooltipSide('right');
                        setHoveredTab('Inventory');
                    }}
                    onMouseLeave={() => setHoveredTab(null)}
                >📦</div>
                <div 
                    className={`menu-btn ${activeTab === 'workers' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('workers')}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                        setTabTooltipSide('right');
                        setHoveredTab('Workers');
                    }}
                    onMouseLeave={() => setHoveredTab(null)}
                >👷</div>
                <div 
                    className={`menu-btn ${activeTab === 'shop' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('shop')}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                        setTabTooltipSide('right');
                        setHoveredTab('Shop');
                    }}
                    onMouseLeave={() => setHoveredTab(null)}
                >🛒</div>
                <div 
                    className={`menu-btn ${mainTab === 'MAT_SHOP' ? 'active' : ''}`} 
                    onClick={() => setMainTab('MAT_SHOP')}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                        setTabTooltipSide('right');
                        setHoveredTab('Material Shop');
                    }}
                    onMouseLeave={() => setHoveredTab(null)}
                >🪙</div>
            </div>

            {}
            <div 
                className={`menu-btn ${activeTab === 'index' ? 'active' : ''}`}
                style={{ position: 'fixed', bottom: '90px', left: '20px', zIndex: 100 }}
                onClick={() => setActiveTab('index')}
                onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                    setTabTooltipSide('right');
                    setHoveredTab('Index');
                }}
                onMouseLeave={() => setHoveredTab(null)}
            >📚</div>
            <div 
                className={`menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
                style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100 }}
                onClick={() => setActiveTab('settings')}
                onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                    setTabTooltipSide('right');
                    setHoveredTab('Settings');
                }}
                onMouseLeave={() => setHoveredTab(null)}
            >⚙️</div>

            {}
            <div className="side-menu right">
                <div 
                    className={`menu-btn ${activeTab === 'customers' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('customers')}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.left - 20 });
                        setTabTooltipSide('left');
                        setHoveredTab('Customers');
                    }}
                    onMouseLeave={() => setHoveredTab(null)}
                >
                    <div style={{ position: 'relative' }}>
                        👤
                        {customers.length > 0 && <div className="notification-dot">{customers.length}</div>}
                    </div>
                </div>
                <div 
                    className={`menu-btn ${activeTab === 'crafting' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('crafting')}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.left - 20 });
                        setTabTooltipSide('left');
                        setHoveredTab('Crafting');
                    }}
                    onMouseLeave={() => setHoveredTab(null)}
                >⚒️</div>
                <div 
                    className={`menu-btn rebirth-btn ${activeTab === 'rebirth' ? 'active' : ''} ${canRebirth ? 'can-rebirth' : ''}`}
                    onClick={() => setActiveTab('rebirth')}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTabTooltipPos({ top: rect.top + rect.height / 2, left: rect.left - 20 });
                        setTabTooltipSide('left');
                        setHoveredTab('Rebirth');
                    }}
                    onMouseLeave={() => setHoveredTab(null)}
                >
                    🔄
                    {rebirthCount > 0 && <div className="rebirth-count">{rebirthCount}</div>}
                </div>
            </div>

            {}
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div className={`status-toggle ${luckBoost ? 'active' : ''}`} onClick={() => setLuckBoost(!luckBoost)}>
                                <span>LUCK</span><div className="toggle-indicator indicator-luck" />
                            </div>
                            <div style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: '900', 
                                color: luckBoost ? '#fbbf24' : '#666',
                                transition: 'color 0.2s'
                            }}>
                                {permanentLuck.toFixed(1)}x
                            </div>
                        </div>
                        <div className={`status-toggle ${fastRoll ? 'active' : ''}`} onClick={() => setFastRoll(!fastRoll)}>
                            <span>FAST</span><div className="toggle-indicator indicator-fast" />
                        </div>
                    </div>
                </div>
            )}

            {}
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
                        <CraftingHub inventory={inventory} craftItem={craftItem} customers={customers} bingAudio={bingAudio} />
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

            {}
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

            {}
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
                            <div className={`tab ${indexSubTab === 'relics' ? 'active' : ''}`} onClick={() => setIndexSubTab('relics')}>RELICS</div>
                        </div>

                        {}
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

                        <div 
                            className="inventory-grid" 
                            style={{ maxHeight: '400px', overflowY: 'auto', cursor: 'grab', userSelect: 'none' }}
                            onMouseDown={(e) => {
                                if (e.button !== 2) return;
                                e.preventDefault();
                                const slider = e.currentTarget;
                                slider.style.cursor = 'grabbing';
                                const startY = e.pageY - slider.offsetTop;
                                const scrollTop = slider.scrollTop;
                                const onMouseMove = (moveE) => {
                                    moveE.preventDefault();
                                    const y = moveE.pageY - slider.offsetTop;
                                    const walk = (y - startY) * 2;
                                    slider.scrollTop = scrollTop - walk;
                                };
                                const onMouseUp = () => {
                                    slider.style.cursor = 'grab';
                                    window.removeEventListener('mousemove', onMouseMove);
                                    window.removeEventListener('mouseup', onMouseUp);
                                };
                                window.addEventListener('mousemove', onMouseMove);
                                window.addEventListener('mouseup', onMouseUp);
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                        >
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

                            {indexSubTab === 'relics' && (() => {
                                const ALL_RELICS = [
                                    
                                    { name: 'Honor Relic', desc: '+10% Honor gained', rarity: 'COMMON', effect: 'honor_boost' },
                                    { name: 'Coin Charm', desc: '+20% Coin drops', rarity: 'COMMON', effect: 'coin_boost' },
                                    { name: 'Swift Relic', desc: '+10% Gather speed', rarity: 'COMMON', effect: 'gather_speed' },
                                    
                                    { name: 'Worker Relic', desc: '+5% Worker gather rate', rarity: 'UNCOMMON', effect: 'gather_boost' },
                                    { name: 'Fortune Stone', desc: '+15% Coin drops', rarity: 'UNCOMMON', effect: 'coin_boost' },
                                    { name: 'Time Shard', desc: '+15s Day duration', rarity: 'UNCOMMON', effect: 'day_extend' },
                                    
                                    { name: 'Luck Charm', desc: '+3% Recruit luck', rarity: 'RARE', effect: 'luck_boost' },
                                    { name: 'Battle Relic', desc: '+5 Bonus damage', rarity: 'RARE', effect: 'damage_boost' },
                                    { name: 'Shield Relic', desc: '+25 Max HP', rarity: 'RARE', effect: 'hp_boost' },
                                    
                                    { name: 'Golden Idol', desc: '+50% Coin drops', rarity: 'EPIC', effect: 'coin_boost' },
                                    { name: 'Auto Recruiter', desc: 'Recruit +1 worker on day change', rarity: 'EPIC', effect: 'auto_recruit' },
                                    
                                    { name: 'Twin Soul', desc: 'Roll 2 workers at once', rarity: 'MYTHIC', effect: 'double_roll' }
                                ];

                                const rarityColors = {
                                    'MYTHIC': '#ff0055',
                                    'LEGENDARY': '#eab308',
                                    'EPIC': '#a855f7',
                                    'RARE': '#3b82f6',
                                    'UNCOMMON': '#22c55e',
                                    'COMMON': '#888'
                                };

                                return ALL_RELICS.map((relic, idx) => {
                                    const hasRelic = relics.some(r => r.name === relic.name);
                                    const color = rarityColors[relic.rarity];
                                    return (
                                        <div key={idx} className={`inv-item index-item ${hasRelic ? '' : 'locked'}`}
                                            style={{ borderColor: hasRelic ? color + '55' : '#333' }}>
                                            <div className="item-icon" style={{ filter: hasRelic ? 'none' : 'grayscale(1) brightness(0.3)' }}>
                                                🏆
                                            </div>
                                            <div style={{ fontSize: '0.6rem', fontWeight: '800', marginTop: '4px', color: hasRelic ? color : '#555' }}>
                                                {hasRelic ? relic.name : '???'}
                                            </div>
                                            <div style={{ fontSize: '0.5rem', color: hasRelic ? color : '#444', opacity: 0.7 }}>
                                                {relic.rarity}
                                            </div>
                                            {hasRelic && (
                                                <div style={{ fontSize: '0.5rem', color: '#aaa', marginTop: '2px', textAlign: 'center' }}>
                                                    {relic.desc}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                        <div style={{ padding: '15px', textAlign: 'center', fontSize: '0.7rem', color: '#666', borderTop: '1px solid #333' }}>
                            Materials: {discoveredMaterials.size}/{MATERIALS.length} |
                            Crafted: {discoveredCrafted.size}/{CRAFTED_ITEMS.length} |
                            Workers: {discoveredWorkers.size}/{Object.keys(RARITIES).length * WORKER_TYPES.length * Object.keys(WORKER_VARIANTS).length} |
                            Relics: {relics.length}/12
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
                            <div className={`tab ${invSubTab === 'relics' ? 'active' : ''}`} onClick={() => setInvSubTab('relics')}>RELICS</div>
                        </div>
                        <div className="modal-body-scrollable">
                            <div className="inventory-grid">
                                {invSubTab === 'materials' ? (
                                    Object.entries(inventory).map(([id, count]) => {
                                        if (id === 'crafted' || count <= 0) return null;
                                        const info = getInfo(id, 'material');
                                        if (!info) return null;
                                        return (
                                            <div 
                                                key={id} 
                                                className={`inv-item rarity-border-${info.rarity.toLowerCase()}`} 
                                                style={{ borderLeft: `4px solid ${info.color}` }}
                                                onMouseEnter={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setInvTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                                                    setHoveredInvItem({ type: 'material', id, count, info });
                                                }}
                                                onMouseLeave={() => setHoveredInvItem(null)}
                                            >
                                                <span className="item-icon">{getEmoji(id, 'material')}</span>
                                                <div className="item-chance-tag">{info.chance}</div>
                                                <span className="item-count">x{count}</span>
                                            </div>
                                        );
                                    })
                                ) : invSubTab === 'relics' ? (
                                    <>
                                        {relics.length > 0 ? relics.map((relic) => {
                                            const rarityColors = {
                                                'MYTHIC': '#ff0055',
                                                'LEGENDARY': '#eab308',
                                                'EPIC': '#a855f7',
                                                'RARE': '#3b82f6',
                                                'UNCOMMON': '#22c55e',
                                                'COMMON': '#888'
                                            };
                                            return (
                                                <div 
                                                    key={relic.id} 
                                                    className="inv-item" 
                                                    style={{ borderLeft: `4px solid ${rarityColors[relic.rarity]}` }}
                                                    onMouseEnter={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setInvTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                                                        setHoveredInvItem({ type: 'relic', relic, color: rarityColors[relic.rarity] });
                                                    }}
                                                    onMouseLeave={() => setHoveredInvItem(null)}
                                                >
                                                    <span className="item-icon">🏆</span>
                                                    <div className="item-chance-tag" style={{ background: rarityColors[relic.rarity], color: '#000', fontWeight: 'bold' }}>
                                                        {relic.rarity}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginTop: '4px', textAlign: 'center' }}>
                                                        {relic.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.6rem', opacity: 0.7, marginTop: '2px', textAlign: 'center' }}>
                                                        {relic.desc}
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div style={{ gridColumn: 'span 3', padding: '40px', opacity: 0.2, textAlign: 'center' }}>No Relics Yet - Defeat Bosses!</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {Object.entries(inventory.crafted).map(([id, count]) => {
                                            if (count <= 0) return null;
                                            const info = getInfo(id, 'crafted');
                                            return (
                                                <div 
                                                    key={id} 
                                                    className="inv-item"
                                                    onMouseEnter={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setInvTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                                                        setHoveredInvItem({ type: 'crafted', id, count, info });
                                                    }}
                                                    onMouseLeave={() => setHoveredInvItem(null)}
                                                >
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
                                )}
                            </div>
                        </div>

                        {}
                        {hoveredInvItem && (() => {
                            const item = hoveredInvItem;
                            
                            if (item.type === 'material') {
                                const mat = MATERIALS.find(m => m.id === item.id);
                                return (
                                    <div style={{
                                        position: 'fixed',
                                        top: `${invTooltipPos.top}px`,
                                        left: `${invTooltipPos.left}px`,
                                        transform: 'translateY(-50%)',
                                        background: '#1a1a1a',
                                        border: `2px solid ${item.info.color}`,
                                        borderRadius: '8px',
                                        padding: '16px',
                                        minWidth: '200px',
                                        zIndex: 10000,
                                        boxShadow: `0 0 30px ${item.info.color}88`,
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: item.info.color, marginBottom: '10px' }}>
                                            {mat?.emoji} {mat?.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '8px' }}>
                                            {item.info.rarity}
                                        </div>
                                        <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#10b981', marginBottom: '4px' }}>
                                                Gather Chance: {item.info.chance}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>
                                                In Inventory: x{item.count}
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (item.type === 'relic') {
                                return (
                                    <div style={{
                                        position: 'fixed',
                                        top: `${invTooltipPos.top}px`,
                                        left: `${invTooltipPos.left}px`,
                                        transform: 'translateY(-50%)',
                                        background: '#1a1a1a',
                                        border: `2px solid ${item.color}`,
                                        borderRadius: '8px',
                                        padding: '16px',
                                        minWidth: '250px',
                                        zIndex: 10000,
                                        boxShadow: `0 0 30px ${item.color}88`,
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: item.color, marginBottom: '10px' }}>
                                            🏆 {item.relic.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: item.color, marginBottom: '8px', fontWeight: 'bold' }}>
                                            {item.relic.rarity}
                                        </div>
                                        <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px', fontSize: '0.7rem', color: '#ccc' }}>
                                            {item.relic.desc}
                                        </div>
                                    </div>
                                );
                            } else if (item.type === 'crafted') {
                                const craftedItem = CRAFTED_ITEMS.find(ci => ci.id === item.id);
                                const tierColors = { BASIC: '#94a3b8', INTERMEDIATE: '#10b981', ADVANCED: '#a855f7', LEGENDARY: '#eab308', MYTHIC: '#ff0055' };
                                const color = tierColors[craftedItem?.tier] || '#3b82f6';
                                
                                return (
                                    <div style={{
                                        position: 'fixed',
                                        top: `${invTooltipPos.top}px`,
                                        left: `${invTooltipPos.left}px`,
                                        transform: 'translateY(-50%)',
                                        background: '#1a1a1a',
                                        border: `2px solid ${color}`,
                                        borderRadius: '8px',
                                        padding: '16px',
                                        minWidth: '200px',
                                        zIndex: 10000,
                                        boxShadow: `0 0 30px ${color}88`,
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: color, marginBottom: '10px' }}>
                                            {craftedItem?.emoji} {craftedItem?.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '8px' }}>
                                            {craftedItem?.tier}
                                        </div>
                                        <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>
                                                In Inventory: x{item.count}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
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
                                coinDropBonus={coinDropBonus}
                                setCoinDropBonus={setCoinDropBonus}
                            />
                        </div>
                    </div>
                </div>
            )}

            {}
            {mainTab === 'MAT_SHOP' && (
                <div className="modal-overlay" style={{ zIndex: 900 }}>
                    <div className="modal-content rbx-panel" style={{ height: '80vh', padding: '0' }}>
                        <div className="modal-header">
                            <h2>MATERIAL SHOP</h2>
                            <button className="rbx-btn close-btn" onClick={() => setMainTab('SHOP')}>✕</button>
                        </div>
                        <div className="modal-body-scrollable">
                            <MaterialShop
                                coins={coins}
                            addCoins={addCoins}
                            addItemToInventory={addItemToInventory}
                            materialPurchases={materialPurchases}
                            setMaterialPurchases={setMaterialPurchases}
                            coinPayoutAudio={coinPayoutAudio}
                            bingAudio={bingAudio}
                        />
                        </div>
                    </div>
                </div>
            )}

            {}
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
                    addItemToInventory={addItemToInventory}
                    addCoins={addCoins}
                    bonusDamage={bonusDamage}
                    bonusMaxHP={bonusMaxHP}
                    coinDropAudio={coinDropAudio}
                    fireballAudio={fireballAudio}
                    smallMonsterAttackAudio={smallMonsterAttackAudio}
                    largeMonsterAttackAudio={largeMonsterAttackAudio}
                />
            )}

            {}
            {doorTransition && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: phase === 'day' 
                        ? 'radial-gradient(circle at center, #3b82f633 0%, #000 100%)' 
                        : 'radial-gradient(circle at center, #a855f722 0%, #000 100%)',
                    zIndex: 10000,
                    pointerEvents: 'none',
                    display: 'flex'
                }}>
                    <div style={{
                        flex: 1,
                        background: '#3d2817',
                        animation: 'doorOpenLeft 0.5s ease-out forwards'
                    }} />
                    <div style={{
                        flex: 1,
                        background: '#3d2817',
                        animation: 'doorOpenRight 0.5s ease-out forwards'
                    }} />
                </div>
            )}

            {}
            {hoveredTab && (
                <div style={{
                    position: 'fixed',
                    top: `${tabTooltipPos.top}px`,
                    left: `${tabTooltipPos.left}px`,
                    transform: tabTooltipSide === 'left' ? 'translate(-100%, -50%)' : 'translateY(-50%)',
                    background: '#1a1a1a',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    zIndex: 10000,
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
                    pointerEvents: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '900',
                    color: '#fff',
                    whiteSpace: 'nowrap'
                }}>
                    {hoveredTab}
                </div>
            )}
            </div>
        </>
    )
}

export default App
