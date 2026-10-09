import type { Enonce, Exercice } from "../../core/generateur.types";
import type {
  ExerciceInequationRationnelle,
  NiveauInequationRationnelle,
  ReglagesInequationRationnelle,
  ValeurCelluleQuotient,
} from "../../core/inequationRationnelle.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../../core/simplification.types";
import type { SolutionEnsembleProduit } from "../../core/signesProduit.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice, ZoneReponse } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFacteurRacine, formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "../../ui/formatEquation";
import {
  formatEnonceCombineDenominateurCarreLatex,
  formatEnonceCombineNiveau3Latex,
  formatEnonceCombineNiveau4Latex,
  formatEnonceCombineSansFacteurCommunLatex,
  formatEnonceInequationRationnelleLatex,
  formatEnonceOriginalComplet,
  formatExpressionIsoleeDenominateurCarreLatex,
  formatExpressionIsoleeLatex,
  formatExpressionIsoleeNiveau3Latex,
  formatExpressionIsoleeNiveau4Latex,
  formatExpressionIsoleeSansFacteurCommunLatex,
} from "../../ui/formatInequationRationnelle";
import { SYMBOLE_LATEX } from "../../ui/formatInequation";
import { formatLineaireDeveloppe } from "../../ui/formatSignesProduit";
import { formatFractionSimplifiee } from "../../ui/formatSimplification";
import { formatSolutionEnsembleProduit } from "../../ui/formatSolutionEnsembleProduit";
import { libelleCategorie } from "../../ui/categorieLabels";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurInequationRationnelle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequationRationnelle>` pour gen6 (Inéquations
 * rationnelles) — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de
 * référence.
 *
 * Ce générateur a 8 niveaux/variantes (`NiveauInequationRationnelle`) aux formes très différentes
 * (`core/inequationRationnelle.types.ts`) et un nombre de questions sur écran qui varie avec le
 * niveau (`moteur/sessionInequationRationnelle.ts::phaseInitiale` et les transitions de phase) :
 * jamais un seul jeu de questions valable pour toutes les instances — donc PAS de `regroupable`
 * (qui exige une consigne générique unique, un seul cas ici : aucun niveau n'a une consigne
 * indépendante de l'instance ET une seule question). Plutôt que de transcrire une par une les ~15
 * phases internes possibles (isoler/combiner/ce/racineNumerateur/denomReduction/
 * denomReconnaissance/denomChamp1/[denomFactorisation]/miseEnEvidence/reduction/reconnaissance/
 * champ1/champ2/[factorisation]/simplifierDenomXxx/simplifierNumXxx/simplifierFraction/grille/
 * intervalle), ce fichier les regroupe en 4 à 5 questions "papier" par niveau, chacune couvrant un
 * livrable conceptuel complet (ex. "factorise et donne les racines" plutôt que
 * reconnaissance+champ1+champ2+factorisation séparément) — même niveau de granularité que
 * `analyseFonction/exportWord.ts`. `construireEtapes` ci-dessous fixe, pour chaque niveau, l'ordre
 * EXACT des questions/livrables réellement demandés à l'écran (vérifié contre `phaseInitiale` et
 * les `phase:` de chaque `soumettreReponseXxx`), jamais un ordre inventé.
 *
 * Correction RESYNTHÉTISÉE depuis les champs déjà calculés de l'instance (`exercice.grille`,
 * `exercice.solution`, `exercice.racines`, `exercice.numerateur.solution`...), jamais recalculée
 * indépendamment — même principe que le reste du pipeline (voir tête de fichier de
 * `analyseFonction/exportWord.ts`). Les libellés de lignes du tableau de signes correspondent
 * exactement à ceux affichés à l'écran une fois la racine correspondante confirmée par l'élève
 * (`EtapeGrilleQuotient*.tsx`, ex. "N : x - 4") — jamais une fuite : cette information est déjà
 * demandée dans une question papier précédente (facto+racines), le tableau de signes réutilise
 * simplement ce résultat comme le fait le récapitulatif persistant à l'écran.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function paireTriee(v: [number, number]): [number, number] {
  return [...v].sort((a, b) => a - b) as [number, number];
}

/** `fraction.denominateur`/`.numerateur` sont toujours des P2 pour le type "P2/P2" (seul type utilisé par facteurCommun). */
function commeP2(poly: Exercice | PolynomeLineaire, contexte: string): Exercice {
  if (!("categorie" in poly)) throw new Error(`commeP2 : ${contexte} — attendu un polynôme du 2nd degré (P2)`);
  return poly;
}

/**
 * Forme factorisée de référence d'un P2 (numérateur combiné, dénominateur d'une variante, facteur
 * d'une fraction à simplifier...) — `solution.formeFactorisee` quand elle existe (catégories
 * autres que cas_general), sinon reconstruite depuis les racines déjà connues (cas_general), même
 * principe que `entreeFactorisation` (`ui/recapitulatifInequationRationnelle.ts`).
 */
function formeFactoriseeDeP2(p2: Exercice): string {
  if (p2.categorie === "cas_general" || p2.categorie === "irreductible") {
    return formatFormeFactoriseeDepuisRacines(p2.enonce, p2.solution.racines);
  }
  return p2.solution.formeFactorisee ?? formatFormeFactoriseeDepuisRacines(p2.enonce, p2.solution.racines);
}

function labelLineaire(prefixe: string, poly: PolynomeLineaire): string {
  return `${prefixe} : ${formatLineaireDeveloppe(poly.k, poly.p)}`;
}

function labelMonique(prefixe: string, racine: number): string {
  return `${prefixe} : ${formatLineaireDeveloppe(1, racine)}`;
}

/** "D : (x-p)^2" ou "D : x^2" — jamais développé, même convention que `formatLigneDenominateurCarreLabel`. */
function labelDenominateurCarre(poly: PolynomeLineaire): string {
  const lineaire = formatLineaireDeveloppe(poly.k, poly.p);
  return `D : ${poly.p === 0 ? `${lineaire}^2` : `(${lineaire})^2`}`;
}

interface LigneGrille {
  label: string;
  valeurs: ValeurCelluleQuotient[];
}

/**
 * Lignes du tableau de signes (labels + valeurs déjà connues), une par facteur puis la ligne
 * "Signe du quotient" — même ordre que les composants `EtapeGrilleQuotient*.tsx` correspondants
 * (vérifié contre chacun d'eux), jamais un ordre reconstruit indépendamment.
 */
function lignesGrille(exercice: ExerciceInequationRationnelle): LigneGrille[] {
  switch (exercice.niveau) {
    case "niveau1":
    case "niveau2":
      return [
        { label: labelLineaire("N", exercice.numerateur), valeurs: exercice.grille.ligneNumerateur },
        { label: labelLineaire("D", exercice.denominateur), valeurs: exercice.grille.ligneDenominateur },
        { label: "Signe du quotient", valeurs: exercice.grille.ligneQuotient },
      ];
    case "niveau3": {
      const [r1, r2] = paireTriee(exercice.numerateur.solution.racines);
      const lignes: LigneGrille[] = [];
      if (exercice.grille.ligneCoefficient) {
        lignes.push({ label: String(exercice.numerateur.enonce.a), valeurs: exercice.grille.ligneCoefficient });
      }
      lignes.push(
        { label: labelMonique("N", r1), valeurs: exercice.grille.lignesNumerateur[0] },
        { label: labelMonique("N", r2), valeurs: exercice.grille.lignesNumerateur[1] },
        { label: labelLineaire("D", exercice.denominateur), valeurs: exercice.grille.ligneDenominateur },
        { label: "Signe du quotient", valeurs: exercice.grille.ligneQuotient },
      );
      return lignes;
    }
    case "denominateurCarre": {
      const [r1, r2] = paireTriee(exercice.numerateur.solution.racines);
      const lignes: LigneGrille[] = [];
      if (exercice.grille.ligneCoefficient) {
        lignes.push({ label: String(exercice.numerateur.enonce.a), valeurs: exercice.grille.ligneCoefficient });
      }
      lignes.push(
        { label: labelMonique("N", r1), valeurs: exercice.grille.lignesNumerateur[0] },
        { label: labelMonique("N", r2), valeurs: exercice.grille.lignesNumerateur[1] },
        { label: labelDenominateurCarre(exercice.denominateur), valeurs: exercice.grille.ligneDenominateur },
        { label: "Signe du quotient", valeurs: exercice.grille.ligneQuotient },
      );
      return lignes;
    }
    case "niveau4": {
      const [n1, n2] = paireTriee(exercice.numerateur.solution.racines);
      return [
        { label: labelMonique("N", n1), valeurs: exercice.grille.lignesNumerateur[0] },
        { label: labelMonique("N", n2), valeurs: exercice.grille.lignesNumerateur[1] },
        { label: labelLineaire("D", exercice.denominateurGauche), valeurs: exercice.grille.lignesDenominateur[0] },
        { label: labelLineaire("D", exercice.denominateurDroit), valeurs: exercice.grille.lignesDenominateur[1] },
        { label: "Signe du quotient", valeurs: exercice.grille.ligneQuotient },
      ];
    }
    case "sansFacteurCommun": {
      const [n1, n2] = paireTriee(exercice.numerateur.solution.racines);
      const [d1, d2] = paireTriee(exercice.denominateur.solution.racines);
      return [
        { label: labelMonique("N", n1), valeurs: exercice.grille.lignesNumerateur[0] },
        { label: labelMonique("N", n2), valeurs: exercice.grille.lignesNumerateur[1] },
        { label: labelMonique("D", d1), valeurs: exercice.grille.lignesDenominateur[0] },
        { label: labelMonique("D", d2), valeurs: exercice.grille.lignesDenominateur[1] },
        { label: "Signe du quotient", valeurs: exercice.grille.ligneQuotient },
      ];
    }
    case "facteurCommun":
      return [
        { label: labelLineaire("N", exercice.numerateurSimplifie), valeurs: exercice.grille.ligneNumerateur },
        { label: labelLineaire("D", exercice.denominateurSimplifie), valeurs: exercice.grille.ligneDenominateur },
        { label: "Signe du quotient", valeurs: exercice.grille.ligneQuotient },
      ];
    case "cubique": {
      const [q1, q2] = paireTriee(exercice.numerateur.solution.racines);
      return [
        { label: "N : x", valeurs: exercice.grille.lignesNumerateur[0] },
        { label: labelMonique("N", q1), valeurs: exercice.grille.lignesNumerateur[1] },
        { label: labelMonique("N", q2), valeurs: exercice.grille.lignesNumerateur[2] },
        { label: labelLineaire("D", exercice.denominateur), valeurs: exercice.grille.ligneDenominateur },
        { label: "Signe du quotient", valeurs: exercice.grille.ligneQuotient },
      ];
    }
  }
}

/** Une question "papier" (lettrée a)/b)/c)...) et son bloc de correction associé. */
interface EtapePapier {
  consigne: FragmentConsigne[];
  reponse?: ZoneReponse;
  correction: BlocCorrection[];
}

function etapeIsolerCombiner(isolee: string, combinee: string, symbole: string): EtapePapier {
  return {
    consigne: [
      texte('Isole le membre de droite (ramène l\'inéquation à la forme « … '),
      latex(symbole),
      texte(' 0 »), puis combine les deux fractions obtenues en une seule fraction irréductible.'),
    ],
    reponse: { type: "lignes", nombre: 3 },
    correction: [
      {
        type: "paragraphe",
        fragments: [
          texte("On isole le membre de droite : "),
          latex(isolee),
          texte(" On combine ensuite les deux fractions en une seule : "),
          latex(combinee),
          texte("."),
        ],
      },
    ],
  };
}

function etapeCE(ce: number): EtapePapier {
  return {
    consigne: [texte("Détermine la condition d'existence (CE) de cette expression.")],
    reponse: { type: "lignes", nombre: 1 },
    correction: [
      {
        type: "paragraphe",
        fragments: [
          texte("Le dénominateur s'annule en "),
          latex(`x = ${formatNombre(ce)}`),
          texte(", donc la condition d'existence est "),
          latex(`x \\neq ${formatNombre(ce)}`),
          texte("."),
        ],
      },
    ],
  };
}

function etapeCEListe(ce: [number, number]): EtapePapier {
  const [v1, v2] = paireTriee(ce);
  return {
    consigne: [texte("Détermine les deux conditions d'existence (CE) de cette expression.")],
    reponse: { type: "lignes", nombre: 2 },
    correction: [
      {
        type: "paragraphe",
        fragments: [
          texte("Le dénominateur s'annule en "),
          latex(`x = ${formatNombre(v1)}`),
          texte(" et en "),
          latex(`x = ${formatNombre(v2)}`),
          texte(", donc les conditions d'existence sont "),
          latex(`x \\neq ${formatNombre(v1)} \\text{ et } x \\neq ${formatNombre(v2)}`),
          texte("."),
        ],
      },
    ],
  };
}

function etapeRacineNumerateur(racine: number): EtapePapier {
  return {
    consigne: [texte("Détermine la racine du numérateur.")],
    reponse: { type: "lignes", nombre: 1 },
    correction: [{ type: "paragraphe", fragments: [texte(`Le numérateur s'annule en x = ${formatNombre(racine)}.`)] }],
  };
}

