import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExArcRacine, ExArctanDroite, ExArctanInverse, ExXArctan, ExerciceEtudeCyclo } from "../../core6e/etudeCyclometrique";
import { q, qL } from "../../ui6e/nombresCycloLotG";
import { deriveeL, domaineL, kAD, kAbsAR, kMoins1AD, parF, reponse, valeursDemandees } from "../../ui6e/formatEtudeCyclometrique";
import type { ColonneTableau, DonneesTableauCyclo } from "../../ui6e/tableauVariationsCyclo";
import { svgTableauVariationsCyclo } from "../../ui6e/tableauVariationsCyclo";

/**
 * Corrigé détaillé « comme au tableau » de `6gen157` (étude d'une fonction cyclométrique), partagé par
 * l'appli et le papier — une lettre par écran : a domaine, b dérivée, c zéros de f′, d variations
 * (signe testé intervalle par intervalle), e valeurs du tableau, avec le tableau de variation complet
 * en `figureHtml` (SVG autonome).
 */

type E = ExerciceEtudeCyclo;
const t = texte;
const f = latex;
const COURS2 = "(cours, § 2)";
const COURS4 = "(cours, § 4)";
const etape = (sq: string, u: Parameters<typeof utilise>[1], lignes: LigneCalcul[], e: E, phase: Parameters<typeof reponse>[1], extra: EtapeCorrection[] = []): EtapeCorrection[] => [
  utilise(sq, u),
  calcul(sq, lignes),
  resultat(sq, reponse(e, phase)),
  ...extra,
];

function tableau(e: E): DonneesTableauCyclo {
  const vs = valeursDemandees(e);
  switch (e.variante) {
    case "arctan-droite":
      return {
        colonnes: [
          { x: "−∞", derivee: "vide", valeur: "+∞" },
          { x: `−${e.d.c.t}`, derivee: "zero", valeur: e.d.fmc.t },
          { x: e.d.c.t, derivee: "zero", valeur: e.d.fc.t },
          { x: "+∞", derivee: "vide", valeur: "−∞" },
        ],
        signes: ["−", "+", "−"],
      };
    case "x-arctan":
      return {
        colonnes: [
          { x: "−∞", derivee: "vide", valeur: "+∞" },
          { x: "0", derivee: "zero", valeur: "0" },
          { x: "+∞", derivee: "vide", valeur: "+∞" },
        ],
        signes: ["−", "+"],
      };
    case "arc-racine": {
      const max = e.d.signe > 0;
      const cols: ColonneTableau[] = [
        { x: "−1", derivee: "vide", valeur: vs[1].attendue.t },
        { x: e.d.x0.t, derivee: "zero", valeur: e.d.fx0.t },
        { x: "1", derivee: "vide", valeur: vs[2].attendue.t },
      ];
      return { colonnes: cols, signes: max ? ["+", "−"] : ["−", "+"] };
    }
    case "arctan-inverse": {
      const s = e.k > 0 ? "−" : "+";
      return {
        colonnes: [
          { x: "−∞", derivee: "vide", valeur: "0" },
          { x: "0", derivee: "interdite", valeur: [vs[0].attendue.t, vs[1].attendue.t] },
          { x: "+∞", derivee: "vide", valeur: "0" },
        ],
        signes: [s, s],
      };
    }
  }
}

export function figureTableauEtude(e: E): string {
  return `<div style="max-width:12cm;margin:0 auto">${svgTableauVariationsCyclo(tableau(e))}</div>`;
}

// --- arctan-droite : k·arctan x − x --------------------------------------------------------

