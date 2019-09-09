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

  addMovie: movie => {
    const data = store.get("movies", []);
    const newMovies = [movie, ...data];
    store.set("movies", newMovies);
    return { success: true, data: store.get("movies") };
  }
};
