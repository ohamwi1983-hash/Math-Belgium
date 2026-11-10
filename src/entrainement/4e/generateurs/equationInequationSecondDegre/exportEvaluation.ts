import type { ExerciceEquationInequationSecondDegre, FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre } from "../../core/equationInequationSecondDegre.types";
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
import { formatEquationInequationLatex, formatDomaineTexte, consigneValidation, consignePoserSysteme, texteAidePoserSystemeNiveau2 } from "../../ui/formatEquationInequationSecondDegre";
import { formatFonctionDeveloppeeLatex, segmentsPhraseEnonce } from "../../ui/formatOptimisation";
import { croquisEquationInequationSvg } from "../croquisPapierSecondDegre";
import { CATALOGUE_FAMILLES, CATALOGUE_VARIANTES, PAIRES_VALIDES, construireAvecFamilleId, genererExerciceEquationInequationSecondDegre } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationInequationSecondDegre>` pour gen57
 * (Équations et inéquations du second degré en contexte, chapitre 1,
 * `AppEquationInequationSecondDegre.tsx`) — feuille d'exercices et évaluation.
 *
 * Écrans : (poser le système, isoler et substituer — familles « système ») ou (poser l'équation /
 * l'inéquation), résoudre, valider avec le domaine, phrase de conclusion : les étapes de guidage
 * d'UN seul problème. Sur papier : le contexte (avec son croquis), le domaine de validité (donnée de
 * la situation : il ne se déduit pas toujours du texte), la question finale ; les écrans deviennent
 * les étapes du corrigé.
 *
 * Catalogue = les 24 paires « famille::variante » du sélecteur de l'écran (même ordre, même
 * fonction de tirage — le QR code rouvre la même instance). Valeurs : celles de l'instance et des
 * fonctions de l'écran (`formatEquationInequationLatex`, `consigneValidation`, système de
 * `texteAidePoserSystemeNiveau2`, phrase de conclusion correcte). Seule l'écriture des intervalles
 * est précisée sur papier : une borne venant d'une racine d'une inéquation STRICTE est exclue.
 */

const LABEL_FAMILLE = Object.fromEntries(CATALOGUE_FAMILLES.map((f) => [f.id, f.label])) as Record<FamilleEquationInequationSecondDegre, string>;
const LABEL_VARIANTE = Object.fromEntries(CATALOGUE_VARIANTES.map((v) => [v.id, v.label])) as Record<VarianteEquationInequationSecondDegre, string>;

/** Mêmes 24 entrées, même ordre que `OPTIONS_DEV` de l'écran. */
export const CATALOGUE_PAIRES = PAIRES_VALIDES.map((p) => ({ id: `${p.familleId}::${p.varianteId}`, label: `${LABEL_FAMILLE[p.familleId]} — ${LABEL_VARIANTE[p.varianteId]}` }));

function construireDepuisPaire(id: string): ExerciceEquationInequationSecondDegre {
  const [familleId, varianteId] = id.split("::") as [FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre];
  return construireAvecFamilleId(familleId, varianteId);
}

/** Familles A (fonction donnée) : coefficients et seuil décimaux — la calculatrice est nécessaire. */
const FAMILLES_CALCULATRICE: FamilleEquationInequationSecondDegre[] = ["jetEau", "consommationCarburant", "populationPoissons"];
export const PAIRES_CALCULATRICE = CATALOGUE_PAIRES.map((p) => p.id).filter((id) => FAMILLES_CALCULATRICE.includes(id.split("::")[0] as FamilleEquationInequationSecondDegre));

type EtapeGen57 = "systeme" | "poser" | "resoudre" | "validation" | "conclusion";

function etapes(e: ExerciceEquationInequationSecondDegre): EtapeGen57[] {
  return e.voieSysteme ? ["systeme", "poser", "resoudre", "validation", "conclusion"] : ["poser", "resoudre", "validation", "conclusion"];
}

function lettre(e: ExerciceEquationInequationSecondDegre, etape: EtapeGen57): string {
  return "abcde"[etapes(e).indexOf(etape)];
}

function nombreLatex(valeur: number): string {
  return String(Number(valeur.toFixed(6))).replace(".", "{,}");
}

function entreParentheses(valeur: number): string {
  return valeur < 0 ? `(${nombreLatex(valeur)})` : nombreLatex(valeur);
}

function phraseFragments(phrase: string): FragmentConsigne[] {
  return segmentsPhraseEnonce(phrase).map((s) => (s.type === "katex" ? latex(s.valeur) : texte(s.valeur)));
}

const nomEquation = (e: ExerciceEquationInequationSecondDegre) => (e.variante === "equation" ? "équation" : "inéquation");

function enteteEnonce(e: ExerciceEquationInequationSecondDegre, avecConsigne: boolean): FragmentConsigne[] {
  const { contexte } = e.base;
  const fragments = phraseFragments(contexte.phraseEnonce);
  if (e.voieSysteme && !contexte.croquis) fragments.push(texte(` On note ${contexte.labelVariable} ${contexte.nomVariable}.`));
  fragments.push(texte(` Dans cette situation, ${contexte.labelVariable} varie dans le domaine de validité ${formatDomaineTexte(e)}.`));
  if (avecConsigne) fragments.push(texte(` ${e.questionFinale} Justifie en posant une ${nomEquation(e)} du second degré, en la résolvant, puis en tenant compte du domaine de validité.`));
  return fragments;
}

function consigneEtape(e: ExerciceEquationInequationSecondDegre, etape: EtapeGen57): FragmentConsigne[] {
  switch (etape) {
    case "systeme":
      return [texte(consignePoserSysteme())];
    case "poser":
      return e.voieSysteme
        ? [texte(`Isole y dans la première équation, substitue-le dans la seconde et écris l'${nomEquation(e)} du second degré en x obtenue.`)]
        : [texte(`Exprime ${e.base.contexte.nomGrandeur} en fonction de ${e.base.contexte.labelVariable}, puis pose l'${nomEquation(e)} correspondante.`)];
    case "resoudre":
      return [texte(`Résous algébriquement cette ${nomEquation(e)}.`)];
    case "validation":
      return [texte(consigneValidation(e).replace(/ — arrondi au centième accepté si besoin/, "").replace(" Classe chacune d'elles.", ""))];
    case "conclusion":
      return [texte("Rédige la phrase de conclusion.")];
  }
}

