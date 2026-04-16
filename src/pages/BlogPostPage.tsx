import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi, commentApi, type BlogComment } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import BlogNav from "@/components/BlogNav";
import {
  ArrowLeft, Share2, Copy, Check, Bot, Twitter, Linkedin,
  Eye, MessageCircle, Send, Trash2,
} from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogApi.getBySlug(slug!),
    enabled: !!slug,
  });

  // Comments
  const { data: commentsData } = useQuery({
    queryKey: ["blog-comments", post?.id],
    queryFn: () => commentApi.list(post!.id),
    enabled: !!post?.id,
  });

  // Related posts
  const { data: related } = useQuery({
    queryKey: ["blog-related", post?.category],
    queryFn: () => blogApi.list({ category: post!.category!, page_size: 4 }),
    enabled: !!post?.category,
  });

  const relatedPosts = (related?.posts || []).filter((p) => p.slug !== slug).slice(0, 3);
  const comments = commentsData?.comments || [];

  // Post comment mutation
  const postComment = useMutation({
    mutationFn: (content: string) => {
      // Parse @mentions from content
      const mentionRegex = /@\[([^\]]+)\]\((\w+):([^)]+)\)/g;
      const mentions: { type: string; id: string; name: string }[] = [];
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push({ name: match[1], type: match[2], id: match[3] });
      }
      return commentApi.create(post!.id, { content, mentions });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", post?.id] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => commentApi.delete(post!.id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments", post?.id] });
    },
  });

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      await navigator.share({ title: post.title, url: window.location.href });
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    postComment.mutate(commentText);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <BlogNav />
        <div className="max-w-3xl mx-auto px-4 py-20 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-32 mx-auto" />
          <div className="h-10 bg-gray-100 rounded w-3/4 mx-auto mt-6" />
          <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mt-4" />
          <div className="aspect-video bg-gray-100 rounded-xl mt-10" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <BlogNav />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Post not found</h1>
          <Link to="/blog" className="mt-4 inline-block text-purple-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BlogNav />

      <div className="max-w-3xl mx-auto px-4 pt-10 pb-20">
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Date + Category */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
            <span>{formatDate(post.published_at || post.created_at)}</span>
            {post.category && (
              <>
                <span>&middot;</span>
                <span className="uppercase text-xs font-semibold tracking-wider text-purple-600">
                  {post.category}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="mt-4 text-xl text-gray-400">{post.subtitle}</p>
          )}

          {/* Share buttons */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {typeof navigator.share === "function" && (
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="mt-10 aspect-video rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <article
          className="prose prose-lg max-w-none mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Card */}
        <div className="mt-10 pt-8 border-t">
          <div className="flex items-center gap-4">
            {post.author_avatar_url ? (
              <img
                src={post.author_avatar_url}
                alt={post.author_name}
                className="w-12 h-12 rounded-full"
              />
            ) : post.author_type === "ai_agent" ? (
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-400">
                {post.author_name[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{post.author_name}</span>
                {post.author_type === "ai_agent" && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-purple-100 text-purple-600 rounded-full">
                    AI
                  </span>
                )}
              </div>
              {post.author_title && (
                <span className="text-sm text-gray-400">{post.author_title}</span>
              )}
            </div>
          </div>
        </div>

        {/* Post Analytics */}
        <div className="mt-8 flex items-center gap-4 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {post.view_count} {post.view_count === 1 ? "view" : "views"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* Comments Section */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({comments.length})
          </h3>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-400 shrink-0">
                  {(user as any).full_name?.[0] || "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment... Use @agent:agent-name or @user:user-name to mention"
                    rows={3}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!commentText.trim() || postComment.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {postComment.isPending ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">
                <Link to="/login" className="text-purple-600 font-medium hover:underline">
                  Sign in
                </Link>{" "}
                to join the conversation.
              </p>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-6">
            {comments.map((c) => (
              <CommentCard
                key={c.id}
                comment={c}
                currentUserId={user ? String((user as any).id) : undefined}
                isSuperuser={(user as any)?.is_superuser}
                onDelete={(id) => deleteComment.mutate(id)}
              />
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No comments yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Related posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} to={`/blog/${rp.slug}`} className="group block">
                  {rp.cover_image_url ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={rp.cover_image_url}
                        alt={rp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-gray-50 flex items-center justify-center">
                      <span className="text-3xl font-serif text-gray-200">{rp.title[0]}</span>
                    </div>
                  )}
                  <h4 className="mt-3 font-serif font-bold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                    {rp.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-400">{formatDate(rp.published_at)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  currentUserId,
  isSuperuser,
  onDelete,
}: {
  comment: BlogComment;
  currentUserId?: string;
  isSuperuser?: boolean;
  onDelete: (id: string) => void;
}) {
  const canDelete = currentUserId === comment.user_id || isSuperuser;

  // Render mentions as highlighted text
  const renderContent = (text: string) => {
    // Highlight @[Name](type:id) patterns
    const parts = text.split(/(@\[[^\]]+\]\(\w+:[^)]+\))/g);
    return parts.map((part, i) => {
      const match = part.match(/@\[([^\]]+)\]\((\w+):([^)]+)\)/);
      if (match) {
        return (
          <span key={i} className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            @{match[1]}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex gap-3">
      {comment.user_avatar_url ? (
        <img src={comment.user_avatar_url} alt="" className="w-9 h-9 rounded-full shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-400 shrink-0">
          {comment.user_name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{comment.user_name}</span>
          <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ml-auto p-1 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
          {renderContent(comment.content)}
        </p>
      </div>
    </div>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}
