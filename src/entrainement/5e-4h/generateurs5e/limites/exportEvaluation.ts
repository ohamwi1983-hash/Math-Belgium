import type { ExerciceLimite, ExerciceLimiteFormeIndeterminee, ExerciceLimiteInfini, ExerciceLimiteInfiniePoint, ExerciceLimiteReelle } from "../../core5e/limites.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consignePhase,
  formatBlocDonneesLatex,
  formatReponseAttenduePhaseLatex,
  formatTermesEtatActuelLatex,
  LIBELLE_FAMILLE_LIMITE,
  texteAideNiveau1,
} from "../../ui5e/formatLimites";
import { ordreComplet, type PhaseLimite } from "../../moteur5e/typesLimites";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimite } from "./index";
import { LIBELLE_CAS_LIMITES, profilLimite } from "../profilsEvaluationLimites20-21";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimite>` pour 5gen20 (Limites, reconnaissance et
 * calcul) — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la limite (bloc display `\lim_{x\to…}`) et la consigne globale « Détermine cette
 * limite en justifiant ta démarche ». Les écrans du générateur (reconnaître la forme, factoriser,
 * étudier les signes, terme dominant…) sont des étapes d'APPRENTISSAGE : ils passent dans le corrigé
 * (« Étape n — consigne », une étape par phase de `ordreComplet`, mêmes consignes que l'écran).
 *
 * Toutes les valeurs viennent des fonctions de l'écran : `formatReponseAttenduePhaseLatex` (réponses
 * attendues), `formatTermesEtatActuelLatex` (états intermédiaires), `consignePhase` et
 * `texteAideNiveau1` (méthodes) ; seules les valeurs de substitution N(a) et D(a) sont évaluées ici,
 * depuis les coefficients de l'instance.
 *
 * `regroupable` : non — le bloc `\lim_{x\to a}` a besoin du mode display, que seul le chemin non
 * regroupé conserve (en-tête formé d'une formule seule).
 */

const LETTRES = "abcdefgh";

/** Phrase RichText de l'écran (`$…$` = LaTeX en ligne) → fragments texte/LaTeX. */
function fragmentsRiches(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau)))
    .filter((f) => f.valeur !== "");
}

function etapes(exercice: ExerciceLimite): PhaseLimite[] {
  return ordreComplet(exercice);
}

function lettre(exercice: ExerciceLimite, phase: PhaseLimite): string {
  return LETTRES[etapes(exercice).indexOf(phase)] ?? "a";
}

function construireEnonceLimite(exercice: ExerciceLimite): SectionExercice {
  return {
    enteteFragments: [latex(formatBlocDonneesLatex(exercice))],
    questions: etapes(exercice).map((phase) => ({ consigne: [texte(consignePhase(exercice, phase))] })),
  };
}

const CONSIGNE_PAPIER = "Détermine cette limite en justifiant ta démarche.";

function enoncePapierLimite(exercice: ExerciceLimite): EnoncePapier {
  return {
    section: { enteteFragments: [latex(formatBlocDonneesLatex(exercice))], questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }] },
    etapesParQuestion: [etapes(exercice).map((p) => lettre(exercice, p))],
  };
}

// ---------------------------------------------------------------------------------------------
// Valeurs de substitution.
// ---------------------------------------------------------------------------------------------

function valeurReelle(e: ExerciceLimiteReelle): { n: number; d: number } {
  return { n: e.kN * e.a + e.bN, d: e.kD * e.a + e.bD };
}

/** Dernière réponse attendue : la limite elle-même (`\lim=…`). */
function limiteFinaleLatex(exercice: ExerciceLimite): string {
  const ordre = etapes(exercice);
  const derniere = formatReponseAttenduePhaseLatex(exercice, ordre[ordre.length - 1]);
  if (exercice.famille === "limiteInfini" && exercice.sousCas === "degresEgaux") return `\\lim=${derniere[0]}`;
  return derniere[0];
}

function reponseBreveLimite(exercice: ExerciceLimite): FragmentConsigne[] {
  if (exercice.famille === "limiteInfiniePoint" && exercice.sousCas === "racineSimple") {
    const [gauche, droite] = formatReponseAttenduePhaseLatex(exercice, "limitesGaucheDroite");
    return [latex(gauche), texte(" et "), latex(droite), texte(" : la limite n'existe pas.")];
  }
  return [latex(limiteFinaleLatex(exercice))];
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé, par famille.
// ---------------------------------------------------------------------------------------------

function etapesReelle(e: ExerciceLimiteReelle): EtapeCorrection[] {
  const { n, d } = valeurReelle(e);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On remplace x par "), latex(`${e.a}`), texte(" : si le dénominateur ne s'annule pas, la limite est la valeur obtenue.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [texte("Numérateur : "), latex(`${n}`), texte(" ; dénominateur : "), latex(`${d} \\neq 0`), texte(".")] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(limiteFinaleLatex(e)), texte(" (nombre réel).")] },
    {
      label: "Piège",
      sousQuestion: "a",
      fragments: [texte("Vérifier d'abord que le dénominateur ne s'annule pas en "), latex(`x = ${e.a}`), texte(" : c'est ce qui autorise la substitution directe.")],
    },
  ];
}

function etapesFormeIndeterminee(e: ExerciceLimiteFormeIndeterminee): EtapeCorrection[] {
  const [etatSimplifie] = formatTermesEtatActuelLatex(e, "simplifierEvaluer") ?? [];
  return [
    { label: "Lecture", sousQuestion: "a", fragments: [texte("En "), latex(`x = ${e.a}`), texte(", le numérateur et le dénominateur valent 0 : forme indéterminée « 0/0 ».")] },
    { label: "Piège", sousQuestion: "a", fragments: [texte("« 0/0 » n'est pas un résultat : c'est une forme indéterminée, qu'on lève en factorisant puis en simplifiant.")] },
    { label: "Méthode", sousQuestion: "b", fragments: fragmentsRiches(texteAideNiveau1(e, "factoriser")) },
    { label: "Calcul", sousQuestion: "b", fragments: formatReponseAttenduePhaseLatex(e, "factoriser").flatMap((t, i) => [...(i ? [texte(" et ")] : []), latex(t)]) },
    { label: "Calcul", sousQuestion: "c", fragments: [...(etatSimplifie ? [latex(etatSimplifie)] : []), texte(" : on simplifie par "), latex(e.a === 0 ? "x" : `(x${e.a < 0 ? "+" : "-"}${Math.abs(e.a)})`), texte(", puis on remplace x par "), latex(`${e.a}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(limiteFinaleLatex(e)), texte(".")] },
  ];
}

