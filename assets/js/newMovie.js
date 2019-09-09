const { ipcRenderer } = require("electron");

const openImage = () => {
  ipcRenderer.send("image:open");
};
const imgInput = document.getElementById("movieImage");
const nameInput = document.getElementById("movieName");

ipcRenderer.on("image:get", (_, path) => {
  if (path[0]) {
    imgInput.value = path[0];
  }
});

const handleSubmit = e => {
  e.preventDefault();
  const name = nameInput.value;
  const img = imgInput.value;
  ipcRenderer.send("movie:add", { name, img });
};
