import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import type { ContexteModele, ExerciceChoisirModele, FamilleModele, ParametreModele } from "./types";
import { evaluerModele, expressionModeleLatex, INFOS_CONTEXTE, modeleLatex, nombreLatex, nombreTexte, UNITE_LATEX } from "./modele";

/**
 * Textes de gen69 (situations, consignes, aides, options de l'écran 5, justifications) — une seule
 * source pour l'écran et pour le papier. Fragments texte/LaTeX (même type que le pipeline d'export,
 * sans dépendre du module docx) : aucune formule écrite au clavier dans un texte.
 */

export type Fragments = FragmentConsigne[];

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const m = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ---------------------------------------------------------------------------------------------
// Familles
// ---------------------------------------------------------------------------------------------

export const FAMILLES: FamilleModele[] = ["carre", "cube", "racine_carree", "racine_cubique", "inverse", "valeur_absolue"];

export const NOM_FAMILLE: Record<FamilleModele, string> = {
  carre: "Carré",
  cube: "Cube",
  racine_carree: "Racine carrée",
  racine_cubique: "Racine cubique",
  inverse: "Inverse",
  valeur_absolue: "Valeur absolue",
};

export const REFERENCE_LATEX: Record<FamilleModele, string> = {
  carre: "y = x^2",
  cube: "y = x^3",
  racine_carree: "y = \\sqrt{x}",
  racine_cubique: "y = \\sqrt[3]{x}",
  inverse: "y = \\dfrac{1}{x}",
  valeur_absolue: "y = |x|",
};

/** g(x) seul, pour « la référence x² ». */
const G_LATEX: Record<FamilleModele, string> = {
  carre: "x^2",
  cube: "x^3",
  racine_carree: "\\sqrt{x}",
  racine_cubique: "\\sqrt[3]{x}",
  inverse: "\\dfrac{1}{x}",
  valeur_absolue: "|x|",
};

const FORME_COURBE: Record<FamilleModele, string> = {
  carre: "une parabole, avec un creux arrondi et un axe de symétrie vertical",
  cube: "une courbe en S avec un replat en son centre",
  racine_carree: "une demi-branche qui part d'un point et monte de moins en moins vite",
  racine_cubique: "une courbe en S couchée, verticale en son centre, qui monte de moins en moins vite",
  inverse: "une branche d'hyperbole, qui se rapproche de deux droites (asymptotes) sans les toucher",
  valeur_absolue: "un V, avec une pointe et deux branches rectilignes",
};

/** Nom du point caractéristique de la courbe tracée. */
function nomPointCaracteristique(e: ExerciceChoisirModele): string {
  switch (e.famille) {
    case "carre":
      return "le sommet de la parabole, son point le plus bas";
    case "valeur_absolue":
      return "la pointe du V";
    case "racine_carree":
      return "le point de départ de la courbe";
    case "racine_cubique":
      return "le centre de la courbe en S couchée, là où elle est verticale ; ici, son point de départ";
    case "cube":
      return "le replat, au centre de la courbe en S";
    case "inverse":
      return "le centre de l'hyperbole, à l'intersection de ses deux asymptotes";
  }
}

// ---------------------------------------------------------------------------------------------
// Situation, consignes
// ---------------------------------------------------------------------------------------------

export const CONSIGNE_FAMILLES: Fragments = [
  t("La courbe est obtenue en transformant une des fonctions de référence "),
  m("x^2"),
  t(", "),
  m("x^3"),
  t(", "),
  m("\\sqrt{x}"),
  t(", "),
  m("\\sqrt[3]{x}"),
  t(", "),
  m("\\dfrac{1}{x}"),
  t(" ou "),
  m("|x|"),
  t("."),
];

