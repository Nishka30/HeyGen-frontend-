"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarVideoCreator } from "@/components/avatar-video-creator";
import { VideoList } from "@/components/video-list";
import { useToast } from "@/hooks/use-toast";

export default function AvatarPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-200">Avatar Videos</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <AvatarVideoCreator />
        <VideoList type="avatar" />
      </div>
    </div>
  );
}