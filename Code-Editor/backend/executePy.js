const { exec } = require("child_process");

const executePy = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`python "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Python execution error:", error);
        return reject({ error, stderr });
      }
      if (stderr) {
        console.error("Python runtime error:", stderr);
        return reject(stderr);
      }
      console.log("Python execution output:", stdout);
      resolve(stdout);
    });
  });
};

module.exports = {
  executePy,
};
