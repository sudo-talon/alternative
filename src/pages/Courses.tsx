import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import departmentsHero from "@/assets/departments-hero.webp";

const Courses = () => {
  const navigate = useNavigate();
  
  const courseCategories = [
    {
      category: "Generic Courses",
      courses: [
        { title: "Basic Intelligence Officers' Course", description: "Foundation training for intelligence officers" },
        { title: "Defence Intelligence Officers' Course", description: "Comprehensive defence intelligence training" },
        { title: "Advanced Defence Intelligence Officers' Course", description: "Advanced training for senior officers" },
        { title: "Junior Defence Intelligence Basic Course", description: "Entry-level training for junior personnel" },
        { title: "Junior Defence Intelligence Intermediate Course", description: "Intermediate skills development" },
        { title: "Junior Defence Intelligence Advanced Course", description: "Advanced training for junior officers" },
      ]
    },
    {
      category: "Specialized Courses",
      courses: [
        { title: "Psychological Operations Course", description: "Strategic psychological operations training" },
        { title: "Intelligence Analysis Officers' Course", description: "Advanced intelligence analysis techniques" },
        { title: "Security Investigation and Interrogation Course", description: "Professional interrogation methods" },
        { title: "Document Security Course", description: "Document classification and protection" },
        { title: "Joint Military Attache / Advisers Course", description: "Diplomatic and advisory training" },
        { title: "Special Intelligence and Security Course", description: "Specialized intelligence operations" },
      ]
    },
    {
      category: "Language Courses",
      courses: [
        { title: "Basic French Course", description: "Foundation French language training" },
        { title: "Intermediate French Language Course", description: "Intermediate French proficiency" },
        { title: "Basic German Language Course", description: "Foundation German language training" },
      ]
    },
    {
      category: "Strategic Courses",
      courses: [
        { title: "The National Security Training Seminar", description: "National security strategy and policy" },
        { title: "Intelligence Analysis Course", description: "Strategic intelligence assessment" },
        { title: "Peace and Conflict Studies", description: "Peace operations and conflict resolution" },
        { title: "Strategic Security Course", description: "Strategic security planning and management" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src={departmentsHero} 
          alt="Departments hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="h-12 w-12 text-primary-foreground" />
                <h1 className="text-5xl font-bold text-primary-foreground">Our Courses</h1>
              </div>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Pioneering Excellence in Intelligence and Strategic Leadership since 2001
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">{courseCategories.map((category, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-primary">{category.category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.courses.map((course, courseIdx) => (
                <Card 
                  key={courseIdx} 
                  className="shadow-elevated hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => navigate(`/course/${encodeURIComponent(course.title)}`)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-primary rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                    <CardDescription>
                      {category.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {course.description}
                    </p>
                    <Button className="w-full">View Details & Enroll</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

      </div>
      <Footer />
    </div>
  );
};

export default Courses;
