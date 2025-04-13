"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Trash2, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface SkillItemProps {
  userSkillId: string;
  name: string;
  description?: string | null;
  type: "offer" | "request" | "both";
}

export default function SkillItem({
  userSkillId,
  name,
  description,
  type,
}: SkillItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      confirm(`Are you sure you want to remove "${name}" from your profile?`)
    ) {
      setIsDeleting(true);

      const supabase = createClient();

      try {
        const { error } = await supabase
          .from("user_skills")
          .delete()
          .eq("user_skill_id", userSkillId);

        if (error) throw error;

        // Refresh the page to update the skills list
        router.refresh();
      } catch (error) {
        console.error("Error deleting skill:", error);
        alert("Failed to delete skill. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Choose background color based on skill type
  const getBgColor = () => {
    switch (type) {
      case "offer":
        return "bg-blue-50 border-blue-100";
      case "request":
        return "bg-green-50 border-green-100";
      case "both":
        return "bg-purple-50 border-purple-100";
      default:
        return "bg-slate-50";
    }
  };

  return (
    <li
      className={`p-4 rounded-md flex items-center justify-between group border ${getBgColor()} hover:shadow-sm transition-shadow duration-200`}
    >
      <div className="flex items-center gap-3">
        {type === "offer" || type === "both" ? (
          <GraduationCap className="h-5 w-5 text-blue-500 flex-shrink-0" />
        ) : (
          <BookOpen className="h-5 w-5 text-green-500 flex-shrink-0" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{name}</h3>
            {type === "both" && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 text-xs"
              >
                Offer & Want to Learn
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Delete ${name} skill`}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </li>
  );
}
