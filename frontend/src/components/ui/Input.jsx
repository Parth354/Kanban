import React from 'react';

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  );
});

export default Input;