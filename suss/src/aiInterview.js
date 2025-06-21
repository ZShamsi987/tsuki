// src/aiInterview.js
const fetch = require('node-fetch');

/**
 * Attempts to parse a JSON string using multiple fallback strategies.
 * If all attempts fail, returns a fallback default array of 5 questions.
 *
 * @param {string} str - The JSON string to parse.
 * @returns {any} Parsed JSON or fallback default.
 */
function robustJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Initial JSON parse error:", e);
    // Remove newlines and extra spaces.
    let fixed = str.replace(/[\r\n]+/g, ' ').trim();
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("Second attempt JSON parse error:", e2);
      // Try to extract a JSON array substring.
      const arrayMatch = fixed.match(/\[([\s\S]*?)\]/);
      if (arrayMatch) {
        let arrayStr = '[' + arrayMatch[1] + ']';
        try {
          return JSON.parse(arrayStr);
        } catch (e3) {
          console.error("Array substring parse error:", e3);
        }
      }
      // Remove trailing commas before closing brackets/braces.
      let noTrailingComma = fixed.replace(/,(\s*[}\]])/g, '$1');
      try {
        return JSON.parse(noTrailingComma);
      } catch (e4) {
        console.error("Trailing comma parse error:", e4);
      }
      // Fallback default array.
      return [
        "Describe a challenging technical problem you solved.",
        "How do you optimize code for performance?",
        "Explain your approach to software design.",
        "How do you ensure effective communication and collaboration within your team?",
        "Describe a situation where you successfully resolved a conflict in a team environment."
      ];
    }
  }
}

/**
 * Recursively flattens an array.
 *
 * @param {Array} arr - The array to flatten.
 * @returns {Array} The flattened array.
 */
function flattenDeep(arr) {
  return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
}

/**
 * Fully flattens an array until no nested arrays remain.
 *
 * @param {Array} arr - The array to fully flatten.
 * @returns {Array} A completely flattened array.
 */
function fullyFlatten(arr) {
  let flat = flattenDeep(arr);
  while (flat.some(item => Array.isArray(item))) {
    flat = [].concat(...flat);
  }
  return flat;
}

/**
 * Converts an item to a string.
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
 * Rejects empty strings, placeholders like "Question1", or strings that are just punctuation/braces.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} True if valid.
 */
