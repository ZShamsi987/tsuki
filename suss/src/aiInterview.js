// src/aiInterview.js
const fetch = require('node-fetch');

/**
 * Recursively flattens an array.
 * @param {Array} arr - The array to flatten.
 * @returns {Array} The flattened array.
 */
function flattenDeep(arr) {
  return arr.reduce(
    (acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
    []
  );
}

/**
 * Fully flattens an array until no nested arrays remain.
 * @param {Array} arr - The array to fully flatten.
 * @returns {Array} The completely flattened array.
 */
function fullyFlatten(arr) {
  let flat = flattenDeep(arr);
  while (flat.some(item => Array.isArray(item))) {
    flat = [].concat(...flat);
  }
  return flat;
}

/**
 * Robustly parses a JSON string.
 * If the initial parse fails, it removes newlines and extra spaces and tries again.
 * Falls back to a default object if parsing fails.
 *
 * @param {string} str - The JSON string to parse.
 * @returns {object} The parsed JSON object.
 */
function robustJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Initial JSON parse error:", e);
    const fixed = str.replace(/\n/g, '').trim();
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("Fallback JSON parse error:", e2);
      return { questions: ["Default Q1", "Default Q2", "Default Q3", "Default Q4", "Default Q5"] };
    }
  }
}

/**
 * Converts an item to a string.
 * If the item is an object with a "question" property, returns that value.
 * Otherwise, converts the item to a string.
 *
 * @param {*} item - The item to convert.
 * @returns {string} The resulting string.
 */
function toQuestionString(item) {
  if (item && typeof item === 'object' && 'question' in item) {
    return String(item.question).trim();
  }
  return String(item).trim();
}

/**
 * Checks if a string is a valid interview question.
 * Rejects common labels or junk values.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidQuestion(str) {
  const lower = str.toLowerCase();
  if (lower === 'technical' || lower === 'non-technical' || lower === 'null' || lower === '') {
    return false;
  }
  if (!isNaN(Number(str)) || str.length < 3) {
    return false;
  }
  return true;
}

/**
 * Extracts questions from various possible keys in the API response.
 * Merges arrays if separate technical and non‑technical keys exist.
 *
 * @param {object|array} data - The parsed API response or its "response" property.
 * @returns {Array} An array (possibly nested) of questions.
 */
function extractQuestions(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if ('questions' in data) return data.questions;
    if ('technical questions' in data && 'non-technical questions' in data) {
      return data["technical questions"].concat(data["non-technical questions"]);
    }
    if ('interview_questions' in data) return data["interview_questions"];
    if ('interviewQuestions' in data) return data["interviewQuestions"];
    if ('technical' in data && 'non-technical' in data) {
      return [data.technical, data["non-technical"]];
    }
    if ('value' in data) return data.value;
    if ('key' in data && 'text' in data) return [data.text];
    return Object.values(data);
  }
  return [data];
}

/**
 * Generates exactly 5 interview questions based on the job description using the local Ollama API.
 * Returns a flat JSON array of 5 strings.
 *
 * @param {string} jobDescription - The job description.
 * @returns {Promise<string[]>} A promise that resolves with a flat array of 5 interview question strings.
 */
async function generateInterviewQuestions(jobDescription) {
  // Modified prompt to force a plain JSON array of exactly 5 strings.
  const prompt = `Generate 5 interview questions (both technical and non-technical) based on the following job description: "${jobDescription}". 
The output MUST be a JSON array of exactly 5 strings with no keys or extra formatting. For example: ["Question1", "Question2", "Question3", "Question4", "Question5"]. 
Do not include any labels, keys, or additional text.`;

  const requestBody = {
    model: "llama3.2:latest",
    prompt,
    stream: false,
    format: "json"
  };

  console.log("Sending request to Ollama API with payload:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log("Received response status:", response.status);
    const responseText = await response.text();
    console.log("Raw response text from Ollama API:", responseText);

    if (!responseText) {
      throw new Error("Empty response from API");
    }

    let parsed = robustJSONParse(responseText);
    console.log("Parsed JSON from API response:", parsed);

    // Extract the "response" property.
    let extracted = parsed.response;
    if (typeof extracted === "string") {
      extracted = robustJSONParse(extracted.trim());
    }

    // Use extractQuestions to pull out the questions.
    let questions = extractQuestions(extracted);
    console.log("Extracted questions (possibly nested):", questions);

    // Fully flatten the questions array.
    let flatQuestions = fullyFlatten(questions);
    console.log("After fully flattening:", flatQuestions);

    // Map each element to a string.
    let stringQuestions = fullyFlatten(flatQuestions.map(item => toQuestionString(item)));
    console.log("After mapping to strings and flattening:", stringQuestions);

    // Filter out any junk or invalid entries.
    let validQuestions = stringQuestions.filter(isValidQuestion);
    console.log("After filtering invalid entries:", validQuestions);

    // If validQuestions is nested as a single array, unwrap it.
    if (validQuestions.length === 1 && Array.isArray(validQuestions[0])) {
      validQuestions = validQuestions[0];
    }

    // Enforce exactly 5 questions.
    if (validQuestions.length > 5) {
      validQuestions = validQuestions.slice(0, 5);
    } else if (validQuestions.length < 5) {
      const defaults = [
        "Describe a challenging technical problem you solved.",
        "How do you approach debugging complex code?",
        "What techniques do you use to optimize performance?",
        "Can you explain a project where you led a team?",
        "How do you stay updated with industry trends?"
      ];
      validQuestions = validQuestions.concat(defaults.slice(0, 5 - validQuestions.length));
    }

    console.log("Final interview questions array (exactly 5 strings):", validQuestions);
    return validQuestions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw error;
  }
}

module.exports = { generateInterviewQuestions };
