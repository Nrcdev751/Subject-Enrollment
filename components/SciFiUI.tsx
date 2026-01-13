import React from 'react';

export const SciContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative bg-sci-base text-gray-200 overflow-hidden border-x border-sci-panel ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sci-neon to-transparent opacity-50" />
    {children}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sci-neon to-transparent opacity-50" />
  </div>
);

export const SciButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}> = ({ onClick, children, variant = 'primary', disabled = false, className = '' }) => {
  const baseStyles = "relative px-6 py-3 font-mono text-sm uppercase tracking-widest transition-all duration-300 clip-path-slant group";
  
  const variants = {
    primary: "bg-sci-neon/10 border border-sci-neon text-sci-neon hover:bg-sci-neon hover:text-black shadow-[0_0_10px_rgba(34,211,238,0.3)]",
    secondary: "bg-gray-800/50 border border-gray-600 text-gray-400 hover:border-sci-cyan hover:text-sci-cyan",
    danger: "bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="absolute top-0 left-0 w-1 h-1 bg-white opacity-50"></span>
      <span className="absolute bottom-0 right-0 w-1 h-1 bg-white opacity-50"></span>
      {children}
    </button>
  );
};

export const SciInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <div className="relative group w-full">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-sci-neon to-sci-cyan rounded opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
    <input
      {...props}
      className="relative w-full bg-black border border-gray-800 text-sci-neon p-3 font-mono focus:outline-none focus:border-sci-neon placeholder-gray-600"
    />
  </div>
);

export const SciCard: React.FC<{ children: React.ReactNode, title?: string }> = ({ children, title }) => (
  <div className="bg-sci-panel/80 border border-gray-800 p-4 rounded-sm backdrop-blur-sm">
    {title && <h3 className="text-sci-neon text-xs font-mono uppercase tracking-widest mb-3 border-b border-gray-800 pb-1">{title}</h3>}
    {children}
  </div>
);
