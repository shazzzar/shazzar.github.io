export const RARITIES = {
    COMMON: { name: 'Common', color: '#94a3b8', weight: 60 },
    UNCOMMON: { name: 'Uncommon', color: '#10b981', weight: 25 },
    RARE: { name: 'Rare', color: '#3b82f6', weight: 10 },
    EPIC: { name: 'Epic', color: '#a855f7', weight: 1 },
    LEGENDARY: { name: 'Legendary', color: '#eab308', weight: 0.01 },
    MYTHIC: { name: 'Mythic', color: '#ff0055', weight: 0.001 },
};

export const WORKER_TYPES = [
    { type: 'Gatherer', emoji: '⛏️', description: 'Gathers raw materials from the void.', gatherables: ['Rotten Wood', 'Bleached Bone', 'Rusty Scraps'] },
    { type: 'Salesman', emoji: '🤝', description: 'Generates Honor from sales opportunities.', gatherables: [] },
    { type: 'Researcher', emoji: '🧪', description: 'Small chance to find rare essences.', gatherables: ['Grave Dust', 'Tattered Shroud', 'Void Essence'] },
    { type: 'Smith', emoji: '🔨', description: 'Speeds up production of crafted items.', gatherables: ['Rusty Scraps'] },
    { type: 'Oracle', emoji: '🔮', description: 'Increases roll luck during the night.', gatherables: ['Void Essence'] },
    { type: 'Mechanic', emoji: '⚙️', description: 'Reduces the cost of tycoon upgrades.', gatherables: ['Rusty Scraps'] },
    { type: 'Chef', emoji: '🍳', description: 'Boosts overall worker stamina.', gatherables: ['Rotten Wood'] },
    { type: 'Guard', emoji: '🛡️', description: 'Protects the shop from random thefts.', gatherables: ['Rusty Scraps'] },
];

export const PASSIVES = {
    EPIC: "Efficiency: +20% base production speed.",
    LEGENDARY: "Mastery: +50% production; 5% chance for triple loot.",
    MYTHIC: "Celestial Bound: +100% production; -50% Day debuff ignored.",
};

const WORKER_NAMES = [
    "Shadow Runner", "Iron Lung", "Void Walker", "Gold Finder", "Soul Reaper",
    "Mist Weaver", "Stone Crusher", "Flame Keeper", "Silent Blade", "Witch Doctor",
    "Grave Digger", "Merchant Kin", "Rune Carver", "Bone Collector", "Dark Knight",
    "Light Bringer", "Star Gazer", "Chaos Spawn", "Peace Maker", "War Monger"
];

