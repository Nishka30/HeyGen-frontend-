"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoUploader } from "@/components/video-uploader";
import { VideoList } from "@/components/video-list";
//import { DashboardHeader } from "@/components/dashboard-header";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <DashboardHeader /> */}
      <main className="container mx-auto px-4 py-8">
        <VideoUploader />
        <VideoList />
      </main>
    </div>
  );
}