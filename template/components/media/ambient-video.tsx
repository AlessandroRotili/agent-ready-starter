"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
/** Decorative video only. For meaningful content use a controls/captions player. */
export function AmbientVideo({
  src,
  poster,
  width,
  height,
  eager = false,
}: {
  src: string;
  poster: string;
  width: number;
  height: number;
  eager?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection })
      .connection;
    let visible = false;
    const update = () =>
      setActive(
        visible &&
          !document.hidden &&
          !motion.matches &&
          !connection?.saveData &&
          !["slow-2g", "2g"].includes(connection?.effectiveType ?? ""),
      );
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.1 },
    );
    if (frame.current) observer.observe(frame.current);
    motion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const play = active && !failed && !paused;
  useEffect(() => {
    if (!play) return;
    let cancelled = false;
    const element = video.current;
    element?.play().catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; element?.pause(); };
  }, [play]);
  // Mutually exclusive rendering prevents a poster from covering a playing video.
  return (
    <div
      ref={frame}
      className="ambient-media"
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {play ? (
        <video
          ref={video}
          src={src}
          poster={poster}
          width={width}
          height={height}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onError={() => setFailed(true)}
        />
      ) : (
        <Image
          src={poster}
          alt=""
          width={width}
          height={height}
          sizes="(max-width: 720px) 100vw, 1100px"
          loading={eager ? "eager" : "lazy"}
        />
      )}
      {active && !failed ? (
        <button
          type="button"
          className="media-toggle"
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Riprendi animazione" : "Pausa animazione"}
        </button>
      ) : null}
    </div>
  );
}
