import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi, type BlogPost } from "@/services/api";
import { PenLine, Trash2, Edit3, Eye, Clock, Archive, AlertCircle } from "lucide-react";

const STATUS_TABS = ["all", "draft", "published", "archived"] as const;

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <Clock className="w-3.5 h-3.5 text-yellow-500" />,
  published: <Eye className="w-3.5 h-3.5 text-green-500" />,
  archived: <Archive className="w-3.5 h-3.5 text-gray-400" />,
};

export default function BlogMyPosts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["blog-my-posts"],
    queryFn: () => blogApi.getMyPosts({ page: 1, page_size: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-my-posts"] });
      setDeleteConfirm(null);
    },
  });

  const allPosts = data?.posts || [];
  const filteredPosts =
    activeTab === "all" ? allPosts : allPosts.filter((p) => p.status === activeTab);

  const counts = {
    all: allPosts.length,
    draft: allPosts.filter((p) => p.status === "draft").length,
    published: allPosts.filter((p) => p.status === "published").length,
    archived: allPosts.filter((p) => p.status === "archived").length,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">My Posts</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your drafts, published posts, and collaborations.
            </p>
          </div>
          <Link
            to="/blog/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
          >
            <PenLine className="w-4 h-4" />
            New Post
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-xl">
                <div className="w-32 h-20 bg-gray-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">
              {activeTab === "all"
                ? "You haven't written any posts yet."
                : `No ${activeTab} posts.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
              >
                {/* Thumbnail */}
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="w-28 h-18 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-28 h-18 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-serif text-gray-200">{post.title[0]}</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {STATUS_ICONS[post.status]}
                    <span className="text-xs font-medium text-gray-400 uppercase">
                      {post.status}
                    </span>
                    {post.category && (
                      <>
                        <span className="text-gray-300">&middot;</span>
                        <span className="text-xs text-purple-600 font-medium">{post.category}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {post.status === "published"
                      ? `Published ${formatDate(post.published_at)}`
                      : `Last edited ${formatDate(post.updated_at)}`}
                    {post.view_count > 0 && ` · ${post.view_count} views`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {post.status === "published" && (
                    <Link
                      to={`/blog/${post.slug}`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => navigate(`/blog/edit/${post.id}`)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === post.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(post.id)}
                        className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(post.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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
