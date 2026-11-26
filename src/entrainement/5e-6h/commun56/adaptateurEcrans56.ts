import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../export/niveauDifficulte";
import { lettreEtape } from "../../export/corrigeTableau";
import type { DefinitionEcrans, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";

/**
 * Adaptateur papier d'une NOUVELLE variante 5e (6h) écrite sur le socle d'écrans (`DefinitionEcrans`,
 * chantier D) : toutes les valeurs viennent des MÊMES fonctions que l'écran (consignes, réponses,
 * corrigé « comme au tableau » = `def.correction`). Énoncé papier = données (`consigneGenerale`, figure
 * éventuelle) + UNE consigne globale sans méthode ; les écrans deviennent les « Étape n » du corrigé.
 */

export interface SpecPapier56<E, P extends string> {
  def: DefinitionEcrans<E, P>;
  titreDocument: string;
  nomFichierBase: string;
  catalogue: { id: string; label: string }[];
  genererLibre: () => E;
  genererVariante: (id: string) => E;
  /** Consigne globale du papier (forme « … », sans étapes de guidage). */
  consignePapier: (e: E) => Frag[];
  /** Données imprimées (défaut : `def.consigneGenerale`). */
  donneesPapier?: (e: E) => Frag[];
  figurePapier?: (e: E) => string | null;
  reponseBreve: (e: E) => Frag[];
  /** Poids par écran (somme ≈ 4) et libellé du critère. */
  critere: (e: E, phase: P) => { points: number; critere: Frag[] };
  erreursFrequentes: (e: E) => { description: Frag[]; cout: string }[];
  reponsesAcceptees?: (e: E) => Frag[][];
  /** Méthode, piège (seulement s'il est dans les données), nombres, écrans de pure lecture. */
  criteres: (e: E) => { methode: 0 | 1 | 2; piege: 0 | 1; nombres?: 0 | 1; lectures?: P[]; sansCharge?: boolean };
  profil: (e: E) => ProfilInstance;
  libelleCasParticulier?: string;
  calculatriceIndispensable?: boolean | string[];
}

const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];

export function adaptateurEcrans56<E, P extends string>(s: SpecPapier56<E, P>): AdaptateurFeuilleExercices<E> {
  const { def } = s;
  const donnees = (e: E) => fr(s.donneesPapier ? s.donneesPapier(e) : def.consigneGenerale(e));
  const figure = (e: E) => (s.figurePapier ? s.figurePapier(e) : null);
  function construireEnonce(e: E): SectionExercice {
    const fig = figure(e);
    return { enteteFragments: donnees(e), ...(fig ? { enteteHtml: fig } : {}), questions: def.phases(e).map((p) => ({ consigne: fr(def.consigne(e, p)) })) };
  }
  function enoncePapier(e: E): EnoncePapier {
    const fig = figure(e);
    return {
      section: { enteteFragments: donnees(e), ...(fig ? { enteteHtml: fig } : {}), questions: [{ consigne: fr(s.consignePapier(e)) }] },
      etapesParQuestion: [def.phases(e).map((_, i) => lettreEtape(i))],
      reponseBreve: fr(s.reponseBreve(e)),
    };
  }
  function construireCorrection(e: E): BlocCorrection[] {
    return [{ type: "paragraphe", fragments: fr(s.reponseBreve(e)) }];
  }
  function bareme(e: E): BaremeExercice {
    return {
      reponseFinale: fr(s.reponseBreve(e)),
      criteres: def.phases(e).map((p, i) => {
        const c = s.critere(e, p);
        return { sousQuestion: lettreEtape(i), critere: fr(c.critere), points: c.points };
      }),
      erreursFrequentes: s.erreursFrequentes(e).map((x) => ({ description: fr(x.description), cout: x.cout })),
      ...(s.reponsesAcceptees ? { reponsesAcceptees: s.reponsesAcceptees(e).map(fr) } : {}),
    };
  }
  function criteresDifficulte(e: E): CriteresDifficulte {
    const c = s.criteres(e);
    const ph = def.phases(e);
    const lectures = (c.lectures ?? []).map((p) => lettreEtape(ph.indexOf(p)));
    return { ...etapesDuCorrige(def.correction(e), lectures), methode: c.methode, piege: c.piege, ...(c.nombres !== undefined ? { nombres: c.nombres } : {}), ...(c.sansCharge ? { sansCharge: true } : {}) };
  }
  return {
    titreDocument: s.titreDocument,
    nomFichierBase: s.nomFichierBase,
    genererInstance: s.genererLibre,
    catalogueVariantes: s.catalogue,
    genererInstanceAvecVariante: s.genererVariante,
    construireEnonce,
    construireCorrection,
    criteresDifficulte,
    reponseBreve: (e) => fr(s.reponseBreve(e)),
    correctionDetaillee: (e) => def.correction(e),
    bareme,
    enoncePapier,
    profilInstance: s.profil,
    ...(s.libelleCasParticulier ? { libelleCasParticulier: s.libelleCasParticulier } : {}),
    ...(s.calculatriceIndispensable ? { calculatriceIndispensable: s.calculatriceIndispensable } : {}),
  };
}
