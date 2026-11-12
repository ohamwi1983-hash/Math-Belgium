import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleD, ExerciceTiragesArbres, FractionExacte } from "../../core6e/tiragesArbres.types";
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
import {
  aideNiveau2,
  branchesArbreD,
  cheminsEcran3A,
  choixBienPlaces,
  consigneEcran,
  consigneGenerale,
  couleurD,
  equationsC,
  facesDe,
  facesEcran3,
  factorielle,
  formatReponseAttenduePhaseLatex,
  fractionsA,
  fx,
  objetB,
  probCheminFraction,
  probFaceFraction,
  produitLatex,
  questionEcran3A,
  reduire,
  singulier,
  toutesMalPlacees,
} from "../../ui6e/formatTiragesArbres";
import { arbreTiragesSvg } from "../../ui6e/figuresTiragesArbres";
import type { EtiquetteBranche } from "../../ui6e/figuresTiragesArbres";
import { phasesPourExercice } from "../../moteur6e/typesTiragesArbres";
import type { PhaseTiragesArbres } from "../../moteur6e/typesTiragesArbres";
import { LIBELLE_CAS_TIRAGES_ARBRES, profilTiragesArbres } from "../profilsEvaluationTiragesArbres";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTiragesArbres } from "./index";
import type { IdVarianteTiragesArbres } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTiragesArbres>` pour `6gen31` (Tirages et arbres) —
 * méthode `.claude/rules/feuilles-evaluations.md` (refonte de l'audit 6e ch. 6, décision I).
 *
 * Énoncé papier = situation + annonce de la précision + les VRAIES questions (chacune une
 * probabilité distincte) ; les étapes de pur guidage passent dans le corrigé :
 * - A : a) même couleur (étapes 1–2 : chemins unicolores, puis somme), b) question de l'écran 3 ;
 * - B : a) à d), une probabilité par écran (positions données, toutes, exactement k, aucune / au
 *   moins 3) ;
 * - C : a) p (et q) — étapes 1–2 : équation(s) puis résolution —, b) probabilité de l'écran 3 ;
 * - D : l'arbre des deux tirages est DONNÉ (structure, branches nommées p₁…p₆ — pas a…f, qui
 *   seraient confondues avec les lettres des questions) : a) les six branches, b) un chemin,
 *   c) exactement une, d) au moins une.
 * Corrigé : « Étape n — consigne », méthode, calcul (expressions des aides de l'écran, effectuées),
 * conclusion en fraction irréductible puis « = » ou « ≈ » décimal à la précision annoncée, piège ;
 * l'arbre complet (fractions sur les branches, probabilité de chaque chemin) en `figureHtml` pour
 * les familles A et D. Jamais de C(n,k) ni de « loi ».
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefghij";
const NBSP = " ";

const PRECISION = "Donne chaque probabilité sous forme exacte (fraction irréductible) ou arrondie au centième (au millième si elle est inférieure à 0,1).";

// ============================================================================
// Valeurs : fraction exacte, puis « = » / « ≈ » décimal à la précision annoncée.
// ============================================================================

/** Valeur du membre de droite d'une réponse LaTeX (`P(…)=\dfrac{a}{b}` ou entier). */
function valeurMembreDroit(l: string): number | null {
  const droite = l.slice(l.lastIndexOf("=") + 1);
  const fr = /^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/.exec(droite);
  if (fr) return (fr[1] ? -1 : 1) * (Number(fr[2]) / Number(fr[3]));
  const n = /^-?\d+$/.exec(droite);
  return n ? Number(droite) : null;
}

function decimal(v: number, chiffres: number): string {
  return v.toFixed(chiffres).replace(".", "{,}");
}

/** « =0{,}25 » (décimal exact court) ou « \approx 0{,}27 » (arrondi annoncé) ; « » pour un entier. */
function suffixeDecimal(v: number): string {
  if (Number.isInteger(v)) return "";
  for (let c = 1; c <= 3; c++) if (Math.abs(v * 10 ** c - Math.round(v * 10 ** c)) < 1e-9) return `=${decimal(v, c)}`;
  return `\\approx ${decimal(v, Math.abs(v) < 0.1 ? 3 : 2)}`;
}

/** Réponse de l'écran (même source que le récapitulatif), suivie de sa valeur décimale. */
function avecDecimal(l: string): string {
  const v = valeurMembreDroit(l);
  return v === null || l.includes("p=") || l.includes("q=") ? l : `${l}${suffixeDecimal(v)}`;
}

function reponse(e: ExerciceTiragesArbres, phase: PhaseTiragesArbres): string[] {
  return formatReponseAttenduePhaseLatex(e, phase);
}

/** Réponse d'un écran en fragments, avec décimales (lignes séparées par « ; »). */
function reponseFragments(e: ExerciceTiragesArbres, phase: PhaseTiragesArbres, decimales = true): FragmentConsigne[] {
  const lignes = reponse(e, phase).map((l) => (decimales ? avecDecimal(l) : l));
  return lignes.flatMap((l, i) => (i === 0 ? [f(l)] : [t(" ; "), f(l)]));
}

/** Membre de droite (fraction irréductible) d'une réponse. */
function droite(l: string): string {
  return l.slice(l.lastIndexOf("=") + 1);
}

function fracReduite(fr: FractionExacte): string {
  return fx(reduire(fr));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

interface QuestionPapier {
  consigne: FragmentConsigne[];
  /** Étapes (écrans) couvertes, lettres a, b, c… dans l'ordre des écrans. */
  etapes: string[];
}

function questionsPapier(e: ExerciceTiragesArbres): QuestionPapier[] {
  const phases = phasesPourExercice(e);
  const lettre = (p: PhaseTiragesArbres) => LETTRES[phases.indexOf(p)];
  switch (e.famille) {
    case "A":
      return [
        { consigne: consigneEcran(e, "aEcran2"), etapes: [lettre("aEcran1"), lettre("aEcran2")] },
        { consigne: consigneEcran(e, "aEcran3"), etapes: [lettre("aEcran3")] },
      ];
    case "B":
      return phases.map((p) => ({ consigne: consigneEcran(e, p), etapes: [lettre(p)] }));
    case "C":
      return [
        { consigne: e.sousType === "special" ? [t("Calcule "), f("p"), t(".")] : [t("Calcule "), f("p"), t(" et "), f("q"), t(".")], etapes: [lettre("cEcran1"), lettre("cEcran2")] },
        { consigne: consigneEcran(e, "cEcran3"), etapes: [lettre("cEcran3")] },
      ];
    case "D":
      return [
        { consigne: [t("Détermine les probabilités "), f("p_1,\\ p_2,\\ \\ldots,\\ p_6"), t(" portées par les branches de l'arbre.")], etapes: ["a"] },
        { consigne: consigneEcran(e, "dEcran2"), etapes: ["b"] },
        { consigne: consigneEcran(e, "dEcran3"), etapes: ["c"] },
        { consigne: consigneEcran(e, "dEcran4"), etapes: ["d"] },
      ];
  }
}

function entetePapier(e: ExerciceTiragesArbres): FragmentConsigne[] {
  const situation = consigneGenerale(e);
  const arbre = e.famille === "D" ? [t(" L'arbre ci-dessous représente les deux tirages ; "), f("p_1,\\ \\ldots,\\ p_6"), t(" désignent les probabilités portées par ses branches.")] : [];
  return [...situation, ...arbre, t(` ${PRECISION}`)];
}

const INDICES = ["₁", "₂", "₃", "₄", "₅", "₆"];
/** Ordre p₁…p₆ = ordre a…f de l'écran (`branchesArbreD`). */
function indiceBrancheD(chemin: number[]): number {
  return chemin.length === 1 ? chemin[0] : 2 + chemin[0] * 2 + chemin[1];
}

function arbreDonneD(e: ExerciceFamilleD): string {
  return arbreTiragesSvg({
    profondeur: 2,
    initiales: [e.initiale1, e.initiale2],
    etiquette: (chemin) => ({ texte: `p${INDICES[indiceBrancheD(chemin)]}` }),
    libelle: "Arbre des deux tirages",
  });
}

function construireEnoncePapier(e: ExerciceTiragesArbres): SectionExercice {
  return {
    enteteFragments: entetePapier(e),
    ...(e.famille === "D" ? { enteteHtml: arbreDonneD(e) } : {}),
    questions: questionsPapier(e).map((q) => ({ consigne: q.consigne })),
  };
}

function reponseBreve(e: ExerciceTiragesArbres): FragmentConsigne[] {
  const phases = phasesPourExercice(e);
  return questionsPapier(e).flatMap((q, i) => {
    const derniere = phases[LETTRES.indexOf(q.etapes[q.etapes.length - 1])];
    const corps = e.famille === "D" && derniere === "dEcran1" ? brancheResume(e) : reponseFragments(e, derniere);
    return [...(i === 0 ? [] : [t(" ; ")]), t(`${LETTRES[i]})${NBSP}`), ...corps];
  });
}

function brancheResume(e: ExerciceFamilleD): FragmentConsigne[] {
  const b = branchesArbreD(e);
  return [f(b.map((fr, i) => `p_${i + 1}=${fracReduite(fr)}`).join(",\\ "))];
}

function enoncePapier(e: ExerciceTiragesArbres): EnoncePapier {
  const qs = questionsPapier(e);
  return { section: construireEnoncePapier(e), etapesParQuestion: qs.map((q) => q.etapes), reponseBreve: reponseBreve(e) };
}

/** Énoncé « par écran » (une sous-question par étape d'apprentissage) — repli des pipelines qui
 * n'utilisent pas `enoncePapier`. */
function construireEnonce(e: ExerciceTiragesArbres): SectionExercice {
  return {
    enteteFragments: entetePapier(e),
    ...(e.famille === "D" ? { enteteHtml: arbreDonneD(e) } : {}),
    questions: phasesPourExercice(e).map((phase) => ({ consigne: phase === "dEcran1" ? questionsPapier(e)[0].consigne : consigneEcran(e, phase) })),
  };
}

function construireCorrection(e: ExerciceTiragesArbres): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...(phase === "dEcran1" ? brancheResume(e as ExerciceFamilleD) : reponseFragments(e, phase))] }));
}

// ============================================================================
// Arbres du corrigé.
// ============================================================================

function arbreCompletUrne(n1: number, n2: number, avecRemise: boolean, profondeur: 2 | 3, initiales: [string, string]): string {
  return arbreTiragesSvg({
    profondeur,
    initiales,
    etiquette: (chemin): EtiquetteBranche => {
      // Branche = proportion de la couleur dans l'urne au moment du tirage (non réduite : la
      // composition de l'urne reste lisible).
      let r1 = n1;
      let r2 = n2;
      for (const c of chemin.slice(0, -1)) {
        if (!avecRemise) {
          if (c === 0) r1--;
          else r2--;
        }
      }
      const c = chemin[chemin.length - 1];
      return { fraction: [c === 0 ? r1 : r2, r1 + r2] };
    },
    feuille: (chemin) => {
      const p = probCheminFraction(n1, n2, avecRemise, chemin);
      return [p.num, p.den];
    },
    libelle: `Arbre des ${profondeur} tirages ${avecRemise ? "avec" : "sans"} remise`,
  });
}

// ============================================================================
// Corrigé détaillé, par famille.
// ============================================================================

function etapesA(e: ExerciceFamilleA): EtapeCorrection[] {
  const { p1, p2, p3 } = fractionsA(e);
  const i1 = e.labelCouleur1.charAt(0).toUpperCase();
  const i2 = e.labelCouleur2.charAt(0).toUpperCase();
  const tous = (c: number) => new Array<number>(e.k).fill(c);
  const urne = e.avecRemise ? "avec remise, l'urne est la même à chaque tirage" : "sans remise, il reste une boule de moins à chaque tirage, et une de moins de la couleur tirée";
  const ra = reponse(e, "aEcran1")[0];
  const rb = reponse(e, "aEcran2")[0];
  const rc = reponse(e, "aEcran3")[0];
  const lignes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [t(`Arbre des ${e.k} tirages (${urne}). « Toutes ${e.labelCouleur1} » est un seul chemin : sa probabilité est le produit des probabilités de ses branches (règle du produit).`)],
      figureHtml: arbreCompletUrne(e.n1, e.n2, e.avecRemise, e.k === 3 ? 3 : 2, [i1, i2]),
    },
    { label: "Calcul", sousQuestion: "a", fragments: [f(`P(${e.k}\\ \\text{${e.labelCouleur1}})=${produitLatex(e.n1, e.n2, e.avecRemise, tous(0))}=${fx(p1)}`)] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(`P(${e.k}\\ \\text{${e.labelCouleur2}})=${produitLatex(e.n1, e.n2, e.avecRemise, tous(1))}=${fx(p2)}`)] },
    { label: "Conclusion", sousQuestion: "a", fragments: [f(avecDecimal(ra)), t(" ; "), f(avecDecimal(reponse(e, "aEcran1")[1]))] },
    { label: "Piège", sousQuestion: "a", fragments: [t(e.avecRemise ? "Additionner les probabilités des branches au lieu de les multiplier le long du chemin." : "Garder la même urne d'un tirage à l'autre : sans remise, le numérateur et le dénominateur diminuent de 1 à chaque tirage.")] },
    { label: "Méthode", sousQuestion: "b", fragments: [t(`« Même couleur » = « toutes ${e.labelCouleur1} » ou « toutes ${e.labelCouleur2} » : deux événements incompatibles, dont on additionne les probabilités.`)] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`P(\\text{même couleur})=${fx(p1)}+${fx(p2)}=${droite(rb)}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [f(avecDecimal(rb))] },
    { label: "Piège", sousQuestion: "b", fragments: [t("Multiplier les deux probabilités : on multiplie le long d'un chemin, on additionne des chemins différents.")] },
  ];
  if (e.questionEcran3 === "auMoinsUne") {
    lignes.push(
      { label: "Méthode", sousQuestion: "c", fragments: [t(`Le contraire de « au moins une boule ${singulier(e.labelCouleur1)} » est « aucune boule ${singulier(e.labelCouleur1)} », c'est-à-dire « toutes ${e.labelCouleur2} » : `), f("P(E)=1-P(\\overline{E})"), t(".")] },
      { label: "Calcul", sousQuestion: "c", fragments: [f(`1-${fx(p2)}=${fx(p3)}`)] },
    );
  } else {
    const chemins = cheminsEcran3A(e);
    const noms = chemins.map((c) => c.map((x) => (x === 0 ? i1 : i2)).join("")).join(", ");
    lignes.push(
      {
        label: "Méthode",
        sousQuestion: "c",
        fragments: [t(`Les chemins avec exactement ${questionEcran3A(e).replace(/^exactement /, "")} sont ${noms} : ${chemins.length} chemins, qui ont tous la même probabilité (mêmes facteurs, dans un autre ordre).`)],
      },
      { label: "Calcul", sousQuestion: "c", fragments: [f(`${chemins.length}\\times ${produitLatex(e.n1, e.n2, e.avecRemise, chemins[0])}=${fx(p3)}`)] },
    );
  }
  lignes.push(
    { label: "Conclusion", sousQuestion: "c", fragments: [f(avecDecimal(rc))] },
    {
      label: "Piège",
      sousQuestion: "c",
      fragments: [t(e.questionEcran3 === "auMoinsUne" ? "Calculer 1 − P(toutes de la couleur cherchée) : le contraire de « au moins une » est « aucune »." : "Ne compter qu'un seul chemin : l'ordre des couleurs varie d'un chemin à l'autre.")],
    },
  );
  return lignes;
}

