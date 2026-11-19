import type { ExerciceEquationInequationSecondDegre } from "../../core/equationInequationSecondDegre.types";
import type { PhaseEquationInequationSecondDegre } from "../../moteur/typesEquationInequationSecondDegre";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { consignePoserSysteme, consigneValidation, formatEquationInequationLatex, texteAidePoserSystemeNiveau2 } from "../../ui/formatEquationInequationSecondDegre";
import { formatFonctionDeveloppeeLatex } from "../../ui/formatOptimisation";
import { COURS_CONTEXTE, COURS_RESOUDRE, COURS_SIGNE_TRINOME } from "../../ui/corrigeSecondDegre2";

/**
 * Corrigé détaillé « comme au tableau » de gen57 (équations et inéquations du second degré en
 * contexte) — règle `.claude/rules/feuilles-evaluations.md`. Une étape par écran
 * (`ecransEquationInequationSecondDegre`, même séquence que `sequencePourExercice` de l'appli) :
 * système (familles D), poser (construction de la grandeur pour les familles B/C, substitution pour
 * D), résoudre (ramener à 0, Δ, formule, signe du trinôme), valider avec le domaine (une ligne par
 * racine ou par borne, avec la décision), conclusion. Valeurs exactes (racines entières, coefficients
 * décimaux finis) écrites avec la virgule décimale. Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceEquationInequationSecondDegre;
type Phase = PhaseEquationInequationSecondDegre;

const LETTRES = "abcdef";

export function ecransEquationInequationSecondDegre(e: E): Phase[] {
  return e.voieSysteme ? ["poserSysteme", "isolerSubstituer", "resoudre", "validation", "interpretation"] : ["poserEquationInequation", "resoudre", "validation", "interpretation"];
}

export function lettrePhaseEquationInequationSecondDegre(e: E, phase: Phase): string {
  return LETTRES[ecransEquationInequationSecondDegre(e).indexOf(phase)] ?? "";
}

/** Nombre décimal exact (au plus 6 décimales), virgule belge. */
export function d(v: number): string {
  const r = Number(v.toFixed(6));
  return String(Object.is(r, -0) ? 0 : r).replace(".", "{,}");
}

function dp(v: number): string {
  return v < 0 ? `(${d(v)})` : d(v);
}

function dTexte(v: number): string {
  return d(v).replace("{,}", ",").replace(/^-/, "−");
}

const nomEquation = (e: E) => (e.variante === "equation" ? "équation" : "inéquation");

function symbole(e: E): string {
  return e.variante === "equation" ? "=" : e.sens === "gt" ? ">" : "<";
}

function racines(e: E): [number, number] {
  return e.variante === "equation" ? e.racinesCandidates : [e.intervalleBrut.inf, e.intervalleBrut.sup];
}

/** Trinôme ramené à 0 : a x² + b x + (c − k). */
function reduit(e: E): { a: number; b: number; c: number } {
  const { a, b, c } = e.base.fonction;
  return { a, b, c: Number((c - e.k).toFixed(6)) };
}

function intervalleOuvert(v: string, inf: number, sup: number): string {
  return `${v} \\in \\,]${d(inf)}\\,;\\,${d(sup)}[`;
}

/** Intervalle-solution valide : borne venant d'une racine (inéquation stricte) exclue, borne du domaine incluse. */
export function intervalleValideLatex(e: E): string {
  if (e.variante !== "inequation") return "";
  const { inf, sup } = e.intervalleValide;
  const gauche = inf === e.intervalleBrut.inf ? "]" : "[";
  const droite = sup === e.intervalleBrut.sup ? "[" : "]";
  return `${e.base.contexte.labelVariable} \\in \\,${gauche}${d(inf)}\\,;\\,${d(sup)}${droite}`;
}

export function phraseConclusion(e: E): string {
  return e.optionsInterpretation.find((o) => o.correcte)?.texte ?? "";
}