// Expanded Materials (50+ Items)
export const MATERIALS = [
    // --- COMMON (1/3 to 1/10) ---
    { id: 'wood', name: 'Rotten Wood', emoji: '🪵', rarity: 'COMMON' },
    { id: 'clay', name: 'Dark Clay', emoji: '🏺', rarity: 'COMMON' },
    { id: 'fiber', name: 'Shadow Fiber', emoji: '🧶', rarity: 'COMMON' },
    { id: 'sand', name: 'Abyss Sand', emoji: '⏳', rarity: 'COMMON' },
    { id: 'water', name: 'Void Water', emoji: '💧', rarity: 'COMMON' },
    { id: 'coal', name: 'Cursed Coal', emoji: '🌑', rarity: 'COMMON' },
    { id: 'ash', name: 'Sacred Ash', emoji: '💨', rarity: 'COMMON' },
    { id: 'salt', name: 'Ghost Salt', emoji: '🧂', rarity: 'COMMON' },

    // --- UNCOMMON (1/20 to 1/100) ---
    { id: 'metal', name: 'Rusty Scraps', emoji: '⛓️', rarity: 'UNCOMMON' },
    { id: 'bone', name: 'Bleached Bone', emoji: '🦴', rarity: 'UNCOMMON' },
    { id: 'glass', name: 'Dark Glass', emoji: '🍷', rarity: 'UNCOMMON' },
    { id: 'leather', name: 'Night Leather', emoji: '👞', rarity: 'UNCOMMON' },
    { id: 'vine', name: 'Strangling Vine', emoji: '🌿', rarity: 'UNCOMMON' },
    { id: 'iron', name: 'Corrupted Iron', emoji: '🛡️', rarity: 'UNCOMMON' },
    { id: 'copper', name: 'Green Copper', emoji: '🧲', rarity: 'UNCOMMON' },
    { id: 'wax', name: 'Demon Wax', emoji: '🕯️', rarity: 'UNCOMMON' },
    { id: 'silk', name: 'Ethereal Silk', emoji: '🕸️', rarity: 'UNCOMMON' },
    { id: 'oil', name: 'Ichor Oil', emoji: '🧪', rarity: 'UNCOMMON' },
    { id: 'paper', name: 'Parchment', emoji: '📜', rarity: 'UNCOMMON' },
    { id: 'feather', name: 'Crows Feather', emoji: '🪶', rarity: 'UNCOMMON' },

    // --- RARE (1/200 to 1/1,000) ---
    { id: 'dust', name: 'Grave Dust', emoji: '🫙', rarity: 'RARE' },
    { id: 'cloth', name: 'Tattered Shroud', emoji: '🕸️', rarity: 'RARE' },
    { id: 'gem', name: 'Corrupted Gem', emoji: '💎', rarity: 'RARE' },
    { id: 'silver', name: 'Pure Silver', emoji: '🥈', rarity: 'RARE' },
    { id: 'gold', name: "Fool's Gold", emoji: '🥇', rarity: 'RARE' },
    { id: 'crystal', name: 'Void Crystal', emoji: '🔮', rarity: 'RARE' },
    { id: 'pearl', name: 'Black Pearl', emoji: '🌑', rarity: 'RARE' },
    { id: 'fang', name: 'Vampire Fang', emoji: '🦷', rarity: 'RARE' },
    { id: 'shell', name: 'Nautilus Shell', emoji: '🐚', rarity: 'RARE' },
    { id: 'scale', name: 'Dragon Scale', emoji: '🐲', rarity: 'RARE' },

    // --- EPIC (1/1,000 to 1/10,000) ---
    { id: 'soul', name: 'Cursed Soul', emoji: '👻', rarity: 'EPIC' },
    { id: 'emerald', name: 'Chaos Emerald', emoji: '💚', rarity: 'EPIC' },
    { id: 'ruby', name: 'Blood Ruby', emoji: '❤️', rarity: 'EPIC' },
    { id: 'sapphire', name: 'Frost Sapphire', emoji: '💙', rarity: 'EPIC' },
    { id: 'diamond', name: 'Dark Diamond', emoji: '🖤', rarity: 'EPIC' },
    { id: 'heart', name: 'Golem Heart', emoji: '❤️‍🔥', rarity: 'EPIC' },
    { id: 'brain', name: 'Elder Brain', emoji: '🧠', rarity: 'EPIC' },
    { id: 'fruit', name: 'Forbidden Fruit', emoji: '🍎', rarity: 'EPIC' },
    { id: 'leaf', name: 'World Tree Leaf', emoji: '🍃', rarity: 'EPIC' },
    { id: 'claw', name: 'Beast Claw', emoji: '🐾', rarity: 'EPIC' },

    // --- LEGENDARY (1/10,000 to 1/100,000) ---
    { id: 'sun', name: 'Solar Ember', emoji: '☀️', rarity: 'LEGENDARY' },
    { id: 'moon', name: 'Moon Fragment', emoji: '🌙', rarity: 'LEGENDARY' },
    { id: 'star', name: 'Star Dust', emoji: '⭐', rarity: 'LEGENDARY' },
    { id: 'egg', name: 'Phoenix Egg', emoji: '🥚', rarity: 'LEGENDARY' },
    { id: 'crown', name: "King's Crown", emoji: '👑', rarity: 'LEGENDARY' },
    { id: 'ancient_staff', name: 'Ancient Staff', emoji: '🦯', rarity: 'LEGENDARY' },
    { id: 'key', name: 'Skeleton Key', emoji: '🔑', rarity: 'LEGENDARY' },
    { id: 'map', name: 'Lost Map', emoji: '🗺️', rarity: 'LEGENDARY' },
    { id: 'eye_true', name: 'True Sight Eye', emoji: '👁️', rarity: 'LEGENDARY' },
    { id: 'horn', name: 'Unicorn Horn', emoji: '🦄', rarity: 'LEGENDARY' },

    // --- MYTHIC (1/100,000+) ---
    { id: 'essence', name: 'Void Essence', emoji: '✨', rarity: 'MYTHIC' },
    { id: 'god_blood', name: 'God Ichor', emoji: '💉', rarity: 'MYTHIC' },
    { id: 'time_shard', name: 'Time Shard', emoji: '⌛', rarity: 'MYTHIC' },
    { id: 'fate_thread', name: 'Fate Thread', emoji: '🧵', rarity: 'MYTHIC' },
    { id: 'void_heart', name: 'Void Heart', emoji: '🖤', rarity: 'MYTHIC' },

    // --- WORLD-EXCLUSIVE MATERIALS (Monster Drops Only) ---
    { id: 'nightmare_shard', name: 'Nightmare Shard', emoji: '💎', rarity: 'RARE' },
    { id: 'ectoplasm', name: 'Ectoplasm', emoji: '🫧', rarity: 'RARE' },
    { id: 'corrupted_bone', name: 'Corrupted Bone', emoji: '🦴', rarity: 'RARE' },
    { id: 'spectral_dust', name: 'Spectral Dust', emoji: '✨', rarity: 'EPIC' },
    { id: 'abyssal_ink', name: 'Abyssal Ink', emoji: '🖤', rarity: 'EPIC' },
    { id: 'wraith_cloth', name: 'Wraith Cloth', emoji: '👻', rarity: 'EPIC' },
    { id: 'doom_crystal', name: 'Doom Crystal', emoji: '💠', rarity: 'LEGENDARY' },
    { id: 'eldritch_eye', name: 'Eldritch Eye', emoji: '👁️', rarity: 'LEGENDARY' },
    { id: 'soul_fragment', name: 'Soul Fragment', emoji: '💜', rarity: 'LEGENDARY' },
    { id: 'oblivion_core', name: 'Oblivion Core', emoji: '⚫', rarity: 'MYTHIC' },

    // World exclusive original materials
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
    { id: 'world_core', name: 'World Core', emoji: '🌌', rarity: 'MYTHIC' },

    // --- MONSTER DROPS (Common/Uncommon) ---
    { id: 'void_residue', name: 'Void Residue', emoji: '◼️', rarity: 'COMMON' },
    { id: 'shadow_shard', name: 'Shadow Shard', emoji: '🌑', rarity: 'UNCOMMON' },
];

