// Node.js script to generate clothing images using an AI API
// Based on the rules defined in ai-image-generation.mdc

const fs = require('fs');
const path = require('path');
// Use dynamic import for node-fetch
let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
}).catch(err => {
    console.error('Failed to load node-fetch:', err);
    process.exit(1);
});

// --- Configuration ---
// !! IMPORTANT: Adjust these paths relative to the script's location (outfit-web/scripts/) !!
const clothesDataPath = path.resolve(__dirname, '../app/data/clothes.js');
// !! IMPORTANT: Ensure this output directory exists or is created by the script !!
const outputDir = path.resolve(__dirname, '../public/images/clothes/items');
const imageExtension = '.webp'; // Preferred extension: .webp or .png

// --- Load Data ---
let clothesData = [];
try {
    // Using require might be simpler if the file exports directly
    // Adjust if clothes.js uses ES Modules (import/export)
    const dataModule = require(clothesDataPath);
    clothesData = dataModule.clothesData || []; // Access the exported array
    if (!Array.isArray(clothesData) || clothesData.length === 0) {
        console.error('Error: Could not load or find clothesData array in', clothesDataPath);
        process.exit(1);
    }
    console.log(`Successfully loaded ${clothesData.length} items from ${clothesDataPath}`);
} catch (error) {
    console.error('Error loading clothes data:', error);
    process.exit(1);
}

// --- Helper Functions ---

/**
 * Generates the prompt for the AI image generation API.
 * @param {object} item - The clothing item object from clothesData.
 * @returns {{prompt: string, negativePrompt: string}} - The generated prompts.
 */
function generatePrompts(item) {
    // TODO: Handle nameKey and styleKey properly.
    // This might involve loading translation files or having a mapping.
    // For now, we'll use the keys directly or fallback values.
    const itemName = item.nameKey || 'clothing item'; // Placeholder if nameKey needs processing
    const itemStyle = item.styleKey || 'standard style'; // Placeholder if styleKey needs processing
    const itemColor = item.colorName || 'default color';

    // Based on the template in ai-image-generation.mdc
    const prompt = `Front view, plain white or light gray background, photorealistic, one single piece of ${itemColor} ${itemName} (${itemStyle}), no model, clean shot of the clothing item only, no shadows, no wrinkles, no other objects.`;

    const negativePrompt = "model, person, hands, feet, extra objects, blurry, low quality, illustration, cartoon, deformed, text, words, labels, logos";

    // Consider generating an English prompt if your API requires it
    // const promptEn = `Front view, plain white or light gray background, photorealistic, one single piece of ${itemColor} ${itemName} (${itemStyle}), no model, clean shot of the clothing item only, no shadows, no wrinkles, no other objects.`;

    return { prompt, negativePrompt };
}

// --- Configuration ---
// Use the correct endpoint based on the provided image
const API_ENDPOINT = 'https://api.aigptapi.com/v1/chat/completions';
const MODEL_NAME = 'gemini-2.0-flash-exp-image-generation'; // Your model name

// --- Security Warning ---
// Avoid hardcoding API keys. Use environment variables.
const API_KEY = process.env.AIGPT_API_KEY;
if (!API_KEY) {
    console.error('Error: AIGPT_API_KEY environment variable not set.');
    console.error('Please set the environment variable before running the script.');
    console.error('Example (Bash/Zsh): export AIGPT_API_KEY="your_api_key_here"');
    console.error('Example (PowerShell): $env:AIGPT_API_KEY="your_api_key_here"');
    process.exit(1);
}

/**
 * Placeholder function to call the AI image generation API.
 * Replace this with your actual API call logic.
 * @param {string} prompt - The positive prompt.
 * @param {string} negativePrompt - The negative prompt.
 * @returns {Promise<Buffer|string>} - Promise resolving with image data (Buffer or Base64) or URL.
 */