export function situation(e: ExerciceChoisirModele): Fragments {
  switch (e.contexte) {
    case "pont":
      return [
        t(`Le câble principal d'un pont suspendu pend entre deux pylônes distants de ${nombreTexte(2 * e.th)} m. Le graphique donne la hauteur h du câble au-dessus du tablier (en m) en fonction de la distance horizontale x au pylône gauche (en m).`),
      ];
    case "jet":
      return [
        t("Des pompiers règlent la pression p (en bar) d'une lance à incendie. La portée L du jet (en m) dépend de cette pression ; en dessous d'une certaine pression, l'eau ne jaillit pas. Le graphique donne L en fonction de p."),
      ];
    case "glacon":
      return [
        t("Une machine fabrique des glaçons cubiques de volume V (en cm³). Chaque glaçon est rangé dans une boîte cubique un peu plus grande. Le graphique donne le côté c de la boîte (en cm) en fonction du volume V du glaçon."),
      ];
    case "gaz":
      return [
        t("On comprime un gaz dans une seringue fermée, à température constante. Le graphique donne la pression P du gaz (en bar) en fonction du volume V qu'il occupe (en L). La courbe se rapproche des deux axes sans jamais les toucher."),
      ];
    case "velo":
      return [
        t("Une cycliste fait toujours le même circuit, avec les mêmes pauses. Le graphique donne la durée totale T de sa sortie (en h, pauses comprises) en fonction de sa vitesse moyenne v quand elle roule (en km/h). La courbe se rapproche de l'axe vertical et de la droite en pointillés sans jamais les toucher."),
      ];
    case "chauffage":
      return [
        t("Une maison est chauffée quand il fait froid et climatisée quand il fait chaud. Le graphique donne sa dépense d'énergie E par jour (en kWh) en fonction de la température extérieure moyenne T (en °C)."),
      ];
    case "toboggan":
      return [
        t("Le profil d'un toboggan de parc aquatique comporte un replat à mi-parcours. Le graphique donne la hauteur h de la glissière (en m) en fonction de la position horizontale x (en m), du départ à l'arrivée."),
      ];
  }
}

export const QUESTION_ECRAN_1 = "À quelle fonction de référence cette courbe est-elle liée ?";
export const QUESTION_ECRAN_2 = "Lis les transformations qui amènent la fonction de référence sur cette courbe.";

export function questionEcran3(e: ExerciceChoisirModele): Fragments {
  const info = INFOS_CONTEXTE[e.contexte];
  return [t(`Écris le modèle : exprime ${info.fonction} en fonction de ${info.variable}.`)];
}

/** Question de l'écran 4 (même texte en b) sur papier). */
export function questionEcran4(e: ExerciceChoisirModele): Fragments {
  const q = e.question4;
  const n = nombreTexte;
  if (q.type === "predire") {
    switch (e.contexte) {
      case "pont":
        return [t(`Quelle est la hauteur du câble à ${n(q.x)} m du pylône gauche ?`)];
      case "jet":
        return [t(`Quelle portée atteint le jet avec une pression de ${n(q.x)} bar ?`)];
      case "glacon":
        return [t(`Quel côté doit avoir la boîte d'un glaçon de ${n(q.x)} cm³ ?`)];
      case "gaz":
        return [t(`Quelle est la pression du gaz quand il occupe ${n(q.x)} L ?`)];
      case "velo":
        return [t(`Combien de temps dure la sortie si elle roule à ${n(q.x)} km/h de moyenne ?`)];
      case "chauffage":
        return [t(`Quelle est la dépense d'énergie par jour quand il fait ${n(q.x)} °C dehors ?`)];
      case "toboggan":
        return [t(`À quelle hauteur se trouve la glissière en x = ${n(q.x)} m ?`)];
    }
  }
  switch (e.contexte) {
    case "pont":
      return [t(`À quelle(s) distance(s) du pylône gauche le câble est-il à ${n(q.y)} m au-dessus du tablier ?`)];
    case "jet":
      return [t(`Quelle pression faut-il pour que le jet porte à ${n(q.y)} m ?`)];
    case "glacon":
      return [t(`Une boîte a un côté de ${n(q.y)} cm. Quel est le volume du glaçon qu'elle contient ?`)];
    case "gaz":
      return [t(`Quel volume occupe le gaz quand sa pression vaut ${n(q.y)} bar ?`)];
    case "velo":
      return [t(`À quelle vitesse moyenne doit-elle rouler pour que la sortie dure ${n(q.y)} h ?`)];
    case "chauffage":
      return [t(`Pour quelle(s) température(s) extérieure(s) la dépense vaut-elle ${n(q.y)} kWh par jour ?`)];
    case "toboggan":
      return [t(`À quelle position la glissière est-elle à ${n(q.y)} m de hauteur ?`)];
  }
}

