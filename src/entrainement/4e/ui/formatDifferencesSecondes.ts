import { latex, texte } from "../../export/corrigeTableau";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceDifferences, Verdict } from "../core/differencesSecondes.types";
import { nombreLatex } from "../moteur/algebreTransfertSecondDegre";
import type { Champ, EcranTSD } from "./ecransTransfertSecondDegre";
import { polynome } from "./corrigeChapitre3";

/**
 * Modèle, textes, tableaux et écrans de gen124 « Premier ou second degré ? Différences secondes »
 * (écran ET papier : une seule source). Différences premières notées d₁…d₄ (d₁ = f(x₁) − f(x₀)…),
 * secondes s₁…s₃ (s₁ = d₂ − d₁…) ; « accroissements » et « différences » comme dans le cours, § 1.
 * Tableaux en SVG autonome (le Word ne rasterise que des `<svg>`).
 */

type E = ExerciceDifferences;
type Fragments = FragmentConsigne[];
const n = nombreLatex;

// ---------------------------------------------------------------------------------------------
// Modèle
// ---------------------------------------------------------------------------------------------

export function differencesPremieres(e: E): number[] {
  return e.valeurs.slice(1).map((v, i) => v - e.valeurs[i]!);
}

export function differencesSecondes(e: E): number[] {
  const d = differencesPremieres(e);
  return d.slice(1).map((v, i) => v - d[i]!);
}

const toutesEgales = (t: number[]) => t.every((v) => v === t[0]);

/** Verdict recalculé sur le tableau (jamais lu sur la variante). */
export function verdict(e: E): Verdict {
  if (toutesEgales(differencesPremieres(e))) return "premier";
  const s = differencesSecondes(e);
  return toutesEgales(s) && s[0] !== 0 ? "second" : "aucun";
}

export function valeurEn(e: E, x: number): number {
  return e.valeurs[e.xs.indexOf(x)]!;
}

/** Coefficients retrouvés DEPUIS LE TABLEAU (méthode du cours) : 2a = s, c = f(0), b = f(1) − a − c. */
export function coefficientsSecond(e: E): { a: number; b: number; c: number } {
  const a = differencesSecondes(e)[0]! / 2;
  const c = valeurEn(e, 0);
  return { a, b: valeurEn(e, 1) - a - c, c };
}

export function coefficientsPremier(e: E): { m: number; p: number } {
  return { m: differencesPremieres(e)[0]!, p: valeurEn(e, 0) };
}

export function expressionLatex(e: E): string {
  const v = verdict(e);
  if (v === "second") {
    const { a, b, c } = coefficientsSecond(e);
    return polynome([a, b, c]);
  }
  const { m, p } = coefficientsPremier(e);
  return polynome([m, p]);
}

// ---------------------------------------------------------------------------------------------
// Textes
// ---------------------------------------------------------------------------------------------

export const CONSIGNE_GENERALE = "Calcule les différences premières, puis secondes, du tableau ; décide si f est du premier degré, du second degré ou ni l'un ni l'autre, et retrouve son expression quand c'est possible.";

export const TITRES_ECRANS = ["Les différences premières", "Les différences secondes", "Le verdict", "L'expression de f"];

export function enonceFragments(): Fragments {
  return [texte("Voici un tableau de valeurs d'une fonction "), latex("f"), texte(" (les valeurs de "), latex("x"), texte(" vont de 1 en 1).")];
}

export function consignePapier(): Fragments {
  return [
    texte("Calcule les différences premières, puis les différences secondes. La fonction "),
    latex("f"),
    texte(" est-elle du premier degré, du second degré, ou ni l'un ni l'autre ? Si elle est du premier ou du second degré, détermine son expression."),
  ];
}

export function consignesEcrans(e: E): Fragments[] {
  return [
    [texte("Calcule les différences premières : chaque valeur de "), latex("f"), texte(" moins la précédente.")],
    [texte("Calcule les différences secondes : chaque différence première moins la précédente, "), latex("s_1=d_2-d_1"), texte(", etc.")],
    [texte("La fonction "), latex("f"), texte(" est-elle du premier degré, du second degré, ou ni l'un ni l'autre ?")],
    verdict(e) === "premier"
      ? [texte("Retrouve "), latex("m"), texte(" et "), latex("p"), texte(" dans "), latex("f(x)=mx+p"), texte(".")]
      : [texte("Retrouve "), latex("a"), texte(", "), latex("b"), texte(" et "), latex("c"), texte(" dans "), latex("f(x)=ax^2+bx+c"), texte(".")],
  ];
}

