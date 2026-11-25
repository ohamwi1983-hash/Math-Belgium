import type { AdaptateurFeuilleExercices, BlocCorrection, GroupeVerdict, ProfilInstance, SectionExercice } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/corrigeTableau";
import { donneesEnLigne } from "../ui6e/fragmentsCombinatoire";
import type { FormatCombinatoire, FragmentConsigne } from "../ui6e/fragmentsCombinatoire";
import { insecables } from "../ui6e/corrigeCombinatoire";

/**
 * Adaptateur papier PROVISOIRE des générateurs 6gen49–6gen53 (6e ch. 8, lots B et C — la refonte des
 * feuilles et évaluations est le lot E). Il ne fait que reprendre les MÊMES textes que l'écran (format
 * commun du socle) : situation en prose avec KaTeX en ligne (plus de données coupées à l'impression,
 * audit P1), une question par écran (les titres « Étape n » du corrigé), réponse attendue de chaque
 * écran au corrigé, virgule décimale. Les écrans qui renvoient à une figure de l'appli (diagrammes à
 * comparer) peuvent être écartés du papier (`phasesPapier`).
 */

export interface SpecPapierProvisoire<E, P extends string> {
  titreDocument: string;
  nomFichierBase: string;
  genererInstance: () => E;
  catalogueVariantes: { id: string; label: string; retiree?: boolean }[];
  genererInstanceAvecVariante: (id: string) => E;
  format: FormatCombinatoire<E, P>;
  phases: (e: E) => P[];
  /** Écrans gardés sur papier (défaut : tous). */
  phasesPapier?: (e: E) => P[];
  /** Données imprimées (défaut : celles de l'écran). */
  donneesPapier?: (e: E) => FragmentConsigne[][];
  profilInstance?: (e: E) => ProfilInstance;
  calculatriceIndispensable?: boolean | string[];
  groupesVerdict?: GroupeVerdict[];
}

export function construireAdaptateurProvisoire<E, P extends string>(spec: SpecPapierProvisoire<E, P>): AdaptateurFeuilleExercices<E> {
  const phases = (e: E) => (spec.phasesPapier ?? spec.phases)(e);
  function construireEnonce(e: E): SectionExercice {
    const donnees = (spec.donneesPapier ?? spec.format.donnees)(e);
    return {
      enteteFragments: insecables([...spec.format.consigneGenerale(e), texte(" "), ...donneesEnLigne(donnees)]),
      questions: phases(e).map((p) => ({ consigne: insecables(spec.format.consigneEcran(e, p)) })),
    };
  }
  function construireCorrection(e: E): BlocCorrection[] {
    return phases(e).map((p, i) => ({
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
    ...(spec.profilInstance ? { profilInstance: spec.profilInstance } : {}),
    ...(spec.calculatriceIndispensable !== undefined ? { calculatriceIndispensable: spec.calculatriceIndispensable } : {}),
    ...(spec.groupesVerdict ? { groupesVerdict: spec.groupesVerdict } : {}),
  };
}