/** Libellés et unité des champs de l'écran 4. */
export function champsEcran4(e: ExerciceChoisirModele): { libelles: string[]; unite: string } {
  const info = INFOS_CONTEXTE[e.contexte];
  const q = e.question4;
  if (q.type === "predire") return { libelles: [`${info.axeY.nom} =`], unite: info.axeY.unite };
  if (q.solutions.length === 1) return { libelles: [`${info.variable} =`], unite: info.axeX.unite };
  return { libelles: [`Plus petite valeur : ${info.variable} =`, `Plus grande valeur : ${info.variable} =`], unite: info.axeX.unite };
}

/** Réponse de l'écran 4 en LaTeX (« x = 1 \text{ ou } x = 7 »). */
export function reponseUtilisationLatex(e: ExerciceChoisirModele): string {
  const info = INFOS_CONTEXTE[e.contexte];
  const q = e.question4;
  if (q.type === "predire") return `${info.fonction}(${nombreLatex(q.x)}) = ${nombreLatex(q.y)}${UNITE_LATEX[info.axeY.unite]}`;
  const unite = UNITE_LATEX[info.axeX.unite];
  return q.solutions.map((s) => `${info.variable} = ${nombreLatex(s)}${unite}`).join("\\ \\text{ ou }\\ ");
}

/** Désignation, à l'écran 5, du nombre interrogé (le modèle confirmé est affiché à côté). */
export function designationParametre(e: ExerciceChoisirModele): Fragments {
  const variable = INFOS_CONTEXTE[e.contexte].variable;
  switch (e.parametre5) {
    case "th":
      return [t("le nombre "), m(nombreLatex(e.th)), t(" dans "), m(`(${variable}-${nombreLatex(e.th)})`)];
    case "tv":
      return [t("le terme "), m(`+${nombreLatex(e.tv)}`), t(" à la fin du modèle")];
    case "a":
      return e.famille === "inverse" ? [t("le numérateur "), m(nombreLatex(Math.abs(e.a)))] : [t("le coefficient "), m(nombreLatex(e.a))];
  }
}

/** Même désignation sur papier, sans révéler la valeur (l'élève n'a pas vu le modèle). */
export function designationParametrePapier(e: ExerciceChoisirModele): string {
  switch (e.parametre5) {
    case "th":
      return "le nombre soustrait à la variable";
    case "tv":
      return "le nombre ajouté à la fin";
    case "a":
      return e.famille === "inverse" ? "le numérateur" : "le coefficient multiplicatif";
  }
}

export function questionEcran5(e: ExerciceChoisirModele): Fragments {
  return [t("Dans le modèle "), m(modeleLatex(e)), t(", que signifie "), ...designationParametre(e), t(" ?")];
}

export function questionPapierC(e: ExerciceChoisirModele): Fragments {
  return [t(`Que représente, dans cette situation, ${designationParametrePapier(e)} de ton modèle ? Donne sa valeur et son unité.`)];
}

// ---------------------------------------------------------------------------------------------
// Écran 5 : options (la première est la bonne) et justification
// ---------------------------------------------------------------------------------------------

/** [bonne, leurre, leurre, leurre] — les leurres reprennent les confusions classiques (signe de TH,
 * TH et TV échangés, unité de l'autre axe, lecture « linéaire » d'un facteur). Le tirage exclut les
 * valeurs qui rendraient un leurre vrai par coïncidence (voir `index.ts`). */
