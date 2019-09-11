const fs = require("fs");
const path = require("path");
const Store = require("electron-store");

const store = new Store();

module.exports = {
  clearAll: () => {
    store.set("movies", []);
  },
  getMovies: () => {
    const data = store.get("movies", []);
    return data;
  },
  updateMovie: newMovie => {
    const data = store.get("movies", []);
    const newData = data.map(movie => {
      if (movie.id === newMovie.id) {
        return newMovie;
      }
      return movie;
    });
    store.set("movies", newData);
    return { success: true, data: store.get("movies") };
  },
  addMovie: movie => {
    const data = store.get("movies", []);
    const newMovies = [movie, ...data];
    store.set("movies", newMovies);
    return { success: true, data: store.get("movies") };
  },
  removeMovie: id => {
    const movies = store.get("movies", []);
    const newMovies = movies.filter(movie => movie.id !== id);
    store.set("movies", newMovies);
  }
};
