import { useState } from 'react';
import { rollWorker, RARITIES, CRAFTED_ITEMS, WORKER_TYPES } from '../utils/workerRNG';

export function WorkerHub({ workers, equippedWorkers, equipBest, autoDeleteRarities, toggleAutoDelete }) {
    const [showDeleteConfig, setShowDeleteConfig] = useState(false);
    const [hoveredWorker, setHoveredWorker] = useState(null);
    const filteredWorkers = workers;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* EQUIPMENT HEADER */}
            <div style={{
                padding: '12px 20px',
                background: '#1a1a1a',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div
                    style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '2px', flex: 1, marginRight: '15px', scrollbarWidth: 'none', cursor: 'grab' }}
                    onMouseDown={(e) => {
                        if (e.button !== 2) return;
                        const slider = e.currentTarget;
                        const startX = e.pageX - slider.offsetLeft;
                        const scrollLeft = slider.scrollLeft;
                        const onMouseMove = (moveE) => {
                            const x = moveE.pageX - slider.offsetLeft;
                            const walk = (x - startX) * 2;
                            slider.scrollLeft = scrollLeft - walk;
                        };
                        const onMouseUp = () => {
                            window.removeEventListener('mousemove', onMouseMove);
                            window.removeEventListener('mouseup', onMouseUp);
                        };
                        window.addEventListener('mousemove', onMouseMove);
                        window.addEventListener('mouseup', onMouseUp);
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {Object.entries(equippedWorkers).map(([type, list]) => (
                        <div key={type} style={{ minWidth: '70px' }}>
                            <div style={{ fontSize: '0.42rem', opacity: 0.5, marginBottom: '3px', textTransform: 'uppercase', fontWeight: 900, color: '#3b82f6' }}>{type}</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[0, 1, 2].map(i => {
                                    const w = list[i];
                                    return (
                                        <div key={i} style={{
                                            width: '22px', height: '22px', background: '#000',
                                            border: `1px solid ${w ? w.rarity.color : '#333'}`,
                                            borderRadius: '3px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            fontSize: '0.75rem', boxShadow: w ? `0 0 8px ${w.rarity.color}22` : 'none',
                                            transition: 'all 0.2s'
                                        }}>
                                            {w ? w.emoji : ''}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="rbx-btn" style={{
                        padding: '10px 18px',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        background: showDeleteConfig ? '#ef4444' : '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        boxShadow: showDeleteConfig ? '0 4px 0 #991b1b' : '0 4px 0 #111'
                    }} onClick={() => setShowDeleteConfig(!showDeleteConfig)}>DELETE</button>

                    <button className="rbx-btn" style={{
                        padding: '10px 18px',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 0 #059669'
                    }} onClick={equipBest}>EQUIP BEST</button>
                </div>
            </div>

            {/* AUTO-DELETE OVERLAY */}
            {showDeleteConfig && (
                <div style={{
                    padding: '15px 20px',
                    background: '#111',
                    borderBottom: '1px solid #ef444433',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ef4444', letterSpacing: '1px' }}>AUTO-DELETE RARITIES</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Object.entries(RARITIES).map(([key, data]) => {
                            const isSelected = autoDeleteRarities.includes(key);
                            return (
                                <div
                                    key={key}
                                    onClick={() => toggleAutoDelete(key)}
                                    style={{
                                        padding: '6px 12px',
                                        background: isSelected ? '#ef4444' : '#222',
                                        border: `1px solid ${isSelected ? '#ef4444' : '#444'}`,
                                        borderRadius: '4px',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        color: isSelected ? '#000' : data.color,
                                        transition: '0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    {isSelected ? '🗑️' : ''} {data.name}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* GRID - UNIFIED WITH INVENTORY */}
            <div className="inventory-grid">
                {filteredWorkers.map((w) => {
                    const isEquipped = Object.values(equippedWorkers).flat().some(eq => eq.id === w.id);
                    const rarityStats = {
                        COMMON: { chance: '1x', amount: '1x' },
                        UNCOMMON: { chance: '1.5x', amount: '1x' },
                        RARE: { chance: '2x', amount: '2x' },
                        EPIC: { chance: '3x', amount: '3x' },
                        LEGENDARY: { chance: '5x', amount: '5x' },
                        MYTHIC: { chance: '10x', amount: '10x' }
                    };
                    const stats = rarityStats[w.rarityKey] || rarityStats.COMMON;

                    return (
                        <div 
                            key={w.id} 
                            className="inv-item" 
                            style={{
                                borderBottom: `3px solid ${w.rarity.color}`,
                                borderColor: isEquipped ? w.rarity.color : '#333',
                                background: isEquipped ? 'rgba(255,255,255,0.05)' : '#252525',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={() => setHoveredWorker(w.id)}
                            onMouseLeave={() => setHoveredWorker(null)}
                        >
                            {/* Tooltip */}
                            {hoveredWorker === w.id && (
                                <div style={{
                                    position: 'fixed',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: '#1a1a1a',
                                    border: `2px solid ${w.rarity.color}`,
                                    borderRadius: '8px',
                                    padding: '16px',
                                    minWidth: '250px',
                                    zIndex: 10000,
                                    boxShadow: `0 0 30px ${w.rarity.color}88`,
                                    pointerEvents: 'none'
                                }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '900', color: w.rarity.color, marginBottom: '10px' }}>
                                        {w.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#fff', marginBottom: '8px' }}>
                                        {w.emoji} {w.type} - {w.rarity.name}
                                    </div>
                                    {w.variantKey && w.variantKey !== 'NORMAL' && (
                                        <div style={{ fontSize: '0.7rem', color: w.variant.color, marginBottom: '8px', fontWeight: '900' }}>
                                            ★ {w.variant.name} Variant
                                        </div>
                                    )}
                                    <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#10b981', marginBottom: '4px' }}>
                                            • Gather Chance: {stats.chance}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginBottom: '4px' }}>
                                            • Gather Amount: {stats.amount}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>
                                            • Roll Chance: {w.chance}
                                        </div>
                                    </div>
                                    {w.passive && (
                                        <div style={{ 
                                            fontSize: '0.65rem', 
                                            color: '#a855f7', 
                                            marginTop: '8px', 
                                            borderTop: '1px solid #333',
                                            paddingTop: '8px',
                                            fontStyle: 'italic'
                                        }}>
                                            {w.passive}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isEquipped && (
                                <div className="item-count" style={{
                                    top: '5px', right: '5px', bottom: 'auto',
                                    background: '#10b981', color: '#000', fontSize: '0.5rem',
                                    border: 'none'
                                }}>EQ</div>
                            )}
                            <span className="item-icon">{w.emoji}</span>
                            <div style={{ fontSize: '0.55rem', fontWeight: '900', color: w.rarity.color, marginBottom: '2px' }}>{w.rarity.name}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#fff' }}>{w.chance}</div>
                            <div style={{ fontSize: '0.5rem', opacity: 0.4, marginTop: '2px' }}>{w.type}</div>
                        </div>
                    );
                })}
                {filteredWorkers.length === 0 && (
                    <div style={{ gridColumn: 'span 3', padding: '60px', opacity: 0.2, textAlign: 'center', fontSize: '0.9rem', letterSpacing: '2px' }}>
                        VACANT POSITIONS
                    </div>
                )}
            </div>
        </div>
    );
}
