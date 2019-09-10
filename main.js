const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const uuidv1 = require("uuid/v1");

//Main Window
//-------------------------------------------
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 780,
    // frame: false,    //we can use this to get rid of the top bars ( make the window framless)
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

//New Movie window
//-------------------------------------------------
let newMovieWindow;
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

ipcMain.on("newMovie:close", () => {
  newMovieWindow.close();
});

ipcMain.on("movie:new", () => {
  createNewMovieWindow();
});

//Movies Events
//-----------------------------------------------
const moviesData = require("./assets/data/movies");

ipcMain.on("movie:getAll", async () => {
  const movies = await moviesData.getMovies();
  mainWindow.webContents.send("movie:getAll", movies);
});

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

ipcMain.on("movie:remove", (_, id) => {
  const result = dialog.showMessageBoxSync(mainWindow, {
    type: "warning",
    title: "Remove Movie",
    message: "Are You sure you want to remove this movie ",
    buttons: ["Yes", "No"]
  });
  console.log(result);
  if (result === 0) {
    moviesData.removeMovie(id);
    mainWindow.webContents.send("movie:remove");
  }
});

ipcMain.on("movie:open", (_, id) => {
  console.log(`Movie with id ${id} is requested`);
});

ipcMain.on("image:open", () => {
  const fullPath = dialog.showOpenDialogSync(newMovieWindow, {
    title: "Choose an image for the movie",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["jpg", "png", "gif"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  newMovieWindow.webContents.send("image:get", fullPath);
});

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
Menu.setApplicationMenu(menu);

//Implementing my own store config
//---------------------------------------------------------------------------
// const Store = require("./store");
// const store = new Store(undefined, { msg: "Hello" });
// store.set("games", ["nier automata", "metal gear solid", "the witcher 3"]);
// store.set("username", "Mohammed Taher ghazal");