function etapeFactorRacinesP2(p2: Exercice, nomPoly: string): EtapePapier {
  const [r1, r2] = paireTriee(p2.solution.racines);
  const racineDouble = r1 === r2;
  const forme = formeFactoriseeDeP2(p2);
  return {
    consigne: [
      texte(`Factorise le ${nomPoly} (mise en évidence, binôme conjugué, produit remarquable, ou formule générale) et donne ses racines.`),
    ],
    reponse: { type: "lignes", nombre: 2 },
    correction: [
      {
        type: "paragraphe",
        fragments: [
          texte(`Méthode : ${libelleCategorie(p2.categorie)}. `),
          latex(`${forme} = 0`),
          texte(
            racineDouble
              ? ` — racine double x = ${formatNombre(r1)}.`
              : ` — racines x = ${formatNombre(r1)} et x = ${formatNombre(r2)}.`,
          ),
        ],
      },
    ],
  };
}

function etapeMiseEnEvidence(quadratique: Enonce): EtapePapier {
  return {
    consigne: [
      texte("Mets "),
      latex("x"),
      texte(" en évidence dans le numérateur "),
      latex("N(x)"),
      texte(" (écris-le sous la forme "),
      latex("x \\cdot (\\ldots)"),
      texte(")."),
    ],
    reponse: { type: "lignes", nombre: 1 },
    correction: [
      {
        type: "paragraphe",
        fragments: [texte("On met x en évidence : "), latex(`N(x) = x(${formatMembreGauche(quadratique)})`), texte(".")],
      },
    ],
  };
}

