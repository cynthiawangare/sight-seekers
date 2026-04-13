export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full px-6 py-2 font-medium text-sm transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-primary hover:bg-blue-light text-white',
    secondary: 'bg-brown-primary hover:bg-brown-light text-white',
    outline: 'border border-blue-primary text-blue-primary hover:bg-blue-primary hover:text-white',
    ghost: 'text-blue-primary hover:bg-gray-light',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
