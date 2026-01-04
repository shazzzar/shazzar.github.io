import { useState, useEffect, useRef } from 'react';
import { MATERIALS } from '../utils/workerRNG';
import '../World.css';

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
    addCoins,
    bonusDamage = 0,
    bonusMaxHP = 0,
    coinDropAudio,
    fireballAudio,
    smallMonsterAttackAudio,
    largeMonsterAttackAudio
}) {
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
    const playerPosRef = useRef({ x: 0, y: 0 });
    const [playerDirection, setPlayerDirection] = useState('down');
    const [isMoving, setIsMoving] = useState(false);
    const [entities, setEntities] = useState([]);
    const entitiesRef = useRef([]);
    const [inCombat, setInCombat] = useState(false);
    const [currentEnemy, setCurrentEnemy] = useState(null);
    const [nearHouse, setNearHouse] = useState(false);
    const [engagedMonsterId, setEngagedMonsterId] = useState(null);
    const [engagedMonsterPos, setEngagedMonsterPos] = useState(null);
    const engagedMonsterPosRef = useRef(null);
    const baseHP = 100;
    const maxPlayerHP = baseHP + bonusMaxHP;
    const [playerHP, setPlayerHP] = useState(maxPlayerHP);
    const [itemDrop, setItemDrop] = useState(null); 
    const [heroAttacking, setHeroAttacking] = useState(false);
    const [enemyAttacking, setEnemyAttacking] = useState(false);
    const [damageNumbers, setDamageNumbers] = useState([]);
    const combatActiveRef = useRef(false);
    const [showReturnButton, setShowReturnButton] = useState(false);

    const PLAYER_RADIUS = 32;
    const TREE_RADIUS = 15;
    const ROCK_RADIUS = 12;
    const MONSTER_RADIUS = 44;
    const ITEM_RADIUS = 30; 

    const MOVE_SPEED = 5; 

    useEffect(() => {
        setPlayerHP(maxPlayerHP);
    }, [maxPlayerHP]);

    useEffect(() => {
        generateWorld();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowReturnButton(true);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const generateWorld = () => {
        const newEntities = [];
        const numTrees = 1500;
        const numRocks = 1000;
        const numMonsters = 800;
        const worldRadius = 8000;
        const spawnClearRadius = 400; 
        const nearSpawnMonsters = 8;

        for (let i = 0; i < numTrees; i++) {
            let x, y, distFromSpawn;
            do {
                x = (Math.random() - 0.5) * worldRadius * 2;
                y = (Math.random() - 0.5) * worldRadius * 2;
                distFromSpawn = Math.sqrt(x * x + y * y);
            } while (distFromSpawn < spawnClearRadius); 
            
            newEntities.push({
                id: `tree-${i}`,
                type: 'tree',
                x: x,
                y: y,
                emoji: '🌲',
                collision: true,
                radius: TREE_RADIUS
            });
        }

        for (let i = 0; i < numRocks; i++) {
            let x, y, distFromSpawn;
            do {
                x = (Math.random() - 0.5) * worldRadius * 2;
                y = (Math.random() - 0.5) * worldRadius * 2;
                distFromSpawn = Math.sqrt(x * x + y * y);
            } while (distFromSpawn < spawnClearRadius);
            
            newEntities.push({
                id: `rock-${i}`,
                type: 'rock',
                x: x,
                y: y,
                emoji: '🪨',
                collision: true,
                radius: ROCK_RADIUS
            });
        }

        for (let i = 0; i < numMonsters; i++) {
            let startX, startY, distFromSpawn;
            do {
                startX = (Math.random() - 0.5) * worldRadius * 2;
                startY = (Math.random() - 0.5) * worldRadius * 2;
                distFromSpawn = Math.sqrt(startX * startX + startY * startY);
            } while (distFromSpawn < spawnClearRadius);
            
            const isBoss = Math.random() < 0.05; 
            newEntities.push({
                id: `monster-${i}`,
                type: 'monster',
                enemyType: isBoss ? 'BOSS' : 'VOID',
                isBoss: isBoss,
                x: startX,
                y: startY,
                emoji: isBoss ? '👹' : '👾',
                collision: true,
                radius: isBoss ? MONSTER_RADIUS * 1.5 : MONSTER_RADIUS,
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

        for (let i = 0; i < nearSpawnMonsters; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = spawnClearRadius + 50 + Math.random() * 200; 
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

        newEntities.push({
            id: 'spawn-house',
            type: 'house',
            x: 0,
            y: -200,
            emoji: '🏠',
            collision: true,
            radius: 100,
            isDoor: true
        });

        setEntities(newEntities);
        entitiesRef.current = newEntities;
    };

    useEffect(() => {
        entitiesRef.current = entities;
    }, [entities]);

    useEffect(() => {
        playerPosRef.current = playerPos;
    }, [playerPos]);

    useEffect(() => {
        engagedMonsterPosRef.current = engagedMonsterPos;
    }, [engagedMonsterPos]);

    const isBlocking = (entity) => entity.type === 'tree' || entity.type === 'rock' || entity.type === 'monster' || entity.type === 'house';

    const checkCollision = (newX, newY) => {
        const currentEntities = entitiesRef.current;
        for (const entity of currentEntities) {
            if (!entity.collision || !isBlocking(entity)) continue;

            if (entity.type === 'tree') {
                const treeWidth = 30;  
                const treeHeight = 60; 
                const playerSize = PLAYER_RADIUS;

                if (Math.abs(newX - entity.x) < (treeWidth + playerSize) / 2 &&
                    Math.abs(newY - entity.y) < (treeHeight + playerSize) / 2) {
                    return true;
                }
            } else {
                
                const radius = entity.radius || TREE_RADIUS;
                const dx = newX - entity.x;
                const dy = newY - entity.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < radius + PLAYER_RADIUS) return true;
            }
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

    const checkHouseDoor = (x, y) => {
        const currentEntities = entitiesRef.current;
        for (const entity of currentEntities) {
            if (entity.type !== 'house' || !entity.isDoor) continue;
            const dx = x - entity.x;
            const dy = y - entity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < entity.radius + PLAYER_RADIUS) {
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        const monsterInterval = setInterval(() => {
            setEntities(prev => {
                if (inCombat) return prev; 
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
        const handleKeyPress = (e) => {
            if (e.key === 'e' || e.key === 'E') {
                if (nearHouse && !inCombat) {
                    
                    window.dispatchEvent(new CustomEvent('switchToShop', {
                        detail: { bgColor: '#1a1a1a' }
                    }));
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [nearHouse, inCombat]);

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
                        const isBoss = monster.isBoss || false;
                        const adjusted = placeInFrontOfMonster(prev.x, prev.y, monster);
                        setPlayerDirection(getFacingFromVector(monster.x - prev.x, monster.y - prev.y));
                        startCombat(isBoss, monster.id, { x: monster.x, y: monster.y });
                        return adjusted;
                    }
                    return prev;
                }
                const newX = prev.x + dx;
                const newY = prev.y + dy;

                const isNearHouseDoor = checkHouseDoor(newX, newY);
                setNearHouse(isNearHouseDoor);
                
                const monster = checkMonsterEncounter(newX, newY);
                if (monster) {
                    const isBoss = monster.isBoss || false;
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

    const dropRelic = () => {
        const relicPool = [
            
            { name: 'Honor Relic', desc: '+10% Honor gained', rarity: 'COMMON', effect: 'honor_boost', value: 0.1 },
            { name: 'Coin Charm', desc: '+20% Coin drops', rarity: 'COMMON', effect: 'coin_boost', value: 0.2 },
            { name: 'Swift Relic', desc: '+10% Gather speed', rarity: 'COMMON', effect: 'gather_speed', value: 0.1 },
            
            { name: 'Worker Relic', desc: '+5% Worker gather rate', rarity: 'UNCOMMON', effect: 'gather_boost', value: 0.05 },
            { name: 'Fortune Stone', desc: '+15% Coin drops', rarity: 'UNCOMMON', effect: 'coin_boost', value: 0.15 },
            { name: 'Time Shard', desc: '+15s Day duration', rarity: 'UNCOMMON', effect: 'day_extend', value: 15 },
            
            { name: 'Luck Charm', desc: '+3% Recruit luck', rarity: 'RARE', effect: 'luck_boost', value: 0.03 },
            { name: 'Battle Relic', desc: '+5 Bonus damage', rarity: 'RARE', effect: 'damage_boost', value: 5 },
            { name: 'Shield Relic', desc: '+25 Max HP', rarity: 'RARE', effect: 'hp_boost', value: 25 },
            
            { name: 'Golden Idol', desc: '+50% Coin drops', rarity: 'EPIC', effect: 'coin_boost', value: 0.5 },
            { name: 'Auto Recruiter', desc: 'Recruit +1 worker on day change', rarity: 'EPIC', effect: 'auto_recruit', value: 1 },
            
            { name: 'Twin Soul', desc: 'Roll 2 workers at once', rarity: 'MYTHIC', effect: 'double_roll', value: 1 }
        ];
        
        let relic;
        const rand = Math.random();
        if (rand < 0.01) {
            
            relic = relicPool[11];
        } else if (rand < 0.10) {
            
            relic = relicPool[9 + Math.floor(Math.random() * 2)];
        } else if (rand < 0.30) {
            
            relic = relicPool[6 + Math.floor(Math.random() * 3)];
        } else if (rand < 0.60) {
            
            relic = relicPool[3 + Math.floor(Math.random() * 3)];
        } else {
            
            relic = relicPool[Math.floor(Math.random() * 3)];
        }
        
        setRelics(prev => [...prev, { ...relic, id: Date.now() }]);
        
        setItemDrop({
            id: Date.now(),
            emoji: '🏆',
            name: relic.name,
            rarity: relic.rarity
        });
    };

    const startCombat = (isBossEntity, monsterId, monsterPos) => {
        if (inCombat || combatActiveRef.current) return;
        combatActiveRef.current = true;
        const enemy = isBossEntity ? generateBoss() : generateEnemy();
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
        let timeoutIds = []; 

        const clearAllTimeouts = () => {
            timeoutIds.forEach(id => clearTimeout(id));
            timeoutIds = [];
        };

        const heroStrike = () => {
            if (battleEnded || !combatActiveRef.current) return;
            try {
                setHeroAttacking(true);
                const attackTimeout = setTimeout(() => setHeroAttacking(false), 180);
                timeoutIds.push(attackTimeout);

                if (!battleEnded && combatActiveRef.current && fireballAudio?.current) {
                    fireballAudio.current.currentTime = 0;
                    fireballAudio.current.volume = 0.5;
                    fireballAudio.current.play().catch(e => console.log("Audio play blocked"));
                }
                
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
            if (battleEnded || !combatActiveRef.current) return;
            try {
                setEnemyAttacking(true);
                const attackTimeout = setTimeout(() => setEnemyAttacking(false), 180);
                timeoutIds.push(attackTimeout);

                if (!battleEnded && combatActiveRef.current) {
                    if (enemyState.isBoss && largeMonsterAttackAudio?.current) {
                        largeMonsterAttackAudio.current.currentTime = 0;
                        largeMonsterAttackAudio.current.volume = 0.5;
                        largeMonsterAttackAudio.current.play().catch(e => console.log("Audio play blocked"));
                    } else if (!enemyState.isBoss && smallMonsterAttackAudio?.current) {
                        smallMonsterAttackAudio.current.currentTime = 0;
                        smallMonsterAttackAudio.current.volume = 0.5;
                        smallMonsterAttackAudio.current.play().catch(e => console.log("Audio play blocked"));
                    }
                }
                
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
            if (battleEnded || !combatActiveRef.current) return;

            try {
                heroStrike();
                if (enemyHP <= 0) {
                    battleEnded = true;
                    clearAllTimeouts();
                    finishVictory(enemyState.isBoss || false, monsterId);
                    return;
                }

                const enemyTurnTimeout = setTimeout(() => {
                    if (battleEnded || !combatActiveRef.current) return;

                    enemyStrike();
                    if (playerHPTemp <= 0) {
                        battleEnded = true;
                        clearAllTimeouts();
                        finishDefeat();
                        
                        setCurrentEnemy(null);
                        setEngagedMonsterId(null);
                        setEngagedMonsterPos(null);
                        engagedMonsterPosRef.current = null;
                        return;
                    }

                    const loopTimeout = setTimeout(loop, 420);
                    timeoutIds.push(loopTimeout);
                }, 320);
                timeoutIds.push(enemyTurnTimeout);
            } catch (e) {
                console.error('Battle loop error:', e);
                battleEnded = true;
                clearAllTimeouts();
                combatActiveRef.current = false;
                setInCombat(false);
            }
        };

        loop();
    };

    const finishVictory = (isBoss, monsterId) => {
        try {
            combatActiveRef.current = false;

            const baseCoins = 100;
            addCoins(baseCoins);

            if (coinDropAudio?.current) {
                coinDropAudio.current.currentTime = 0;
                coinDropAudio.current.volume = 1.0;
                coinDropAudio.current.play().catch(e => console.log("Audio play blocked"));
            }

            if (isBoss) {
                dropRelic();
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
            return 10; 
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
            {
                name: 'Void Lurker', hp: 30, maxHp: 30, attacks: [
                    { name: 'Shadow Strike', damage: 8 },
                    { name: 'Void Grasp', damage: 12 }
                ]
            },
            {
                name: 'Cursed Wanderer', hp: 40, maxHp: 40, attacks: [
                    { name: 'Dark Bolt', damage: 10 },
                    { name: 'Hex', damage: 6 }
                ]
            },
            {
                name: 'Phantom', hp: 25, maxHp: 25, attacks: [
                    { name: 'Ethereal Slash', damage: 15 }
                ]
            }
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

    if (worldCooldown > 0) {
        return (
            <div className="world-cooldown">
                <h1>🔒 WORLD LOCKED</h1>
                <p>You died in the world. Cooldown: {worldCooldown} days remaining</p>
                <button
                    className="rbx-btn"
                    onClick={() => {
                        
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
                                fontSize: entity.isBoss ? '4rem' : 
                                         (entity.type === 'monster' ? '2.5rem' : 
                                          (entity.type === 'tree' ? '9rem' : 
                                           (entity.type === 'house' ? '15rem' : '2rem'))),
                                transform: 'translate(-50%, -50%)',
                                zIndex: entity.type === 'monster' ? 50 : (entity.type === 'house' ? 5 : 10),
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

            {}
            {showReturnButton && !inCombat && (
                <button
                    onClick={() => {
                        setPlayerPos({ x: 0, y: 0 });
                        playerPosRef.current = { x: 0, y: 0 };
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '15px 40px',
                        fontSize: '1.2rem',
                        fontWeight: '900',
                        background: 'rgba(26, 26, 26, 0.95)',
                        border: '3px solid #d4af37',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        zIndex: 200,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#d4af37';
                        e.target.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(26, 26, 26, 0.95)';
                        e.target.style.color = '#fff';
                    }}
                >
                    🏠 Return to House
                </button>
            )}

            {}
            {nearHouse && !inCombat && (
                <div style={{
                    position: 'fixed',
                    top: '30%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '3px solid #d4af37',
                    borderRadius: '8px',
                    padding: '20px 40px',
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: '#fff',
                    zIndex: 200,
                    textAlign: 'center',
                    animation: 'popUpwards 0.3s ease-out'
                }}>
                    Press <span style={{ color: '#d4af37' }}>E</span> to Enter
                </div>
            )}

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
