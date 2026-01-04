import React from 'react';
import '../App.css';

export const StartScreen = ({ onStart }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at center, #2c2c2c 0%, #000 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            color: '#fff'
        }}>
            {}
            <div style={{
                marginBottom: '60px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '5rem',
                    color: '#ef4444',
                    margin: 0,
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '12px',
                    fontWeight: '900',
                    fontFamily: 'Pirata One, cursive',
                    textShadow: '0 0 40px rgba(239, 68, 68, 0.5), 0 4px 8px rgba(0, 0, 0, 0.8)',
                    filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
                }}>
                    CURSED BUSINESS
                </h1>
                <p style={{
                    color: '#888',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    letterSpacing: '4px',
                    marginTop: '20px',
                    textTransform: 'uppercase'
                }}>
                    An Idle Crafting Adventure
                </p>
            </div>

            {}
            <div className="rbx-panel" style={{
                maxWidth: '600px',
                padding: '0',
                marginBottom: '40px',
                background: '#1c1c1c',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: '15px 30px',
                    borderTopLeftRadius: '6px',
                    borderTopRightRadius: '6px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h3 style={{ 
                        margin: 0,
                        color: '#fff',
                        fontSize: '1.2rem',
                        fontWeight: '900',
                        letterSpacing: '3px',
                        textAlign: 'center',
                        textTransform: 'uppercase'
                    }}>📖 How To Play</h3>
                </div>
                
                <div style={{ padding: '30px 40px' }}>
                    <div style={{ 
                        display: 'grid',
                        gap: '15px',
                        fontSize: '0.9rem',
                        lineHeight: '1.6'
                    }}>
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            borderLeft: '4px solid #3b82f6'
                        }}>
                            <div style={{ color: '#3b82f6', fontWeight: '900', marginBottom: '4px' }}>☀️ DAY PHASE</div>
                            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Recruit workers & fulfill customer orders</div>
                        </div>
                        
                        <div style={{
                            background: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            borderLeft: '4px solid #a855f7'
                        }}>
                            <div style={{ color: '#a855f7', fontWeight: '900', marginBottom: '4px' }}>🌙 NIGHT PHASE</div>
                            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Workers rest (reduced efficiency), no customers</div>
                        </div>
                        
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            borderLeft: '4px solid #10b981'
                        }}>
                            <div style={{ color: '#10b981', fontWeight: '900', marginBottom: '4px' }}>⚒️ CRAFTING</div>
                            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Gather materials and craft valuable items</div>
                        </div>
                        
                        <div style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            borderLeft: '4px solid #eab308'
                        }}>
                            <div style={{ color: '#eab308', fontWeight: '900', marginBottom: '4px' }}>🌍 EXPLORATION</div>
                            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Fight monsters, collect coins & find relics</div>
                        </div>
                        
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            borderLeft: '4px solid #ef4444'
                        }}>
                            <div style={{ color: '#ef4444', fontWeight: '900', marginBottom: '4px' }}>🔄 REBIRTH</div>
                            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Reset for permanent upgrades & bonuses</div>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <button
                className="rbx-btn"
                onClick={onStart}
                style={{
                    padding: '20px 80px',
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    fontWeight: '900',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 0 #1e40af, 0 8px 30px rgba(59, 130, 246, 0.4)',
                    border: 'none',
                    borderRadius: '4px'
                }}
                onMouseEnter={e => {
                    e.target.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 0 #1e40af, 0 12px 40px rgba(59, 130, 246, 0.6)';
                }}
                onMouseLeave={e => {
                    e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 0 #1e40af, 0 8px 30px rgba(59, 130, 246, 0.4)';
                }}
            >
                ▶ Start Game
            </button>

            {}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                color: '#444',
                fontSize: '0.7rem',
                fontWeight: '800',
                letterSpacing: '2px'
            }}>
                v1.0.0
            </div>
        </div>
    );
};