function etapesB(e: ExerciceFamilleB): EtapeCorrection[] {
  const { nom, noms } = objetB(e);
  const n = e.n;
  const phases = phasesPourExercice(e);
  const lignes: EtapeCorrection[] = [];
  const [r1, r2, r3, r4] = phases.map((p) => reponse(e, p)[0]);
  // a) positions données.
  if (e.demandeEcran1 === "une") {
    lignes.push(
      { label: "Méthode", sousQuestion: "a", fragments: [t(`La ${nom} n°${NBSP}${e.positionsEcran1[0]} peut arriver à chacune des ${n} places avec la même probabilité ; une seule est la bonne.`)] },
      { label: "Calcul", sousQuestion: "a", fragments: [f(`P=\\dfrac{1}{${n}}`)] },
    );
  } else {
    lignes.push(
      { label: "Méthode", sousQuestion: "a", fragments: [t(`Arbre à deux niveaux : la ${nom} n°${NBSP}${e.positionsEcran1[0]} a une bonne place sur ${n}, puis la ${nom} n°${NBSP}${e.positionsEcran1[1]} une bonne place sur les ${n - 1} restantes. Règle du produit.`)] },
      { label: "Calcul", sousQuestion: "a", fragments: [f(`${aideNiveau2(e, "bEcran1").latex}=${droite(r1)}`)] },
    );
  }
  lignes.push(
    { label: "Conclusion", sousQuestion: "a", fragments: [f(avecDecimal(r1))] },
    { label: "Piège", sousQuestion: "a", fragments: [t(e.demandeEcran1 === "une" ? `Répondre 1/${n}! : on ne s'intéresse qu'à une seule ${nom}.` : `Multiplier 1/${n} par 1/${n} : une place est déjà prise, il en reste ${n - 1}.`)] },
  );
  // b) toutes bien placées.
  lignes.push(
    { label: "Méthode", sousQuestion: "b", fragments: [t(`Sur l'arbre des placements, les ${n}! chemins sont équiprobables et un seul place tout correctement.`)] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`${aideNiveau2(e, "bEcran2").latex}\\quad\\text{donc}\\quad P=\\dfrac{1}{${factorielle(n)}}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [f(avecDecimal(r2))] },
    { label: "Piège", sousQuestion: "b", fragments: [t(`Diviser par ${n} ou par ${n * n} : le nombre d'arrangements est ${n}! = ${factorielle(n)}.`)] },
  );
  // c) exactement k.
  const choix = choixBienPlaces(e);
  const r = n - e.k;
  const facons = r === 2 ? "1 façon (on les échange)" : "2 façons (chacune décalée d'un cran, dans un sens ou dans l'autre)";
  lignes.push(
    { label: "Méthode", sousQuestion: "c", fragments: [t(`On compte les arrangements favorables : ${choix.justification}, puis les ${r} autres ${noms} toutes mal placées, soit ${facons}.`)] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`P=\\dfrac{${choix.nombre}\\times ${toutesMalPlacees(r)}}{${n}!}=${droite(r3)}`)] },
    { label: "Conclusion", sousQuestion: "c", fragments: [f(avecDecimal(r3))] },
    { label: "Piège", sousQuestion: "c", fragments: [t(`Oublier que les ${r} autres ${noms} doivent toutes être mal placées : sinon on compte aussi des arrangements avec plus de ${e.k} ${e.k > 1 ? noms : nom} bien placée${e.k > 1 ? "s" : ""}.`)] },
  );
  // d) aucune / au moins trois.
  const aide4 = aideNiveau2(e, "bEcran4").latex ?? "";
  if (e.demandeEcran4 === "auMoinsTrois") {
    lignes.push({ label: "Méthode", sousQuestion: "d", fragments: [t(`« Au moins trois » = exactement trois, exactement quatre (impossible : la cinquième serait à sa place) ou toutes : des cas incompatibles, dont on additionne les nombres d'arrangements.`)] });
  } else {
    lignes.push({ label: "Méthode", sousQuestion: "d", fragments: [t(`Événement contraire : « au moins une ${nom} bien placée » = exactement une, exactement deux… ou toutes (exactement ${n - 1} est impossible).`)] });
  }
  lignes.push(
    { label: "Calcul", sousQuestion: "d", fragments: [f(`P=${aide4}=${droite(r4)}`)] },
    { label: "Conclusion", sousQuestion: "d", fragments: [f(avecDecimal(r4))] },
    { label: "Piège", sousQuestion: "d", fragments: [t(e.demandeEcran4 === "auMoinsTrois" ? "Compter « exactement quatre » : si quatre sont bien placées, la cinquième l'est aussi." : "Calculer 1 − P(toutes bien placées) : le contraire de « aucune » est « au moins une ».")] },
  );
  return lignes;
}

