const Input = ({ id, type = "text", label, register, error }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        {...register(id)}
      />
      {error && <span className="text-sm text-red-600 mt-1">{error.message}</span>}
    </div>
  );
};

export default Input;