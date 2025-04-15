"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Trash2, BookOpen, GraduationCap, Tag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface SkillItemProps {
  userSkillId: string;
  name: string;
  description?: string | null;
  type: "offer" | "request" | "both";
  category?: string | null;
}

export default function SkillItem({
  userSkillId,
  name,
  description,
  type,
  category,
}: SkillItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
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

  // Get category styles
  const getCategoryStyle = () => {
    if (!category) return "bg-slate-100 text-slate-700";

    switch (category) {
      case "Technology":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Arts & Crafts":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Music":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Sports":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Languages":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Academics":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Cooking":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Business":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Health & Fitness":
        return "bg-lime-50 text-lime-700 border-lime-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Truncate description for display
  const shouldTruncate = description && description.length > 100;
  const truncatedDescription =
    shouldTruncate && !showFullDescription
      ? description?.substring(0, 100) + "..."
      : description;

  return (
    <li
      className={`p-4 rounded-md flex flex-col group border ${getBgColor()} hover:shadow-sm transition-shadow duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {type === "offer" || type === "both" ? (
            <GraduationCap className="h-5 w-5 text-blue-500 flex-shrink-0" />
          ) : (
            <BookOpen className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
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

            {category && (
              <div className="mt-2 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-500" />
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getCategoryStyle()}`}
                >
                  {category}
                </span>
              </div>
            )}

            {description && (
              <div className="mt-2">
                <p className="text-sm text-slate-600">{truncatedDescription}</p>
                {shouldTruncate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs p-0 h-auto mt-1 text-blue-600 hover:text-blue-800 hover:bg-transparent"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>
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
      </div>
    </li>
  );
}
