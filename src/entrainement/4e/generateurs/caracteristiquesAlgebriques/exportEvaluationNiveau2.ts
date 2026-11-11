import type {
  ExerciceCaracteristiquesAlgebriquesNiveau2,
  ExerciceNiveau2RacineCarree,
  ExerciceNiveau2ValeurAbsolue,
  FactorisationP3,
  ReponseDomaine,
} from "../../core/caracteristiquesAlgebriques.types";
import type { Morceau } from "../../core/inequation.types";
import type {
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
  brancheEstValide,
  ceAttendues,
  domaineAttendu,
  existeOrdonneeNiveau1,
  racineRespecteCondition,
  racinesAValiderRacineCarree,
  zerosAttendus,
} from "../../moteur/verificationCaracteristiquesAlgebriques";
import {
  INSTRUCTION_ZEROS,
  expressionConditionValiditeLatex,
  formatBranchesAvecConditionsLatex,
  formatCEAttenduesLatex,
  formatConditionLatex,
  formatConditionNegeeLatex,
  formatEquationDeveloppeeLatex,
  formatEquationIsoleeLatex,
  formatEquationNiveau1Latex,
  formatFractionLatex,
  formatOrdonneeExacteLatex,
  formatP1Latex,
  formatValeurExacteLatex,
  formatZerosAttendusLatex,
  instructionIsolement,
  instructionRegroupe,
} from "../../ui/formatCaracteristiquesAlgebriques";
import { formatSommeTermes } from "../../ui/formatEquation";

/**
 * Feuilles d'exercices et évaluations de gen13 au NIVEAU 2 (`k(x) = cx + d`) — demande de
 * l'utilisateur : le sélecteur de variantes des feuilles doit proposer la famille ET le niveau.
 * Même méthode que le niveau 1 (`exportEvaluation.ts`, `.claude/rules/feuilles-evaluations.md`) :
 * énoncé papier = la fonction + une consigne globale ; les écrans deviennent les étapes du corrigé,
 * dans l'ordre de la séquence interactive (`AppCaracteristiquesAlgebriques.tsx::sequencePourExercice`) :
 * CE → domaine → ordonnée à l'origine → isolement (développement pour `carre`/`cube`), puis selon la
 * famille :
 * - `carre`/`cube` : zéros ;
 * - `inverse`/`racine_cubique` : équation regroupée → zéros ;
 * - `racine_carree` : condition de validité → équation regroupée → zéros candidats → validation ;
 * - `valeur_absolue` : condition (signe de l'intérieur) → les deux branches → validation → zéros.
 * Pas de parité au niveau 2 (l'écran n'existe qu'au niveau 1). Toutes les valeurs viennent des MÊMES
 * fonctions que l'écran interactif (`ceAttendues`, `domaineAttendu`, `zerosAttendus`,
 * `formatEquationIsoleeLatex`, `formatEquationDeveloppeeLatex`, `formatBranchesAvecConditionsLatex`…).
 */

type EtapeN2 = "ce" | "domaine" | "ordonnee" | "isolement" | "validite" | "regroupe" | "branches" | "zeros" | "validation";

const LETTRES = "abcdefghij";

function etapesN2(e: ExerciceCaracteristiquesAlgebriquesNiveau2): EtapeN2[] {
  const base: EtapeN2[] = ["ce", "domaine", "ordonnee", "isolement"];
  switch (e.famille) {
    case "carre":
    case "cube":
      return [...base, "zeros"];
    case "inverse":
    case "racine_cubique":
      return [...base, "regroupe", "zeros"];
    case "racine_carree":
      return [...base, "validite", "regroupe", "zeros", "validation"];
    case "valeur_absolue":
      return [...base, "validite", "branches", "validation", "zeros"];
  }
}

function lettre(e: ExerciceCaracteristiquesAlgebriquesNiveau2, etape: EtapeN2): string {
  return LETTRES[etapesN2(e).indexOf(etape)];
}

function formatMorceauLatex(m: Morceau): string {
  const gauche = typeof m.borneGauche === "number" ? formatValeurExacteLatex(m.borneGauche) : "-\\infty";
  const droite = typeof m.borneDroite === "number" ? formatValeurExacteLatex(m.borneDroite) : "+\\infty";
  return `${m.crochetGauche}${gauche} \\;;\\; ${droite}${m.crochetDroit}`;
}

