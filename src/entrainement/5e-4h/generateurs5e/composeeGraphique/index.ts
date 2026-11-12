import type { Composition, CourbeGraphique, ExerciceComposeeGraphique, QuestionComposeeGraphique } from "../../core5e/composeeGraphique.types";
import { choisirParmi, entierAleatoire } from "../domaineDefinition/aleatoire";
import { X_MAX_CADRE, X_MIN_CADRE, domaineCourbe, genererCourbeJagged, genererDomaineRestreint, imageCourbe } from "./courbes";

/** Un candidat de question — toutes les combinaisons (composition, a) possibles, calculées à
 * partir des 2 courbes déjà générées, AVANT sélection des questions réellement posées. */
interface Candidat {
  composition: Composition;
  a: number;
  bAttendu: number;
  resultatExiste: boolean;
  resultatAttendu: number | null;
}

function candidatsPourComposition(composition: Composition, interne: CourbeGraphique, externe: CourbeGraphique): Candidat[] {
  const [xExterneMin, xExterneMax] = domaineCourbe(externe);
  return interne.points.map((p) => {
    const bAttendu = p.y;
    const resultatExiste = bAttendu >= xExterneMin && bAttendu <= xExterneMax;
    const resultatAttendu = resultatExiste ? (imageCourbe(externe, bAttendu) as number) : null;
    return { composition, a: p.x, bAttendu, resultatExiste, resultatAttendu };
  });
}

function versQuestion(c: Candidat): QuestionComposeeGraphique {
  return { composition: c.composition, a: c.a, bAttendu: c.bAttendu, resultatExiste: c.resultatExiste, resultatAttendu: c.resultatAttendu };
}

/** Mélange de Fisher-Yates (copie). */
function melanger<T>(t: T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = entierAleatoire(0, i);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Au plus ce nombre de questions « n'existe pas » par exercice (audit du chapitre 1 de 5e,
 * décision H : 14 % des exercices en avaient 4 sur 4). */
export const MAX_HORS_DOMAINE = 2;

/**
 * Sélectionne 4-5 questions : 1 ou 2 hors domaine (« n'existe pas »), le reste avec un résultat qui
 * existe, les 2 sens de composition représentés, puis l'ORDRE est mélangé (le piège était toujours en
 * question 1). Retourne `null` si les courbes ne permettent pas ce dosage (l'appelant tire alors
 * d'autres courbes).
 */
function selectionnerQuestions(candidatsFRondG: Candidat[], candidatsGRondF: Candidat[]): QuestionComposeeGraphique[] | null {
  const tous = [...candidatsFRondG, ...candidatsGRondF];
  const horsDomaine = melanger(tous.filter((c) => !c.resultatExiste));
  const existants = melanger(tous.filter((c) => c.resultatExiste));
  if (horsDomaine.length === 0) return null;

  const nombreTotal = entierAleatoire(4, 5);
  const nombreHors = Math.min(entierAleatoire(1, MAX_HORS_DOMAINE), horsDomaine.length);
  const questions: Candidat[] = horsDomaine.slice(0, nombreHors);
  const pris = new Set<Candidat>(questions);

  // Chaque sens absent des questions hors domaine reçoit une question dont le résultat existe.
  for (const sens of ["fRondG", "gRondF"] as Composition[]) {
    if (questions.some((q) => q.composition === sens)) continue;
    const c = existants.find((e) => e.composition === sens && !pris.has(e));
    if (!c) return null;
    questions.push(c);
    pris.add(c);
  }
  for (const c of existants) {
    if (questions.length >= nombreTotal) break;
    if (!pris.has(c)) {
      questions.push(c);
      pris.add(c);
    }
  }
  if (questions.length < 4) return null;
  return melanger(questions).map(versQuestion);
}

const TENTATIVES_MAX = 100;

/** Force quelle courbe (f ou g) porte le domaine RESTREINT — le seul point de tirage de haut
 * niveau réellement présent dans ce générateur (voir le panneau dev-only `SelecteurVarianteDev`,
 * CLAUDE.md section 5gen4). */
export function construireAvecRestreinte(restreinte: "f" | "g"): ExerciceComposeeGraphique {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const [xRestreintMin, xRestreintMax] = genererDomaineRestreint();

    const courbeRestreinte = genererCourbeJagged(xRestreintMin, xRestreintMax, entierAleatoire(-5, 5));
    const courbeLarge = genererCourbeJagged(X_MIN_CADRE, X_MAX_CADRE, entierAleatoire(-5, 5));

    const f = restreinte === "f" ? courbeRestreinte : courbeLarge;
    const g = restreinte === "g" ? courbeRestreinte : courbeLarge;

    const candidatsFRondG = candidatsPourComposition("fRondG", g, f);
    const candidatsGRondF = candidatsPourComposition("gRondF", f, g);

    const questions = selectionnerQuestions(candidatsFRondG, candidatsGRondF);
    if (questions === null) continue;

    return { f, g, restreinte, questions };
  }
  throw new Error("construireAvecRestreinte : impossible d'obtenir une instance avec un piège hors domaine après " + TENTATIVES_MAX + " tentatives");
}

export function genererExerciceComposeeGraphique(): ExerciceComposeeGraphique {
  return construireAvecRestreinte(choisirParmi(["f", "g"]));
}
