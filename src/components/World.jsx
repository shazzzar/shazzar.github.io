import { useState, useEffect, useRef } from 'react';
import '../World.css';

// World-exclusive materials (added to main inventory)
const WORLD_MATERIALS = [
    // Original 10 materials
    { id: 'void_blade_shard', name: 'Void Blade Shard', emoji: '⚔️', rarity: 'LEGENDARY' },
    { id: 'arcane_essence', name: 'Arcane Essence', emoji: '🔮', rarity: 'EPIC' },
    { id: 'beast_fang', name: 'Beast Fang', emoji: '🦷', rarity: 'RARE' },
    { id: 'holy_water', name: 'Holy Water', emoji: '💧', rarity: 'RARE' },
    { id: 'demon_heart', name: 'Demon Heart', emoji: '❤️', rarity: 'EPIC' },
    { id: 'crystal_armor_piece', name: 'Crystal Armor Piece', emoji: '🛡️', rarity: 'LEGENDARY' },
    { id: 'shadow_fabric', name: 'Shadow Fabric', emoji: '🌑', rarity: 'EPIC' },
    { id: 'phoenix_feather', name: 'Phoenix Feather', emoji: '🪶', rarity: 'MYTHIC' },
    { id: 'cursed_ring_band', name: 'Cursed Ring Band', emoji: '💍', rarity: 'RARE' },
    { id: 'ancient_page', name: 'Ancient Page', emoji: '📖', rarity: 'LEGENDARY' },
    // NEW 10 materials - Monster Drops Only
    { id: 'nightmare_shard', name: 'Nightmare Shard', emoji: '💎', rarity: 'RARE' },
    { id: 'ectoplasm', name: 'Ectoplasm', emoji: '🫧', rarity: 'RARE' },
    { id: 'corrupted_bone', name: 'Corrupted Bone', emoji: '🦴', rarity: 'RARE' },
    { id: 'spectral_dust', name: 'Spectral Dust', emoji: '✨', rarity: 'EPIC' },
    { id: 'abyssal_ink', name: 'Abyssal Ink', emoji: '🖤', rarity: 'EPIC' },
    { id: 'wraith_cloth', name: 'Wraith Cloth', emoji: '👻', rarity: 'EPIC' },
    { id: 'doom_crystal', name: 'Doom Crystal', emoji: '💠', rarity: 'LEGENDARY' },
    { id: 'eldritch_eye', name: 'Eldritch Eye', emoji: '👁️', rarity: 'LEGENDARY' },
    { id: 'soul_fragment', name: 'Soul Fragment', emoji: '💜', rarity: 'LEGENDARY' },
    { id: 'oblivion_core', name: 'Oblivion Core', emoji: '⚫', rarity: 'MYTHIC' }
];

const UNIQUE_WORLD_ITEM = { id: 'world_core', name: 'World Core', emoji: '🌌', rarity: 'MYTHIC' };