function formatDomaineLatex(domaine: ReponseDomaine): string {
  switch (domaine.forme) {
    case "reel":
      return "\\mathbb{R}";
    case "vide":
      return "\\varnothing";
    case "prive_points":
      return `\\mathbb{R} \\setminus \\{${domaine.points.map(formatValeurExacteLatex).join(" ; ")}\\}`;
    case "intervalles":
      return domaine.intervalles.map(formatMorceauLatex).join(" \\cup ");
  }
}

function domaineLatex(e: ExerciceCaracteristiquesAlgebriquesNiveau2): string {
  return `\\mathrm{dom}\\,f = ${formatDomaineLatex(domaineAttendu(e))}`;
}

function ceFragments(e: ExerciceCaracteristiquesAlgebriquesNiveau2): FragmentConsigne[] {
  const ce = formatCEAttenduesLatex(ceAttendues(e));
  return ce === null ? [texte("aucune condition d'existence")] : [texte("CE : "), latex(ce)];
}

function ordonneeFragments(e: ExerciceCaracteristiquesAlgebriquesNiveau2): FragmentConsigne[] {
  const ordonnee = formatOrdonneeExacteLatex(e);
  return ordonnee === null || !existeOrdonneeNiveau1(e)
    ? [texte("pas d'ordonnée à l'origine ("), latex("0 \\notin \\mathrm{dom}\\,f"), texte(")")]
    : [latex(`f(0) = ${ordonnee}`)];
}

function zerosFragments(zeros: number[]): FragmentConsigne[] {
  const z = formatZerosAttendusLatex(zeros);
  return z === null ? [texte("aucun zéro")] : [texte(zeros.length > 1 ? "zéros : " : "zéro : "), latex(z)];
}

/** Racines des deux membres d'une équation du 2nd degré embarquée (`carre`/`inverse`/`racine_carree`). */
function equationSecondDegre(e: ExerciceCaracteristiquesAlgebriquesNiveau2): { delta: number | null; irreductible: boolean } | null {
  if (e.famille !== "carre" && e.famille !== "inverse" && e.famille !== "racine_carree") return null;
  const { a, b, c } = e.zeros.enonce;
  return { delta: b * b - 4 * a * c, irreductible: e.zeros.categorie === "irreductible" };
}

function factorisationP3Latex(f: FactorisationP3): string {
  if (f.type === "sansX") return `${formatSommeTermes([{ valeur: f.lineaire.A, suffixe: "x" }, { valeur: f.lineaire.B, suffixe: "" }])} = 0`;
  const { A, B, C } = f.quadratique;
  return `x\\left(${formatSommeTermes([{ valeur: A, suffixe: "x^2" }, { valeur: B, suffixe: "x" }, { valeur: C, suffixe: "" }])}\\right) = 0`;
}

function texteRegroupe(e: ExerciceCaracteristiquesAlgebriquesNiveau2): string {
  switch (e.famille) {
    case "inverse":
      return "On multiplie les deux membres par le dénominateur, puis on regroupe tous les termes dans le même membre.";
    case "racine_carree":
      return "Les deux membres étant positifs (condition de validité), on les élève au carré, puis on regroupe tous les termes dans le même membre.";
    case "racine_cubique":
      return "On élève les deux membres au cube (sans condition : le cube est une bijection), puis on regroupe tous les termes dans le même membre.";
    default:
      return "";
  }
}

function brancheLatex(e: ExerciceNiveau2ValeurAbsolue, index: 0 | 1): string {
  return formatFractionLatex(index === 0 ? e.racineBranche1 : e.racineBranche2);
}

// ---------------------------------------------------------------------------------------------
// Énoncé (papier et « historique » écran), réponse brève, difficulté
// ---------------------------------------------------------------------------------------------

export function enoncePapierNiveau2(e: ExerciceCaracteristiquesAlgebriquesNiveau2): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Étudie algébriquement la fonction "),
        latex(formatEquationNiveau1Latex(e)),
        texte(" : détermine ses conditions d'existence et son domaine de définition, son ordonnée à l'origine (valeur exacte, ou justifie qu'elle n'existe pas) et ses zéros."),
      ],
      questions: [],
    },
  };
}

