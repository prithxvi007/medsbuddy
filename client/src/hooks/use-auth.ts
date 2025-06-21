import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, setAuthToken, removeAuthToken, isAuthenticated } from "@/lib/auth";
import type { LoginData, SignupData, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userQuery = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.getMe,
    enabled: isLoggedIn,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuthToken(data.token);
      setIsLoggedIn(true);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      setAuthToken(data.token);
      setIsLoggedIn(true);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Account created",
        description: `Welcome to MedsBuddy, ${data.user.firstName}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    removeAuthToken();
    setIsLoggedIn(false);
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return {
    user: userQuery.data,
    isLoggedIn,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
  };
}
