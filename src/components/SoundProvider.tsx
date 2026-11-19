"use client";

import { setSoundEnabled, sfx, unlockSound } from "@/lib/sound";
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "sound";

const SoundContext = createContext<{ enabled: boolean; toggle: () => void }>({
  enabled: true,
  toggle: () => {},
});

export const useSound = () => useContext(SoundContext);

// The visitor's choice, saved in localStorage. It is also kept in memory so
// the toggle still works for the visit when storage is blocked.
let soundOn: boolean | undefined;
const listeners = new Set<() => void>();

function readSoundOn(): boolean {
  if (soundOn === undefined) {
    try {
      soundOn = localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      soundOn = true; // Storage can be blocked; sound simply stays on.
    }
  }
  return soundOn;
}

function saveSoundOn(next: boolean) {
  soundOn = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    // Ignore storage errors.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Sound is on by default (visitors can mute it; the choice is remembered).
// Plays hover and click sounds for every link and button:
//   data-sound="none"   stays silent
//   data-sound="toggle" plays the light-switch click instead
export default function SoundProvider({ children }: { children: React.ReactNode }) {
  // On the server and during hydration sound counts as on, as before.
  const enabled = useSyncExternalStore(subscribe, readSoundOn, () => true);

  useEffect(() => {
    setSoundEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    // Browsers only start audio after a gesture, so unlock it on the first one.
    const unlock = () => {
      unlockSound();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = !readSoundOn();
    setSoundEnabled(next);
    if (next) sfx.on();
    saveSoundOn(next);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let lastTarget: Element | null = null;
    const interactive = (event: Event) => {
      const target = (event.target as Element | null)?.closest?.("a, button, [role='tab']");
      if (!target || target.closest("[data-sound='none']")) return null;
      return target;
    };
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = interactive(event);
      if (target && target !== lastTarget) sfx.tick();
      lastTarget = target;
    };
    const onClick = (event: MouseEvent) => {
      const target = interactive(event);
      if (!target) return;
      if (target.closest("[data-sound='toggle']")) sfx.toggle();
      else sfx.click();
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick);
    };
  }, [enabled]);

  return <SoundContext.Provider value={{ enabled, toggle }}>{children}</SoundContext.Provider>;
}
