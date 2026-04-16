import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogApi, type BlogPost, type BlogCategory } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, PenLine, Bot, FileText } from "lucide-react";

const CATEGORIES = ["All", "News", "Release", "Engineering", "Product", "Research", "Tutorial"];

export default function BlogListing() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const pageSize = 12;

  const categoryParam = activeCategory === "All" ? undefined : activeCategory.toLowerCase();

  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts", page, categoryParam],
    queryFn: () => blogApi.list({ page, page_size: pageSize, category: categoryParam }),
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.getCategories(),
  });

  const posts = data?.posts || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = posts.filter((p) => p !== featuredPost);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-tight">Blog</h1>
            <p className="mt-3 text-lg text-gray-500">
              Product updates, engineering deep dives, and AI insights from the Lumicoria team.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/blog/my-posts"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <FileText className="w-4 h-4" />
                My Posts
              </Link>
              <Link
                to="/blog/write"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                <PenLine className="w-4 h-4" />
                Write a post
              </Link>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeCategory === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-100 rounded-xl" />
                <div className="mt-4 h-4 bg-gray-100 rounded w-20" />
                <div className="mt-2 h-6 bg-gray-100 rounded w-3/4" />
                <div className="mt-2 h-4 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No posts yet.</p>
            {user && (
              <Link
                to="/blog/write"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                <PenLine className="w-4 h-4" />
                Write the first post
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && page === 1 && (
              <Link to={`/blog/${featuredPost.slug}`} className="block mb-12 group">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {featuredPost.cover_image_url && (
                    <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                      <img
                        src={featuredPost.cover_image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div>
                    {featuredPost.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                        {featuredPost.category}
                      </span>
                    )}
                    <h2 className="mt-2 text-3xl font-serif font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="mt-3 text-gray-500 line-clamp-3">{featuredPost.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
                      <AuthorBadge post={featuredPost} />
                      <span>&middot;</span>
                      <span>{formatDate(featuredPost.published_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      {post.cover_image_url ? (
        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <span className="text-4xl font-serif text-gray-200">{post.title[0]}</span>
        </div>
      )}
      <div className="mt-4">
        {post.category && (
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
            {post.category}
          </span>
        )}
        <h3 className="mt-1 text-lg font-serif font-bold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <AuthorBadge post={post} />
          <span>&middot;</span>
          <span>{formatDate(post.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}

function AuthorBadge({ post }: { post: BlogPost }) {
  return (
    <span className="flex items-center gap-1.5">
      {post.author_avatar_url ? (
        <img src={post.author_avatar_url} alt="" className="w-5 h-5 rounded-full" />
      ) : post.author_type === "ai_agent" ? (
        <Bot className="w-4 h-4 text-purple-500" />
      ) : null}
      <span>{post.author_name}</span>
      {post.author_type === "ai_agent" && (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-purple-100 text-purple-600 rounded-full">
          AI
        </span>
      )}
    </span>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
