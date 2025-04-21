"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle, Loader2 } from "lucide-react";

interface SkillFormProps {
  userId: string;
  defaultType?: "offer" | "request";
}

// Skill categories to help organize skills better
const SKILL_CATEGORIES = [
  "Technology",
  "Arts & Crafts",
  "Music",
  "Sports",
  "Languages",
  "Academics",
  "Cooking",
  "Business",
  "Health & Fitness",
  "Other",
];

export default function SkillForm({
  userId,
  defaultType = "offer",
}: SkillFormProps) {
  const [skillName, setSkillName] = useState("");
  const [skillType, setSkillType] = useState<"offer" | "request">(defaultType);
  const [category, setCategory] = useState<string>("Other");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skillName.trim()) {
      setError("Please enter a skill name");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    try {
      // First, check if the skill already exists in the skills table
      const { data: existingSkill } = await supabase
        .from("skills")
        .select("skill_id, description")
        .eq("name", skillName.trim())
        .single();

      let skillId;
      const finalDescription = description.trim();

      // If the skill doesn't exist, create it with the description and category
      if (!existingSkill) {
        const { data: newSkill, error: skillError } = await supabase
          .from("skills")
          .insert({
            name: skillName.trim(),
            description: finalDescription || null,
            category: category,
          })
          .select("skill_id")
          .single();

        if (skillError) throw skillError;
        skillId = newSkill.skill_id;
      } else {
        skillId = existingSkill.skill_id;
        // If the skill exists but the user provided a new description and the existing one is empty
        if (finalDescription && !existingSkill.description) {
          await supabase
            .from("skills")
            .update({
              description: finalDescription,
              category: category,
            })
            .eq("skill_id", skillId);
        }
      }

      // Now add the user_skill relation
      const { error: userSkillError } = await supabase
        .from("user_skills")
        .insert({
          user_id: userId,
          skill_id: skillId,
          type: skillType,
        });

      if (userSkillError) throw userSkillError;

      // Reset form
      setSkillName("");
      setDescription("");
      setShowDescription(false);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      // Refresh the page
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Failed to add skill");
      console.error("Error adding skill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddSkill} className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label htmlFor="skillName" className="text-sm font-medium">
            Skill Name
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm">
              Enter the name of the skill you want to add. Be specific but
              concise (e.g., &quot;JavaScript Programming&quot; rather than just
              &quot;Programming&quot;).
            </PopoverContent>
          </Popover>
        </div>
        <Input
          id="skillName"
          placeholder="Enter skill name"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="skillType"
            className="text-sm font-medium block mb-1.5"
          >
            Skill Type
          </label>
          <Select
            value={skillType}
            onValueChange={(value: "offer" | "request") => setSkillType(value)}
            disabled={isLoading}
          >
            <SelectTrigger id="skillType">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="offer">I can teach this</SelectItem>
              <SelectItem value="request">I want to learn this</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="category"
            className="text-sm font-medium block mb-1.5"
          >
            Category
          </label>
          <Select
            value={category}
            onValueChange={setCategory}
            disabled={isLoading}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {SKILL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showDescription ? (
        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium block mb-1.5"
          >
            Description (Optional)
          </label>
          <Textarea
            id="description"
            placeholder="Briefly describe this skill..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
          />
          <p className="text-xs text-slate-500 mt-1">
            A short description helps others understand the skill better.
          </p>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowDescription(true)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0"
        >
          + Add a description
        </Button>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Skill"
        )}
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-sm">
          Skill added successfully!
        </div>
      )}
    </form>
  );
}
