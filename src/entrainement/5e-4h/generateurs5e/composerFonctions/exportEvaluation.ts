import type { CompositionDirigee, ExerciceComposerFonctions } from "../../core5e/composerFonctions.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatEnsembleReelLatex } from "../../ui5e/formatDomaineDefinition";
import { formatTermesConditionsLatex, latexAideC2Niveau2, latexAideFormuleNiveau2 } from "../../ui5e/formatComposerFonctions";
import { profilComposerFonctions } from "../profilsEvaluationFonctions3-4";
import { CATALOGUE_COMBOS, construireAvecComboSensTire, genererExerciceComposerFonctions } from "./index";
import { xTelQueGDansDomF } from "./solveur";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComposerFonctions>` pour 5gen3 (composer f et g —
 * expression et domaine) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = les deux fonctions et la consigne globale « Détermine l'expression simplifiée de
 * (f∘g)(x) et son domaine de définition » (les deux composées si le sens tiré est « les deux »). Les
 * écrans du générateur passent dans le corrigé « Étape n », PAR COMPOSÉE : expression (substitution
 * puis forme simplifiée), première condition x ∈ dom(intérieure), deuxième condition
 * intérieure(x) ∈ dom(extérieure) résolue (élévation au carré pour une intérieure à racine, comme
 * l'écran C2), domaine final = intersection.
 *
 * Valeurs : `dir.latex` (référence normalisée de l'écran, `latexReferenceNormalisee`),
 * `latexAideFormuleNiveau2` (substitution brute), `formatTermesConditionsLatex` (conditions de
 * l'écran B), `dir.domaineApresCarre` (cible de l'écran C2), `xTelQueGDansDomF` (même solveur que
 * le générateur, pour l'intérieure sans racine), `dir.domaine` (domaine final) — jamais un calcul
 * refait ici.
 *
 * Variante forcée = combinaison de familles, sens tiré (`construireAvecComboSensTire`) — la même
 * fonction que le `?code=` de l'appli (App5gen3.tsx), qui rouvre l'instance imprimée.
 */

/** « \dfrac{-8}{…} » → « −\dfrac{8}{…} » (numérateur à un seul terme) : le signe devant la fraction. */
function signeDevantFraction(l: string): string {
  return l.replace(/\+\s*\\dfrac\{-([^{}+-]+)\}/g, "-\\dfrac{$1}").replace(/\\dfrac\{-([^{}+-]+)\}/g, "-\\dfrac{$1}");
}

/** « ]−∞ » : KaTeX espace le « − » qui suit un crochet ouvrant inversé comme une soustraction ;
 * `\mathopen{]}` lui rend son rôle de délimiteur (même correctif que le quiz 5gen39). */
function crochetsOuvrants(l: string): string {
  return l.replace(/(^|[^\\a-zA-Z{])\](?=\s*(-|\\infty|\d))/g, "$1\\mathopen{]}");
}

function ensembleLatex(e: Parameters<typeof formatEnsembleReelLatex>[0]): string {
  return crochetsOuvrants(formatEnsembleReelLatex(e));
}

function nomExterieure(dir: CompositionDirigee): "f" | "g" {
  return dir.nomInterieure === "f" ? "g" : "f";
}

function composeeLatex(dir: CompositionDirigee): string {
  return `(${nomExterieure(dir)}\\circ ${dir.nomInterieure})(x)`;
}

function domaineComposeeLatex(dir: CompositionDirigee): string {
  return `\\operatorname{dom}(${nomExterieure(dir)}\\circ ${dir.nomInterieure}) = ${ensembleLatex(dir.domaine)}`;
}

function directionsActives(exercice: ExerciceComposerFonctions): CompositionDirigee[] {
  return [exercice.fRondG, exercice.gRondF].filter((d): d is CompositionDirigee => d !== null);
}

const LETTRES = "abcdefgh";

/** Lettres des 4 étapes d'une composée : a–d pour la première, e–h pour la seconde. */
function lettres(index: number): [string, string, string, string] {
  const l = LETTRES.slice(4 * index, 4 * index + 4);
  return [l[0], l[1], l[2], l[3]];
}

function entete(exercice: ExerciceComposerFonctions): FragmentConsigne[] {
  return [texte("Soient les fonctions "), latex(exercice.f.latex), texte(" et "), latex(exercice.g.latex), texte(".")];
}

function consignesEtapes(dir: CompositionDirigee): string[] {
  const ext = nomExterieure(dir);
  const int = dir.nomInterieure;
  return [
    `Écris l'expression de (${ext}∘${int})(x) = ${ext}(${int}(x)), simplifiée au maximum.`,
    `Écris la première condition : x doit appartenir au domaine de ${int}.`,
    `Écris et résous la deuxième condition : ${int}(x) doit appartenir au domaine de ${ext}.`,
    `Déduis-en le domaine de définition de ${ext}∘${int}.`,
  ];
}

