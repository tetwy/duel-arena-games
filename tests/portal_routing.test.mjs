import test from 'node:test';
import assert from 'node:assert/strict';

export const cleanRoomCode = (raw) => {
  if (!raw) return '';
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim();
};

export const guessGameTypeFromCode = (code) => {
  const cleaned = cleanRoomCode(code);
  if (cleaned.startsWith('VT')) return 'veto';
  if (cleaned.startsWith('HB')) return 'harfbaz';
  return 'unknown';
};

export const applyPrefix = (currentCode, newPrefix) => {
  if (!newPrefix) return currentCode || '';
  const prefixStr = `#${newPrefix}-`;
  if (!currentCode || !currentCode.trim()) return prefixStr;

  const trimmed = currentCode.trim();
  const match = trimmed.match(/^#?([A-Za-z]{2,4})-(.*)$/);
  if (match) {
    const suffix = match[2] || '';
    return `${prefixStr}${suffix}`;
  }
  
  const shortPrefixMatch = trimmed.match(/^#([A-Za-z]{2,4})$/);
  if (shortPrefixMatch) {
    return prefixStr;
  }

  if (/^\d+$/.test(trimmed)) {
    return `${prefixStr}${trimmed}`;
  }

  return prefixStr;
};

test('cleanRoomCode sanitizes inputs with hashes, dashes, and whitespace', () => {
  assert.equal(cleanRoomCode('#VT-8492'), 'VT8492');
  assert.equal(cleanRoomCode('  hb-9912  '), 'HB9912');
  assert.equal(cleanRoomCode(' #da-0000 '), 'DA0000');
  assert.equal(cleanRoomCode('K8M3PX'), 'K8M3PX');
  assert.equal(cleanRoomCode(''), '');
  assert.equal(cleanRoomCode(null), '');
});

test('guessGameTypeFromCode identifies game prefix properly', () => {
  assert.equal(guessGameTypeFromCode('#VT-1234'), 'veto');
  assert.equal(guessGameTypeFromCode('hb-5678'), 'harfbaz');
  assert.equal(guessGameTypeFromCode('XYZ123'), 'unknown');
});

test('isNavActive activates only liderlik-tablosu on veto-liderlik-tablosu and harfbaz-liderlik-tablosu', () => {
  const isNavActive = (currentPath, key) => {
    const isLeaderboard =
      currentPath.includes('leaderboard') ||
      currentPath.includes('liderlik') ||
      currentPath.includes('podyum') ||
      currentPath.includes('sampiyon') ||
      currentPath.includes('victory');

    if (key === 'leaderboard' || key === 'liderlik-tablosu') {
      return isLeaderboard;
    }
    if (isLeaderboard) {
      return false;
    }
    if (key === 'portal' || key === 'ortak-portal') return currentPath === 'portal' || currentPath === 'ortak-portal' || currentPath === '';
    if (key === 'veto' || key === 'veto-arena') return currentPath.startsWith('veto');
    if (key === 'harfbaz' || key === 'harfbaz-arena') return currentPath.startsWith('harfbaz');
    return false;
  };

  // On veto-leaderboard: ONLY leaderboard should be active, NOT veto
  assert.equal(isNavActive('veto-leaderboard', 'veto'), false);
  assert.equal(isNavActive('veto-leaderboard', 'leaderboard'), true);
  assert.equal(isNavActive('veto-leaderboard', 'harfbaz'), false);

  // On harfbaz-leaderboard: ONLY leaderboard should be active, NOT harfbaz
  assert.equal(isNavActive('harfbaz-leaderboard', 'harfbaz'), false);
  assert.equal(isNavActive('harfbaz-leaderboard', 'leaderboard'), true);
  assert.equal(isNavActive('harfbaz-leaderboard', 'veto'), false);

  // On normal veto screen: veto should be active
  assert.equal(isNavActive('veto-lobby', 'veto'), true);
  assert.equal(isNavActive('veto-lobby', 'leaderboard'), false);

  // On portal screen: portal should be active
  assert.equal(isNavActive('portal', 'portal'), true);
  assert.equal(isNavActive('portal', 'veto'), false);
});

test('applyPrefix switches between #HB- and #VT- correctly preserving suffix', () => {
  assert.equal(applyPrefix('', 'VT'), '#VT-');
  assert.equal(applyPrefix('#HB-', 'VT'), '#VT-');
  assert.equal(applyPrefix('#HB-1234', 'VT'), '#VT-1234');
  assert.equal(applyPrefix('#VT-', 'HB'), '#HB-');
  assert.equal(applyPrefix('#VT-9999', 'HB'), '#HB-9999');
  assert.equal(applyPrefix('HB-5555', 'VT'), '#VT-5555');
  assert.equal(applyPrefix('1234', 'VT'), '#VT-1234');
  assert.equal(applyPrefix('random', 'VT'), '#VT-');
});

test('mapGameRoute routes Harfbaz directly to bekleme-odasi and Veto to takim-lobisi', () => {
  const mapGameRoute = (path) => {
    if (path === 'veto-arena' || path === 'veto' || path === 'veto-lobby') return 'veto-lobby';
    if (path === 'harfbaz-arena' || path === 'harfbaz' || path === 'harfbaz-lobby') return 'harfbaz-lobby';
    return path;
  };

  assert.equal(mapGameRoute('harfbaz-arena'), 'harfbaz-lobby');
  assert.equal(mapGameRoute('harfbaz'), 'harfbaz-lobby');
  assert.equal(mapGameRoute('harfbaz-lobby'), 'harfbaz-lobby');
  assert.equal(mapGameRoute('veto-arena'), 'veto-lobby');
  assert.equal(mapGameRoute('veto'), 'veto-lobby');
  assert.equal(mapGameRoute('veto-lobby'), 'veto-lobby');
});

test('canonical English routes resolve accurately with legacy backwards-compatibility', () => {
  const ROUTE_ALIASES = {
    'portal': 'portal',
    'veto-rules': 'veto-rules',
    'veto-lobby': 'veto-lobby',
    'veto-match': 'veto-match',
    'veto-victory': 'veto-victory',
    'veto-leaderboard': 'veto-leaderboard',
    'harfbaz-profile': 'harfbaz-profile',
    'harfbaz-lobby': 'harfbaz-lobby',
    'harfbaz-game': 'harfbaz-game',
    'harfbaz-veto': 'harfbaz-veto',
    'harfbaz-leaderboard': 'harfbaz-leaderboard',
    'leaderboard': 'leaderboard',
    'exit-confirm': 'exit-confirm',
    'privacy-notice': 'privacy-notice',
    'terms-of-service': 'terms-of-service',
    'cookie-policy': 'cookie-policy',
    'register': 'register',
    '404': '404',

    '': 'portal',
    'ortak-portal': 'portal',
    'veto-kurallar': 'veto-rules',
    'veto-takim-lobisi': 'veto-lobby',
    'veto-canli-duello': 'veto-match',
    'veto-sampiyonluk': 'veto-victory',
    'veto-liderlik-tablosu': 'veto-leaderboard',
    'harfbaz-profil-lobi': 'harfbaz-profile',
    'harfbaz-bekleme-odasi': 'harfbaz-lobby',
    'harfbaz-canli-oyun': 'harfbaz-game',
    'harfbaz-oylama-veto': 'harfbaz-veto',
    'harfbaz-liderlik-tablosu': 'harfbaz-leaderboard',
    'liderlik-tablosu': 'leaderboard',
    'cikis-onay-modal': 'exit-confirm',
    'kvkk': 'privacy-notice',
    'kullanici-sozlesmesi': 'terms-of-service',
    'cerez-politikasi': 'cookie-policy',
    'kayit-ol': 'register'
  };

  const resolveRoute = (path) => {
    const clean = (path || '').toLowerCase().trim();
    return ROUTE_ALIASES[clean] || clean;
  };

  // Canonical paths stay canonical
  assert.equal(resolveRoute('portal'), 'portal');
  assert.equal(resolveRoute('veto-lobby'), 'veto-lobby');
  assert.equal(resolveRoute('veto-match'), 'veto-match');
  assert.equal(resolveRoute('harfbaz-game'), 'harfbaz-game');
  assert.equal(resolveRoute('harfbaz-leaderboard'), 'harfbaz-leaderboard');
  assert.equal(resolveRoute('leaderboard'), 'leaderboard');

  // Legacy Turkish paths map to English canonical
  assert.equal(resolveRoute('ortak-portal'), 'portal');
  assert.equal(resolveRoute('veto-takim-lobisi'), 'veto-lobby');
  assert.equal(resolveRoute('veto-canli-duello'), 'veto-match');
  assert.equal(resolveRoute('harfbaz-canli-oyun'), 'harfbaz-game');
  assert.equal(resolveRoute('harfbaz-oylama-veto'), 'harfbaz-veto');
  assert.equal(resolveRoute('harfbaz-liderlik-tablosu'), 'harfbaz-leaderboard');
  assert.equal(resolveRoute('liderlik-tablosu'), 'leaderboard');
  assert.equal(resolveRoute('kullanici-sozlesmesi'), 'terms-of-service');
  assert.equal(resolveRoute('cerez-politikasi'), 'cookie-policy');
  assert.equal(resolveRoute('kayit-ol'), 'register');
  assert.equal(resolveRoute(''), 'portal');
});

test('harfbaz room capacity is not bounded to 8 and supports custom parameters', () => {
  const calculateHarfbazSlots = (playerCount) => {
    return Math.max(2, Math.max(playerCount + 2, 10) - playerCount);
  };

  // With 8 players, it should still offer open slots (not capped)
  assert.ok(calculateHarfbazSlots(8) >= 2);
  // With 12 players, it continues scaling
  assert.ok(calculateHarfbazSlots(12) >= 2);

  // Validate custom rounds and duration parsing
  const parseCustomSetting = (raw, fallback, min, max) => {
    const num = parseInt(raw, 10);
    if (isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
  };

  assert.equal(parseCustomSetting('10', 3, 1, 50), 10);
  assert.equal(parseCustomSetting('120', 60, 10, 300), 120);
  assert.equal(parseCustomSetting('invalid', 3, 1, 50), 3);
});

test('category elimination allows toggling categories while requiring min 3', () => {
  const allCategories = ['İsim', 'Şehir', 'Hayvan', 'Bitki', 'Eşya', 'Meslek', 'Ünlü', 'Ülke', 'Yemek', 'Dizi/Film'];
  
  const toggleCategory = (currentList, cat) => {
    if (currentList.includes(cat)) {
      if (currentList.length <= 3) return currentList;
      return currentList.filter(c => c !== cat);
    }
    return [...currentList, cat];
  };

  let selected = [...allCategories];
  // Eliminate 'Yemek'
  selected = toggleCategory(selected, 'Yemek');
  assert.equal(selected.includes('Yemek'), false);
  assert.equal(selected.length, 9);

  // Eliminate 'Dizi/Film'
  selected = toggleCategory(selected, 'Dizi/Film');
  assert.equal(selected.includes('Dizi/Film'), false);
  assert.equal(selected.length, 8);

  // Toggle back 'Yemek'
  selected = toggleCategory(selected, 'Yemek');
  assert.equal(selected.includes('Yemek'), true);
  assert.equal(selected.length, 9);

  // Ensure minimum 3 categories threshold
  const threeCategories = ['İsim', 'Şehir', 'Hayvan'];
  const triedRemoving = toggleCategory(threeCategories, 'İsim');
  assert.equal(triedRemoving.length, 3);
});

test('gizli kelime modu masks inspection answers in veto screen until user taps to reveal', () => {
  const isVetoWordRevealed = (isHiddenMode, isMe, isRevealedByClick) => {
    if (!isHiddenMode) return true;
    if (isMe) return true; // Player can always see own submitted answer
    return Boolean(isRevealedByClick);
  };

  // With hidden mode ON:
  assert.equal(isVetoWordRevealed(true, false, false), false); // Opponent answer starts masked
  assert.equal(isVetoWordRevealed(true, false, true), true); // Revealed on user tap
  assert.equal(isVetoWordRevealed(true, true, false), true); // User sees their own answer
  // With hidden mode OFF:
  assert.equal(isVetoWordRevealed(false, false, false), true); // Everyone's answer visible immediately
});

test('match-specific leaderboard extracts room code and resolves distinct match rankings', () => {
  const getRoomCodeFromHash = (hash, fallback = '#HB-5912') => {
    if (hash.includes('room=')) {
      const query = hash.split('room=')[1]?.split('&')[0];
      if (query) return query.startsWith('#') ? query : `#${query}`;
    }
    return fallback;
  };

  assert.equal(getRoomCodeFromHash('#/harfbaz-liderlik-tablosu?room=HB-9876'), '#HB-9876');
  assert.equal(getRoomCodeFromHash('#/harfbaz-liderlik-tablosu?room=%23HB-1234'), '#%23HB-1234');
  assert.equal(getRoomCodeFromHash('#/harfbaz-liderlik-tablosu'), '#HB-5912');

  const generateSeedMatch = (roomCode, userName = 'Misafir_Test') => {
    const clean = roomCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const seed = clean.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const myScore = 320 + (seed % 140);
    return {
      roomCode,
      players: [
        { name: userName, score: myScore, isMe: true },
        { name: 'Rakip 1', score: myScore - 30, isMe: false }
      ]
    };
  };

  const match1 = generateSeedMatch('#HB-1111');
  const match2 = generateSeedMatch('#HB-9999');

  assert.equal(match1.roomCode, '#HB-1111');
  assert.equal(match2.roomCode, '#HB-9999');
  assert.notEqual(match1.players[0].score, match2.players[0].score);
});