export function textesOptions5(e: ExerciceChoisirModele): string[] {
  const n = nombreTexte;
  const a = Math.abs(e.a);
  const { th, tv } = e;
  const cle = `${e.contexte}:${e.parametre5}`;
  switch (cle) {
    case "pont:th":
      return [`Le point le plus bas du câble est à ${n(th)} m du pylône gauche.`, `Le câble est décalé de ${n(th)} m vers la gauche.`, `La hauteur minimale du câble est de ${n(th)} m.`, `Le pont mesure ${n(th)} m de long.`];
    case "pont:tv":
      return [`La hauteur minimale du câble au-dessus du tablier est de ${n(tv)} m.`, `Le point le plus bas du câble est à ${n(tv)} m du pylône gauche.`, `Le câble est à ${n(tv)} m de hauteur au sommet des pylônes.`, `Le câble monte de ${n(tv)} m quand on s'écarte de 1 m du point le plus bas.`];
    case "jet:th":
      return [`L'eau ne jaillit qu'au-delà d'une pression de ${n(th)} bar.`, `La portée maximale du jet est de ${n(th)} m.`, `La portée du jet augmente de ${n(th)} m à chaque bar supplémentaire.`, `L'eau jaillit dès que la pression dépasse −${n(th)} bar.`];
    case "jet:a":
      return [`1 bar au-dessus de la pression minimale, le jet porte à ${n(a)} m.`, `La portée du jet augmente de ${n(a)} m à chaque bar supplémentaire.`, `L'eau ne jaillit qu'au-delà d'une pression de ${n(a)} bar.`, `La portée maximale du jet est de ${n(a)} m.`];
    case "glacon:tv":
      return [`La boîte a toujours ${n(tv)} cm de côté de plus que le glaçon.`, `La boîte a toujours ${n(tv)} cm³ de volume de plus que le glaçon.`, `Le plus petit glaçon possible a un volume de ${n(tv)} cm³.`, `La boîte a toujours ${n(tv)} cm de côté de moins que le glaçon.`];
    case "gaz:a":
      return [`Quand le gaz occupe 1 L, sa pression vaut ${n(a)} bar : le produit P × V vaut toujours ${n(a)}.`, `La pression augmente de ${n(a)} bar chaque fois que le volume augmente de 1 L.`, `Le volume du gaz ne peut pas dépasser ${n(a)} L.`, `La pression du gaz ne descend jamais sous ${n(a)} bar.`];
    case "velo:tv":
      return [`Les pauses durent ${n(tv)} h au total.`, `Elle roule à ${n(tv)} km/h de moyenne.`, `Sans compter les pauses, la sortie dure ${n(tv)} h.`, `À 1 km/h, la sortie durerait ${n(tv)} h.`];
    case "velo:a":
      return [`Le circuit mesure ${n(a)} km.`, `Elle roule à ${n(a)} km/h de moyenne.`, `Les pauses durent ${n(a)} min au total.`, `À ${n(a)} km/h, la sortie dure 1 h.`];
    case "chauffage:th":
      return [`La dépense est minimale quand il fait ${n(th)} °C dehors.`, `La dépense minimale est de ${n(th)} kWh par jour.`, `La dépense est minimale quand il fait −${n(th)} °C dehors.`, `La dépense augmente de ${n(th)} kWh par degré d'écart.`];
    case "chauffage:tv":
      return [`La dépense minimale est de ${n(tv)} kWh par jour.`, `La dépense est minimale quand il fait ${n(tv)} °C dehors.`, `La dépense augmente de ${n(tv)} kWh par degré d'écart.`, `Quand il fait 0 °C, la dépense est de ${n(tv)} kWh par jour.`];
    case "chauffage:a":
      return [`La dépense augmente de ${n(a)} kWh par jour pour chaque degré d'écart avec ${n(th)} °C.`, `La dépense minimale est de ${n(a)} kWh par jour.`, `La dépense est minimale quand il fait ${n(a)} °C dehors.`, `La dépense est multipliée par ${n(a)} pour chaque degré d'écart avec ${n(th)} °C.`];
    case "toboggan:th":
      return [`Le replat se trouve à ${n(th)} m de l'origine, horizontalement.`, `Le replat se trouve à ${n(th)} m de hauteur.`, `Le replat se trouve à ${n(th)} m à gauche de l'origine.`, `Le toboggan commence à ${n(th)} m de l'origine, horizontalement.`];
    case "toboggan:tv":
      return [`Le replat se trouve à ${n(tv)} m de hauteur.`, `Le replat se trouve à ${n(tv)} m de l'origine, horizontalement.`, `Le départ du toboggan est à ${n(tv)} m de hauteur.`, `L'arrivée du toboggan est à ${n(tv)} m de hauteur.`];
  }
  throw new Error(`Paramètre ${e.parametre5} non prévu pour le contexte ${e.contexte}`);
}

/** Paramètres interrogeables à l'écran 5, par contexte. */
export const PARAMETRES_CONTEXTE: Record<ContexteModele, ParametreModele[]> = {
  pont: ["th", "tv"],
  jet: ["th", "a"],
  glacon: ["tv"],
  gaz: ["a"],
  velo: ["tv", "a"],
  chauffage: ["th", "tv", "a"],
  toboggan: ["th", "tv"],
};