function construireEnonceComposerFonctions(exercice: ExerciceComposerFonctions): SectionExercice {
  const questions: QuestionExercice[] = directionsActives(exercice).flatMap((dir) => consignesEtapes(dir).map((c) => ({ consigne: [texte(c)] })));
  return { enteteFragments: entete(exercice), questions };
}

function enoncePapierComposerFonctions(exercice: ExerciceComposerFonctions): EnoncePapier {
  const dirs = directionsActives(exercice);
  const consigne: FragmentConsigne[] =
    dirs.length === 2
      ? [texte(" Détermine l'expression simplifiée de "), latex(composeeLatex(dirs[0])), texte(" et de "), latex(composeeLatex(dirs[1])), texte(", ainsi que leurs domaines de définition.")]
      : [texte(" Détermine l'expression simplifiée de "), latex(composeeLatex(dirs[0])), texte(" et son domaine de définition.")];
  return { section: { enteteFragments: [...entete(exercice), ...consigne], questions: [] } };
}

function reponseBreveComposerFonctions(exercice: ExerciceComposerFonctions): FragmentConsigne[] {
  return directionsActives(exercice).flatMap((dir, i) => [
    ...(i > 0 ? [texte(" ; ")] : []),
    latex(`${composeeLatex(dir)} = ${signeDevantFraction(dir.latex)}`),
    texte(", "),
    latex(domaineComposeeLatex(dir)),
  ]);
}

/** Deuxième condition résolue : pour une intérieure à racine, l'ensemble obtenu après élévation au
 * carré (cible de l'écran C2) ; sinon, le même solveur que le générateur. */
function deuxiemeConditionResolue(dir: CompositionDirigee): string {
  const ensemble = dir.domaineApresCarre ?? xTelQueGDansDomF(dir.interieure.fonction, dir.exterieure.domaine);
  return ensembleLatex(ensemble);
}

function piege(dir: CompositionDirigee): string {
  return `Le domaine ne se lit pas sur l'expression simplifiée : une valeur interdite pour ${dir.nomInterieure} reste interdite pour la composée, même si elle disparaît après simplification.`;
}

function lignesDirection(dir: CompositionDirigee, index: number): EtapeCorrection[] {
  const [lExpr, lCond1, lCond2, lDom] = lettres(index);
  const ext = nomExterieure(dir);
  const int = dir.nomInterieure;
  const conditions = formatTermesConditionsLatex(dir);
  const aideCarre = dir.riche ? latexAideC2Niveau2(dir) : null;
  const lignesCond2: EtapeCorrection[] = [
    {
      label: "Condition",
      sousQuestion: lCond2,
      fragments: [texte(`${int}(x) doit appartenir au domaine de ${ext}, `), latex(`\\operatorname{dom}${ext} = ${ensembleLatex(dir.exterieure.domaine)}`), texte(".")],
    },
  ];
  if (dir.riche && conditions.length > 0) {
    lignesCond2.push({
      label: "Calcul",
      sousQuestion: lCond2,
      fragments: [
        texte("Conditions à vérifier : "),
        ...conditions.flatMap((c, i) => [...(i > 0 ? [texte(" et ")] : []), latex(c)]),
        texte(
          dir.interieure.fonction.type === "racineSurFraction"
            ? `. ${int}(x) est un quotient : là où le dénominateur est positif, on élève au carré sans changer le sens ; là où il est négatif, le quotient est négatif. `
            : `. Comme ${int}(x) est une racine carrée, donc positive, on élève au carré sans changer le sens. `,
        ),
        ...(aideCarre ? [texte("Au carré : "), latex(aideCarre), texte(". ")] : []),
        texte("D'où "),
        latex(`x \\in ${deuxiemeConditionResolue(dir)}`),
        texte("."),
      ],
    });
  } else {
    lignesCond2.push({ label: "Calcul", sousQuestion: lCond2, fragments: [texte("On résout : "), latex(`x \\in ${deuxiemeConditionResolue(dir)}`), texte(".")] });
  }
  return [
    { label: "Substitution", sousQuestion: lExpr, fragments: [texte(`On remplace chaque x de ${ext}(x) par ${int}(x) : `), latex(latexAideFormuleNiveau2(dir))] },
    { label: "Simplification", sousQuestion: lExpr, fragments: [latex(`${composeeLatex(dir)} = ${signeDevantFraction(dir.latex)}`)] },
    {
      label: "Condition",
      sousQuestion: lCond1,
      fragments: [texte(`x doit appartenir au domaine de ${int} : `), latex(`\\operatorname{dom}${int} = ${ensembleLatex(dir.interieure.domaine)}`), texte(".")],
    },
    ...lignesCond2,
    // Une seule ligne « Piège » par exercice (sur la première composée), même quand les deux sont demandées.
    ...(index === 0 ? [{ label: "Piège", sousQuestion: lDom, fragments: [texte(piege(dir))] }] : []),
    { label: "Conclusion", sousQuestion: lDom, fragments: [texte("Le domaine est l'intersection des deux conditions : "), latex(domaineComposeeLatex(dir)), texte(".")] },
  ];
}

