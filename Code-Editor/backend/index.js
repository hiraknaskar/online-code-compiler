require("dotenv").config(); // Add environment variable support
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const { addJobToQueue} = require("./jobQueue");
const JobModel = require("./models/job");
const job = require("./models/job");

// Load MongoDB URI from environment variables 
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error", err));

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/status", async (req, res) => {
    const jobId = req.query.id;
    console.log("Status requested for Job ID:", jobId);
  
    if (jobId == undefined) {
      return res.status(400).json({ success: false, error: "Missing 'id' query parameter" });
    }
    console.log(jobId);
    try {
      const job = await JobModel.findById(jobId); // Use the correct model
  
      if (job === undefined) {
        return res.status(404).json({ success: false, error: "Invalid Job ID or Job not found" });
      }
  
      return res.status(200).json({ success: true, job });
    } catch (error) {
      console.error("Error fetching job status:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Empty code body" });
  }

  let jobRecord;

  try {
    // Create job entry with status 'pending'
    const filepath = await generateFile(language, code);
    jobRecord = new JobModel({ language, filepath });
    await jobRecord.save();

    // Start execution and update job status
    const jobId = jobRecord["_id"];
    addJobToQueue(jobId);
    console.log(`Job created with ID: ${jobId}`);

    res.status(201).json({ success: true, jobId });
  } catch (error) {
    return res.status(500).json({ success: false, error: JSON.stringify(error) });
  }
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
