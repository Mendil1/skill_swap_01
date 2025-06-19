"use server";

import { createClient } from "@/utils/supabase/server";

export async function debugSkillsData(userId: string) {
  const supabase = await createClient();

  console.log("=== DEBUGGING SKILLS DATA ===");
  console.log("User ID:", userId);

  // 1. Check if user_skills table has any data for this user
  const { data: userSkillsRaw, error: rawError } = await supabase
    .from("user_skills")
    .select("*")
    .eq("user_id", userId);

  console.log("Raw user_skills data:", userSkillsRaw);
  console.log("Raw query error:", rawError);

  // 2. Check if skills table has any data
  const { data: allSkills, error: skillsError } = await supabase
    .from("skills")
    .select("*")
    .limit(5);

  console.log("Sample skills data:", allSkills);
  console.log("Skills query error:", skillsError);

  // 3. Try the foreign key relationship query
  const { data: joinedData, error: joinError } = await supabase
    .from("user_skills")
    .select(`
      user_skill_id,
      type,
      skill_id,
      skills (
        skill_id,
        name,
        description,
        category
      )
    `)
    .eq("user_id", userId);

  console.log("Joined data:", joinedData);
  console.log("Join error:", joinError);

  // 4. Try with explicit foreign key reference
  const { data: explicitJoin, error: explicitError } = await supabase
    .from("user_skills")
    .select(`
      user_skill_id,
      type,
      skill_id,
      skills!user_skills_skill_id_fkey (
        skill_id,
        name,
        description,
        category
      )
    `)
    .eq("user_id", userId);

  console.log("Explicit join data:", explicitJoin);
  console.log("Explicit join error:", explicitError);

  // 5. Count total records
  const { count: userSkillsCount } = await supabase
    .from("user_skills")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: totalSkillsCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true });

  console.log("User skills count:", userSkillsCount);
  console.log("Total skills count:", totalSkillsCount);

  return {
    userSkillsRaw,
    allSkills,
    joinedData,
    explicitJoin,
    userSkillsCount,
    totalSkillsCount,
    errors: {
      rawError,
      skillsError,
      joinError,
      explicitError
    }
  };
}
