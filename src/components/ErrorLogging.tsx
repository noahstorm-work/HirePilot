"use client";

import { useEffect } from "react";
import { setupClientErrorLogging } from "@/lib/error-service";

export function ErrorLogging() {
  useEffect(() => {
    setupClientErrorLogging();
  }, []);

  return null;
}