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

                return (
                    <div key={cust.id} className="inv-item" style={{
                        opacity: canSell ? 1 : 0.6,
                        border: canSell ? '1px solid #3b82f6' : '1px solid #333',
                        background: canSell ? 'rgba(59, 130, 246, 0.05)' : '#252525'
                    }}>
                        <div className="item-tooltip">
                            <span className="tooltip-title">{cust.name}</span>
                            <span className="tooltip-rarity" style={{ color: '#fbbf24' }}>CLIENT REASON: PURCHASE</span>
                            <div className="tooltip-desc">
                                This client is looking for a {cust.request.name}. <br /><br />
                                <strong>REWARD:</strong> <span style={{ color: '#fff' }}>{cust.reward.toLocaleString()} 🔮</span>
                            </div>
                        </div>

                        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>👤</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#fff', marginBottom: '2px' }}>{cust.name}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Wants:</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
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
                                background: canSell ? '#3b82f6' : '#444',
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
