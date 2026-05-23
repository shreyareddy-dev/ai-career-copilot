import { useState } from "react";

function App() {

  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [score, setScore] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadResume = async () => {

    if (!file) {
      alert("Please choose a resume");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    // Extract Skills
    const skillsResponse = await fetch(
      "http://127.0.0.1:8000/extract-skills",
      {
        method: "POST",
        body: formData,
      }
    );

    const skillsData = await skillsResponse.json();
    setSkills(skillsData.skills_found);

    // ATS Score
    const scoreResponse = await fetch(
      "http://127.0.0.1:8000/ats-score",
      {
        method: "POST",
        body: formData,
      }
    );

    const scoreData = await scoreResponse.json();
    setScore(scoreData["ATS Score"]);

    // Missing Skills
    const missingResponse = await fetch(
      "http://127.0.0.1:8000/missing-skills",
      {
        method: "POST",
        body: formData,
      }
    );

    const missingData = await missingResponse.json();
    setMissingSkills(missingData.missing_skills);

    // Extract Resume Text
    const textResponse = await fetch(
      "http://127.0.0.1:8000/extract-text",
      {
        method: "POST",
        body: formData,
      }
    );

    const textData = await textResponse.json();
    setResumeText(textData.extracted_text);

    // Resume Suggestions
    let tips = [];

    if (scoreData["ATS Score"] < 70) {
      tips.push("Improve ATS score by adding more required skills");
    }

    if (missingData.missing_skills.includes("Docker")) {
      tips.push("Learn and add Docker projects");
    }

    if (missingData.missing_skills.includes("AWS")) {
      tips.push("Add cloud deployment experience");
    }

    if (skillsData.skills_found.length < 5) {
      tips.push("Add more technical skills to resume");
    }

    if (tips.length === 0) {
      tips.push("Resume looks strong. No major improvements needed.");
    }

    setSuggestions(tips);

    setLoading(false);

  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "white",
      padding: "40px",
      fontFamily: "Arial",
      textAlign: "center"
    }}>

      <h1 style={{
        marginBottom: "10px",
        fontSize: "48px"
      }}>
        AI Career Copilot
      </h1>

      <p style={{
        marginBottom: "30px",
        opacity: 0.8
      }}>
        AI-Powered Resume Analyzer and ATS Checker
      </p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button
        onClick={uploadResume}
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {!file && (
        <p style={{
          marginTop: "20px",
          opacity: 0.7
        }}>
          Upload a resume to begin analysis
        </p>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginTop: "40px"
      }}>

        {/* ATS Score */}
        <div style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px"
        }}>
          <h2>ATS Score</h2>
          <h1>{score}</h1>
        </div>

        {/* Detected Skills */}
        <div style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px"
        }}>
          <h2>Detected Skills</h2>

          <ul style={{
            listStylePosition: "inside",
            display: "inline-block",
            textAlign: "left"
          }}>
            {skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>

        {/* Missing Skills */}
        <div style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px"
        }}>
          <h2>Missing Skills</h2>

          <ul style={{
            listStylePosition: "inside",
            display: "inline-block",
            textAlign: "left"
          }}>
            {missingSkills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>

        {/* Resume Suggestions */}
        <div style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px"
        }}>
          <h2>Resume Suggestions</h2>

          <ul style={{
            listStylePosition: "inside",
            display: "inline-block",
            textAlign: "left"
          }}>
            {suggestions.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Resume Text */}
        <div style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
          gridColumn: "1 / span 2"
        }}>
          <h2>Resume Text</h2>

          <div style={{
            maxHeight: "300px",
            overflowY: "scroll",
            textAlign: "left",
            whiteSpace: "pre-wrap"
          }}>
            {resumeText}
          </div>
        </div>

      </div>

      <p style={{
        marginTop: "40px",
        opacity: 0.7
      }}>
        Built using React + FastAPI
      </p>

    </div>
  );
}

export default App;