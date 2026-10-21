export type PlannedMeal = {
  id: string;
  recipeId: string;
  servings: number;
  plannedAt: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
  manual: boolean;
  aggregationKey?: string;
};

export type GiftStatus = "Idée" | "À acheter" | "Offert";

export type GiftIdea = {
  id: string;
  title: string;
  price: string;
  url: string;
  comment: string;
  status: GiftStatus;
  createdAt: string;
};

export type GiftPerson = {
  id: string;
  name: string;
  ideas: GiftIdea[];
};

export type HouseholdState = {
  plannedMeals: PlannedMeal[];
  shoppingItems: ShoppingItem[];
  giftPeople: GiftPerson[];
};

const STORAGE_KEY = "notre-cuisine.household.v1";
export const HOUSEHOLD_UPDATED_EVENT = "notre-cuisine:household-updated";

export const EMPTY_HOUSEHOLD: HouseholdState = {
  plannedMeals: [],
  shoppingItems: [],
  giftPeople: [],
};

export function loadHousehold(): HouseholdState {
  if (typeof window === "undefined") return EMPTY_HOUSEHOLD;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return EMPTY_HOUSEHOLD;
    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed === "object" && parsed !== null &&
      Array.isArray((parsed as HouseholdState).plannedMeals) &&
      Array.isArray((parsed as HouseholdState).shoppingItems) &&
      Array.isArray((parsed as HouseholdState).giftPeople)
    ) {
      return parsed as HouseholdState;
    }
  } catch {
    return EMPTY_HOUSEHOLD;
  }

  return EMPTY_HOUSEHOLD;
}

export function saveHousehold(state: HouseholdState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(HOUSEHOLD_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function removeShoppingItem(state: HouseholdState, itemId: string): HouseholdState {
  return {
    ...state,
    shoppingItems: state.shoppingItems.filter((item) => item.id !== itemId),
  };
}