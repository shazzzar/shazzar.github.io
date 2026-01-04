import { useState, useMemo, useRef } from 'react';
import { MATERIALS, CRAFTED_ITEMS } from '../utils/workerRNG';
export function CraftingHub({ inventory, craftItem, customers, bingAudio }) {
    const [staged, setStaged] = useState({}); 
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const [hoveredItem, setHoveredItem] = useState(null);
    const addToStage = (id) => {
        const available = inventory[id] || 0;
        const currentInStage = staged[id] || 0;
        if (currentInStage < available) {
            setStaged(prev => ({ ...prev, [id]: currentInStage + 1 }));
        }
    };
    const removeFromStage = (id) => {
        if (staged[id] > 0) {
            setStaged(prev => ({ ...prev, [id]: prev[id] - 1 }));
        }
    };
    const clearStage = () => setStaged({});
    const { resultItem, multiplier } = useMemo(() => {
        const stagedEntries = Object.entries(staged).filter(([_, count]) => count > 0);
        if (stagedEntries.length === 0) return { resultItem: null, multiplier: 0 };
        for (const item of CRAFTED_ITEMS) {
            const recipeEntries = Object.entries(item.recipe);
            if (recipeEntries.length !== stagedEntries.length) continue;
            const firstMat = recipeEntries[0];
            const stagedCount = staged[firstMat[0]] || 0;
            const neededCount = firstMat[1];
            if (stagedCount % neededCount !== 0) continue;
            const mult = stagedCount / neededCount;
            if (mult === 0) continue;
            const matches = recipeEntries.every(([id, needed]) => staged[id] === (needed * mult));
            if (matches) return { resultItem: item, multiplier: mult };
        }
        return { resultItem: null, multiplier: 0 };
    }, [staged]);
    const handleCraft = () => {
        if (!resultItem) return;
        if (bingAudio?.current) {
            bingAudio.current.currentTime = 0;
            bingAudio.current.volume = 0.4;
            bingAudio.current.play().catch(e => console.log("Audio play blocked"));
            setTimeout(() => {
                bingAudio.current.currentTime = 0;
                bingAudio.current.play().catch(e => console.log("Audio play blocked"));
            }, 300);
        }
        const success = craftItem(resultItem, multiplier);
        if (success) {
            clearStage();
        }
    };
    const addToStageFromRecipe = (recipe) => {
        setStaged(prev => {
            const next = { ...prev };
            let canAddAll = true;
            Object.entries(recipe.recipe).forEach(([id, needed]) => {
                const available = inventory[id] || 0;
                const currentStaged = prev[id] || 0;
                if (available - currentStaged < needed) {
                    canAddAll = false;
                }
            });
            if (canAddAll) {
                Object.entries(recipe.recipe).forEach(([id, needed]) => {
                    next[id] = (next[id] || 0) + needed;
                });
                return next;
            }
            return prev;
        });
    };
    const handleMouseEnter = (e, item) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({
            top: rect.top + rect.height / 2,
            left: rect.right + 20
        });
        setHoveredItem(item);
    };
    const handleMouseLeave = () => {
        setHoveredItem(null);
    };
    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', height: '100%', minHeight: '480px' }}>
            {}
            <div style={{ flex: 1.5, background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '15px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '900', opacity: 0.5, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recipe Book</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {CRAFTED_ITEMS.map(item => {
                        const recipeParts = Object.entries(item.recipe);
                        const isRequested = customers && customers.some(c => c.request.id === item.id);
                        const requestCount = customers ? customers.filter(c => c.request.id === item.id).length : 0;
                        return (
                            <div 
                                key={item.id} 
                                onClick={() => addToStageFromRecipe(item)} 
                                onMouseEnter={(e) => handleMouseEnter(e, item)}
                                onMouseLeave={handleMouseLeave}
                                className="recipe-card" 
                                style={{ position: 'relative' }}
                            >
                                {isRequested && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        background: '#ef4444',
                                        color: '#fff',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: '900',
                                        border: '2px solid #000',
                                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                                        zIndex: 10
                                    }}>
                                        {requestCount}
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: '900', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {item.emoji} {item.name}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {recipeParts.map(([id, needed]) => {
                                            const available = inventory[id] || 0;
                                            const currentStaged = staged[id] || 0;
                                            const remaining = available - currentStaged;
                                            return (
                                                <span key={id} style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: '800',
                                                    color: remaining >= needed ? '#10b981' : '#ef4444'
                                                }}>
                                                    {MATERIALS.find(m => m.id === id)?.emoji} {needed}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {}
            <div style={{ flex: 2, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '900', opacity: 0.5, textTransform: 'uppercase' }}>Workstation Slot</div>
                    <button 
                        onClick={clearStage}
                        className="rbx-btn"
                        disabled={Object.values(staged).every(count => count === 0)}
                        style={{
                            padding: '6px 12px',
                            fontSize: '0.7rem',
                            fontWeight: '900',
                            background: Object.values(staged).some(count => count > 0) ? '#ef4444' : '#444',
                            cursor: Object.values(staged).some(count => count > 0) ? 'pointer' : 'not-allowed',
                            border: 'none'
                        }}
                    >
                        CLEAR
                    </button>
                </div>
                {}
                <div style={{
                    flex: 1, border: '2px dashed #333', borderRadius: '15px',
                    display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: '10px', padding: '15px', alignContent: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.02)', position: 'relative'
                }}>
                    {Object.entries(staged).map(([id, count]) => {
                        if (count <= 0) return null;
                        const mat = MATERIALS.find(m => m.id === id);
                        return (
                            <div 
                                key={id} 
                                onClick={() => removeFromStage(id)} 
                                onMouseEnter={(e) => handleMouseEnter(e, { type: 'material', mat, count, inventory: inventory[id] || 0 })}
                                onMouseLeave={handleMouseLeave}
                                className="inv-item"
                                style={{
                                    width: '45px', height: '45px', background: '#333', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontSize: '1.2rem' }}>{mat?.emoji}</div>
                                <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#000', padding: '2px 4px', borderRadius: '4px', fontSize: '0.5rem', fontWeight: '900' }}>x{count}</div>
                            </div>
                        );
                    })}
                    {Object.keys(staged).every(k => staged[k] === 0) && (
                        <div style={{ color: '#444', fontSize: '0.8rem', fontWeight: '900' }}>SELECT MATERIALS</div>
                    )}
                </div>
                {}
                <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px', textAlign: 'center' }}>
                    {resultItem ? (
                        <div className="roll-anim">
                            <div style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: '900', textTransform: 'uppercase' }}>CRAFT {multiplier > 1 ? `${multiplier} ITEMS` : 'ITEM'}:</div>
                            <div style={{ fontSize: '1.5rem', margin: '5px 0' }}>{resultItem.emoji} {resultItem.name}</div>
                            <button className="rbx-btn" onClick={handleCraft} style={{ width: '100%', padding: '10px', background: '#3b82f6', fontWeight: '900' }}>CRAFT NOW</button>
                        </div>
                    ) : (
                        <div style={{ opacity: 0.2, fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>NO VALID RECIPE</div>
                    )}
                </div>
            </div>
            {}
            {hoveredItem && (
                <div 
                    className="item-tooltip" 
                    style={{ 
                        top: `${tooltipPos.top}px`, 
                        left: `${tooltipPos.left}px`,
                        opacity: 1,
                        visibility: 'visible',
                        transform: 'translateY(-50%) scale(1)'
                    }}
                >
                    {hoveredItem.type === 'material' ? (
                        <>
                            <span className="tooltip-title">{hoveredItem.mat?.emoji} {hoveredItem.mat?.name}</span>
                            <span className="tooltip-rarity" style={{ color: '#10b981' }}>MATERIAL</span>
                            <div className="tooltip-desc">
                                <strong>In Workstation:</strong> x{hoveredItem.count}<br />
                                <strong>In Inventory:</strong> x{hoveredItem.inventory}<br /><br />
                                Click to remove from workstation
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="tooltip-title">{hoveredItem.emoji} {hoveredItem.name}</span>
                            <span className="tooltip-rarity" style={{ color: '#3b82f6' }}>RECIPE</span>
                            <div className="tooltip-desc">
                                <strong>Materials Needed:</strong><br />
                                {Object.entries(hoveredItem.recipe).map(([id, needed]) => {
                                    const mat = MATERIALS.find(m => m.id === id);
                                    const available = inventory[id] || 0;
                                    const currentStaged = staged[id] || 0;
                                    const remaining = available - currentStaged;
                                    return (
                                        <div key={id} style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{mat?.emoji} {mat?.name}:</span>
                                            <span style={{ color: remaining >= needed ? '#10b981' : '#ef4444', fontWeight: '900' }}>
                                                {remaining}/{needed}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

