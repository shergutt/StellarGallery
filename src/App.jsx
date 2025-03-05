import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/images')
      .then((response) => response.json())
      .then((data) => {
        setImages(data.images);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="py-10 text-center">
        <h1 className="text-6xl font-extrabold mb-4">Stellar Gallery</h1>
        <p className="text-lg text-gray-300">
          Explore our collection of exquisite images
        </p>
      </header>

      <main className="px-4 md:px-8 lg:px-16 pb-10">
        {/* Masonry grid using CSS columns */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group break-inside-avoid cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={`http://localhost:5000/images/${img.file}`}
                alt={`Thumbnail ${index}`}
                className="w-full rounded-xl shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
               <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-t from-black via-transparent rounded-xl">
                <p className="p-2 text-sm">
                  {img.metadata && img.metadata.file_type ? img.metadata.file_type : 'Image'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal with glassmorphism effect */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="text-3xl text-white hover:text-gray-300 focus:outline-none"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col md:flex-row">
              {/* Full resolution image */}
              <div className="md:w-2/3 p-4">
                <img
                  src={`http://localhost:5000/images/${selectedImage.file}`}
                  alt="Full view"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              {/* Metadata panel */}
              <div className="md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-gray-700 max-h-96 overflow-y-auto text-gray-900">
                <h2 className="text-3xl font-semibold mb-4">Image Metadata</h2>
                {selectedImage.metadata ? (
                  <ul className="space-y-2 text-sm">
                    {Object.entries(selectedImage.metadata).map(([key, value]) => (
                      <li key={key} className="border-b border-gray-700 pb-1">
                        <span className="font-medium">{key}:</span> {value.toString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No metadata available</p>
                )}
                {selectedImage.error && (
                  <p className="text-red-400 mt-4">Error: {selectedImage.error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