/**
 * GATHER_TABLE - REBALANCED FOR EXTREME RARITY
 * Legendary items: 1/10,000+ chance
 * Mythic items: 1/100,000+ chance
 */
export const GATHER_TABLE = {
    'Gatherer': [
        { id: 'wood', chance: 0.25 }, { id: 'clay', chance: 0.15 }, { id: 'fiber', chance: 0.15 },
        { id: 'sand', chance: 0.1 }, { id: 'coal', chance: 0.08 },
        { id: 'metal', chance: 0.02 }, { id: 'vine', chance: 0.01 }, { id: 'wax', chance: 0.005 }
    ],
    'Researcher': [
        { id: 'ash', chance: 0.15 }, { id: 'salt', chance: 0.12 }, { id: 'paper', chance: 0.08 },
        { id: 'dust', chance: 0.02 }, { id: 'cloth', chance: 0.01 },
        { id: 'soul', chance: 0.001 }, { id: 'brain', chance: 0.0005 },
        { id: 'essence', chance: 0.00001 }
    ],
    'Smith': [
        { id: 'metal', chance: 0.2 }, { id: 'iron', chance: 0.08 }, { id: 'copper', chance: 0.08 },
        { id: 'coal', chance: 0.05 }, { id: 'silver', chance: 0.005 }, { id: 'gold', chance: 0.002 },
        { id: 'emerald', chance: 0.0002 }, { id: 'diamond', chance: 0.0001 },
        { id: 'crown', chance: 0.00001 }
    ],
    'Oracle': [
        { id: 'crystal', chance: 0.05 }, { id: 'pearl', chance: 0.03 }, { id: 'gem', chance: 0.02 },
        { id: 'soul', chance: 0.005 }, { id: 'star', chance: 0.0001 }, { id: 'moon', chance: 0.0001 },
        { id: 'sun', chance: 0.00005 }, { id: 'eye_true', chance: 0.00001 },
        { id: 'time_shard', chance: 0.000001 }
    ],
    'Mechanic': [
        { id: 'metal', chance: 0.15 }, { id: 'glass', chance: 0.08 }, { id: 'oil', chance: 0.08 },
        { id: 'copper', chance: 0.05 }, { id: 'iron', chance: 0.04 },
        { id: 'heart', chance: 0.0003 }, { id: 'key', chance: 0.00005 }
    ],
    'Chef': [
        { id: 'salt', chance: 0.2 }, { id: 'oil', chance: 0.1 }, { id: 'water', chance: 0.15 },
        { id: 'fruit', chance: 0.002 }, { id: 'leaf', chance: 0.002 },
        { id: 'god_blood', chance: 0.000001 }
    ],
    'Guard': [
        { id: 'leather', chance: 0.1 }, { id: 'metal', chance: 0.1 }, { id: 'bone', chance: 0.08 },
        { id: 'fang', chance: 0.008 }, { id: 'scale', chance: 0.003 }, { id: 'claw', chance: 0.002 },
        { id: 'horn', chance: 0.00005 }, { id: 'void_heart', chance: 0.000001 }
    ],
    'Salesman': [
        { id: 'feather', chance: 0.05 }, { id: 'map', chance: 0.00005 },
        { id: 'fate_thread', chance: 0.000001 }
    ]
};