function etapesArctanDroite(e: ExArctanDroite): EtapeCorrection[] {
  const k = kAD(e);
  const kIn = e.d.kd === 1 ? String(e.d.kn) : `\\frac{${e.d.kn}}{${e.d.kd}}`;
  const km1 = kMoins1AD(e);
  const c = e.d.c.l;
  const cArg = c.startsWith("\\dfrac") ? `\\left(${c}\\right)` : c;
  const f2 = q(e.d.kn - e.d.kd - 4 * e.d.kd, 5 * e.d.kd);
  return [
    ...etape("a", [t("arctan est définie sur "), f("\\mathbb{R}"), t(" " + COURS2 + ", un polynôme aussi.")], [ligne(`\\mathrm{dom}\\,f=${domaineL(e)}`, "aucune valeur interdite")], e, "domaine"),
    ...etape(
      "b",
      [t("Dérivée terme à terme "), t(COURS4), t(" : "), f("(\\arctan x)'=\\dfrac{1}{1+x^{2}}"), t(", "), f("(x)'=1"), t(".")],
      [ligne(`f'(x)=${k}\\cdot\\dfrac{1}{1+x^{2}}-1`, "dérivée terme à terme"), ligne(`=\\dfrac{${kIn}-(1+x^{2})}{1+x^{2}}`, "même dénominateur"), ligne(`=${deriveeL(e)}`, "on réduit")],
      e,
      "derivee",
      [piege("b", [t("Oublier la dérivée de "), f("-x"), t(", ou le coefficient devant "), f("\\arctan x"), t(".")])],
    ),
    ...etape(
      "c",
      [t("Un quotient est nul quand son numérateur est nul ; ici "), f("1+x^{2}>0"), t(".")],
      [ligne(`f'(x)=0\\iff ${km1}-x^{2}=0`, [f("1+x^{2}"), t(" ne s'annule jamais")]), ligne(`\\iff x^{2}=${km1}`), ligne(`x=-${c}`, "première solution"), ligne(`x=${c}`, "seconde solution")],
      e,
      "zeros",
      [piege("c", [t("Garder une seule racine de "), f(`x^{2}=${km1}`), t(".")])],
    ),
    ...etape(
      "d",
      [t("f′ a le signe de son numérateur "), f(`${km1}-x^{2}`), t(", constant sur chaque intervalle délimité par ses zéros : on teste une valeur par intervalle.")],
      [ligne(`f'(0)=${km1}>0`, [t("entre "), f(`-${c}`), t(" et "), f(c)]), ligne(`f'(2)=${qL(f2)}<0`, [t("au-delà de "), f(c)]), ligne(`f'(-2)=f'(2)`, "f′ est paire")],
      e,
      "variations",
    ),
    utilise("e", [t("Valeurs remarquables "), t(COURS2), t(" : "), f(`\\arctan ${cArg}=${e.d.arctanC.l}`), t(" ; f est impaire ; "), f("\\lim\\limits_{x\\to\\pm\\infty}\\arctan x=\\pm\\dfrac{\\pi}{2}"), t(".")]),
    calcul("e", [
      ligne(`f${parF(c)}=${k}\\arctan ${cArg}-${c}`),
      ligne(`=${k}\\cdot ${e.d.arctanC.l}-${c}`, "valeur remarquable"),
      ligne(`=${e.d.fc.l}`),
      ligne(`f${parF(`-${c}`)}=-f${parF(c)}`, "f est impaire"),
      ligne(`=${e.d.fmc.l}`),
      ligne(`\\lim\\limits_{x\\to+\\infty}f(x)=-\\infty`, [f(`${k}\\arctan x`), t(" tend vers "), f(`${k}\\cdot\\dfrac{\\pi}{2}`), t(", et "), f("-x"), t(" vers "), f("-\\infty")]),
      ligne(`\\lim\\limits_{x\\to-\\infty}f(x)=+\\infty`, "même raisonnement"),
    ]),
    { ...resultat("e", reponse(e, "valeurs")), figureHtml: figureTableauEtude(e) },
    verification("e", [t("Le maximum local est positif et le minimum local négatif, comme le dit le tableau : "), f(`${e.d.fc.l}\\approx ${e.d.fc.v.toFixed(2).replace(".", "{,}")}`), t(".")]),
  ];
}

// --- x-arctan : x·arctan(x/k) --------------------------------------------------------------

