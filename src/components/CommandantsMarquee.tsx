import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Commandant {
  name: string;
  rank: string;
  duration: string;
  bio: string;
  image?: string;
}

const commandants: Commandant[] = [
  {
    name: "R Adm MG OAMEN",
    rank: "Rear Admiral",
    duration: "Apr 2020 - Feb 2022",
    bio: "R Adm MG OAMEN DSS psc(+) nwc(+) MSc MIAD MNIM served as Commandant of the Defence Intelligence College, leading the institution with distinguished expertise in defence and strategic studies.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop"
  },
  {
    name: "R Adm EA ZIPELE",
    rank: "Rear Admiral",
    duration: "Feb 2022 - July 2022",
    bio: "R Adm EA ZIPELE DSS psc(+) mni FIIPS brought extensive intelligence expertise to the Defence Intelligence College during his tenure as Commandant.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
  },
  {
    name: "R Adm JA NWAGU",
    rank: "Rear Admiral",
    duration: "July 2023 - July 2024",
    bio: "R Adm JA NWAGU DSS psc fdc FOSHA MUSNI MSc served as Commandant, furthering the college's mission in intelligence education and training excellence.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    name: "R Adm P.E EFFAH",
    rank: "Rear Admiral",
    duration: "Present",
    bio: "R Adm P.E EFFAH DSS psc(+) nwc(+) fdc MSc MLC MIAD FIIPS is the current Commandant of the Defence Intelligence College, leading the institution with distinguished credentials and commitment to excellence in intelligence education.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
  }
];

export const CommandantsMarquee = () => {
  const [selectedCommandant, setSelectedCommandant] = useState<Commandant | null>(null);

  return (
    <>
      <div className="overflow-hidden gradient-subtle py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Past and Present Commandants</h2>
        <div className="relative">
          <div className="flex animate-marquee-horizontal gap-6">
            {[...commandants, ...commandants].map((commandant, index) => (
              <Card 
                key={index} 
                className="min-w-[320px] shrink-0 shadow-elevated hover:shadow-xl transition-all hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <img 
                        src={commandant.image} 
                        alt={commandant.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-primary">{commandant.name}</h3>
                        <p className="text-sm text-muted-foreground">{commandant.rank}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-accent">{commandant.duration}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedCommandant(commandant)}
                        >
                          Read More
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedCommandant} onOpenChange={() => setSelectedCommandant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCommandant?.name}</DialogTitle>
            <DialogDescription>
              {selectedCommandant?.rank} • {selectedCommandant?.duration}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-foreground leading-relaxed">{selectedCommandant?.bio}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
