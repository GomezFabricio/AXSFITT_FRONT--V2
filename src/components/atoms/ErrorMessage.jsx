const ErrorMessage = ({ message }) => {
  return message ? (
    <p className="text-sm text-red-600 bg-red-100 p-2 rounded">
      {message}
    </p>
  ) : null;
};

export default ErrorMessage;