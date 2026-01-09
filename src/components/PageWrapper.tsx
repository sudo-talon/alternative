import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const PageWrapper = ({ children, className = "", noPadding = false }: PageWrapperProps) => {
  return (
    <main 
      className={`
        w-full 
        max-w-[100vw] 
        overflow-x-hidden 
        ${noPadding ? "" : "px-4 sm:px-6 lg:px-8"}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div className="w-full max-w-[1440px] mx-auto">
        {children}
      </div>
    </main>
  );
};
