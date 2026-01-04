import { useState } from 'react';
import '../Modal.css';

export function Tutorial({ onComplete }) {
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        {
            title: "Welcome to CURSED BUSINESS! 👹",
            content: (
                <div>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        You run a mysterious shop that operates between <span style={{ color: '#fbbf24' }}>DAY ☀️</span> and <span style={{ color: '#a855f7' }}>NIGHT 🌙</span>.
                    </p>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Your goal: Earn <span style={{ color: '#fff' }}>HONOR 🔮</span> by serving customers and survive as long as possible!
                    </p>
                    <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '6px', fontWeight: 'bold' }}>⏰ Day/Night Cycle</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', lineHeight: '1.5' }}>
                            Watch the <span style={{ color: '#fbbf24' }}>TIME ⏰</span> in the top-left HUD. Each phase lasts 2 minutes by default.
                        </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                        ⚠️ If your Honor reaches 0 at the start of a new day, it's GAME OVER.
                    </p>
                </div>
            )
        },
        {
            title: "Step 1: Recruit Workers 👷",
            content: (
                <div>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Click the <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>RECRUIT</span> button on the main screen to roll for workers.
                    </p>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Workers come in different rarities and types. Better rarities = stronger gathering power!
                    </p>
                    <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '8px' }}>Rarities (from common to rare):</div>
                        <div style={{ fontSize: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{ color: '#888' }}>Common</span>
                            <span style={{ color: '#22c55e' }}>Uncommon</span>
                            <span style={{ color: '#3b82f6' }}>Rare</span>
                            <span style={{ color: '#a855f7' }}>Epic</span>
                            <span style={{ color: '#eab308' }}>Legendary</span>
                            <span style={{ color: '#ff0055' }}>Mythic</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Step 2: Equip Workers 📦",
            content: (
                <div>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Open the <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Workers 👷</span> menu (left sidebar).
                    </p>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Click <span style={{ color: '#10b981', fontWeight: 'bold' }}>EQUIP BEST</span> to automatically equip your strongest workers.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>
                        💡 Equipped workers automatically gather materials during the NIGHT phase!
                    </p>
                </div>
            )
        },
        {
            title: "Step 3: Night Phase & Crafting 🌙",
            content: (
                <div>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        During the <span style={{ color: '#a855f7' }}>NIGHT 🌙</span>, your workers gather materials automatically.
                    </p>
                    <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #a855f7' }}>
                        <div style={{ fontSize: '0.75rem', color: '#a855f7', marginBottom: '6px' }}>⚠️ Night Challenges:</div>
                        <div style={{ fontSize: '0.7rem', color: '#aaa', lineHeight: '1.5' }}>
                            • Workers are LESS productive at night<br/>
                            • Small chance for a <span style={{ color: '#fbbf24' }}>special client</span> to appear
                        </div>
                    </div>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Open <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Crafting ⚒️</span> (right sidebar) to combine materials into items.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>
                        💡 Check your Inventory 📦 to see what materials you have!
                    </p>
                </div>
            )
        },
        {
            title: "Step 4: Day Phase & Customers ☀️",
            content: (
                <div>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        During the <span style={{ color: '#fbbf24' }}>DAY ☀️</span>, customers arrive asking for specific items.
                    </p>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Open <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Customers 👤</span> (right sidebar) to see their requests.
                    </p>
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Sell items to earn <span style={{ color: '#fff' }}>HONOR 🔮</span>!
                    </p>
                    <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#ffd700', marginBottom: '6px', fontWeight: 'bold' }}>💰 Earning Coins:</div>
                        <div style={{ fontSize: '0.7rem', color: '#aaa', lineHeight: '1.5' }}>
                            <span style={{ color: '#ffd700' }}>COINS 🪙</span> are earned by defeating monsters in the <span style={{ color: '#10b981' }}>WORLD 🌍</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#f87171' }}>
                        ⚠️ If you can't fulfill requests, you'll lose Honor!
                    </p>
                </div>
            )
        },
        {
            title: "Understanding the HUD 📊",
            content: (
                <div>
                    <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '8px', fontWeight: 'bold' }}>Top-Left Stats:</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', lineHeight: '1.6' }}>
                            • <span style={{ color: '#fff' }}>HONOR 🔮</span> - Your main currency (sell items to earn)<br/>
                            • <span style={{ color: '#fbbf24' }}>TIME ⏰</span> - Countdown until phase change<br/>
                            • <span style={{ color: '#f87171' }}>DAY #</span> - Current day number
                        </div>
                    </div>
                    <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '8px', fontWeight: 'bold' }}>Top-Right Stats:</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', lineHeight: '1.6' }}>
                            • <span style={{ color: '#fbbf24' }}>SHOP LVL 🏪</span> - Higher level = better items unlock<br/>
                            • <span style={{ color: '#f472b6' }}>GEMS 💎</span> - Permanent currency (from rebirth)<br/>
                            • <span style={{ color: '#ffd700' }}>COINS 🪙</span> - Earned from defeating monsters
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
                        All stats are visible at the top of your screen during gameplay!
                    </p>
                </div>
            )
        },
        {
            title: "Advanced Features 🚀",
            content: (
                <div>
                    <p style={{ marginBottom: '12px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🛒 Shop:</span> Spend Honor/Gems on permanent upgrades
                    </p>
                    <p style={{ marginBottom: '12px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🪙 Material Shop:</span> Buy materials with Coins (left sidebar)
                    </p>
                    <p style={{ marginBottom: '12px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🌍 WORLD:</span> Battle monsters for Coins & Relics
                    </p>
                    <p style={{ marginBottom: '12px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔄 Rebirth:</span> Reset progress for permanent luck & gem
                    </p>
                    <p style={{ marginBottom: '12px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🌍 WORLD:</span> Battle monsters for relics (unlocks later)
                    </p>
                    <p style={{ marginBottom: '12px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔄 Rebirth:</span> Reset progress for permanent bonuses (Day 10+)
                    </p>
                    <p style={{ marginBottom: '12px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📚 Index:</span> Track all discovered items and workers
                    </p>
                    <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold', textAlign: 'center' }}>
                        Good luck, and may your business thrive! 👹✨
                    </p>
                </div>
            )
        }
    ];

    const currentStep = tutorialSteps[step];

    const handleNext = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 10000, background: 'rgba(0, 0, 0, 0.95)' }}>
            <div className="modal-content rbx-panel" style={{ maxWidth: '600px', maxHeight: '80vh' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.2rem' }}>{currentStep.title}</h2>
                    <button className="rbx-btn close-btn" onClick={handleSkip} style={{ fontSize: '1rem' }}>SKIP</button>
                </div>
                <div style={{ padding: '30px 25px', minHeight: '250px' }}>
                    {currentStep.content}
                </div>
                <div style={{ 
                    padding: '20px 25px', 
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: '800' }}>
                        STEP {step + 1} / {tutorialSteps.length}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {step > 0 && (
                            <button 
                                className="rbx-btn" 
                                onClick={() => setStep(step - 1)}
                                style={{ padding: '10px 20px', fontSize: '0.85rem', opacity: 0.7 }}
                            >
                                ← BACK
                            </button>
                        )}
                        <button 
                            className="rbx-btn" 
                            onClick={handleNext}
                            style={{ 
                                padding: '10px 30px', 
                                fontSize: '0.9rem',
                                fontWeight: '900',
                                background: step === tutorialSteps.length - 1 ? '#10b981' : '#3b82f6'
                            }}
                        >
                            {step === tutorialSteps.length - 1 ? 'START PLAYING! ✨' : 'NEXT →'}
                        </button>
                    </div>
                </div>
                <div style={{ 
                    display: 'flex', 
                    gap: '6px', 
                    justifyContent: 'center',
                    padding: '0 25px 20px'
                }}>
                    {tutorialSteps.map((_, idx) => (
                        <div 
                            key={idx} 
                            style={{
                                width: '30px',
                                height: '4px',
                                background: idx === step ? '#3b82f6' : '#333',
                                borderRadius: '2px',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
