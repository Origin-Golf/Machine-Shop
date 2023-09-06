// This is an interactive component, so it's a client component.
'use client'

// Basic React hooks.
import { useState, useEffect } from 'react';

/**
 * PASSWORD FORM DEFAULT EXPORT
 * 
 * @returns The export for the form.
 */
export default function PasswordForm( {setUser} ) {

    // Hooks for the password and whether it's unlocked.
    const [password, setPassword] = useState('');
    const [unlocked, setUnlocked] = useState(false);

    // Updates the user if the password matches any of the following.
    useEffect(() => {

        // Kevin
        if (password == "4432") {
            setUser(1);
            setUnlocked(true);
        }

        // Chase
        if (password == "april") {
            setUser(2);
            setUnlocked(true);
        }

        // Ernie
        if (password == "1973") {
            setUser(3);
            setUnlocked(true);
        }

        // Rocky
        if (password == "ykcor") {
            setUser(4);
            setUnlocked(true);
        }

    }, [password])

        // JSX (RETURN VALUE) - only displays if locked.

    return (unlocked ||

        <div className="fixed top-0 left-0 z-20 w-full h-full">

            {/* BACKGROUND */}
            <div className="fixed top-0 left-0 w-full h-full bg-blue-300" />

            {/* RIGHT MENU */}
            <div className="absolute flex space-x-1 top-2 right-2 sm:top-4 sm:right-4">

                {/* HOME BUTTON */}
                <div className="w-8 cursor-pointer sm:w-12" title="Return to Home">
                    <a href="./">
                        <img src="/icons/google/home.svg" />
                    </a>
                </div>

            </div>

            {/* PASSWORD BOX */}
            <div className="relative w-4/6 max-w-lg mx-auto mt-32 text-center bg-gray-300 rounded-lg shadow-xl h-80">

                {/* PROMPT */}
                <h1 className="relative pt-24 mb-4 text-2xl font-bold sm:text-3xl">Enter Password</h1>

                {/* INPUT */}
                <form onSubmit={e => { e.preventDefault(); }} >
                    <input autoFocus type="password" className="w-40 text-3xl text-center" autoComplete="off" onChange={e => setPassword(e.target.value)} />
                </form>

            </div>

        </div>

    );

}
