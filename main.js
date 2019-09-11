const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const uuidv1 = require("uuid/v1");
const moviesData = require("./assets/data/movies");

//Main Window
//-------------------------------------------
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 780,
    webPreferences: { nodeIntegration: true } //This allows for node syntax on the front-end ( using 'require' for example)
  });
  mainWindow.loadFile("index.html");
  // mainWindow.removeMenu();
  mainWindow.on("closed", () => (mainWindow = null));
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

//Setting the app menu
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "New Movie/Game",
        accelerator: "Ctrl+N",
        click() {
          createNewMovieWindow();
        }
      },
      {
        label: "Clear All",
        click() {
          clearAll();
        }
      },
      { type: "separator" },
      { role: "minimize" },
      { role: "quit", accelerator: "Ctrl+Q" }
    ]
  }
];
const menu = Menu.buildFromTemplate(menuTemplate);
// Menu.setApplicationMenu(menu);

//New Movie window
//Edit Movie Window
//-------------------------------------------------
let newMovieWindow;
let editMovieWindow;
function createNewMovieWindow() {
  newMovieWindow = new BrowserWindow({
    width: 800,
    height: 500,
    parent: mainWindow,
    frame: false,
    modal: true, //This makes the parent window unfocusable until this one is closed
    webPreferences: { nodeIntegration: true } //This allows for node syntax on the front-end ( using 'require' for example)
  });

  newMovieWindow.loadFile("newMovie.html");
  newMovieWindow.removeMenu();
  newMovieWindow.on("close", () => {
    newMovieWindow = null;
  });
}

function createEditMovieWindow(id) {
  editMovieWindow = new BrowserWindow({
    width: 800,
    height: 500,
    parent: mainWindow,
    frame: false,
    modal: true, //This makes the parent window unfocusable until this one is closed
    webPreferences: { nodeIntegration: true } //This allows for node syntax on the front-end ( using 'require' for example)
  });

  editMovieWindow.loadFile("editMovie.html");
  // editMovieWindow.removeMenu();
  editMovieWindow.on("close", () => {
    editMovieWindow = null;
  });
  editMovieWindow.webContents.on("dom-ready", () => {
    const movies = moviesData.getMovies();
    const movieToSend = movies.filter(m => m.id === id)[0];
    editMovieWindow.webContents.send("movie:editData", {
      name: movieToSend.name,
      img: movieToSend.img,
      id: movieToSend.id,
      rating: movieToSend.rating
    });
  });
}

//Closeing any submenu
ipcMain.on("subwindow:close", () => {
  if (newMovieWindow) newMovieWindow.close();
  if (editMovieWindow) editMovieWindow.close();
});

//Clear the store
const clearAll = () => {
  const result = dialog.showMessageBoxSync(mainWindow, {
    type: "warning",
    title: "Clear All Movies",
    message: "Are You sure you want to remove all movies ",
    buttons: ["Yes", "No"]
  });
  if (result === 0) {
    moviesData.clearAll();
    mainWindow.webContents.send("movie:getAll", []);
  }
};

//Create A new Movie API
//--------------------------------
ipcMain.on("movie:new", () => {
  createNewMovieWindow();
});

//Request to add movie with this details
ipcMain.on("movie:add", async (_, movie) => {
  const { success, data } = await moviesData.addMovie({
    ...movie,
    id: uuidv1()
  });
  if (success) {
    mainWindow.webContents.send("movie:getAll", data);
    newMovieWindow.close();
  }
});

//------------------------------
//------------------------------
//------------------------------
//------------------------------

//Open edit Movie Window
ipcMain.on("movie:edit", (_, id) => {
  createEditMovieWindow(id);
});

ipcMain.on("movie:update", (_, newMovie) => {
  console.log(newMovie);
  const { success, data } = moviesData.updateMovie(newMovie);
  if (success) {
    mainWindow.webContents.send("movie:getAll", data);
    editMovieWindow.close();
  }
});

//General Movies API
//---------------------------
//---------------------------
//--------------------------

//Get all movies in store
ipcMain.on("movie:getAll", async () => {
  const movies = await moviesData.getMovies();
  mainWindow.webContents.send("movie:getAll", movies);
});

//Request to remove a movie with id
ipcMain.on("movie:remove", (_, id) => {
  const result = dialog.showMessageBoxSync(mainWindow, {
    type: "warning",
    title: "Remove Movie",
    message: "Are You sure you want to remove this movie ",
    buttons: ["Yes", "No"]
  });
  if (result === 0) {
    moviesData.removeMovie(id);
    mainWindow.webContents.send("movie:remove");
  }
});

//Open a window for choosing where the image for movie is located
ipcMain.on("image:open", () => {
  const fullPath = dialog.showOpenDialogSync(newMovieWindow, {
    title: "Choose an image for the movie",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["jpg", "png", "gif"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  newMovieWindow && newMovieWindow.webContents.send("image:get", fullPath);
  editMovieWindow && editMovieWindow.webContents.send("image:get", fullPath);
});

//Implementing my own store config
//---------------------------------------------------------------------------
// const Store = require("./store");
// const store = new Store(undefined, { msg: "Hello" });
// store.set("games", ["nier automata", "metal gear solid", "the witcher 3"]);
// store.set("username", "Mohammed Taher ghazal");