function etapesC(e: ExerciceFamilleC): EtapeCorrection[] {
  const n = facesDe(e);
  const eqs = equationsC(e);
  const r2 = reponse(e, "cEcran2");
  const r3 = reponse(e, "cEcran3")[0];
  const lignes: EtapeCorrection[] = [];
  if (e.sousType === "special") {
    const reste = reduire({ num: e.p0.den - e.p0.num, den: e.p0.den });
    lignes.push(
      { label: "Méthode", sousQuestion: "a", fragments: [t(`La somme des probabilités des ${n} faces vaut 1 : la face ${e.faceSpeciale} (probabilité connue) et ${n - 1} faces de probabilité `), f("p"), t(".")] },
      { label: "Conclusion", sousQuestion: "a", fragments: [f(eqs[0])] },
      { label: "Piège", sousQuestion: "a", fragments: [t(`Écrire ${n}p au lieu de ${n - 1}p : la face ${e.faceSpeciale} n'a pas la probabilité p.`)] },
      { label: "Calcul", sousQuestion: "b", fragments: [f(`${n - 1}p=1-${fx(e.p0)}=${fx(reste)}`), t(" donc "), f(`p=${fx(reste)}\\div ${n - 1}`)] },
      { label: "Conclusion", sousQuestion: "b", fragments: [f(r2[0])] },
      { label: "Piège", sousQuestion: "b", fragments: [t(`Oublier de diviser par ${n - 1} après avoir soustrait la probabilité connue.`)] },
    );
  } else {
    const fort = (e.plusProbable ?? "pair") === "pair" ? "paire" : "impaire";
    const faible = fort === "paire" ? "impaire" : "paire";
    lignes.push(
      { label: "Méthode", sousQuestion: "a", fragments: [t(`La relation de l'énoncé : une face ${fort} est ${e.r} fois plus probable qu'une face ${faible}. La somme : ${n / 2} faces paires (probabilité `), f("p"), t(`) et ${n / 2} faces impaires (probabilité `), f("q"), t(") ; elle vaut 1.")] },
      { label: "Conclusion", sousQuestion: "a", fragments: [f(eqs[0]), t(" et "), f(eqs[1])] },
      { label: "Piège", sousQuestion: "a", fragments: [t(`Inverser la relation (écrire ${fort === "paire" ? `q = ${e.r}p` : `p = ${e.r}q`}) : c'est la face ${fort} qui est la plus probable.`)] },
      { label: "Calcul", sousQuestion: "b", fragments: [t("On remplace dans la somme : "), f(aideNiveau2(e, "cEcran2").latex ?? "")] },
      { label: "Conclusion", sousQuestion: "b", fragments: [f(r2[0]), t(" ; "), f(r2[1])] },
      { label: "Piège", sousQuestion: "b", fragments: [t("S'arrêter à une seule inconnue : l'autre se déduit de la relation.")] },
    );
  }
  const termes = facesEcran3(e).map((face) => fx(probFaceFraction(e, face)));
  lignes.push(
    { label: "Méthode", sousQuestion: "c", fragments: [t("Des faces différentes donnent des événements incompatibles : on additionne les probabilités des faces concernées.")] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`${termes.join("+")}=${droite(r3)}`)] },
    { label: "Conclusion", sousQuestion: "c", fragments: [f(avecDecimal(r3))] },
    { label: "Piège", sousQuestion: "c", fragments: [t("Compter les faces comme équiprobables (nombre de faces favorables divisé par le nombre de faces) : le dé est truqué.")] },
  );
  return lignes;
}

