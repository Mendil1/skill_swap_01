import { createClient } from '@/utils/supabase/server';

export default async function Instruments() {
  const supabase = createClient();
  const { data: instruments } = await supabase.from("instruments").select();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Instruments from Supabase</h1>
      <pre>{JSON.stringify(instruments, null, 2)}</pre>
    </div>
  );
}