function construireEnonceEquationInequation(e: ExerciceEquationInequationSecondDegre): SectionExercice {
  return {
    enteteFragments: enteteEnonce(e, false),
    enteteHtml: croquisEquationInequationSvg(e.base.contexte.croquis),
    questions: etapes(e).map((etape) => ({ consigne: consigneEtape(e, etape) })),
  };
}

function enoncePapierEquationInequation(e: ExerciceEquationInequationSecondDegre): EnoncePapier {
  return { section: { enteteFragments: enteteEnonce(e, true), enteteHtml: croquisEquationInequationSvg(e.base.contexte.croquis), questions: [] } };
}

function phraseConclusion(e: ExerciceEquationInequationSecondDegre): string {
  return e.optionsInterpretation.find((o) => o.correcte)?.texte ?? "";
}

// ---------------------------------------------------------------------------------------------
// Résolution (coefficients de l'instance)
// ---------------------------------------------------------------------------------------------

/** a x² + b x + (c − k) = 0 (ou son signe) — l'équation de l'écran, ramenée à 0. */
function trinomeReduit(e: ExerciceEquationInequationSecondDegre): { a: number; b: number; c: number } {
  const { a, b, c } = e.base.fonction;
  return { a, b, c: Number((c - e.k).toFixed(6)) };
}

function trinomeLatex(e: ExerciceEquationInequationSecondDegre): string {
  const t = trinomeReduit(e);
  return formatFonctionDeveloppeeLatex(t, e.base.contexte.labelVariable);
}

function symbole(e: ExerciceEquationInequationSecondDegre): string {
  return e.variante === "equation" ? "=" : e.sens === "gt" ? ">" : "<";
}

function racines(e: ExerciceEquationInequationSecondDegre): [number, number] {
  return e.variante === "equation" ? e.racinesCandidates : [e.intervalleBrut.inf, e.intervalleBrut.sup];
}

function intervalleValideLatex(e: ExerciceEquationInequationSecondDegre): string {
  if (e.variante !== "inequation") return "";
  const { inf, sup } = e.intervalleValide;
  // Borne venant d'une racine : exclue (inéquation stricte) ; borne venant du domaine : incluse.
  const gauche = inf === e.intervalleBrut.inf ? "\\left]" : "\\left[";
  const droite = sup === e.intervalleBrut.sup ? "\\right[" : "\\right]";
  return `${e.base.contexte.labelVariable} \\in ${gauche}${nombreLatex(inf)}\\,;\\,${nombreLatex(sup)}${droite}`;
}

function construireCorrectionEquationInequation(e: ExerciceEquationInequationSecondDegre): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [latex(formatEquationInequationLatex(e))] },
    { type: "paragraphe", fragments: [texte(phraseConclusion(e))] },
  ];
}

