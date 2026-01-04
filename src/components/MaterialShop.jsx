import React, { useState } from 'react';
import { MATERIALS } from '../utils/workerRNG';

export function MaterialShop({
    coins,
    addCoins,
    addItemToInventory,
    materialPurchases,
    setMaterialPurchases,
    coinPayoutAudio
}) {
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const [hoveredItem, setHoveredItem] = useState(null);
    
    const BASE_PRICES = {
        'COMMON': 10,
        'UNCOMMON': 25,
        'RARE': 75,
        'EPIC': 200,
        'LEGENDARY': 500,
        'MYTHIC': 2000
    };

    const getPrice = (materialId, rarity) => {
        const basePrice = BASE_PRICES[rarity] || 10;
        const purchases = materialPurchases[materialId] || 0;
        const increaseFactor = Math.floor(purchases / 10);
        return Math.floor(basePrice * (1 + increaseFactor * 0.5));
    };

    const buyMaterial = (material) => {
        const price = getPrice(material.id, material.rarity);
        if (coins >= price) {
            addCoins(-price);
            addItemToInventory(material.id, 1);
            setMaterialPurchases(prev => ({
                ...prev,
                [material.id]: (prev[material.id] || 0) + 1
            }));

            if (coinPayoutAudio?.current) {
                coinPayoutAudio.current.currentTime = 0;
                coinPayoutAudio.current.volume = 0.5;
                coinPayoutAudio.current.play().catch(e => console.log("Audio play blocked"));
            }
        }
    };

    const sortedMaterials = [...MATERIALS].sort((a, b) => {
        const rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });

    return (
        <>
            <div className="inventory-grid">
                {sortedMaterials.map(mat => {
                    const price = getPrice(mat.id, mat.rarity);
                    const purchases = materialPurchases[mat.id] || 0;
                    const canAfford = coins >= price;

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
                            key={mat.id} 
                            className="inv-item" 
                            style={{ 
                                borderLeft: `4px solid ${rarityColors[mat.rarity]}`,
                                cursor: canAfford ? 'pointer' : 'not-allowed',
                                opacity: canAfford ? 1 : 0.5,
                                position: 'relative'
                            }}
                            onClick={() => canAfford && buyMaterial(mat)}
                            onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 20 });
                                setHoveredItem({ mat, price, purchases, canAfford });
                            }}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <span className="item-icon">{mat.emoji}</span>
                            <div className="item-chance-tag" style={{ 
                                background: rarityColors[mat.rarity],
                                color: '#000',
                                fontWeight: 'bold'
                            }}>
                                {price} 🪙
                            </div>
                            {purchases > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    background: 'rgba(0,0,0,0.7)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    color: '#aaa'
                                }}>
                                    Bought: {purchases}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {}
            {hoveredItem && (() => {
                const { mat, price, purchases, canAfford } = hoveredItem;
                const rarityColors = {
                    'MYTHIC': '#ff0055',
                    'LEGENDARY': '#eab308',
                    'EPIC': '#a855f7',
                    'RARE': '#3b82f6',
                    'UNCOMMON': '#22c55e',
                    'COMMON': '#888'
                };
                
                return (
                    <div style={{
                        position: 'fixed',
                        top: `${tooltipPos.top}px`,
                        left: `${tooltipPos.left}px`,
                        transform: 'translateY(-50%)',
                        background: '#1a1a1a',
                        border: `2px solid ${rarityColors[mat.rarity]}`,
                        borderRadius: '8px',
                        padding: '16px',
                        minWidth: '200px',
                        zIndex: 10000,
                        boxShadow: `0 0 30px ${rarityColors[mat.rarity]}88`,
                        pointerEvents: 'none'
                    }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: rarityColors[mat.rarity], marginBottom: '10px' }}>
                            {mat.emoji} {mat.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '8px' }}>
                            {mat.rarity}
                        </div>
                        <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#fbbf24', marginBottom: '4px' }}>
                                Price: {price} 🪙
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '4px' }}>
                                Gather Chance: {mat.chance}
                            </div>
                            {purchases > 0 && (
                                <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>
                                    Purchased: {purchases}x
                                </div>
                            )}
                        </div>
                        <div style={{ 
                            fontSize: '0.65rem', 
                            color: canAfford ? '#10b981' : '#ef4444',
                            marginTop: '8px',
                            fontWeight: '900'
                        }}>
                            {canAfford ? 'Click to purchase' : 'Not enough coins'}
                        </div>
                    </div>
                );
            })()}
        </>
    );
}
