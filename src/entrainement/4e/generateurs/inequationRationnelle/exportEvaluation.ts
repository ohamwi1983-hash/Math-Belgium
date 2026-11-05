import type { Enonce, Exercice } from "../../core/generateur.types";
import type {
  ExerciceInequationRationnelle,
  ReglagesInequationRationnelle,
  ValeurCelluleQuotient,
} from "../../core/inequationRationnelle.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../../core/simplification.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
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
import { formatLineaireDeveloppeExact } from "../../ui/formatInequationRationnelle";
import { formatFractionSimplifiee } from "../../ui/formatSimplification";
import { formatSolutionEnsembleProduitLatex } from "../../ui/formatSolutionEnsembleProduit";
import { tableauSignesLatex, type CelluleSigne } from "../signesProduit/tableauSignesLatex";
import { libelleCategorie } from "../../ui/categorieLabels";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurInequationRationnelle, type VarianteInequationRationnelleId } from "./index";

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

/** Nombre en LaTeX, virgule décimale (les racines tirées sont entières, garde-fou seulement). */
function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : String(Math.round(valeur * 100) / 100).replace(".", "{,}");
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
  return `${prefixe} : ${formatLineaireDeveloppeExact(poly.k, poly.p)}`;
}

function labelMonique(prefixe: string, racine: number): string {
  return `${prefixe} : ${formatLineaireDeveloppeExact(1, racine)}`;
}

/** "N : (x-r)^2" (racine double) — même convention que `labelDenominateurCarre`. */
function labelCarre(prefixe: string, racine: number): string {
  const lineaire = formatLineaireDeveloppeExact(1, racine);
  return `${prefixe} : ${racine === 0 ? `${lineaire}^2` : `(${lineaire})^2`}`;
}

