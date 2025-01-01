import React , {useState} from 'react';
import "./App.css";
import axios from 'axios';

const App = () => {

  const [code, setcode] = useState('');
  const [output, setoutput] = useState("");
  const [language, setlanguage] = useState("cpp");
  const [status, setstatus] = useState("");
  const [jobId, setjobId] = useState("");

  const handleSubmit = async () => {
    const payload = {
      language,
      code
    };
  
    try {
      setjobId("");
      setstatus("");
      setoutput("");
      const { data } = await axios.post("http://localhost:5000/run", payload);
      setjobId(data.jobId);
      let intervalId;
  
      intervalId = setInterval(async () => {
        const { data: dataRes } = await axios.get("http://localhost:5000/status", {
          params: { id: data.jobId }
        });
        const { success, job, error } = dataRes;
        if (success) {
          const { status: jobStatus, output: joboutput } = job;
          setstatus(jobStatus);
          if (jobStatus === "pending") return;  // Keep polling if job is pending
          setoutput(joboutput);
          clearInterval(intervalId);  // Stop the polling once the job is completed or errored
        } else {
          setstatus("Error: Please retry!");
          console.log(error);
          clearInterval(intervalId);  // Stop the polling on error
          setoutput(error);
        }
        console.log(dataRes);
      }, 100);  // Increase interval to 1 second
  
    } catch ({ response }) {
      if (response) {
        const errorMsg = response.data.error.stderr;
        setoutput(errorMsg);
      } else {
        setoutput("Error connecting server");
      }
    }
  }
  
  return (
    <div>
      <h1>Online Code Compiler</h1>
      <div>
        <label>Language: </label>
        <select
          value={language}
          onChange={(e)=> {
            setlanguage(e.target.value);
          }}
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>
      <br/>
      <textarea
        name="codeInput"
        id="codeInput"
        rows="20"
        cols="75"
        value={code}
        onChange={(e) => setcode(e.target.value)}
      ></textarea>
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{status}</p>
      <p>{jobId && `JobID : ${jobId}`}</p>
      <p>{output}</p>
    </div>
  );
};

export default App;
