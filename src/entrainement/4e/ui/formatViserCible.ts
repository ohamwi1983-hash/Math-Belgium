import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { Composantes, Point } from "../core/vecteur.types";
import type { ExerciceViserCible, OptionVecteur, SituationViserCible, VerdictDirect, VerdictInverse } from "../core/viserCible.types";
import { coefficientK, composanteConnue, conditionInverse, critere, solutionM, vecteurAC, verdictDirect, verdictInverse, type Fraction } from "../moteur/modeleViserCible";
import type { TypeEcranViserCible } from "../moteur/sessionViserCible";

/**
 * Textes de gen89 (écran ET papier : une seule source). Notation du chapitre : \vec{AC},
 * composantes en colonne (pmatrix), points A(x ; y) ; critère du cours x_u·y_v − y_u·x_v.
 * Formules toujours en LaTeX, jamais au clavier ; signe moins typographique (KaTeX).
 */

/** Les lettres isolées m (paramètre) et k (coefficient) d'un texte passent en KaTeX : « la valeur
 * de m » s'écrit avec le m mathématique, comme dans les formules. */
export function variablesEnLatex(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.flatMap((f) => {
    if (f.type !== "texte") return [f];
    const morceaux = f.valeur.split(/(?<=^|[\s(])([mk])(?=[\s,.:;)]|$)/);
    return morceaux.filter((m) => m !== "").map((m) => (m === "m" || m === "k" ? latex(m) : texte(m)));
  });
}

// ---------------------------------------------------------------------------------------------
// Nombres et objets en LaTeX
// ---------------------------------------------------------------------------------------------

export function nombreLatex(n: number): string {
  return String(n === 0 ? 0 : n);
}

