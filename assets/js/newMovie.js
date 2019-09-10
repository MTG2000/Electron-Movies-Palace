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

//Range Slider
const slider = document.getElementById("movieRating");
const output = document.getElementById("rangeOutput");
output.innerHTML = slider.value; // Display the default slider value

slider.oninput = function() {
  output.innerHTML = this.value;
};

const handleSubmit = e => {
  e.preventDefault();
  const name = nameInput.value;
  const img = imgInput.value;
  const rating = slider.value;
  ipcRenderer.send("movie:add", { name, img, rating });
};
