const { ipcRenderer } = require("electron");

//Main Proccess Sent the movies
ipcRenderer.on("movie:getAll", (_, data) => {
  initializeMovies(data);
});
// Request Movies from main proccess
ipcRenderer.send("movie:getAll");

const initializeMovies = movies => {
  //Find the template & the container
  const moviesContainer = document.querySelector(".movies-container");
  let child = moviesContainer.lastElementChild;
  while (child) {
    moviesContainer.removeChild(child);
    child = moviesContainer.lastElementChild;
  }
  const movieTemplate = document.querySelector("#movie-template").content
    .firstElementChild;

  //Create a movie card for each element and append it to the container
  for (let movie of movies) {
    const clone = movieTemplate.cloneNode(true);
    clone.setAttribute("id", movie.id);
    clone.querySelector("img").setAttribute("src", movie.img);
    clone.querySelector("h3").textContent = movie.name;
    moviesContainer.appendChild(clone);
  }
};

function openMovie(id) {
  ipcRenderer.send("movie:open", id);
}

// ipcRenderer.send("movie:add", { id: "1123", name: "New Movie", img: "#" });

const newMovie = () => {
  ipcRenderer.send("movie:new");
};
