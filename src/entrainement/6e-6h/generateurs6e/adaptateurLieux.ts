import type { AdaptateurFeuilleExercices, BlocCorrection, GroupeVerdict, ProfilInstance, SectionExercice } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/corrigeTableau";
import { donneesEnLigne } from "../ui6e/fragmentsCombinatoire";
import type { FormatCombinatoire } from "../ui6e/fragmentsCombinatoire";
import { insecables } from "../ui6e/corrigeCombinatoire";

/**
 * Adaptateur papier PROVISOIRE des générateurs 6gen54–6gen57 (6e ch. 9, lots B et C — la refonte des
 * feuilles et évaluations est le lot E). Il reprend les MÊMES textes que l'écran (format commun du
 * socle) : situation en prose avec KaTeX en ligne (plus de données ni de question coupées à
 * l'impression, audit P1), une question par écran (titres « Étape n » du corrigé), réponse attendue
 * de chaque écran au corrigé. Le lot E y ajoutera l'énoncé papier, le corrigé « comme au tableau »
 * avec la figure du lieu (`ui6e/figureLieux.ts`, déjà partagée avec l'écran), le barème et les niveaux.
 */
export interface SpecPapierLieux<E, P extends string> {
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

export function construireAdaptateurLieux<E, P extends string>(spec: SpecPapierLieux<E, P>): AdaptateurFeuilleExercices<E> {
  function construireEnonce(e: E): SectionExercice {
    return {
      enteteFragments: insecables([...spec.format.consigneGenerale(e), texte(" "), ...donneesEnLigne(spec.format.donnees(e))]),
      questions: spec.phases(e).map((p) => ({ consigne: insecables(spec.format.consigneEcran(e, p)) })),
    };
  }
  function construireCorrection(e: E): BlocCorrection[] {
    return spec.phases(e).map((p, i) => ({
      type: "paragraphe",
      fragments: [texte(`Étape ${i + 1} : `), latex(spec.format.reponseAttendue(e, p).join(" ;\\ "))],
    }));
  }
  return {
    titreDocument: spec.titreDocument,
    nomFichierBase: spec.nomFichierBase,
    genererInstance: spec.genererInstance,
    catalogueVariantes: spec.catalogueVariantes,
    genererInstanceAvecVariante: spec.genererInstanceAvecVariante,
    construireEnonce,
    construireCorrection,
    profilInstance: spec.profilInstance ?? (() => ({ casParticulier: null })),
    ...(spec.groupesVerdict ? { groupesVerdict: spec.groupesVerdict } : {}),
  };
}