function difficulteEquationInequation(e: ExerciceEquationInequationSecondDegre): 1 | 2 | 3 {
  if (e.voieSysteme) return 3;
  return FAMILLES_CALCULATRICE.includes(e.famille) || e.famille === "produitEntiersConsecutifs" || e.famille === "carreMoinsNombre" ? 2 : 3;
}

function reponseBreveEquationInequation(e: ExerciceEquationInequationSecondDegre): FragmentConsigne[] {
  return [texte(phraseConclusion(e))];
}

function correctionDetailleeEquationInequation(e: ExerciceEquationInequationSecondDegre): EtapeCorrection[] {
  const L = (etape: EtapeGen57) => lettre(e, etape);
  const v = e.base.contexte.labelVariable;
  const lignes: EtapeCorrection[] = [];
  if (e.voieSysteme && e.systeme) {
    lignes.push({ label: "Système", sousQuestion: L("systeme"), fragments: [texte(`${e.systeme.label1[0].toUpperCase()}${e.systeme.label1.slice(1)} et ${e.systeme.label2} : `), latex(texteAidePoserSystemeNiveau2(e))] });
    const S = e.systeme.x0 + e.systeme.y0;
    lignes.push({
      label: "Substituer",
      sousQuestion: L("poser"),
      fragments: [latex(`y = ${S} - x`), texte(", donc "), latex(`x(${S} - x) ${symbole(e)} ${nombreLatex(e.k)}`), texte(", soit "), latex(formatEquationInequationLatex(e)), texte(".")],
    });
  } else {
    lignes.push({
      label: "Poser",
      sousQuestion: L("poser"),
      fragments: [texte(`${e.base.contexte.nomGrandeur[0].toUpperCase()}${e.base.contexte.nomGrandeur.slice(1)} en fonction de ${v} : `), latex(formatFonctionDeveloppeeLatex(e.base.fonction, v)), texte(", donc "), latex(formatEquationInequationLatex(e)), texte(".")],
    });
  }
  const t = trinomeReduit(e);
  const delta = t.b * t.b - 4 * t.a * t.c;
  const [r1, r2] = racines(e);
  lignes.push(
    {
      label: "Méthode",
      sousQuestion: L("resoudre"),
      fragments: [texte("On ramène à 0 : "), latex(`${trinomeLatex(e)} ${symbole(e)} 0`), texte(e.variante === "equation" ? "." : " ; on cherche d'abord les racines du trinôme.")],
    },
    {
      label: "Calcul",
      sousQuestion: L("resoudre"),
      fragments: [latex(`\\Delta = ${entreParentheses(t.b)}^2 - 4\\cdot ${entreParentheses(t.a)}\\cdot ${entreParentheses(t.c)} = ${nombreLatex(delta)}`), texte(" ; "), latex(`${v} = ${nombreLatex(Math.min(r1, r2))}`), texte(" ou "), latex(`${v} = ${nombreLatex(Math.max(r1, r2))}`), texte(".")],
    },
  );
  if (e.variante === "inequation") {
    lignes.push({
      label: "Signe",
      sousQuestion: L("resoudre"),
      fragments: [texte(`Le trinôme a le signe de a (${t.a > 0 ? "positif" : "négatif"}) à l'extérieur des racines et le signe contraire entre elles : `), latex(`${v} \\in \\left]${nombreLatex(e.intervalleBrut.inf)}\\,;\\,${nombreLatex(e.intervalleBrut.sup)}\\right[`), texte(".")],
    });
  }
  const dom = `[${nombreLatex(e.base.domaine.inf)}\\,;\\,${nombreLatex(e.base.domaine.sup)}]`;
  if (e.variante === "equation") {
    const rejetees = e.racinesCandidates.filter((r) => !e.racinesValides.includes(r));
    lignes.push({
      label: "Validation",
      sousQuestion: L("validation"),
      fragments: [
        texte("Domaine "),
        latex(dom),
        texte(" : "),
        ...e.racinesCandidates.flatMap((r, i) => [...(i > 0 ? [texte(" ; ")] : []), latex(`${v} = ${nombreLatex(r)}`), texte(e.racinesValides.includes(r) ? " convient" : " est rejetée (hors du domaine)")]),
        texte(rejetees.length === 0 ? " — les deux racines conviennent." : "."),
      ],
    });
  } else {
    lignes.push({ label: "Validation", sousQuestion: L("validation"), fragments: [texte("On garde la partie commune avec le domaine "), latex(dom), texte(" : "), latex(intervalleValideLatex(e)), texte(".")] });
  }
  lignes.push({ label: "Conclusion", sousQuestion: L("conclusion"), fragments: [texte(phraseConclusion(e))] });
  lignes.push(piege(e));
  return lignes;
}

