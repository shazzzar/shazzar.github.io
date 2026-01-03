import React from 'react';

export const StartScreen = ({ onStart }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            color: '#fff'
        }}>
            <h1 style={{
                fontSize: '4rem',
                color: '#a855f7',
                textShadow: '0 0 20px #a855f7',
                marginBottom: '10px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '5px'
            }}>
                Cursed Business
            </h1>
            <p style={{
                maxWidth: '600px',
                textAlign: 'center',
                color: '#ccc',
                marginBottom: '40px',
                lineHeight: '1.6'
            }}>
                Manage your cursed shop through day and night cycles.
                <br />
                Recruit workers, craft items, and build your empire.
            </p>

            <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #333',
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24' }}>HOW TO PLAY</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', fontSize: '0.9rem' }}>
                    <li style={{ marginBottom: '5px' }}>☀️ <strong>DAY:</strong> Recruit workers & fulfill customer orders</li>
                    <li style={{ marginBottom: '5px' }}>🌙 <strong>NIGHT:</strong> Workers rest, no customers spawn</li>
                    <li style={{ marginBottom: '5px' }}>⚒️ <strong>CRAFT:</strong> Gather materials and create items</li>
                    <li style={{ marginBottom: '5px' }}>🔄 <strong>REBIRTH:</strong> Reset for permanent upgrades</li>
                </ul>
            </div>

            <button
                onClick={onStart}
                style={{
                    padding: '15px 50px',
                    fontSize: '1.5rem',
                    background: '#a855f7',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                    transition: 'transform 0.1s'
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
                START GAME
            </button>
        </div>
    );
};
