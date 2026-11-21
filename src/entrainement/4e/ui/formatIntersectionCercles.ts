import type { Cercle, ExerciceIntersectionCercles } from "../core/intersectionCercles.types";
import { developpe, difference, substitutionCercles, substitutionParabole } from "../moteur/modeleIntersectionCercles";
import type { ChampListe, EcranTSD } from "./ecransTransfertSecondDegre";
import { moinsH, q } from "./corrigeChapitre3";
import { COULEURS, champDroite, champPoints, coordL, equationL, etiquette, fenetreAutour, figureRepere, l, n, normaliser, plusTerme, t, type Fr, type P } from "./outilsAnalytiqueLotG";

/**
 * Textes, écrans et figure de gen98 « Intersection de deux cercles » — SOURCE UNIQUE (écran, aides,
 * papier, corrigé). Notation du cours : cercle (x − x₀)² + (y − y₀)² = r² ou développé
 * x² + y² + … = 0, parabole (x − x_S)² = 2p(y − y_S) (axe vertical) ou (y − y_S)² = 2p(x − x_S).
 */

type E = ExerciceIntersectionCercles;

export function cercleDeveloppeL(c: Cercle): string {
  const { D, E: Ey, F } = developpe(c);
  return `x^2+y^2${plusTerme(D, "x")}${plusTerme(Ey, "y")}${plusTerme(F)}=0`;
}

/** « (x-1)^2 », « x^2 ». */
export function carreL(variable: string, centre: number): string {
  return centre === 0 ? `${variable}^2` : `(${moinsH(centre, variable)})^2`;
}

export function cercleCanoniqueL(c: Cercle): string {
  return `${carreL("x", c.centre.x)}+${carreL("y", c.centre.y)}=${n(c.R)}`;
}

/** Second membre k(u − u_S) : « 4(y+2) », « y », « -(y-1) », « 2y ». */
export function produitParaboleL(k: number, u: string, uS: number): string {
  const facteur = uS === 0 ? u : `(${moinsH(uS, u)})`;
  if (uS === 0) return k === 1 ? u : k === -1 ? `-${u}` : `${q(k)}${u}`;
  return k === 1 ? moinsH(uS, u) : k === -1 ? `-${facteur}` : `${q(k)}${facteur}`;
}

export function paraboleL(e: E): string {
  const S = e.S!;
  const vertical = e.axe === "vertical";
  return vertical ? `${carreL("x", S.x)}=${produitParaboleL(e.k!, "y", S.y)}` : `${carreL("y", S.y)}=${produitParaboleL(e.k!, "x", S.x)}`;
}

export function enonceFragments(e: E): Fr {
  if (e.variante === "cercle-cercle") return [t("On donne les cercles "), l(`c_1\\equiv ${cercleDeveloppeL(e.c1)}`), t(" et "), l(`c_2\\equiv ${cercleDeveloppeL(e.c2!)}`), t(".")];
  return [t("On donne le cercle "), l(`c\\equiv ${cercleCanoniqueL(e.c1)}`), t(" et la parabole "), l(`\\mathcal{P}\\equiv ${paraboleL(e)}`), t(".")];
}

export function questionPapier(e: E): Fr {
  return e.variante === "cercle-cercle" ? [t("Détermine les coordonnées des points communs aux deux cercles.")] : [t("Détermine les coordonnées des points communs au cercle et à la parabole.")];
}

export const CONSIGNE_CERCLES = "Soustrais les deux équations pour obtenir une droite, substitue-la dans l'un des cercles, puis calcule les points communs (il peut y en avoir 0, 1 ou 2).";
export const CONSIGNE_PARABOLE = "Remplace le carré commun aux deux équations, résous l'équation du second degré obtenue, puis garde seulement les valeurs qui donnent des points.";

export const TITRES_CERCLES = ["La droite des points communs", "La substitution", "Les points communs"];
export const TITRES_PARABOLE = ["La substitution", "L'équation du second degré", "Les points communs"];

