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
    name: "Air Vice Marshal A.B. Abubakar",
    rank: "Air Vice Marshal",
    duration: "2001 - 2004",
    bio: "Air Vice Marshal A.B. Abubakar served as the first Commandant of the Defence Intelligence School (DIS), establishing the foundation for intelligence training in Nigeria. His visionary leadership set the standards for excellence that continue to guide the institution today.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop"
  },
  {
    name: "Major General T.Y. Danjuma",
    rank: "Major General",
    duration: "2004 - 2007",
    bio: "Major General T.Y. Danjuma expanded the curriculum and infrastructure of DIS, introducing advanced intelligence methodologies and strengthening partnerships with international intelligence academies.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
  },
  {
    name: "Rear Admiral S.O. Ibrahim",
    rank: "Rear Admiral",
    duration: "2007 - 2010",
    bio: "Rear Admiral S.O. Ibrahim modernized the training programs, incorporating cutting-edge technology and cyber intelligence into the curriculum, positioning DIS as a leader in regional intelligence education.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    name: "Air Commodore M.K. Bello",
    rank: "Air Commodore",
    duration: "2010 - 2013",
    bio: "Air Commodore M.K. Bello focused on inter-agency collaboration and developed specialized programs for counter-terrorism and regional security challenges.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
  },
  {
    name: "Brigadier General F.A. Okonkwo",
    rank: "Brigadier General",
    duration: "2013 - 2016",
    bio: "Brigadier General F.A. Okonkwo led the transformation from Defence Intelligence School to Defence Intelligence College, elevating academic standards and introducing degree-level programs.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop"
  },
  {
    name: "Air Vice Marshal C.N. Eze",
    rank: "Air Vice Marshal",
    duration: "2016 - 2019",
    bio: "Air Vice Marshal C.N. Eze strengthened international partnerships and introduced advanced research programs, establishing DIC as a center of excellence for intelligence studies in West Africa.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop"
  },
  {
    name: "Major General D.O. Mohammed",
    rank: "Major General",
    duration: "2019 - Present",
    bio: "Major General D.O. Mohammed continues to advance the college's mission with a focus on digital intelligence, artificial intelligence applications in security, and fostering innovation in intelligence training methodologies.",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop"
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
