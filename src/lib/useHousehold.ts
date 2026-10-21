"use client";

import { useEffect, useState } from "react";
import {
  EMPTY_HOUSEHOLD,
  HOUSEHOLD_UPDATED_EVENT,
  loadHousehold,
  type HouseholdState,
} from "@/lib/household";

export function useHousehold() {
  const [household, setHousehold] = useState<HouseholdState>(EMPTY_HOUSEHOLD);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setHousehold(loadHousehold());
      setIsLoaded(true);
    };

    refresh();
    window.addEventListener(HOUSEHOLD_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(HOUSEHOLD_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { household, isLoaded };
}