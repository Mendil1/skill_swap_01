import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();

  // Always await cookie-dependent operations
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero section with improved visual design */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <span className="px-4 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
              Skill Exchange Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Share Your Skills. Learn Something New.
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl">
              SkillSwap connects people who want to teach and learn from each
              other in a collaborative community. Share what you know, discover
              what others can teach you.
            </p>
            {!user ? (
              <div className="flex gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">Join SkillSwap</Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    Learn More
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link href="/skills">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">Browse Skills</Button>
                </Link>
                <Link href="/profile">
                  <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    My Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works section with improved visual elements */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
            Simple Process
          </span>
          <h2 className="text-3xl font-bold mt-4 mb-2">
            How SkillSwap Works
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Our platform makes it easy to connect with others and exchange knowledge.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center group p-6 rounded-xl hover:bg-slate-50 transition-all">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <span className="text-xl font-bold text-indigo-700">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">List Your Skills</h3>
            <p className="text-slate-600">
              Add skills you can teach and ones you want to learn to your
              profile.
            </p>
          </div>
          <div className="flex flex-col items-center text-center group p-6 rounded-xl hover:bg-slate-50 transition-all">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <span className="text-xl font-bold text-purple-700">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect with Others</h3>
            <p className="text-slate-600">
              Find people who match your teaching and learning interests and
              connect with them.
            </p>
          </div>
          <div className="flex flex-col items-center text-center group p-6 rounded-xl hover:bg-slate-50 transition-all">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <span className="text-xl font-bold text-blue-700">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Exchange Knowledge</h3>
            <p className="text-slate-600">
              Schedule sessions to teach and learn, building skills and
              connections.
            </p>
          </div>
        </div>
      </section>

      {/* Featured skills section with card improvements */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
            Discover
          </span>
          <h2 className="text-3xl font-bold mt-4 mb-2">
            Popular Skills on SkillSwap
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Browse some of our most popular skill categories</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Programming", icon: "💻" },
            { name: "Languages", icon: "🌎" },
            { name: "Music", icon: "🎵" },
            { name: "Design", icon: "🎨" },
            { name: "Photography", icon: "📷" },
            { name: "Cooking", icon: "🍳" },
            { name: "Fitness", icon: "💪" },
            { name: "Art", icon: "🖌️" },
          ].map((skill) => (
            <div
              key={skill.name}
              className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <div className="text-3xl mb-2">{skill.icon}</div>
              <p className="font-medium text-gray-800">{skill.name}</p>
            </div>
          ))}
        </div>
        {!user && (
          <div className="text-center mt-10">
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Join to Explore All Skills</Button>
            </Link>
          </div>
        )}
      </section>
      
      {/* Testimonials section - new addition */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
            Community Voices
          </span>
          <h2 className="text-3xl font-bold mt-4 mb-2">
            What Our Users Say
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Hear from people who have connected through our platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                JD
              </div>
              <div className="ml-4">
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-slate-500">Learned Spanish</p>
              </div>
            </div>
            <p className="text-slate-600">"I've always wanted to learn Spanish but couldn't find the right teacher. On SkillSwap, I connected with a native speaker who was looking to improve their coding skills - something I could help with!"</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                MS
              </div>
              <div className="ml-4">
                <p className="font-semibold">Maria Smith</p>
                <p className="text-sm text-slate-500">Teaches Photography</p>
              </div>
            </div>
            <p className="text-slate-600">"Teaching photography has always been my passion. Through SkillSwap, I've been able to share my knowledge while learning graphic design from others. It's a win-win exchange!"</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                AR
              </div>
              <div className="ml-4">
                <p className="font-semibold">Alex Rivera</p>
                <p className="text-sm text-slate-500">Cooking Enthusiast</p>
              </div>
            </div>
            <p className="text-slate-600">"I've taught three people how to make authentic Mexican dishes, and in return, I've learned yoga and basic web development. The community here is amazing and supportive!"</p>
          </div>
        </div>
      </section>
    </div>
  );
}