export function libelleDifference(e: E, i: number): string {
  return `f(${n(e.xs[i + 1]!)})-f(${n(e.xs[i]!)})`;
}

function listeFragments(nom: string, valeurs: number[]): Fragments {
  const out: Fragments = [];
  valeurs.forEach((v, i) => {
    if (i > 0) out.push(texte(", "));
    out.push(latex(`${nom}_${i + 1}=${n(v)}`));
  });
  return out;
}

export function reponsePremieres(e: E): Fragments {
  return listeFragments("d", differencesPremieres(e));
}

export function reponseSecondes(e: E): Fragments {
  return listeFragments("s", differencesSecondes(e));
}

export const LIBELLES_VERDICT: Record<Verdict, string> = {
  premier: "Premier degré",
  second: "Second degré",
  aucun: "Ni du premier ni du second degré",
};

export function reponseVerdict(e: E): Fragments {
  return [texte(LIBELLES_VERDICT[verdict(e)])];
}

export function reponseExpression(e: E): Fragments {
  const v = verdict(e);
  if (v === "second") {
    const { a, b, c } = coefficientsSecond(e);
    return [latex(`a=${n(a)}`), texte(", "), latex(`b=${n(b)}`), texte(", "), latex(`c=${n(c)}`), texte(" : "), latex(`f(x)=${expressionLatex(e)}`)];
  }
  const { m, p } = coefficientsPremier(e);
  return [latex(`m=${n(m)}`), texte(", "), latex(`p=${n(p)}`), texte(" : "), latex(`f(x)=${expressionLatex(e)}`)];
}

/** Réponse brève (papier). */
export function reponseComplete(e: E): Fragments {
  const v = verdict(e);
  if (v === "aucun") return [texte("Ni du premier ni du second degré : les différences secondes "), ...reponseSecondes(e), texte(" ne sont pas constantes.")];
  return [texte(`${LIBELLES_VERDICT[v]} : `), latex(`f(x)=${expressionLatex(e)}`)];
}

// ---------------------------------------------------------------------------------------------
// Tableau (SVG autonome, noir sur blanc)
// ---------------------------------------------------------------------------------------------

const ENCRE = "#1b1d22";
const DOUX = "#5c6370";
const FOND = "#eef0f2";
const POLICE = `font-family="Georgia, 'Times New Roman', serif"`;

function nb(v: number): string {
  return String(v).replace("-", "−");
}

/** Tableau x / f(x), et, en escalier sous les valeurs, les différences premières et secondes
 * (`etages` = 0, 1 ou 2 lignes de différences affichées). */
export function tableauSvg(e: E, etages: 0 | 1 | 2 = 0): string {
  const lab = 92;
  const col = 30;
  const h = 28;
  const lignes = 2 + etages;
  const largeur = lab + col * 9 + 2;
  const hauteur = h * lignes + 2;
  const cx = (k: number) => lab + col * k + col / 2;
  const parts: string[] = [];
  parts.push(`<rect x="1" y="1" width="${largeur - 2}" height="${h * 2}" fill="${FOND}" stroke="${ENCRE}" stroke-width="1"/>`);
  parts.push(`<rect x="1" y="1" width="${lab - 1}" height="${h * 2}" fill="#ffffff" stroke="${ENCRE}" stroke-width="1"/>`);
  parts.push(`<line x1="1" y1="${h + 1}" x2="${largeur - 1}" y2="${h + 1}" stroke="${ENCRE}" stroke-width="1"/>`);
  const texteCellule = (x: number, y: number, contenu: string, couleur = ENCRE, italique = false, taille = 13) =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}" text-anchor="middle" fill="${couleur}" ${POLICE}${italique ? ' font-style="italic"' : ""}>${contenu}</text>`;
  parts.push(texteCellule(lab / 2, h / 2 + 5, "x", ENCRE, true));
  parts.push(texteCellule(lab / 2, h + h / 2 + 5, "f(x)", ENCRE, true));
  e.xs.forEach((x, i) => {
    parts.push(texteCellule(cx(2 * i), h / 2 + 5, nb(x)));
    parts.push(texteCellule(cx(2 * i), h + h / 2 + 5, nb(e.valeurs[i]!)));
    if (i > 0) parts.push(`<line x1="${lab + col * (2 * i - 1) + col / 2}" y1="1" x2="${lab + col * (2 * i - 1) + col / 2}" y2="${2 * h + 1}" stroke="${DOUX}" stroke-width="0.6"/>`);
  });
  if (etages >= 1) {
    const y = 2 * h + h / 2 + 5;
    parts.push(texteCellule(lab / 2, y, "diff. 1ʳᵉˢ", DOUX, false, 11));
    differencesPremieres(e).forEach((d, i) => parts.push(texteCellule(cx(2 * i + 1), y, nb(d), ENCRE)));
  }
  if (etages >= 2) {
    const y = 3 * h + h / 2 + 5;
    parts.push(texteCellule(lab / 2, y, "diff. 2ᵉˢ", DOUX, false, 11));
    differencesSecondes(e).forEach((s, i) => parts.push(texteCellule(cx(2 * i + 2), y, nb(s), ENCRE)));
  }
  return `<svg class="tableau-differences" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>${parts.join("")}</svg>`;
}

