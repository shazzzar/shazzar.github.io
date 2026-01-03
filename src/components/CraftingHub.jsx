import { useState, useMemo } from 'react';
import { MATERIALS, CRAFTED_ITEMS } from '../utils/workerRNG';

export function CraftingHub({ inventory, craftItem, customers }) {
    const [staged, setStaged] = useState({}); // { matId: count }

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

    // Find if current staged materials match a recipe (supports bulk)
    const { resultItem, multiplier } = useMemo(() => {
        const stagedEntries = Object.entries(staged).filter(([_, count]) => count > 0);
        if (stagedEntries.length === 0) return { resultItem: null, multiplier: 0 };

        for (const item of CRAFTED_ITEMS) {
            const recipeEntries = Object.entries(item.recipe);

            // Must have exactly the same types of materials
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

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', height: '100%', minHeight: '480px' }}>
            {/* LEFT: RECIPE LIST */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '15px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '900', opacity: 0.5, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recipe Book</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {CRAFTED_ITEMS.map(item => {
                        const recipeParts = Object.entries(item.recipe);
                        const isRequested = customers && customers.some(c => c.request.id === item.id);
                        const requestCount = customers ? customers.filter(c => c.request.id === item.id).length : 0;

                        return (
                            <div key={item.id} onClick={() => addToStageFromRecipe(item)} className="recipe-card" style={{ position: 'relative' }}>
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
                                        {isRequested && <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '900' }}>👤</span>}
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

            {/* RIGHT: CRAFTING WORKSTATION */}
            <div style={{ flex: 1.2, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '900', opacity: 0.5, marginBottom: '20px', textTransform: 'uppercase', textAlign: 'center' }}>Workstation Slot</div>

                {/* THE SLOT SQUARE */}
                <div style={{
                    flex: 1, border: '2px dashed #333', borderRadius: '15px',
                    display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '15px', alignContent: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.02)', position: 'relative'
                }}>
                    {Object.entries(staged).map(([id, count]) => {
                        if (count <= 0) return null;
                        const mat = MATERIALS.find(m => m.id === id);
                        return (
                            <div key={id} onClick={() => removeFromStage(id)} style={{
                                width: '45px', height: '45px', background: '#333', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer'
                            }}>
                                <div style={{ fontSize: '1.2rem' }}>{mat?.emoji}</div>
                                <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#000', padding: '2px 4px', borderRadius: '4px', fontSize: '0.5rem', fontWeight: '900' }}>x{count}</div>
                            </div>
                        );
                    })}

                    {Object.keys(staged).every(k => staged[k] === 0) && (
                        <div style={{ color: '#444', fontSize: '0.8rem', fontWeight: '900' }}>SELECT MATERIALS</div>
                    )}
                </div>

                {/* RESULT PREVIEW */}
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
        </div>
    );
}