async function callImageGenerationAPI(prompt, negativePrompt) {
    console.log(`--- Calling API: ${API_ENDPOINT} with model ${MODEL_NAME} ---`);
    // console.log("Prompt:", prompt);
    // console.log("Negative Prompt:", negativePrompt);

    // --- Prepare Request Body (OpenAI Chat Completions Format) ---
    // Based on the image stating compatibility with OpenAI API docs
    const requestBody = {
        model: MODEL_NAME,
        // OpenAI uses a 'messages' array for prompts
        messages: [
            {
                role: 'user',
                content: prompt // Standard field for user prompt in OpenAI format
            }
            // Note: OpenAI Chat Completions API doesn't have a standard top-level
            // 'negative_prompt'. Some implementations might support it as a custom
            // parameter, or you might need to incorporate it into the main prompt.
            // Check the aigptapi.com documentation for how to handle negative prompts.
        ],
        // Add other standard OpenAI parameters if needed and supported by the relay
        // n: 1, // Number of choices to generate (usually 1 for images)
        // size: "1024x1024", // Check if this API supports size for image generation
        // response_format: { type: "b64_json" }, // Check if this API supports this
        // max_tokens: ... // Usually not needed for image generation via chat endpoint
        // temperature: ...
        // top_p: ...
    };

    console.log("Request Body (Attempting OpenAI Chat Completions structure):", JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorBody = 'Could not read error body';
            try {
                errorBody = await response.text();
            } catch (e) { /* Ignore error reading body */ }
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}\nResponse Body: ${errorBody}`);
        }

        const result = await response.json();

        // --- Process Response (Assuming OpenAI-like structure) ---
        console.log("Received API Response:", JSON.stringify(result, null, 2));

        let imageData = null;
        // OpenAI image generation via DALL-E API often returns data in result.data
        if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
            if (result.data[0].b64_json) {
                console.log("--- API Call Successful - Found b64_json in result.data ---");
                imageData = Buffer.from(result.data[0].b64_json, 'base64');
            } else if (result.data[0].url) {
                console.log("--- API Call Successful - Found URL in result.data ---");
                imageData = result.data[0].url;
            }
        // Check if image data is potentially in choices[0].message.content for Chat Completions endpoint
        } else if (result && result.choices && Array.isArray(result.choices) && result.choices.length > 0) {
             const messageContent = result.choices[0].message?.content;
             if (typeof messageContent === 'string') {
                 // Attempt to detect if content is a URL or base64 data
                 if (messageContent.startsWith('http')) {
                     console.log("--- API Call Successful - Found URL in choices[0].message.content ---");
                     imageData = messageContent;
                 } else {
                     // Assume it might be base64, try decoding. This is less common.
                     try {
                         const buffer = Buffer.from(messageContent, 'base64');
                         // Basic check if it looks like valid image data (very rough)
                         if (buffer.length > 100) { // Arbitrary small size check
                             console.log("--- API Call Successful - Found potential Base64 in choices[0].message.content ---");
                             imageData = buffer;
                         } else {
                             console.warn("Content in choices[0].message.content doesn\'t look like a URL or valid Base64 image data.");
                         }
                     } catch (e) {
                         console.warn("Failed to decode content in choices[0].message.content as Base64.");
                     }
                 }
             }
        }

        if (!imageData) {
            console.warn("API response format not recognized or missing image data based on common OpenAI patterns.");
        }
        return imageData;

    } catch (error) {
        console.error("Error calling AI API:", error);
        throw error; // Re-throw the error to be caught by the main loop
    }
}

/**
 * Saves the generated image data to the specified file path.
 * Handles both Buffer and URL data types.
 * @param {string} filePath - The full path where the image should be saved.
 * @param {Buffer|string} imageData - The image data (Buffer or URL).
 */
async function saveImage(filePath, imageData) {
    try {
        if (Buffer.isBuffer(imageData)) {
            // Direct save if data is a Buffer
            console.log(`--- Saving image buffer to ${filePath} ---`);
            fs.writeFileSync(filePath, imageData);
            console.log(`Successfully saved image: ${filePath}`);
        } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
            // Download and save if data is a URL
            console.log(`--- Downloading image from URL: ${imageData} ---`);
            const response = await fetch(imageData);
            if (!response.ok) {
                throw new Error(`Failed to download image from URL: ${response.status} ${response.statusText}`);
            }
            // Use ArrayBuffer and convert to Buffer for broader Node.js version compatibility
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            console.log(`--- Saving downloaded image to ${filePath} ---`);
            fs.writeFileSync(filePath, buffer);
            console.log(`Successfully saved image: ${filePath}`);
        } else {
            console.warn(`Invalid imageData type received by saveImage: ${typeof imageData}. Cannot save.`);
        }
    } catch (error) {
        console.error(`Error saving image ${filePath}:`, error);
    }
}

// --- Main Processing Logic ---
async function generateImages() {
    // Ensure fetch is loaded before proceeding
    if (!fetch) {
        console.error("fetch is not available. Waiting a bit and retrying...");
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait briefly
        if (!fetch) {
             console.error("fetch still not loaded. Exiting.");
             process.exit(1);
        }
    }

    console.log("Starting image generation process...");

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        console.log(`Output directory ${outputDir} does not exist. Creating...`);
        try {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`Successfully created ${outputDir}`);
        } catch (error) {
            console.error(`Error creating output directory ${outputDir}:`, error);
            process.exit(1);
        }
    }

    let generatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Use a simple loop for clarity in the framework.
    // Consider using Promise.allSettled for concurrency later if needed.
    for (const item of clothesData) {
        if (!item.id) {
            console.warn("Skipping item due to missing ID:", item);
            continue;
        }

        const imageFileName = `${item.id}${imageExtension}`;
        const outputFilePath = path.join(outputDir, imageFileName);

        // 1. Check if image already exists (Core tracking mechanism)
        if (fs.existsSync(outputFilePath)) {
            // console.log(`Skipping ${item.id}: Image already exists at ${outputFilePath}`);
            skippedCount++;
            continue;
        }

        console.log(`
Processing item: ${item.id}`);

        try {
            // 2. Generate Prompt
            const { prompt, negativePrompt } = generatePrompts(item);
            // console.log("Generated Prompt:", prompt);

            // 3. Call AI API (Placeholder)
            const imageData = await callImageGenerationAPI(prompt, negativePrompt);

            // 4. Save Image (Placeholder)
            if (imageData) { // Check if API call returned something
                 await saveImage(outputFilePath, imageData);
                 generatedCount++;
            } else {
                 console.warn(`API call for ${item.id} did not return image data. Skipping save.`);
                 errorCount++;
            }

        } catch (error) {
            console.error(`Error processing item ${item.id}:`, error);
            errorCount++;
            // Optional: Implement retry logic here
        }
    }

    console.log("--- Image Generation Summary ---");
    console.log(`Total items processed: ${clothesData.length}`);
    console.log(`Images generated: ${generatedCount}`);
    console.log(`Images skipped (already exist): ${skippedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log("--------------------------------");
}

// --- Run the script ---
// Wrap the call in a function to ensure fetch is loaded
async function run() {
    // Wait for fetch to be imported
    while (!fetch) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    await generateImages();
}

run().catch(err => {
    console.error("Script execution failed:", err);
    process.exit(1);
});