"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";

interface GeneratedPost {
  id: number;
  prompt: string;
  caption: string | null;
  imageUrl: string | null;
  storageKey: string | null;
  referenceImageUrl: string | null;
  referenceStorageKey: string | null;
  modelUsed: string;
  status: "pending" | "generating" | "completed" | "failed";
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export function GenerationHistory() {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null);
  const [expandedCaptions, setExpandedCaptions] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Only fetch completed posts
      const response = await fetch("/api/posts?status=completed");
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
  };

  const toggleCaption = (postId: number) => {
    setExpandedCaptions((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(postId)) {
        newExpanded.delete(postId);
      } else {
        newExpanded.add(postId);
      }
      return newExpanded;
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const handleDownloadImage = async (imageUrl: string, postId: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `instadream-${postId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the post from the local state
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      } else {
        console.error("Failed to delete post");
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Generation History</h2>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border border-border rounded-lg overflow-hidden"
            >
              <div className="p-3 flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="w-full aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts found</p>
          <p className="text-sm mt-2">Start generating some Instagram posts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-border rounded-lg overflow-hidden bg-background"
            >
              {/* Post Header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-xs font-semibold">
                      AI
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">instadream_ai</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size={"icon-sm"}
                      variant={"ghost"}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {post.imageUrl && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleDownloadImage(post.imageUrl!, post.id)
                        }
                      >
                        <Download className="" />
                        Download image
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeletePost(post.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="" />
                      Delete post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post Image */}
              {post.imageUrl ? (
                <div
                  className="relative w-full aspect-square bg-secondary"
                  onMouseEnter={() => setHoveredPostId(post.id)}
                  onMouseLeave={() => setHoveredPostId(null)}
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.prompt || "Generated image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                  {/* Reference Image Overlay on Hover */}
                  {post.referenceImageUrl && hoveredPostId === post.id && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center animate-in fade-in duration-200">
                      <div className="relative w-full h-full">
                        <Image
                          src={post.referenceImageUrl}
                          alt="Reference image"
                          fill
                          className="object-contain"
                        />
                        <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-xs font-semibold">
                          Original Image
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-square bg-secondary flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="hover:text-muted-foreground transition-colors"
                    >
                      <Heart
                        className={`size-5 ${
                          likedPosts.has(post.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </button>
                    <button className="hover:text-muted-foreground transition-colors">
                      <MessageCircle className="size-5" />
                    </button>
                    <button className="hover:text-muted-foreground transition-colors">
                      <Send className="size-5" />
                    </button>
                  </div>
                  <button className="hover:text-muted-foreground transition-colors">
                    <Bookmark className="size-5" />
                  </button>
                </div>

                {/* Likes Count */}
                {likedPosts.has(post.id) && (
                  <p className="text-sm font-semibold">1 like</p>
                )}

                {/* Caption */}
                {post.caption && (
                  <div className="text-sm">
                    <span className="font-semibold">instadream_ai </span>
                    <span className={expandedCaptions.has(post.id) ? "whitespace-pre-wrap" : "line-clamp-2"}>
                      {post.caption}
                    </span>
                    {post.caption.length > 100 && (
                      <button
                        onClick={() => toggleCaption(post.id)}
                        className="text-muted-foreground ml-1"
                      >
                        {expandedCaptions.has(post.id) ? "less" : "...more"}
                      </button>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground uppercase">
                  {formatTimeAgo(post.createdAt)} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