export function World({
    honor,
    setHonor,
    relics,
    setRelics,
    worldCooldown,
    setWorldCooldown,
    dayCount,
    inventory,
    setInventory,
    bonusDamage = 0,
    bonusMaxHP = 0
}) {
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
    const playerPosRef = useRef({ x: 0, y: 0 });
    const [playerDirection, setPlayerDirection] = useState('down');
    const [isMoving, setIsMoving] = useState(false);
    const [entities, setEntities] = useState([]);
    const entitiesRef = useRef([]);
    const [inCombat, setInCombat] = useState(false);
    const [currentEnemy, setCurrentEnemy] = useState(null);
    const [engagedMonsterId, setEngagedMonsterId] = useState(null);
    const [engagedMonsterPos, setEngagedMonsterPos] = useState(null);
    const engagedMonsterPosRef = useRef(null);
    const baseHP = 100;
    const maxPlayerHP = baseHP + bonusMaxHP;
    const [playerHP, setPlayerHP] = useState(maxPlayerHP);
    const [itemDrop, setItemDrop] = useState(null); // battle drop animation
    const [heroAttacking, setHeroAttacking] = useState(false);
    const [enemyAttacking, setEnemyAttacking] = useState(false);
    const [damageNumbers, setDamageNumbers] = useState([]);
    const combatActiveRef = useRef(false);

    const PLAYER_RADIUS = 32;
    const TREE_RADIUS = 40;
    const ROCK_RADIUS = 40;
    const MONSTER_RADIUS = 44;

    const MOVE_SPEED = 5; // pixels per frame

    // Reset HP when max HP changes (from upgrades)
    useEffect(() => {
        setPlayerHP(maxPlayerHP);
    }, [maxPlayerHP]);

    // Generate world entities
    useEffect(() => {
        generateWorld();
    }, []);

    const generateWorld = () => {
        const newEntities = [];
        const numTrees = 500;
        const numRocks = 300;
        const numMonsters = 100;
        const worldRadius = 5000;
        const nearSpawnMonsters = 8;

        for (let i = 0; i < numTrees; i++) {
            newEntities.push({
                id: `tree-${i}`,
                type: 'tree',
                x: (Math.random() - 0.5) * worldRadius * 2,
                y: (Math.random() - 0.5) * worldRadius * 2,
                emoji: '🌲',
                collision: true,
                radius: TREE_RADIUS
            });
        }

        for (let i = 0; i < numRocks; i++) {
            newEntities.push({
                id: `rock-${i}`,
                type: 'rock',
                x: (Math.random() - 0.5) * worldRadius * 2,
                y: (Math.random() - 0.5) * worldRadius * 2,
                emoji: '🪨',
                collision: true,
                radius: ROCK_RADIUS
            });
        }

        for (let i = 0; i < numMonsters; i++) {
            const startX = (Math.random() - 0.5) * worldRadius * 2;
            const startY = (Math.random() - 0.5) * worldRadius * 2;
            newEntities.push({
                id: `monster-${i}`,
                type: 'monster',
                enemyType: 'VOID',
                x: startX,
                y: startY,
                emoji: '👾',
                collision: true,
                radius: MONSTER_RADIUS,
                pathIndex: 0,
                pathDirection: Math.random() > 0.5 ? 1 : -1,
                path: [
                    { x: startX, y: startY },
                    { x: startX + (Math.random() - 0.5) * 300, y: startY + (Math.random() - 0.5) * 300 },
                    { x: startX + (Math.random() - 0.5) * 300, y: startY + (Math.random() - 0.5) * 300 },
                    { x: startX, y: startY }
                ]
            });
        }

        // Ensure some monsters are near spawn so encounters happen quickly
        for (let i = 0; i < nearSpawnMonsters; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 120 + Math.random() * 200;
            const startX = Math.cos(angle) * dist;
            const startY = Math.sin(angle) * dist;
            newEntities.push({
                id: `spawn-monster-${i}`,
                type: 'monster',
                enemyType: 'VOID',
                x: startX,
                y: startY,
                emoji: '👾',
                collision: true,
                radius: MONSTER_RADIUS,
                pathIndex: 0,
                pathDirection: Math.random() > 0.5 ? 1 : -1,
                path: [
                    { x: startX, y: startY },
                    { x: startX + (Math.random() - 0.5) * 150, y: startY + (Math.random() - 0.5) * 150 },
                    { x: startX + (Math.random() - 0.5) * 150, y: startY + (Math.random() - 0.5) * 150 },
                    { x: startX, y: startY }
                ]
            });
        }

        setEntities(newEntities);
        entitiesRef.current = newEntities;
    };

    // Keep ref in sync with state
    useEffect(() => {
        entitiesRef.current = entities;
    }, [entities]);

    useEffect(() => {
        playerPosRef.current = playerPos;
    }, [playerPos]);

    useEffect(() => {
        engagedMonsterPosRef.current = engagedMonsterPos;
    }, [engagedMonsterPos]);

    const isBlocking = (entity) => entity.type === 'tree' || entity.type === 'rock' || entity.type === 'monster';

    const checkCollision = (newX, newY) => {
        const currentEntities = entitiesRef.current;
        for (const entity of currentEntities) {
            if (!entity.collision || !isBlocking(entity)) continue;
            const radius = entity.radius || TREE_RADIUS;
            const dx = newX - entity.x;
            const dy = newY - entity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < radius + PLAYER_RADIUS) return true;
        }
        return false;
    };

    const checkMonsterEncounter = (x, y) => {
        const currentEntities = entitiesRef.current;
        for (const entity of currentEntities) {
            if (entity.type !== 'monster') continue;
            const radius = entity.radius || MONSTER_RADIUS;
            const dx = x - entity.x;
            const dy = y - entity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < radius + PLAYER_RADIUS) return entity;
        }
        return null;
    };

    useEffect(() => {
        const monsterInterval = setInterval(() => {
            setEntities(prev => {
                if (inCombat) return prev; // freeze monsters during combat
                return prev.map(entity => {
                    if (entity.type !== 'monster' || !entity.path) return entity;
                    const targetPoint = entity.path[entity.pathIndex];
                    const dx = targetPoint.x - entity.x;
                    const dy = targetPoint.y - entity.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 5) {
                        let newIndex = entity.pathIndex + entity.pathDirection;
                        let newDirection = entity.pathDirection;
                        if (newIndex >= entity.path.length) {
                            newIndex = entity.path.length - 2;
                            newDirection = -1;
                        } else if (newIndex < 0) {
                            newIndex = 1;
                            newDirection = 1;
                        }
                        return { ...entity, pathIndex: newIndex, pathDirection: newDirection };
                    }
                    const moveSpeed = 1;
                    const newX = entity.x + (dx / distance) * moveSpeed;
                    const newY = entity.y + (dy / distance) * moveSpeed;
                    return { ...entity, x: newX, y: newY };
                });
            });
        }, 1000 / 30);
        return () => clearInterval(monsterInterval);
    }, [inCombat]);

    useEffect(() => {
        if (inCombat) return;
        const interval = setInterval(() => {
            setPlayerPos(prev => {
                let dx = 0;
                let dy = 0;
                const keys = window.keys || {};
                if (keys['ArrowUp'] || keys['w'] || keys['W']) {
                    dy -= MOVE_SPEED;
                    setPlayerDirection('up');
                    setIsMoving(true);
                }
                if (keys['ArrowDown'] || keys['s'] || keys['S']) {
                    dy += MOVE_SPEED;
                    setPlayerDirection('down');
                    setIsMoving(true);
                }
                if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
                    dx -= MOVE_SPEED;
                    setPlayerDirection('left');
                    setIsMoving(true);
                }
                if (keys['ArrowRight'] || keys['d'] || keys['D']) {
                    dx += MOVE_SPEED;
                    setPlayerDirection('right');
                    setIsMoving(true);
                }
                if (dx === 0 && dy === 0) {
                    setIsMoving(false);
                    const monster = checkMonsterEncounter(prev.x, prev.y);
                    if (monster) {
                        const isBoss = Math.random() < 0.005;
                        const adjusted = placeInFrontOfMonster(prev.x, prev.y, monster);
                        setPlayerDirection(getFacingFromVector(monster.x - prev.x, monster.y - prev.y));
                        startCombat(isBoss, monster.id, { x: monster.x, y: monster.y });
                        return adjusted;
                    }
                    return prev;
                }
                const newX = prev.x + dx;
                const newY = prev.y + dy;
                const monster = checkMonsterEncounter(newX, newY);
                if (monster) {
                    const isBoss = Math.random() < 0.005;
                    const adjusted = placeInFrontOfMonster(newX, newY, monster);
                    setPlayerDirection(getFacingFromVector(monster.x - newX, monster.y - newY));
                    startCombat(isBoss, monster.id, { x: monster.x, y: monster.y });
                    setIsMoving(false);
                    return adjusted;
                }
                if (checkCollision(newX, newY)) {
                    setIsMoving(false);
                    return prev;
                }
                return { x: newX, y: newY };
            });
        }, 16);
        return () => clearInterval(interval);
    }, [inCombat]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            window.keys = window.keys || {};
            window.keys[e.key] = true;
        };
        const handleKeyUp = (e) => {
            window.keys = window.keys || {};
            window.keys[e.key] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const startCombat = (isBoss, monsterId, monsterPos) => {
        if (inCombat || combatActiveRef.current) return;
        combatActiveRef.current = true;
        const enemy = isBoss ? generateBoss() : generateEnemy();
        setCurrentEnemy({ ...enemy, monsterId });
        setEngagedMonsterId(monsterId);
        setEngagedMonsterPos(monsterPos || null);
        engagedMonsterPosRef.current = monsterPos || null;
        setInCombat(true);
        setItemDrop(null);
        runTimedBattle(enemy, monsterId, monsterPos);
    };

    const runTimedBattle = (enemyState, monsterId, monsterPos) => {
        if (!enemyState) {
            console.error('No enemy state provided to battle');
            combatActiveRef.current = false;
            setInCombat(false);
            return;
        }
        
        let enemyHP = enemyState.hp || 30;
        let playerHPTemp = playerHP;
        let battleEnded = false;

        const heroStrike = () => {
            if (battleEnded) return;
            try {
                setHeroAttacking(true);
                setTimeout(() => setHeroAttacking(false), 180);
                const damage = playerAutoAttack();
                enemyHP = Math.max(0, enemyHP - damage);
                setCurrentEnemy(prev => prev ? { ...prev, hp: enemyHP } : null);
                const targetPos = monsterPos || engagedMonsterPosRef.current || playerPosRef.current || { x: 0, y: 0 };
                addDamageNumber(targetPos, `-${damage}`, false);
            } catch (e) {
                console.error('heroStrike error:', e);
            }
        };

        const enemyStrike = () => {
            if (battleEnded) return;
            try {
                setEnemyAttacking(true);
                setTimeout(() => setEnemyAttacking(false), 180);
                const damage = enemyAutoAttack(enemyState);
                playerHPTemp = Math.max(0, playerHPTemp - damage);
                setPlayerHP(playerHPTemp);
                const pPos = playerPosRef.current || { x: 0, y: 0 };
                addDamageNumber(pPos, `-${damage}`, true);
            } catch (e) {
                console.error('enemyStrike error:', e);
            }
        };

        const loop = () => {
            if (battleEnded) return;
            
            try {
                heroStrike();
                if (enemyHP <= 0) {
                    battleEnded = true;
                    finishVictory(enemyState.isBoss || false, monsterId);
                    return;
                }
                
                setTimeout(() => {
                    if (battleEnded) return;
                    
                    enemyStrike();
                    if (playerHPTemp <= 0) {
                        battleEnded = true;
                        finishDefeat();
                        return;
                    }
                    
                    setTimeout(loop, 420);
                }, 320);
            } catch (e) {
                console.error('Battle loop error:', e);
                battleEnded = true;
                combatActiveRef.current = false;
                setInCombat(false);
            }
        };

        loop();
    };

    const finishVictory = (isBoss, monsterId) => {
        try {
            combatActiveRef.current = false;
            if (isBoss) {
                dropRelic();
            } else {
                dropWorldLoot();
            }
            if (monsterId) {
                setEntities(prev => {
                    const updated = prev.filter(e => e.id !== monsterId);
                    entitiesRef.current = updated;
                    return updated;
                });
            }
        } catch (e) {
            console.error('finishVictory error:', e);
        } finally {
            setInCombat(false);
            setCurrentEnemy(null);
            setEngagedMonsterId(null);
            setEngagedMonsterPos(null);
        }
    };

    const finishDefeat = () => {
        try {
            combatActiveRef.current = false;
            setPlayerHP(maxPlayerHP);
            setWorldCooldown(4);
        } catch (e) {
            console.error('finishDefeat error:', e);
        } finally {
            setInCombat(false);
            setCurrentEnemy(null);
            setEngagedMonsterId(null);
            setEngagedMonsterPos(null);
        }
    };

    const playerAutoAttack = () => {
        const baseAttacks = [15, 25, 10];
        const baseDamage = baseAttacks[Math.floor(Math.random() * baseAttacks.length)];
        return baseDamage + bonusDamage;
    };

    const enemyAutoAttack = (enemy) => {
        if (!enemy || !enemy.attacks || enemy.attacks.length === 0) {
            return 10; // fallback damage
        }
        const atk = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];
        return atk?.damage || 10;
    };

    const addDamageNumber = (pos, value, isPlayer) => {
        if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return;
        const id = Date.now() + Math.random();
        setDamageNumbers(prev => [...prev, { id, x: pos.x, y: pos.y, value, isPlayer }]);
        setTimeout(() => {
            setDamageNumbers(prev => prev.filter(d => d.id !== id));
        }, 700);
    };

    const placeInFrontOfMonster = (px, py, monster) => {
        const dx = monster.x - px;
        const dy = monster.y - py;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const target = (monster.radius || MONSTER_RADIUS) + PLAYER_RADIUS + 4;
        const nx = monster.x - (dx / dist) * target;
        const ny = monster.y - (dy / dist) * target;
        return { x: nx, y: ny };
    };

    const getFacingFromVector = (dx, dy) => {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        }
        return dy > 0 ? 'down' : 'up';
    };

    const generateEnemy = () => {
        const enemies = [
            { name: 'Void Lurker', hp: 30, maxHp: 30, attacks: [
                { name: 'Shadow Strike', damage: 8 },
                { name: 'Void Grasp', damage: 12 }
            ]},
            { name: 'Cursed Wanderer', hp: 40, maxHp: 40, attacks: [
                { name: 'Dark Bolt', damage: 10 },
                { name: 'Hex', damage: 6 }
            ]},
            { name: 'Phantom', hp: 25, maxHp: 25, attacks: [
                { name: 'Ethereal Slash', damage: 15 }
            ]}
        ];
        return enemies[Math.floor(Math.random() * enemies.length)];
    };

    const generateBoss = () => {
        return {
            name: 'CURSED OVERLORD',
            hp: 100,
            maxHp: 100,
            isBoss: true,
            attacks: [
                { name: 'Void Annihilation', damage: 20 },
                { name: 'Dark Judgment', damage: 25 },
                { name: 'Curse of Ages', damage: 15 }
            ]
        };
    };

    const dropRelic = () => {
        const relicPool = [
            { name: 'Honor Relic', desc: '+10% Honor gained', rarity: 'COMMON', effect: 'honor_boost', value: 0.1 },
            { name: 'Worker Relic', desc: '+5% Worker gather rate', rarity: 'UNCOMMON', effect: 'gather_boost', value: 0.05 },
            { name: 'Luck Charm', desc: '+3% Recruit luck', rarity: 'RARE', effect: 'luck_boost', value: 0.03 },
            { name: 'Twin Soul', desc: 'Roll 2 workers at once', rarity: 'MYTHIC', effect: 'double_roll', value: 1 }
        ];
        let relic;
        const rand = Math.random();
        if (rand < 0.01) relic = relicPool[3];
        else if (rand < 0.1) relic = relicPool[2];
        else if (rand < 0.3) relic = relicPool[1];
        else relic = relicPool[0];
        setRelics(prev => [...prev, { ...relic, id: Date.now() }]);
        // Show relic as item drop animation instead of blocking alert
        setItemDrop({
            id: Date.now(),
            emoji: '🏆',
            name: relic.name,
            rarity: relic.rarity
        });
    };

    const dropWorldLoot = () => {
        if (Math.random() < 0.25) {
            setInventory(prev => ({
                ...prev,
                [UNIQUE_WORLD_ITEM.id]: (prev[UNIQUE_WORLD_ITEM.id] || 0) + 1
            }));
            setItemDrop({
                id: Date.now(),
                emoji: UNIQUE_WORLD_ITEM.emoji,
                name: UNIQUE_WORLD_ITEM.name,
                rarity: UNIQUE_WORLD_ITEM.rarity
            });
            return;
        }

        const rand = Math.random();
        let material;
        if (rand < 0.01) {
            material = WORLD_MATERIALS.find(i => i.id === 'phoenix_feather');
        } else if (rand < 0.05) {
            const legendaries = WORLD_MATERIALS.filter(i => i.rarity === 'LEGENDARY');
            material = legendaries[Math.floor(Math.random() * legendaries.length)];
        } else if (rand < 0.15) {
            const epics = WORLD_MATERIALS.filter(i => i.rarity === 'EPIC');
            material = epics[Math.floor(Math.random() * epics.length)];
        } else if (rand < 0.4) {
            const rares = WORLD_MATERIALS.filter(i => i.rarity === 'RARE');
            material = rares[Math.floor(Math.random() * rares.length)];
        }
        if (material) {
            setInventory(prev => ({
                ...prev,
                [material.id]: (prev[material.id] || 0) + 1
            }));
            setItemDrop({
                id: Date.now(),
                emoji: material.emoji,
                name: material.name,
                rarity: material.rarity
            });
        }
    };

    if (worldCooldown > 0) {
        return (
            <div className="world-cooldown">
                <h1>🔒 WORLD LOCKED</h1>
                <p>You died in the world. Cooldown: {worldCooldown} days remaining</p>
                <button 
                    className="rbx-btn"
                    onClick={() => {
                        // Go back to SHOP tab - dispatch custom event
                        window.dispatchEvent(new CustomEvent('switchToShop'));
                    }}
                    style={{
                        marginTop: '30px',
                        padding: '15px 50px',
                        fontSize: '1.1rem',
                        fontWeight: '900',
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    OK
                </button>
            </div>
        );
    }

    return (
        <div className="world-container">
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'rgba(26, 26, 26, 0.95)',
                border: '3px solid #d4af37',
                borderRadius: '8px',
                padding: '15px 25px',
                fontSize: '1.2rem',
                fontWeight: '900',
                color: '#fff',
                zIndex: 100
            }}>
                HP: {playerHP}/{maxPlayerHP} ❤️
            </div>

            <div className="world-terrain world-pixel-bg" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: '#2d5016',
                overflow: 'hidden',
                imageRendering: 'pixelated'
            }}>
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% - ${playerPos.x}px), calc(-50% - ${playerPos.y}px))`
                }}>
                    <div className={`entity-sprite ${heroAttacking ? 'attack-anim' : ''}`} style={{
                        position: 'absolute',
                        left: `${playerPos.x}px`,
                        top: `${playerPos.y}px`,
                        fontSize: '3rem',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 100,
                        animation: isMoving && !inCombat ? 'playerBounce 0.3s infinite' : 'none',
                        transition: 'transform 0.1s'
                    }}>
                        {playerDirection === 'up' && '🧙'}
                        {playerDirection === 'down' && '🧙'}
                        {playerDirection === 'left' && '🧙'}
                        {playerDirection === 'right' && '🧙'}
                    </div>

                    {entities.filter(entity => {
                        const dx = entity.x - playerPos.x;
                        const dy = entity.y - playerPos.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return distance < 1500;
                    }).map(entity => (
                        <div
                            key={entity.id}
                            className={`entity-sprite ${(entity.id === engagedMonsterId && enemyAttacking) ? 'attack-anim' : ''}`}
                            style={{
                                position: 'absolute',
                                left: `${entity.x}px`,
                                top: `${entity.y}px`,
                                fontSize: entity.type === 'monster' ? '2.5rem' : '2rem',
                                transform: 'translate(-50%, -50%)',
                                zIndex: entity.type === 'monster' ? 50 : 10,
                                filter: entity.id === engagedMonsterId ? 'drop-shadow(0 0 12px #ff4d6d)' : 'none'
                            }}
                        >
                            {entity.emoji}
                        </div>
                    ))}

                    {damageNumbers.map(d => (
                        <div
                            key={d.id}
                            className="damage-number"
                            style={{
                                position: 'absolute',
                                left: `${d.x}px`,
                                top: `${d.y}px`,
                                transform: 'translate(-50%, -80%)',
                                color: d.isPlayer ? '#ff6b6b' : '#9ae6b4',
                                fontWeight: 900,
                                fontSize: '1rem'
                            }}
                        >
                            {d.value}
                        </div>
                    ))}
                </div>
            </div>


            {itemDrop && (
                <div
                    className="battle-item-drop"
                    style={{
                        position: 'fixed',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '3rem',
                        zIndex: 3000,
                        animation: 'flyToInventory 1.5s ease-out forwards',
                        pointerEvents: 'none'
                    }}
                    onAnimationEnd={() => setItemDrop(null)}
                >
                    {itemDrop.emoji}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: itemDrop.rarity === 'MYTHIC' ? '#ff6b9d' :
                               itemDrop.rarity === 'LEGENDARY' ? '#ffaa00' :
                               itemDrop.rarity === 'EPIC' ? '#a335ee' :
                               itemDrop.rarity === 'RARE' ? '#0070dd' : '#fff',
                        textShadow: '0 0 10px currentColor',
                        whiteSpace: 'nowrap'
                    }}>
                        +1 {itemDrop.name}
                    </div>
                </div>
            )}
        </div>
    );
}
