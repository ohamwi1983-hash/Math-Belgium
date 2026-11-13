import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceEquilibreForces, OptionCondition, Vecteur2 } from "../core/equilibreForces.types";
import {
  ECRAN_CONDITION,
  ECRAN_F3,
  ECRAN_INTENSITE,
  ECRAN_RESULTANTE,
  angleF3,
  f1,
  f2,
  f3,
  intensiteArrondie,
  intensiteExacteDemandee,
  nombreEcrans,
  normeCarreeF3,
  resultante,
  simplifierRacine,
} from "../moteur/modeleEquilibreForces";
import type { StatutAngle, StatutComposantes, StatutIntensite } from "../moteur/verificationEquilibreForces";
import { nombreFr, nombreFrLatex } from "./nombreFr";

/**
 * Textes de gen90 (écran ET papier : une seule source). Notation du chapitre 6 : vecteurs
 * `\vec{F_1}`, composantes en colonne `\vec{F_1}\begin{pmatrix} x \\ y \end{pmatrix}`, intensité =
 * norme `\|\vec{F_3}\|`. Formules toujours en LaTeX (jamais « sqrt », « ^ » au clavier) ; virgule
 * décimale ; signe moins rendu par KaTeX (−).
 */

export const V1 = "\\vec{F_1}";
export const V2 = "\\vec{F_2}";
export const V3 = "\\vec{F_3}";
export const NORME3 = "\\|\\vec{F_3}\\|";
export const SOMME12 = `${V1} + ${V2}`;

// ---------------------------------------------------------------------------------------------
// Nombres et vecteurs
// ---------------------------------------------------------------------------------------------

/** Nombre en LaTeX ; un négatif entre parenthèses si `parentheses` (dans une somme). */
export function nb(n: number, parentheses = false): string {
  const s = nombreFrLatex(n);
  return parentheses && n < 0 ? `(${s})` : s;
}

/** Valeur arrondie au dixième, toujours avec sa décimale (« 198{,}0 ») : LaTeX ou texte. */
export function dixieme(v: number, support: "latex" | "texte" = "latex"): string {
  const s = (Math.round(v * 10) / 10).toFixed(1);
  return s.replace(".", support === "latex" ? "{,}" : ",");
}

export function colonne(v: Vecteur2): string {
  return `\\begin{pmatrix} ${nb(v.x)} \\\\ ${nb(v.y)} \\end{pmatrix}`;
}