/** Questions écran par écran (ancien chemin `construireEnonce`, conservé pour le contrat). */
export function construireEnonceNiveau2(e: ExerciceCaracteristiquesAlgebriquesNiveau2): SectionExercice {
  const q = (t: string) => ({ consigne: [texte(t)] });
  const questions = etapesN2(e).map((etape) => {
    switch (etape) {
      case "ce":
        return q("Quelles sont les conditions d'existence de cette fonction ?");
      case "domaine":
        return q("Quel est le domaine de définition de cette fonction ?");
      case "ordonnee":
        return q("Quelle est l'ordonnée à l'origine de cette fonction ? (forme exacte ; indique si elle n'existe pas.)");
      case "isolement":
        return e.famille === "carre" || e.famille === "cube"
          ? q("Développe, puis regroupe tous les termes du même côté pour résoudre f(x) = 0.")
          : q(instructionIsolement(e.famille));
      case "validite":
        return q(e.famille === "racine_carree" ? "Quelle condition le membre de droite doit-il respecter ?" : "Pour quelles valeurs de x l'intérieur de la valeur absolue est-il positif ou nul ?");
      case "regroupe":
        return q(instructionRegroupe(e.famille as "inverse" | "racine_carree" | "racine_cubique"));
      case "branches":
        return q("Résous l'équation dans chacune des deux branches.");
      case "validation":
        return q("Vérifie chaque solution trouvée avec sa condition.");
      case "zeros":
        return q(INSTRUCTION_ZEROS);
    }
  });
  return { enteteFragments: [texte("On considère la fonction "), latex(formatEquationNiveau1Latex(e)), texte(".")], questions };
}

export function reponseBreveNiveau2(e: ExerciceCaracteristiquesAlgebriquesNiveau2): FragmentConsigne[] {
  return [...ceFragments(e), texte(" ; "), latex(domaineLatex(e)), texte(" ; "), ...ordonneeFragments(e), texte(" ; "), ...zerosFragments(zerosAttendus(e))];
}

