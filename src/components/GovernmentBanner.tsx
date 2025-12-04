import { useState } from "react";
import { ChevronDown, ChevronUp, Building2, Lock } from "lucide-react";

export const GovernmentBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-muted border-b border-border">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>An official website of the Defence Intelligence Agency of the Federal Republic of Nigeria</span>
          <span className="flex items-center gap-1 text-primary font-medium">
            Here's how you know
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>
        
        {isExpanded && (
          <div className="pb-4 grid md:grid-cols-2 gap-6 animate-fade-in">
            <div className="flex gap-3">
              <div className="p-2 bg-primary rounded-full h-fit">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Official websites use .gov.ng</p>
                <p className="text-sm text-muted-foreground">
                  A <strong>.gov.ng</strong> website belongs to an official government organization in Nigeria.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-green-600 rounded-full h-fit">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Secure websites use HTTPS</p>
                <p className="text-sm text-muted-foreground">
                  A <strong>lock</strong> or <strong>https://</strong> means you've safely connected to the website. Share sensitive information only on official, secure websites.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
