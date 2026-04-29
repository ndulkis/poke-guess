const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonDetail = async (id) => {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`${BASE_URL}/pokemon/${id}`),
      fetch(`${BASE_URL}/pokemon-species/${id}`),
    ]);

    if (!pokemonRes.ok) throw new Error('Pokemon not found');

    const pokemon = await pokemonRes.json();
    const species = speciesRes.ok ? await speciesRes.json() : null;

    const flavorText = species
      ? (species.flavor_text_entries
          .find(e => e.language.name === 'en')
          ?.flavor_text
          .replace(/\f/g, ' ')
          .replace(/\n/g, ' ') ?? null)
      : null;

    return {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map(t => t.type.name),
      image: pokemon.sprites.other['official-artwork'].front_default,
      height: (pokemon.height / 10).toFixed(1),
      weight: (pokemon.weight / 10).toFixed(1),
      abilities: pokemon.abilities.map(a => ({
        name: a.ability.name.replace(/-/g, ' '),
        isHidden: a.is_hidden,
      })),
      stats: pokemon.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
      flavorText,
    };
  } catch (error) {
    console.error('Error fetching Pokémon detail:', error);
    return null;
  }
};

export const getRandomPokemon = async (seededRandom) => {
  const BASE_URL = 'https://pokeapi.co/api/v2';
  const totalPokemon = 1025; 
  
  // Use the seed if it exists, otherwise fallback to Math.random()
  const randomValue = seededRandom !== undefined ? seededRandom : Math.random();
  const id = Math.floor(randomValue * totalPokemon) + 1;
  
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    return {
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default,
      id: data.id,
      pixelSprite: data.sprites.front_default,
      types: data.types.map(t => t.type.name),
      cry: data.cries?.latest || data.cries?.legacy
    };
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    return null;
  }
};
// services/pokeapi.js

