import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

 
  
function Login() {
  // Callback that handles the Google response
  const navigate = useNavigate();
const handleCredentialResponse = React.useCallback((response) => {
    console.log("Encoded JWT ID token:", response.credential);
    fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ token: response.credential })
    })
      .then((res) => res.json())
      .then((data) => {
        // Handle success: store user data, redirect, etc.
        console.log("Login successful:", data);
        navigate('/gallery');
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error during authentication:", error);
      });
  }, [navigate]);

  useEffect(() => {
    /* global google */
    // Initialize the Google Identity Services library
    google.accounts.id.initialize({
      client_id: '275691990703-t1aahrbh9hf006vld62htcvfq8bps0da.apps.googleusercontent.com', // Replace with your actual client ID
      callback: handleCredentialResponse,
    });
    // Render the Google Sign-In button inside the div with id "googleSignInButton"
    google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      { theme: "outline", size: "large" } // Customize button style as needed
    );
  }, [handleCredentialResponse]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center">
      <header className="text-center mb-8">
        <h1 className="text-6xl font-extrabold">Login to Stellar Gallery</h1>
        <p className="text-lg text-gray-300 mt-4">Access your personal collection by signing in with Google.</p>
      </header>
      {/* Google Sign-In Button */}
      <div id="googleSignInButton" />
    </div>
  );
}

export default Login;
