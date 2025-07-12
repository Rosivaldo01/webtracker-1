
import { useState, useEffect } from "react";
import { auth } from "../../../firebase";


export default function useAuth(navigate) {
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid);
                setUserName(user.displayName || user.email || "Usuário");
            } else {
                setUserId(null);
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    return { userId, userName };
}