/** Pourquoi la bonne option est la bonne (corrigé, réponse révélée). */
export function justificationSens(e: ExerciceChoisirModele): Fragments {
  const v = INFOS_CONTEXTE[e.contexte].variable;
  const th = nombreLatex(e.th);
  const tv = nombreLatex(e.tv);
  const a = nombreLatex(Math.abs(e.a));
  switch (`${e.contexte}:${e.parametre5}`) {
    case "pont:th":
    case "toboggan:th":
    case "chauffage:th": {
      const quoi = e.contexte === "pont" ? "le point le plus bas du câble" : e.contexte === "toboggan" ? "le replat" : "la dépense minimale";
      return [t("L'expression entre parenthèses s'annule en "), m(`${v} = ${th}`), t(` : c'est l'abscisse du point caractéristique, ${quoi}. Elle s'exprime dans l'unité de l'axe horizontal.`)];
    }
    case "pont:tv":
    case "chauffage:tv":
      return [t("Ce qui précède le terme ajouté est toujours positif ou nul : le modèle ne descend jamais sous "), m(tv), t(", valeur atteinte au point caractéristique. Elle s'exprime dans l'unité de l'axe vertical.")];
    case "toboggan:tv":
      return [t("En "), m(`x = ${th}`), t(", le cube s'annule et "), m(`h = ${tv}`), t(" : c'est la hauteur du replat (point caractéristique).")];
    case "jet:th":
      return [t("La racine n'existe que si "), m(`p-${th} \\geq 0`), t(", c'est-à-dire "), m(`p \\geq ${th}`), t(" : en dessous, pas de jet.")];
    case "jet:a":
      return [t("En "), m(`p = ${nombreLatex(e.th + 1)}`), t(", "), m(`L = ${a}\\sqrt{1} = ${a}`), t(". La portée n'augmente pas de la même quantité à chaque bar : la courbe n'est pas une droite.")];
    case "glacon:tv":
      return [t("Le côté du glaçon vaut "), m("\\sqrt[3]{V}"), t(" ; la boîte a ce côté plus "), m(tv), t(", en cm (unité de l'axe vertical).")];
    case "gaz:a":
      return [t("En "), m("V = 1"), t(", "), m(`P = \\dfrac{${a}}{1} = ${a}`), t(" ; et "), m(`P \\times V = ${a}`), t(" pour tout volume.")];
    case "velo:tv":
      return [m("\\dfrac{D}{v}"), t(" est le temps passé à rouler (distance divisée par vitesse) ; le terme ajouté, "), m(tv), t(" h, est la durée des pauses.")];
    case "velo:a":
      return [t("Temps passé à rouler = distance divisée par vitesse, donc le numérateur "), m(a), t(" est la distance du circuit, en km.")];
    case "chauffage:a":
      return [t("Sur chaque branche du V, un degré d'écart de plus avec "), m(`${th}\\,{}^{\\circ}\\text{C}`), t(" ajoute "), m(a), t(" kWh : c'est la pente de la branche.")];
  }
  return [];
}

// ---------------------------------------------------------------------------------------------
// Aides (2 ou 3 niveaux, jamais la réponse)
// ---------------------------------------------------------------------------------------------

export function aidesEcran1(e: ExerciceChoisirModele): Fragments[] {
  const asymptote = e.famille === "inverse";
  const symetrique = e.famille === "carre" || e.famille === "valeur_absolue";
  return [
    [
      t("Repère la forme de la courbe : une parabole (creux arrondi), un V (pointe), une demi-branche qui part d'un point, une courbe en S avec un replat, une courbe en S couchée (verticale en son centre), une hyperbole (deux asymptotes)."),
    ],
    [t(`Cette courbe ${asymptote ? "se rapproche d'une droite sans la toucher (asymptote)" : "n'a pas d'asymptote"} et ${symetrique ? "elle est" : "elle n'est pas"} symétrique par rapport à une droite verticale.`)],
  ];
}

/** Écart horizontal et vertical entre le point caractéristique et le point de lecture. */
export function ecartsLecture(e: ExerciceChoisirModele): { dx: number; dy: number; ref: number } {
  const p = e.points[e.indexLecture];
  const dx = p.x - e.th;
  return { dx, dy: p.y - e.tv, ref: refEnLatexValeur(e.famille, dx) };
}

function refEnLatexValeur(famille: FamilleModele, dx: number): number {
  return evaluerModele({ famille, th: 0, tv: 0, a: 1 }, dx);
}

export function pointCaracteristiqueLatex(e: ExerciceChoisirModele): string {
  return `\\left(${nombreLatex(e.th)}\\,;\\,${nombreLatex(e.tv)}\\right)`;
}

