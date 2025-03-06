"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast, Toaster } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(5, "Password must be at least 5 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [adminId, setAdminId] = useState<string | null>(null);
  let adminIds;

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch profile");

        const admin = await response.json();
        console.log("Admin data:", admin);
        setAdminId(admin.id);
        adminIds = String(admin.id);

        
        setFormData({
          name: admin.name || "",
          email: admin.email || "",
          phoneNumber: admin.phoneNumber || "",
          password: "",
        });
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load profile");
      }
    };
    fetchAdminProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return toast.error("Admin ID not found");

    // Check for required fields
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const validatedData = profileSchema.parse(formData);
      
      const loadingToastId = toast.loading("Updating profile...");
      const response = await fetch("/api/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          id: String(adminId),
          ...validatedData,
          ...(formData.password ? { password: formData.password } : {})
        }),
      });

      const data = await response.json();

      toast.dismiss(loadingToastId);

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      setFormData(prev => ({ ...prev, password: "" }));
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to update profile");
      }
    }
  };

  return (
    <>
     <Toaster position="top-right" richColors style={{top: "80px"}} />
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/logo-orange - sidebar.png" />
              <AvatarFallback>{formData.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Manage your profile information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" />
            
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your.email@example.com" />

            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Your phone number" />

            <Label htmlFor="password">New Password (Optional)</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter new password" />
            


            <Button type="submit" className="text-white w-full bg-amber-600 hover:bg-orange-700">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
