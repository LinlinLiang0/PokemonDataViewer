window.addEventListener("load", function(){
    // Your client-side JavaScript here

    // Remember that your client-side JavaScript cannot directly access any data in your server-side script
    // All data from the server must be accessed via AJAX fetch requests and the route handlers you write inside 'web-assignment-pokemon.js'
    displayAllPokemon();
    displayRandomPokemon();
});
    let storage = window.localStorage;
    let allPokemonJSON;
    let currentPok;
    async function displayAllPokemon(){
        let allpokemon = await fetch("./getAllPokemonNames");
        allPokemonJSON = await allpokemon.json();
        displayFavoritePokemon();
        let pokemonList = document.querySelector("#pokemonList");
        for(let i = 0; i < allPokemonJSON.length; i++){
            let listObj = document.createElement("li"); 
            listObj.innerHTML = `<a href= "#">${allPokemonJSON[i]}</a>`;
            listObj.addEventListener("click", function(){
                displayCurrentPokemon(allPokemonJSON[i]);
            });
            pokemonList.appendChild(listObj);
        }
       
    }

    async function displayCurrentPokemon(pokemonName){
        let pokemonData = await fetch(`./getPokemonByName?pokemonName=${pokemonName}`)
        let pokemonDataJSON = await pokemonData.json();
        currentPok = pokemonName;
        initStorage(pokemonDataJSON);
        displayPokemon(pokemonDataJSON);
    }

    async function displayRandomPokemon(){
        let randomPokemon = await fetch("./getRandomPokemon");
        let randomPokemonJSON = await randomPokemon.json();
        currentPok = randomPokemonJSON.name;
        initStorage(randomPokemonJSON);
        displayPokemon(randomPokemonJSON);
    }

    async function displayPokemon(pokemonJSON){
        
        //display the middle div
        document.querySelector("#img").innerHTML = `<img src="./images/${pokemonJSON.imageUrl}" height="200" width="200">`;  
        document.querySelector("#currentName1").innerHTML = pokemonJSON.name;
        document.querySelector("#currentName2").innerHTML = pokemonJSON.name;
        document.querySelector("#types").innerHTML = "";
        document.querySelector("#table").innerHTML = "";
        for(let i = 0; i < pokemonJSON.types.length; i++){
            let typesList =  document.createElement("li");
            typesList.innerHTML = pokemonJSON.types[i];
            document.querySelector("#types").appendChild(typesList);
            //display the right div
            displayTable(pokemonJSON.types[i]);
        }
        document.querySelector("#description").innerHTML = pokemonJSON.description;
        fetchShape(pokemonJSON.name.toLowerCase());
        fetchHabitat(pokemonJSON.name.toLowerCase());
        addToFavorite(pokemonJSON.name);
        
    }
    async function displayTable(typeName){
        let typeData = await fetch(`./getTypeByName?type=${typeName}`);
        let typeDataJSON = await typeData.json();
        
        let typeTable = document.createElement("table"); 
        typeTable.innerHTML = `<caption>${typeDataJSON.name}</caption><thead><tr><th>Type</th><th>Effectiveness</th></tr></thead>`;
        for(let i = 0; i < typeDataJSON.data.length; i++){
           typeTable.innerHTML += `<tbody><tr><td>${typeDataJSON.data[i].against}</td><td>${typeDataJSON.data[i].effectiveness}</td></tr></tbody>`
        }
        document.querySelector("#table").appendChild(typeTable);
        

    }
    
    function addToFavorite(pokemonName){
        document.querySelector("#addToMyFavorite").addEventListener("click", function(){
            if (currentPok == pokemonName) {
                let pokemonJSON = JSON.parse(storage.getItem(pokemonName));
                if(pokemonJSON.favorate == "0") {
                    pokemonJSON.favorate = "1";
                    storage.setItem(pokemonName, JSON.stringify(pokemonJSON));
                }
                displayFavoritePokemon();
            }
            
        });
        
    }

    function displayFavoritePokemon(){
        let favPokemons = [];
        document.querySelector("#favoriteP").innerHTML = "";
        for (let i = 0; i < allPokemonJSON.length; i++) {
                let pokemonJSON = JSON.parse(storage.getItem(allPokemonJSON[i]));
                if (pokemonJSON.favorate == "1") {
                    favPokemons.push(pokemonJSON)
                    let favoriteP = document.createElement("p");
                    favoriteP.innerHTML = pokemonJSON.name + `<img src="./images/${pokemonJSON.imageUrl}" height="50" width="50">`
                        + '<button class="removeButton">remove</button>';  
                        document.querySelector("#favoriteP").appendChild(favoriteP);
                }
        }
            
        let removeButton = document.querySelectorAll(".removeButton");
        for(let j = 0; j < removeButton.length; j++){
            removeButton[j].addEventListener("click", function(event){
                (event.target).parentNode.remove();
                favPokemons[j].favorate = "0";
                storage.setItem(favPokemons[j].name, JSON.stringify(favPokemons[j]));
            })
        }
    }

    function initStorage(pokemonDataJSON){
        if (storage.getItem(pokemonDataJSON.name) == null) {
            let pokemonJSON = {
                name: pokemonDataJSON.name,
                imageUrl: pokemonDataJSON.imageUrl,
                favorate: "0",
            }
            storage.setItem(pokemonDataJSON.name, JSON.stringify(pokemonJSON));
        }
    }
    async function fetchShape(pokemonName){
        let shape = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if(shape.status == 404 || shape.statusText == 'Not found'){
            return
        }
        let shapeJSON = await shape.json();
        document.querySelector("#weight").innerHTML = shapeJSON.weight / 10;
        document.querySelector("#height").innerHTML = shapeJSON.height / 10;

    }
    async function fetchHabitat(pokemonName){
        let habitat = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
        if(habitat.status == 404 || habitat.statusText == 'Not found'){
            return
        }
        let habitatJSON = await habitat.json();
        document.querySelector("#habitat").innerHTML = habitatJSON.habitat.name;
    }
