'use client';


import { useState, useEffect  } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";

const AnimatedButton = styled(Button)(({ theme, clicked }) => ({
  transition: "transform 0.3s",
  transform: clicked ? "scale(1.1)" : "scale(1)",
}));

const ResizableTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    resize: "vertical",
  },
  "& textarea": {
    resize: "vertical", // Allows the user to resize the textarea vertically
  },
});

const CodeContainer = styled("div")({
  display: "flex",
  position: "relative",
  border: "1px solid #ccc",
  borderRadius: "4px",
  overflow: "hidden",
});

const LineNumbers = styled("div")({
  backgroundColor: "#f0f0f0",
  padding: "10px",
  textAlign: "right",
  userSelect: "none",
  fontFamily: "monospace",
  fontSize: "14px",
  lineHeight: "1.5",
});

const CodeTextArea = styled("textarea")({
  border: "none",
  outline: "none",
  resize: "vertical",
  fontFamily: "monospace",
  fontSize: "14px",
  lineHeight: "1.5",
  padding: "10px",
  width: "100%",
  height: "300px",
});

export default function Home() {
  const [code, setCode] = useState("");
  const [clicked, setClicked] = useState(false);
  const [message, setMessage] = useState(""); // State to hold the main message
  const [symbols, setSymbols] = useState(null); // State to hold the list of symbols
  const [functions, setFunctions] = useState(null); // State to hold the list of functions
  const [errors, setErrors] = useState([]); // State to hold errors

  const [lineNumbers, setLineNumbers] = useState(["1"]);

  useEffect(() => {
    // Update line numbers whenever the code changes
    const lines = code.split("\n").length;
    const newLineNumbers = Array.from({ length: lines }, (_, index) => index + 1);
    setLineNumbers(newLineNumbers);
  }, [code]);

  const handleInputChange = (event) => {
    setCode(event.target.value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleClick = async () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);

    // Clear previous messages and errors
    setMessage("");
    setSymbols(null);
    setFunctions(null);
    setErrors([]);

    // Send the code to the backend
    try {
      const response = await axios.post("http://localhost:8000/submit-code", { code });
      const data = response.data;

      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors); // Set the errors if there are any
      } else {
        // Set the success message, symbols, and functions
        setMessage(data.message);
        setSymbols(data.symbols);
        setFunctions(data.functions);
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      setErrors(["Failed to submit code"]); // Set a generic error message
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h6">
        Write or upload your C code below
      </Typography>
       <Box mt={4}>
        <CodeContainer>
          <LineNumbers>
            {lineNumbers.map((number) => (
              <div key={number}>{number}</div>
            ))}
          </LineNumbers>
          <CodeTextArea
            value={code}
            onChange={handleInputChange}
            spellCheck="false"
          />
        </CodeContainer>
      </Box>

      <Box mt={2}>
        <input
          accept=".c"
          type="file"
          onChange={handleFileUpload}
          style={{ display: "block", marginBottom: "10px" }}
        />
        <AnimatedButton
          variant="contained"
          color="primary"
          clicked={clicked ? 1 : 0}
          onClick={handleClick}
        >
          Submit Code or File
        </AnimatedButton>
      </Box>

      {/* Display success message */}
      {message && (
        <Typography color="green" mt={2} style={{ whiteSpace: "pre-line" }}>
          {message}
        </Typography>
      )}

      {/* Display list of symbols */}
      {symbols && (
        <Box mt={2}>
          <Typography color="black">Lista de simbolos:</Typography>
          <pre>{JSON.stringify(symbols, null, 2)}</pre>
        </Box>
      )}

      {/* Display list of functions */}
      {functions && (
        <Box mt={2}>
          <Typography color="black">Lista de funciones:</Typography>
          <pre>{JSON.stringify(functions, null, 2)}</pre>
        </Box>
      )}

      {/* Display errors */}
      {errors.length > 0 && (
        <Box mt={2}>
          <Typography color="red">Errors:</Typography>
          <ul>
            {errors.map((error, index) => (
              <li key={index} style={{ color: "red" }}>
                {error}
              </li>
            ))}
          </ul>
        </Box>
      )}
    </div>
  );
}

