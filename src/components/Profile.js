import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const Profile = () => {
	const [profile, setProfile] = useState({ username: "", avatar_url: "" });

	useEffect(() => {
		const fetchProfile = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", session.user.id)
				.single();

			if (error) console.error("Error fetching profile:", error);
			else setProfile(data);
		};

		fetchProfile();
	}, []);

	const handleUpdate = async () => {
		const { error } = await supabase
			.from("profiles")
			.update(profile)
			.eq("id", profile.id);

		if (error) console.error("Error updating profile:", error);
	};

	return (
		<div className="container mx-auto p-4">
			<h2 className="text-2xl font-bold mb-4">Profile</h2>
			<div>
				<input
					type="text"
					value={profile.username}
					onChange={(e) => setProfile({ ...profile, username: e.target.value })}
					placeholder="Username"
					className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
				<input
					type="text"
					value={profile.avatar_url}
					onChange={(e) =>
						setProfile({ ...profile, avatar_url: e.target.value })
					}
					placeholder="Avatar URL"
					className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
				<button
					onClick={handleUpdate}
					className="px-4 py-2 bg-green-500 text-white rounded"
				>
					Update Profile
				</button>
			</div>
		</div>
	);
};

export default Profile;
