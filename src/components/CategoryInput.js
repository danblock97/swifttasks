import React, { useState } from "react";

const CategoryInput = ({ categories, setCategories }) => {
	const [inputValue, setInputValue] = useState("");

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			e.preventDefault(); // Prevent form submission
			addCategory(inputValue.trim());
		}
	};

	const addCategory = (category) => {
		if (category && !categories.includes(category)) {
			setCategories([...categories, category]);
		}
		setInputValue("");
	};

	const removeCategory = (category) => {
		setCategories(categories.filter((cat) => cat !== category));
	};

	return (
		<div className="category-input">
			<div className="flex flex-wrap mb-2">
				{categories.map((category, index) => (
					<div
						key={index}
						className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-lg mr-2 mb-2 flex items-center"
					>
						{category}
						<button
							type="button"
							className="ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-400 dark:hover:text-gray-500"
							onClick={() => removeCategory(category)}
						>
							&times;
						</button>
					</div>
				))}
			</div>
			<div className="flex items-center">
				<input
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder="Type a category"
					className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
				/>
				<button
					type="button"
					onClick={() => addCategory(inputValue.trim())}
					className="px-3 ml-2 py-2 border border-gray-300 text-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r"
				>
					+
				</button>
			</div>
		</div>
	);
};

export default CategoryInput;
