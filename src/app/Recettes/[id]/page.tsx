import { RecipeDetail } from "@/components/RecipeDetail";

export const instant = false;

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecipeDetail recipeId={id} />;
}