export function tableauPourEcran(svg: string): string {
  return svg.replace(/<svg ([^>]*?)width="(\d+)" height="(\d+)"/, '<svg $1width="100%" style="max-width:$2px;height:auto;display:block;margin:0 auto"');
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

const MESSAGES_VERDICT: Record<Verdict, Partial<Record<Verdict, string>>> = {
  premier: {
    second: "Les différences premières sont déjà constantes : f est du premier degré. Des différences secondes toutes nulles donneraient a = 0.",
    aucun: "Les différences premières sont toutes égales : f est du premier degré.",
  },
  second: {
    premier: "Les différences premières ne sont pas constantes : f n'est pas du premier degré. Regarde les différences secondes.",
    aucun: "Les différences secondes sont toutes égales (et non nulles) : f est du second degré.",
  },
  aucun: {
    premier: "Les différences premières ne sont pas constantes : f n'est pas du premier degré.",
    second: "Vérifie toutes les différences secondes : elles ne sont pas toutes égales, donc f n'est pas du second degré.",
  },
};

function champsDifferences(nom: "d" | "s", valeurs: number[], libelles: string[]): Champ[] {
  return valeurs.map((v, i) => ({
    type: "nombre" as const,
    id: `${nom}${i + 1}`,
    libelle: [latex(libelles[i]!)],
    cible: v,
    pieges: v !== 0 ? [{ valeur: -v, message: nom === "d" ? "Attention à l'ordre : c'est la valeur de droite moins celle de gauche, $f(x+1)-f(x)$." : "Attention à l'ordre : c'est la différence première de droite moins celle de gauche, $s_1=d_2-d_1$." }] : [],
    messageSiFaux: nom === "d" ? "Soustrais en gardant les signes : par exemple $3-(-5)=3+5$." : "Soustrais deux différences premières voisines, en gardant les signes.",
  }));
}

export function ecrans(e: E): EcranTSD[] {
  const d = differencesPremieres(e);
  const s = differencesSecondes(e);
  const v = verdict(e);
  const premierEcart = (t: number[]) => `${n(t[1]!)}-${t[0]! < 0 ? `(${n(t[0]!)})` : n(t[0]!)}`;
  const tous: EcranTSD[] = [
    {
      type: "champs",
      titre: TITRES_ECRANS[0]!,
      consigne: consignesEcrans(e)[0]!,
      champs: champsDifferences("d", d, d.map((_, i) => `d_${i + 1}=${libelleDifference(e, i)}=`)),
      aides: [
        [texte("Avec des "), latex("x"), texte(" de 1 en 1, une différence première est "), latex("f(x+1)-f(x)"), texte(" : la valeur de droite moins celle de gauche.")],
        [texte("La première : "), latex(`d_1=${libelleDifference(e, 0)}=${premierEcart(e.valeurs)}`), texte(". Fais de même pour chaque paire de valeurs voisines.")],
      ],
      reponse: reponsePremieres(e),
    },
    {
      type: "champs",
      titre: TITRES_ECRANS[1]!,
      consigne: consignesEcrans(e)[1]!,
      champs: champsDifferences("s", s, s.map((_, i) => `s_${i + 1}=d_${i + 2}-d_${i + 1}=`)),
      aides: [
        [texte("Une différence seconde est la différence de deux différences premières voisines : celle de droite moins celle de gauche.")],
        [texte("La première : "), latex(`s_1=d_2-d_1=${premierEcart(d)}`), texte(".")],
      ],
      reponse: reponseSecondes(e),
      figure: tableauPourEcran(tableauSvg(e, 1)),
    },
    {
      type: "choix",
      titre: TITRES_ECRANS[2]!,
      consigne: consignesEcrans(e)[2]!,
      options: e.ordreVerdicts.map((x) => [texte(LIBELLES_VERDICT[x])]),
      bonne: e.ordreVerdicts.indexOf(v),
      aides: [
        [texte("Différences premières constantes : premier degré. Différences secondes constantes et non nulles : second degré. Sinon, ni l'un ni l'autre.")],
        [texte("Regarde d'abord la ligne des différences premières : sont-elles toutes égales ? Sinon, regarde la ligne des différences secondes, sans en oublier une.")],
      ],
      messageFaux: "Ce n'était pas le bon verdict.",
      messagesOptions: e.ordreVerdicts.map((x) => MESSAGES_VERDICT[v][x]),
      figure: tableauPourEcran(tableauSvg(e, 2)),
    },
  ];
  if (v === "second") {
    const { a, b, c } = coefficientsSecond(e);
    const f1 = valeurEn(e, 1);
    const piegesB = [
      { valeur: f1 - valeurEn(e, 0), message: "$f(1)-f(0)=a+b$ : il faut encore retirer $a$." },
      { valeur: f1 - c, message: "$f(1)=a+b+c$ : retire aussi $a$." },
      { valeur: f1 - 2 * a - c, message: "$a$ vaut la moitié de la différence seconde : $f(1)=a+b+c$ avec cette valeur de $a$." },
    ].filter((p, i, t) => Math.abs(p.valeur - b) > 1e-9 && t.findIndex((q) => Math.abs(q.valeur - p.valeur) < 1e-9) === i);
    tous.push({
      type: "champs",
      titre: TITRES_ECRANS[3]!,
      consigne: consignesEcrans(e)[3]!,
      champs: [
        { type: "nombre", id: "a", libelle: [latex("a=")], cible: a, pieges: [{ valeur: s[0]!, message: "Avec des x de 1 en 1, la différence seconde vaut $2a$ : divise par 2." }].filter((p) => Math.abs(p.valeur - a) > 1e-9), messageSiFaux: "La différence seconde constante vaut $2a$." },
        { type: "nombre", id: "b", libelle: [latex("b=")], cible: b, pieges: piegesB, messageSiFaux: "Écris $f(1)=a+b+c$ avec les valeurs de $a$, $c$ et $f(1)$, puis isole $b$." },
        { type: "nombre", id: "c", libelle: [latex("c=")], cible: c, pieges: e.xs[0] !== 0 ? [{ valeur: e.valeurs[0]!, message: "$c=f(0)$ : c'est la valeur sous $x=0$, pas la première du tableau." }].filter((p) => p.valeur !== c) : [], messageSiFaux: "$c=f(0)$ se lit dans le tableau." },
      ],
      aides: [
        [texte("Avec des "), latex("x"), texte(" de 1 en 1 : la différence seconde constante vaut "), latex("2a"), texte(", "), latex("c=f(0)"), texte(" et "), latex("f(1)=a+b+c"), texte(".")],
        [texte("Ici : "), latex(`2a=${n(s[0]!)}`), texte(", "), latex(`c=f(0)`), texte(" se lit sous "), latex("x=0"), texte(", puis "), latex(`a+b+c=f(1)=${n(f1)}`), texte(".")],
      ],
      reponse: reponseExpression(e),
    });
  } else if (v === "premier") {
    const { m, p } = coefficientsPremier(e);
    tous.push({
      type: "champs",
      titre: TITRES_ECRANS[3]!,
      consigne: consignesEcrans(e)[3]!,
      champs: [
        { type: "nombre", id: "m", libelle: [latex("m=")], cible: m, pieges: [{ valeur: -m, message: "La différence première se calcule $f(x+1)-f(x)$ : attention au signe." }, { valeur: p, message: "C'est l'ordonnée à l'origine $p=f(0)$ ; $m$ est la différence première constante." }].filter((q) => q.valeur !== m), messageSiFaux: "Avec des x de 1 en 1, $m$ est la différence première constante." },
        { type: "nombre", id: "p", libelle: [latex("p=")], cible: p, pieges: [...(e.xs[0] !== 0 ? [{ valeur: e.valeurs[0]!, message: "$p=f(0)$ : c'est la valeur sous $x=0$, pas la première du tableau." }] : []), { valeur: m, message: "C'est la pente $m$ ; $p=f(0)$." }].filter((q) => q.valeur !== p), messageSiFaux: "$p=f(0)$ se lit dans le tableau." },
      ],
      aides: [
        [texte("Pour "), latex("f(x)=mx+p"), texte(" avec des "), latex("x"), texte(" de 1 en 1 : chaque différence première vaut "), latex("m"), texte(", et "), latex("p=f(0)"), texte(".")],
        [texte("Lis la valeur constante de la ligne des différences premières, puis la valeur de "), latex("f"), texte(" sous "), latex("x=0"), texte(".")],
      ],
      reponse: reponseExpression(e),
    });
  }
  return tous;
}
