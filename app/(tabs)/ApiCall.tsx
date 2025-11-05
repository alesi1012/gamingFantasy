import {data} from "browserslist";

export const ApiCall = () => {
    function getData(){
        fetch('https://pokeapi.co/api/v2/pokemon')
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));
    }

    return (
        <p>
            <button onClick={getData}>Get Data</button>
            <br/>
            <br/>
            {JSON.stringify(data)}
        </p>
    );
};