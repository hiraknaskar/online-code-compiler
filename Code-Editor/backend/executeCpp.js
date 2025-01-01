const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    const command = `g++ "${filePath}" -o "${outPath}" && cd "${outputPath}" && ${jobId}.out`;
    console.log("Executing:", command);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            reject({ error, stderr });
        }
        if (stderr) {
            reject(stderr);
        }
        resolve(stdout);
    });
  });
};

module.exports = {
  executeCpp,
};
