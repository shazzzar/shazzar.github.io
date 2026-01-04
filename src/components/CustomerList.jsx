import { WORKER_TYPES } from '../utils/workerRNG';
export function CustomerList({ customers, inventory, sellToCustomer }) {
    return (
        <div className="inventory-grid" style={{ padding: '20px' }}>
            {customers.length === 0 && (
                <div style={{ gridColumn: 'span 3', padding: '60px', textAlign: 'center', opacity: 0.2 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⌛</div>
                    Waiting for customers...
                </div>
            )}
            {customers.map(cust => {
                const canSell = (inventory.crafted[cust.request.id] || 0) > 0;
                const isShady = cust.isShady || false;
                return (
                    <div key={cust.id} className="inv-item" style={{
                        opacity: canSell ? 1 : 0.6,
                        border: isShady 
                            ? (canSell ? '2px solid #a855f7' : '2px solid #6b21a8')
                            : (canSell ? '1px solid #3b82f6' : '1px solid #333'),
                        background: isShady
                            ? (canSell ? 'rgba(168, 85, 247, 0.15)' : 'rgba(107, 33, 168, 0.1)')
                            : (canSell ? 'rgba(59, 130, 246, 0.05)' : '#252525'),
                        boxShadow: isShady ? '0 0 20px rgba(168, 85, 247, 0.3)' : 'none'
                    }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{isShady ? '🕵️' : '👤'}</div>
                        <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '900', 
                            color: isShady ? '#a855f7' : '#fff', 
                            marginBottom: '2px',
                            textShadow: isShady ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none'
                        }}>{cust.name}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Wants:</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: isShady ? '#a855f7' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            {cust.request.emoji} {cust.request.name}
                        </div>
                        <button
                            className="rbx-btn"
                            disabled={!canSell}
                            onClick={() => sellToCustomer(cust.id)}
                            style={{
                                marginTop: '12px',
                                width: '100%',
                                padding: '8px',
                                fontSize: '0.7rem',
                                background: canSell ? (isShady ? '#a855f7' : '#3b82f6') : '#444',
                                cursor: canSell ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {canSell ? 'SELL ITEM' : 'NEED ITEM'}
                        </button>
                        <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#fbbf24', marginTop: '8px' }}>
                            +{cust.reward.toLocaleString()} Honor
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

