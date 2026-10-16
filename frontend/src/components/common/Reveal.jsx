import React from 'react';
import useReveal from '../../hooks/useReveal';

/** Wraps content in a subtle fade-up that plays once when scrolled into view. */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={delay ? { '--d': `${delay}s` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}