function etapeFactorDenomCE(denominateur: Exercice, ce: [number, number]): EtapePapier {
  const [d1, d2] = paireTriee(ce);
  const forme = formeFactoriseeDeP2(denominateur);
  return {
    consigne: [
      texte("Factorise le dénominateur "),
      latex("D(x)"),
      texte(" et donne les valeurs interdites (conditions d'existence) qui en découlent."),
    ],
    reponse: { type: "lignes", nombre: 2 },
    correction: [
      {
        type: "paragraphe",
        fragments: [
          texte(`Méthode : ${libelleCategorie(denominateur.categorie)}. `),
          latex(`${forme} = 0`),
          texte(` — racines x = ${formatNombre(d1)} et x = ${formatNombre(d2)}, donc `),
          latex(`x \\neq ${formatNombre(d1)} \\text{ et } x \\neq ${formatNombre(d2)}`),
          texte("."),
        ],
      },
    ],
  };
}

function etapeSimplifierFraction(fraction: ExerciceSimplification): EtapePapier {
  const N = commeP2(fraction.numerateur, "numérateur");
  const D = commeP2(fraction.denominateur, "dénominateur");
  return {
    consigne: [texte("Factorise le numérateur et le dénominateur, simplifie le facteur commun, puis écris la fraction simplifiée.")],
    reponse: { type: "lignes", nombre: 3 },
    correction: [
      {
        type: "paragraphe",
        fragments: [
          texte(`Numérateur — méthode : ${libelleCategorie(N.categorie)}. `),
          latex(`N(x) = ${formeFactoriseeDeP2(N)}`),
          texte(`. Dénominateur — méthode : ${libelleCategorie(D.categorie)}. `),
          latex(`D(x) = ${formeFactoriseeDeP2(D)}`),
          texte(". Le facteur commun "),
          latex(`(${formatFacteurRacine(fraction.racineCommune)})`),
          texte(" se simplifie, d'où la fraction réduite "),
          latex(formatFractionSimplifiee(fraction)),
          texte("."),
        ],
      },
    ],
  };
}

