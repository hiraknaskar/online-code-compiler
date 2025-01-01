const Queue = require("bull");
const Job = require("./models/job");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");

const jobQueue = new Queue("job-queue");
const NUM_WORKERS = 5;

jobQueue.process(NUM_WORKERS, async ({ data }) => {
  const { id: jobId } = data;

  const job = await Job.findById(jobId);
  if (!job) throw new Error(`Job with ID ${jobId} not found.`);

  job.startedAt = new Date();
  try {
    let output;
    if (job.language === "cpp") {
      output = await executeCpp(job.filepath);
    } else if (job.language === "py") {
      output = await executePy(job.filepath);
    } else {
      throw new Error(`Unsupported language: ${job.language}`);
    }

    job.completedAt = new Date();
    job.status = "success";
    job.output = output;
    await job.save();
  } catch (error) {
    job.completedAt = new Date();
    job.status = "error";
    job.output = error.message || "Unknown error occurred";
    await job.save();
  }
});

const addJobToQueue = async (jobId, callback = null) => {
  await jobQueue.add({ id: jobId });
  if (callback) await callback();
};

module.exports = { addJobToQueue };
