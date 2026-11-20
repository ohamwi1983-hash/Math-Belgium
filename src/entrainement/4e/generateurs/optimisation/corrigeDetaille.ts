import type { ExerciceOptimisation, ExerciceOptimisationModelisation } from "../../core/optimisation.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { finaliserCorrige } from "../../ui/corrigeSecondDegre1";
import { lineaire, mono, somme } from "../../ui/corrigeChapitre3";
import { COURS_UTILISER, lignesAbscisseSommet, lignesOrdonneeSommet, lignesValeur, nb, q, trinomeLatex, valeurTrinome } from "../../ui/corrigeParabole";
import { consigneContrainteEtGrandeur, consigneDecision, consigneDomaine, consigneSommet, consigneSysteme, formatDomaineLatex, formatGrandeurXYLatex, formatIsolementLatex } from "../../ui/formatOptimisation";

/**
 * Corrigé détaillé « comme au tableau » de gen55 (« Problèmes d'optimisation », `AppOptimisation.tsx`)
 * — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`etapesOptimisation`, même
 * séquence que la barre de progression) : identification de x et y (si l'énoncé ne les nomme pas),
 * relation et grandeur, système (isoler, substituer, développer), domaine, sommet, décision (sommet
 * dans le domaine ou optimum à une borne), conclusion — pour une fonction DONNÉE, les trois derniers.
 * Valeurs EXACTES (fractions pour 5/48), calculées depuis l'instance. Partagé par l'adaptateur papier
 * et l'appli.
 */

type E = ExerciceOptimisation;
type M = ExerciceOptimisationModelisation;

export type EtapeGen55 = "identification" | "relation" | "systeme" | "domaine" | "sommet" | "decision" | "conclusion";

export function etapesOptimisation(e: E): EtapeGen55[] {
  if (e.variante === "fonctionDonnee") return ["sommet", "decision", "conclusion"];
  return [...(e.identificationXY ? (["identification"] as EtapeGen55[]) : []), "relation", "systeme", "domaine", "sommet", "decision", "conclusion"];
}

export function lettreEtapeOptimisation(e: E, etape: EtapeGen55): string {
  return "abcdefg"[etapesOptimisation(e).indexOf(etape)] ?? "a";
}

/** Écran de l'appli → étape du corrigé. */
export function etapeDePhaseOptimisation(phase: string): EtapeGen55 {
  return phase === "contrainteEtGrandeur" ? "relation" : phase === "interpretation" ? "conclusion" : (phase as EtapeGen55);
}

/** Écrans de pure lecture (critère du niveau) : identification de x et y, phrase de conclusion. */
export function lettresLectureOptimisation(e: E): string[] {
  return (["identification", "conclusion"] as EtapeGen55[]).filter((x) => etapesOptimisation(e).includes(x)).map((x) => lettreEtapeOptimisation(e, x));
}

function sansArrondi(consigne: string): string {
  return consigne.replace(/ — arrondi au centième accepté si besoin/g, "").replace(/ \(arrondi au centième accepté si besoin\)/g, "");
}

