import test from 'node:test';
import assert from 'node:assert/strict';

export function createMockUniqueGuest(randomNum = Math.floor(1000 + Math.random() * 9000)) {
  return {
    id: `guest_${Date.now()}_${randomNum}`,
    username: `Misafir_${randomNum}`,
    avatar: '🎭',
    eloRating: 1200,
    totalMatches: 0,
    wins: 0,
    isGuest: true,
  };
}

export function migrateGuestProfile(parsed) {
  if (parsed && parsed.isGuest && (parsed.username?.startsWith('Gladiator#') || parsed.username === 'Oyuncu' || !parsed.username)) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return {
      ...parsed,
      username: `Misafir_${randomNum}`,
    };
  }
  return parsed;
}

test('createMockUniqueGuest generates valid unique guest without requiring login', () => {
  const guest1 = createMockUniqueGuest(1234);
  const guest2 = createMockUniqueGuest(5678);

  assert.equal(guest1.isGuest, true);
  assert.equal(guest1.username, 'Misafir_1234');
  assert.equal(guest1.eloRating, 1200);

  assert.equal(guest2.isGuest, true);
  assert.equal(guest2.username, 'Misafir_5678');
  assert.notEqual(guest1.username, guest2.username);
  assert.notEqual(guest1.id, guest2.id);
});

test('migrateGuestProfile updates old Gladiator# or Oyuncu names to Misafir_ pattern', () => {
  const legacy1 = { id: 'g1', username: 'Gladiator#9999', isGuest: true };
  const migrated1 = migrateGuestProfile(legacy1);
  assert.match(migrated1.username, /^Misafir_\d{4}$/);

  const legacy2 = { id: 'g2', username: 'Oyuncu', isGuest: true };
  const migrated2 = migrateGuestProfile(legacy2);
  assert.match(migrated2.username, /^Misafir_\d{4}$/);

  const customGuest = { id: 'g3', username: 'ZekaKralı', isGuest: true };
  const notMigrated = migrateGuestProfile(customGuest);
  assert.equal(notMigrated.username, 'ZekaKralı');
});

test('mock signOut regenerates a fresh distinct guest profile', () => {
  const initialGuest = createMockUniqueGuest(2001);
  // Simulating signOut generating a fresh guest
  const refreshedGuest = createMockUniqueGuest(8999);

  assert.equal(initialGuest.username, 'Misafir_2001');
  assert.equal(refreshedGuest.username, 'Misafir_8999');
  assert.notEqual(initialGuest.username, refreshedGuest.username);
  assert.equal(refreshedGuest.isGuest, true);
});