function etapesXArctan(e: ExXArctan): EtapeCorrection[] {
  const k = e.k;
  const at = (arg: string) => (k === 1 ? `\\arctan ${arg}` : `\\arctan\\dfrac{${arg}}{${k}}`);
  const lignesDerivee =
    k === 1
      ? [ligne("f'(x)=1\\cdot\\arctan x+x\\cdot\\dfrac{1}{1+x^{2}}", [f("(uv)'=u'v+uv'")]), ligne(`=${deriveeL(e)}`)]
      : [ligne(`f'(x)=1\\cdot${at("x")}+x\\cdot\\dfrac{\\frac{1}{${k}}}{1+\\frac{x^{2}}{${k * k}}}`, [f("(uv)'=u'v+uv'"), t(", règle de la chaîne")]), ligne(`=${deriveeL(e)}`, [t("on multiplie haut et bas par "), f(String(k * k))])];
  const fp1 = Math.atan(1 / k) + k / (k * k + 1);
  return [
    ...etape("a", [t("arctan est définie sur "), f("\\mathbb{R}"), t(" " + COURS2 + " : le produit de deux fonctions définies sur "), f("\\mathbb{R}"), t(" l'est aussi.")], [ligne(`\\mathrm{dom}\\,f=${domaineL(e)}`, "aucune valeur interdite")], e, "domaine"),
    ...etape("b", [t("Règle du produit et dérivée de "), f("\\arctan u"), t(" "), t(COURS4), t(" : "), f("(\\arctan u)'=\\dfrac{u'}{1+u^{2}}"), t(".")], lignesDerivee, e, "derivee", [
      piege("b", [t("Oublier un des deux termes de la règle du produit"), ...(k === 1 ? [] : [t(", ou le facteur "), f(`\\dfrac{1}{${k}}`), t(" de la règle de la chaîne")]), t(".")]),
    ]),
    ...etape(
      "c",
      [t("On ne résout pas "), f("f'(x)=0"), t(" par calcul : arctan a le signe de son argument, et "), f(`\\dfrac{${k === 1 ? "" : k}x}{${k * k}+x^{2}}`), t(" a le signe de "), f("x"), t(".")],
      [ligne(`f'(0)=\\arctan 0+0`), ligne("=0"), ligne("x>0\\Rightarrow f'(x)>0", "somme de deux nombres positifs"), ligne("x<0\\Rightarrow f'(x)<0", "somme de deux nombres négatifs")],
      e,
      "zeros",
      [piege("c", [t("Conclure « aucun zéro » sans calculer "), f("f'(0)"), t(".")])],
    ),
    ...etape(
      "d",
      [t("f′ a le signe de "), f("x"), t(", comme on l'a vu en cherchant les zéros ; on le confirme par une valeur de chaque côté de 0.")],
      [ligne(`f'(-1)=-${at("1")}-\\dfrac{${k}}{${k * k + 1}}<0`, "à gauche de 0"), ligne(`f'(1)=${at("1")}+\\dfrac{${k}}{${k * k + 1}}`, "à droite de 0"), ligne(`\\approx ${fp1.toFixed(2).replace(".", "{,}")}>0`)],
      e,
      "variations",
    ),
    utilise("e", [t("Le minimum est atteint au zéro de f′ ; "), f("\\lim\\limits_{u\\to+\\infty}\\arctan u=\\dfrac{\\pi}{2}"), t(" "), t(COURS2), t(" ; f est paire.")]),
    calcul("e", [
      ligne(`f(0)=0\\cdot\\arctan 0`),
      ligne("=0"),
      ligne(`\\lim\\limits_{x\\to+\\infty}${at("x")}=\\dfrac{\\pi}{2}`, "limite de référence"),
      ligne(`\\lim\\limits_{x\\to+\\infty}f(x)=+\\infty`, [f("x\\to+\\infty"), t(" multiplié par un nombre proche de "), f("\\dfrac{\\pi}{2}>0")]),
      ligne(`f(-x)=(-x)\\arctan\\left(-${k === 1 ? "x" : `\\dfrac{x}{${k}}`}\\right)`, "arctan est impaire"),
      ligne("=f(x)", "f est paire"),
      ligne(`\\lim\\limits_{x\\to-\\infty}f(x)=+\\infty`, "par parité"),
    ]),
    { ...resultat("e", reponse(e, "valeurs")), figureHtml: figureTableauEtude(e) },
  ];
}

// --- arc-racine : arc(x) + k√(1 − x²) -------------------------------------------------------

