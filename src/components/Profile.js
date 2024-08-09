import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const Profile = () => {
	const [profile, setProfile] = useState({ fullName: "", email: "" });
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session) {
				setProfile({
					fullName: session.user.user_metadata.full_name || "",
					email: session.user.email || "",
				});
			}
		};

		fetchProfile();
	}, []);

	const handleUpdate = async () => {
		setLoading(true);

		// Update full name and email
		const updates = {
			data: {
				full_name: profile.fullName,
			},
			email: profile.email,
		};

		const { error: updateError } = await supabase.auth.updateUser(updates);

		// Update password if provided
		if (password) {
			const { error: passwordError } = await supabase.auth.updateUser({
				password,
			});
			if (passwordError) {
				setLoading(false);
				return console.error("Error updating password:", passwordError);
			}
		}

		if (updateError) {
			console.error("Error updating profile:", updateError);
		} else {
			console.log("Profile updated successfully");
		}

		setLoading(false);
	};

	return (
		<div className="container mx-auto p-4">
			<h2 className="text-2xl font-bold mb-4">Profile</h2>
			<div>
				<input
					type="text"
					value={profile.fullName}
					onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
					placeholder="Full Name"
					className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
				<input
					type="email"
					value={profile.email}
					onChange={(e) => setProfile({ ...profile, email: e.target.value })}
					placeholder="Email"
					className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="New Password (leave blank to keep current)"
					className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
				<button
					onClick={handleUpdate}
					className="px-4 py-2 bg-green-500 text-white rounded"
					disabled={loading}
				>
					{loading ? "Updating..." : "Update Profile"}
				</button>
			</div>
		</div>
	);
};

export default Profile;
