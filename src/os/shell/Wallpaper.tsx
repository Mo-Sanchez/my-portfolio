import { useState } from "react";
import { cx } from "../lib/util";
import { useOS } from "../state/os";
import { getWallpaper } from "../wallpapers";

// The previous wallpaper stays underneath while the new one fades in.
export default function Wallpaper() {
  const { settings } = useOS();
  const wallpaper = getWallpaper(settings.wallpaper);
  const [current, setCurrent] = useState(wallpaper.src);
  const [previous, setPrevious] = useState<string | null>(null);

  if (wallpaper.src !== current) {
    setPrevious(current);
    setCurrent(wallpaper.src);
  }

  return (
    <div className={cx("wallpaper", !wallpaper.photo && "isGenerated")} aria-hidden="true">
      {previous && <img className="wallpaperImg" src={previous} alt="" />}
      <img
        key={current}
        className={cx("wallpaperImg", previous && "isEntering")}
        src={current}
        alt=""
        decoding="async"
        fetchPriority="high"
        onAnimationEnd={() => setPrevious(null)}
      />
    </div>
  );
}
