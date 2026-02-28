function InputField({ label, type = "text", value, onChange, name, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-200">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-md border border-zinc-700 bg-zinc-800/85 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/30"
      />
    </label>
  );
}

export default InputField;
