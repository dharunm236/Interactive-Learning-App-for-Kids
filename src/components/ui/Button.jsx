import React from 'react';

const Button = ({ children, onClick, className, disabled }) => (
  <button onClick={onClick} className={`${className} p-2 rounded`} disabled={disabled}>
    {children}
  </button>
);

export default Button;
