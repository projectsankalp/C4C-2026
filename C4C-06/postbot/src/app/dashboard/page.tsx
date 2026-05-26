"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, Loader2, ArrowLeft, Image as ImageIcon, Trash2, Edit3, Clock, Zap } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) fetchPosts();
  }, [session]);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this scheduled post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting post");
    }
  };

  const [isPublishingNow, setIsPublishingNow] = useState<string | null>(null);
  const publishNow = async (id: string) => {
    if (!confirm("Publish this post immediately to LinkedIn?")) return;
    setIsPublishingNow(id);
    try {
      const res = await fetch(`/api/posts/${id}/publish`, { method: "POST" });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: "PUBLISHED" } : p));
        alert("Successfully published to LinkedIn!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to publish");
      }
    } catch (err) {
      console.error(err);
      alert("Error publishing post");
    } finally {
      setIsPublishingNow(null);
    }
  };

  const updatePost = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === id ? { ...p, ...data.post } : p));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const scheduledPosts = posts.filter(p => p.status === "PENDING");
  const publishedPosts = posts.filter(p => p.status === "PUBLISHED" || p.status === "FAILED");

  if (!session) return null;

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: "#0A0A0F" }}>
      <Sidebar />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="pr-orb pr-orb-amber" style={{ width: 500, height: 500, top: -80, right: -120 }} />
        <div className="pr-orb pr-orb-blue" style={{ width: 400, height: 400, bottom: -80, left: -80 }} />
      </div>

      <main className="relative z-10 flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-8 py-5 sticky top-0 z-20"
          style={{
            background: "rgba(10,10,15,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <ArrowLeft size={16} style={{ color: "#9CA3AF" }} />
            </Link>
            <div>
              <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Post Manager</p>
              <h1 className="text-xl font-semibold" style={{ letterSpacing: "-0.02em", color: "#F0F0F5" }}>
                Scheduled Posts
              </h1>
            </div>
          </div>

          {/* Count pill */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(247,147,30,0.15))",
              border: "1px solid rgba(255,107,53,0.25)",
              color: "#F7931E",
            }}
          >
            <CalendarClock size={14} />
            {scheduledPosts.length} queued
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-8 max-w-4xl mx-auto w-full">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="animate-spin" style={{ color: "#F7931E" }} />
              <p style={{ color: "#6B7280", fontSize: 14 }}>Loading your scheduled posts…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">

              {/* Upcoming Queue */}
              {scheduledPosts.length > 0 && (
                <section className="pr-fade-up pr-fade-up-1">
                  <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "#6B7280", letterSpacing: "0.08em" }}>
                    Upcoming Queue
                  </h2>
                  <div className="flex flex-col gap-4">
                    {scheduledPosts.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="pr-card relative overflow-hidden"
                        style={{ padding: "20px 24px" }}
                      >
                        {/* Left accent bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-full"
                          style={{ background: "linear-gradient(180deg, #FF6B35, #FFB347)" }}
                        />

                        {/* Top row */}
                        <div className="flex items-start justify-between mb-3 pl-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: "linear-gradient(135deg, #FF6B35, #FFB347)", boxShadow: "0 0 6px rgba(255,107,53,0.6)" }}
                            />
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#F7931E" }}>
                              Scheduled
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF" }}
                          >
                            <Clock size={11} />
                            {new Date(post.scheduledAt).toLocaleString([], {
                              month: "short", day: "numeric",
                              hour: "numeric", minute: "2-digit"
                            })}
                          </div>
                        </div>

                        {/* Content */}
                        {post.content && post.content.trim() !== "" && (
                          <p
                            className="text-sm leading-relaxed pl-3 mb-4"
                            style={{ color: "#D1D5DB", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {post.content}
                          </p>
                        )}

                        {/* Footer row */}
                        <div className="flex items-center justify-between pl-3">
                          <div className="flex items-center gap-3">
                            {/* Platform badge */}
                            <div
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                              style={{ background: "rgba(74,144,226,0.12)", border: "1px solid rgba(74,144,226,0.2)", color: "#7EC8E3" }}
                            >
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                              LinkedIn
                            </div>
                            {post.mediaUrns && post.mediaUrns.length > 0 && (
                              <div className="flex items-center gap-1 text-xs" style={{ color: "#6B7280" }}>
                                <ImageIcon size={12} />
                                {post.mediaUrns.length} {post.mediaUrns.length === 1 ? "media" : "media files"}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                const newContent = prompt("Edit your post content:", post.content);
                                if (newContent !== null && newContent !== post.content) {
                                  await updatePost(post.id, { content: newContent });
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF" }}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button
                              onClick={async () => {
                                const newDate = prompt("Enter new date/time (YYYY-MM-DDTHH:MM):", new Date(post.scheduledAt).toISOString().slice(0, 16));
                                if (newDate) await updatePost(post.id, { scheduledAt: newDate });
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF" }}
                            >
                              <Clock size={12} /> Reschedule
                            </button>
                            <button
                              onClick={() => publishNow(post.id)}
                              disabled={isPublishingNow === post.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                              style={{
                                background: "linear-gradient(135deg, #FF6B35, #F7931E)",
                                color: "white",
                                boxShadow: "0 2px 8px rgba(255,107,53,0.3)",
                              }}
                            >
                              <Zap size={12} />
                              {isPublishingNow === post.id ? "Publishing…" : "Publish Now"}
                            </button>
                            <button
                              onClick={() => deletePost(post.id)}
                              className="flex items-center justify-center w-8 h-8 rounded-xl transition-all hover:opacity-80"
                              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {scheduledPosts.length === 0 && !isLoading && (
                <div className="pr-card flex flex-col items-center justify-center py-20 gap-4 text-center pr-fade-up pr-fade-up-1">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                    style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(247,147,30,0.15))", border: "1px solid rgba(255,107,53,0.2)" }}
                  >
                    <CalendarClock size={28} style={{ color: "#F7931E" }} />
                  </div>
                  <p className="text-lg font-semibold" style={{ color: "#F0F0F5" }}>No scheduled posts yet</p>
                  <p className="text-sm max-w-xs" style={{ color: "#6B7280" }}>
                    Go to the Composer and set a future date before publishing to queue your first post.
                  </p>
                  <Link href="/" className="pr-btn-primary mt-2" style={{ fontSize: 13, padding: "10px 20px" }}>
                    Open Composer
                  </Link>
                </div>
              )}

              {/* History */}
              {publishedPosts.length > 0 && (
                <section className="pr-fade-up pr-fade-up-2">
                  <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "#6B7280", letterSpacing: "0.08em" }}>
                    History
                  </h2>
                  <div className="flex flex-col gap-3">
                    {publishedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-start gap-4 px-5 py-4 rounded-2xl"
                        style={{ background: "rgba(15,15,20,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="mt-0.5">
                          <div
                            className="w-2 h-2 rounded-full mt-1.5"
                            style={{ backgroundColor: post.status === "PUBLISHED" ? "#10B981" : "#EF4444" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          {post.content && (
                            <p className="text-sm mb-1 truncate" style={{ color: "#9CA3AF" }}>{post.content}</p>
                          )}
                          <div className="flex items-center gap-3">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: post.status === "PUBLISHED" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                                color: post.status === "PUBLISHED" ? "#10B981" : "#EF4444",
                                border: `1px solid ${post.status === "PUBLISHED" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                              }}
                            >
                              {post.status}
                            </span>
                            <span className="text-xs" style={{ color: "#4B5563" }}>
                              {new Date(post.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 size={16} style={{ color: post.status === "PUBLISHED" ? "#10B981" : "#4B5563", flexShrink: 0, marginTop: 2 }} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