/** Valeur de la référence pour l'écart horizontal, en LaTeX (fraction pour l'inverse). */
export function valeurReferenceLatex(e: ExerciceChoisirModele): string {
  const { dx, ref } = ecartsLecture(e);
  if (e.famille === "inverse") return `\\dfrac{1}{${nombreLatex(dx)}}`;
  return nombreLatex(ref);
}

export function aidesEcran2(e: ExerciceChoisirModele): Fragments[] {
  const p = e.points[e.indexLecture];
  const { dx, dy } = ecartsLecture(e);
  const sensX = dx >= 0 ? "à droite" : "à gauche";
  const sensY = dy >= 0 ? "plus haut" : "plus bas";
  return [
    [
      t(`Le point caractéristique donne TH et TV : TH est son abscisse, TV son ordonnée. Ici, c'est ${nomPointCaracteristique(e)}. Seules les translations le déplacent : un étirement, une compression ou une symétrie le laissent en place.`),
    ],
    [
      t("Compare ensuite un autre point marqué au point caractéristique. Pour un même écart horizontal, le facteur vertical vaut :"),
      m("\\text{facteur} = \\dfrac{\\text{écart vertical sur la courbe}}{\\text{écart vertical de la référence}}"),
      t("Si la courbe descend là où la référence monte, il y a une symétrie d'axe horizontal."),
    ],
    [
      t("Utilise le point "),
      m(`\\left(${nombreLatex(p.x)}\\,;\\,${nombreLatex(p.y)}\\right)`),
      t(` : il est ${nombreTexte(Math.abs(dx))} ${sensX} du point caractéristique et ${nombreTexte(Math.abs(dy))} ${sensY}. Pour le même écart horizontal, la référence `),
      m(G_LATEX[e.famille]),
      t(" vaut "),
      m(valeurReferenceLatex(e)),
      t("."),
    ],
  ];
}

export function aidesEcran3(e: ExerciceChoisirModele): Fragments[] {
  const info = INFOS_CONTEXTE[e.contexte];
  const v = info.variable;
  return [
    [
      t("Le modèle s'écrit :"),
      m(`${info.fonction}(${v}) = a \\cdot g(${v}-\\text{TH})+\\text{TV}`),
      t(`g est la fonction de référence reconnue, a le facteur vertical (précédé d'un signe « − » s'il y a une symétrie). Écris-le avec la variable ${v} de la situation.`),
    ],
    [
      t("Attention aux signes : une translation de 3 vers la droite s'écrit "),
      m(`(${v}-3)`),
      t(", vers la gauche "),
      m(`(${v}+3)`),
      t(". Et multiplier la variable par 2, comme dans "),
      m("f(2x)"),
      t(", comprime la courbe horizontalement : ce n'est pas un facteur 2 vertical."),
    ],
  ];
}

export function aidesEcran4(e: ExerciceChoisirModele): Fragments[] {
  const info = INFOS_CONTEXTE[e.contexte];
  const v = info.variable;
  const q = e.question4;
  if (q.type === "predire") {
    const interieur = q.x - e.th;
    return [
      [t(`Remplace ${v} par ${nombreTexte(q.x)} dans le modèle, puis calcule.`)],
      [t("Commence par l'intérieur : "), m(e.th === 0 ? `${v} = ${nombreLatex(q.x)}` : `${nombreLatex(q.x)}-${nombreLatex(e.th)} = ${nombreLatex(interieur)}`), t(", puis applique la fonction de référence, le facteur et la translation verticale.")],
    ];
  }
  const y = nombreLatex(q.y);
  const isole = (q.y - e.tv) / e.a;
  const arg = e.th === 0 ? v : `${v}-${nombreLatex(e.th)}`;
  let equationIsolee: string;
  let suite: string;
  switch (e.famille) {
    case "carre":
      equationIsolee = `\\left(${arg}\\right)^2 = ${nombreLatex(isole)}`;
      suite = "Un carré égal à un nombre positif : deux solutions, opposées pour la parenthèse.";
      break;
    case "valeur_absolue":
      equationIsolee = `\\left|${arg}\\right| = ${nombreLatex(isole)}`;
      suite = "Une valeur absolue égale à un nombre positif : deux solutions.";
      break;
    case "racine_carree":
      equationIsolee = `\\sqrt{${arg}} = ${nombreLatex(isole)}`;
      suite = "Élève les deux membres au carré.";
      break;
    case "racine_cubique":
      equationIsolee = `\\sqrt[3]{${arg}} = ${nombreLatex(isole)}`;
      suite = "Élève les deux membres au cube.";
      break;
    case "cube":
      equationIsolee = `\\left(${arg}\\right)^3 = ${nombreLatex(isole)}`;
      suite = "Prends la racine cubique des deux membres.";
      break;
    case "inverse":
      // Diviser par le numérateur donnerait un décimal peu lisible (0,0625) : on isole la fraction.
      equationIsolee = `\\dfrac{${nombreLatex(Math.abs(e.a))}}{${arg}} = ${nombreLatex(q.y - e.tv)}`;
      suite = "Le dénominateur vaut donc le numérateur divisé par ce nombre.";
      break;
  }
  return [
    [
      t("Pose l'équation "),
      m(`${expressionModeleLatex(e)} = ${y}`),
      t(e.famille === "inverse" ? ", puis isole la fraction : enlève d'abord la translation verticale." : ", puis isole la fonction de référence : enlève d'abord la translation verticale, puis divise par le facteur."),
    ],
    [t("Tu dois arriver à "), m(equationIsolee), t(`. ${suite}`)],
  ];
}

