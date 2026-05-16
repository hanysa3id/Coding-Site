type Props = { url: string; title?: string };

/**
 * Renders an embedded video player for YouTube, Vimeo, or a direct video file URL.
 * Falls back to a regular <video> tag.
 */
export function VideoEmbed({ url, title }: Props) {
  const youtube = extractYouTubeId(url);
  if (youtube) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtube}`}
        title={title ?? "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full aspect-video rounded-lg border"
      />
    );
  }

  const vimeo = extractVimeoId(url);
  if (vimeo) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeo}`}
        title={title ?? "Vimeo video"}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full h-full aspect-video rounded-lg border"
      />
    );
  }

  // Fallback: direct video file
  return (
    <video
      src={url}
      controls
      className="w-full h-full aspect-video rounded-lg border bg-black"
    />
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}
