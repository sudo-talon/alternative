import { ReactNode } from "react";

export const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 overflow-x-hidden">
      {children}
    </main>
  );
};
