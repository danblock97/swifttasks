import React, { createContext, useContext, useState, useEffect } from "react";

// Create the DarkMode context
const DarkModeContext = createContext();

// Custom hook to use the DarkMode context
export const useDarkMode = () => useContext(DarkModeContext);

// DarkModeProvider component that wraps your app and manages dark mode state
export const DarkModeProvider = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		// On mount, check local storage for the user's preferred theme
		const darkMode = localStorage.getItem("darkMode") === "true";
		setIsDarkMode(darkMode);
		// Apply or remove the "dark" class on the <html> element
		document.documentElement.classList.toggle("dark", darkMode);
	}, []);

	const toggleDarkMode = () => {
		setIsDarkMode((prevMode) => {
			const newMode = !prevMode;
			// Store the user's preference in local storage
			localStorage.setItem("darkMode", newMode);
			// Apply or remove the "dark" class on the <html> element
			document.documentElement.classList.toggle("dark", newMode);
			return newMode;
		});
	};

	return (
		<DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
			{children}
		</DarkModeContext.Provider>
	);
};
