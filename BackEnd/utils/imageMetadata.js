// utils/imageMetadata.js
const fs = require('fs');
const sharp = require('sharp');
const pngChunksExtract = require('png-chunks-extract');
const pngChunkText = require('png-chunk-text');

const getImageMetadata = async (filePath, fileExtension) => {
  let basicMetadata = {};
  let error = null;

  try {
    basicMetadata = await sharp(filePath).metadata();
  } catch (err) {
    error = err.message;
  }

  let promptMetadata = null;
  if (fileExtension.toLowerCase() === '.png') {
    try {
      const data = await fs.promises.readFile(filePath);
      const chunks = pngChunksExtract(data);
      for (const chunk of chunks) {
        if (chunk.name === 'tEXt') {
          const parsed = pngChunkText.decode(chunk.data);
          if (parsed.keyword.toLowerCase() === 'prompt') {
            promptMetadata = parsed.text;
            break;
          }
        }
      }
    } catch (err) {
      console.error(`Error extracting prompt metadata for ${filePath}: ${err.message}`);
    }
  }

  if (promptMetadata) {
    basicMetadata.prompt = promptMetadata;
  }
  return { metadata: basicMetadata, error };
};

module.exports = { getImageMetadata };