function etapesArcRacine(e: ExArcRacine): EtapeCorrection[] {
  const d = e.d;
  const plus = d.signe > 0 ? "+" : "-";
  const kA = kAbsAR(e);
  const arcPrime = d.arc === "arcsin" ? "\\dfrac{1}{\\sqrt{1-x^{2}}}" : "-\\dfrac{1}{\\sqrt{1-x^{2}}}";
  const a = d.arc === "arcsin" ? 1 : -1;
  const num = `${a === 1 ? "1" : "-1"}${d.signe > 0 ? "-" : "+"}${d.racine2 ? "\\sqrt{2}\\,x" : "2x"}`;
  // x₀ = a / k écrit brut : « \dfrac{1}{2} », « -\dfrac{1}{\sqrt{2}} ».
  const signeX0 = a * d.signe < 0 ? "-" : "";
  const brut = `${signeX0}\\dfrac{1}{${d.racine2 ? "\\sqrt{2}" : "2"}}`;
  const vs = valeursDemandees(e);
  const lignesZero: LigneCalcul[] = [ligne(`f'(x)=0\\iff ${num}=0`, [t("le dénominateur est positif sur "), f("]-1\\,;\\,1[")]), ligne(`x=${brut}`, "on isole x")];
  if (d.racine2) lignesZero.push(ligne(`=${d.x0.l}`, "dénominateur rendu rationnel"));
  const x0Arg = `\\left(${d.x0.l}\\right)`;
  return [
    ...etape(
      "a",
      [t(`${d.arc} est définie sur `), f("[-1\\,;\\,1]"), t(" " + COURS2 + " ; la racine demande un radicande positif ou nul.")],
      [ligne("1-x^{2}\\geq 0\\iff x^{2}\\leq 1", "radicande positif ou nul"), ligne("\\iff -1\\leq x\\leq 1"), ligne(`\\mathrm{dom}\\,f=${domaineL(e)}`, `même condition que pour ${d.arc}`)],
      e,
      "domaine",
    ),
    ...etape(
      "b",
      [t("Formules du cours "), t(COURS4), t(", valables sur "), f("]-1\\,;\\,1["), t(" : "), f(`(\\${d.arc} x)'=${arcPrime}`), t(" et "), f("(\\sqrt{u})'=\\dfrac{u'}{2\\sqrt{u}}"), t(".")],
      [
        ligne("(\\sqrt{1-x^{2}})'=\\dfrac{-2x}{2\\sqrt{1-x^{2}}}", [f("u=1-x^{2}"), t(", "), f("u'=-2x")]),
        ligne("=\\dfrac{-x}{\\sqrt{1-x^{2}}}", "on simplifie par 2"),
        ligne(`f'(x)=${arcPrime}${plus}${kA}\\cdot\\dfrac{-x}{\\sqrt{1-x^{2}}}`, "dérivée terme à terme"),
        ligne(`=${deriveeL(e)}`, "même dénominateur"),
      ],
      e,
      "derivee",
      [piege("b", [t("Le signe de la dérivée de la racine, ou celui de "), f("\\arccos'"), t(" ; et f′ n'existe pas en "), f("\\pm 1"), t(".")])],
    ),
    ...etape("c", [t("Un quotient est nul quand son numérateur est nul ; la solution doit appartenir à "), f("]-1\\,;\\,1["), t(".")], lignesZero, e, "zeros", [
      verification("c", [f(`-1<${d.x0.l}<1`), t(" : la valeur est bien dans le domaine de dérivabilité.")]),
    ]),
    ...etape(
      "d",
      [t("Sur "), f("]-1\\,;\\,1["), t(", "), f("\\sqrt{1-x^{2}}>0"), t(" : f′ a le signe du numérateur "), f(num), t(", du premier degré, qui change de signe en "), f(d.x0.l), t(".")],
      [ligne(`f'(0)=${a}${a > 0 ? ">" : "<"}0`, [t("or "), f(`0${0 < d.x0.v ? "<" : ">"}${d.x0.l}`)])],
      e,
      "variations",
    ),
    utilise("e", [t("Valeurs remarquables "), t(COURS2), t(" ; aux bornes, la racine est nulle. f est continue sur le fermé "), f("[-1\\,;\\,1]"), t(" : ses extremums se lisent dans le tableau.")]),
    calcul("e", [
      ligne(`f${x0Arg}=\\${d.arc}${x0Arg}${plus}${kA}\\sqrt{1-${x0Arg}^{2}}`),
      ligne(`=${d.arcX0.l}${plus}${kA}\\cdot ${d.racX0.l}`, "valeurs remarquables"),
      ligne(`=${d.fx0.l}`),
      ligne(`f(-1)=\\${d.arc}(-1)${plus}${kA}\\cdot 0`, [f("\\sqrt{1-1}=0")]),
      ligne(`=${vs[1].attendue.l}`),
      ligne(`f(1)=\\${d.arc} 1${plus}${kA}\\cdot 0`),
      ligne(`=${vs[2].attendue.l}`),
    ]),
    { ...resultat("e", reponse(e, "valeurs")), figureHtml: figureTableauEtude(e) },
    piege("e", [t("Oublier les valeurs aux bornes : sur un intervalle fermé, l'autre extremum de f est atteint à une borne.")]),
  ];
}

// --- arctan-inverse : arctan(k/x) ---------------------------------------------------------

