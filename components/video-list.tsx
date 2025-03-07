"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { userRequest } from "@/lib/axiosInstance"; // Adjust the import path as necessary

interface VideoItem {
  video_translate_id: string;
  title: string;
  status: string;
  url?: string;
}

export function VideoList() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await userRequest.get("/api/heygen/videos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        setVideos(data);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (isLoading) {
    return <div>Loading videos...</div>;
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <Card key={video.video_translate_id}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              {video.title}
            </CardTitle>
            <CardDescription>
              Status: {video.status}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {video.status === "running" && (
              <Progress value={45} className="mt-2" />
            )}
            {video.url && (
              <video
                src={video.url}
                controls
                className="mt-4 w-full rounded-lg"
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}