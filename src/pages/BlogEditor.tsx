import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useAuth } from "@/contexts/AuthContext";
import { blogApi, type BlogPost } from "@/services/api";
import { useUpload } from "@/hooks/useUpload";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Code, ImageIcon, Youtube as YoutubeIcon, Link2,
  Save, Send, Sparkles, X, Loader2, Upload,
} from "lucide-react";

const CATEGORIES = ["news", "release", "engineering", "product", "research", "tutorial"];

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { upload, isUploading } = useUpload("blog");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [authorType, setAuthorType] = useState<"individual" | "team" | "ai_agent">("individual");
  const [saving, setSaving] = useState(false);
  const [existingPost, setExistingPost] = useState<BlogPost | null>(null);

  // AI generate modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState("engineering");
  const [aiGenerating, setAiGenerating] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Youtube.configure({ width: 640, height: 360 }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your post..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[400px]",
      },
    },
  });

  // Load existing post for editing
  useEffect(() => {
    if (!id) return;
    blogApi.getMyPosts({ page: 1, page_size: 50 }).then((res) => {
      const post = res.posts.find((p) => p.id === id);
      if (post) {
        setExistingPost(post);
        setTitle(post.title);
        setSubtitle(post.subtitle || "");
        setExcerpt(post.excerpt || "");
        setCategory(post.category || "");
        setTags(post.tags || []);
        setCoverUrl(post.cover_image_url || "");
        setAuthorType(post.author_type as any);
        editor?.commands.setContent(post.content);
      }
    });
  }, [id, editor]);

  const handleCoverUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const result = await upload(file);
      setCoverUrl(result.url);
    },
    [upload]
  );

  const handleImageInsert = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;
      const result = await upload(file);
      editor.chain().focus().setImage({ src: result.url }).run();
    };
    input.click();
  }, [editor, upload]);

  const handleYoutubeInsert = useCallback(() => {
    const url = window.prompt("Paste YouTube URL:");
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const handleLinkInsert = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim() || !editor) return;
    setSaving(true);
    try {
      const content = editor.getHTML();
      if (existingPost) {
        await blogApi.update(existingPost.id, {
          title,
          subtitle: subtitle || undefined,
          content,
          excerpt: excerpt || undefined,
          cover_image_url: coverUrl || undefined,
          category: category || undefined,
          tags,
          status,
        });
      } else {
        await blogApi.create({
          title,
          subtitle: subtitle || undefined,
          content,
          excerpt: excerpt || undefined,
          cover_image_url: coverUrl || undefined,
          category: category || undefined,
          tags,
          status,
          author_type: (user as any)?.is_superuser ? authorType : undefined,
        });
      }
      navigate("/blog");
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    try {
      const post = await blogApi.aiGenerate({
        topic: aiTopic,
        category: aiCategory,
      });
      // Fill editor with generated content
      setTitle(post.title);
      setSubtitle(post.subtitle || "");
      setExcerpt(post.excerpt || "");
      setCategory(post.category || aiCategory);
      setTags(post.tags || []);
      setAuthorType("ai_agent");
      editor?.commands.setContent(post.content);
      setExistingPost(post);
      setShowAIModal(false);
      setAiTopic("");
    } catch (err) {
      console.error("AI generation failed", err);
    } finally {
      setAiGenerating(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><Code className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={handleImageInsert} active={false}><ImageIcon className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={handleYoutubeInsert} active={false}><YoutubeIcon className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn onClick={handleLinkInsert} active={editor.isActive("link")}><Link2 className="w-4 h-4" /></ToolbarBtn>
          </div>

          <div className="flex-1" />

          {(user as any)?.is_superuser && (
            <button
              onClick={() => setShowAIModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
          )}

          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            Publish
          </button>
        </div>

        {/* Cover Image */}
        <div className="mb-8">
          {coverUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              <button
                onClick={() => setCoverUrl("")}
                className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-[3/1] rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
              <Upload className="w-6 h-6 text-gray-300 mb-2" />
              <span className="text-sm text-gray-400">
                {isUploading ? "Uploading..." : "Add cover image"}
              </span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Title + Subtitle */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full text-4xl font-serif font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent"
        />
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Add a subtitle (optional)"
          className="w-full mt-2 text-xl text-gray-400 placeholder-gray-300 border-none outline-none bg-transparent"
        />

        {/* Meta Fields */}
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
          >
            <option value="">Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>

          {(user as any)?.is_superuser && (
            <select
              value={authorType}
              onChange={(e) => setAuthorType(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="individual">Individual</option>
              <option value="team">Team</option>
              <option value="ai_agent">AI Agent</option>
            </select>
          )}

          <div className="flex items-center gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add tags..."
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white w-36"
            />
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Excerpt */}
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short excerpt for the blog card (optional)"
          rows={2}
          className="w-full mt-4 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white resize-none"
        />

        {/* Editor */}
        <div className="mt-8 border-t pt-8">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* AI Generate Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Generate with AI
              </h3>
              <button onClick={() => setShowAIModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <textarea
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Introducing the Vision Agent — our new AI-powered image analysis tool"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAIGenerate}
                disabled={aiGenerating || !aiTopic.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded transition-colors ${
        active ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
