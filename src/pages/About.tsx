import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Target, BookOpen } from "lucide-react";
import dicGroupPhoto from "@/assets/dic-group-photo.webp";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              About Defence Intelligence College
            </h1>
            <p className="text-xl text-primary-foreground/90">
              A citadel of intelligence and security training in Nigeria
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* College Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl rounded-lg overflow-hidden shadow-elevated">
              <img 
                src={dicGroupPhoto} 
                alt="DIC Group Photo" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-primary/40"></div>
            </div>
          </div>

          {/* About Us */}
          <Card className="shadow-elevated">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                About Us
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                The Defence Intelligence College (DIC) hitherto known as the Defence Intelligence School (DIS) was established in 2001. At inception it was located at a temporary site within the Headquarters of the Defence Intelligence Agency (DIA) in Bonny Camp Lagos. However, due to the need for a large space and conducive environment, the school was relocated to its present location in Karu a suburb of Federal Capital Territory Abuja in October 2005. The objective of the relocation was to reposition the school with a focus on capacity building in support of DIA and the Armed Forces of Nigeria (AFN) through the provision of real-time defence intelligence to enhance national security. The nomenclature of the school was subsequently changed to Defence Intelligence College in March 2013 thereby encapsulating the vision of the Agency which is to make the College a citadel of intelligence and security training in Nigeria. The college has trained personnel drawn from DIA, Nigeria Armed Forces, Paramilitary Organisations and Staff of Ministries Department and Agencies. It also pertinent to state that the College has trained allied officers from Niger, Chad, Benin Republic and Ghana.
              </p>
            </CardContent>
          </Card>

          {/* Vision and Mission */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision Statement */}
            <Card className="shadow-elevated">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Target className="h-7 w-7 text-primary" />
                  Vision Statement
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To produce well trained, patriotic and highly motivated manpower working with cutting edge technology under an effective leadership in collaboration with friendly forces that will provide comprehensive and timely defence intelligence in support of national security strategy.
                </p>
              </CardContent>
            </Card>

            {/* Mission Statement */}
            <Card className="shadow-elevated">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-7 w-7 text-primary" />
                  Mission Statement
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide security and intelligence training for all categories of DIA staff, personnel of the Nigerian Armed Forces and other security agencies, in order to enable them perform optimally wherever they may be deployed.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Historical Timeline */}
          <Card className="shadow-elevated">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-8">Our Journey</h2>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/30"></div>
                
                <div className="space-y-12">
                  {[
                    {
                      year: "2001",
                      title: "Establishment",
                      description: "Founded as Defence Intelligence School (DIS) at Bonny Camp Lagos."
                    },
                    {
                      year: "2005",
                      title: "Relocation to Karu",
                      description: "Moved to permanent location in Karu, Abuja for expanded facilities and conducive learning environment."
                    },
                    {
                      year: "2013",
                      title: "Renamed to DIC",
                      description: "Officially renamed to Defence Intelligence College, marking our evolution as a premier intelligence training institution."
                    },
                    {
                      year: "Present",
                      title: "Regional Excellence",
                      description: "Training personnel from Nigeria and allied nations including Niger, Chad, Benin Republic, and Ghana."
                    }
                  ].map((milestone, index, array) => (
                    <div 
                      key={index} 
                      className="relative pl-20 opacity-0 animate-fly-in-left"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="absolute left-0 top-0 text-2xl font-bold text-primary">
                        {milestone.year}
                      </div>
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-3">{milestone.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                      {index < array.length - 1 && (
                        <div className="absolute left-6 bottom-[-24px] w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg z-10"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