function correctionDetailleeComposerFonctions(exercice: ExerciceComposerFonctions): EtapeCorrection[] {
  return directionsActives(exercice).flatMap((dir, i) => lignesDirection(dir, i));
}

function baremeComposerFonctions(exercice: ExerciceComposerFonctions): BaremeExercice {
  const dirs = directionsActives(exercice);
  const deux = dirs.length === 2;
  const criteres: CritereBareme[] = dirs.flatMap((dir, i) => {
    const [lExpr, lCond1, lCond2, lDom] = lettres(i);
    const nom = `${nomExterieure(dir)}∘${dir.nomInterieure}`;
    const c = (sousQuestion: string, t: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(t)], points });
    return deux
      ? [c(lExpr, `Expression de ${nom} substituée et simplifiée`, 1), c(lCond2, `Les deux conditions posées et résolues pour ${nom}`, 0.5), c(lDom, `Domaine de ${nom} (intersection)`, 0.5)]
      : [
          c(lExpr, `Expression de ${nom} substituée et simplifiée`, 1.5),
          c(lCond1, `Première condition : x dans le domaine de ${dir.nomInterieure}`, 0.5),
          c(lCond2, "Deuxième condition posée et résolue", 1),
          c(lDom, `Domaine de ${nom} (intersection)`, 1),
        ];
  });
  return {
    reponseFinale: reponseBreveComposerFonctions(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte(piege(dirs[0]))], cout: "−1" },
      { description: [texte("Composition dans le mauvais ordre (f(g(x)) et g(f(x)) confondus)")], cout: "0 pt sur l'expression" },
    ],
    reponsesAcceptees: [[texte("Toute écriture équivalente de l'expression simplifiée ; le domaine écrit comme réunion d'intervalles ou comme ℝ privé de valeurs.")]],
  };
}

function difficulteComposerFonctions(exercice: ExerciceComposerFonctions): 1 | 2 | 3 {
  const dirs = directionsActives(exercice);
  return dirs.length === 2 || dirs.some((d) => d.riche) ? 3 : 2;
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionComposerFonctions(exercice: ExerciceComposerFonctions): BlocCorrection[] {
  return correctionDetailleeComposerFonctions(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationComposerFonctions: AdaptateurFeuilleExercices<ExerciceComposerFonctions> = {
  titreDocument: "Composer f et g — Évaluation",
  nomFichierBase: "composer-fonctions",
  genererInstance: genererExerciceComposerFonctions,
  catalogueVariantes: CATALOGUE_COMBOS,
  genererInstanceAvecVariante: (id) => construireAvecComboSensTire(id),
  construireEnonce: construireEnonceComposerFonctions,
  construireCorrection: construireCorrectionComposerFonctions,
  difficulte: difficulteComposerFonctions,
  reponseBreve: reponseBreveComposerFonctions,
  correctionDetaillee: correctionDetailleeComposerFonctions,
  bareme: baremeComposerFonctions,
  enoncePapier: enoncePapierComposerFonctions,
  dureeMinutes: 8,
  profilInstance: profilComposerFonctions,
  regroupable: false,
};