function etapeGrille(exercice: ExerciceInequationRationnelle): EtapePapier {
  const lignes = lignesGrille(exercice);
  const nombreColonnes = exercice.racines.length * 2 + 1;
  const libellesLignes = lignes.map((l) => l.label);
  const valeursParLigne = lignes.map((l) => [...l.valeurs]);
  return {
    consigne: [texte("Complète le tableau de signes de l'expression combinée.")],
    reponse: { type: "tableau", libellesLignes, nombreColonnes },
    correction: [
      { type: "paragraphe", fragments: [texte("Tableau de signes :")] },
      { type: "tableau", libellesLignes, valeursParLigne },
    ],
  };
}

function etapeIntervalle(solution: SolutionEnsembleProduit): EtapePapier {
  return {
    consigne: [texte("Donne l'ensemble des solutions de l'inéquation, sous forme d'intervalle(s).")],
    reponse: { type: "lignes", nombre: 2 },
    correction: [{ type: "paragraphe", fragments: [texte(`Ensemble des solutions : S = ${formatSolutionEnsembleProduit(solution)}.`)] }],
  };
}

/**
 * Étapes "papier" dans l'ordre EXACT des phases réellement traversées à l'écran pour ce niveau
 * (voir `moteur/sessionInequationRationnelle.ts::phaseInitiale` et les `phase:` de chaque
 * `soumettreReponseXxx`) — chaque étape peut regrouper plusieurs phases écran étroitement liées
 * (reconnaissance+champ1+champ2+[factorisation] → une seule question "factorise et donne les
 * racines", voir tête de fichier).
 */
