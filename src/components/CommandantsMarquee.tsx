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
}

const commandants: Commandant[] = [
  {
    name: "Air Vice Marshal A.B. Abubakar",
    rank: "Air Vice Marshal",
    duration: "2001 - 2004",
    bio: "Air Vice Marshal A.B. Abubakar served as the first Commandant of the Defence Intelligence School (DIS), establishing the foundation for intelligence training in Nigeria. His visionary leadership set the standards for excellence that continue to guide the institution today."
  },
  {
    name: "Major General T.Y. Danjuma",
    rank: "Major General",
    duration: "2004 - 2007",
    bio: "Major General T.Y. Danjuma expanded the curriculum and infrastructure of DIS, introducing advanced intelligence methodologies and strengthening partnerships with international intelligence academies."
  },
  {
    name: "Rear Admiral S.O. Ibrahim",
    rank: "Rear Admiral",
    duration: "2007 - 2010",
    bio: "Rear Admiral S.O. Ibrahim modernized the training programs, incorporating cutting-edge technology and cyber intelligence into the curriculum, positioning DIS as a leader in regional intelligence education."
  },
  {
    name: "Air Commodore M.K. Bello",
    rank: "Air Commodore",
    duration: "2010 - 2013",
    bio: "Air Commodore M.K. Bello focused on inter-agency collaboration and developed specialized programs for counter-terrorism and regional security challenges."
  },
  {
    name: "Brigadier General F.A. Okonkwo",
    rank: "Brigadier General",
    duration: "2013 - 2016",
    bio: "Brigadier General F.A. Okonkwo led the transformation from Defence Intelligence School to Defence Intelligence College, elevating academic standards and introducing degree-level programs."
  },
  {
    name: "Air Vice Marshal C.N. Eze",
    rank: "Air Vice Marshal",
    duration: "2016 - 2019",
    bio: "Air Vice Marshal C.N. Eze strengthened international partnerships and introduced advanced research programs, establishing DIC as a center of excellence for intelligence studies in West Africa."
  },
  {
    name: "Major General D.O. Mohammed",
    rank: "Major General",
    duration: "2019 - Present",
    bio: "Major General D.O. Mohammed continues to advance the college's mission with a focus on digital intelligence, artificial intelligence applications in security, and fostering innovation in intelligence training methodologies."
  }
];

export const CommandantsMarquee = () => {
  const [selectedCommandant, setSelectedCommandant] = useState<Commandant | null>(null);

  return (
    <>
      <div className="overflow-hidden bg-gradient-subtle py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Past and Present Commandants</h2>
        <div className="relative">
          <div className="flex animate-marquee-vertical gap-4 flex-col">
            {[...commandants, ...commandants].map((commandant, index) => (
              <Card 
                key={index} 
                className="min-w-[300px] mx-4 shadow-elevated hover:shadow-xl transition-all hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
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
