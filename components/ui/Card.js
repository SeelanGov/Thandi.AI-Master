// Simple Card component matching your Tailwind setup
export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => <div className="px-6 py-4 border-b border-gray-200">{children}</div>;
export const CardContent = ({ children }) => <div className="p-6">{children}</div>;
export const CardTitle = ({ children }) => <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;