function etapesArctanInverse(e: ExArctanInverse): EtapeCorrection[] {
  const k = e.k;
  const u = k > 0 ? `\\dfrac{${k}}{x}` : `-\\dfrac{${-k}}{x}`;
  const uP = k > 0 ? `-\\frac{${k}}{x^{2}}` : `\\frac{${-k}}{x^{2}}`;
  const decr = k > 0;
  const vs = valeursDemandees(e);
  const fm1 = k > 0 ? `-\\arctan ${k}` : `\\arctan ${-k}`;
  const f1 = k > 0 ? `\\arctan ${k}` : `-\\arctan ${-k}`;
  return [
    ...etape("a", [t("arctan est définie sur "), f("\\mathbb{R}"), t(" " + COURS2 + " ; le quotient "), f(u), t(" demande un dénominateur non nul.")], [ligne("x\\neq 0", "dénominateur non nul"), ligne(`\\mathrm{dom}\\,f=${domaineL(e)}`, "deux intervalles")], e, "domaine"),
    ...etape(
      "b",
      [t("Règle de la chaîne "), t(COURS4), t(" : "), f("(\\arctan u)'=\\dfrac{u'}{1+u^{2}}"), t(" avec "), f(`u=${u}`), t(", "), f(`u'=${uP.replace(/\\frac/g, "\\dfrac")}`), t(".")],
      [ligne(`f'(x)=\\dfrac{${uP}}{1+\\frac{${k * k}}{x^{2}}}`, "règle de la chaîne"), ligne(`=${deriveeL(e)}`, [t("on multiplie haut et bas par "), f("x^{2}")])],
      e,
      "derivee",
      [piege("b", [t("Oublier "), f("u'"), t(" (règle de la chaîne), ou son signe −.")])],
    ),
    ...etape("c", [t("Un quotient est nul quand son numérateur est nul.")], [ligne(`${-k}\\neq 0`, "le numérateur est une constante non nulle")], e, "zeros", [
      piege("c", [t("Répondre 0 : ce n'est même pas un élément du domaine.")]),
    ]),
    ...etape(
      "d",
      [t(`f′ a le signe de ${decr ? "−k < 0" : "−k > 0"} (dénominateur positif) sur chaque intervalle du domaine. Mais `), f("\\mathbb{R}_0"), t(" n'est pas un intervalle : f n'est pas monotone sur cette réunion.")],
      [ligne(`x^{2}+${k * k}>0`, "pour tout x"), ligne(`f(-1)=${fm1}`), ligne(`f(1)=${f1}`), ligne(`f(-1)${decr ? "<" : ">"}f(1)`, [t("alors que "), f("-1<1"), t(` : f n'est pas ${decr ? "décroissante" : "croissante"} sur `), f("\\mathbb{R}_0")])],
      e,
      "variations",
      [piege("d", [t(`Écrire « f est ${decr ? "décroissante" : "croissante"} sur `), f("\\mathbb{R}_0"), t(" » : la monotonie se dit sur un intervalle.")])],
    ),
    utilise("e", [t("Limite de "), f("u"), t(", puis de "), f("\\arctan u"), t(" "), t(COURS2), t(" : "), f("\\lim\\limits_{u\\to\\pm\\infty}\\arctan u=\\pm\\dfrac{\\pi}{2}"), t(", "), f("\\arctan 0=0"), t(".")]),
    calcul("e", [
      ligne(`\\lim\\limits_{x\\to 0^-}\\arctan ${u}=${vs[0].attendue.l}`, [f("u"), t(" tend vers "), f(k > 0 ? "-\\infty" : "+\\infty")]),
      ligne(`\\lim\\limits_{x\\to 0^+}\\arctan ${u}=${vs[1].attendue.l}`, [f("u"), t(" tend vers "), f(k > 0 ? "+\\infty" : "-\\infty")]),
      ligne(`\\lim\\limits_{x\\to+\\infty}\\arctan ${u}=0`, [f("u"), t(" tend vers 0")]),
      ligne(`\\lim\\limits_{x\\to-\\infty}\\arctan ${u}=0`, "de même"),
    ]),
    { ...resultat("e", reponse(e, "valeurs")), figureHtml: figureTableauEtude(e) },
    verification("e", [t("Asymptote horizontale "), f("y=0"), t(" en "), f("\\pm\\infty"), t(" ; en 0, f saute de "), f(vs[0].attendue.l), t(" à "), f(vs[1].attendue.l), t(".")]),
  ];
}

export function correctionDetailleeEtudeCyclo(e: E): EtapeCorrection[] {
  switch (e.variante) {
    case "arctan-droite":
      return etapesArctanDroite(e);
    case "x-arctan":
      return etapesXArctan(e);
    case "arc-racine":
      return etapesArcRacine(e);
    case "arctan-inverse":
      return etapesArctanInverse(e);
  }
}
