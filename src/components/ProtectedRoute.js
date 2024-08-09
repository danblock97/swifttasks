import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ProtectedRoute = () => {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
			setLoading(false);
		};

		fetchSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	return session ? <Outlet /> : <Navigate to="/auth" />;
};

export default ProtectedRoute;