export function difficulteNiveau2(e: ExerciceCaracteristiquesAlgebriquesNiveau2): 1 | 2 | 3 {
  return e.famille === "carre" || e.famille === "cube" ? 2 : 3;
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

export function correctionDetailleeNiveau2(e: ExerciceCaracteristiquesAlgebriquesNiveau2): EtapeCorrection[] {
  const L = (etape: EtapeN2) => lettre(e, etape);
  const etapes: EtapeCorrection[] = [];
  const conditions = ceAttendues(e);

  // CE et domaine.
  etapes.push({
    label: "Méthode",
    sousQuestion: L("ce"),
    fragments: [texte("Seuls un dénominateur (non nul) et une racine carrée (radicande positif ou nul) imposent une condition ; le carré, le cube, la racine cubique et la valeur absolue n'en imposent aucune.")],
  });
  if (e.famille === "racine_carree") {
    etapes.push({
      label: "Calcul",
      sousQuestion: L("ce"),
      fragments: [latex(`${formatP1Latex(e.a, e.b)} \\geq 0`), texte(e.a < 0 ? " : on divise par a < 0, le sens de l'inégalité s'inverse." : " : on divise par a > 0, le sens ne change pas.")],
    });
  } else if (e.famille === "inverse") {
    etapes.push({ label: "Calcul", sousQuestion: L("ce"), fragments: [latex(`${formatP1Latex(e.a, e.b)} \\neq 0`)] });
  }
  etapes.push({ label: "Conclusion", sousQuestion: L("ce"), fragments: conditions.length === 0 ? [texte("Aucune condition d'existence.")] : [latex(formatCEAttenduesLatex(conditions) as string)] });
  etapes.push({ label: "Conclusion", sousQuestion: L("domaine"), fragments: [latex(domaineLatex(e))] });

  // Ordonnée à l'origine.
  const ordonnee = formatOrdonneeExacteLatex(e);
  if (ordonnee === null || !existeOrdonneeNiveau1(e)) {
    etapes.push({ label: "Conclusion", sousQuestion: L("ordonnee"), fragments: [latex("0 \\notin \\mathrm{dom}\\,f"), texte(" : f(0) n'existe pas, pas d'ordonnée à l'origine.")] });
  } else {
    etapes.push({ label: "Calcul", sousQuestion: L("ordonnee"), fragments: [latex(`f(0) = ${ordonnee}`)] });
  }

  // Isolement (développement pour le carré et le cube).
  if (e.famille === "carre" || e.famille === "cube") {
    etapes.push({
      label: "Méthode",
      sousQuestion: L("isolement"),
      fragments: [texte(`On résout f(x) = 0 : on développe ${e.famille === "carre" ? "le carré" : "le cube"}, puis on regroupe tous les termes dans le même membre.`)],
    });
  } else {
    etapes.push({ label: "Méthode", sousQuestion: L("isolement"), fragments: [texte("On résout f(x) = 0 : on isole la fonction de référence, le terme en x et la constante passent dans l'autre membre avec le signe opposé.")] });
  }
  etapes.push({ label: "Calcul", sousQuestion: L("isolement"), fragments: [latex(formatEquationIsoleeLatex(e))] });

  // Condition de validité.
  if (e.famille === "racine_carree") {
    const r = e as ExerciceNiveau2RacineCarree;
    etapes.push({ label: "Méthode", sousQuestion: L("validite"), fragments: [texte("Une racine carrée est positive ou nulle : le membre de droite doit l'être aussi.")] });
    etapes.push({ label: "Calcul", sousQuestion: L("validite"), fragments: [latex(`${expressionConditionValiditeLatex(r)} \\geq 0 \\iff ${formatConditionLatex(r.conditionValidite)}`)] });
  } else if (e.famille === "valeur_absolue") {
    const v = e as ExerciceNiveau2ValeurAbsolue;
    etapes.push({ label: "Méthode", sousQuestion: L("validite"), fragments: [texte("On distingue deux cas selon le signe de l'intérieur de la valeur absolue.")] });
    etapes.push({ label: "Calcul", sousQuestion: L("validite"), fragments: [latex(`${expressionConditionValiditeLatex(v)} \\geq 0 \\iff ${formatConditionLatex(v.conditionValidite)}`)] });
  }

  // Équation regroupée.
  if (e.famille === "inverse" || e.famille === "racine_carree" || e.famille === "racine_cubique") {
    etapes.push({ label: "Méthode", sousQuestion: L("regroupe"), fragments: [texte(texteRegroupe(e))] });
    etapes.push({ label: "Calcul", sousQuestion: L("regroupe"), fragments: [latex(formatEquationDeveloppeeLatex(e))] });
  }

  // Deux branches de la valeur absolue.
  if (e.famille === "valeur_absolue") {
    const v = e as ExerciceNiveau2ValeurAbsolue;
    etapes.push({ label: "Calcul", sousQuestion: L("branches"), fragments: [latex(formatBranchesAvecConditionsLatex(v.a, v.b, v.c, v.d, v.conditionValidite))] });
    etapes.push({ label: "Calcul", sousQuestion: L("branches"), fragments: [latex(`x = ${brancheLatex(v, 0)} \\text{ (1re branche)} \\quad ; \\quad x = ${brancheLatex(v, 1)} \\text{ (2e branche)}`)] });
  }

  // Zéros (candidats pour la racine carrée).
  const sd = equationSecondDegre(e);
  if (sd) {
    etapes.push({ label: "Méthode", sousQuestion: L("zeros"), fragments: [texte("On résout l'équation du second degré obtenue (méthode rapide si possible, sinon le discriminant).")] });
    etapes.push({ label: "Calcul", sousQuestion: L("zeros"), fragments: [latex(`\\Delta = b^2 - 4ac = ${sd.delta}`), texte(sd.irreductible ? " : Δ < 0, aucune solution réelle." : "")] });
  } else if (e.famille === "cube" || e.famille === "racine_cubique") {
    etapes.push({ label: "Méthode", sousQuestion: L("zeros"), fragments: [texte("On factorise le membre de gauche (mise en évidence), puis on applique la règle du produit nul.")] });
    etapes.push({ label: "Calcul", sousQuestion: L("zeros"), fragments: [latex(factorisationP3Latex(e.factorisationP3))] });
  }
  if (e.famille === "racine_carree") {
    const candidats = racinesAValiderRacineCarree(e);
    etapes.push({ label: "Conclusion", sousQuestion: L("zeros"), fragments: candidats.length === 0 ? [texte("Aucune solution candidate.")] : [texte("Solutions candidates : "), latex(formatZerosAttendusLatex(candidats) as string)] });
  } else if (e.famille !== "valeur_absolue") {
    etapes.push({ label: "Conclusion", sousQuestion: L("zeros"), fragments: zerosFragments(zerosAttendus(e)) });
  }

  // Validation des solutions.
  if (e.famille === "racine_carree") {
    const r = e as ExerciceNiveau2RacineCarree;
    for (const candidat of racinesAValiderRacineCarree(r)) {
      const ok = racineRespecteCondition(r, candidat);
      etapes.push({
        label: "Condition",
        sousQuestion: L("validation"),
        fragments: [latex(`x = ${formatValeurExacteLatex(candidat)}`), texte(ok ? " respecte " : " ne respecte pas "), latex(formatConditionLatex(r.conditionValidite)), texte(ok ? " : solution retenue." : " : solution rejetée.")],
      });
    }
    etapes.push({ label: "Conclusion", sousQuestion: L("validation"), fragments: zerosFragments(zerosAttendus(r)) });
  } else if (e.famille === "valeur_absolue") {
    const v = e as ExerciceNiveau2ValeurAbsolue;
    ([0, 1] as const).forEach((index) => {
      const ok = brancheEstValide(v, index);
      const condition = index === 0 ? formatConditionLatex(v.conditionValidite) : formatConditionNegeeLatex(v.conditionValidite);
      etapes.push({
        label: "Condition",
        sousQuestion: L("validation"),
        fragments: [latex(`x = ${brancheLatex(v, index)}`), texte(ok ? " respecte " : " ne respecte pas "), latex(condition), texte(ok ? " : solution retenue." : " : solution rejetée.")],
      });
    });
    etapes.push({ label: "Conclusion", sousQuestion: L("zeros"), fragments: zerosFragments(zerosAttendus(v)) });
  }

  // Piège ciblé.
  if (e.famille === "racine_carree") {
    etapes.push({ label: "Piège", sousQuestion: L("validation"), fragments: [texte("Élever au carré peut faire apparaître des solutions étrangères : chaque candidate doit être confrontée à la condition de validité.")] });
  } else if (e.famille === "valeur_absolue") {
    etapes.push({ label: "Piège", sousQuestion: L("validation"), fragments: [texte("Chaque racine doit respecter la condition de SA branche, pas celle de l'autre.")] });
  } else if (e.famille === "inverse") {
    etapes.push({ label: "Piège", sousQuestion: L("regroupe"), fragments: [texte("Multiplier par le dénominateur n'est permis que parce qu'il est non nul (CE) : ne pas l'oublier dans le domaine.")] });
  } else if (e.famille === "carre") {
    etapes.push({ label: "Piège", sousQuestion: L("isolement"), fragments: [texte("En développant le carré, ne pas oublier le double produit.")] });
  } else if (e.famille === "cube") {
    etapes.push({ label: "Piège", sousQuestion: L("isolement"), fragments: [latex("(u+v)^3 = u^3 + 3u^2v + 3uv^2 + v^3"), texte(" : les deux termes du milieu sont souvent oubliés.")] });
  } else {
    etapes.push({ label: "Piège", sousQuestion: L("regroupe"), fragments: [texte("Élever au cube le membre de droite tout entier (le binôme), pas chacun de ses termes séparément.")] });
  }
  return etapes;
}

/** Ancien corrigé (chemin `construireCorrection`, conservé pour le contrat) : une ligne par étape. */
export function construireCorrectionNiveau2(e: ExerciceCaracteristiquesAlgebriquesNiveau2): BlocCorrection[] {
  return correctionDetailleeNiveau2(e)
    .filter((etape) => etape.label !== "Piège")
    .map((etape) => ({ type: "paragraphe" as const, fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

// ---------------------------------------------------------------------------------------------
// Barème (total 4, aucun critère sous 0,5)
// ---------------------------------------------------------------------------------------------

export function baremeNiveau2(e: ExerciceCaracteristiquesAlgebriquesNiveau2): BaremeExercice {
  const L = (etape: EtapeN2) => lettre(e, etape);
  const zeros = zerosAttendus(e);
  const criteresFin: CritereBareme[] = (() => {
    switch (e.famille) {
      case "carre":
      case "cube":
        return [
          { sousQuestion: L("isolement"), critere: [texte("Équation développée et regroupée : "), latex(formatEquationIsoleeLatex(e))], points: 1 },
          { sousQuestion: L("zeros"), critere: zerosFragments(zeros), points: 1.5 },
        ];
      case "inverse":
      case "racine_cubique":
        return [
          { sousQuestion: L("isolement"), critere: [texte("Équation isolée : "), latex(formatEquationIsoleeLatex(e))], points: 0.5 },
          { sousQuestion: L("regroupe"), critere: [texte("Équation regroupée : "), latex(formatEquationDeveloppeeLatex(e))], points: 1 },
          { sousQuestion: L("zeros"), critere: zerosFragments(zeros), points: 1 },
        ];
      case "racine_carree":
        return [
          { sousQuestion: L("isolement"), critere: [texte("Équation isolée : "), latex(formatEquationIsoleeLatex(e))], points: 0.5 },
          { sousQuestion: L("validite"), critere: [texte("Condition de validité : "), latex(formatConditionLatex(e.conditionValidite))], points: 0.5 },
          { sousQuestion: L("regroupe"), critere: [texte("Équation regroupée : "), latex(formatEquationDeveloppeeLatex(e))], points: 0.5 },
          { sousQuestion: L("zeros"), critere: [texte("Solutions candidates")], points: 0.5 },
          { sousQuestion: L("validation"), critere: [texte("Candidates confrontées à la condition ; "), ...zerosFragments(zeros)], points: 0.5 },
        ];
      case "valeur_absolue":
        return [
          { sousQuestion: L("isolement"), critere: [texte("Équation isolée : "), latex(formatEquationIsoleeLatex(e))], points: 0.5 },
          { sousQuestion: L("validite"), critere: [texte("Condition de signe : "), latex(formatConditionLatex(e.conditionValidite))], points: 0.5 },
          { sousQuestion: L("branches"), critere: [texte("Les deux branches résolues")], points: 0.5 },
          { sousQuestion: L("validation"), critere: [texte("Chaque racine confrontée à la condition de sa branche")], points: 0.5 },
          { sousQuestion: L("zeros"), critere: zerosFragments(zeros), points: 0.5 },
        ];
    }
  })();
  const criteres: CritereBareme[] = [
    { sousQuestion: L("ce"), critere: ceFragments(e), points: 0.5 },
    { sousQuestion: L("domaine"), critere: [latex(domaineLatex(e))], points: 0.5 },
    { sousQuestion: L("ordonnee"), critere: ordonneeFragments(e), points: 0.5 },
    ...criteresFin,
  ];
  const erreurs: ErreurFrequente[] = [];
  if (e.famille === "racine_carree" && e.a < 0) erreurs.push({ description: [texte("Sens de l'inégalité non inversé en divisant par a < 0")], cout: "0 pt sur a) et b)" });
  if (!existeOrdonneeNiveau1(e)) erreurs.push({ description: [texte("Calculer f(0) alors que 0 n'appartient pas au domaine")], cout: "0 pt sur c)" });
  erreurs.push({ description: [texte("Terme passé dans l'autre membre sans changer de signe")], cout: "0 pt sur d), suite notée sans double pénalité" });
  if (e.famille === "racine_carree") erreurs.push({ description: [texte("Solution étrangère gardée (non confrontée à la condition de validité)")], cout: "0 pt sur la validation" });
  if (e.famille === "valeur_absolue") erreurs.push({ description: [texte("Une seule branche traitée")], cout: "moitié des points de la suite" });
  return {
    reponseFinale: reponseBreveNiveau2(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Domaine écrit en intervalle(s) ou en notation d'ensemble")],
      [texte("Équation regroupée multipliée par une constante non nulle (forme équivalente)")],
    ],
  };
}
