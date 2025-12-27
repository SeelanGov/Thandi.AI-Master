// Match your existing button styles with THANDI branding
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const base = 'inline-flex items-center justify-center font-medium font-body rounded-lg transition-all duration-300';
  const variants = {
    primary: 'bg-thandi-teal text-white hover:bg-thandi-teal-mid hover:scale-105',
    outline: 'border-2 border-thandi-teal text-thandi-teal hover:bg-thandi-teal hover:text-white',
    ghost: 'text-thandi-teal hover:bg-thandi-cream/30',
    gold: 'bg-thandi-gold text-thandi-teal hover:bg-thandi-gold/90 hover:scale-105'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};