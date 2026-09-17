import { useState, useEffect, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Video,
  FileText,
  UploadCloud,
  Plus,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  Film,
} from 'lucide-react';
import { toast } from 'glintly-ui';
import {
  type SocialPost,
  useUpdatePost,
  usePublishPost,
  useUploadMedia,
} from '@/api/services/socialDeck';

type Props = {
  open: boolean;
  post: SocialPost | null;
  onClose: () => void;
  targetConnectionId?: string;
};

export function EditPostModal({ open, post, onClose, targetConnectionId }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('image');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const updatePost = useUpdatePost();
  const publishPost = usePublishPost();
  const uploadMedia = useUploadMedia();

  useEffect(() => {
    if (post && open) {
      setTitle(post.title || '');
      setContent(post.content || '');
      const existingImages = Array.isArray(post.images) && post.images.length > 0 ? post.images : [];
      const existingVideo = post.videoUrl || '';

      setImageUrls(existingImages);
      setVideoUrl(existingVideo);

      if (existingVideo) {
        setMediaType('video');
      } else if (existingImages.length > 0) {
        setMediaType('image');
      } else {
        // If post failed on Instagram due to missing media, default to 'image' tab so user can easily add one
        setMediaType('image');
      }
      setNewImageUrl('');
      setNewVideoUrl('');
    }
  }, [post, open]);

  if (!open || !post) return null;

  const hasMedia =
    (mediaType === 'image' && imageUrls.length > 0) ||
    (mediaType === 'video' && !!videoUrl.trim());

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error('Image URL must start with http:// or https://');
      return;
    }
    if (imageUrls.length >= 10) {
      toast.error('Maximum 10 images allowed per post');
      return;
    }
    setImageUrls([...imageUrls, trimmed]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSetVideoUrl = () => {
    const trimmed = newVideoUrl.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error('Video URL must start with http:// or https://');
      return;
    }
    setVideoUrl(trimmed);
    setNewVideoUrl('');
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (imageUrls.length >= 10) {
        toast.error('Maximum 10 images reached');
        break;
      }
      try {
        const res = await uploadMedia.mutateAsync(file);
        if (res.data?.url) {
          setImageUrls((prev) => [...prev, res.data.url]);
          toast.success(`Uploaded ${file.name}`);
        }
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadMedia.mutateAsync(file);
      if (res.data?.url) {
        setVideoUrl(res.data.url);
        toast.success(`Uploaded ${file.name}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload video');
    }
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
  };

  const savePostChanges = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and caption content are required');
      return null;
    }

    const finalImages = mediaType === 'image' ? imageUrls : [];
    const finalVideoUrl = mediaType === 'video' ? videoUrl.trim() : null;

    const res = await updatePost.mutateAsync({
      id: post.id,
      title: title.trim(),
      content: content.trim(),
      images: finalImages,
      videoUrl: finalVideoUrl,
    });
    return res.data.post;
  };

  const handleSaveOnly = async () => {
    try {
      await savePostChanges();
      toast.success('Post updated successfully');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post');
    }
  };

  const handleSaveAndPublish = async () => {
    try {
      const updated = await savePostChanges();
      if (!updated) return;

      toast.success('Post saved! Publishing now…');
      const connectionIds = targetConnectionId ? [targetConnectionId] : undefined;
      await publishPost.mutateAsync({ id: post.id, connectionIds });
      toast.success('Publish process started!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish post');
    }
  };

  const isSaving = updatePost.isPending || publishPost.isPending || uploadMedia.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Post & Attach Media</h2>
              <p className="text-xs text-slate-500">
                Add an image or video to satisfy Instagram requirements or update caption text
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Post Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Post Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Post Caption / Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Post Caption / Body
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {content.length} chars
              </span>
            </div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post body, captions, and hashtags…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans resize-y"
            />
          </div>

          {/* Media Attachment Selector */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Attach Media
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    mediaType === 'image'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Images
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    mediaType === 'video'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Video (Reel / Short)
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('none')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    mediaType === 'none'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Text Only
                </button>
              </div>
            </div>

            {/* TAB: IMAGES */}
            {mediaType === 'image' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <p className="text-xs text-slate-500">
                  Add 1 to 10 images. Supports direct file uploads or remote URLs. Required for Instagram feed posts.
                </p>

                {/* Upload or Add via URL */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="file"
                    ref={imageFileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadMedia.isPending}
                    onClick={() => imageFileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-colors shrink-0"
                  >
                    {uploadMedia.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        Upload from Device
                      </>
                    )}
                  </button>

                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Or paste image URL (https://…)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 text-xs border border-indigo-200/80 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Image Thumbnails Gallery */}
                {imageUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {imageUrls.map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-xs"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-white backdrop-blur-xs">
                          #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600 text-white shadow-xs opacity-90 hover:opacity-100 hover:scale-110 transition-all"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 text-center">
                    <p className="text-xs text-amber-800 font-medium">
                      No images attached yet. Add at least 1 image so this post can publish to Instagram.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: VIDEO */}
            {mediaType === 'video' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <p className="text-xs text-slate-500">
                  Attach an MP4 or WebM video. Publishes as an <strong>Instagram Reel</strong>, <strong>YouTube Short</strong>, or Facebook Video!
                </p>

                {/* Upload or Add via URL */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleVideoFileUpload}
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadMedia.isPending}
                    onClick={() => videoFileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-colors shrink-0"
                  >
                    {uploadMedia.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        Upload Video File
                      </>
                    )}
                  </button>

                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSetVideoUrl();
                        }
                      }}
                      placeholder="Or paste video URL (https://…mp4)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleSetVideoUrl}
                      className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 text-xs border border-indigo-200/80 transition-colors"
                    >
                      Set
                    </button>
                  </div>
                </div>

                {/* Video Player Preview */}
                {videoUrl ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden bg-black border border-slate-200">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full max-h-56 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setVideoUrl('')}
                        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-xs font-semibold hover:bg-red-700 shadow-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove Video
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Source: <span className="font-mono">{videoUrl}</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 text-center">
                    <p className="text-xs text-amber-800 font-medium">
                      No video attached yet. Upload an MP4 video or paste a video URL.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: TEXT ONLY */}
            {mediaType === 'none' && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Text-Only Mode
                </p>
                <p className="text-blue-900">
                  Text-only posts are natively supported on <strong>LinkedIn</strong>, <strong>Facebook Pages</strong>, and <strong>TTF Community</strong>. Note: Instagram does not accept text-only posts without an image or video.
                </p>
              </div>
            )}
          </div>

          {/* Platform Compatibility Indicator */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Platform Readiness:</span>
              {hasMedia ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Instagram Ready ({mediaType === 'video' ? 'Reel' : `${imageUrls.length} image${imageUrls.length === 1 ? '' : 's'}`})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Instagram requires media
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              LinkedIn & Community ready
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveOnly}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              {updatePost.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-slate-500" />
              )}
              Save Changes
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAndPublish}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {publishPost.isPending || updatePost.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Save & Publish Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