function piege(e: ExerciceEquationInequationSecondDegre): EtapeCorrection {
  const L = (etape: EtapeGen57) => lettre(e, etape);
  if (e.variante === "equation") {
    return e.racinesValides.length < e.racinesCandidates.length
      ? { label: "Piège", sousQuestion: L("validation"), fragments: [texte("Une solution de l'équation n'est pas forcément une réponse au problème : la racine hors du domaine de validité est rejetée.")] }
      : { label: "Piège", sousQuestion: L("validation"), fragments: [texte("Vérifier CHAQUE racine dans le domaine : ici les deux conviennent, il y a deux réponses.")] };
  }
  return { label: "Piège", sousQuestion: L("validation"), fragments: [texte("L'ensemble des solutions de l'inéquation n'est pas la réponse : on ne garde que sa partie commune avec le domaine de validité.")] };
}

function baremeEquationInequation(e: ExerciceEquationInequationSecondDegre): BaremeExercice {
  const L = (etape: EtapeGen57) => lettre(e, etape);
  const v = e.base.contexte.labelVariable;
  const validation = e.variante === "equation" ? [latex(e.racinesValides.map((r) => `${v} = ${nombreLatex(r)}`).join(" \\text{ ou } "))] : [latex(intervalleValideLatex(e))];
  const criteres: CritereBareme[] = [
    ...(e.voieSysteme ? [{ sousQuestion: L("systeme"), critere: [texte("Système des deux relations : "), latex(texteAidePoserSystemeNiveau2(e))], points: 1 }] : []),
    { sousQuestion: L("poser"), critere: [texte(`${e.variante === "equation" ? "Équation" : "Inéquation"} posée : `), latex(formatEquationInequationLatex(e))], points: e.voieSysteme ? 0.5 : 1.5 },
    { sousQuestion: L("resoudre"), critere: [texte("Résolution (discriminant ou factorisation, racines" + (e.variante === "inequation" ? ", signe du trinôme" : "") + ")")], points: 1 },
    { sousQuestion: L("validation"), critere: [texte("Confrontation au domaine : "), ...validation], points: 1 },
    { sousQuestion: L("conclusion"), critere: [texte("Conclusion rédigée avec l'unité")], points: 0.5 },
  ];
  const erreurs: ErreurFrequente[] = [
    e.variante === "equation"
      ? { description: [texte("Racine hors du domaine gardée (ou racine valide rejetée)")], cout: "0 pt sur la validation" }
      : { description: [texte("Intervalle des solutions donné sans l'intersecter avec le domaine")], cout: "0 pt sur la validation" },
    { description: [texte("Seuil oublié en ramenant à 0 (Δ calculé avec c au lieu de c − k)")], cout: "−1, suite notée sans double pénalité" },
    { description: [texte("Valeur de la variable et valeur de la grandeur confondues dans la conclusion")], cout: "0 pt sur la conclusion" },
  ];
  if (e.variante === "inequation") erreurs.push({ description: [texte("Signe du trinôme inversé (solution prise à l'extérieur des racines)")], cout: "−1" });
  return {
    reponseFinale: [texte(phraseConclusion(e))],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Racines obtenues par factorisation plutôt que par le discriminant")], [texte("Ensemble des solutions écrit avec des inégalités (par exemple 7 < x < 19) plutôt qu'en intervalle")]],
  };
}

export const adaptateurEvaluationEquationInequationSecondDegre: AdaptateurFeuilleExercices<ExerciceEquationInequationSecondDegre> = {
  calculatriceIndispensable: PAIRES_CALCULATRICE,
  titreDocument: "Équations et inéquations du second degré en contexte — Évaluation",
  nomFichierBase: "equations-inequations-contexte",
  genererInstance: genererExerciceEquationInequationSecondDegre,
  catalogueVariantes: CATALOGUE_PAIRES,
  genererInstanceAvecVariante: construireDepuisPaire,
  construireEnonce: construireEnonceEquationInequation,
  construireCorrection: construireCorrectionEquationInequation,
  difficulte: difficulteEquationInequation,
  reponseBreve: reponseBreveEquationInequation,
  correctionDetaillee: correctionDetailleeEquationInequation,
  bareme: baremeEquationInequation,
  enoncePapier: enoncePapierEquationInequation,
  dureeMinutes: 10,
};
