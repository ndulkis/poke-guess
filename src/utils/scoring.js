export function calculatePoints(misses) {
  if (misses === 0) return 100;
  if (misses === 1) return 50;
  if (misses === 2) return 40;
  if (misses === 3) return 35;
  return 30;
}

export function getTimePenalty(misses) {
  if (misses === 3 || misses === 4) return 5;
  if (misses === 5) return 10;
  if (misses >= 6) return 15;
  return 0;
}

export const RANKS = [
  { title: 'Youngster Joey', min: 0,   threshold: '0–149',   color: 'border-orange-400', text: 'text-orange-400', bg: 'bg-orange-400/10', desc: "My Rattata is in the top percentage!" },
  { title: 'Grunt',          min: 150,  threshold: '150–299', color: 'border-gray-500',   text: 'text-gray-400',   bg: 'bg-gray-500/10',   desc: 'Getting started. Keep practicing!' },
  { title: 'Gym Leader',     min: 300,  threshold: '300–449', color: 'border-green-500',  text: 'text-green-400',  bg: 'bg-green-500/10',  desc: 'Respectable. Good Pokémon fundamentals' },
  { title: 'Ace Trainer',    min: 450,  threshold: '450–599', color: 'border-blue-500',   text: 'text-blue-400',   bg: 'bg-blue-500/10',   desc: 'Solid performance with room to grow' },
  { title: 'Elite Four',     min: 600,  threshold: '600–799', color: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'Exceptional knowledge with strong speed' },
  { title: 'Champion',       min: 800,  threshold: '800+',    color: 'border-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: 'Near-perfect accuracy under pressure' },
];

export function getRank(score) {
  return [...RANKS].reverse().find(r => score >= r.min) ?? RANKS[0];
}