function construireEtapes(exercice: ExerciceInequationRationnelle): EtapePapier[] {
  switch (exercice.niveau) {
    case "niveau1":
      return [etapeCE(exercice.ce), etapeRacineNumerateur(exercice.numerateur.p), etapeGrille(exercice), etapeIntervalle(exercice.solution)];
    case "niveau2": {
      const isolee = formatExpressionIsoleeLatex(exercice);
      const combinee = formatEnonceInequationRationnelleLatex(exercice);
      return [
        etapeIsolerCombiner(isolee, combinee, SYMBOLE_LATEX[exercice.symbole]),
        etapeCE(exercice.ce),
        etapeRacineNumerateur(exercice.numerateur.p),
        etapeGrille(exercice),
        etapeIntervalle(exercice.solution),
      ];
    }
    case "niveau3": {
      const isolee = formatExpressionIsoleeNiveau3Latex(exercice);
      const combinee = formatEnonceCombineNiveau3Latex(exercice);
      return [
        etapeIsolerCombiner(isolee, combinee, SYMBOLE_LATEX[exercice.symbole]),
        etapeCE(exercice.ce),
        etapeFactorRacinesP2(exercice.numerateur, "numérateur combiné"),
        etapeGrille(exercice),
        etapeIntervalle(exercice.solution),
      ];
    }
    case "niveau4": {
      const isolee = formatExpressionIsoleeNiveau4Latex(exercice);
      const combinee = formatEnonceCombineNiveau4Latex(exercice);
      return [
        etapeIsolerCombiner(isolee, combinee, SYMBOLE_LATEX[exercice.symbole]),
        etapeCEListe(exercice.ce),
        etapeFactorRacinesP2(exercice.numerateur, "numérateur combiné"),
        etapeGrille(exercice),
        etapeIntervalle(exercice.solution),
      ];
    }
    case "denominateurCarre": {
      const isolee = formatExpressionIsoleeDenominateurCarreLatex(exercice);
      const combinee = formatEnonceCombineDenominateurCarreLatex(exercice);
      return [
        etapeIsolerCombiner(isolee, combinee, SYMBOLE_LATEX[exercice.symbole]),
        etapeCE(exercice.ce),
        etapeFactorRacinesP2(exercice.numerateur, "numérateur combiné"),
        etapeGrille(exercice),
        etapeIntervalle(exercice.solution),
      ];
    }
    case "sansFacteurCommun": {
      const isolee = formatExpressionIsoleeSansFacteurCommunLatex(exercice);
      const combinee = formatEnonceCombineSansFacteurCommunLatex(exercice);
      return [
        etapeIsolerCombiner(isolee, combinee, SYMBOLE_LATEX[exercice.symbole]),
        etapeFactorDenomCE(exercice.denominateur, exercice.ce),
        etapeFactorRacinesP2(exercice.numerateur, "numérateur combiné"),
        etapeGrille(exercice),
        etapeIntervalle(exercice.solution),
      ];
    }
    case "cubique":
      return [
        etapeCE(exercice.ce),
        etapeMiseEnEvidence(exercice.numerateur.enonce),
        etapeFactorRacinesP2(exercice.numerateur, "facteur du second degré restant"),
        etapeGrille(exercice),
        etapeIntervalle(exercice.solution),
      ];
    case "facteurCommun":
      return [etapeCEListe(exercice.ce), etapeSimplifierFraction(exercice.fraction), etapeGrille(exercice), etapeIntervalle(exercice.solution)];
  }
}

