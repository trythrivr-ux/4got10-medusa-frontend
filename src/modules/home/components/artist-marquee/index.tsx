interface Artist {
  name: string
  featured?: boolean
}

interface ArtistMarqueeProps {
  artists: Artist[]
  maxVisible?: number
}

export default function ArtistMarquee({ artists, maxVisible = 15 }: ArtistMarqueeProps) {
  const visible = artists.slice(0, maxVisible)
  const remaining = artists.length - maxVisible

  return (
    <div className="flex flex-col items-center gap-y-[8px] px-4 py-3 font-[family-name:var(--font-jakarta)]">
      <div className="flex flex-row flex-wrap justify-center items-center gap-x-[8px] gap-y-[5px]">
        {visible.map((artist, i) => (
          <span key={i} className="flex items-center gap-x-[6px]">
            {i > 0 && (
              <span className="text-white/20 text-[12.5px]">/</span>
            )}
            <span
              className={`text-[12.5px] uppercase tracking-[0.5px] ${
                artist.featured
                  ? "text-white font-medium"
                  : "text-white/50 font-normal"
              }`}
            >
              {artist.name}
            </span>
          </span>
        ))}
      </div>
      {remaining > 0 && (
        <span className="border-[1.5px] mt-[10px] px-[8px] h-[23px] rounded-full border-[#ffffff45] flex items-center gap-x-[6px]">
          <span className="text-white/50 text-[12px] uppercase tracking-[0.5px] font-medium">
            {remaining}+
          </span>
        </span>
      )}
    </div>
  )
}
