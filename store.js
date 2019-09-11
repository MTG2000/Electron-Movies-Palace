const { app } = require("electron");
const fs = require("fs");
const path = require("path");

module.exports = class Store {
  //----------------------
  constructor(fileName = "userPrefs", data = {}) {
    this.filePath = path.join(app.getPath("userData"), `${fileName}.json`);

    this.data = parseDataFile(this.filePath, data);
  }

  //----------------------
  set(key, value) {
    this.data = { ...this.data, [key]: value };
    fs.writeFileSync(this.filePath, JSON.stringify(this.data));
  }
  //-----------------------
  get(key) {
    return this.data[key];
  }
};

const parseDataFile = (filePath, data) => {
  try {
    const fd = fs.readFileSync(filePath);
    return { ...JSON.parse(fd), ...data };
  } catch (err) {
    fs.writeFileSync(filePath, JSON.stringify(data));
    return data;
  }
};
