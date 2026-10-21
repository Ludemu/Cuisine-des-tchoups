"use client";

import { useState, type FormEvent } from "react";
import { RecipeNavigation } from "@/components/RecipeNavigation";
import { useHousehold } from "@/lib/useHousehold";
import { saveHousehold, type GiftIdea, type GiftStatus } from "@/lib/household";

const statuses: GiftStatus[] = ["Idée", "À acheter", "Offert"];

export function GiftNotebook() {
  const { household, isLoaded } = useHousehold();
  const [personName, setPersonName] = useState("");
  const [message, setMessage] = useState("");

  const addPerson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = personName.trim();
    if (!name) return;
    if (saveHousehold({ ...household, giftPeople: [...household.giftPeople, { id: crypto.randomUUID(), name, ideas: [] }] })) {
      setPersonName("");
      setMessage(`${name} a été ajouté·e.`);
    } else setMessage("La personne n’a pas pu être enregistrée.");
  };

  const addIdea = (personId: string, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    const idea: GiftIdea = {
      id: crypto.randomUUID(),
      title,
      price: String(formData.get("price") ?? "").trim(),
      url: String(formData.get("url") ?? "").trim(),
      comment: String(formData.get("comment") ?? "").trim(),
      status: "Idée",
      createdAt: new Date().toISOString(),
    };
    const giftPeople = household.giftPeople.map((person) => person.id === personId ? { ...person, ideas: [idea, ...person.ideas] } : person);
    if (saveHousehold({ ...household, giftPeople })) {
      event.currentTarget.reset();
      setMessage("Idée cadeau ajoutée.");
    } else setMessage("L’idée n’a pas pu être enregistrée.");
  };

  const updateIdeaStatus = (personId: string, ideaId: string, status: GiftStatus) => {
    const giftPeople = household.giftPeople.map((person) => person.id === personId
      ? { ...person, ideas: person.ideas.map((idea) => idea.id === ideaId ? { ...idea, status } : idea) }
      : person);
    saveHousehold({ ...household, giftPeople });
  };

  const removeIdea = (personId: string, ideaId: string) => {
    const giftPeople = household.giftPeople.map((person) => person.id === personId
      ? { ...person, ideas: person.ideas.filter((idea) => idea.id !== ideaId) }
      : person);
    saveHousehold({ ...household, giftPeople });
  };

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto min-h-screen max-w-2xl px-4 pb-32 pt-8 sm:px-8 sm:pt-12">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">La cuisine des Tchoups</p>
          <h1 className="mt-3 font-editorial text-4xl sm:text-5xl">Cadeaux</h1>
          <p className="mt-2 text-sm text-muted">Les petites attentions à garder en tête.</p>
        </header>

        <form onSubmit={addPerson} className="flex gap-2 rounded-lg border border-border bg-white p-3">
          <label htmlFor="gift-person-name" className="sr-only">Nom de la personne</label>
          <input id="gift-person-name" required value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="Nom de la personne" className="min-h-12 min-w-0 flex-1 rounded-md border border-border px-3 text-base focus:border-blue focus:outline-none" />
          <button type="submit" className="min-h-12 shrink-0 rounded-md bg-blue px-4 text-sm font-semibold text-white hover:bg-primary">Ajouter</button>
        </form>
        {message && <p role="status" className="mt-3 text-sm text-muted">{message}</p>}

        {!isLoaded && <p className="mt-5 rounded-lg border border-border bg-white p-5 text-sm text-muted">Chargement des cadeaux…</p>}
        {isLoaded && household.giftPeople.length === 0 && (
          <div className="mt-5 rounded-lg border border-border bg-white px-5 py-9 text-center">
            <h2 className="font-editorial text-2xl">Votre carnet est vide</h2>
            <p className="mt-2 text-sm text-muted">Ajoutez une personne pour noter vos premières idées.</p>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {household.giftPeople.map((person) => (
            <section key={person.id} aria-labelledby={`person-${person.id}`} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 id={`person-${person.id}`} className="font-editorial text-2xl">{person.name}</h2>
                <span className="text-xs text-muted">{person.ideas.length} idée{person.ideas.length === 1 ? "" : "s"}</span>
              </div>

              <ul className="mt-2 divide-y divide-border">
                {person.ideas.map((idea) => (
                  <li key={idea.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{idea.title}</h3>
                        {idea.price && <p className="mt-1 text-sm text-muted">{idea.price}</p>}
                        {idea.comment && <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{idea.comment}</p>}
                        {idea.url && <a href={idea.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-10 items-center text-sm font-medium text-blue underline underline-offset-2">Ouvrir le lien</a>}
                      </div>
                      <button type="button" onClick={() => removeIdea(person.id, idea.id)} className="min-h-10 shrink-0 px-2 text-xs text-muted hover:text-blue" aria-label={`Supprimer l’idée ${idea.title}`}>Supprimer</button>
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-xs font-medium text-muted">
                      Statut
                      <select value={idea.status} onChange={(event) => updateIdeaStatus(person.id, idea.id, event.target.value as GiftStatus)} className="min-h-11 flex-1 rounded-md border border-border bg-white px-3 text-sm text-foreground focus:border-blue focus:outline-none">
                        {statuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>

              <details className="mt-2 border-t border-border pt-3">
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-blue">Ajouter une idée</summary>
                <form onSubmit={(event) => addIdea(person.id, event)} className="mt-2 space-y-2">
                  <label className="sr-only" htmlFor={`gift-title-${person.id}`}>Idée cadeau</label>
                  <input id={`gift-title-${person.id}`} name="title" required placeholder="Idée cadeau" className="min-h-12 w-full rounded-md border border-border px-3 text-base focus:border-blue focus:outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <label className="sr-only" htmlFor={`gift-price-${person.id}`}>Prix</label>
                    <input id={`gift-price-${person.id}`} name="price" inputMode="decimal" placeholder="Prix (facultatif)" className="min-h-12 min-w-0 rounded-md border border-border px-3 text-base focus:border-blue focus:outline-none" />
                    <label className="sr-only" htmlFor={`gift-url-${person.id}`}>Lien</label>
                    <input id={`gift-url-${person.id}`} name="url" type="url" placeholder="Lien (facultatif)" className="min-h-12 min-w-0 rounded-md border border-border px-3 text-base focus:border-blue focus:outline-none" />
                  </div>
                  <label className="sr-only" htmlFor={`gift-comment-${person.id}`}>Commentaire</label>
                  <textarea id={`gift-comment-${person.id}`} name="comment" rows={2} placeholder="Commentaire (facultatif)" className="w-full rounded-md border border-border p-3 text-base focus:border-blue focus:outline-none" />
                  <button type="submit" className="min-h-12 w-full rounded-md border border-blue text-sm font-semibold text-blue hover:bg-blue-light">Enregistrer l’idée</button>
                </form>
              </details>
            </section>
          ))}
        </div>
      </div>
      <RecipeNavigation />
    </main>
  );
}