export function colonneTexte(x: string, y: string): string {
  return `\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;
}

/** « 10\sqrt{13} », « 50 », « \sqrt{1300} » si demandé non simplifié. */
export function racineLatex(n: number): string {
  const { k, m } = simplifierRacine(n);
  if (m === 1) return nb(k);
  return `${k === 1 ? "" : nb(k)}\\sqrt{${m}}`;
}

/** Intensité attendue de F₃ en LaTeX (« = 10\sqrt{13} » ou « ≈ 36,1 »), sans l'unité. */
export function intensiteAttendueLatex(e: ExerciceEquilibreForces): string {
  if (intensiteExacteDemandee(e)) return `${NORME3} = ${racineLatex(normeCarreeF3(e))}`;
  return `${NORME3} \\approx ${dixieme(intensiteArrondie(e))}`;
}

export function angleLatex(e: ExerciceEquilibreForces): string {
  return `\\alpha \\approx ${dixieme(angleF3(e))}°`;
}

/** Sens de F₃ lisible : « vers la droite et vers le haut », « vers le bas »… */
export function sensTexte(v: Vecteur2): string {
  const h = v.x > 0 ? "vers la droite" : v.x < 0 ? "vers la gauche" : "";
  const vert = v.y > 0 ? "vers le haut" : v.y < 0 ? "vers le bas" : "";
  return h && vert ? `${h} et ${vert}` : h || vert;
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

function donnee(nom: string, v: Vecteur2): FragmentConsigne {
  return latex(`${nom}${colonne(v)}`);
}

export function phraseRepere(e: ExerciceEquilibreForces): string {
  const dessus = e.situation === "corde" || e.situation === "barque";
  const axes = dessus ? "la figure est une vue du dessus, axe x vers la droite, axe y vers le haut de la figure." : "axe x horizontal vers la droite, axe y vertical vers le haut.";
  return e.situation === "anneau" ? ` Repère : ${axes}` : ` Composantes en newtons (N) ; repère : ${axes}`;
}

export function enonceFragments(e: ExerciceEquilibreForces): FragmentConsigne[] {
  const repere = texte(phraseRepere(e));
  switch (e.situation) {
    case "lustre":
      return [
        texte("Un lustre est suspendu au plafond par deux câbles attachés au même crochet O. Il est soumis à son poids "),
        donnee(V1, f1(e)),
        texte(", à la tension du premier câble "),
        donnee(V2, f2(e)),
        texte(" et à la tension "),
        latex(V3),
        texte(" du second câble, inconnue. Le lustre est immobile : les trois forces se compensent."),
        repere,
      ];
    case "corde":
      return [
        texte("Trois personnes tirent chacune sur une corde ; les trois cordes sont nouées en un même point O, qui ne bouge pas. Les deux premières exercent les forces "),
        donnee(V1, f1(e)),
        texte(" et "),
        donnee(V2, f2(e)),
        texte(". La troisième personne exerce la force "),
        latex(V3),
        texte(", inconnue."),
        repere,
      ];
    case "barque":
      return [
        texte("Une barque est retenue au point O par deux amarres attachées aux deux rives. Le courant exerce sur elle la force "),
        donnee(V1, f1(e)),
        texte(", la première amarre la force "),
        donnee(V2, f2(e)),
        texte(" et la seconde amarre la force "),
        latex(V3),
        texte(", inconnue. La barque reste immobile."),
        repere,
      ];
    case "anneau":
      return [
        texte("Un anneau O est tiré par trois cordes et reste immobile. Les forces "),
        latex(V1),
        texte(" et "),
        latex(V2),
        texte(` exercées par les deux premières cordes sont dessinées sur le quadrillage, où 1 carreau représente ${e.unite} N. La troisième corde exerce la force `),
        latex(V3),
        texte(", inconnue."),
        repere,
      ];
  }
}

export const CONSIGNE_GENERALE =
  "Les trois forces se compensent : leur somme est le vecteur nul. Détermine la force inconnue en travaillant en composantes.";

function precisionIntensite(e: ExerciceEquilibreForces): string {
  return intensiteExacteDemandee(e) ? "valeur exacte, simplifiée" : "arrondie au dixième de newton";
}

/** Vraies questions de l'énoncé papier. */
export function questionsPapier(e: ExerciceEquilibreForces): FragmentConsigne[][] {
  const questions: FragmentConsigne[][] = [
    [texte("Détermine les composantes de la force "), latex(V3), texte(" (en N).")],
    [texte("Calcule son intensité "), latex(NORME3), texte(` (${precisionIntensite(e)}).`)],
  ];
  if (e.direction) questions.push([texte("Calcule l'angle aigu entre la direction de "), latex(V3), texte(" et l'axe x (au dixième de degré).")]);
  return questions;
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export function titresEcrans(e: ExerciceEquilibreForces): string[] {
  return ["La condition d'équilibre", "La résultante de F₁ et F₂", "Les composantes de F₃", "L'intensité de F₃", "La direction de F₃"].slice(0, nombreEcrans(e));
}

/** Consigne de chaque écran. `papier` : titre d'étape du corrigé (sans tournure d'écran). */
export function consignesEcrans(e: ExerciceEquilibreForces, support: "ecran" | "papier"): FragmentConsigne[][] {
  const ecran = support === "ecran";
  const anneau = e.situation === "anneau";
  const consignes: FragmentConsigne[][] = [
    ecran
      ? [texte("Le système est à l'équilibre. Quelle égalité permet de calculer "), latex(V3), texte(" ?")]
      : [texte("Écrire la condition d'équilibre et en déduire "), latex(V3), texte(" en fonction de "), latex(V1), texte(" et "), latex(V2), texte(".")],
    anneau
      ? [
          texte(ecran ? "Lis les composantes de " : "Lire les composantes de "),
          latex(V1),
          texte(" et "),
          latex(V2),
          texte(ecran ? " sur le quadrillage, puis calcule celles de la résultante " : " sur le quadrillage, puis calculer celles de la résultante "),
          latex(SOMME12),
          texte(ecran ? " (en N)." : "."),
        ]
      : [texte(ecran ? "Calcule les composantes de la résultante " : "Calculer les composantes de la résultante "), latex(SOMME12), texte(ecran ? " (en N)." : ".")],
    [texte(ecran ? "Calcule les composantes de la force d'équilibre " : "Calculer les composantes de la force d'équilibre "), latex(V3), texte(ecran ? " (en N)." : ".")],
    [texte(ecran ? "Calcule l'intensité " : "Calculer l'intensité "), latex(NORME3), texte(" de "), latex(V3), texte(` (${precisionIntensite(e)}).`)],
    [texte(ecran ? "Calcule l'angle aigu " : "Calculer l'angle aigu "), latex("\\alpha"), texte(" entre la direction de "), latex(V3), texte(" et l'axe x (au dixième de degré).")],
  ];
  return consignes.slice(0, nombreEcrans(e));
}

export const OPTIONS_CONDITION_LATEX: Record<OptionCondition, string> = {
  oppose: `${V3} = -(${V1} + ${V2})`,
  somme: `${V3} = ${V1} + ${V2}`,
  difference12: `${V3} = ${V1} - ${V2}`,
  difference21: `${V3} = ${V2} - ${V1}`,
};

/** Libellé (LaTeX) du vecteur saisi à l'écran 2 ou 3. */
export function vecteurEcran(ecran: number): string {
  return ecran === ECRAN_RESULTANTE ? SOMME12 : V3;
}

/** Réponse attendue d'un écran (fragments). */
export function reponseAttendueFragments(e: ExerciceEquilibreForces, ecran: number): FragmentConsigne[] {
  switch (ecran) {
    case ECRAN_CONDITION:
      return [latex(OPTIONS_CONDITION_LATEX.oppose)];
    case ECRAN_RESULTANTE:
      return [latex(`${SOMME12}${colonne(resultante(e))}`)];
    case ECRAN_F3:
      return [latex(`${V3}${colonne(f3(e))}`)];
    case ECRAN_INTENSITE:
      return [latex(intensiteAttendueLatex(e)), texte(" N")];
    default:
      return [latex(angleLatex(e)), texte(` (${sensTexte(f3(e))})`)];
  }
}

export function saisieVecteur(ecran: number, v: Vecteur2): FragmentConsigne[] {
  return [latex(`${vecteurEcran(ecran)}${colonne(v)}`)];
}

export function saisieIntensiteTexte(texteSaisi: string): string {
  return `${texteSaisi.trim().replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2")} N`;
}

export function saisieAngleTexte(v: number): string {
  return `${nombreFr(v)}°`;
}

// ---------------------------------------------------------------------------------------------
// Aides (2 niveaux par écran ; jamais la réponse finale : il reste toujours un calcul)
// ---------------------------------------------------------------------------------------------

function sommeComposantes(a: Vecteur2, b: Vecteur2): string {
  return colonneTexte(`${nb(a.x)} + ${nb(b.x, true)}`, `${nb(a.y)} + ${nb(b.y, true)}`);
}

export function aidesEcran(e: ExerciceEquilibreForces, ecran: number): FragmentConsigne[][] {
  const r = resultante(e);
  const g = f3(e);
  switch (ecran) {
    case ECRAN_CONDITION:
      return [
        [texte("À l'équilibre, la somme des trois forces est le vecteur nul :"), latex(`${V1} + ${V2} + ${V3} = \\vec{0}`)],
        [texte("Une égalité vectorielle se transforme comme une équation : retire "), latex(V1), texte(" et "), latex(V2), texte(" des deux membres, puis regarde ce qui reste à droite.")],
      ];
    case ECRAN_RESULTANTE:
      if (e.situation === "anneau") {
        return [
          [texte(`Compte les carreaux de l'origine à la pointe de chaque flèche : horizontalement pour x (positif vers la droite), verticalement pour y (positif vers le haut). Chaque carreau vaut ${e.unite} N.`)],
          [texte("Avec les composantes lues sur le quadrillage, on additionne composante par composante :"), latex(`${SOMME12}${sommeComposantes(f1(e), f2(e))}`)],
        ];
      }
      return [
        [texte("On additionne deux vecteurs composante par composante :"), latex(`${SOMME12}${colonneTexte("x_1 + x_2", "y_1 + y_2")}`)],
        [texte("Avec les composantes de l'énoncé :"), latex(`${SOMME12}${sommeComposantes(f1(e), f2(e))}`)],
      ];
    case ECRAN_F3:
      return [
        [texte("La force d'équilibre est l'OPPOSÉE de la résultante : chaque composante change de signe :"), latex(`${V3} = -(${SOMME12})`)],
        [texte("Avec la résultante obtenue à l'étape précédente :"), latex(`${V3}${colonneTexte(`-(${nb(r.x)})`, `-(${nb(r.y)})`)}`)],
      ];
    case ECRAN_INTENSITE: {
      const fin = intensiteExacteDemandee(e)
        ? [texte("Calcule le radicand, puis simplifie la racine en cherchant le plus grand carré qui le divise :")]
        : [texte("Calcule le radicand, puis la racine à la calculatrice :")];
      return [
        [texte("L'intensité d'une force est la norme du vecteur ; elle se calcule à partir de ses composantes :"), latex(`\\|\\vec{u}\\| = \\sqrt{x^2 + y^2}`)],
        [...fin, latex(`${NORME3} = \\sqrt{${nb(g.x, true)}^2 + ${nb(g.y, true)}^2}`)],
      ];
    }
    default:
      return [
        [texte("Dans le triangle rectangle formé par les composantes, le côté opposé à α mesure |y| et le côté adjacent |x| :"), latex(`\\tan\\alpha = \\dfrac{|y|}{|x|}`)],
        [texte("Avec les composantes de "), latex(V3), texte(" (puis la touche arc tangente) :"), latex(`\\tan\\alpha = \\dfrac{${nb(Math.abs(g.y))}}{${nb(Math.abs(g.x))}}`)],
      ];
  }
}

// ---------------------------------------------------------------------------------------------
// Messages d'erreur ciblés
// ---------------------------------------------------------------------------------------------

export function messageComposantes(e: ExerciceEquilibreForces, statut: StatutComposantes): string | null {
  switch (statut) {
    case "soustraction":
      return "Tu as soustrait les deux forces : la résultante est leur SOMME.";
    case "oppose":
      return "Tu as déjà changé les signes : ici on demande la résultante elle-même, pas son opposé.";
    case "oubli_signe":
      return "C'est la résultante des deux premières forces. La force d'équilibre la compense : c'est son opposé.";
    case "carreaux":
      return `Tu as donné des carreaux : convertis en newtons (1 carreau = ${e.unite} N).`;
    default:
      return null;
  }
}

export function messageIntensite(e: ExerciceEquilibreForces, statut: StatutIntensite): string | null {
  switch (statut) {
    case "approchee":
      return "La valeur est bonne, mais la consigne demande la valeur exacte : écris-la avec une racine (rac(…) ou √). Aucune tentative n'est comptée.";
    case "somme_intensites":
      return "Tu as additionné les intensités des deux forces connues : les forces s'additionnent comme des vecteurs, pas comme des nombres. Utilise les composantes de la force cherchée.";
    case "somme_composantes":
      return "Tu as additionné les composantes : l'intensité vient de Pythagore, la racine de la somme des carrés.";
    case "sans_racine":
      return "C'est le carré de l'intensité : il manque la racine carrée.";
    case "carreaux":
      return `C'est l'intensité en carreaux : convertis en newtons (1 carreau = ${e.unite} N).`;
    default:
      return null;
  }
}

export function messageAngle(statut: StatutAngle): string | null {
  switch (statut) {
    case "complementaire":
      return "C'est l'angle avec l'axe y (vertical). On demande l'angle avec l'axe x : le côté adjacent est |x|.";
    case "radians":
      return "Ta calculatrice est en radians : passe-la en degrés.";
    case "tangente":
      return "C'est la valeur de la tangente : il reste à trouver l'angle (touche arc tangente).";
    case "obtus":
      return "On demande l'angle AIGU entre la direction de la force et l'axe x.";
    default:
      return null;
  }
}
