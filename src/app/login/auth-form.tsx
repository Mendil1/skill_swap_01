"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthFormProps {
  login: (formData: FormData) => Promise<void>;
  signup: (formData: FormData) => Promise<void>;
  error?: string; // Add error prop to receive error messages
}

export function AuthForm({ login, signup, error }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Add state for full name
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Show dialog when error prop changes
  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  const handleContinue = () => {
    setShowErrorDialog(false);
    // Reset fields based on user preference
    // Could reset password only, or all fields depending on requirements
    setPassword("");
  };

  const handleCancel = () => {
    setShowErrorDialog(false);
    // Reset all fields when user doesn't want to continue
    setEmail("");
    setPassword("");
    setFullName("");
  };

  // Validate password as user types
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Check password length only in signup mode
    if (mode === "signup") {
      if (newPassword.length > 0 && newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters");
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
    }
  };

  // Validate full name as user types
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFullName = e.target.value;
    setFullName(newFullName);

    if (mode === "signup") {
      if (newFullName.trim() === "") {
        setFullNameError("Full name is required");
      } else {
        setFullNameError(null);
      }
    }
  };

  // Validate before form submission - now used to prevent default if there's an error
  const validatePasswordBeforeSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    let hasError = false;

    // Only validate in signup mode
    if (mode === "signup") {
      if (password.length < 6) {
        setPasswordError("Password must be at least 6 characters");
        hasError = true;
      }

      if (fullName.trim() === "") {
        setFullNameError("Full name is required");
        hasError = true;
      }
    }

    if (hasError) {
      e.preventDefault(); // Prevent form submission
      return false;
    }

    return true;
  };

  return (
    <>
      <Tabs
        defaultValue="login"
        onValueChange={(value) => {
          setMode(value as "login" | "signup");
          setPasswordError(null); // Clear errors when switching tabs
          setFullNameError(null); // Clear full name errors when switching tabs
        }}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Log In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-login">Email</Label>
            <Input
              id="email-login"
              name="email"
              type="email"
              placeholder="yourname@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-login">Password</Label>
            <Input
              id="password-login"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={handlePasswordChange}
            />
          </div>

          <form action={login}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="password" value={password} />
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name-signup">Full Name</Label>
            <Input
              id="full-name-signup"
              name="full_name"
              type="text"
              placeholder="Jane Doe"
              required
              value={fullName}
              onChange={handleFullNameChange}
              className={fullNameError ? "border-red-500" : ""}
            />
            {fullNameError ? (
              <Alert variant="destructive" className="py-2 mt-1">
                <AlertDescription className="text-xs">
                  {fullNameError}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>
            <Input
              id="email-signup"
              name="email"
              type="email"
              placeholder="yourname@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <Input
              id="password-signup"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={handlePasswordChange}
              className={passwordError ? "border-red-500" : ""}
            />
            {passwordError ? (
              <Alert variant="destructive" className="py-2 mt-1">
                <AlertDescription className="text-xs">
                  {passwordError}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <form action={signup} onSubmit={validatePasswordBeforeSubmit}>
            <input type="hidden" name="full_name" value={fullName} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="password" value={password} />
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {/* Error Dialog - displays when there's an authentication error */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Error</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            {error || "There was an error with your authentication attempt."}
          </p>
          <p>Would you like to continue and try again?</p>
          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleContinue}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
