import type { AdaptateurFeuilleExercices } from "../../export/genererFeuilleExercices";

/**
 * Adaptateur papier d'une copie enrichie 5e (6h) (chantier D) : l'adaptateur d'ORIGINE (copié de la
 * 5e (4h)) reste tel quel pour ses variantes — même tirage libre (`genererInstance`), mêmes indices de
 * catalogue, donc mêmes `?code=` —, les variantes AJOUTÉES vont EN FIN de catalogue et sont servies par
 * leur propre adaptateur. Chaque champ qui dépend de l'instance est aiguillé par `estNouvelle`.
 */
export function adaptateurMixte<A, N>(
  ancien: AdaptateurFeuilleExercices<A>,
  nouveau: AdaptateurFeuilleExercices<N>,
  estNouvelle: (x: A | N) => x is N,
): AdaptateurFeuilleExercices<A | N> {
  const idsNouveaux = new Set((nouveau.catalogueVariantes ?? []).map((v) => v.id));
  const choisir =
    <R,>(fa: ((x: A) => R) | undefined, fn: ((x: N) => R) | undefined) =>
    (x: A | N): R => {
      const f = estNouvelle(x) ? (fn as ((y: A | N) => R) | undefined) : (fa as ((y: A | N) => R) | undefined);
      if (!f) throw new Error("adaptateurMixte : champ absent pour cette instance");
      return f(x);
    };
  const facultatif = <R,>(fa: ((x: A) => R) | undefined, fn: ((x: N) => R) | undefined) => (fa || fn ? choisir(fa, fn) : undefined);
  const calcAncien = ancien.calculatriceIndispensable === true ? (ancien.catalogueVariantes ?? []).map((v) => v.id) : ancien.calculatriceIndispensable || [];
  const calcNouveau = nouveau.calculatriceIndispensable === true ? [...idsNouveaux] : nouveau.calculatriceIndispensable || [];
  const calculatriceIndispensable = [...calcAncien, ...calcNouveau];
  const besoinPhi = ancien.besoinTablePhi || nouveau.besoinTablePhi;
  return {
    ...(ancien as unknown as AdaptateurFeuilleExercices<A | N>),
    difficulte: undefined,
    genererInstance: ancien.genererInstance,
    catalogueVariantes: [...(ancien.catalogueVariantes ?? []), ...(nouveau.catalogueVariantes ?? [])],
    genererInstanceAvecVariante: (id: string) => (idsNouveaux.has(id) ? nouveau.genererInstanceAvecVariante!(id) : ancien.genererInstanceAvecVariante!(id)),
    construireEnonce: choisir(ancien.construireEnonce, nouveau.construireEnonce),
    construireCorrection: choisir(ancien.construireCorrection, nouveau.construireCorrection),
    criteresDifficulte: facultatif(ancien.criteresDifficulte, nouveau.criteresDifficulte),
    reponseBreve: facultatif(ancien.reponseBreve, nouveau.reponseBreve),
    correctionDetaillee: facultatif(ancien.correctionDetaillee, nouveau.correctionDetaillee),
    bareme: facultatif(ancien.bareme, nouveau.bareme),
    enoncePapier: facultatif(ancien.enoncePapier, nouveau.enoncePapier),
    profilInstance: ancien.profilInstance || nouveau.profilInstance ? (x) => (estNouvelle(x) ? (nouveau.profilInstance?.(x) ?? { casParticulier: null }) : (ancien.profilInstance?.(x) ?? { casParticulier: null })) : undefined,
    titrePapier: ancien.titrePapier || nouveau.titrePapier ? (x) => (estNouvelle(x) ? (nouveau.titrePapier?.(x) ?? null) : (ancien.titrePapier?.(x) ?? null)) : undefined,
    ...(calculatriceIndispensable.length > 0 ? { calculatriceIndispensable } : { calculatriceIndispensable: undefined }),
    ...(ancien.groupesVerdict || nouveau.groupesVerdict ? { groupesVerdict: [...(ancien.groupesVerdict ?? []), ...(nouveau.groupesVerdict ?? [])] } : {}),
    ...(besoinPhi ? { besoinTablePhi: (x: A | N) => { const b = estNouvelle(x) ? nouveau.besoinTablePhi : ancien.besoinTablePhi; return typeof b === "function" ? (b as (y: A | N) => boolean)(x) : !!b; } } : {}),
  };
}
