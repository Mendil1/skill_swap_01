"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface SkillFormProps {
  userId: string;
}

export default function SkillForm({ userId }: SkillFormProps) {
  const [skillName, setSkillName] = useState('');
  const [skillType, setSkillType] = useState<'offer' | 'request'>('offer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!skillName.trim()) {
      setError('Please enter a skill name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();
    
    try {
      // First, check if the skill already exists in the skills table
      let { data: existingSkill } = await supabase
        .from('skills')
        .select('skill_id')
        .eq('name', skillName.trim())
        .single();
      
      let skillId;
      
      // If the skill doesn't exist, create it
      if (!existingSkill) {
        const { data: newSkill, error: skillError } = await supabase
          .from('skills')
          .insert({ name: skillName.trim() })
          .select('skill_id')
          .single();
        
        if (skillError) throw skillError;
        skillId = newSkill.skill_id;
      } else {
        skillId = existingSkill.skill_id;
      }
      
      // Now add the user_skill relation
      const { error: userSkillError } = await supabase
        .from('user_skills')
        .insert({
          user_id: userId,
          skill_id: skillId,
          type: skillType
        });
      
      if (userSkillError) throw userSkillError;
      
      // Reset form and refresh the page
      setSkillName('');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Failed to add skill');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddSkill} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Enter skill name"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          disabled={isLoading}
          className="md:col-span-2"
        />
        <Select 
          value={skillType} 
          onValueChange={(value: 'offer' | 'request') => setSkillType(value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="offer">I offer</SelectItem>
            <SelectItem value="request">I want to learn</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Adding...' : 'Add Skill'}
      </Button>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}