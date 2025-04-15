import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { FallbackImage } from "@/components/ui/fallback-image";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Share Skills, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Grow Together</span>
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                Connect with people who want to exchange knowledge. Teach what you know, learn what you don't.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!user ? (
                  <>
                    <Link href="/login">
                      <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                        Get Started
                      </Button>
                    </Link>
                    <Link href="#how-it-works">
                      <Button variant="outline" size="lg" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto">
                        How It Works
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/skills">
                      <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                        Explore Skills
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="outline" size="lg" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto">
                        Manage My Profile
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-4">
                <p className="text-sm text-slate-500 mb-2">Popular skill categories:</p>
                <div className="flex flex-wrap gap-2">
                  {['Programming', 'Languages', 'Design', 'Music', 'Cooking', 'Photography'].map((category) => (
                    <span key={category} className="px-3 py-1 bg-white text-slate-700 text-sm rounded-full shadow-sm">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg blur-3xl"></div>
              <div className="relative bg-white p-4 rounded-lg shadow-xl">
                <FallbackImage 
                  src="/skill-exchange-illustration.svg" 
                  alt="Skill Exchange Illustration" 
                  width={500} 
                  height={400}
                  className="w-full h-auto"
                  fallbackSrc="/skill_swap_logo_white_background.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How SkillSwap Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our platform makes it easy to connect with others who want to share skills and knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Discover Skills",
                description: "Browse through a variety of skills offered by our community members."
              },
              {
                icon: "🤝",
                title: "Connect & Exchange",
                description: "Reach out to users and arrange skill exchange sessions."
              },
              {
                icon: "🚀",
                title: "Grow Together",
                description: "Learn new skills while teaching others what you know best."
              }
            ].map((step, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skills Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Skills</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Check out some of the most popular skills being shared in our community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Web Development",
                level: "Intermediate",
                user: "Sarah Johnson",
                tags: ["React", "JavaScript", "CSS"]
              },
              {
                title: "Spanish Language",
                level: "Beginner",
                user: "Miguel Rodriguez",
                tags: ["Language", "Conversation", "Grammar"]
              },
              {
                title: "Digital Photography",
                level: "Advanced",
                user: "Alex Chen",
                tags: ["Composition", "Editing", "Lighting"]
              }
            ].map((skill, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{skill.title}</h3>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {skill.level}
                  </span>
                </div>
                <p className="text-slate-500 mb-4">Taught by {skill.user}</p>
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/skills">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Browse All Skills
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hear from people who have used SkillSwap to learn new skills and share their knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "SkillSwap helped me learn guitar while teaching Python programming. It's been a win-win experience!",
                name: "David Kim",
                role: "Software Engineer"
              },
              {
                quote: "I've been trying to learn French for years. Through SkillSwap, I found a native speaker who wanted to learn graphic design, which is my specialty.",
                name: "Emma Watson",
                role: "Graphic Designer"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                <div className="text-indigo-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-slate-700 mb-4 italic">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Sharing Skills?</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Join our community today and start exchanging knowledge with people from around the world.
          </p>
          {!user ? (
            <Link href="/login">
              <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white hover:text-indigo-600 transition-colors">
                Sign Up Now
              </Button>
            </Link>
          ) : (
            <Link href="/profile">
              <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white hover:text-indigo-600 transition-colors">
                Update Your Profile
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
