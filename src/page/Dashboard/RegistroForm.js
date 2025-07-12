
import React from "react";

export default function RegistroForm({ inputs, onSubmit }) {
    return (
        <form
            className="register-form"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            {inputs.map(({ label, placeholder, value, setter, max }) => (
                <div key={label} className="form-field">
                    <label htmlFor={label.toLowerCase()}>{label}:</label>
                    <input
                        id={label.toLowerCase()}
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        maxLength={max}
                        required
                        {...(label === "Matrícula" ? { maxLength: undefined } : {})}
                    />
                </div>
            ))}
            <button type="submit" className="register-btn">
                Registrar
            </button>
        </form>
    );
}
