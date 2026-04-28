const BASE_URL = 'https://pokeapi.co/api/v2';

export const getRandomPokemon = async () => {
  // Currently 1025 Pokémon in the National Dex
  const randomId = Math.floor(Math.random() * 1025) + 1;
  
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${randomId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    return {
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default,
      id: data.id,
      types: data.types.map(t => t.type.name)
    };
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    return null;
  }
};