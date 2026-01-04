import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { MATERIALS } from '../utils/workerRNG';
const FlyingItem = memo(({ matId, x, y, onComplete }) => {
    const mat = useMemo(() => MATERIALS.find(m => m.id === matId), [matId]);
    useEffect(() => {
        const timer = setTimeout(onComplete, 1100);
        return () => clearTimeout(timer);
    }, [onComplete]);
    const className = useMemo(() => {
        const rarity = mat?.rarity?.toLowerCase() || '';
        const isRare = mat?.rarity === 'MYTHIC' || mat?.rarity === 'LEGENDARY';
        return `flying-item ${rarity} ${isRare ? 'rare-item' : ''}`;
    }, [mat]);
    return (
        <div className={className} style={{ left: x, top: y }}>
            {mat?.emoji || '💎'}
        </div>
    );
});
const BackgroundWorker = memo(({ worker, gatherEvents, onVisualTrigger }) => {
    const [pos, setPos] = useState(() => ({
        x: Math.random() * (window.innerWidth - 150) + 75,
        y: Math.random() * (window.innerHeight - 150) + 75
    }));
    const [target, setTarget] = useState(pos);
    const [isMoving, setIsMoving] = useState(false);
    const speed = useRef(0.2 + Math.random() * 0.5);
    const processedEvents = useRef(new Set());
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setTarget({
                x: Math.random() * (window.innerWidth - 150) + 75,
                y: Math.random() * (window.innerHeight - 150) + 75
            });
            setIsMoving(true);
        }, 3000 + Math.random() * 4000);
        return () => clearInterval(moveInterval);
    }, []);
    useEffect(() => {
        let frame;
        const move = () => {
            setPos(prev => {
                const dx = target.x - prev.x;
                const dy = target.y - prev.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 2) {
                    setIsMoving(false);
                    return prev;
                }
                return {
                    x: prev.x + (dx / dist) * speed.current,
                    y: prev.y + (dy / dist) * speed.current
                };
            });
            frame = requestAnimationFrame(move);
        };
        move();
        return () => cancelAnimationFrame(frame);
    }, [target]);
    useEffect(() => {
        const myEvents = gatherEvents.filter(e => e.workerId === worker.id);
        myEvents.forEach(e => {
            if (!processedEvents.current.has(e.eventId)) {
                processedEvents.current.add(e.eventId);
                onVisualTrigger(e, pos);
            }
        });
        if (processedEvents.current.size > 50) {
            const arr = Array.from(processedEvents.current);
            processedEvents.current = new Set(arr.slice(-30));
        }
    }, [gatherEvents, worker.id, pos, onVisualTrigger]);
    const containerClass = useMemo(() =>
        `worker-cube-container worker-aura-${worker.rarityKey.toLowerCase()} ${isMoving ? 'is-moving' : ''}`,
        [worker.rarityKey, isMoving]
    );
    return (
        <div
            className={containerClass}
            style={{
                left: pos.x,
                top: pos.y,
                zIndex: worker.rarityKey === 'MYTHIC' ? 10 : 1
            }}
        >
            <div className="worker-cube shadow-rbx">
                <span style={{ fontSize: '1.2rem' }}>{worker.emoji}</span>
            </div>
        </div>
    );
});
export const BackgroundWorkers = memo(({ equippedWorkers, gatherEvents, masterVolume }) => {
    const [flights, setFlights] = useState([]);
    const [popupBatch, setPopupBatch] = useState(null);
    const [rareNotice, setRareNotice] = useState(null);
    const countBuffer = useRef(0);
    const batchTimer = useRef(null);
    const pickupAudio = useRef(null);
    useEffect(() => {
        pickupAudio.current = new Audio('/sounds/pick-92276.mp3');
        return () => {
            if (pickupAudio.current) {
                pickupAudio.current.pause();
                pickupAudio.current = null;
            }
        };
    }, []);
    useEffect(() => {
        if (pickupAudio.current) {
            pickupAudio.current.volume = masterVolume * 0.8;
        }
    }, [masterVolume]);
    const allWorkers = useMemo(() => Object.values(equippedWorkers).flat(), [equippedWorkers]);
    const handleFlightStart = useCallback((event, startPos) => {
        if (event.chance < 0.01) {
            const matName = MATERIALS.find(m => m.id === event.matId)?.name;
            setRareNotice({ id: Math.random(), name: matName });
            setTimeout(() => setRareNotice(null), 2000);
        }
        setFlights(prev => {
            if (prev.find(f => f.eventId === event.eventId)) return prev;
            return [...prev, { ...event, x: startPos.x, y: startPos.y }];
        });
        if (pickupAudio.current) {
            pickupAudio.current.currentTime = 0;
            pickupAudio.current.play().catch(() => { });
        }
    }, []);
    const handleFlightEnd = useCallback((flight) => {
        setFlights(prev => prev.filter(f => f.eventId !== flight.eventId));
        countBuffer.current += (flight.amount || 1);
        if (batchTimer.current) clearTimeout(batchTimer.current);
        batchTimer.current = setTimeout(() => {
            const finalCount = countBuffer.current;
            countBuffer.current = 0;
            setPopupBatch({ id: Math.random(), count: finalCount });
            setTimeout(() => setPopupBatch(null), 800);
        }, 150);
    }, []);
    return (
        <div className="background-visuals-layer">
            {allWorkers.map(w => (
                <BackgroundWorker
                    key={w.id}
                    worker={w}
                    gatherEvents={gatherEvents}
                    onVisualTrigger={handleFlightStart}
                />
            ))}
            {flights.map(f => (
                <FlyingItem
                    key={f.eventId}
                    matId={f.matId}
                    x={f.x}
                    y={f.y}
                    onComplete={() => handleFlightEnd(f)}
                />
            ))}
            {rareNotice && (
                <div className="rare-gather-announcement">
                    <div className="rare-gather-text">RARE ITEM FOUND!</div>
                    <div className="rare-gather-name">{rareNotice.name}</div>
                </div>
            )}
            {popupBatch && (
                <div className="inventory-pop-feedback">
                    +{popupBatch.count}
                </div>
            )}
        </div>
    );
});

