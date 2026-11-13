import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceValeurExacte, TermeTrig } from "../../core/valeurExacte.types";
import { exactLatex, oppose, produit, valeurApprochee } from "../../moteur/corpsValeurExacte";
import { angleAssocie, angleReduit, estPremierQuadrant, necessiteReduction, quadrantDe, signeDe, valeurFonction, valeurRemarquable } from "../../moteur/modeleValeurExacte";
import { ecransDe, type EcranValeurExacte } from "../../moteur/sessionValeurExacte";
import {
  CONSIGNE_PAPIER,
  aDesProduitsOuCarres,
  angleLatex,
  angleTravail,
  calculReductionLatex,
  consigneEcran,
  expressionLatex,
  fonctionAngleLatex,
  groupesLatex,
  relationFragments,
  resultatLatex,
  substitutionLatex,
} from "../../ui/formatValeurExacte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceValeurExacte } from "./index";
import { LIBELLE_CAS_VALEUR_EXACTE, profilValeurExacte } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen76. Énoncé papier = « Calcule, sans
 * calculatrice, la valeur exacte de : … » (rien d'autre : les étapes d'apprentissage — réduire,
 * quadrant et signe, angle associé et valeur, calcul final — sont les étapes a, b, c… du corrigé,
 * une par écran, dans l'ordre de l'appli). Séries équilibrées : `profil.ts`.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function lettresEcrans(e: ExerciceValeurExacte): { ecran: EcranValeurExacte; lettre: string }[] {
  return ecransDe(e).map((ecran, i) => ({ ecran, lettre: LETTRES[i]! }));
}

function lettreDe(e: ExerciceValeurExacte, type: EcranValeurExacte["type"], terme?: number): string {
  return lettresEcrans(e).find(({ ecran }) => ecran.type === type && (ecran.type === "final" || ecran.terme === terme))!.lettre;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceValeurExacte): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_PAPIER} `), latex(expressionLatex(e))],
    questions: ecransDe(e).map((ecran) => ({
      consigne: ecran.type === "final" ? consigneEcran(e, ecran) : [texte(`Terme ${ecran.terme + 1} — `), ...consigneEcran(e, ecran)],
    })),
  };
}

function enoncePapier(e: ExerciceValeurExacte): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`${CONSIGNE_PAPIER} `), latex(expressionLatex(e))],
      questions: [],
    },
  };
}

function reponseBreve(e: ExerciceValeurExacte): FragmentConsigne[] {
  return [latex(`${expressionLatex(e)} = ${resultatLatex(e)}`)];
}

function signeMot(s: 1 | -1): string {
  return s === 1 ? "positif" : "négatif";
}

/** « \cos 240^\circ = -\cos 60^\circ = -\frac{1}{2} » (ou directement la valeur au quadrant I). */
function ligneValeur(t: TermeTrig): string {
  const ft = fonctionAngleLatex(t.fonction, angleTravail(t));
  const v = exactLatex(valeurFonction(t));
  if (estPremierQuadrant(t)) return `${ft} = ${v}`;
  return `${ft} = ${signeDe(t) === 1 ? "" : "-"}${fonctionAngleLatex(t.fonction, angleAssocie(t))} = ${v}`;
}

function etapesTerme(e: ExerciceValeurExacte, i: number): EtapeCorrection[] {
  const t = e.termes[i]!;
  const etapes: EtapeCorrection[] = [];
  const ft = fonctionAngleLatex(t.fonction, angleTravail(t));
  if (necessiteReduction(t)) {
    etapes.push({
      label: "Calcul",
      sousQuestion: lettreDe(e, "reduction", i),
      fragments: [latex(`${calculReductionLatex(t)} = ${angleLatex(angleReduit(t.angle))}`), texte(", donc "), latex(`${fonctionAngleLatex(t.fonction, t.angle)} = ${ft}`), texte(".")],
    });
  }
  etapes.push({
    label: "Quadrant",
    sousQuestion: lettreDe(e, "placement", i),
    fragments: [latex(angleLatex(angleTravail(t))), texte(` est dans le quadrant ${quadrantDe(t)} : `), latex(ft), texte(` y est ${signeMot(signeDe(t))}.`)],
  });
  const lv = lettreDe(e, "valeur", i);
  etapes.push({ label: "Angle associé", sousQuestion: lv, fragments: relationFragments(t) });
  etapes.push({ label: "Valeur", sousQuestion: lv, fragments: [latex(ligneValeur(t)), texte(".")] });
  return etapes;
}

function etapesFinales(e: ExerciceValeurExacte): EtapeCorrection[] {
  const lettre = lettreDe(e, "final");
  const etapes: EtapeCorrection[] = [{ label: "Calcul", sousQuestion: lettre, fragments: [latex(`${expressionLatex(e)} = ${substitutionLatex(e)}`)] }];
  const groupes = groupesLatex(e);
  if (aDesProduitsOuCarres(e) && groupes !== resultatLatex(e)) {
    etapes.push({ label: "Calcul", sousQuestion: lettre, fragments: [latex(`= ${groupes}`), texte(" (produits et carrés d'abord)")] });
  }
  etapes.push({ label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${expressionLatex(e)} = ${resultatLatex(e)}`)] });
  return etapes;
}