/** Facteur d'un produit : les négatifs entre parenthèses. */
export function facteurLatex(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

export function fractionLatex(f: Fraction): string {
  if (f.den === 1) return nombreLatex(f.num);
  return `${f.num < 0 ? "-" : ""}\\dfrac{${Math.abs(f.num)}}{${f.den}}`;
}

export function pointLatex(nom: string, p: Point): string {
  return `${nom}(${nombreLatex(p.x)}\\,;\\,${nombreLatex(p.y)})`;
}

export function colonneLatex(x: string, y: string): string {
  return `\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;
}

export function vecteurLatex(nom: string, v: Composantes): string {
  return `\\vec{${nom}}${colonneLatex(nombreLatex(v.x), nombreLatex(v.y))}`;
}

export const U = "\\vec{u}";
export const AC = "\\vec{AC}";
export const FORMULE_CRITERE = "x_u \\cdot y_{AC} - y_u \\cdot x_{AC}";

/** u⃗ tel que l'énoncé le donne : composantes, ou composante inconnue « m » (sens inverse). */
export function uEnonceLatex(e: ExerciceViserCible): string {
  if (e.inconnue === null) return vecteurLatex("u", e.u);
  const c = nombreLatex(composanteConnue(e));
  return `\\vec{u}${e.inconnue === "x" ? colonneLatex("m", c) : colonneLatex(c, "m")}`;
}

export function acLatex(e: ExerciceViserCible): string {
  return vecteurLatex("AC", vecteurAC(e));
}

export function kLatex(e: ExerciceViserCible): string {
  const k = coefficientK(e);
  return k ? fractionLatex(k) : "";
}

/** Critère substitué, non calculé (aide de niveau 2, corrigé). */
export function critereSubstitueLatex(e: ExerciceViserCible): string {
  const ac = vecteurAC(e);
  return `${nombreLatex(e.u.x)} \\cdot ${facteurLatex(ac.y)} - ${facteurLatex(e.u.y)} \\cdot ${facteurLatex(ac.x)}`;
}

/** Condition du sens inverse, substituée, non simplifiée : « 3 · 4 − m · (−6) = 0 ». */
export function conditionSubstitueeLatex(e: ExerciceViserCible): string {
  const ac = vecteurAC(e);
  const c = composanteConnue(e);
  return e.inconnue === "x"
    ? `m \\cdot ${facteurLatex(ac.y)} - ${facteurLatex(c)} \\cdot ${facteurLatex(ac.x)} = 0`
    : `${nombreLatex(c)} \\cdot ${facteurLatex(ac.y)} - m \\cdot ${facteurLatex(ac.x)} = 0`;
}

/** α·m + β = 0 simplifiée : « −6m + 12 = 0 » (corrigé). */
export function conditionReduiteLatex(e: ExerciceViserCible): string {
  const { alpha, beta } = conditionInverse(e);
  const terme = alpha === 1 ? "m" : alpha === -1 ? "-m" : `${nombreLatex(alpha)}m`;
  return `${terme} ${beta < 0 ? "-" : "+"} ${nombreLatex(Math.abs(beta))} = 0`;
}

/** α·m = −β (aide de niveau 2 de l'écran « m », corrigé). */
export function conditionIsoleeLatex(e: ExerciceViserCible): string {
  const { alpha, beta } = conditionInverse(e);
  const terme = alpha === 1 ? "m" : alpha === -1 ? "-m" : `${nombreLatex(alpha)}m`;
  return `${terme} = ${nombreLatex(-beta)}`;
}

/** u⃗ avec la valeur de m trouvée. */
export function uResoluLatex(e: ExerciceViserCible): string {
  return vecteurLatex("u", e.u);
}

// ---------------------------------------------------------------------------------------------
// Situations
// ---------------------------------------------------------------------------------------------

interface Contexte {
  intro: string;
  /** Avant / entre / après les deux points. */
  placement: [string, string, string];
  lancerDirect: string;
  lancerInverse: string;
  modele: string;
  mobile: string;
  cible: string;
  deCible: string;
  verbe: string;
  question: string;
}

export const CONTEXTES: Record<SituationViserCible, Contexte> = {
  billard: {
    intro: "Une table de billard est vue de dessus, dans un repère d'origine O (coin inférieur gauche de la table, unité : 10 cm).",
    placement: ["La bille blanche est en ", " et la bille rouge en ", "."],
    lancerDirect: "On frappe la bille blanche : elle roule en ligne droite dans la direction et le sens du vecteur ",
    lancerInverse: "On veut frapper la bille blanche pour qu'elle roule en ligne droite dans la direction et le sens d'un vecteur ",
    modele: "On assimile les deux billes à des points.",
    mobile: "la bille blanche",
    cible: "la bille rouge",
    deCible: "de la bille rouge",
    verbe: "touche",
    question: "La bille blanche touche-t-elle la bille rouge ?",
  },
  laser: {
    intro: "Une salle est vue de dessus, dans un repère d'origine O (centre de la salle, unité : 1 m).",
    placement: ["Un laser est fixé en ", " et un capteur en ", "."],
    lancerDirect: "Le laser émet un rayon rectiligne dans la direction et le sens du vecteur ",
    lancerInverse: "On veut orienter le laser pour que son rayon rectiligne parte dans la direction et le sens d'un vecteur ",
    modele: "On assimile le laser et le capteur à des points.",
    mobile: "le rayon",
    cible: "le capteur",
    deCible: "du capteur",
    verbe: "atteint",
    question: "Le rayon atteint-il le capteur ?",
  },
  foot: {
    intro: "Un terrain de football est vu de dessus, dans un repère d'origine O (coin du terrain, unité : 5 m).",
    placement: ["Un joueur a le ballon en ", " ; un coéquipier attend, immobile, en ", "."],
    lancerDirect: "Le joueur fait une passe au ras du sol : le ballon roule en ligne droite dans la direction et le sens du vecteur ",
    lancerInverse: "Le joueur veut faire une passe au ras du sol : le ballon roulera en ligne droite dans la direction et le sens d'un vecteur ",
    modele: "On assimile le ballon et le coéquipier à des points.",
    mobile: "le ballon",
    cible: "le coéquipier",
    deCible: "du coéquipier",
    verbe: "arrive sur",
    question: "Le ballon arrive-t-il sur le coéquipier ?",
  },
  curling: {
    intro: "Une piste de curling est vue de dessus, dans un repère d'origine O (coin de la piste, unité : 1 m).",
    placement: ["Une pierre est lancée depuis ", " ; une pierre adverse est immobile en ", "."],
    lancerDirect: "La pierre lancée glisse en ligne droite dans la direction et le sens du vecteur ",
    lancerInverse: "La pierre lancée doit glisser en ligne droite dans la direction et le sens d'un vecteur ",
    modele: "On assimile les pierres à des points.",
    mobile: "la pierre lancée",
    cible: "la pierre adverse",
    deCible: "de la pierre adverse",
    verbe: "percute",
    question: "La pierre lancée percute-t-elle la pierre adverse ?",
  },
};

/** But du lancer : « que la bille blanche touche la bille rouge ». */
function but(e: ExerciceViserCible): string {
  const c = CONTEXTES[e.situation];
  return `${c.mobile} ${c.verbe} ${c.cible}`;
}

/** Données de la situation (écran et papier). */
export function enonceFragments(e: ExerciceViserCible): FragmentConsigne[] {
  const c = CONTEXTES[e.situation];
  // L'unité « m » (mètre) de l'introduction reste en texte : seule la dernière phrase parle du paramètre m.
  return [
    texte(`${c.intro} ${c.placement[0]}`),
    latex(pointLatex("A", e.A)),
    texte(c.placement[1]),
    latex(pointLatex("C", e.C)),
    texte(`${c.placement[2]} ${e.sens === "directe" ? c.lancerDirect : c.lancerInverse}`),
    latex(uEnonceLatex(e)),
    ...variablesEnLatex([texte(e.sens === "directe" ? `. ${c.modele}` : `, où m est un nombre à choisir. ${c.modele}`)]),
  ];
}

/** Question de la situation (en-tête de l'écran). */
export function consigneGenerale(e: ExerciceViserCible): FragmentConsigne[] {
  if (e.sens === "directe") return [texte(CONTEXTES[e.situation].question)];
  return variablesEnLatex([texte(`Quelle valeur faut-il donner à m pour que ${but(e)} ?`)]);
}

/** Question de l'énoncé papier (consigne globale). */
export function questionPapier(e: ExerciceViserCible): FragmentConsigne[] {
  if (e.sens === "directe") return [texte(`${CONTEXTES[e.situation].question} Justifie par un calcul vectoriel.`)];
  return variablesEnLatex([texte(`Détermine la valeur de m pour que ${but(e)}, ou justifie qu'aucune valeur de m ne convient.`)]);
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export function titresEcrans(e: ExerciceViserCible): string[] {
  return e.sens === "directe"
    ? ["Le vecteur à comparer", "Les composantes de AC", "Le test de colinéarité", "La conclusion"]
    : ["Le vecteur à comparer", "Les composantes de AC", "La condition", "La valeur de m", "La conclusion"];
}

export function consigneEcran(e: ExerciceViserCible, type: TypeEcranViserCible): FragmentConsigne[] {
  return variablesEnLatex(consigneEcranBrute(e, type));
}

function consigneEcranBrute(e: ExerciceViserCible, type: TypeEcranViserCible): FragmentConsigne[] {
  switch (type) {
    case "vecteur":
      return e.sens === "directe"
        ? [texte("Quel vecteur faut-il comparer à "), latex(U), texte(` pour savoir si ${but(e)} ?`)]
        : [texte(`Pour que ${but(e)}, à quel vecteur `), latex(U), texte(" doit-il être colinéaire, et de même sens ?")];
    case "composantes":
      return [texte("Calcule les composantes de "), latex(AC), texte(".")];
    case "test":
      return [
        texte("Teste la colinéarité de "),
        latex(U),
        texte(" et "),
        latex(AC),
        texte(" avec le critère du cours. S'ils sont colinéaires, donne le nombre k tel que "),
        latex(`${AC} = k \\cdot ${U}`),
        texte("."),
      ];
    case "condition":
      return [texte("Écris la condition de colinéarité de "), latex(U), texte(" et "), latex(AC), texte(" (critère du cours) : c'est une équation d'inconnue m.")];
    case "parametre":
      return [texte("Résous cette équation : donne la valeur de m.")];
    case "conclusion":
      return e.sens === "directe"
        ? [texte("Conclus dans le contexte.")]
        : [texte("Avec cette valeur de m, cherche le nombre k tel que "), latex(`${AC} = k \\cdot ${U}`), texte(", puis conclus dans le contexte.")];
  }
}

export const LIBELLES_VECTEURS: Record<OptionVecteur, string> = { AC: "\\vec{AC}", CA: "\\vec{CA}", OC: "\\vec{OC}" };

/** Constat seul, sans « Oui / Non » (corrigé). */
export function phraseConclusionDirecte(e: ExerciceViserCible, v: VerdictDirect): string {
  const c = CONTEXTES[e.situation];
  if (v === "touche") return `${but(e)}.`;
  if (v === "cote") return `${c.mobile} passe à côté ${c.deCible}.`;
  return `${c.cible} est sur la bonne droite, mais derrière A — ${c.mobile} part dans le mauvais sens.`;
}

export function libelleConclusionDirecte(e: ExerciceViserCible, v: VerdictDirect): string {
  return `${v === "touche" ? "Oui" : "Non"} : ${phraseConclusionDirecte(e, v)}`;
}

export type ChoixConclusionInverse = VerdictInverse | "cote";

export function libelleConclusionInverse(e: ExerciceViserCible, v: ChoixConclusionInverse): FragmentConsigne[] {
  return variablesEnLatex([texte(libelleConclusionInverseTexte(e, v))]);
}

function libelleConclusionInverseTexte(e: ExerciceViserCible, v: ChoixConclusionInverse): string {
  const c = CONTEXTES[e.situation];
  if (v === "possible") return `Cette valeur de m convient : ${but(e)}.`;
  if (v === "impossible") return `Aucune valeur de m ne convient : avec cette valeur, ${c.mobile} part dans le mauvais sens, à l'opposé ${c.deCible}.`;
  return `Cette valeur de m ne convient pas : ${c.mobile} passe à côté ${c.deCible}.`;
}

export const OPTIONS_CONCLUSION_DIRECTE: VerdictDirect[] = ["touche", "cote", "derriere"];
export const OPTIONS_CONCLUSION_INVERSE: ChoixConclusionInverse[] = ["possible", "impossible", "cote"];

// ---------------------------------------------------------------------------------------------
// Réponses attendues (affichées après un écran clos ; récapitulatif)
// ---------------------------------------------------------------------------------------------

export function resultatTestFragments(e: ExerciceViserCible): FragmentConsigne[] {
  const c = critere(e);
  if (c !== 0) return [texte("critère : "), latex(`${critereSubstitueLatex(e)} = ${nombreLatex(c)} \\neq 0`), texte(" — non colinéaires.")];
  return [texte("critère : "), latex(`${critereSubstitueLatex(e)} = 0`), texte(" — colinéaires, "), latex(`${AC} = ${kLatex(e)} \\cdot ${U}`), texte(".")];
}

export function reponseAttendueFragments(e: ExerciceViserCible, type: TypeEcranViserCible): FragmentConsigne[] {
  switch (type) {
    case "vecteur":
      return [latex(AC)];
    case "composantes":
      return [latex(acLatex(e))];
    case "test":
      return resultatTestFragments(e);
    case "condition":
      return [latex(conditionSubstitueeLatex(e))];
    case "parametre":
      return [latex(`m = ${nombreLatex(solutionM(e))}`)];
    case "conclusion":
      return e.sens === "directe" ? [texte(libelleConclusionDirecte(e, verdictDirect(e)))] : libelleConclusionInverse(e, verdictInverse(e));
  }
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours un calcul ou un choix à faire)
// ---------------------------------------------------------------------------------------------

/** Composante de comparaison pour k : celle de u⃗ qui est connue (x en sens direct). */
function composanteK(e: ExerciceViserCible): "x" | "y" {
  return e.inconnue === "x" ? "y" : "x";
}

const REGLE_SENS: FragmentConsigne[] = [
  texte("Le signe de k donne le sens : si "),
  latex("k > 0"),
  texte(", "),
  latex(AC),
  texte(" et "),
  latex(U),
  texte(" ont le même sens (la cible est devant A) ; si "),
  latex("k < 0"),
  texte(", ils sont de sens contraires (la cible est derrière A)."),
];

export function aidesEcran(e: ExerciceViserCible, type: TypeEcranViserCible): FragmentConsigne[][] {
  return aidesBrutes(e, type).map(variablesEnLatex);
}

function aidesBrutes(e: ExerciceViserCible, type: TypeEcranViserCible): FragmentConsigne[][] {
  const ac = vecteurAC(e);
  switch (type) {
    case "vecteur":
      return [
        [texte("La trajectoire part de A. Un point M est sur la trajectoire si le déplacement de A vers M a la direction et le sens de "), latex(U), texte(".")],
        [texte("Un vecteur issu de l'origine O ne dépend pas du point de départ A ; un vecteur qui va de la cible vers A décrit le trajet à l'envers.")],
      ];
    case "composantes":
      return [
        [texte("Composantes d'un vecteur défini par deux points, extrémité moins origine : "), latex(`${AC}${colonneLatex("x_C - x_A", "y_C - y_A")}`)],
        [texte("Avec les coordonnées de l'énoncé : "), latex(`${AC}${colonneLatex(`${nombreLatex(e.C.x)} - ${facteurLatex(e.A.x)}`, `${nombreLatex(e.C.y)} - ${facteurLatex(e.A.y)}`)}`)],
      ];
    case "test":
      return [
        [
          texte("Critère du cours : "),
          latex(U),
          texte(" et "),
          latex(AC),
          texte(" sont colinéaires si, et seulement si, ce nombre vaut 0 : "),
          latex(FORMULE_CRITERE),
          texte(". S'ils le sont, k se lit sur une composante : "),
          latex("x_{AC} = k \\cdot x_u"),
        ],
        [texte("Avec les composantes de "), latex(U), texte(" et de "), latex(AC), texte(" : "), latex(critereSubstitueLatex(e))],
      ];
    case "condition": {
      const c = composanteConnue(e);
      const xu = e.inconnue === "x" ? "m" : nombreLatex(c);
      const yu = e.inconnue === "y" ? "m" : nombreLatex(c);
      return [
        [texte("Critère du cours, égal à 0, avec m dans les composantes de "), latex(U), texte(" : "), latex(`${FORMULE_CRITERE} = 0`)],
        [texte("Les composantes à remplacer : "), latex(`x_u = ${xu}`), texte(", "), latex(`y_u = ${yu}`), texte(", "), latex(`x_{AC} = ${nombreLatex(ac.x)}`), texte(" et "), latex(`y_{AC} = ${nombreLatex(ac.y)}`), texte(".")],
      ];
    }
    case "parametre":
      return [
        [texte("Équation du premier degré : calcule les produits connus, regroupe le terme en m d'un côté et le nombre de l'autre.")],
        [texte("Après simplification, l'équation devient : "), latex(conditionIsoleeLatex(e))],
      ];
    case "conclusion":
      if (e.sens === "directe") {
        return [[texte("Critère non nul : la cible n'est pas sur la droite du lancer. Critère nul : elle est sur cette droite, devant ou derrière A.")], REGLE_SENS];
      }
      return [
        [texte("Avec la valeur de m trouvée, compare les composantes où il n'y a pas m : "), latex(composanteK(e) === "x" ? `x_{AC} = k \\cdot x_u` : `y_{AC} = k \\cdot y_u`)],
        REGLE_SENS,
      ];
  }
}
