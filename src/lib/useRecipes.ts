"use client";

import { useEffect, useState } from "react";
import {
  INITIAL_RECIPES,
  RECIPES_UPDATED_EVENT,
  loadRecipes,
  type Recipe,
} from "@/lib/recipes";

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const refreshRecipes = () => {
      setRecipes(loadRecipes());
      setIsLoaded(true);
    };

    refreshRecipes();
    window.addEventListener(RECIPES_UPDATED_EVENT, refreshRecipes);
    window.addEventListener("storage", refreshRecipes);

    return () => {
      window.removeEventListener(RECIPES_UPDATED_EVENT, refreshRecipes);
      window.removeEventListener("storage", refreshRecipes);
    };
  }, []);

  return { recipes, isLoaded };
}