"use client";

import { formatViews } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Props {
  slug: string;
  initialCount: number;
}

export default function ViewCounter({ slug, initialCount }: Props) {
  return <span>{formatViews(initialCount)} views</span>;
}