export function consigneEcranEquationInequation(e: E, phase: Phase): FragmentConsigne[] {
  switch (phase) {
    case "poserSysteme":
      return [texte(consignePoserSysteme())];
    case "isolerSubstituer":
      return [texte(`Isole y dans la première équation, substitue-le dans la seconde et écris l'${nomEquation(e)} du second degré en x obtenue.`)];
    case "poserEquationInequation":
      return [texte(`Exprime ${e.base.contexte.nomGrandeur} en fonction de ${e.base.contexte.labelVariable}, puis pose l'${nomEquation(e)} correspondante.`)];
    case "resoudre":
      return [texte(`Résous algébriquement cette ${nomEquation(e)}.`)];
    case "validation":
      return [texte(consigneValidation(e).replace(/ — arrondi au centième accepté si besoin/, "").replace(" Classe chacune d'elles.", ""))];
    case "interpretation":
      return [texte("Rédige la phrase de conclusion.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------------------------

function etapeSysteme(sq: string, e: E): EtapeCorrection[] {
  const sys = e.systeme;
  if (!sys) return [];
  const S = sys.x0 + sys.y0;
  const lignes: LigneCalcul[] =
    e.famille === "perimetreAire"
      ? [ligne(`2x+2y=${2 * S}`, "le périmètre : deux longueurs et deux largeurs"), ligne(`x+y=${S}`, "on divise par 2"), ligne(`x\\cdot y=${sys.x0 * sys.y0}`, "l'aire : longueur × largeur")]
      : [ligne(`x+y=${S}`, sys.label1), ligne(`x\\cdot y=${sys.x0 * sys.y0}`, sys.label2)];
  return [
    utilise(sq, [texte(`Mise en équation : chaque relation de l'énoncé devient une équation en x et y ${COURS_CONTEXTE}.`)]),
    calcul(sq, lignes),
    resultat(sq, [latex(texteAidePoserSystemeNiveau2(e))]),
  ];
}

/** Construction de la grandeur en fonction de x (familles B et C) : lignes vérifiables en x. */
function lignesConstruction(e: E): { lignes: LigneCalcul[]; regle: string } | null {
  const { a, b } = e.base.fonction;
  const f = formatFonctionDeveloppeeLatex(e.base.fonction, "x");
  switch (e.famille) {
    case "rectanglePerimetre":
      return {
        regle: "l'aire d'un rectangle est largeur × longueur ; la clôture fait deux largeurs et deux longueurs",
        lignes: [ligne(`L=\\dfrac{${d(4 * b / 2)}}{2}-x=${d(b)}-x`, "longueur : la moitié du périmètre moins la largeur"), ligne(`\\mathcal{A}(x)=x(${d(b)}-x)`, "largeur × longueur"), ligne(`=${f}`, "on distribue")],
      };
    case "enclosAdosseMur":
      return {
        regle: "seuls deux largeurs et un côté parallèle au mur sont clôturés ; aire = largeur × longueur",
        lignes: [ligne(`L=${d(b)}-2x`, "clôture : x + x + L"), ligne(`\\mathcal{A}(x)=x(${d(b)}-2x)`, "largeur × longueur"), ligne(`=${f}`, "on distribue")],
      };
    case "triangleRectangleCathetes":
      return {
        regle: "l'aire d'un triangle rectangle est le demi-produit de ses cathètes",
        lignes: [ligne(`y=${d(2 * b)}-x`, "l'autre cathète : la somme moins x"), ligne(`\\mathcal{A}(x)=\\dfrac{x(${d(2 * b)}-x)}{2}`, "demi-produit des cathètes"), ligne(`=${f}`, "on distribue")],
      };
    case "cerfVolantDiagonales":
      return {
        regle: "l'aire d'un losange est le demi-produit de ses diagonales",
        lignes: [ligne(`d=${d(2 * b)}-x`, "l'autre diagonale : la somme moins x"), ligne(`\\mathcal{A}(x)=\\dfrac{x(${d(2 * b)}-x)}{2}`, "demi-produit des diagonales"), ligne(`=${f}`, "on distribue")],
      };
    case "facadeMaisonToit": {
      const m = /hauteur du toit \(mesurée au faîte\) vaut (\d+(?:,\d+)?) m/.exec(e.base.contexte.phraseEnonce);
      if (!m) return null;
      const h = Number(m[1].replace(",", "."));
      const s = b - h / 2;
      return {
        regle: "aire du mur rectangulaire + aire du toit triangulaire, la moitié de base × hauteur",
        lignes: [
          ligne(`m=${d(s)}-x`, "hauteur du mur : la somme moins la largeur"),
          ligne(`\\mathcal{A}(x)=x(${d(s)}-x)+\\dfrac{${d(h)}x}{2}`, "mur + toit"),
          ligne(`=${d(s)}x-x^2+${h / 2 === 1 ? "" : d(h / 2)}x`, "on distribue"),
          ligne(`=${f}`, "on réduit"),
        ],
      };
    }
    case "produitEntiersConsecutifs":
      return { regle: "le second entier est x + 1", lignes: [ligne(`x(x+1)=${f}`, "produit des deux entiers, on distribue")] };
    case "carreMoinsNombre":
      return { regle: "le carré du nombre diminué du nombre", lignes: [ligne(`x^2-x=${f}`, "carré diminué du nombre")] };
    default:
      void a;
      return null;
  }
}

function etapePoser(sq: string, e: E): EtapeCorrection[] {
  const v = e.base.contexte.labelVariable;
  const eq = formatEquationInequationLatex(e);
  const relation = e.variante === "equation" ? "vaut exactement" : e.sens === "gt" ? "dépasse" : "est en dessous de";
  const justifSeuil = `${e.base.contexte.nomGrandeur} ${relation} ${dTexte(e.k)}`;
  if (e.voieSysteme && e.systeme) {
    const S = e.systeme.x0 + e.systeme.y0;
    return [
      utilise(sq, [texte(`Substitution : on isole y dans la première équation, puis on le remplace dans la seconde ${COURS_CONTEXTE}.`)]),
      calcul(sq, [ligne(`y=${S}-x`, "on isole y"), ligne(`x(${S}-x)${symbole(e)}${d(e.k)}`, `on remplace y dans x · y ${symbole(e) === "=" ? "=" : symbole(e)} ${dTexte(e.k)}`), ligne(eq, "on distribue")]),
      resultat(sq, [latex(eq)]),
    ];
  }
  const construction = lignesConstruction(e);
  if (construction) {
    return [
      utilise(sq, [texte(`Mise en équation : on exprime ${e.base.contexte.nomGrandeur} en fonction de ${v} (${construction.regle}), puis on la compare au seuil ${COURS_CONTEXTE}.`)]),
      calcul(sq, construction.lignes, [], "Grandeur en fonction de x"),
      calcul(sq, [ligne(eq, justifSeuil)], [], `${e.variante === "equation" ? "Équation" : "Inéquation"}`),
      resultat(sq, [latex(eq)]),
    ];
  }
  return [
    utilise(sq, [texte(`Mise en équation : la grandeur est donnée par la fonction de l'énoncé ; on écrit qu'elle ${relation} le seuil ${COURS_CONTEXTE}.`)]),
    calcul(sq, [ligne(eq, justifSeuil)]),
    resultat(sq, [latex(eq)]),
  ];
}

function lignesDiscriminantDecimal(t: { a: number; b: number; c: number }): LigneCalcul[] {
  const quatreAC = 4 * t.a * t.c;
  const delta = t.b * t.b - quatreAC;
  return [
    ligne("\\Delta=b^2-4ac", "discriminant"),
    ligne(`=${dp(t.b)}^2-4\\cdot ${dp(t.a)}\\cdot ${dp(t.c)}`, "on remplace a, b et c"),
    ligne(`=${d(t.b * t.b)}${quatreAC < 0 ? "+" : "-"}${d(Math.abs(quatreAC))}`),
    ligne(`=${d(delta)}`, delta > 0 ? "Δ > 0 : deux racines" : undefined),
  ];
}

function lignesRacine(t: { a: number; b: number; c: number }, indice: 1 | 2, signe: "-" | "+"): LigneCalcul[] {
  const delta = t.b * t.b - 4 * t.a * t.c;
  const s = Math.sqrt(delta);
  const x = (-t.b + (signe === "+" ? s : -s)) / (2 * t.a);
  return [
    ligne(`x_${indice}=\\dfrac{-b${signe}\\sqrt{\\Delta}}{2a}`, indice === 1 ? "formule des racines" : undefined),
    ligne(`=\\dfrac{${d(-t.b)}${signe}${d(s)}}{${d(2 * t.a)}}`, indice === 1 ? [texte("on remplace, "), latex(`\\sqrt{${d(delta)}}=${d(s)}`)] : "on remplace"),
    ligne(`=${d(x)}`),
  ];
}

function etapeResoudre(sq: string, e: E): EtapeCorrection[] {
  const v = e.base.contexte.labelVariable;
  const t = reduit(e);
  const sym = symbole(e);
  const tri = formatFonctionDeveloppeeLatex(t, v);
  const [r1, r2] = [...racines(e)].sort((u, w) => u - w);
  const blocs: EtapeCorrection[] = [
    calcul(sq, [ligne(formatEquationInequationLatex(e)), ligne(`${tri} ${sym} 0`, e.k > 0 ? `on soustrait ${dTexte(e.k)} aux deux membres` : `on ajoute ${dTexte(-e.k)} aux deux membres`)], [], "Ramener à 0"),
    calcul(sq, lignesDiscriminantDecimal(t), [], "Discriminant"),
    calcul(sq, [...lignesRacine(t, 1, "-"), ...lignesRacine(t, 2, "+")], [], "Racines"),
  ];
  if (e.variante === "inequation") {
    const entre = (t.a > 0 && sym === "<") || (t.a < 0 && sym === ">");
    blocs.push(calcul(sq, [ligne(`${tri} ${sym} 0\\iff ${intervalleOuvert(v, r1, r2)}`, `signe de a (${t.a > 0 ? "+" : "−"}) à l'extérieur des racines, contraire entre elles : on garde ${entre ? "l'intérieur" : "l'extérieur"}`)], [], "Signe du trinôme"));
  }
  const res: FragmentConsigne[] = e.variante === "equation" ? [latex(`${v} = ${d(r1)}`), texte(" ou "), latex(`${v} = ${d(r2)}`)] : [latex(intervalleOuvert(v, r1, r2))];
  return [
    utilise(sq, [texte(`On ramène à 0, puis discriminant et formule des racines ${COURS_RESOUDRE}${e.variante === "inequation" ? ` ; le signe du trinôme donne l'intervalle ${COURS_SIGNE_TRINOME}` : ""}.`)]),
    ...blocs,
    resultat(sq, res),
    verification(sq, [texte("Somme et produit des racines (trinôme ramené à 0) : "), latex(`${d(r1)}+${d(r2)}=${d(r1 + r2)}=-\\dfrac{b}{a}`), texte(" et "), latex(`${d(r1)}\\cdot ${d(r2)}=${d(r1 * r2)}=\\dfrac{c}{a}`), texte(".")]),
  ];
}

function etapeValidation(sq: string, e: E): EtapeCorrection[] {
  const v = e.base.contexte.labelVariable;
  const { inf, sup } = e.base.domaine;
  const dom = `[${d(inf)}\\,;\\,${d(sup)}]`;
  const lignes: LigneCalcul[] = [];
  if (e.variante === "equation") {
    for (const r of e.racinesCandidates) {
      if (e.racinesValides.includes(r)) lignes.push(ligne(`${d(inf)}\\leq ${d(r)}\\leq ${d(sup)}`, `${v} = ${dTexte(r)} est dans le domaine : convient`));
      else lignes.push(ligne(`${d(r)}${r < inf ? "<" : ">"}${d(r < inf ? inf : sup)}`, `${v} = ${dTexte(r)} est hors du domaine : rejetée`));
    }
  } else {
    const { inf: g, sup: dr } = e.intervalleBrut;
    const vg = e.intervalleValide.inf;
    const vd = e.intervalleValide.sup;
    lignes.push(ligne(vg === g ? `${d(g)}\\geq ${d(inf)}` : `${d(g)}<${d(inf)}`, vg === g ? `borne gauche : la racine ${dTexte(g)}, exclue (inégalité stricte)` : `borne gauche : celle du domaine, ${dTexte(inf)}, incluse`));
    lignes.push(ligne(vd === dr ? `${d(dr)}\\leq ${d(sup)}` : `${d(dr)}>${d(sup)}`, vd === dr ? `borne droite : la racine ${dTexte(dr)}, exclue (inégalité stricte)` : `borne droite : celle du domaine, ${dTexte(sup)}, incluse`));
  }
  const res: FragmentConsigne[] =
    e.variante === "equation"
      ? e.racinesValides.length === 0
        ? [texte("Aucune racine ne convient.")]
        : e.racinesValides.flatMap((r, i) => [...(i > 0 ? [texte(" ou ")] : []), latex(`${v} = ${d(r)}`)])
      : [latex(intervalleValideLatex(e))];
  const piege =
    e.variante === "equation"
      ? e.racinesValides.length < e.racinesCandidates.length
        ? "Une solution de l'équation n'est pas forcément une réponse au problème : la racine hors du domaine de validité est rejetée."
        : "Vérifier chaque racine dans le domaine : ici les deux conviennent, il y a deux réponses."
      : "L'ensemble des solutions de l'inéquation n'est pas la réponse : on ne garde que sa partie commune avec le domaine de validité.";
  return [
    utilise(sq, [texte(`Domaine de validité `), latex(`${v} \\in ${dom}`), texte(` : seules les valeurs du domaine ont un sens dans la situation ${COURS_CONTEXTE}.`)]),
    calcul(sq, lignes),
    resultat(sq, res),
    lignePiege(sq, [texte(piege)]),
  ];
}

function etapeConclusion(sq: string, e: E): EtapeCorrection[] {
  const v = e.base.contexte.labelVariable;
  const unite = e.base.contexte.uniteVariable;
  const lignes: LigneCalcul[] =
    e.variante === "equation"
      ? e.racinesValides.map((r) => ligne(`${v}=${d(r)}`, `${e.base.contexte.nomVariable}${unite ? ` (en ${unite})` : ""} : valeur retenue`))
      : [ligne(intervalleValideLatex(e), `${e.base.contexte.nomVariable}${unite ? ` (en ${unite})` : ""} : valeurs retenues`)];
  return [
    utilise(sq, [texte(`Conclusion : on répond à la question avec la valeur de ${v} (sa signification et son unité), pas avec celle de la grandeur ${COURS_CONTEXTE}.`)]),
    calcul(sq, lignes),
    resultat(sq, [texte(phraseConclusion(e))]),
  ];
}

function etapesEcran(e: E, phase: Phase, sq: string): EtapeCorrection[] {
  switch (phase) {
    case "poserSysteme":
      return etapeSysteme(sq, e);
    case "isolerSubstituer":
    case "poserEquationInequation":
      return etapePoser(sq, e);
    case "resoudre":
      return etapeResoudre(sq, e);
    case "validation":
      return etapeValidation(sq, e);
    case "interpretation":
      return etapeConclusion(sq, e);
  }
}

export function correctionDetailleeEquationInequationSecondDegre(e: E): EtapeCorrection[] {
  return ecransEquationInequationSecondDegre(e).flatMap((phase, i) => etapesEcran(e, phase, LETTRES[i]));
}
