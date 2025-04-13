"use client";

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SkillItemProps {
  userSkillId: string;
  name: string;
  description?: string | null;
}

export default function SkillItem({ userSkillId, name, description }: SkillItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to remove "${name}" from your profile?`)) {
      setIsDeleting(true);
      
      const supabase = createClient();
      
      try {
        const { error } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_skill_id', userSkillId);
          
        if (error) throw error;
        
        // Refresh the page to update the skills list
        router.refresh();
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <li className="p-3 bg-slate-50 rounded-md flex items-center justify-between group">
      <div>
        <h3 className="font-medium">{name}</h3>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </li>
  );
}