// Expanded Crafted Items with new materials
export const CRAFTED_ITEMS = [
    // --- BASIC (Common/Uncommon materials) ---
    { id: 'dagger', name: 'Curse Dagger', emoji: '🗡️', tier: 'BASIC', recipe: { wood: 5, metal: 3 } },
    { id: 'torch', name: 'Shadow Torch', emoji: '🔦', tier: 'BASIC', recipe: { wood: 3, coal: 2, wax: 1 } },
    { id: 'rope', name: 'Binding Rope', emoji: '🨢', tier: 'BASIC', recipe: { fiber: 5, vine: 2 } },
    { id: 'flask', name: 'Glass Flask', emoji: '⚗️', tier: 'BASIC', recipe: { glass: 3, sand: 2 } },
    { id: 'candle', name: 'Spirit Candle', emoji: '🕯️', tier: 'BASIC', recipe: { wax: 3, oil: 1, ash: 2 } },
    // NEW MONSTER ITEMS
    { id: 'void_dagger', name: 'Void Dagger', emoji: '🗡️', tier: 'BASIC', recipe: { void_residue: 5 } },
    { id: 'shadow_bangle', name: 'Shadow Bangle', emoji: '⭕', tier: 'BASIC', recipe: { shadow_shard: 3, void_residue: 3 } },

    // --- INTERMEDIATE (Rare materials) ---
    { id: 'staff', name: 'Soul Staff', emoji: '🪄', tier: 'INTERMEDIATE', recipe: { wood: 5, soul: 1, crystal: 1 } },
    { id: 'ring', name: 'Bone Ring', emoji: '💍', tier: 'INTERMEDIATE', recipe: { bone: 5, gem: 2, silver: 1 } },
    { id: 'doll', name: 'Voodoo Doll', emoji: '🧸', tier: 'INTERMEDIATE', recipe: { cloth: 5, dust: 3, bone: 2 } },
    { id: 'amulet', name: 'Crystal Amulet', emoji: '📿', tier: 'INTERMEDIATE', recipe: { crystal: 2, silver: 2, pearl: 1 } },
    { id: 'scroll', name: 'Cursed Scroll', emoji: '📜', tier: 'INTERMEDIATE', recipe: { paper: 5, dust: 2, fang: 1 } },
    { id: 'cloak', name: 'Shadow Cloak', emoji: '🧥', tier: 'INTERMEDIATE', recipe: { cloth: 8, silk: 3, feather: 2 } },

    // --- ADVANCED (Epic materials) ---
    { id: 'armor', name: 'Spectral Plates', emoji: '🛡️', tier: 'ADVANCED', recipe: { metal: 10, cloth: 5, soul: 2, scale: 1 } },
    { id: 'eye', name: 'Watcher Eye', emoji: '👁️', tier: 'ADVANCED', recipe: { emerald: 1, gem: 3, brain: 1 } },
    { id: 'book', name: 'Grimoire', emoji: '📖', tier: 'ADVANCED', recipe: { cloth: 8, dust: 8, soul: 3, paper: 5 } },
    { id: 'chalice', name: 'Blood Cup', emoji: '🏆', tier: 'ADVANCED', recipe: { gold: 2, ruby: 1, gem: 3 } },
    { id: 'mirror', name: 'Fear Mirror', emoji: '🪞', tier: 'ADVANCED', recipe: { glass: 5, gem: 5, diamond: 1 } },
    { id: 'potion', name: 'Void Brew', emoji: '🧪', tier: 'ADVANCED', recipe: { dust: 5, soul: 2, fruit: 1 } },
    { id: 'crown_item', name: 'Dark Crown', emoji: '👑', tier: 'ADVANCED', recipe: { gold: 3, sapphire: 1, diamond: 1 } },
    { id: 'heart_item', name: 'Golem Core', emoji: '❤️‍🔥', tier: 'ADVANCED', recipe: { heart: 1, iron: 10, emerald: 1, coal: 20 } },

    // --- LEGENDARY (Legendary materials) - Very hard to craft ---
    { id: 'sunblade', name: 'Sunfire Blade', emoji: '⚔️', tier: 'LEGENDARY', recipe: { sun: 1, gold: 5, ruby: 2, metal: 15 } },
    { id: 'moonstaff', name: 'Moonlight Staff', emoji: '🌙', tier: 'LEGENDARY', recipe: { moon: 1, ancient_staff: 1, sapphire: 2 } },
    { id: 'starmap', name: 'Celestial Atlas', emoji: '🌌', tier: 'LEGENDARY', recipe: { star: 2, map: 1, paper: 10, crystal: 5 } },
    { id: 'phoenix', name: 'Phoenix Familiar', emoji: '🔥', tier: 'LEGENDARY', recipe: { egg: 1, sun: 1, feather: 10, soul: 5 } },
    { id: 'thirdEye', name: 'All-Seeing Orb', emoji: '🔮', tier: 'LEGENDARY', recipe: { eye_true: 1, crystal: 10, brain: 2, pearl: 5 } },

    // --- MYTHIC (Mythic materials) - Nearly impossible to craft ---
    { id: 'voidBlade', name: 'Void Slayer', emoji: '🗡️', tier: 'MYTHIC', recipe: { void_heart: 1, essence: 2, diamond: 3, soul: 10 } },
    { id: 'timePiece', name: 'Chrono Artifact', emoji: '⏱️', tier: 'MYTHIC', recipe: { time_shard: 1, star: 2, crystal: 10 } },
    { id: 'fateWeaver', name: 'Fate Weaver', emoji: '🕸️', tier: 'MYTHIC', recipe: { fate_thread: 1, silk: 20, cloth: 15, brain: 2 } },
    { id: 'godChalice', name: "God's Chalice", emoji: '🏆', tier: 'MYTHIC', recipe: { god_blood: 1, gold: 10, crown: 1, sun: 1 } },

    // --- WORLD-EXCLUSIVE CRAFTS (Require monster drops) ---
    { id: 'wraith_robe', name: 'Wraith Robe', emoji: '🧥', tier: 'LEGENDARY', recipe: { wraith_cloth: 5, spectral_dust: 3, ectoplasm: 4, shadow_fabric: 2 } },
    { id: 'doom_scythe', name: 'Doom Scythe', emoji: '⚰️', tier: 'LEGENDARY', recipe: { doom_crystal: 2, corrupted_bone: 6, void_blade_shard: 1, nightmare_shard: 4 } },
    { id: 'oblivion_tome', name: 'Oblivion Tome', emoji: '📕', tier: 'MYTHIC', recipe: { oblivion_core: 1, eldritch_eye: 2, soul_fragment: 3, abyssal_ink: 5, ancient_page: 2 } },
];

