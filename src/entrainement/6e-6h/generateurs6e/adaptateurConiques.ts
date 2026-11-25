import type { AdaptateurFeuilleExercices, EnoncePapier, GroupeVerdict, ProfilInstance } from "../../export/genererFeuilleExercices";
import { texte } from "../../export/corrigeTableau";
import type { FormatCombinatoire } from "../ui6e/fragmentsCombinatoire";
import { donneesEnLigne } from "../ui6e/fragmentsCombinatoire";
import { correctionPapierCombinatoire, enoncePapierCombinatoire } from "./adaptateurCombinatoire";

/**
 * Adaptateur papier PROVISOIRE des générateurs 6gen58–6gen63 (6e ch. 10, lots B et C — la refonte des
 * feuilles et évaluations est le lot E). Il reprend les MÊMES textes que l'écran (format commun du
 * socle) : situation en prose avec KaTeX en ligne (plus de données coupées à 680 px, audit P4) ;
 * `construireEnonce` garde une question par écran (titres « Étape n » du corrigé), mais l'énoncé
 * IMPRIMÉ (`enoncePapier`) n'a que la consigne et les données : le nombre d'étapes, qui dépend du
 * verdict (nature, nombre de points communs, de tangentes), ne doit pas le trahir sur papier. Réponse
 * rédigée de chaque écran au corrigé (plus de « voir bloc de travail », audit P1). Le lot E y ajoutera
 * le corrigé « comme au tableau » avec la figure de la conique (`ui6e/traceConiques.ts`, déjà partagée
 * avec l'écran), le barème, les niveaux et les profils.
 */
export interface SpecPapierConiques<E, P extends string> {
  titreDocument: string;
  nomFichierBase: string;
  genererInstance: () => E;
  catalogueVariantes: { id: string; label: string; retiree?: boolean }[];
  genererInstanceAvecVariante: (id: string) => E;
  format: FormatCombinatoire<E, P>;
  phases: (e: E) => P[];
  profilInstance?: (e: E) => ProfilInstance;
  groupesVerdict?: GroupeVerdict[];
}

export function construireAdaptateurConiques<E, P extends string>(spec: SpecPapierConiques<E, P>): AdaptateurFeuilleExercices<E> {
  const enoncePapier = (e: E): EnoncePapier => ({
    section: { enteteFragments: [...spec.format.consigneGenerale(e), texte(" "), ...donneesEnLigne(spec.format.donnees(e))], questions: [] },
  });
  return {
    titreDocument: spec.titreDocument,
    nomFichierBase: spec.nomFichierBase,
    genererInstance: spec.genererInstance,
    catalogueVariantes: spec.catalogueVariantes,
    genererInstanceAvecVariante: spec.genererInstanceAvecVariante,
    construireEnonce: enoncePapierCombinatoire(spec.format, spec.phases),
    construireCorrection: correctionPapierCombinatoire(spec.format, spec.phases),
    enoncePapier,
    profilInstance: spec.profilInstance ?? (() => ({ casParticulier: null })),
    ...(spec.groupesVerdict ? { groupesVerdict: spec.groupesVerdict } : {}),
  };
}
