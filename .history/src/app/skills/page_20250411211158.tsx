import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/supabase';

export default async function SkillsPage() {
  const supabase = createClient();
  
  // The client is already typed with Database in server.ts
  const { data: skills, error } = await supabase
    .from('skills')
    .select('skill_id, name, description');

  if (error) {
    console.error('Error fetching skills:', error);
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Skills</h1>
        <p className="text-red-500">Error loading skills: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Skills</h1>
      {skills && skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.skill_id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{skill.name}</h2>
              {skill.description && (
                <p className="text-gray-600">{skill.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No skills found. Please add some skills to your database.</p>
      )}
    </div>
  );
}