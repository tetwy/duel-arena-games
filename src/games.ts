export interface GameItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  players: string;
  accentColor: string;
  glowColor: string;
  banner: string;
  route: string;
  badge: string;
}

export const GAMES: GameItem[] = [
  {
    id: 'veto',
    title: 'VETO',
    subtitle: 'Yasaklı Kelime Düellosu',
    description: 'Yasaklı kelimeler tuzağına düşmeden hedefini takımına anlat, puanları topla.',
    tag: 'TABU / DÜELLO',
    players: '4+ OYUNCU',
    badge: 'TAKIM REKABETİ',
    accentColor: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.65)',
    banner: '/banners/veto-cover.jpg',
    route: '/games/veto/',
  },
  {
    id: 'harfbaz',
    title: 'HARFBAZ',
    subtitle: 'Online Hızlı Kelime Yarışı',
    description: 'Rastgele gelen harfle kategorileri en hızlı sen doldur, oylamayı kazan.',
    tag: 'STOP / İSİM-ŞEHİR',
    players: '2-16 OYUNCU',
    badge: 'HIZ ARENASI',
    accentColor: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.65)',
    banner: '/banners/harfbaz-cover.jpg',
    route: '/games/harfbaz/',
  }
];
