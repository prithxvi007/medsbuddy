import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  loginSchema,
  signupSchema,
  type LoginData,
  type SignupData,
} from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { login, signup, isLoginLoading, isSignupLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      setLocation("/dashboard");
    }
  }, [isLoggedIn, setLocation]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "patient",
    },
  });

  const handleLogin = (data: LoginData) => {
    login(data); // Redirect handled by useEffect
  };

  const handleSignup = (data: SignupData) => {
    signup(data); // Redirect handled by useEffect
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-600 rounded-full mb-4">
            {isLogin ? (
              <LogIn className="w-8 h-8 text-white" />
            ) : (
              <UserPlus className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-gray-600">
            {isLogin
              ? "Sign in to your MedsBuddy account"
              : "Join MedsBuddy to manage your medications"}
          </p>
        </CardHeader>

        <CardContent>
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...loginForm.register("email")}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...loginForm.register("password")}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoginLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoginLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Sign In
              </Button>
            </form>
          ) : (
            <form
              onSubmit={signupForm.handleSubmit(handleSignup)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...signupForm.register("firstName")}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...signupForm.register("lastName")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  {...signupForm.register("username")}
                />
              </div>

              <div>
                <Label htmlFor="signupEmail">Email Address</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...signupForm.register("email")}
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value) =>
                    signupForm.setValue("role", value as "patient" | "caretaker")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="caretaker">Caretaker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  placeholder="Create a secure password"
                  {...signupForm.register("password")}
                />
              </div>

              <Button
                type="submit"
                disabled={isSignupLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSignupLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Create Account
              </Button>
            </form>
          )}

          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
