import React from 'react';

interface FavoriteStarProps { on: boolean; onToggle(): void; size?: number; label?: string; }

function FavoriteStarInner({ on, onToggle, size = 22, label }: FavoriteStarProps) {
  const handleKey: React.KeyboardEventHandler<HTMLSpanElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onToggle(); }
  };
  return (
    <span
      role="button"
      tabIndex={0}
      className="psy-rail__favBtn"
      aria-pressed={on}
      aria-label={label || (on ? 'Remove favorite' : 'Add favorite')}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      onKeyDown={handleKey}
      style={{ width: size, height: size }}
      data-testid="favorite-star"
    >{on ? '★' : '☆'}</span>
  );
}


const FavoriteStarMemo = React.memo(FavoriteStarInner);
FavoriteStarMemo.displayName = 'FavoriteStar';


if (process.env.NODE_ENV !== 'production') {

  console.log('[FavoriteStar] export types', {
    innerType: typeof FavoriteStarInner,
    memoType: typeof (FavoriteStarMemo as unknown),

    hasMemoSymbol: Boolean((FavoriteStarMemo as unknown as { $$typeof?: unknown })?.$$typeof),
  });
}


export function FavoriteStar(props: FavoriteStarProps) {
  return <FavoriteStarMemo {...props} />;
}
FavoriteStar.displayName = 'FavoriteStar';


export default FavoriteStar;