// Special Worker Variants (ultra-rare)
export const WORKER_VARIANTS = {
    NORMAL: { name: 'Normal', color: '#888888', chance: 0 },
    GOLDEN: { name: 'Golden', color: '#ffd700', chance: 0.001 },      // 1/1,000
    DIAMOND: { name: 'Diamond', color: '#00ffff', chance: 0.0001 },   // 1/10,000
    RAINBOW: { name: 'Rainbow', color: 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)', chance: 0.00001 },  // 1/100,000
    ENCHANTED: { name: 'Enchanted', color: '#ff00ff', chance: 0.000001 } // 1/1,000,000
};

/**
 * rollWorker - REBALANCED FOR EXTREME RARITY
 * Legendary: 1/10,000 (0.0001)
 * Mythic: 1/100,000 (0.00001)
 */
export const rollWorker = (luckMultiplier = 1.0) => {
    const r = Math.random() / luckMultiplier;
    let rarityKey = 'COMMON';

    // Mythic: 1/100,000
    if (r < 0.00001) rarityKey = 'MYTHIC';
    // Legendary: 1/10,000
    else if (r < 0.0001) rarityKey = 'LEGENDARY';
    // Epic: 1/100
    else if (r < 0.01) rarityKey = 'EPIC';
    // Rare: 1/10
    else if (r < 0.1) rarityKey = 'RARE';
    // Uncommon: 1/4
    else if (r < 0.25) rarityKey = 'UNCOMMON';

    // Roll for special variant
    const variantRoll = Math.random() / luckMultiplier;
    let variantKey = 'NORMAL';
    if (variantRoll < 0.000001) variantKey = 'ENCHANTED';      // 1/1,000,000
    else if (variantRoll < 0.00001) variantKey = 'RAINBOW';    // 1/100,000
    else if (variantRoll < 0.0001) variantKey = 'DIAMOND';     // 1/10,000
    else if (variantRoll < 0.001) variantKey = 'GOLDEN';       // 1/1,000

    const rarity = RARITIES[rarityKey];
    const variant = WORKER_VARIANTS[variantKey];
    const typeInfo = WORKER_TYPES[Math.floor(Math.random() * WORKER_TYPES.length)];

    // Calculate display chance
    const chanceMap = {
        COMMON: '1/1.3',
        UNCOMMON: '1/4',
        RARE: '1/10',
        EPIC: '1/100',
        LEGENDARY: '1/10,000',
        MYTHIC: '1/100,000'
    };

    const name = WORKER_NAMES[Math.floor(Math.random() * WORKER_NAMES.length)] + " #" + (Math.floor(Math.random() * 900) + 100);

    return {
        id: `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        rarity: rarity,
        rarityKey: rarityKey,
        variant: variant,
        variantKey: variantKey,
        chance: chanceMap[rarityKey],
        ...typeInfo,
        passive: PASSIVES[rarityKey] || null,
        level: 1,
    };
}

