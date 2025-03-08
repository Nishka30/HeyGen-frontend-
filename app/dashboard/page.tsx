"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { 
  Video, 
  UserSquare2, 
  Mic, 
  ArrowUpRight,
  Activity 
} from "lucide-react";
import Link from "next/link";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const features = [
    {
      title: "Video Translation",
      description: "Translate your videos into multiple languages",
      icon: Video,
      href: "/dashboard/translate",
      color: "text-blue-500"
    },
    {
      title: "Avatar Videos",
      description: "Create AI-powered avatar videos",
      icon: UserSquare2,
      href: "/dashboard/avatar",
      color: "text-green-500"
    },
    {
      title: "Voice Library",
      description: "Access and manage AI voices",
      icon: Mic,
      href: "/dashboard/voices",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-200">Dashboard</h2>
          <p className="text-gray-400 mt-2">Manage your video translation projects</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
          <Activity className="h-5 w-5 text-green-500" />
          <span className="text-gray-200">System Status: Online</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="p-6 hover:bg-gray-800/50 transition-colors cursor-pointer border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}