const { ipcRenderer } = require("electron");

//Main Proccess Sent the movies
ipcRenderer.on("movie:getAll", (_, data) => {
  initializeMovies(data);
});
// Request Movies from main proccess
ipcRenderer.send("movie:getAll");

ipcRenderer.on("movie:remove", () => {
  ipcRenderer.send("movie:getAll");
});

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
    clone.querySelector(".movie-card").setAttribute("id", movie.id);
    clone.querySelector("img").setAttribute("src", movie.img);
    clone.querySelector("h3").textContent = movie.name;
    clone.querySelectorAll("i[data-id]").forEach(element => {
      element.setAttribute("data-id", movie.id);
    });
    const stars = clone.querySelectorAll(".rating i");
    let i = 0;
    while (i < movie.rating) {
      stars[i].classList.add("text-warning");
      i++;
    }
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

const removeMovie = element => {
  const id = element.getAttribute("data-id");
  ipcRenderer.send("movie:remove", id);
};

const editMovie = element => {
  const id = element.getAttribute("data-id");
  ipcRenderer.send("movie:edit", id);
};
