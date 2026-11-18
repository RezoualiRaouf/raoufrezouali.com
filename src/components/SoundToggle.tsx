"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "./SoundProvider";

export default function SoundToggle() {
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      data-sound="none"
      aria-pressed={enabled}
      title={enabled ? "Turn sound off" : "Turn sound on"}
      className="flex size-9 items-center justify-center rounded-full text-current transition-colors hover:bg-white/15"
    >
      {enabled ? (
        <Volume2 aria-hidden="true" className="size-4" />
      ) : (
        <VolumeX aria-hidden="true" className="size-4" />
      )}
      <span className="sr-only">{enabled ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