function etapesInfiniePoint(e: ExerciceLimiteInfiniePoint): EtapeCorrection[] {
  const n = e.kN * e.a + e.bN;
  const [gauche, droite] = formatReponseAttenduePhaseLatex(e, "limitesGaucheDroite");
  const simple = e.sousCas === "racineSimple";
  return [
    {
      label: "Lecture",
      sousQuestion: "a",
      fragments: [texte("En "), latex(`x = ${e.a}`), texte(", le numérateur vaut "), latex(`${n} \\neq 0`), texte(" et le dénominateur vaut 0 : "), texte(`${LIBELLE_FAMILLE_LIMITE.limiteInfiniePoint.toLowerCase()}.`)],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(formatReponseAttenduePhaseLatex(e, "factoriserDenominateur")[0]), texte(simple ? " (deux racines distinctes)." : " (racine double).")] },
    { label: "Méthode", sousQuestion: "c", fragments: fragmentsRiches(texteAideNiveau1(e, "limitesGaucheDroite")) },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(gauche), texte(" et "), latex(droite), texte(".")] },
    {
      label: "Conclusion",
      sousQuestion: "d",
      fragments: simple
        ? [texte("Les limites à gauche et à droite sont différentes : "), latex(limiteFinaleLatex(e)), texte(" (la limite n'existe pas).")]
        : [texte("Les deux limites sont égales : "), latex(limiteFinaleLatex(e)), texte(".")],
    },
    {
      label: "Piège",
      sousQuestion: simple ? "c" : "d",
      fragments: simple
        ? [texte("Pour une racine simple, le dénominateur change de signe en "), latex(`x = ${e.a}`), texte(" : il faut étudier les deux côtés, les deux limites diffèrent.")]
        : [texte("Pour une racine double, le carré garde le même signe des deux côtés : une seule limite, pas « n'existe pas ».")],
    },
  ];
}

