const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sharp = require('sharp');
const pngChunksExtract = require('png-chunks-extract');
const pngChunkText = require('png-chunk-text');

const app = express();
app.use(cors());

const imagesFolder = "/notebooks/ComfyUI/output";
app.use('/images', express.static(imagesFolder));

// Function to extract metadata from an image file.
// For PNG files, it also attempts to extract a custom "prompt" from a tEXt chunk.
const getImageMetadata = async (filePath, fileExtension) => {
  let basicMetadata = {};
  let error = null;
  
  // Use sharp to get basic metadata
  try {
    basicMetadata = await sharp(filePath).metadata();
  } catch (err) {
    error = err.message;
  }

  // If the image is a PNG, try to extract custom prompt metadata
  let promptMetadata = null;
  if (fileExtension.toLowerCase() === '.png') {
    try {
      const data = fs.readFileSync(filePath);
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

  // Merge the prompt metadata into the basic metadata if available
  if (promptMetadata) {
    basicMetadata.prompt = promptMetadata;
  }
  return { metadata: basicMetadata, error };
};

app.get('/api/images', async (req, res) => {
  fs.readdir(imagesFolder, async (err, files) => {
    if (err) {
      console.error('Error reading images folder:', err);
      return res.status(500).json({ error: 'Failed to read images folder' });
    }
    // Filter only image files (adjust the regex if needed)
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    
    // Process each image file to get metadata
    const imageMetadataPromises = imageFiles.map(async (file) => {
      const filePath = path.join(imagesFolder, file);
      const fileExtension = path.extname(file);
      const { metadata, error } = await getImageMetadata(filePath, fileExtension);
      return { file, metadata, error };
    });
    
    // Wait for all metadata extraction to complete
    const imagesWithMetadata = await Promise.all(imageMetadataPromises);
    res.json({ images: imagesWithMetadata });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
