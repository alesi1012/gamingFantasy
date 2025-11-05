import { useState } from "react";

interface Pokemon {
    name: string;
    url: string;
}

export default function ApiCall() {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);

    const getData = () => {
        fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
            .then((response) => response.json())
            .then((json) => setPokemons(json.results))
            .catch((error) => console.error("Error:", error));
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h2>Pokémon List</h2>
            <button onClick={getData}>Get Pokémon</button>
            <ul>
                {pokemons.map((poke, index) => (
                    <li key={index}>{poke.name}</li>
                ))}
            </ul>
        </div>
    );
}
