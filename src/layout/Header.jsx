import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Fetch session info when the component mounts
    useEffect(() => {
        console.log('Fetching session info...');
        fetch('http://localhost:5000/api/auth/session', {
            credentials: 'include', // ensure cookies are sent
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('Session data fetched:', data);
                if (data.success && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            })
            .catch((err) => console.error('Error fetching session info:', err));
    }, []);

    // Log off handler
    const handleLogout = async () => {
        console.log('Initiating logout...');
        try {
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'GET',
                credentials: 'include',
            });
            console.log('Logout response:', response);
            if (response.ok) {
                console.log('Logout successful.');
                setUser(null);
                navigate('/login');
            } else {
                console.log('Logout failed.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    console.log('Rendering Header, current user:', user);

    return (
        <header className="py-4 px-6 bg-gradient-to-r from-gray-900 to-black text-white flex items-center justify-between">
            <div>
                <Link to="/home">
                    <h1 className="text-3xl font-bold cursor-pointer">Stellar Gallery</h1>
                </Link>
            </div>
            <div>
                {user ? (
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-lg font-medium">{user.name}</p>
                            <p className="text-sm text-gray-300">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                            Log Off
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                        Log In
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;
