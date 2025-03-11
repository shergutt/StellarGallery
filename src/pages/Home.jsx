import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center">
      <header className="text-center">
        <h1 className="text-6xl font-extrabold mb-4">Welcome to Stellar Gallery</h1>
        <p className="text-lg text-gray-300 mb-8">
          Discover a curated collection of breathtaking images.
        </p>
        <Link
          to="/gallery"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-900 rounded text-gray-50 text-xl"
        >
          Explore Gallery
        </Link>
      </header>

      <section className="mt-10 px-4 text-center">
        <p className="max-w-2xl text-gray-400">
          Dive into a visual journey where every image tells a unique story.
          Whether you're here to relax, get inspired, or simply explore, our collection
          is designed to captivate and inspire.
        </p>
      </section>
    </main>
  );
};

export default Home;
