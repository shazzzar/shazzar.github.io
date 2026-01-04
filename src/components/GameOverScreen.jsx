import React from 'react';
export const GameOverScreen = ({ dayCount, maxHonor, onRestart }) => {
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
                fontSize: '5rem',
                color: '#ef4444',
                textShadow: '0 0 30px #ef4444',
                marginBottom: '0',
                textTransform: 'uppercase',
                letterSpacing: '5px'
            }}>
                GAME OVER
            </h1>
            <h2 style={{
                marginTop: '10px',
                marginBottom: '40px',
                color: '#999',
                fontWeight: '400',
                letterSpacing: '2px'
            }}>
                Your business has been consumed by the void.
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div style={{
                    background: '#1a1a1a',
                    padding: '20px 40px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>DAYS SURVIVED</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff' }}>{dayCount}</div>
                </div>
                <div style={{
                    background: '#1a1a1a',
                    padding: '20px 40px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>PEAK HONOR</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#a855f7' }}>{maxHonor.toLocaleString()}</div>
                </div>
            </div>
            <button
                onClick={onRestart}
                style={{
                    padding: '15px 50px',
                    fontSize: '1.5rem',
                    background: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#000',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
                    transition: 'transform 0.1s'
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
                TRY AGAIN
            </button>
        </div>
    );
};