function etapesD(e: ExerciceFamilleD): EtapeCorrection[] {
  const b = branchesArbreD(e);
  const p = (chemin: number[]) => produitLatex(e.n1, e.n2, e.avecRemise, chemin);
  const cible = singulier(couleurD(e, e.couleurCible));
  const autre = e.couleurCible === 0 ? 1 : 0;
  const [, r2, r3, r4] = phasesPourExercice(e).map((ph) => reponse(e, ph)[0]);
  const deuxieme = e.avecRemise ? "la boule est remise : l'urne est la même qu'au départ" : "il reste une boule de moins, et une de moins de la couleur déjà tirée";
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t(`Premier tirage : nombre de boules de chaque couleur divisé par le nombre total. Deuxième tirage : ${deuxieme}. Les branches issues d'un même nœud ont une somme égale à 1.`)] },
    {
      label: "Conclusion",
      sousQuestion: "a",
      fragments: [f(b.map((fr, i) => `p_${i + 1}=${fx(fr)}`).join(",\\ "))],
      figureHtml: arbreCompletUrne(e.n1, e.n2, e.avecRemise, 2, [e.initiale1, e.initiale2]),
    },
    { label: "Piège", sousQuestion: "a", fragments: [t(e.avecRemise ? "Modifier l'urne au deuxième tirage alors que la boule a été remise." : "Garder les proportions du premier tirage au deuxième : sans remise, l'urne a changé.")] },
    { label: "Calcul", sousQuestion: "b", fragments: [t("Règle du produit le long du chemin : "), f(`${p(e.chemin)}=${droite(r2)}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [f(avecDecimal(r2))] },
    { label: "Piège", sousQuestion: "b", fragments: [t("Additionner les deux branches du chemin au lieu de les multiplier.")] },
    { label: "Méthode", sousQuestion: "c", fragments: [t(`« Exactement une boule ${cible} » : deux chemins incompatibles (${cible} puis ${singulier(couleurD(e, autre))}, ou l'inverse), dont on additionne les probabilités.`)] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`${p([0, 1])}+${p([1, 0])}=${droite(r3)}`)] },
    { label: "Conclusion", sousQuestion: "c", fragments: [f(avecDecimal(r3))] },
    { label: "Piège", sousQuestion: "c", fragments: [t("Ne compter qu'un des deux chemins : la boule cherchée peut sortir au premier ou au deuxième tirage.")] },
    { label: "Méthode", sousQuestion: "d", fragments: [t(`Le contraire de « au moins une boule ${cible} » est « aucune boule ${cible} » : un seul chemin. `), f("P(E)=1-P(\\overline{E})")] },
    { label: "Calcul", sousQuestion: "d", fragments: [f(`1-${p([autre, autre])}=${droite(r4)}`)] },
    { label: "Conclusion", sousQuestion: "d", fragments: [f(avecDecimal(r4))] },
    { label: "Piège", sousQuestion: "d", fragments: [t(`Calculer 1 − P(deux boules ${couleurD(e, e.couleurCible)}) : le contraire de « au moins une » est « aucune ».`)] },
  ];
}

function correctionDetaillee(e: ExerciceTiragesArbres): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return etapesA(e);
    case "B":
      return etapesB(e);
    case "C":
      return etapesC(e);
    case "D":
      return etapesD(e);
  }
}