/** Consigne de chaque écran (titres « Étape n — … » du corrigé). */
export function consigneEtapeOptimisation(e: E, etape: EtapeGen55): FragmentConsigne[] {
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

/** Nom de la fonction : celui de l'énoncé (h, C, B…) pour une fonction donnée, f sinon. */
export function nomFonctionOptimisation(e: E): string {
  if (e.variante === "fonctionDonnee") {
    const m = /\$([A-Za-z])\(([a-z])\)=/.exec(e.contexte.phraseEnonce);
    if (m) return m[1]!;
  }
  return "f";
}

export function fonctionLatexOptimisation(e: E): string {
  return trinomeLatex(e.fonction.a, e.fonction.b, e.fonction.c, e.contexte.labelVariable);
}

export function phraseConclusionOptimisation(e: E): string {
  return e.optionsInterpretation.find((o) => o.correcte)?.texte ?? "";
}

function nomY(e: M): string {
  return e.identificationXY?.candidatsY[e.identificationXY.indexCorrectY] ?? "l'autre grandeur";
}

/** « (en m) » — omis pour une unité de dénombrement déjà dans le nom (« le nombre de connexions »). */
function unite(u: string, nom = ""): string {
  return u && !nom.includes(u) ? ` (en ${u})` : "";
}

// ---------------------------------------------------------------------------------------------
// Étapes de la modélisation
// ---------------------------------------------------------------------------------------------

function etapeIdentification(e: M, l: string): EtapeCorrection[] {
  const id = e.identificationXY!;
  const x = id.candidatsX[id.indexCorrectX]!;
  const y = id.candidatsY[id.indexCorrectY]!;
  const leurreX = id.candidatsX.find((_, i) => i !== id.indexCorrectX);
  return [
    utilise(l, [texte(`Les inconnues sont les grandeurs que l'on peut choisir et qui sont liées par l'énoncé ; la grandeur à optimiser n'est pas une inconnue, on l'exprime ensuite avec elles ${COURS_UTILISER}.`)]),
    calcul(l, [ligne(`${e.contexte.labelVariable}=\\ldots`, `${x}${unite(e.contexte.uniteVariable, x)}`), ligne(`${e.contrainte.lettreCherchee}=\\ldots`, y)], [texte("On lit dans l'énoncé :")]),
    resultat(l, [latex(e.contexte.labelVariable), texte(` : ${x} ; `), latex(e.contrainte.lettreCherchee), texte(` : ${y}.`)]),
    piege(l, [texte(leurreX ? `Ne pas prendre « ${leurreX} » pour une inconnue : c'est une donnée ou la grandeur que l'on cherche à optimiser.` : "La grandeur à optimiser n'est pas une inconnue.")]),
  ];
}

function etapeRelation(e: M, l: string): EtapeCorrection[] {
  const v = e.contexte.labelVariable;
  const piegeTexte: FragmentConsigne[] =
    e.famille === "aireEnclos" && e.contexte.croquis?.type === "aireEnclosCloture" && e.contexte.croquis.configuration !== "libre"
      ? [texte("Les côtés adossés à un mur ne sont pas clôturés : ils n'entrent pas dans la longueur disponible.")]
      : e.famille === "sommeDeuxCarres"
        ? [texte("La grandeur n'est pas le produit des deux parts : elle se calcule avec leurs carrés.")]
        : e.famille === "rectangleInscrit"
          ? [texte("La relation entre les deux dimensions vient des triangles semblables (proportion), pas d'une somme constante.")]
          : [texte("Écrire d'abord la relation entre les deux inconnues, sans encore remplacer : on substitue à l'étape suivante.")];
  return [
    utilise(l, [texte(`On traduit l'énoncé en deux équations : la contrainte qui relie ${v} et ${e.contrainte.lettreCherchee}, puis la grandeur à optimiser exprimée avec les deux inconnues, sans substituer ${COURS_UTILISER}.`)]),
    calcul(l, [ligne(e.contrainte.enonceLatex.replace(/\s+/g, ""), "contrainte de l'énoncé"), ligne(`G=${formatGrandeurXYLatex(e)}`, `G : ${e.contexte.nomGrandeur}${unite(e.contexte.uniteGrandeur, e.contexte.nomGrandeur)}, à optimiser`)]),
    resultat(l, [latex(e.contrainte.enonceLatex), texte(" et "), latex(`G=${formatGrandeurXYLatex(e)}`), texte(`, où G est ${e.contexte.nomGrandeur}.`)]),
    piege(l, piegeTexte),
  ];
}

/** Substitution puis développement, une transformation par ligne, selon la forme de la grandeur. */
function lignesSubstitution(e: M): LigneCalcul[] {
  const { pente: p, ordonnee: o } = e.contrainte;
  const Y = lineaire(p, o);
  const brut = (e.formuleGrandeurXYTexte ?? "").replace(/\s+/g, "");
  const G = "G";
  const fin = trinomeLatex(e.fonction.a, e.fonction.b, e.fonction.c);
  const remplacer = [texte("on remplace y par "), latex(Y)];
  const carreY = somme([
    [p * p, "x^2"],
    [2 * p * o, "x"],
    [o * o, ""],
  ]);
  let lignes: LigneCalcul[];
  const prix = /^\((\d+)\+x\)\*y$/.exec(brut);
  const carres = /^(\d+)\*x\^2\+\1\*y\^2$/.exec(brut);
  const quotients = /^x\^2\/(\d+)\+y\^2\/(\d+)$/.exec(brut);
  if (brut === "x*y") {
    lignes = [ligne(`${G}=x\\cdot(${Y})`, remplacer), ligne(`=${fin}`, "on distribue x")];
  } else if (brut === "x*y/2") {
    lignes = [ligne(`${G}=\\dfrac{x\\cdot(${Y})}{2}`, remplacer), ligne(`=\\dfrac{${somme([[p, "x^2"], [o, "x"]])}}{2}`, "on distribue x"), ligne(`=${fin}`, "on divise chaque terme par 2")];
  } else if (prix) {
    const P0 = Number(prix[1]);
    lignes = [
      ligne(`${G}=(${P0}+x)\\cdot(${Y})`, remplacer),
      ligne(`=${P0}\\cdot(${Y})+x\\cdot(${Y})`, "on distribue"),
      ligne(`=${somme([[P0 * p, "x"], [P0 * o, ""], [p, "x^2"], [o, "x"]])}`, "on développe chaque produit"),
      ligne(`=${fin}`, "on réduit"),
    ];
  } else if (carres) {
    const k = Number(carres[1]);
    lignes = [
      ligne(`${G}=${mono(k, "x^2")}+${k}(${Y})^2`, remplacer),
      ligne(`=${mono(k, "x^2")}+${k}(${carreY})`, "on développe le carré"),
      ligne(`=${somme([[k, "x^2"], [k * p * p, "x^2"], [2 * k * p * o, "x"], [k * o * o, ""]])}`, `on distribue ${k}`),
      ligne(`=${fin}`, "on réduit"),
    ];
  } else if (quotients) {
    const d1 = Number(quotients[1]);
    const d2 = Number(quotients[2]);
    lignes = [
      ligne(`${G}=\\dfrac{x^2}{${d1}}+\\dfrac{(${Y})^2}{${d2}}`, remplacer),
      ligne(`=\\dfrac{x^2}{${d1}}+\\dfrac{${carreY}}{${d2}}`, "on développe le carré"),
      ligne(`=${somme([[1 / d1, "x^2"], [(p * p) / d2, "x^2"], [(2 * p * o) / d2, "x"], [(o * o) / d2, ""]])}`, `on divise chaque terme par ${d2}`),
      ligne(`=${fin}`, "on réduit (même dénominateur pour les termes en x²)"),
    ];
  } else {
    lignes = [ligne(`${G}=${fin}`, "on remplace y, on développe et on réduit")];
  }
  return lignes;
}

/** Expression de la grandeur avec x = 1 et y = sa valeur (vérification de la substitution). */
function grandeurEnUn(e: M): string {
  const y1 = e.contrainte.pente + e.contrainte.ordonnee;
  const yTxt = y1 < 0 || !Number.isInteger(y1) ? `\\left(${q(y1)}\\right)` : q(y1);
  return formatGrandeurXYLatex(e)
    .replace(/(\d)([xy])/g, "$1\\cdot $2")
    .replace(/x/g, "1")
    .replace(/y/g, yTxt);
}

function etapeSysteme(e: M, l: string): EtapeCorrection[] {
  const v = e.contexte.labelVariable;
  const isole = formatIsolementLatex(e.contrainte, v).replace(/\s+/g, "");
  return [
    utilise(l, [texte(`On isole une inconnue dans la contrainte, on la remplace dans l'expression de la grandeur, puis on développe : on obtient une fonction du second degré de ${v} ${COURS_UTILISER}.`)]),
    calcul(l, [ligne(e.contrainte.enonceLatex.replace(/\s+/g, ""), "contrainte"), ligne(isole, `on isole ${e.contrainte.lettreCherchee} : on fait passer le terme en ${v} dans l'autre membre et on divise par le coefficient de ${e.contrainte.lettreCherchee}`)], [], "Isoler"),
    calcul(l, lignesSubstitution(e), [], "Substituer et développer"),
    resultat(l, [latex(`f(${v})=${fonctionLatexOptimisation(e)}`)]),
    verification(l, [
      texte("Pour "),
      latex(`${v}=1`),
      texte(", la contrainte donne "),
      latex(`${e.contrainte.lettreCherchee}=${q(e.contrainte.pente + e.contrainte.ordonnee)}`),
      texte(" ; la grandeur vaut alors "),
      latex(`G=${grandeurEnUn(e)}=${q(valeurTrinome(e.fonction.a, e.fonction.b, e.fonction.c, 1))}`),
      texte(", comme "),
      latex(`f(1)`),
      texte(" ✓"),
    ]),
    piege(l, [texte(`Mettre des parenthèses autour de l'expression de ${e.contrainte.lettreCherchee} quand on la remplace : sinon le signe ou le carré ne portent que sur un terme.`)]),
  ];
}

function etapeDomaine(e: M, l: string): EtapeCorrection[] {
  const v = e.contexte.labelVariable;
  const yL = e.contrainte.lettreCherchee;
  const { pente: p, ordonnee: o } = e.contrainte;
  const prix = /^\((\d+)\+x\)\*y$/.exec((e.formuleGrandeurXYTexte ?? "").replace(/\s+/g, ""));
  const lignes: LigneCalcul[] = [];
  const infCalcule = prix ? -Number(prix[1]) : 0;
  if (prix) lignes.push(ligne(`${prix[1]}+${v}\\geq 0`, "la première grandeur ne peut pas être négative"), ligne(`${v}\\geq ${q(-Number(prix[1]))}`, `on soustrait ${prix[1]}`));
  else lignes.push(ligne(`${v}\\geq 0`, "une longueur, une masse ou une quantité n'est jamais négative"));
  const supCalcule = -o / p;
  lignes.push(
    ligne(`${yL}\\geq 0`, `${yL} ne peut pas être négatif non plus (${nomY(e)})`),
    ligne(`${lineaire(p, o, v)}\\geq 0`, [texte("on remplace "), latex(yL), texte(" par son expression")]),
    ligne(`${mono(p, v)}\\geq ${q(-o)}`, `on soustrait ${nb(o)}`),
    ligne(`${v}\\leq ${q(supCalcule)}`, p === -1 ? "on multiplie par −1 : le sens change" : `on divise par ${nb(p)}, négatif : le sens change`),
  );
  const coherent = Math.abs(infCalcule - e.domaine.inf) < 1e-9 && Math.abs(supCalcule - e.domaine.sup) < 1e-9;
  if (!coherent) {
    // Contrainte supplémentaire de l'énoncé (lot D) : elle resserre le domaine.
    if (e.domaine.inf > infCalcule + 1e-9) lignes.push(ligne(`${v}\\geq ${q(e.domaine.inf)}`, "contrainte supplémentaire de l'énoncé"));
    if (e.domaine.sup < supCalcule - 1e-9) lignes.push(ligne(`${v}\\leq ${q(e.domaine.sup)}`, "contrainte supplémentaire de l'énoncé"));
  }
  return [
    utilise(l, [texte(`Le domaine de validité contient les valeurs de ${v} pour lesquelles toutes les grandeurs du contexte ont un sens : chaque grandeur donne une inéquation, on les combine ${COURS_UTILISER}.`)]),
    calcul(l, lignes),
    resultat(l, [latex(formatDomaineLatex(e.domaine, v))]),
    piege(l, prix ? [texte("Deux conditions, une par grandeur du contexte : en oublier une donne un domaine faux.")] : [texte("Le domaine se lit sur les contraintes du contexte, pas sur le sommet de la parabole.")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Étapes communes : sommet, décision, conclusion
// ---------------------------------------------------------------------------------------------

function etapeSommet(e: E, l: string): EtapeCorrection[] {
  const v = e.contexte.labelVariable;
  const F = nomFonctionOptimisation(e);
  const { a, b, c } = e.fonction;
  const xS = e.sommet.x;
  return [
    utilise(l, [
      texte("L'abscisse du sommet est "),
      latex(`${v}_S=-\\dfrac{b}{2a}`),
      texte(", son ordonnée s'obtient en remplaçant "),
      latex(v),
      texte(" par "),
      latex(`${v}_S`),
      texte(" ; "),
      latex(a < 0 ? "a<0" : "a>0"),
      texte(` : la parabole est tournée vers le ${a < 0 ? "bas, le sommet est un maximum" : "haut, le sommet est un minimum"} ${COURS_UTILISER}.`),
    ]),
    calcul(l, [...lignesAbscisseSommet(a, b, `${v}_S`), ...lignesOrdonneeSommet(a, b, c, xS, "y_S", F)], [texte("Sur "), latex(`${F}(${v})=${fonctionLatexOptimisation(e)}`), texte(" :")]),
    resultat(l, [latex(`${v}_S=${q(xS)}`), texte(" et "), latex(`y_S=${q(e.sommet.y)}`)]),
    verification(l, [texte("Par symétrie autour de l'axe : "), latex(`${F}\\left(${q(xS - 1)}\\right)=${F}\\left(${q(xS + 1)}\\right)=${q(valeurTrinome(a, b, c, xS + 1))}`), texte(" ✓")]),
    piege(l, [texte("Ne pas oublier le « − » de la formule de l'abscisse du sommet.")]),
  ];
}

function etapeDecision(e: E, l: string): EtapeCorrection[] {
  const v = e.contexte.labelVariable;
  const F = nomFonctionOptimisation(e);
  const { a, b, c } = e.fonction;
  const { inf, sup } = e.domaine;
  const xS = e.sommet.x;
  const lignes: LigneCalcul[] = [ligne(`${v}_S=${q(xS)}`, "abscisse du sommet (étape précédente)")];
  if (e.sommetDansDomaine) {
    lignes.push(ligne(`${q(inf)}\\leq ${q(xS)}\\leq ${q(sup)}`, "le sommet est dans le domaine : il est atteint"));
    lignes.push(ligne(`${F}\\left(${q(xS)}\\right)=${q(e.sommet.y)}`, `${e.sens === "max" ? "maximum" : "minimum"} : la valeur au sommet`));
  } else {
    lignes.push(ligne(xS > sup ? `${q(xS)}>${q(sup)}` : `${q(xS)}<${q(inf)}`, "le sommet est hors du domaine : sa valeur n'est jamais atteinte, on compare les bornes"));
    lignes.push(...lignesValeur(a, b, c, inf, `${F}\\left(${q(inf)}\\right)`, "valeur à la borne gauche"));
    lignes.push(...lignesValeur(a, b, c, sup, `${F}\\left(${q(sup)}\\right)`, "valeur à la borne droite"));
    const autre = e.optimal.x === inf ? sup : inf;
    lignes.push(
      ligne(
        `${F}\\left(${q(e.optimal.x)}\\right)${e.sens === "max" ? ">" : "<"}${F}\\left(${q(autre)}\\right)`,
        e.sens === "max" ? "la plus grande des deux : le maximum, à la borne la plus proche du sommet" : "la plus petite des deux : le minimum, à la borne la plus proche du sommet",
      ),
    );
  }
  return [
    utilise(l, [
      texte(
        `Le sommet ne donne l'optimum que s'il appartient au domaine de validité. Sinon, sur le domaine la fonction est toujours croissante ou toujours décroissante : l'optimum est atteint à une borne, celle qui est la plus proche du sommet ${COURS_UTILISER}.`,
      ),
    ]),
    calcul(l, lignes),
    resultat(l, [
      texte(e.sommetDansDomaine ? "Oui, le sommet est dans le domaine ; optimum : " : "Non, le sommet est hors du domaine ; optimum à la borne : "),
      latex(`${v}=${q(e.optimal.x)}`),
      texte(" et "),
      latex(`${F}\\left(${q(e.optimal.x)}\\right)=${q(e.optimal.y)}`),
    ]),
    piege(
      l,
      e.sommetDansDomaine
        ? [texte("Vérifier que le sommet appartient au domaine avant de conclure : c'est ce qui autorise à y lire l'optimum.")]
        : [texte("Le sommet est hors du domaine : sa valeur n'est jamais atteinte, même si c'est la plus grande (ou la plus petite) de la parabole.")],
    ),
  ];
}

function etapeConclusion(e: E, l: string): EtapeCorrection[] {
  const v = e.contexte.labelVariable;
  const F = nomFonctionOptimisation(e);
  return [
    utilise(l, [texte("La conclusion répond à la question posée : la valeur optimale de la grandeur, avec son unité, et la valeur de la variable qui la donne.")]),
    calcul(l, [
      ligne(`${v}=${q(e.optimal.x)}`, `${e.contexte.nomVariable}${unite(e.contexte.uniteVariable, e.contexte.nomVariable)}`),
      ligne(`${F}\\left(${q(e.optimal.x)}\\right)=${q(e.optimal.y)}`, `valeur ${e.sens === "max" ? "maximale" : "minimale"} : ${e.contexte.nomGrandeur}${unite(e.contexte.uniteGrandeur, e.contexte.nomGrandeur)}`),
    ]),
    resultat(l, [texte(phraseConclusionOptimisation(e))]),
    piege(l, [texte("Ne pas confondre la valeur de la variable et la valeur optimale de la grandeur, ni leurs unités.")]),
  ];
}

export function correctionDetailleeOptimisation(e: E): EtapeCorrection[] {
  const L = (x: EtapeGen55) => lettreEtapeOptimisation(e, x);
  const etapes: EtapeCorrection[] = [];
  if (e.variante === "modelisation") {
    if (e.identificationXY) etapes.push(...etapeIdentification(e, L("identification")));
    etapes.push(...etapeRelation(e, L("relation")), ...etapeSysteme(e, L("systeme")), ...etapeDomaine(e, L("domaine")));
  }
  etapes.push(...etapeSommet(e, L("sommet")), ...etapeDecision(e, L("decision")), ...etapeConclusion(e, L("conclusion")));
  return finaliserCorrige(etapes);
}
