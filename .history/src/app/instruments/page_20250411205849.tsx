import { createClient } from '@/utils/supabase/server';

export default async function Instruments() {
  const supabase = createClient();
  // Changed from "instruments" to "skills" since "instruments" doesn't exist in your schema
  const { data: skills, error } = await supabase.from("skills").select();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Skills from Supabase</h1>
      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <pre>{JSON.stringify(skills, null, 2)}</pre>
      )}
    </div>
  );
}