// ============================================================================
// Difficulté, barème.
// ============================================================================

function difficulte(e: ExerciceTiragesArbres): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
      return e.k === 3 && !e.avecRemise ? 3 : 2;
    case "B":
      return e.n === 3 ? 1 : e.n === 4 ? 2 : 3;
    case "C":
      return e.sousType === "special" ? 1 : 2;
    case "D":
      return 2;
  }
}

function criteres(e: ExerciceTiragesArbres): CritereBareme[] {
  const fin = (ph: PhaseTiragesArbres) => droite(reponse(e, ph)[0]);
  switch (e.famille) {
    case "A":
      return [
        { sousQuestion: "a", critere: [t("Chemins unicolores par la règle du produit : "), f(`${fin("aEcran1")}\\ \\text{et}\\ ${droite(reponse(e, "aEcran1")[1])}`)], points: 1.5 },
        { sousQuestion: "b", critere: [t("Somme de deux événements incompatibles : "), f(fin("aEcran2"))], points: 1 },
        { sousQuestion: "c", critere: [t(e.questionEcran3 === "auMoinsUne" ? "Événement contraire : " : "Nombre de chemins × probabilité d'un chemin : "), f(fin("aEcran3"))], points: 1.5 },
      ];
    case "B":
      return [
        { sousQuestion: "a", critere: [t("Positions données : "), f(fin("bEcran1"))], points: 1 },
        { sousQuestion: "b", critere: [t("Un chemin sur n! : "), f(fin("bEcran2"))], points: 0.5 },
        { sousQuestion: "c", critere: [t("Comptage des arrangements favorables : "), f(fin("bEcran3"))], points: 1.5 },
        { sousQuestion: "d", critere: [t(e.demandeEcran4 === "auMoinsTrois" ? "Somme de cas incompatibles : " : "Événement contraire : "), f(fin("bEcran4"))], points: 1 },
      ];
    case "C":
      return [
        { sousQuestion: "a", critere: [t(e.sousType === "special" ? "Équation de la somme des probabilités" : "Relation et équation de la somme")], points: 1 },
        { sousQuestion: "b", critere: [f(reponse(e, "cEcran2").join(",\\ "))], points: 1.5 },
        { sousQuestion: "c", critere: [t("Somme des probabilités des faces : "), f(fin("cEcran3"))], points: 1.5 },
      ];
    case "D":
      return [
        { sousQuestion: "a", critere: [t("Les six branches de l'arbre (le deuxième tirage tient compte du premier)")], points: 1.5 },
        { sousQuestion: "b", critere: [t("Règle du produit : "), f(fin("dEcran2"))], points: 0.5 },
        { sousQuestion: "c", critere: [t("Somme de deux chemins : "), f(fin("dEcran3"))], points: 1 },
        { sousQuestion: "d", critere: [t("Événement contraire : "), f(fin("dEcran4"))], points: 1 },
      ];
  }
}

function bareme(e: ExerciceTiragesArbres): BaremeExercice {
  const pieges = correctionDetaillee(e).filter((l) => l.label === "Piège");
  return {
    reponseFinale: reponseBreve(e),
    criteres: criteres(e),
    erreursFrequentes: pieges.map((l) => ({ description: l.fragments, cout: "−1" })),
    reponsesAcceptees: [[t("Fraction non simplifiée, décimal arrondi au centième (au millième sous 0,1) ou pourcentage équivalent ; une erreur reportée d'une question à la suivante n'est sanctionnée qu'une fois")]],
  };
}

export const adaptateurEvaluationTiragesArbres: AdaptateurFeuilleExercices<ExerciceTiragesArbres> = {
  titreDocument: "Tirages et arbres de probabilité — Évaluation",
  nomFichierBase: "tirages-arbres",
  genererInstance: genererExerciceTiragesArbres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteTiragesArbres),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilTiragesArbres,
  libelleCasParticulier: LIBELLE_CAS_TIRAGES_ARBRES,
};
