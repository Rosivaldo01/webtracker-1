
import { useState, useEffect } from "react";
import {database} from "../../../firebase";
import { ref, onValue } from "firebase/database";

export default function useRegistros(userId) {
    const [registros, setRegistros] = useState([]);

    useEffect(() => {
        if (!userId) return;

        const registrosRef = ref(database, `registros/${userId}`);
        const unsubscribe = onValue(registrosRef, (snapshot) => {
            const data = snapshot.val();
            const lista = [];
            if (data) {
                for (let id in data) {
                    lista.push({ id, ...data[id] });
                }
                lista.sort((a, b) =>
                    a.nome.toLowerCase().localeCompare(b.nome.toLowerCase())
                );
            }
            setRegistros(lista);
        });

        return () => unsubscribe();
    }, [userId]);

    return registros;
}
