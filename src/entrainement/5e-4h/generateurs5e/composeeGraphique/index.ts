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

/**
 * Sélectionne 4-5 questions parmi tous les candidats — garantit AU MOINS une question hors domaine
 * et les 2 sens de composition représentés (jamais un tirage purement aléatoire qui pourrait
 * produire zéro piège ou un seul sens par hasard, contrainte explicite de la spec). Retourne `null`
 * si aucun candidat hors domaine n'existe (l'appelant reroll alors les courbes elles-mêmes).
 */
function selectionnerQuestions(candidatsFRondG: Candidat[], candidatsGRondF: Candidat[]): QuestionComposeeGraphique[] | null {
  const tous = [...candidatsFRondG, ...candidatsGRondF];
  const horsDomaine = tous.filter((c) => !c.resultatExiste);
  if (horsDomaine.length === 0) return null;

  const nombreTotal = entierAleatoire(4, 5);
  const dejaChoisis = new Set<string>();
  const questions: Candidat[] = [];

  function cle(c: Candidat): string {
    return `${c.composition}:${c.a}`;
  }
  function ajouter(c: Candidat) {
    dejaChoisis.add(cle(c));
    questions.push(c);
  }

  ajouter(choisirParmi(horsDomaine));

  const restants = () => tous.filter((c) => !dejaChoisis.has(cle(c)));

  while (questions.length < nombreTotal) {
    const dispo = restants();
    if (dispo.length === 0) break;
    ajouter(choisirParmi(dispo));
  }

  // Garantit les 2 sens représentés — force un échange si un seul sens est présent.
  const sensPresents = new Set(questions.map((q) => q.composition));
  if (sensPresents.size < 2) {
    const sensManquant: Composition = questions[0].composition === "fRondG" ? "gRondF" : "fRondG";
    const candidatManquant = tous.find((c) => c.composition === sensManquant && !dejaChoisis.has(cle(c)));
    if (candidatManquant) {
      // remplace la DERNIÈRE question qui n'est pas le piège hors-domaine obligatoire (index 0)
      const indexRemplace = questions.length > 1 ? questions.length - 1 : -1;
      if (indexRemplace >= 0) questions[indexRemplace] = candidatManquant;
    }
  }

  return questions.map(versQuestion);
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
