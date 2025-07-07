function Input({ label, type, name, value, onChange, placeholder, autoComplete }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          padding: '0.5rem',
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
    </div>
  );
}

export default Input;