/** Phrases des trois options de l'écran « substitution » (cercle-parabole) ; 0 = la bonne. */
export function optionsSubstitution(e: E): Fr[] {
  const s = substitutionParabole(e);
  const carre = carreL(s.v, s.vS);
  const second = produitParaboleL(s.k, s.u, s.uS);
  return [
    [t("Remplacer "), l(carre), t(" par "), l(second), t(` dans l'équation du cercle : il reste une équation du second degré en ${s.u}.`)],
    [t(`Isoler ${s.u} dans l'équation de la parabole et le remplacer dans l'équation du cercle.`)],
    [t(`Remplacer ${s.u} par `), l(n(s.uS)), t(` (${s.u === "y" ? "l'ordonnée" : "l'abscisse"} du sommet) dans l'équation du cercle.`)],
  ];
}

export function consignesEcrans(e: E): Fr[] {
  if (e.variante === "cercle-cercle") {
    const s = substitutionCercles(e.c1, e.radicale!)!;
    return [
      [t("Soustrais membre à membre les équations de "), l("c_1"), t(" et de "), l("c_2"), t(" : écris l'équation de la droite obtenue (elle contient les points communs).")],
      [t(`Isole ${s.v} dans l'équation de cette droite et remplace-le dans l'équation de `), l("c_1"), t(`. Donne les solutions de l'équation obtenue, en ${s.u} (écris « aucune » s'il n'y en a pas).`)],
      [t("Donne les points communs aux deux cercles (écris « aucun » s'il n'y en a pas).")],
    ];
  }
  const s = substitutionParabole(e);
  return [
    [t("Quelle substitution mène à une équation du second degré, à une seule inconnue ?")],
    [t(`Résous l'équation en ${s.u} obtenue : donne toutes ses solutions (écris « aucune » s'il n'y en a pas).`)],
    [t("Donne les points communs au cercle et à la parabole (écris « aucun » s'il n'y en a pas).")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export function reponseDroite(e: E): Fr {
  return [l(equationL(e.radicale!))];
}

export function reponseRacines(e: E): Fr {
  const s = e.variante === "cercle-cercle" ? substitutionCercles(e.c1, e.radicale!)! : substitutionParabole(e);
  if (s.racines.length === 0) return [t("Aucune solution réelle.")];
  if (s.racines.length === 1) return [l(`${s.u}=${n(s.racines[0]!)}`)];
  return [l(`${s.u}_1=${n(s.racines[0]!)}`), t(" et "), l(`${s.u}_2=${n(s.racines[1]!)}`)];
}

export function reponsePoints(e: E): Fr {
  if (e.points.length === 0) return [t("Aucun point commun.")];
  const tri = [...e.points].sort((a, b) => a.x - b.x || a.y - b.y);
  const morceaux: Fr = [];
  tri.forEach((p, i) => {
    if (i > 0) morceaux.push(t(i === tri.length - 1 ? " et " : ", "));
    morceaux.push(l(coordL(p)));
  });
  return morceaux;
}

// ---------------------------------------------------------------------------------------------
// Figure du corrigé
// ---------------------------------------------------------------------------------------------

export function figureCorrige(e: E): string {
  const pts: P[] = [...e.points, { x: 0, y: 0 }];
  const cercles = [e.c1, ...(e.c2 ? [e.c2] : [])];
  for (const c of cercles) {
    const r = Math.sqrt(c.R);
    pts.push({ x: c.centre.x - r, y: c.centre.y - r }, { x: c.centre.x + r, y: c.centre.y + r });
  }
  const f = fenetreAutour(pts, 1);
  const etendue = Math.max(f.xMax - f.xMin, f.yMax - f.yMin);
  const unite = etendue > 24 ? 12 : etendue > 16 ? 16 : 20;
  const courbes: { points: P[]; couleur?: string }[] = [];
  if (e.variante === "cercle-parabole") {
    const S = e.S!;
    const k = e.k!;
    const echantillon: P[] = [];
    for (let s = -14; s <= 14; s += 0.05) {
      const u = (s * s) / k;
      echantillon.push(e.axe === "vertical" ? { x: S.x + s, y: S.y + u } : { x: S.x + u, y: S.y + s });
    }
    courbes.push({ points: echantillon, couleur: COULEURS.vert });
  }
  return figureRepere({
    fenetre: f,
    unite,
    cercles: cercles.map((c, i) => ({ centre: c.centre, rayon: Math.sqrt(c.R), couleur: i === 0 ? COULEURS.bleu : COULEURS.accent })),
    courbes,
    droites: e.radicale ? [{ d: e.radicale, couleur: COULEURS.gris, pointille: true, epaisseur: 1.4 }] : [],
    points: e.points.map((p, i) => ({ P: p, label: etiquette("", p), position: (i === 0 ? "no" : "ne") as "no" | "ne" })),
  });
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

function champRacines(e: E, racines: number[], u: string, autres: number[]): ChampListe {
  const pieges = [
    { valeurs: racines.map((r) => -r), message: "Vérifie les signes : tes valeurs sont les opposées des solutions." },
    ...(autres.length ? [{ valeurs: autres, message: `Ce sont les valeurs de l'autre coordonnée : on demande les solutions en ${u}.` }] : []),
  ].filter((p) => p.valeurs.length > 0 && !p.valeurs.every((v, i) => Math.abs(v - (racines[i] ?? NaN)) < 1e-9));
  return {
    type: "liste",
    id: "racines",
    libelle: [l(`${u}=`)],
    cibles: racines,
    pieges,
    videPermis: true,
    messageSiFaux: e.variante === "cercle-cercle" ? "Développe le carré, réduis l'équation, puis résous-la (discriminant, ou factorisation)." : "Développe, réduis, puis résous l'équation du second degré : garde toutes ses solutions à cet écran.",
  };
}

function ecransCercles(e: E): EcranTSD[] {
  const { brute } = difference(e.c1, e.c2!);
  const d1 = developpe(e.c1);
  const d2 = developpe(e.c2!);
  const s = substitutionCercles(e.c1, e.radicale!)!;
  const piegesDroite = [
    { droite: normaliser({ a: brute.a, b: brute.b, c: d1.F + d2.F }), message: "Erreur de signe sur le terme constant : on soustrait tout le terme constant, $F_1-F_2$." },
    { droite: normaliser({ a: d1.D + d2.D, b: d1.E + d2.E, c: d1.F + d2.F }), message: "Tu as additionné les équations : les carrés ne disparaissent qu'en soustrayant." },
  ].filter((p) => !(p.droite.a === e.radicale!.a && p.droite.b === e.radicale!.b && p.droite.c === e.radicale!.c));
  const autres = e.points.map((p) => (s.u === "x" ? p.y : p.x));
  return [
    {
      type: "champs",
      titre: TITRES_CERCLES[0]!,
      consigne: consignesEcrans(e)[0]!,
      champs: [champDroite({ id: "droite", libelle: [l("d\\equiv")], cible: e.radicale!, pieges: piegesDroite, messageSiFaux: "Retire terme à terme l'équation de $c_2$ de celle de $c_1$ : $x^2$ et $y^2$ disparaissent." })],
      aides: [
        [t("Un point commun vérifie les deux équations, donc aussi leur différence. En soustrayant membre à membre, "), l("x^2"), t(" et "), l("y^2"), t(" disparaissent : il reste une équation du premier degré.")],
        [t("Ici : "), l(`(${n(d1.D)}x)-(${n(d2.D)}x)`), t(" pour les termes en x, "), l(`(${n(d1.E)}y)-(${n(d2.E)}y)`), t(" pour les termes en y, "), l(`${n(d1.F)}-(${n(d2.F)})`), t(" pour les constantes.")],
      ],
      reponse: reponseDroite(e),
    },
    {
      type: "champs",
      titre: TITRES_CERCLES[1]!,
      consigne: consignesEcrans(e)[1]!,
      champs: [champRacines(e, s.racines, s.u, autres)],
      aides: [
        [t(`Isole ${s.v} dans l'équation de la droite, remplace-le dans l'équation de `), l("c_1"), t(", développe et réduis : tu obtiens une équation du second degré en "), l(s.u), t(".")],
        [t("Ici : "), l(`${s.v}=${s.m === 0 ? n(s.p) : `${s.m === 1 ? "" : s.m === -1 ? "-" : n(s.m)}${s.u}${plusTerme(s.p)}`}`), t(" ; après réduction, l'équation est du type "), l(`a${s.u}^2+b${s.u}+c=0`), t(" : calcule son discriminant.")],
      ],
      reponse: reponseRacines(e),
    },
    {
      type: "champs",
      titre: TITRES_CERCLES[2]!,
      consigne: consignesEcrans(e)[2]!,
      champs: [
        champPoints({
          id: "points",
          libelle: [t("Points communs :")],
          cibles: e.points,
          messageSiFaux: `Pour chaque solution en ${s.u}, calcule ${s.v} avec l'équation de la droite.`,
        }),
      ],
      aides: [
        [t(`Chaque solution en ${s.u} donne un point : son autre coordonnée se calcule avec l'équation de la droite. Aucune solution : aucun point commun.`)],
        [t("Ici : "), l(`${s.v}=${s.m === 0 ? n(s.p) : `${s.m === 1 ? "" : s.m === -1 ? "-" : n(s.m)}${s.u}${plusTerme(s.p)}`}`), t(s.racines.length ? `, avec ${s.racines.length === 1 ? "la valeur trouvée" : "chacune des deux valeurs trouvées"}.` : " : l'équation n'a pas de solution.")],
      ],
      reponse: reponsePoints(e),
      figureApres: figureCorrige(e),
    },
  ];
}

function ecransParabole(e: E): EcranTSD[] {
  const s = substitutionParabole(e);
  const options = optionsSubstitution(e);
  const ordre = e.ordreOptions;
  const rejetees = s.racines.filter((_, i) => s.carres[i]! < 0);
  const faux: P[] = rejetees.map((r) => (s.u === "y" ? { x: s.vS, y: r } : { x: r, y: s.vS }));
  const MESSAGES = [
    undefined,
    `En isolant ${s.u}, on obtiendrait une équation de degré 4 : le cours prévient que ce cas sort du chapitre. Le carré qui apparaît dans les deux équations se remplace directement.`,
    "Cela donnerait seulement les points du cercle à la hauteur du sommet, qui ne sont en général pas sur la parabole.",
  ];
  return [
    {
      type: "choix",
      titre: TITRES_PARABOLE[0]!,
      consigne: consignesEcrans(e)[0]!,
      options: ordre.map((i) => options[i]!),
      bonne: ordre.indexOf(0),
      aides: [
        [t("Cherche une expression qui apparaît telle quelle dans les deux équations : on peut la remplacer d'un bloc.")],
        [t("Ici, "), l(carreL(s.v, s.vS)), t(" apparaît dans l'équation du cercle et dans celle de la parabole.")],
      ],
      messageFaux: "Ce n'était pas la bonne substitution.",
      messagesOptions: ordre.map((i) => MESSAGES[i]),
    },
    {
      type: "champs",
      titre: TITRES_PARABOLE[1]!,
      consigne: consignesEcrans(e)[1]!,
      champs: [champRacines(e, s.racines, s.u, [])],
      aides: [
        [t("Remplace le carré par le second membre de la parabole, développe "), l(carreL(s.u, s.b)), t(", réduis, puis résous l'équation du second degré.")],
        [t("Ici : "), l(`${produitParaboleL(s.k, s.u, s.uS)}+${carreL(s.u, s.b)}=${n(s.R)}`), t(".")],
      ],
      reponse: reponseRacines(e),
    },
    {
      type: "champs",
      titre: TITRES_PARABOLE[2]!,
      consigne: consignesEcrans(e)[2]!,
      champs: [
        champPoints({
          id: "points",
          libelle: [t("Points communs :")],
          cibles: e.points,
          pieges: faux.length ? [{ points: [...e.points, ...faux], message: `Une solution en ${s.u} donne un carré négatif : elle ne correspond à aucun point, on la rejette.` }, ...faux.map((f) => ({ points: [f], message: `Pour cette valeur, le carré vaudrait un nombre négatif : aucun point.` }))] : [],
          messageSiFaux: "Pour chaque solution, calcule le carré avec l'équation de la parabole : négatif, aucun point ; nul, un point ; positif, deux points.",
        }),
      ],
      aides: [
        [t("Pour chaque solution, l'équation de la parabole donne "), l(carreL(s.v, s.vS)), t(" : s'il est négatif, aucun point ; nul, un point (le sommet) ; positif, deux points symétriques par rapport à l'axe.")],
        [t("Ici : "), ...s.racines.flatMap((r, i): Fr => [...(i ? [t(" ; ")] : []), l(`${s.u}=${n(r)}`), t(" donne "), l(`${carreL(s.v, s.vS)}=${n(s.carres[i]!)}`)]), ...(s.racines.length ? [t(".")] : [t("l'équation n'a pas de solution.")])],
      ],
      reponse: reponsePoints(e),
      figureApres: figureCorrige(e),
    },
  ];
}

export function ecrans(e: E): EcranTSD[] {
  return e.variante === "cercle-cercle" ? ecransCercles(e) : ecransParabole(e);
}