function isValidQuestion(str) {
  const lower = str.toLowerCase();
  if (lower === 'technical' || lower === 'non-technical' || lower === 'null' || lower === '') return false;
  if (/^question\d+$/i.test(str)) return false;
  if (/^[\}\]\{\[\s,:"']+$/i.test(str)) return false;
  if (!isNaN(Number(str)) || str.length < 3) return false;
  return true;
}

/**
 * Uses regex to extract candidate questions from raw text.
 * This regex captures any substring ending with a question mark.
 *
 * @param {string} rawText - The raw text to search.
 * @returns {Array} An array of candidate questions.
 */
function extractQuestionsFromText(rawText) {
  const regex = /([^"\n]+?\?)/g;
  const matches = rawText.match(regex);
  if (matches) return matches.map(s => s.trim());
  return [];
}

/**
 * Given an object, recursively extracts candidate questions from its keys and values.
 *
 * @param {object} obj - The object to extract from.
 * @returns {Array} An array of candidate questions.
 */
function objectToCandidates(obj) {
  let candidates = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (isValidQuestion(key)) candidates.push(key);
      const val = obj[key];
      if (typeof val === 'string' && isValidQuestion(val)) {
        candidates.push(val);
      } else if (Array.isArray(val)) {
        candidates = candidates.concat(val.map(toQuestionString).filter(isValidQuestion));
      } else if (typeof val === 'object' && val !== null) {
        candidates = candidates.concat(objectToCandidates(val));
      }
    }
  }
  return candidates;
}

/**
 * Ensures that the final array contains exactly 5 questions.
 * The first 3 will be technical, and the last 2 will be non-technical.
 * Fills missing slots with fallback defaults.
 *
 * @param {Array} candidates - Array of candidate questions.
 * @returns {Array} Array of exactly 5 questions.
 */
function ensureFiveQuestions(candidates) {
  const defaultTechnical = [
    "Can you describe a time when you had to manage conflicting opinions or resolve a conflict within your team? How did you approach the situation, and what strategies did you use to reach a consensus while maintaining a positive working environment?",
    "Tell me about a situation where you had to make a critical decision without having all the information. How did you gather insights, weigh the risks, and ensure that your decision was both timely and effective?",
    "Describe a scenario in which you had to adapt to significant changes or unexpected challenges in your role."
  ];
  const defaultNonTechnical = [
    "How do you ensure effective communication and collaboration within your team?",
    "Describe a situation where you successfully resolved a conflict in a team environment."
  ];
  let final = [];
  for (let i = 0; i < 3; i++) {
    if (candidates[i] && isValidQuestion(candidates[i])) {
      final.push(candidates[i]);
    } else {
      final.push(defaultTechnical[i]);
    }
  }
  for (let i = 3; i < 5; i++) {
    if (candidates[i] && isValidQuestion(candidates[i])) {
      final.push(candidates[i]);
    } else {
      final.push(defaultNonTechnical[i - 3]);
    }
  }
  return final;
}

/**
 * Generates exactly 5 interview questions based on the provided job description using the local Ollama API.
 *
 * The prompt instructs the model to output a JSON array of exactly 5 strings with no keys.
 * The instructions specify that the array should contain as many technical questions as possible.
 * If fewer than 5 technical questions are provided, fill the remaining slots with in-depth, general non-technical questions.
 *
 * @param {string} jobDescription - The job description.
 * @returns {Promise<string[]>} A promise that resolves with an array of exactly 5 interview questions.
 */
async function generateInterviewQuestions(jobDescription) {
  const prompt = `Generate a JSON array of exactly 5 interview questions based on the following job description: "${jobDescription}".
The output MUST be a JSON array of exactly 5 strings with no keys or extra formatting.
Focus on generating technical questions. If fewer than 5 technical questions are provided, add additional non-technical questions about communication, collaboration, or leadership to reach exactly 5.
For example: ["Technical Q1", "Technical Q2", "Technical Q3", "Non-technical Q1", "Non-technical Q2"].
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
    if (!responseText) throw new Error("Empty response from API");

    let outer = robustJSONParse(responseText);
    let candidates = [];
    // If outer.response exists, extract candidates.
    if (outer && typeof outer === 'object' && outer.response) {
      let inner = typeof outer.response === "string" ? robustJSONParse(outer.response) : outer.response;
      if (inner && typeof inner === 'object') {
        if (Array.isArray(inner)) {
          candidates = fullyFlatten(inner).map(toQuestionString).filter(isValidQuestion);
        } else {
          candidates = objectToCandidates(inner);
        }
      }
    }
    // If candidates are fewer than 5, extract additional candidates from the entire parsed outer.
    if (candidates.length < 5 && outer && typeof outer === 'object') {
      candidates = candidates.concat(objectToCandidates(outer));
    }
    // If still not exactly 5, apply regex extraction on the raw outer.response.
    if (candidates.length !== 5) {
      let fallbackCandidates = extractQuestionsFromText(
        typeof outer.response === "string" ? outer.response : JSON.stringify(outer)
      );
      fallbackCandidates = fallbackCandidates.map(toQuestionString).filter(isValidQuestion);
      candidates = Array.from(new Set(candidates.concat(fallbackCandidates)));
    }
    const finalQuestions = ensureFiveQuestions(candidates);
    console.log("Final interview questions array (exactly 5):", finalQuestions);
    return finalQuestions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw error;
  }
}

module.exports = { generateInterviewQuestions };
