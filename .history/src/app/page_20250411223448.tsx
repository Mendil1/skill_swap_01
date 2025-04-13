import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  const user = data?.session?.user

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero section */}
      <section className="bg-slate-50 py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Share Your Skills. Learn Something New.
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl">
              SkillSwap connects people who want to teach and learn from each other in a collaborative community.
              Share what you know, discover what others can teach you.
            </p>
            {!user ? (
              <div className="flex gap-4">
                <Link href="/login">
                  <Button size="lg">Join SkillSwap</Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline">Learn More</Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link href="/skills">
                  <Button size="lg">Browse Skills</Button>
                </Link>
                <Link href="/profile">
                  <Button size="lg" variant="outline">My Profile</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">How SkillSwap Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">List Your Skills</h3>
            <p className="text-slate-600">
              Add skills you can teach and ones you want to learn to your profile.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect with Others</h3>
            <p className="text-slate-600">
              Find people who match your teaching and learning interests and connect with them.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Exchange Knowledge</h3>
            <p className="text-slate-600">
              Schedule sessions to teach and learn, building skills and connections.
            </p>
          </div>
        </div>
      </section>
      
      {/* Featured skills section */}
      <section className="container mx-auto px-4 py-12 bg-slate-50">
        <h2 className="text-3xl font-bold text-center mb-12">Popular Skills on SkillSwap</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Programming', 'Languages', 'Music', 'Design', 'Photography', 'Cooking', 'Fitness', 'Art'].map((skill) => (
            <div key={skill} className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
              <p className="font-medium">{skill}</p>
            </div>
          ))}
        </div>
        {!user && (
          <div className="text-center mt-8">
            <Link href="/login">
              <Button>Join to Explore All Skills</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
