export function RecipePhoto({
  src,
  title,
  className = "",
}: {
  src?: string;
  title: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={src ? `Photo de ${title}` : `Photo à ajouter pour ${title}`}
      className={`relative flex items-center justify-center overflow-hidden bg-blue-light ${className}`}
      style={src ? { backgroundImage: `url("${src}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {!src && (
        <>
          <div className="absolute size-16 rounded-full border border-blue/15 sm:size-24" />
          <div className="absolute size-10 rounded-full border border-blue/15 sm:size-16" />
          <span className="relative rounded-sm bg-surface/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
            Photo à venir
          </span>
        </>
      )}
    </div>
  );
}