function etapesInfini(e: ExerciceLimiteInfini): EtapeCorrection[] {
  const egaux = e.sousCas === "degresEgaux";
  const [etatRapport] = formatTermesEtatActuelLatex(e, "simplifierLimiteRef") ?? [];
  const rapport = formatReponseAttenduePhaseLatex(e, "simplifierLimiteRef")[0];
  const lignes: EtapeCorrection[] = [
    { label: "Lecture", sousQuestion: "a", fragments: [texte("Quand x tend vers l'infini, le numérateur et le dénominateur tendent vers l'infini : forme indéterminée « ∞/∞ ».")] },
    { label: "Méthode", sousQuestion: "b", fragments: fragmentsRiches(texteAideNiveau1(e, "termeDominant")) },
    { label: "Calcul", sousQuestion: "b", fragments: formatReponseAttenduePhaseLatex(e, "termeDominant").flatMap((t, i) => [...(i ? [texte(" ; ")] : []), latex(t)]) },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: !etatRapport
        ? [latex(rapport), texte(".")]
        : egaux
          ? [latex(`${etatRapport} = ${rapport}`), texte(".")]
          : [latex(etatRapport), texte(" ; après simplification, il reste "), latex(rapport), texte(".")],
    },
  ];
  if (egaux) {
    lignes.push({ label: "Conclusion", sousQuestion: "c", fragments: [texte("Même degré : la limite est le rapport des coefficients dominants, "), latex(limiteFinaleLatex(e)), texte(".")] });
    lignes.push({ label: "Piège", sousQuestion: "b", fragments: [texte("On compare les termes de plus haut degré, pas les termes constants.")] });
  } else {
    lignes.push({ label: "Méthode", sousQuestion: "d", fragments: fragmentsRiches(texteAideNiveau1(e, "evaluerLimiteFinale")) });
    lignes.push({ label: "Conclusion", sousQuestion: "d", fragments: [latex(limiteFinaleLatex(e)), texte(".")] });
    lignes.push({
      label: "Piège",
      sousQuestion: "d",
      fragments:
        e.sousCas === "numerateurPlusGrand"
          ? [texte("Le signe dépend du coefficient ET, pour une puissance impaire de x, du sens : "), latex(e.direction === "plus" ? "x\\to+\\infty" : "x\\to-\\infty"), texte(".")]
          : [texte("Numérateur de degré plus petit : la limite vaut 0, pas le rapport des coefficients.")],
    });
  }
  return lignes;
}

/** Lignes dans l'ordre des étapes (une ligne « Piège » se lit sous l'étape qu'elle concerne). */
function parEtape(lignes: EtapeCorrection[]): EtapeCorrection[] {
  return lignes.map((l, i) => ({ l, i })).sort((x, y) => (x.l.sousQuestion ?? "a").localeCompare(y.l.sousQuestion ?? "a") || x.i - y.i).map(({ l }) => l);
}

function correctionDetailleeLimite(exercice: ExerciceLimite): EtapeCorrection[] {
  return parEtape(lignesCorrigeLimite(exercice));
}

function lignesCorrigeLimite(exercice: ExerciceLimite): EtapeCorrection[] {
  switch (exercice.famille) {
    case "limiteReelle":
      return etapesReelle(exercice);
    case "formeIndeterminee":
      return etapesFormeIndeterminee(exercice);
    case "limiteInfiniePoint":
      return etapesInfiniePoint(exercice);
    case "limiteInfini":
      return etapesInfini(exercice);
  }
}

// ---------------------------------------------------------------------------------------------
// Barème, difficulté.
// ---------------------------------------------------------------------------------------------

