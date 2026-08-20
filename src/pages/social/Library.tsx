/**
 * Media, tracked links, and tracking a post by its URL.
 *
 * Three things that all answer "what am I working with", so they share a
 * page rather than each getting a tab nobody visits.
 *
 * The aspect-ratio warnings on upload are the point of the media half. The
 * wrong ratio crops a face and there is no undo once a post is live, so the
 * warning arrives while the file can still be recropped — and it names the
 * platform and the ratio, because "this may be cropped" is not actionable.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Copy, ExternalLink, FileUp, Link2, Loader2, MousePointerClick,
    Search, Trash2, TriangleAlert,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/social/PlatformIcon';
import {
    type MediaAsset, type TrackedLink, type TrackUrlResult,
    socialError, socialExtras,
} from '@/services/socialApi';

type Tab = 'media' | 'links' | 'track';

export default function Library() {
    const [tab, setTab] = useState<Tab>('media');
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [links, setLinks] = useState<TrackedLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const [targetUrl, setTargetUrl] = useState('');
    const [campaign, setCampaign] = useState('');
    const [creating, setCreating] = useState(false);

    const [trackInput, setTrackInput] = useState('');
    const [tracking, setTracking] = useState(false);
    const [tracked, setTracked] = useState<TrackUrlResult | null>(null);

    const load = useCallback(async () => {
        try {
            const [media, linkRows] = await Promise.all([
                socialExtras.listMedia().catch(() => [] as MediaAsset[]),
                socialExtras.listLinks().catch(() => [] as TrackedLink[]),
            ]);
            setAssets(media);
            setLinks(linkRows);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const upload = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const asset = await socialExtras.uploadMedia(file);
                setAssets((rows) => [asset, ...rows]);
                // Warnings are advisory — the file uploaded fine, but it will
                // be cropped somewhere and the person can still fix that.
                (asset.warnings ?? []).forEach((w) => toast.warning(w));
            }
            toast.success('Uploaded');
        } catch (error) {
            toast.error(socialError(error, 'Could not upload that file'));
        } finally {
            setUploading(false);
            if (fileInput.current) fileInput.current.value = '';
        }
    };

    const removeAsset = async (asset: MediaAsset) => {
        try {
            await socialExtras.deleteMedia(asset.id);
            setAssets((rows) => rows.filter((r) => r.id !== asset.id));
            toast.success('Deleted');
        } catch (error) {
            toast.error(socialError(error, 'Could not delete that'));
        }
    };

    const createLink = async () => {
        if (!targetUrl.trim()) return;
        setCreating(true);
        try {
            const link = await socialExtras.createLink({
                target_url: targetUrl.trim(),
                campaign: campaign.trim() || undefined,
            });
            setLinks((rows) => [link, ...rows]);
            setTargetUrl(''); setCampaign('');
            toast.success('Link ready');
        } catch (error) {
            toast.error(socialError(error, 'Could not create that link'));
        } finally {
            setCreating(false);
        }
    };

    const trackByUrl = async () => {
        if (!trackInput.trim()) return;
        setTracking(true);
        setTracked(null);
        try {
            setTracked(await socialExtras.trackUrl(trackInput.trim()));
        } catch (error) {
            toast.error(socialError(error, 'Could not track that URL'));
        } finally {
            setTracking(false);
        }
    };

    const copy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        toast.success('Copied');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <header className="mb-5">
                <h1 className="text-2xl font-semibold text-gray-900">Library</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Your images and video, the links you are tracking, and anything
                    you want to watch that you posted elsewhere.
                </p>
            </header>

            <div className="mb-5 flex flex-wrap gap-2">
                {([
                    ['media', 'Media', assets.length],
                    ['links', 'Links', links.length],
                    ['track', 'Track a post', 0],
                ] as Array<[Tab, string, number]>).map(([id, label, count]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${tab === id
                            ? 'border-lumicoria-purple bg-purple-50 text-lumicoria-purple'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {label}{count > 0 && ` (${count})`}
                    </button>
                ))}
            </div>

            {/* Media */}
            {tab === 'media' && (
                <>
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); void upload(e.dataTransfer.files); }}
                        className="mb-4 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center transition-colors hover:border-lumicoria-purple/50">
                        <FileUp size={20} className="mx-auto text-gray-300" />
                        <p className="mt-2 text-sm text-gray-600">
                            Drop images or video here
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            JPEG, PNG or WebP up to 8 MB · MP4 up to 512 MB
                        </p>
                        <input ref={fileInput} type="file" multiple hidden
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                            onChange={(e) => void upload(e.target.files)} />
                        <Button size="sm" variant="outline" className="mt-3"
                            disabled={uploading}
                            onClick={() => fileInput.current?.click()}>
                            {uploading ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : null}
                            Choose files
                        </Button>
                    </div>

                    {assets.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                            Nothing here yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {assets.map((asset) => (
                                <div key={asset.id}
                                    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                                    {asset.kind === 'image' ? (
                                        <img src={asset.url} alt={asset.alt_text ?? ''}
                                            className="h-28 w-full object-cover" />
                                    ) : (
                                        <video src={asset.url} className="h-28 w-full object-cover" />
                                    )}
                                    <div className="p-2">
                                        <p className="truncate text-[10px] text-gray-500">
                                            {asset.width && asset.height
                                                ? `${asset.width}×${asset.height}`
                                                : asset.kind}
                                            {' · '}
                                            {(asset.size_bytes / 1024 / 1024).toFixed(1)} MB
                                        </p>
                                        {/* Missing alt text is worth flagging: it is an
                                            accessibility gap and a ranking input. */}
                                        {!asset.alt_text && asset.kind === 'image' && (
                                            <p className="mt-0.5 text-[10px] text-amber-600">
                                                No alt text
                                            </p>
                                        )}
                                    </div>
                                    <button onClick={() => removeAsset(asset)}
                                        className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1 opacity-0 shadow transition-opacity group-hover:opacity-100"
                                        aria-label="Delete">
                                        <Trash2 size={12} className="text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Links */}
            {tab === 'links' && (
                <>
                    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <label className="mb-1 block text-xs text-gray-600">
                            Where should it go?
                        </label>
                        <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://lumicoria.ai/pricing"
                            className="mb-3 h-9 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />
                        <label className="mb-1 block text-xs text-gray-600">
                            Campaign name <span className="text-gray-400">(optional)</span>
                        </label>
                        <input value={campaign} onChange={(e) => setCampaign(e.target.value)}
                            placeholder="spring-launch"
                            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />
                        <Button size="sm" className="mt-3" disabled={creating || !targetUrl.trim()}
                            onClick={createLink}>
                            {creating ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : <Link2 size={13} className="mr-1.5" />}
                            Create trackable link
                        </Button>
                        <p className="mt-2 text-[11px] text-gray-400">
                            The link is ours, so the click data stays yours. Tags you
                            already added to the URL are kept as they are.
                        </p>
                    </div>

                    {links.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                            No tracked links yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {links.map((link) => (
                                <div key={link.id}
                                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">
                                                {link.short_url}
                                            </code>
                                            <button onClick={() => copy(link.short_url)}
                                                aria-label="Copy link">
                                                <Copy size={12} className="text-gray-400 hover:text-gray-700" />
                                            </button>
                                        </div>
                                        <p className="mt-1 truncate text-[11px] text-gray-400">
                                            {link.target_url}
                                        </p>
                                    </div>
                                    {link.utm_campaign && (
                                        <Badge variant="outline" className="text-[10px]">
                                            {link.utm_campaign}
                                        </Badge>
                                    )}
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                        <MousePointerClick size={12} />
                                        {link.click_count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Track by URL */}
            {tab === 'track' && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <label className="mb-1 block text-xs text-gray-600">
                        Paste a post's link
                    </label>
                    <div className="flex gap-2">
                        <input value={trackInput} onChange={(e) => setTrackInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && trackByUrl()}
                            placeholder="https://www.instagram.com/p/…"
                            className="h-9 flex-1 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />
                        <Button size="sm" disabled={tracking || !trackInput.trim()}
                            onClick={trackByUrl}>
                            {tracking ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                        </Button>
                    </div>

                    {tracked && (
                        <div className={`mt-4 rounded-xl border p-4 ${tracked.owned
                            ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                            <div className="flex items-center gap-2">
                                <PlatformIcon platform={tracked.provider} size={18} />
                                <span className="text-sm font-medium text-gray-900">
                                    {tracked.owned ? 'Tracking with full data' : 'Public data only'}
                                </span>
                            </div>
                            {/* The honesty that prevents a "why is reach empty?"
                                support loop: reach is owner-only everywhere. */}
                            <p className="mt-1.5 text-xs text-gray-700">{tracked.note}</p>
                            <a href={trackInput} target="_blank" rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs text-lumicoria-purple hover:underline">
                                <ExternalLink size={11} /> Open the post
                            </a>
                        </div>
                    )}

                    <p className="mt-4 flex items-start gap-2 text-[11px] text-gray-400">
                        <TriangleAlert size={12} className="mt-0.5 shrink-0" />
                        Reach and impressions are only shared with the account owner.
                        For a post on an account you have connected we get everything;
                        for anyone else's, only what is public.
                    </p>
                </div>
            )}
        </div>
    );
}
