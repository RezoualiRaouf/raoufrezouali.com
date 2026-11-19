import React, { lazy, Suspense } from "react";
import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

type IconName = keyof typeof dynamicIconImports;

const fallback = <div style={{ background: "#ddd", width: 24, height: 24 }} />;

// One lazy component per icon name, made once. Calling lazy() while rendering
// gives React a new component type on every render, so the icon would remount
// (and suspend again) each time its parent re-rendered.
const load = (name: IconName) => lazy(dynamicIconImports[name]);
const icons = new Map<IconName, ReturnType<typeof load>>();
function lazyIcon(name: IconName) {
  let icon = icons.get(name);
  if (!icon) {
    icon = load(name);
    icons.set(name, icon);
  }
  return icon;
}

interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = lazyIcon(name);

  return (
    <Suspense fallback={fallback}>
      {/* eslint-disable-next-line react-hooks/static-components -- lazyIcon returns the same cached component for a name on every render. */}
      <LucideIcon {...props} />
    </Suspense>
  );
};

export default Icon;