function baremeLimite(exercice: ExerciceLimite): BaremeExercice {
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  let criteres: CritereBareme[];
  const erreurs: ErreurFrequente[] = [];
  const acceptees: FragmentConsigne[][] = [];
  switch (exercice.famille) {
    case "limiteReelle":
      criteres = [c("a", "Dénominateur non nul vérifié (substitution directe permise)", 1), c("a", "Numérateur et dénominateur évalués", 1.5), c("a", "Limite exacte et simplifiée", 1.5)];
      erreurs.push({ description: [texte("Conclure sans vérifier que le dénominateur ne s'annule pas")], cout: "−1" });
      acceptees.push([texte("Valeur décimale arrondie au centième")]);
      break;
    case "formeIndeterminee":
      criteres = [c("a", "Forme 0/0 reconnue", 1), c("b", "Numérateur et dénominateur factorisés", 1.5), c("c", "Facteur commun simplifié et limite exacte", 1.5)];
      erreurs.push({ description: [texte("Écrire « limite = 0/0 » ou « la limite n'existe pas »")], cout: "0 pt sur la conclusion" });
      break;
    case "limiteInfiniePoint":
      criteres =
        exercice.sousCas === "racineSimple"
          ? [c("a", "Forme k/0 reconnue", 0.5), c("b", "Dénominateur factorisé", 1), c("c", "Limites à gauche et à droite (signes justifiés)", 1.5), c("d", "Conclusion : la limite n'existe pas", 1)]
          : [c("a", "Forme k/0 reconnue", 0.5), c("b", "Dénominateur factorisé (racine double)", 1), c("c", "Signe du numérateur et du dénominateur des deux côtés", 1.5), c("d", "Conclusion : limite infinie et son signe", 1)];
      erreurs.push({ description: [texte("Oublier une des deux limites latérales, ou se tromper de signe")], cout: "−0,5 par limite" });
      if (exercice.sousCas === "racineDouble") erreurs.push({ description: [texte("Conclure « n'existe pas » alors que les deux limites sont égales")], cout: "0 pt sur la conclusion" });
      break;
    case "limiteInfini":
      criteres =
        exercice.sousCas === "degresEgaux"
          ? [c("a", "Forme ∞/∞ reconnue", 0.5), c("b", "Termes dominants du numérateur et du dénominateur", 1.5), c("c", "Rapport des coefficients dominants : limite exacte", 2)]
          : [c("a", "Forme ∞/∞ reconnue", 0.5), c("b", "Termes dominants du numérateur et du dénominateur", 1), c("c", "Rapport des termes dominants simplifié", 1.5), c("d", "Conclusion (valeur ou infini et son signe)", 1)];
      erreurs.push({ description: [texte("Comparer les termes constants au lieu des termes de plus haut degré")], cout: "0 pt sur b)" });
      if (exercice.sousCas === "numerateurPlusGrand") erreurs.push({ description: [texte("Signe de l'infini sans tenir compte du sens (puissance impaire de x)")], cout: "−0,5" });
      break;
  }
  return { reponseFinale: reponseBreveLimite(exercice), criteres, erreursFrequentes: erreurs, reponsesAcceptees: acceptees };
}

function difficulteLimite(exercice: ExerciceLimite): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "limiteReelle":
      return 1;
    case "formeIndeterminee":
      return 2;
    case "limiteInfiniePoint":
      return exercice.sousCas === "racineSimple" ? 3 : 2;
    case "limiteInfini":
      return exercice.sousCas === "numerateurPlusGrand" && exercice.degreResultat % 2 === 1 && exercice.direction === "moins" ? 3 : 2;
  }
}

/** Ancien corrigé (repli, documents Word) : les étapes du corrigé détaillé, en paragraphes. */
function construireCorrectionLimite(exercice: ExerciceLimite): BlocCorrection[] {
  return correctionDetailleeLimite(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationLimites: AdaptateurFeuilleExercices<ExerciceLimite> = {
  titreDocument: "Limites, reconnaissance et calcul — Évaluation",
  nomFichierBase: "limites",
  genererInstance: genererExerciceLimite,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceLimite,
  construireCorrection: construireCorrectionLimite,
  difficulte: difficulteLimite,
  reponseBreve: reponseBreveLimite,
  correctionDetaillee: correctionDetailleeLimite,
  bareme: baremeLimite,
  enoncePapier: enoncePapierLimite,
  dureeMinutes: 6,
  profilInstance: profilLimite,
  libelleCasParticulier: LIBELLE_CAS_LIMITES,
};