export function aidesEcran5(e: ExerciceChoisirModele): Fragments[] {
  const info = INFOS_CONTEXTE[e.contexte];
  const premier: Fragments =
    e.parametre5 === "th"
      ? [t("Le nombre soustrait à la variable est l'abscisse du point caractéristique : que se passe-t-il, dans la situation, en ce point ?")]
      : e.parametre5 === "tv"
        ? [t(e.famille === "inverse" ? "Le terme ajouté est la valeur dont la courbe se rapproche (asymptote horizontale) : quelle partie de la situation ne dépend pas de la variable ?" : "Le terme ajouté est l'ordonnée du point caractéristique : que vaut la grandeur en ce point ?")]
        : [t(e.famille === "inverse" ? "Calcule la valeur du modèle pour une variable égale à 1, ou le produit des deux grandeurs." : "Calcule la valeur du modèle à 1 unité à droite du point caractéristique, et compare-la à sa valeur au point caractéristique.")];
  return [
    premier,
    [t(`Regarde les unités : TH s'exprime dans l'unité de l'axe horizontal (${info.axeX.unite}), TV et le facteur vertical dans celle de l'axe vertical (${info.axeY.unite}).`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Corrigé : famille et lecture (partagés écran / papier)
// ---------------------------------------------------------------------------------------------

export function justificationFamille(e: ExerciceChoisirModele): Fragments {
  return [t(`La courbe est ${FORME_COURBE[e.famille]} : elle est issue de `), m(REFERENCE_LATEX[e.famille]), t(".")];
}

export function lectureTransformations(e: ExerciceChoisirModele): Fragments {
  const { dx, dy } = ecartsLecture(e);
  const facteur = Math.abs(e.a);
  return [
    t(`Point caractéristique (${nomPointCaracteristique(e)}) : `),
    m(pointCaracteristiqueLatex(e)),
    t(", donc "),
    m(`\\text{TH} = ${nombreLatex(e.th)}`),
    t(" et "),
    m(`\\text{TV} = ${nombreLatex(e.tv)}`),
    t(". Pour un écart horizontal de "),
    m(nombreLatex(dx)),
    t(", la courbe s'écarte verticalement de "),
    m(nombreLatex(dy)),
    t(" et la référence de "),
    m(valeurReferenceLatex(e)),
    t(" : facteur vertical "),
    m(`${nombreLatex(Math.abs(dy))} \\div ${valeurReferenceLatex(e)} = ${nombreLatex(facteur)}`),
    t(e.a < 0 ? ", et la courbe descend là où la référence monte : symétrie d'axe horizontal." : ", sans symétrie."),
  ];
}

/** Résumé des transformations (récapitulatif, réponse révélée). */
export function transformationsLatex(e: ExerciceChoisirModele): string {
  return `\\text{TH} = ${nombreLatex(e.th)} \\quad \\text{TV} = ${nombreLatex(e.tv)} \\quad \\text{facteur} = ${nombreLatex(Math.abs(e.a))} \\quad \\text{symétrie : ${e.a < 0 ? "oui" : "non"}}`;
}
