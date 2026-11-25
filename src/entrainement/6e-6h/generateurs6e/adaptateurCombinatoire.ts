import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, EtapeCorrection, FragmentConsigne, GroupeVerdict, ProfilInstance, SectionExercice } from "../../export/genererFeuilleExercices";
import { latex, lettreEtape, texte } from "../../export/corrigeTableau";
import { donneesEnLigne } from "../ui6e/fragmentsCombinatoire";
import { insecables } from "../ui6e/corrigeCombinatoire";
import type { FormatCombinatoire } from "../ui6e/fragmentsCombinatoire";

/**
 * Adaptateur papier COMMUN des générateurs 6gen43–6gen48 (6e ch. 7, audit, lot E). Chaque
 * générateur décrit seulement son énoncé papier (situation en prose + consigne globale, parfois de
 * vraies questions a), b)), son corrigé « comme au tableau » (une lettre par écran, partagé avec
 * l'appli), son barème, ses critères de niveau et son profil ; le reste est commun :
 * - `construireEnonce` garde une question par ÉCRAN (`consigneEcran`, mêmes textes que l'appli) :
 *   ce sont les titres « Étape n — … » du corrigé, jamais imprimés dans l'énoncé ;
 * - `construireCorrection` : réponses attendues de chaque écran (corrigé court de secours) ;
 * - `enoncePapier` : la situation et la consigne globale, sans les sous-questions d'écran.
 */

export interface SpecPapierCombinatoire<E, P extends string> {
  titreDocument: string;
  nomFichierBase: string;
  genererInstance: () => E;
  catalogueVariantes: { id: string; label: string }[];
  genererInstanceAvecVariante: (id: string) => E;
  format: FormatCombinatoire<E, P>;
  phases: (e: E) => P[];
  /** Situation (avec sa question) en prose, formules en ligne : rien n'est coupé à l'impression. */
  situation: (e: E) => FragmentConsigne[];
  /** Consigne globale (une seule question papier) ou vraies questions distinctes, avec les lettres
   * des écrans qu'elles couvrent. */
  questions: (e: E) => { consigne: FragmentConsigne[]; etapes: string[] }[];
  reponseBreve: (e: E) => FragmentConsigne[];
  correction: (e: E) => EtapeCorrection[];
  bareme: (e: E) => BaremeExercice;
  criteres: (e: E) => CriteresDifficulte;
  profil: (e: E) => ProfilInstance;
  libelleCasParticulier?: string;
  calculatriceIndispensable?: boolean | string[];
  groupesVerdict?: GroupeVerdict[];
}

export function enoncePapierCombinatoire<E, P extends string>(format: FormatCombinatoire<E, P>, phases: (e: E) => P[]) {
  return (e: E): SectionExercice => ({
    enteteFragments: [...format.consigneGenerale(e), texte(" "), ...donneesEnLigne(format.donnees(e))],
    questions: phases(e).map((p) => ({ consigne: insecables(format.consigneEcran(e, p)) })),
  });
}

export function correctionPapierCombinatoire<E, P extends string>(format: FormatCombinatoire<E, P>, phases: (e: E) => P[]) {
  return (e: E): BlocCorrection[] =>
    phases(e).map((p, i) => ({
      type: "paragraphe",
      fragments: [texte(`Étape ${i + 1} : `), latex(format.reponseAttendue(e, p).join(" ;\\ "))],
    }));
}

/** Lettres des écrans d'une instance (« a », « b »…). */
export function lettresEcrans<E, P extends string>(phases: (e: E) => P[], e: E): string[] {
  return phases(e).map((_, i) => lettreEtape(i));
}

export function construireAdaptateurCombinatoire<E, P extends string>(spec: SpecPapierCombinatoire<E, P>): AdaptateurFeuilleExercices<E> {
  const reponseBreve = (e: E) => insecables(spec.reponseBreve(e));
  function enoncePapier(e: E): EnoncePapier {
    const qs = spec.questions(e);
    return {
      section: { enteteFragments: insecables(spec.situation(e)), questions: qs.map((q) => ({ consigne: insecables(q.consigne) })) },
      etapesParQuestion: qs.map((q) => q.etapes),
      reponseBreve: reponseBreve(e),
    };
  }
  function bareme(e: E): BaremeExercice {
    const b = spec.bareme(e);
    return {
      reponseFinale: insecables(b.reponseFinale),
      criteres: b.criteres.map((c) => ({ ...c, critere: insecables(c.critere) })),
      ...(b.erreursFrequentes ? { erreursFrequentes: b.erreursFrequentes.map((x) => ({ ...x, description: insecables(x.description) })) } : {}),
      ...(b.reponsesAcceptees ? { reponsesAcceptees: b.reponsesAcceptees.map(insecables) } : {}),
    };
  }
  return {
    titreDocument: spec.titreDocument,
    nomFichierBase: spec.nomFichierBase,
    genererInstance: spec.genererInstance,
    catalogueVariantes: spec.catalogueVariantes,
    genererInstanceAvecVariante: spec.genererInstanceAvecVariante,
    construireEnonce: enoncePapierCombinatoire(spec.format, spec.phases),
    construireCorrection: correctionPapierCombinatoire(spec.format, spec.phases),
    criteresDifficulte: spec.criteres,
    reponseBreve,
    correctionDetaillee: spec.correction,
    bareme,
    enoncePapier,
    profilInstance: spec.profil,
    ...(spec.libelleCasParticulier ? { libelleCasParticulier: spec.libelleCasParticulier } : {}),
    ...(spec.calculatriceIndispensable !== undefined ? { calculatriceIndispensable: spec.calculatriceIndispensable } : {}),
    ...(spec.groupesVerdict ? { groupesVerdict: spec.groupesVerdict } : {}),
  };
}
