"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserSkills(userId: string) {
  const supabase = await createClient();

  const { data: userSkills, error } = await supabase
    .from("user_skills")
    .select(
      `
      user_skill_id,
      type,
      skills (
        skill_id,
        name,
        description,
        category
      )
    `
    )
    .eq("user_id", userId)
    .eq("type", "offer") // Only get skills the user can teach
    .order("skills(name)");

  if (error) {
    console.error("Error fetching user skills:", error);
    return [];
  }
  return userSkills.map((userSkill) => ({
    skill_id: (userSkill.skills as any)?.skill_id || "",
    name: (userSkill.skills as any)?.name || "",
    description: (userSkill.skills as any)?.description || null,
    category: (userSkill.skills as any)?.category || null,
  }));
}

export async function getConnectionSkills(organizerId: string, participantId: string) {
  const supabase = await createClient();

  // Get skills that the organizer can teach
  const { data: organizerSkills } = await supabase
    .from("user_skills")
    .select(
      `
      skills (
        skill_id,
        name,
        description,
        category
      )
    `
    )
    .eq("user_id", organizerId)
    .or("type.eq.offer,type.eq.both");

  // Get skills that the participant can teach
  const { data: participantSkills } = await supabase
    .from("user_skills")
    .select(
      `
      skills (
        skill_id,
        name,
        description,
        category
      )
    `
    )
    .eq("user_id", participantId)
    .or("type.eq.offer,type.eq.both");

  return {
    organizerSkills: organizerSkills?.map((item) => item.skills).filter(Boolean) || [],
    participantSkills: participantSkills?.map((item) => item.skills).filter(Boolean) || [],
  };
}
