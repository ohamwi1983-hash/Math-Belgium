import type { ExerciceOptimisation, ExerciceOptimisationModelisation } from "../../core/optimisation.types";
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
  consigneContrainteEtGrandeur,
  consigneDecision,
  consigneDomaine,
  consigneSommet,
  consigneSysteme,
  formatDomaineLatex,
  formatGrandeurXYLatex,
  formatIsolementLatex,
  segmentsPhraseEnonce,
  texteAideDomaineNiveau1,
  texteAideSystemeNiveau3,
} from "../../ui/formatOptimisation";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { croquisOptimisationSvg } from "../croquisPapierSecondDegre";
import { profilOptimisation } from "../profilsEvaluation4eCh1";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceOptimisation } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOptimisation>` pour gen55 (Problèmes
 * d'optimisation, chapitre 1, `AppOptimisation.tsx`) — feuille d'exercices et évaluation.
 *
 * Écrans : identification de x et y (si l'énoncé ne les nomme pas), relation + grandeur en x et y,
 * système (isoler, substituer, développer), domaine de validité, sommet, décision (le sommet
 * est-il dans le domaine ?), phrase de conclusion — pour une fonction DONNÉE, seulement les trois
 * derniers. Tous sont des étapes de guidage d'UN seul problème : sur papier, l'énoncé est le
 * contexte (avec son croquis), la variable x nommée (l'écran d'identification la fixe, sans quoi le
 * corrigé n'aurait pas de référence commune) et la question finale ; les écrans deviennent les
 * étapes du corrigé.
 *
 * Valeurs : celles de l'instance et des fonctions de l'écran (`consigne*`, `formatIsolementLatex`,
 * `formatGrandeurXYLatex`, `formatDomaineLatex`, phrase de conclusion correcte). Exception : la
 * fonction développée est écrite en valeurs EXACTES (fractions) — l'écran arrondit les coefficients
 * au centième (5/48 affiché « 0,1 » pour la famille « somme répartie en deux »).
 */

type EtapeGen55 = "identification" | "relation" | "systeme" | "domaine" | "sommet" | "decision" | "conclusion";

function etapes(e: ExerciceOptimisation): EtapeGen55[] {
  if (e.variante === "fonctionDonnee") return ["sommet", "decision", "conclusion"];
  return [...(e.identificationXY ? (["identification"] as EtapeGen55[]) : []), "relation", "systeme", "domaine", "sommet", "decision", "conclusion"];
}

function lettre(e: ExerciceOptimisation, etape: EtapeGen55): string {
  return "abcdefg"[etapes(e).indexOf(etape)];
}

/** Retire la précision de saisie des consignes d'écran (« arrondi au centième accepté si besoin ») :
 * sur papier, les valeurs sont exactes. */
function sansArrondi(consigne: string): string {
  return consigne.replace(/ — arrondi au centième accepté si besoin/g, "").replace(/ \(arrondi au centième accepté si besoin\)/g, "");
}

/** Nombre exact (entier, décimal court ou fraction irréductible) en LaTeX. */
function nombreLatex(valeur: number): string {
  const brut = formatFractionIrreductible(valeur);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(brut);
  if (m) {
    const d = Number(m[3]);
    // Dénominateur 2, 4, 5, 10… : écriture décimale exacte (« 0,5 »), comme les énoncés.
    if ([2, 4, 5, 10, 20, 25, 50, 100].includes(d)) return String(Math.round(valeur * 100) / 100).replace(".", "{,}");
    return `${m[1]}\\dfrac{${m[2]}}{${m[3]}}`;
  }
  return brut;
}

function entreParentheses(valeur: number): string {
  return valeur < 0 ? `\\left(${nombreLatex(valeur)}\\right)` : nombreLatex(valeur);
}

/** f(x) développée, coefficients exacts. */
function fonctionLatex(e: ExerciceOptimisation): string {
  const v = e.contexte.labelVariable;
  const termes = [
    { c: e.fonction.a, s: `${v}^2` },
    { c: e.fonction.b, s: v },
    { c: e.fonction.c, s: "" },
  ].filter((t) => Math.abs(t.c) > 1e-12);
  return termes
    .map((t, i) => {
      const abs = Math.abs(t.c);
      const corps = abs === 1 && t.s ? t.s : `${nombreLatex(abs)}${t.s}`;
      return i === 0 ? `${t.c < 0 ? "-" : ""}${corps}` : ` ${t.c < 0 ? "-" : "+"} ${corps}`;
    })
    .join("");
}

function nomFonction(e: ExerciceOptimisation): string {
  return `f(${e.contexte.labelVariable})`;
}

function phraseFragments(phrase: string): FragmentConsigne[] {
  return segmentsPhraseEnonce(phrase).map((s) => (s.type === "katex" ? latex(s.valeur) : texte(s.valeur)));
}

function nomY(e: ExerciceOptimisationModelisation): string | undefined {
  return e.identificationXY?.candidatsY[e.identificationXY.indexCorrectY];
}

function unite(u: string): string {
  return u ? ` (en ${u})` : "";
}

/** Énoncé commun (papier) : contexte, variable nommée, question finale. */
function enteteEnonce(e: ExerciceOptimisation, avecConsigne: boolean): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = phraseFragments(e.contexte.phraseEnonce);
  if (e.variante === "modelisation" && e.identificationXY) {
    const y = nomY(e);
    fragments.push(texte(` On note ${e.contexte.labelVariable} ${e.contexte.nomVariable}${unite(e.contexte.uniteVariable)}${e.contexte.croquis && y ? ` et ${e.contrainte.lettreCherchee} ${y}` : ""}.`));
  }
  if (!avecConsigne) return fragments;
  const atteint = e.contexte.genreGrandeur === "feminin" ? "elle est atteinte" : "il est atteint";
  fragments.push(texte(` ${e.contexte.questionFinale ?? "Quelle est la valeur optimale ?"} Pour quelle valeur de ${e.contexte.labelVariable} ${atteint} ?`));
  if (e.variante === "modelisation") fragments.push(texte(` Justifie en exprimant la grandeur à optimiser en fonction de ${e.contexte.labelVariable} et en précisant le domaine de validité.`));
  return fragments;
}

function consigneEtape(e: ExerciceOptimisation, etape: EtapeGen55): FragmentConsigne[] {
  switch (etape) {
    case "identification":
      return e.variante === "modelisation" ? [texte(`Identifie ce que représentent ${e.contexte.labelVariable} et ${e.contrainte.lettreCherchee} dans cette situation.`)] : [];
    case "relation":
      return e.variante === "modelisation" ? [texte(consigneContrainteEtGrandeur(e))] : [];
    case "systeme":
      return e.variante === "modelisation" ? [texte(consigneSysteme(e))] : [];
    case "domaine":
      return e.variante === "modelisation" ? [texte(sansArrondi(consigneDomaine(e)))] : [];
    case "sommet":
      return [texte(sansArrondi(consigneSommet(e)))];
    case "decision":
      return [texte(sansArrondi(consigneDecision(e)))];
    case "conclusion":
      return [texte("Rédige la phrase de conclusion (valeur optimale, unité, valeur de la variable).")];
  }
}

function construireEnonceOptimisation(e: ExerciceOptimisation): SectionExercice {
  return {
    enteteFragments: enteteEnonce(e, false),
    enteteHtml: croquisOptimisationSvg(e.contexte.croquis),
    questions: etapes(e).map((etape) => ({ consigne: consigneEtape(e, etape) })),
  };
}

function enoncePapierOptimisation(e: ExerciceOptimisation): EnoncePapier {
  return { section: { enteteFragments: enteteEnonce(e, true), enteteHtml: croquisOptimisationSvg(e.contexte.croquis), questions: [] } };
}

function phraseConclusion(e: ExerciceOptimisation): string {
  return e.optionsInterpretation.find((o) => o.correcte)?.texte ?? "";
}

function construireCorrectionOptimisation(e: ExerciceOptimisation): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [latex(`${nomFonction(e)} = ${fonctionLatex(e)}`), texte(" ; "), latex(formatDomaineLatex(e.domaine, e.contexte.labelVariable))] },
    { type: "paragraphe", fragments: [texte(phraseConclusion(e))] },
  ];
}

function valeur(e: ExerciceOptimisation, x: number): number {
  return e.fonction.a * x * x + e.fonction.b * x + e.fonction.c;
}

function difficulteOptimisation(e: ExerciceOptimisation): 1 | 2 | 3 {
  if (e.variante === "fonctionDonnee") return e.sommetDansDomaine ? 1 : 2;
  return e.famille === "aireEnclos" ? 2 : 3;
}

function reponseBreveOptimisation(e: ExerciceOptimisation): FragmentConsigne[] {
  return [texte(phraseConclusion(e))];
}

function correctionDetailleeOptimisation(e: ExerciceOptimisation): EtapeCorrection[] {
  const L = (etape: EtapeGen55) => lettre(e, etape);
  const v = e.contexte.labelVariable;
  const lignes: EtapeCorrection[] = [];
  if (e.variante === "modelisation") {
    if (e.identificationXY) {
      lignes.push({ label: "Variables", sousQuestion: L("identification"), fragments: [latex(v), texte(` : ${e.contexte.nomVariable} ; `), latex(e.contrainte.lettreCherchee), texte(` : ${nomY(e) ?? ""}.`)] });
    }
    lignes.push(
      { label: "Relation", sousQuestion: L("relation"), fragments: [latex(e.contrainte.enonceLatex), texte(` ; ${e.contexte.nomGrandeur} = `), latex(formatGrandeurXYLatex(e)), texte(".")] },
      { label: "Isoler", sousQuestion: L("systeme"), fragments: [latex(formatIsolementLatex(e.contrainte, v)), texte(".")] },
      { label: "Substituer", sousQuestion: L("systeme"), fragments: phraseFragments(texteAideSystemeNiveau3(e).replace(/^Expression substituée, non développée : /, "")) },
      { label: "Développer", sousQuestion: L("systeme"), fragments: [latex(`${nomFonction(e)} = ${fonctionLatex(e)}`), texte(".")] },
      { label: "Domaine", sousQuestion: L("domaine"), fragments: [texte(`${texteAideDomaineNiveau1(e).replace(/^Rappel : /, "").replace(/\.$/, " :")} `), latex(formatDomaineLatex(e.domaine, v)), texte(".")] },
    );
  }
  lignes.push({
    label: "Sommet",
    sousQuestion: L("sommet"),
    fragments: [
      latex(`${v}_S = -\\dfrac{b}{2a} = -\\dfrac{${nombreLatex(e.fonction.b)}}{2\\cdot ${entreParentheses(e.fonction.a)}} = ${nombreLatex(e.sommet.x)}`),
      texte(" ; "),
      latex(`f\\left(${nombreLatex(e.sommet.x)}\\right) = ${nombreLatex(e.sommet.y)}`),
      texte(e.fonction.a < 0 ? " (a < 0 : maximum)." : " (a > 0 : minimum)."),
    ],
  });
  if (e.sommetDansDomaine) {
    lignes.push({ label: "Décision", sousQuestion: L("decision"), fragments: [latex(`${nombreLatex(e.sommet.x)} \\in [${nombreLatex(e.domaine.inf)}\\,;\\,${nombreLatex(e.domaine.sup)}]`), texte(" : l'optimum est atteint au sommet.")] });
  } else {
    lignes.push({
      label: "Décision",
      sousQuestion: L("decision"),
      fragments: [
        latex(`${nombreLatex(e.sommet.x)} \\notin [${nombreLatex(e.domaine.inf)}\\,;\\,${nombreLatex(e.domaine.sup)}]`),
        texte(" : le sommet n'est pas atteignable, on compare les valeurs aux bornes : "),
        latex(`f(${nombreLatex(e.domaine.inf)}) = ${nombreLatex(valeur(e, e.domaine.inf))}`),
        texte(" et "),
        latex(`f(${nombreLatex(e.domaine.sup)}) = ${nombreLatex(valeur(e, e.domaine.sup))}`),
        texte("."),
      ],
    });
  }
  lignes.push({ label: "Conclusion", sousQuestion: L("conclusion"), fragments: [texte(phraseConclusion(e))] });
  lignes.push(piege(e));
  return lignes;
}

function piege(e: ExerciceOptimisation): EtapeCorrection {
  const L = (etape: EtapeGen55) => lettre(e, etape);
  if (e.variante === "fonctionDonnee") {
    return e.sommetDansDomaine
      ? { label: "Piège", sousQuestion: L("decision"), fragments: [texte("Vérifier que le sommet appartient au domaine AVANT de conclure : c'est ce qui autorise à y lire l'optimum.")] }
      : { label: "Piège", sousQuestion: L("decision"), fragments: [texte("Le sommet est hors du domaine : sa valeur n'est jamais atteinte. L'optimum réel est à une borne du domaine.")] };
  }
  switch (e.famille) {
    case "aireEnclos":
      return e.contexte.croquis?.type === "aireEnclosCloture" && e.contexte.croquis.configuration !== "libre"
        ? { label: "Piège", sousQuestion: L("relation"), fragments: [texte("Les côtés adossés à un mur ne sont pas clôturés : ils n'entrent pas dans la longueur de clôture.")] }
        : { label: "Piège", sousQuestion: L("domaine"), fragments: [texte("Les deux dimensions doivent rester positives : le domaine se lit sur la relation, pas sur le sommet.")] };
    case "revenuPrix":
      return { label: "Piège", sousQuestion: L("domaine"), fragments: [texte("Deux conditions à poser : le prix et le nombre d'acheteurs restent positifs — en oublier une donne un domaine faux.")] };
    case "sommeDeuxCarres":
      return { label: "Piège", sousQuestion: L("relation"), fragments: [texte("La grandeur n'est pas x·y : elle se calcule avec les carrés des deux parts (aires des formes, ou valeur proportionnelle au carré de la masse).")] };
    case "rectangleInscrit":
      return { label: "Piège", sousQuestion: L("relation"), fragments: [texte("La relation entre x et y vient de triangles semblables (proportion), pas d'une somme constante.")] };
    default:
      return { label: "Piège", sousQuestion: L("decision"), fragments: [texte("Vérifier que le sommet appartient au domaine avant de conclure.")] };
  }
}

function baremeOptimisation(e: ExerciceOptimisation): BaremeExercice {
  const L = (etape: EtapeGen55) => lettre(e, etape);
  const v = e.contexte.labelVariable;
  const criteres: CritereBareme[] =
    e.variante === "modelisation"
      ? [
          { sousQuestion: L("relation"), critere: [texte("Relation entre les variables et grandeur exprimée : "), latex(e.contrainte.enonceLatex)], points: 1 },
          { sousQuestion: L("systeme"), critere: [texte("Fonction développée : "), latex(`${nomFonction(e)} = ${fonctionLatex(e)}`)], points: 0.5 },
          { sousQuestion: L("domaine"), critere: [texte("Domaine de validité : "), latex(formatDomaineLatex(e.domaine, v))], points: 0.5 },
          { sousQuestion: L("sommet"), critere: [texte("Sommet : "), latex(`${v}_S = ${nombreLatex(e.sommet.x)}`), texte(", "), latex(`f(${v}_S) = ${nombreLatex(e.sommet.y)}`)], points: 1 },
          { sousQuestion: L("decision"), critere: [texte(e.sommetDansDomaine ? "Sommet dans le domaine vérifié" : "Sommet hors du domaine, comparaison aux bornes")], points: 0.5 },
          { sousQuestion: L("conclusion"), critere: [texte("Conclusion rédigée avec l'unité et la valeur de la variable")], points: 0.5 },
        ]
      : [
          { sousQuestion: L("sommet"), critere: [texte("Sommet : "), latex(`${v}_S = ${nombreLatex(e.sommet.x)}`), texte(", "), latex(`f(${v}_S) = ${nombreLatex(e.sommet.y)}`)], points: 1.5 },
          { sousQuestion: L("decision"), critere: [texte(e.sommetDansDomaine ? "Sommet dans le domaine vérifié, optimum au sommet" : "Sommet hors du domaine, valeurs aux bornes comparées")], points: 1.5 },
          { sousQuestion: L("conclusion"), critere: [texte("Conclusion rédigée avec l'unité et la valeur de la variable")], points: 1 },
        ];
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Valeur de la variable et valeur optimale confondues dans la conclusion")], cout: "0 pt sur la conclusion" },
    { description: [texte("Unité de la grandeur oubliée ou fausse")], cout: "−0,5" },
  ];
  if (!e.sommetDansDomaine) erreurs.unshift({ description: [texte("Optimum lu au sommet alors qu'il est hors du domaine")], cout: "0 pt sur la décision et la conclusion" });
  if (e.variante === "modelisation") erreurs.push({ description: [texte("Erreur de développement après substitution")], cout: "−0,5, suite notée sans double pénalité" });
  return {
    reponseFinale: [texte(phraseConclusion(e))],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Sommet obtenu par la forme canonique ou par la symétrie des racines plutôt qu'avec la formule de l'abscisse")], [texte("Autre choix d'inconnue, si la modélisation est cohérente et la conclusion juste")]],
  };
}

export const adaptateurEvaluationOptimisation: AdaptateurFeuilleExercices<ExerciceOptimisation> = {
  profilInstance: profilOptimisation,
  titreDocument: "Problèmes d'optimisation — Évaluation",
  nomFichierBase: "optimisation-second-degre",
  genererInstance: genererExerciceOptimisation,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as (typeof CATALOGUE_FAMILLES)[number]["id"]),
  construireEnonce: construireEnonceOptimisation,
  construireCorrection: construireCorrectionOptimisation,
  difficulte: difficulteOptimisation,
  reponseBreve: reponseBreveOptimisation,
  correctionDetaillee: correctionDetailleeOptimisation,
  bareme: baremeOptimisation,
  enoncePapier: enoncePapierOptimisation,
  dureeMinutes: 12,
};
