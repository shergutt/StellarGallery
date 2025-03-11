import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ErrorBoundary from '../layout/ErrorBoundary';

// Hook para manejar la sesión del usuario
const useSession = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/session`, {
          credentials: 'include',
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Error fetching session info:', err);
        }
      }
    };

    fetchSession();
    return () => controller.abort();
  }, []);

  return user;
};

// Hook para manejar la obtención y ordenamiento de imágenes
const useImages = (sortAsc) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/images`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) =>
      sortAsc ? a.file.localeCompare(b.file) : b.file.localeCompare(a.file)
    );
  }, [images, sortAsc]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return { images: sortedImages, fetchImages, isLoading, error };
};

const ImageGrid = React.memo(({ images, onImageClick }) => (
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-4">
    {images.map((img, index) => (
      <div
        key={img.file}
        className="relative group cursor-pointer aspect-square"
        onClick={() => onImageClick(img)}
      >
        <img
          src={`${API_BASE_URL}/images/${img.file}`}
          alt={`Thumbnail ${index}`}
          loading="lazy"
          className="w-full h-full object-cover rounded-xl shadow-xl transition-transform duration-300 group-hover:scale-105 relative z-10"
        />
        <div
          className="absolute inset-0 rounded-xl z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-300
          shadow-[0_0_5px_rgba(255,165,0,1),0_0_10px_rgba(255,140,0,0.9),0_0_15px_rgba(255,100,0,0.8)]"
        ></div>
      </div>
    ))}
  </div>
));

function Gallery() {
  const user = useSession();
  const [sortAsc, setSortAsc] = useState(true);
  const { images, fetchImages, isLoading } = useImages(sortAsc);
  const [selectedImage, setSelectedImage] = useState(null);

  // Estados para comentarios
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Función para consultar los comentarios de la imagen seleccionada
  const fetchComments = useCallback(async () => {
    if (!selectedImage) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/images/${encodeURIComponent(selectedImage.file)}/comments`,
        {
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('Error fetching comments');
      const data = await res.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (selectedImage) {
      fetchComments();
    } else {
      setComments([]);
    }
  }, [selectedImage, fetchComments]);

  const toggleSortOrder = useCallback(() => {
    setSortAsc((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedImage) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/images/${encodeURIComponent(selectedImage.file)}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        console.error('Error al eliminar la imagen:', response);
        return;
      }
      await fetchImages();
      setSelectedImage(null);
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
    }
  }, [selectedImage, fetchImages]);

  const handleCommentSubmit = async (e) => {
    console.log('Iniciando envío de comentario');
    e.preventDefault();
    e.stopPropagation();
    console.log('Comportamiento predeterminado prevenido');
    
    if (!newComment.trim()) {
      console.warn('Intento de comentario vacío bloqueado');
      return;
    }
    
    try {
      console.log('Enviando comentario:', newComment);
      const res = await fetch(
        `${API_BASE_URL}/api/images/${encodeURIComponent(selectedImage.file)}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          redirect: 'error',
          body: JSON.stringify({
            user_email: user.email,
            comment_text: newComment,
          }),
        }
      );
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        const errorData = contentType?.includes('application/json') 
          ? await res.json() 
          : await res.text();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Error al agregar comentario: ' + error.message);
      } finally {
        setNewComment('');
        await fetchComments();
      }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center px-4">
        <header className="text-center mt-20 sm:mt-[300px]">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4">Welcome to Stellar Gallery</h1>
          <p className="text-base sm:text-lg text-gray-300 mb-8">
            To discover a curated collection of breathtaking images please Login.
          </p>
          <Link
            to="/login"
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-900 rounded text-gray-50 text-lg sm:text-xl"
          >
            Log In
          </Link>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="py-6 sm:py-10 text-center px-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-2 sm:mb-4">Stellar Gallery</h1>
        <p className="text-base sm:text-lg text-gray-300">
          Explore our collection of exquisite images
        </p>
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          <button
            className="px-3 sm:px-4 py-2 bg-blue-900 hover:bg-blue-600 rounded text-white cursor-pointer text-sm sm:text-base"
            onClick={toggleSortOrder}
            disabled={isLoading}
          >
            Toggle Sort Order
          </button>
          <button
            className="px-3 sm:px-4 py-2 bg-blue-900 hover:bg-blue-600 rounded text-white cursor-pointer text-sm sm:text-base"
            onClick={fetchImages}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Images'}
          </button>
        </div>
      </header>

      <main className="px-2 sm:px-4 md:px-8 lg:px-16 pb-10">
        <ErrorBoundary>
          <ImageGrid images={images} onImageClick={setSelectedImage} />
        </ErrorBoundary>
      </main>

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300 p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedImage(null);
          }}
        >
          <div
            className="relative bg-gray-900 bg-opacity-90 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-2xl sm:text-3xl text-white hover:text-gray-300 focus:outline-none z-50"
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 p-4 sm:p-8">
                <img
                  src={`${API_BASE_URL}/images/${selectedImage.file}`}
                  alt="Full view"
                  loading="lazy"
                  className="w-full h-[300px] sm:h-[500px] md:h-[600px] lg:h-[800px] object-contain rounded-xl transition-transform duration-300"
                />
              </div>
              <div className="md:w-1/3 p-4 sm:p-6 border-t md:border-t-0 md:border-l border-gray-700 text-gray-200 overflow-y-auto max-h-[80vh]">
                <h2 className="text-xl sm:text-3xl font-semibold mb-4">Image Metadata</h2>
                {selectedImage.metadata ? (
                  <ul className="space-y-2 text-xs sm:text-sm">
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
                <button
                  onClick={handleDelete}
                  className="mt-4 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-400 rounded text-white text-sm sm:text-base"
                >
                  Eliminar Imagen
                </button>
                <div className="mt-6">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">Comentarios</h2>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {comments.length > 0 ? (
                      comments.map((comment, idx) => (
                        <div key={idx} className="border-b border-gray-700 pb-2">
                          <p className="text-sm">
                            <strong>{comment.name ? comment.name : comment.user_email}</strong> ({comment.user_email})
                          </p>
                          <p className="text-xs">{comment.comment_text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">Aún no hay comentarios.</p>
                    )}
                  </div>
                  <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 p-2 rounded bg-gray-800 text-white"
                      placeholder="Add a comment..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Enviar comentario
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
