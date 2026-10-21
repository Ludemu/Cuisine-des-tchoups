import { RecipeEditor } from "@/components/RecipeEditor";

export const instant = false;

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecipeEditor recipeId={id} />;
}