/** "D : (x-p)^2" ou "D : x^2" — jamais développé, même convention que `formatLigneDenominateurCarreLabel`. */
function labelDenominateurCarre(poly: PolynomeLineaire): string {
  const lineaire = formatLineaireDeveloppeExact(poly.k, poly.p);
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
      // Racine double (audit gen6) : une seule ligne « N : (x − r)² ».
      const lignesN: LigneGrille[] =
        r1 === r2
          ? [{ label: labelCarre("N", r1), valeurs: exercice.grille.lignesNumerateur[0] }]
          : [
              { label: labelMonique("N", r1), valeurs: exercice.grille.lignesNumerateur[0] },
              { label: labelMonique("N", r2), valeurs: exercice.grille.lignesNumerateur[1] },
            ];
      lignes.push(
        ...lignesN,
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


/** Libellé LaTeX d'une ligne du tableau : l'expression du facteur (sans le préfixe « N : »/« D : »
 * de l'écran), le coefficient tel quel. */
function libelleLigneLatex(label: string): string {
  const morceaux = label.split(" : ");
  return morceaux.length === 2 ? morceaux[1] : label;
}

function tableauLatex(exercice: ExerciceInequationRationnelle): string {
  const lignes = lignesGrille(exercice);
  const facteurs = lignes.slice(0, -1).map((l) => ({ libelle: libelleLigneLatex(l.label), valeurs: [...l.valeurs] as CelluleSigne[] }));
  const quotient = lignes[lignes.length - 1];
  return tableauSignesLatex(exercice.racines, facteurs, { libelle: "\\text{quotient}", valeurs: [...quotient.valeurs] as CelluleSigne[] });
}

type TypeEtape = "isoler" | "ce" | "racine" | "facto" | "evidence" | "factoDenom" | "simplifier" | "grille" | "intervalle";

/** Poids de chaque type d'étape dans le barème (ramenés à 4 par instance). */
const POIDS: Record<TypeEtape, number> = { isoler: 1, ce: 0.5, racine: 0.5, facto: 1, evidence: 0.5, factoDenom: 1, simplifier: 1.5, grille: 1, intervalle: 0.5 };

/** Une étape du corrigé (une ou plusieurs phases de l'écran) : consigne (titre « Étape n — … »),
 * lignes rédigées, critère du barème. */
interface EtapePapier {
  type: TypeEtape;
  consigne: FragmentConsigne[];
  lignes: { label: string; fragments: FragmentConsigne[] }[];
  critere: FragmentConsigne[];
}

function etapeIsolerCombiner(isolee: string, combinee: string, symbole: string): EtapePapier {
  return {
    type: "isoler",
    consigne: [texte("Ramène l'inéquation à la forme « … "), latex(symbole), texte(" 0 », puis combine les fractions en une seule.")],
    lignes: [
      { label: "Méthode", fragments: [texte("On passe tout dans le membre de gauche (jamais de multiplication par le dénominateur, dont le signe dépend de x) : "), latex(isolee)] },
      { label: "Calcul", fragments: [texte("Au même dénominateur : "), latex(combinee)] },
    ],
    critere: [texte("Inéquation ramenée à une seule fraction comparée à 0 : "), latex(combinee)],
  };
}

function etapeCE(ce: number): EtapePapier {
  return {
    type: "ce",
    consigne: [texte("Détermine la condition d'existence (CE).")],
    lignes: [
      { label: "Calcul", fragments: [texte("Le dénominateur s'annule en "), latex(`x = ${formatNombre(ce)}`), texte(".")] },
      { label: "Conclusion", fragments: [latex(`\\text{CE} : x \\neq ${formatNombre(ce)}`)] },
    ],
    critere: [latex(`\\text{CE} : x \\neq ${formatNombre(ce)}`)],
  };
}

function etapeCEListe(ce: [number, number]): EtapePapier {
  const [v1, v2] = paireTriee(ce);
  const conclusion = `\\text{CE} : x \\neq ${formatNombre(v1)} \\text{ et } x \\neq ${formatNombre(v2)}`;
  return {
    type: "ce",
    consigne: [texte("Détermine les conditions d'existence (CE).")],
    lignes: [
      { label: "Calcul", fragments: [texte("Le dénominateur s'annule en "), latex(`x = ${formatNombre(v1)}`), texte(" et en "), latex(`x = ${formatNombre(v2)}`), texte(".")] },
      { label: "Conclusion", fragments: [latex(conclusion)] },
    ],
    critere: [latex(conclusion)],
  };
}

function etapeRacineNumerateur(numerateur: PolynomeLineaire): EtapePapier {
  return {
    type: "racine",
    consigne: [texte("Détermine la racine du numérateur.")],
    lignes: [{ label: "Calcul", fragments: [latex(`${formatLineaireDeveloppeExact(numerateur.k, numerateur.p)} = 0 \\iff x = ${formatNombre(numerateur.p)}`)] }],
    critere: [texte("Racine du numérateur : "), latex(`x = ${formatNombre(numerateur.p)}`)],
  };
}

function racinesLatex(p2: Exercice): string {
  const [r1, r2] = paireTriee(p2.solution.racines);
  return r1 === r2 ? `x = ${formatNombre(r1)} \\text{ (racine double)}` : `x = ${formatNombre(r1)} \\text{ et } x = ${formatNombre(r2)}`;
}

function etapeFactorRacinesP2(p2: Exercice, nomPoly: string): EtapePapier {
  return {
    type: "facto",
    consigne: [texte(`Factorise le ${nomPoly} et donne ses racines.`)],
    lignes: [
      { label: "Méthode", fragments: [texte(`${libelleCategorie(p2.categorie)} : `), latex(`${formatMembreGauche(p2.enonce)} = ${formeFactoriseeDeP2(p2)}`)] },
      { label: "Conclusion", fragments: [latex(racinesLatex(p2)), texte(".")] },
    ],
    critere: [texte(`Factorisation du ${nomPoly} et racines : `), latex(racinesLatex(p2))],
  };
}

function etapeMiseEnEvidence(quadratique: Enonce): EtapePapier {
  const forme = `N(x) = x(${formatMembreGauche(quadratique)})`;
  return {
    type: "evidence",
    consigne: [texte("Mets "), latex("x"), texte(" en évidence dans le numérateur.")],
    lignes: [{ label: "Calcul", fragments: [latex(forme)] }],
    critere: [texte("Mise en évidence de x : "), latex(forme)],
  };
}

function etapeFactorDenomCE(denominateur: Exercice, ce: [number, number]): EtapePapier {
  const [d1, d2] = paireTriee(ce);
  const conclusion = `\\text{CE} : x \\neq ${formatNombre(d1)} \\text{ et } x \\neq ${formatNombre(d2)}`;
  return {
    type: "factoDenom",
    consigne: [texte("Factorise le dénominateur et donne les conditions d'existence.")],
    lignes: [
      { label: "Méthode", fragments: [texte(`${libelleCategorie(denominateur.categorie)} : `), latex(`${formatMembreGauche(denominateur.enonce)} = ${formeFactoriseeDeP2(denominateur)}`)] },
      { label: "Conclusion", fragments: [latex(conclusion)] },
    ],
    critere: [texte("Dénominateur factorisé et "), latex(conclusion)],
  };
}

function etapeSimplifierFraction(fraction: ExerciceSimplification): EtapePapier {
  const N = commeP2(fraction.numerateur, "numérateur");
  const D = commeP2(fraction.denominateur, "dénominateur");
  return {
    type: "simplifier",
    consigne: [texte("Factorise le numérateur et le dénominateur, puis simplifie la fraction.")],
    lignes: [
      { label: "Calcul", fragments: [latex(`N(x) = ${formeFactoriseeDeP2(N)}`), texte(` (${libelleCategorie(N.categorie).toLowerCase()}) ; `), latex(`D(x) = ${formeFactoriseeDeP2(D)}`), texte(` (${libelleCategorie(D.categorie).toLowerCase()}).`)] },
      {
        label: "Conclusion",
        fragments: [texte("Le facteur commun "), latex(`(${formatFacteurRacine(fraction.racineCommune)})`), texte(" se simplifie (sa racine reste interdite) : "), latex(formatFractionSimplifiee(fraction)), texte(".")],
      },
    ],
    critere: [texte("Factorisations et fraction simplifiée : "), latex(formatFractionSimplifiee(fraction))],
  };
}

function etapeGrille(exercice: ExerciceInequationRationnelle): EtapePapier {
  return {
    type: "grille",
    consigne: [texte("Dresse le tableau de signes de la fraction.")],
    lignes: [
      { label: "Méthode", fragments: [texte("Une ligne par facteur ; le signe du quotient suit la règle des signes ; double barre aux valeurs interdites.")] },
      { label: "Tableau", fragments: [latex(tableauLatex(exercice))] },
    ],
    critere: [texte("Tableau de signes complet, valeurs interdites marquées")],
  };
}

const RETENIR: Record<ExerciceInequationRationnelle["symbole"], string> = {
  "<": "On garde les zones où le quotient est strictement négatif.",
  ">": "On garde les zones où le quotient est strictement positif.",
  "≤": "On garde les zones où le quotient est négatif et les racines du numérateur ; les valeurs interdites restent exclues.",
  "≥": "On garde les zones où le quotient est positif et les racines du numérateur ; les valeurs interdites restent exclues.",
};

function etapeIntervalle(exercice: ExerciceInequationRationnelle): EtapePapier {
  const s = `S = ${formatSolutionEnsembleProduitLatex(exercice.solution)}`;
  return {
    type: "intervalle",
    consigne: [texte("Donne l'ensemble des solutions de l'inéquation.")],
    lignes: [
      { label: "Méthode", fragments: [texte(RETENIR[exercice.symbole])] },
      { label: "Conclusion", fragments: [latex(s)] },
    ],
    critere: [latex(s), texte(" (crochets justes)")],
  };
}

/**
 * Étapes dans l'ordre EXACT des phases réellement traversées à l'écran pour ce niveau
 * (`moteur/sessionInequationRationnelle.ts::phaseInitiale` et les `phase:` de chaque
 * `soumettreReponseXxx`) — une étape peut regrouper plusieurs phases étroitement liées
 * (reconnaissance + champ1 + champ2 + [factorisation] → « factorise et donne ses racines »).
 */
function construireEtapes(exercice: ExerciceInequationRationnelle): EtapePapier[] {
  switch (exercice.niveau) {
    case "niveau1":
      return [etapeCE(exercice.ce), etapeRacineNumerateur(exercice.numerateur), etapeGrille(exercice), etapeIntervalle(exercice)];
    case "niveau2":
      return [
        etapeIsolerCombiner(formatExpressionIsoleeLatex(exercice), formatEnonceInequationRationnelleLatex(exercice), SYMBOLE_LATEX[exercice.symbole]),
        etapeCE(exercice.ce),
        etapeRacineNumerateur(exercice.numerateur),
        etapeGrille(exercice),
        etapeIntervalle(exercice),
      ];
    case "niveau3":
      return [
        etapeIsolerCombiner(formatExpressionIsoleeNiveau3Latex(exercice), formatEnonceCombineNiveau3Latex(exercice), SYMBOLE_LATEX[exercice.symbole]),
        etapeCE(exercice.ce),
        etapeFactorRacinesP2(exercice.numerateur, "numérateur"),
        etapeGrille(exercice),
        etapeIntervalle(exercice),
      ];
    case "niveau4":
      return [
        etapeIsolerCombiner(formatExpressionIsoleeNiveau4Latex(exercice), formatEnonceCombineNiveau4Latex(exercice), SYMBOLE_LATEX[exercice.symbole]),
        etapeCEListe(exercice.ce),
        etapeFactorRacinesP2(exercice.numerateur, "numérateur"),
        etapeGrille(exercice),
        etapeIntervalle(exercice),
      ];
    case "denominateurCarre":
      return [
        etapeIsolerCombiner(formatExpressionIsoleeDenominateurCarreLatex(exercice), formatEnonceCombineDenominateurCarreLatex(exercice), SYMBOLE_LATEX[exercice.symbole]),
        etapeCE(exercice.ce),
        etapeFactorRacinesP2(exercice.numerateur, "numérateur"),
        etapeGrille(exercice),
        etapeIntervalle(exercice),
      ];
    case "sansFacteurCommun":
      return [
        etapeIsolerCombiner(formatExpressionIsoleeSansFacteurCommunLatex(exercice), formatEnonceCombineSansFacteurCommunLatex(exercice), SYMBOLE_LATEX[exercice.symbole]),
        etapeFactorDenomCE(exercice.denominateur, exercice.ce),
        etapeFactorRacinesP2(exercice.numerateur, "numérateur"),
        etapeGrille(exercice),
        etapeIntervalle(exercice),
      ];
    case "cubique":
      return [
        etapeCE(exercice.ce),
        etapeMiseEnEvidence(exercice.numerateur.enonce),
        etapeFactorRacinesP2(exercice.numerateur, "facteur du second degré restant"),
        etapeGrille(exercice),
        etapeIntervalle(exercice),
      ];
    case "facteurCommun":
      return [etapeCEListe(exercice.ce), etapeSimplifierFraction(exercice.fraction), etapeGrille(exercice), etapeIntervalle(exercice)];
  }
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function lettreDuType(etapes: EtapePapier[], type: TypeEtape): string | undefined {
  const i = etapes.findIndex((e) => e.type === type);
  return i >= 0 ? LETTRES[i] : undefined;
}

/** Piège unique, le plus pertinent pour le niveau. */
function piege(exercice: ExerciceInequationRationnelle): FragmentConsigne[] {
  switch (exercice.niveau) {
    case "facteurCommun":
      return [texte("Simplifier la fraction ne supprime pas la valeur interdite du facteur commun : elle reste exclue de S.")];
    case "denominateurCarre":
      return [texte("Un dénominateur au carré est positif : il ne change pas le signe du quotient, mais sa racine reste une valeur interdite.")];
    case "niveau1":
    case "cubique":
      return [texte("Une valeur interdite est toujours exclue de S, même avec ≤ ou ≥ : crochet ouvert.")];
    default:
      return [texte("Ne jamais multiplier les deux membres par le dénominateur : son signe dépend de x. On compare une seule fraction à 0.")];
  }
}

function enonceOriginal(exercice: ExerciceInequationRationnelle): FragmentConsigne[] {
  return [texte("Résous dans "), latex("\\mathbb{R}"), texte(" l'inéquation suivante : "), latex(formatEnonceOriginalComplet(exercice))];
}

function construireEnonceInequationRationnelle(exercice: ExerciceInequationRationnelle): SectionExercice {
  return { enteteFragments: enonceOriginal(exercice), questions: construireEtapes(exercice).map((e) => ({ consigne: e.consigne })) };
}

function enoncePapierInequationRationnelle(exercice: ExerciceInequationRationnelle): EnoncePapier {
  return { section: { enteteFragments: [...enonceOriginal(exercice), texte(".")], questions: [] } };
}

function correctionDetailleeInequationRationnelle(exercice: ExerciceInequationRationnelle): EtapeCorrection[] {
  const etapes = construireEtapes(exercice);
  const lignes: EtapeCorrection[] = etapes.flatMap((e, i) => e.lignes.map((l) => ({ ...l, sousQuestion: LETTRES[i] })));
  const lPiege = exercice.niveau === "niveau1" || exercice.niveau === "cubique" || exercice.niveau === "facteurCommun" ? lettreDuType(etapes, "intervalle") : lettreDuType(etapes, exercice.niveau === "denominateurCarre" ? "grille" : "isoler");
  lignes.push({ label: "Piège", sousQuestion: lPiege, fragments: piege(exercice) });
  return lignes;
}

/** Ancien corrigé (paragraphes) — dérivé du corrigé détaillé, une seule source. */
function construireCorrectionInequationRationnelle(exercice: ExerciceInequationRationnelle): BlocCorrection[] {
  return construireEtapes(exercice).flatMap((e): BlocCorrection[] => e.lignes.map((l) => ({ type: "paragraphe", fragments: [texte(`${l.label} : `), ...l.fragments] })));
}

function reponseBreveInequationRationnelle(exercice: ExerciceInequationRationnelle): FragmentConsigne[] {
  return [latex(`S = ${formatSolutionEnsembleProduitLatex(exercice.solution)}`)];
}

function difficulteInequationRationnelle(exercice: ExerciceInequationRationnelle): 1 | 2 | 3 {
  if (exercice.niveau === "niveau1") return 1;
  if (exercice.niveau === "niveau2") return 2;
  return 3;
}

function baremeInequationRationnelle(exercice: ExerciceInequationRationnelle): BaremeExercice {
  const etapes = construireEtapes(exercice);
  const somme = etapes.reduce((t, e) => t + POIDS[e.type], 0);
  const criteres: CritereBareme[] = etapes.map((e, i) => ({ sousQuestion: LETTRES[i], critere: e.critere, points: (POIDS[e.type] * 4) / somme }));
  const lIntervalle = lettreDuType(etapes, "intervalle");
  const lIsoler = lettreDuType(etapes, "isoler");
  const lFacto = lettreDuType(etapes, "facto") ?? lettreDuType(etapes, "simplifier");
  const erreurs: ErreurFrequente[] = [];
  if (lIsoler) erreurs.push({ description: [texte("Multiplication des deux membres par le dénominateur (son signe dépend de x)")], cout: `0 pt sur ${lIsoler})` });
  erreurs.push({ description: [texte("Valeur interdite incluse dans S (crochet fermé en une racine du dénominateur)")], cout: `−1 sur ${lIntervalle})` });
  if (exercice.niveau === "facteurCommun") erreurs.push({ description: [texte("Valeur interdite du facteur commun oubliée après simplification")], cout: `−1 sur ${lIntervalle})` });
  if (lFacto) erreurs.push({ description: [texte("Erreur de signe dans une factorisation")], cout: `−0,5 sur ${lFacto})` });
  return {
    reponseFinale: reponseBreveInequationRationnelle(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Ensemble décrit par des inégalités, valeurs interdites exclues")], [texte("Facteurs rangés dans un autre ordre dans le tableau")]],
  };
}

/**
 * Réglages par défaut de la fabrique — reprend exactement `REGLAGES_NIVEAU` de
 * `AppInequationRationnelle.tsx` (tous les niveaux actifs, répartition équilibrée). La fabrique est
 * sans état (`choisirNiveau` ne fait que tirer) : l'appli recrée la même pour rouvrir un code.
 */
export const REGLAGES_PAR_DEFAUT: ReglagesInequationRationnelle = {
  niveauxActifs: ["niveau1", "niveau2", "niveau3", "niveau4", "denominateurCarre", "facteurCommun", "sansFacteurCommun", "cubique"],
  repartition: "equilibre",
};
const genererInstance = creerGenerateurInequationRationnelle(REGLAGES_PAR_DEFAUT);

export const adaptateurEvaluationInequationRationnelle: AdaptateurFeuilleExercices<ExerciceInequationRationnelle> = {
  titreDocument: "Inéquations rationnelles — Évaluation",
  nomFichierBase: "inequations-rationnelles",
  genererInstance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteInequationRationnelleId),
  construireEnonce: construireEnonceInequationRationnelle,
  construireCorrection: construireCorrectionInequationRationnelle,
  difficulte: difficulteInequationRationnelle,
  reponseBreve: reponseBreveInequationRationnelle,
  correctionDetaillee: correctionDetailleeInequationRationnelle,
  bareme: baremeInequationRationnelle,
  enoncePapier: enoncePapierInequationRationnelle,
  dureeMinutes: 10,
};
