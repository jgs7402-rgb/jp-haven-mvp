import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Section({ children, className = '', id }: SectionProps) {
  return (
    <section id={id} className={`max-w-6xl mx-auto px-4 py-12 ${className}`}>
      {children}
    </section>
  );
}

