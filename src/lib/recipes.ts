export type RecipeCategory = "Entrée" | "Plat" | "Dessert" | "Soupe" | "Brunch";

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
};

export type Recipe = {
  id: string;
  title: string;
  category: RecipeCategory;
  servings: number;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
};

export type RecipeDraft = Omit<Recipe, "id" | "createdAt" | "updatedAt">;

const STORAGE_KEY = "notre-cuisine.recipes.v1";
export const RECIPES_UPDATED_EVENT = "notre-cuisine:recipes-updated";

const now = "2026-01-01T12:00:00.000Z";

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: "spaghetti-carbonara",
    title: "Spaghetti carbonara",
    category: "Plat",
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    ingredients: [
      { id: "carbonara-spaghetti", name: "Spaghetti", quantity: "400", unit: "g" },
      { id: "carbonara-guanciale", name: "Guanciale", quantity: "150", unit: "g" },
      { id: "carbonara-eggs", name: "Œufs", quantity: "4", unit: "unité" },
      { id: "carbonara-pecorino", name: "Pecorino", quantity: "80", unit: "g" },
    ],
    steps: [
      "Faire bouillir une grande casserole d’eau salée.",
      "Cuire les spaghetti selon le temps indiqué sur le paquet.",
      "Faire revenir le guanciale à feu moyen jusqu’à ce qu’il soit doré.",
      "Mélanger les œufs et le pecorino dans un bol.",
      "Mélanger les pâtes égouttées avec le guanciale, puis ajouter les œufs hors du feu.",
    ],
    tags: ["italien", "rapide"],
    photos: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "curry-thai-poulet",
    title: "Curry thaï au poulet",
    category: "Plat",
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    ingredients: [
      { id: "curry-chicken", name: "Poulet", quantity: "500", unit: "g" },
      { id: "curry-coconut", name: "Lait de coco", quantity: "400", unit: "ml" },
      { id: "curry-paste", name: "Pâte de curry rouge", quantity: "2", unit: "c. à soupe" },
      { id: "curry-rice", name: "Riz jasmin", quantity: "300", unit: "g" },
      { id: "curry-coriander", name: "Coriandre fraîche", quantity: "1", unit: "botte" },
    ],
    steps: [
      "Faire cuire le riz dans une casserole d’eau bouillante.",
      "Faire revenir la pâte de curry dans une sauteuse pendant une minute.",
      "Ajouter le poulet en morceaux et le faire dorer.",
      "Verser le lait de coco et laisser mijoter 15 minutes.",
      "Servir avec le riz et la coriandre fraîche.",
    ],
    tags: ["asiatique", "épicé"],
    photos: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "chili-con-carne",
    title: "Chili con carne",
    category: "Plat",
    servings: 6,
    prepTimeMinutes: 20,
    cookTimeMinutes: 45,
    ingredients: [
      { id: "chili-beef", name: "Bœuf haché", quantity: "600", unit: "g" },
      { id: "chili-beans", name: "Haricots rouges", quantity: "400", unit: "g" },
      { id: "chili-tomatoes", name: "Tomates concassées", quantity: "400", unit: "g" },
      { id: "chili-pepper", name: "Poivron rouge", quantity: "1", unit: "unité" },
      { id: "chili-cumin", name: "Cumin", quantity: "1", unit: "c. à café" },
    ],
    steps: [
      "Émincer l’oignon et couper le poivron en dés.",
      "Faire revenir le bœuf dans une cocotte avec un filet d’huile.",
      "Ajouter le poivron, les tomates et le cumin.",
      "Laisser mijoter 30 minutes à couvert.",
      "Ajouter les haricots égouttés et poursuivre la cuisson 10 minutes.",
    ],
    tags: ["convivial", "mijoté"],
    photos: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "risotto-champignons",
    title: "Risotto aux champignons",
    category: "Plat",
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    ingredients: [
      { id: "risotto-rice", name: "Riz arborio", quantity: "320", unit: "g" },
      { id: "risotto-mushrooms", name: "Champignons", quantity: "300", unit: "g" },
      { id: "risotto-stock", name: "Bouillon de légumes", quantity: "1", unit: "l" },
      { id: "risotto-parmesan", name: "Parmesan", quantity: "70", unit: "g" },
      { id: "risotto-shallot", name: "Échalote", quantity: "1", unit: "unité" },
    ],
    steps: [
      "Faire chauffer le bouillon dans une casserole.",
      "Faire revenir l’échalote ciselée et les champignons dans une sauteuse.",
      "Ajouter le riz et remuer jusqu’à ce qu’il devienne nacré.",
      "Verser le bouillon louche par louche en remuant, pendant environ 18 minutes.",
      "Incorporer le parmesan et laisser reposer deux minutes avant de servir.",
    ],
    tags: ["végétarien", "italien"],
    photos: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "saumon-au-four",
    title: "Saumon au four",
    category: "Plat",
    servings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    ingredients: [
      { id: "salmon-fillet", name: "Filets de saumon", quantity: "4", unit: "unité" },
      { id: "salmon-lemon", name: "Citron", quantity: "1", unit: "unité" },
      { id: "salmon-dill", name: "Aneth", quantity: "2", unit: "brins" },
      { id: "salmon-potatoes", name: "Pommes de terre", quantity: "600", unit: "g" },
    ],
    steps: [
      "Préchauffer le four à 190 °C.",
      "Déposer les filets dans un plat et ajouter le citron en rondelles.",
      "Assaisonner, parsemer d’aneth et enfourner 18 à 20 minutes.",
      "Servir avec les pommes de terre cuites à l’eau ou rôties.",
    ],
    tags: ["poisson", "facile"],
    photos: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tiramisu",
    title: "Tiramisu",
    category: "Dessert",
    servings: 6,
    prepTimeMinutes: 30,
    cookTimeMinutes: null,
    ingredients: [
      { id: "tiramisu-mascarpone", name: "Mascarpone", quantity: "250", unit: "g" },
      { id: "tiramisu-eggs", name: "Œufs", quantity: "3", unit: "unité" },
      { id: "tiramisu-sugar", name: "Sucre", quantity: "80", unit: "g" },
      { id: "tiramisu-biscuits", name: "Biscuits à la cuillère", quantity: "200", unit: "g" },
      { id: "tiramisu-coffee", name: "Café fort", quantity: "20", unit: "cl" },
      { id: "tiramisu-cocoa", name: "Cacao non sucré", quantity: "2", unit: "c. à soupe" },
    ],
    steps: [
      "Séparer les blancs des jaunes d’œufs.",
      "Fouetter les jaunes avec le sucre, puis incorporer le mascarpone.",
      "Monter les blancs en neige et les ajouter délicatement à la préparation.",
      "Tremper rapidement les biscuits dans le café et les disposer dans un plat.",
      "Recouvrir de crème, puis laisser reposer au frais au moins 4 heures.",
      "Saupoudrer de cacao juste avant de servir.",
    ],
    tags: ["italien", "à préparer à l’avance"],
    photos: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tarte-aux-pommes",
    title: "Tarte aux pommes",
    category: "Dessert",
    servings: 6,
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    ingredients: [
      { id: "tarte-pastry", name: "Pâte feuilletée", quantity: "1", unit: "rouleau" },
      { id: "tarte-apples", name: "Pommes", quantity: "4", unit: "unité" },
      { id: "tarte-butter", name: "Beurre", quantity: "20", unit: "g" },
      { id: "tarte-sugar", name: "Sucre", quantity: "30", unit: "g" },
    ],
    steps: [
      "Préchauffer le four à 180 °C.",
      "Dérouler la pâte dans un moule et piquer le fond avec une fourchette.",
      "Éplucher les pommes, les couper en fines lamelles et les disposer sur la pâte.",
      "Parsemer de sucre et de petits morceaux de beurre.",
      "Enfourner 35 minutes, jusqu’à ce que la tarte soit dorée.",
    ],
    tags: ["classique", "fruité"],
    photos: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "veloute-potimarron",
    title: "Velouté de potimarron",
    category: "Soupe",
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    ingredients: [
      { id: "soup-squash", name: "Potimarron", quantity: "800", unit: "g" },
      { id: "soup-onion", name: "Oignon", quantity: "1", unit: "unité" },
      { id: "soup-stock", name: "Bouillon de légumes", quantity: "750", unit: "ml" },
      { id: "soup-cream", name: "Crème fraîche", quantity: "10", unit: "cl" },
    ],
    steps: [
      "Épépiner le potimarron et le couper en cubes.",
      "Faire revenir l’oignon émincé dans une grande casserole.",
      "Ajouter le potimarron et le bouillon, puis cuire 25 minutes à couvert.",
      "Mixer jusqu’à obtenir une texture lisse et ajouter la crème.",
    ],
    tags: ["végétarien", "automne"],
    photos: [],
    createdAt: now,
    updatedAt: now,
  },
];

export function loadRecipes(): Recipe[] {
  if (typeof window === "undefined") return INITIAL_RECIPES;

  try {
    const savedRecipes = window.localStorage.getItem(STORAGE_KEY);
    if (!savedRecipes) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECIPES));
      return INITIAL_RECIPES;
    }

    const parsed: unknown = JSON.parse(savedRecipes);
    if (Array.isArray(parsed)) return parsed as Recipe[];
  } catch {
    return INITIAL_RECIPES;
  }

  return INITIAL_RECIPES;
}

export function saveRecipes(recipes: Recipe[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    window.dispatchEvent(new Event(RECIPES_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}