/** Nombre de lignes laissées à l'élève — assez généreux pour une résolution rédigée complète. */
function nombreLignesReponse(nombreEtapes: number): number {
  return Math.max(12, nombreEtapes * 3 + 2);
}

/**
 * Concatène les blocs de correction de chaque étape, dans l'ordre — jamais de lettre a)/b)/c)...
 * comme avant : chaque étape est déjà rédigée comme une phrase complète et justifiée (voir les
 * `etapeXxx` ci-dessus), donc les enchaîner directement forme une résolution continue, comme un
 * manuel scolaire le ferait, plutôt qu'une suite de réponses brèves à des questions fermées
 * séparées.
 */
function assemblerCorrection(etapes: EtapePapier[]): BlocCorrection[] {
  return etapes.flatMap((etape) => etape.correction);
}

function construireEnonceInequationRationnelle(exercice: ExerciceInequationRationnelle): SectionExercice {
  const nombreEtapes = construireEtapes(exercice).length;
  return {
    enteteFragments: [
      texte("Résous dans "),
      latex("\\mathbb{R}"),
      texte(". Indique et justifie toutes les étapes de ta démarche : "),
      latex(formatEnonceOriginalComplet(exercice)),
    ],
    questions: [
      {
        consigne: [texte("Développe ici ta résolution complète, étape par étape.")],
        reponse: { type: "lignes", nombre: nombreLignesReponse(nombreEtapes) },
      },
    ],
  };
}

function construireCorrectionInequationRationnelle(exercice: ExerciceInequationRationnelle): BlocCorrection[] {
  return assemblerCorrection(construireEtapes(exercice));
}

/**
 * Réglages par défaut de la fabrique (Couche A) — reprend exactement `REGLAGES_NIVEAU` de
 * `AppInequationRationnelle.tsx` (tous les niveaux actifs, répartition équilibrée) : la feuille
 * d'évaluation doit pouvoir produire n'importe lequel des 8 niveaux/variantes, comme l'écran
 * interactif par défaut. `genererInstance` capture cette fabrique une seule fois au chargement du
 * module (jamais recréée à chaque appel), conformément au contrat zéro-argument de
 * `AdaptateurFeuilleExercices.genererInstance`.
 */
const REGLAGES_PAR_DEFAUT: ReglagesInequationRationnelle = {
  niveauxActifs: ["niveau1", "niveau2", "niveau3", "niveau4", "denominateurCarre", "facteurCommun", "sansFacteurCommun", "cubique"],
  repartition: "equilibre",
};
const genererInstance = creerGenerateurInequationRationnelle(REGLAGES_PAR_DEFAUT);

export const adaptateurEvaluationInequationRationnelle: AdaptateurFeuilleExercices<ExerciceInequationRationnelle> = {
  titreDocument: "Inéquations rationnelles — Évaluation",
  nomFichierBase: "inequations-rationnelles",
  genererInstance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as NiveauInequationRationnelle),
  construireEnonce: construireEnonceInequationRationnelle,
  construireCorrection: construireCorrectionInequationRationnelle,
};