function piege(e: ExerciceValeurExacte): EtapeCorrection {
  // 1. Carré d'une valeur négative.
  const carreNegatif = e.termes.find((t) => t.carre && valeurApprochee(valeurFonction(t)) < 0);
  if (carreNegatif) {
    const v = valeurFonction(carreNegatif);
    const v2 = exactLatex(produit(v, v));
    return {
      label: "Piège",
      sousQuestion: lettreDe(e, "final"),
      fragments: [texte("Un carré est toujours positif : "), latex(`\\left(${exactLatex(v)}\\right)^2 = ${v2}`), texte(", et non "), latex(`-${v2}`), texte(".")],
    };
  }
  // 2. Signe donné par le quadrant (premier terme négatif).
  const i = e.termes.findIndex((t) => signeDe(t) === -1);
  if (i >= 0) {
    const t = e.termes[i]!;
    const ft = fonctionAngleLatex(t.fonction, angleTravail(t));
    return {
      label: "Piège",
      sousQuestion: lettreDe(e, "valeur", i),
      fragments: [
        latex(ft),
        texte(` est négatif (quadrant ${quadrantDe(t)}) : écrire `),
        latex(`${ft} = ${exactLatex(oppose(valeurFonction(t)))}`),
        texte(" est une erreur de signe ; l'angle associé donne la valeur, le quadrant donne le signe."),
      ],
    };
  }
  // 3. Confusion sinus / cosinus.
  const j = e.termes.findIndex((t) => t.fonction !== "tan" && angleAssocie(t) !== 45);
  if (j >= 0) {
    const t = e.termes[j]!;
    const a = angleAssocie(t);
    const autre = t.fonction === "sin" ? "cos" : "sin";
    return {
      label: "Piège",
      sousQuestion: lettreDe(e, "valeur", j),
      fragments: [
        texte("Ne pas confondre "),
        latex(`${fonctionAngleLatex(t.fonction, a)} = ${exactLatex(valeurRemarquable(t.fonction, a))}`),
        texte(" et "),
        latex(`${fonctionAngleLatex(autre, a)} = ${exactLatex(valeurRemarquable(autre, a))}`),
        texte("."),
      ],
    };
  }
  // 4. Priorité des opérations, ou rappel du rôle de l'angle associé.
  return e.operateurs.includes("*")
    ? { label: "Piège", sousQuestion: lettreDe(e, "final"), fragments: [texte("Le produit se calcule avant la somme ou la différence.")] }
    : { label: "Piège", sousQuestion: lettreDe(e, "valeur", 0), fragments: [texte("L'angle associé du premier quadrant donne la valeur remarquable ; le signe vient toujours du quadrant de l'angle de départ.")] };
}

function correctionDetaillee(e: ExerciceValeurExacte): EtapeCorrection[] {
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Pour chaque terme : ramener l'angle dans [0° ; 360°[ si nécessaire, repérer le quadrant (qui donne le signe), puis l'angle associé du premier quadrant (qui donne la valeur remarquable). On calcule ensuite l'expression.")] },
    ...e.termes.flatMap((_, i) => etapesTerme(e, i)),
    ...etapesFinales(e),
    piege(e),
  ];
}

function construireCorrection(e: ExerciceValeurExacte): BlocCorrection[] {
  return [
    ...e.termes.map((t): BlocCorrection => ({ type: "paragraphe", fragments: [latex(`${fonctionAngleLatex(t.fonction, t.angle)} = ${exactLatex(valeurFonction(t))}`)] })),
    { type: "paragraphe", fragments: reponseBreve(e) },
  ];
}

function bareme(e: ExerciceValeurExacte): BaremeExercice {
  const n = e.termes.length;
  const parTerme = n === 2 ? 1.25 : 1;
  const criteres: CritereBareme[] = e.termes.map((t, i) => ({
    sousQuestion: lettreDe(e, "valeur", i),
    critere: [
      texte(`Valeur exacte de `),
      latex(fonctionAngleLatex(t.fonction, t.angle)),
      texte(necessiteReduction(t) ? " : angle ramené dans [0° ; 360°[, quadrant et signe, angle associé, valeur remarquable" : " : quadrant et signe, angle associé, valeur remarquable"),
    ],
    points: parTerme,
  }));
  criteres.push({ sousQuestion: lettreDe(e, "final"), critere: [texte("Calcul exact de l'expression (priorités, fractions et racines), résultat simplifié")], points: 4 - n * parTerme });
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [texte("Signe oublié ou faux (le signe vient du quadrant de l'angle)")], cout: "moitié des points du terme concerné" },
      { description: [texte("Sinus et cosinus confondus (valeur de l'autre fonction)")], cout: "0 pt sur le terme concerné" },
      { description: [texte("Valeur décimale approchée au lieu de la valeur exacte")], cout: "moitié des points du calcul final" },
      ...(aDesProduitsOuCarres(e) ? [{ description: [texte("Priorité des opérations non respectée, ou carré d'un nombre négatif écrit négatif")], cout: "moitié des points du calcul final" }] : []),
    ],
    reponsesAcceptees: [[texte("Toute écriture exacte équivalente (dénominateurs non réunis, racine écrite autrement)")]],
  };
}

function difficulte(e: ExerciceValeurExacte): 1 | 2 | 3 {
  if (e.termes.length === 3 || e.termes.some(necessiteReduction) || e.termes.some((t) => t.carre)) return 3;
  return 2;
}

export const adaptateurEvaluationValeurExacte: AdaptateurFeuilleExercices<ExerciceValeurExacte> = {
  profilInstance: profilValeurExacte,
  libelleCasParticulier: LIBELLE_CAS_VALEUR_EXACTE,
  titreDocument: "Valeur exacte sans calculatrice — Évaluation",
  nomFichierBase: "valeur-exacte-sans-calculatrice",
  genererInstance: genererExerciceValeurExacte,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 7,
};
