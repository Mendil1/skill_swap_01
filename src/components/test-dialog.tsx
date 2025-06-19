"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface TestDialogProps {
  children: React.ReactNode;
}

function TestDialog({ children }: TestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>Click to test dialog</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>This is a test dialog to verify Dialog component works.</p>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TestDialog };
