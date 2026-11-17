import type { ExercicePerspectiveCavaliere, PointDessin } from "../core/perspectiveCavaliere.types";
import { angleDegres, origineMesure, sommet, type BilanAretes, type DiagnosticSommet } from "../moteur/verificationPerspectiveCavaliere";
import { COULEURS_CAVALIERE, centreDessin, figureCavaliereSvg, type ArcFigure, type ModeFigure, type PointFigure, type SegmentFigure, type TexteFigure } from "./figureCavaliere";

/**
 * Textes et figures de gen104 (« Dessiner en perspective cavalière ») — UNE source pour l'écran et
 * le papier (`generateurs/perspectiveCavaliere/exportEvaluation.ts`). Aucune coordonnée : on parle
 * de longueurs réelles, de longueurs dessinées et d'angles, comme on les mesure à la règle et à
 * l'équerre. Les aides ne donnent jamais la position finale (il reste toujours une longueur à
 * calculer ou à mesurer).
 */

export function nombre(x: number): string {
  const r = Math.round(x * 10) / 10;
  return String(r).replace(".", ",").replace("-", "−");
}

export function segment(a: string, b: string): string {
  return `[${a}${b}]`;
}

export function nomSolide(e: ExercicePerspectiveCavaliere): string {
  if (e.variante === "pave") return e.cube ? "le cube ABCDEFGH" : "le pavé droit ABCDEFGH";
  if (e.variante === "prisme") return "le prisme droit ABCDEF";
  return "la pyramide ABCDS";
}

/** « du pavé droit ABCDEFGH », « de la pyramide ABCDS »… */
export function duSolide(e: ExercicePerspectiveCavaliere): string {
  return nomSolide(e).replace(/^le /, "du ").replace(/^la /, "de la ");
}

function faceDonnee(e: ExercicePerspectiveCavaliere): string {
  if (e.variante === "pave") return "Sa face avant ABFE est déjà dessinée en vraie grandeur.";
  if (e.variante === "prisme") return "Sa face avant, le triangle ABC, est déjà dessinée en vraie grandeur ; les arêtes [AD], [BE] et [CF] sont perpendiculaires à cette face.";
  return "L'arête avant [AB] de la base est déjà dessinée.";
}

/** Dimensions réelles, en une phrase. */
function dimensions(e: ExercicePerspectiveCavaliere): string {
  const L = nombre(e.longueur);
  const H = nombre(e.hauteur);
  const P = nombre(e.profondeur);
  if (e.variante === "pave") {
    if (e.cube) return `On veut dessiner le cube ABCDEFGH d'arête ${L} cm, posé sur sa face ABCD.`;
    return `On veut dessiner le pavé droit ABCDEFGH posé sur sa face ABCD : longueur AB = ${L} cm (de gauche à droite), hauteur AE = ${H} cm, profondeur BC = ${P} cm.`;
  }
  if (e.variante === "prisme") return `On veut dessiner le prisme droit ABCDEF couché sur sa face ABED : ses arêtes latérales [AD], [BE] et [CF] mesurent ${P} cm (profondeur).`;
  return `On veut dessiner la pyramide ABCDS dont la base est le rectangle ABCD posé au sol, avec AB = ${L} cm (de gauche à droite, à l'avant) et BC = ${P} cm (profondeur) ; son sommet S est à la verticale du centre de la base, à une hauteur de ${H} cm.`;
}

export function enonce(e: ExercicePerspectiveCavaliere): string {
  return `${dimensions(e)} ${faceDonnee(e)} Un carreau du quadrillage mesure 1 cm.`;
}

export function consigneGlobale(e: ExercicePerspectiveCavaliere): string {
  return `Termine le dessin ${duSolide(e)} en perspective cavalière (fuyantes à 45°, réduites de moitié) et trace ses arêtes cachées en pointillés.`;
}

export const NOMBRE_ECRANS = 3;

export function titreEcran(e: ExercicePerspectiveCavaliere, i: number): string {
  if (i === 0) return "Étape 1 — Première fuyante";
  if (i === 1) return e.variante === "pyramide" ? "Étape 2 — Sommet de la pyramide" : "Étape 2 — Autres sommets arrière";
  return "Étape 3 — Arêtes cachées";
}

function liste(noms: readonly string[]): string {
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

function derriere(e: ExercicePerspectiveCavaliere, nom: string): string {
  return origineMesure(e, nom).nom;
}

export function consigneEcran(e: ExercicePerspectiveCavaliere, i: number): string {
  if (i === 0) return `Le sommet ${e.premier} est derrière ${derriere(e, e.premier)}, à ${nombre(e.profondeur)} cm en profondeur. Place ${e.premier} : touche le quadrillage, puis fais glisser le point.`;
  if (i === 1) {
    if (e.variante === "pyramide") {
      const c = e.completes[0]!;
      return `${c} se place de la même façon, derrière ${derriere(e, c)} : il est maintenant dessiné, ainsi que les diagonales de la base, qui se coupent en son centre O. Place le sommet S.`;
    }
    return `Place les sommets ${liste(e.suivants)} : touche un nom pour choisir le point à placer, puis touche le quadrillage et fais glisser le point.`;
  }
  return "Tous les sommets sont placés. Touche les arêtes cachées pour les tracer en pointillés (touche encore pour revenir au trait plein), puis valide.";
}

/** Consignes d'étape pour le papier (corrigé : « Étape n — … »). */
export function consigneEtapePapier(e: ExercicePerspectiveCavaliere, i: number): string {
  if (i === 0) return `Trace la fuyante issue de ${derriere(e, e.premier)} et place le sommet ${e.premier}.`;
  if (i === 1) {
    if (e.variante === "pyramide") return `Place ${e.completes[0]}, puis le sommet S de la pyramide.`;
    return `Place les sommets ${liste(e.suivants)} et trace les arêtes du solide.`;
  }
  return "Trace les arêtes cachées en pointillés.";
}

export function aidesEcran(e: ExercicePerspectiveCavaliere, i: number): string[] {
  if (i === 0) {
    const o = derriere(e, e.premier);
    return [
      `${e.premier} est derrière ${o} : ${segment(o, e.premier)} est une fuyante. Elle part de ${o} à 45° de l'horizontale, vers la droite et vers le haut.`,
      `Sur le dessin, une fuyante mesure la moitié de sa longueur réelle : divise la profondeur (${nombre(e.profondeur)} cm) par 2. Mesure cette longueur le long de la fuyante, pas en carreaux du quadrillage.`,
    ];
  }
  if (i === 1) {
    if (e.variante === "pyramide") {
      return [
        "La hauteur d'une pyramide droite est verticale : ce n'est pas une fuyante, elle garde donc sa vraie grandeur.",
        `Le pied de la hauteur est le centre O de la base, là où se croisent ses diagonales [AC] et [BD]. Mesure la hauteur à partir de O, verticalement.`,
      ];
    }
    const o = derriere(e, e.premier);
    return [
      `Toutes les fuyantes sont parallèles et ont, sur le dessin, la même longueur que ${segment(o, e.premier)}.`,
      `Chaque sommet arrière est derrière le sommet avant de même largeur et de même hauteur : ${e.suivants.map((n) => `${n} derrière ${derriere(e, n)}`).join(", ")}.`,
    ];
  }
  const cachees = e.variante === "pave" ? "la face arrière DCGH et la face du dessous ABCD" : e.variante === "prisme" ? "la face arrière DEF et la face du dessous ABED" : "la base ABCD et la face arrière SCD";
  return [
    `Une arête est cachée quand toutes les faces qui la bordent sont cachées. Les fuyantes montent vers la droite : on voit la face avant ; ${cachees} sont cachées.`,
    "Une arête du contour extérieur du dessin est toujours vue. Pour les autres, regarde le sommet D (arrière, en bas, à gauche) : s'il est à l'intérieur du contour, il est caché, et toutes les arêtes qui en partent aussi.",
  ];
}

// --- Mesures lues sous la figure (règle et équerre) ------------------------------------------------

export function texteMesure(e: ExercicePerspectiveCavaliere, nom: string, p: PointDessin): string {
  const o = origineMesure(e, nom);
  const u = { x: p.x - o.point.x, y: p.y - o.point.y };
  const l = Math.hypot(u.x, u.y);
  if (l < 0.05) return `${segment(o.nom, nom)} : 0 cm`;
  const theta = angleDegres(u);
  const aigu = Math.round(Math.min(Math.abs(theta), 180 - Math.abs(theta)));
  const horizontal = aigu === 90 ? null : u.x > 0 ? "vers la droite" : "vers la gauche";
  const vertical = aigu === 0 ? null : u.y > 0 ? "vers le haut" : "vers le bas";
  const sens = [horizontal, vertical].filter(Boolean).join(" et ");
  return `${segment(o.nom, nom)} : ${nombre(l)} cm, à ${aigu}° de l'horizontale, ${sens}`;
}

// --- Diagnostics ------------------------------------------------------------------------------------

export function messageDiagnostic(nom: string, d: DiagnosticSommet): string {
  switch (d.code) {
    case "juste":
      return `${nom} est bien placé.`;
    case "echange":
      return `Ce point est à la place de ${d.autre}, pas de ${nom}.`;
    case "non-reduite":
      return "Ta fuyante a la longueur réelle de la profondeur : en perspective cavalière, une fuyante est réduite de moitié.";
    case "diagonale-carreaux":
      return "Tu as compté un carreau en diagonale par centimètre : la diagonale d'un carreau mesure environ 1,4 cm, pas 1 cm. Mesure la longueur le long de la fuyante.";
    case "horizontale":
      return "Ta fuyante est horizontale : seules les largeurs restent horizontales. Une fuyante (profondeur) part à 45° de l'horizontale.";
    case "verticale":
      return "Ta fuyante est verticale : seules les hauteurs restent verticales. Une fuyante (profondeur) part à 45° de l'horizontale.";
    case "sens":
      return "Mauvais sens de fuite : dans ce chapitre, les fuyantes partent vers la droite et vers le haut.";
    case "longueur":
      return "La direction est bonne, mais pas la longueur : sur le dessin, une fuyante mesure la moitié de la profondeur réelle.";
    case "angle":
      return "L'angle avec l'horizontale ne convient pas : une fuyante fait un angle de 45° avec l'horizontale.";
    case "pied-avant":
      return "S est à la verticale du milieu de [AB] : le pied de la hauteur est le centre O de la base, plus loin en profondeur.";
    case "hauteur-reduite":
      return "La hauteur est verticale : elle garde sa vraie grandeur. Seules les fuyantes sont réduites de moitié.";
    case "pas-verticale":
      return "S doit être à la verticale du centre O de la base : la hauteur d'une pyramide droite est verticale.";
    case "hauteur":
      return "S est bien à la verticale de O, mais [OS] ne mesure pas la hauteur réelle de la pyramide.";
  }
}

// --- Réponses et explications -------------------------------------------------------------------------

export function longueurFuyante(e: ExercicePerspectiveCavaliere): string {
  return `${nombre(e.profondeur)} ÷ 2 = ${nombre(e.profondeur / 2)} cm`;
}

/** Ce qu'on attendait à l'étape `i` (fiche de l'écran, réponse révélée). */
export function reponseEcran(e: ExercicePerspectiveCavaliere, i: number): string {
  if (i === 0) {
    const o = derriere(e, e.premier);
    return `${segment(o, e.premier)} part de ${o} à 45° de l'horizontale, vers la droite et vers le haut, et mesure ${longueurFuyante(e)} sur le dessin.`;
  }
  if (i === 1) {
    if (e.variante === "pyramide") return `S est à la verticale du centre O de la base (rencontre des diagonales), avec OS = ${nombre(e.hauteur)} cm : la hauteur est verticale, en vraie grandeur.`;
    return `${e.suivants.map((n) => segment(derriere(e, n), n)).join(", ")} sont parallèles à ${segment(derriere(e, e.premier), e.premier)} et de même longueur sur le dessin (${nombre(e.profondeur / 2)} cm).`;
  }
  return `Arêtes cachées : ${aretesCacheesTexte(e)}.`;
}

export function aretesCacheesTexte(e: ExercicePerspectiveCavaliere): string {
  return liste(e.aretes.filter((a) => a.cachee).map((a) => segment(a.a, a.b)));
}

export function libelleArete(cle: string): string {
  const [a, b] = cle.split("-");
  return segment(a!, b!);
}

/** Pourquoi ces arêtes-là sont cachées (corrigé et explication de l'écran 3). */
export function raisonAretes(e: ExercicePerspectiveCavaliere): string {
  const cachees = aretesCacheesTexte(e);
  if (e.variante === "pave") return `On voit la face avant ABFE, le dessus EFGH et la face de droite BCGF. Le sommet D est à l'intérieur du contour du dessin, derrière le solide : il est caché, ainsi que les trois arêtes qui en partent, ${cachees}.`;
  if (e.variante === "prisme") {
    return e.gaucheVue
      ? `On voit la face avant ABC, la face de droite BCFE et la face de gauche ACFD : [AC] monte moins vite que la fuyante (moins de 45°), donc D est sur le contour du dessin. Seule ${cachees}, entre la face arrière DEF et la face du dessous ABED, est cachée.`
      : `On voit la face avant ABC et la face de droite BCFE. [AC] monte plus vite que la fuyante (plus de 45°) : D est à l'intérieur du contour du dessin, derrière le solide. Il est caché, ainsi que ${cachees}.`;
  }
  return e.gaucheVue
    ? `On voit les faces SAB, SBC et, la pyramide étant basse, la face de gauche SAD : D est à gauche de [AS], sur le contour du dessin. Seule ${cachees}, entre la base et la face arrière SCD, est cachée.`
    : `On voit les faces SAB et SBC. D est à droite de [AS], à l'intérieur du contour du dessin : il est caché par le solide, ainsi que ${cachees}.`;
}

export function explicationAretes(e: ExercicePerspectiveCavaliere, bilan: BilanAretes): string[] {
  const lignes: string[] = [];
  if (bilan.manquees.length > 0) lignes.push(`Arête${bilan.manquees.length > 1 ? "s" : ""} cachée${bilan.manquees.length > 1 ? "s" : ""} laissée${bilan.manquees.length > 1 ? "s" : ""} en trait plein : ${liste(bilan.manquees.map(libelleArete))}.`);
  if (bilan.enTrop.length > 0) lignes.push(`Arête${bilan.enTrop.length > 1 ? "s" : ""} vue${bilan.enTrop.length > 1 ? "s" : ""} mise${bilan.enTrop.length > 1 ? "s" : ""} en pointillés : ${liste(bilan.enTrop.map(libelleArete))}.`);
  lignes.push(raisonAretes(e));
  return lignes;
}

// --- Figures -----------------------------------------------------------------------------------------

export type EtatPointEleve = "place" | "juste" | "faux";

export interface EtatFigureCavaliere {
  /** Sommets dessinés à leur place exacte (donnés, validés, révélés, complétés). */
  connus: readonly string[];
  /** Points de l'élève pas encore validés. */
  places?: Record<string, { p: PointDessin; etat: EtatPointEleve }>;
  actif?: string | null;
  /** Écran 3 : arêtes mises en pointillés par l'élève ; `corrige` : arêtes marquées après validation. */
  pointillees?: ReadonlySet<string> | null;
  fausses?: ReadonlySet<string> | null;
  /** Pyramide, écran 2 : diagonales de la base et centre O. */
  diagonales?: boolean;
}

function libelleFigure(e: ExercicePerspectiveCavaliere): string {
  return `Dessin en perspective cavalière ${duSolide(e)} sur un quadrillage de 1 cm`;
}

function pointsConnus(e: ExercicePerspectiveCavaliere, connus: readonly string[], couleur?: string): PointFigure[] {
  return connus.map((n) => {
    const s = sommet(e, n);
    return { p: s.dessin, label: n, couleur };
  });
}

function diagonales(e: ExercicePerspectiveCavaliere): { segments: SegmentFigure[]; points: PointFigure[] } {
  const p = (n: string) => sommet(e, n).dessin;
  const o = e.centreBase!;
  return {
    segments: [
      { a: p("A"), b: p("C"), couleur: COULEURS_CAVALIERE.construction, pointille: true, fin: true },
      { a: p("B"), b: p("D"), couleur: COULEURS_CAVALIERE.construction, pointille: true, fin: true },
    ],
    points: [{ p: o, label: "O", couleur: COULEURS_CAVALIERE.construction }],
  };
}

/** Figure de l'écran : sommets connus, points de l'élève (aperçu des arêtes), arêtes à classer. */
export function figureEcran(e: ExercicePerspectiveCavaliere, etat: EtatFigureCavaliere, mode: ModeFigure = "ecran"): string {
  const places = etat.places ?? {};
  const position = (n: string): PointDessin | null => (etat.connus.includes(n) ? sommet(e, n).dessin : places[n]?.p ?? null);
  const segments: SegmentFigure[] = [];
  const points: PointFigure[] = [];
  if (etat.diagonales && e.centreBase) {
    const d = diagonales(e);
    segments.push(...d.segments);
    points.push(...d.points);
  }
  for (const a of e.aretes) {
    const pa = position(a.a);
    const pb = position(a.b);
    if (!pa || !pb) continue;
    const eleve = !etat.connus.includes(a.a) || !etat.connus.includes(a.b);
    if (eleve) {
      segments.push({ a: pa, b: pb, couleur: COULEURS_CAVALIERE.eleve, fin: true });
      continue;
    }
    const pointille = etat.pointillees ? etat.pointillees.has(a.cle) : false;
    const faux = etat.fausses?.has(a.cle) ?? false;
    segments.push({ a: pa, b: pb, pointille, couleur: faux ? COULEURS_CAVALIERE.faux : undefined });
  }
  points.push(...pointsConnus(e, etat.connus));
  for (const [nom, { p, etat: et }] of Object.entries(places)) {
    if (etat.connus.includes(nom)) continue;
    const couleur = et === "faux" ? COULEURS_CAVALIERE.faux : et === "juste" ? COULEURS_CAVALIERE.juste : COULEURS_CAVALIERE.eleve;
    points.push({ p, label: nom, couleur, gros: true });
  }
  const halo = etat.actif ? (places[etat.actif]?.p ?? null) : null;
  return figureCavaliereSvg({ mode, cadre: e.cadreEcran, segments, points, halo, centre: centreDessin(e), libelle: libelleFigure(e) });
}

/** Énoncé papier : le quadrillage et la partie donnée (face avant ; arête [AB] de la pyramide). */
export function figurePapierEnonce(e: ExercicePerspectiveCavaliere): string {
  const donnes = e.sommets.filter((s) => s.donne).map((s) => s.nom);
  const segments: SegmentFigure[] = e.aretes.filter((a) => donnes.includes(a.a) && donnes.includes(a.b)).map((a) => ({ a: sommet(e, a.a).dessin, b: sommet(e, a.b).dessin }));
  return figureCavaliereSvg({ mode: "papier", cadre: e.cadrePapier, segments, points: pointsConnus(e, donnes), centre: centreDessin(e), libelle: libelleFigure(e) });
}

/** Corrigé papier : le dessin complet, arêtes cachées en pointillés, fuyantes en orange, avec la
 * mesure de la première fuyante (45°, longueur dessinée) — et, pour la pyramide, la hauteur [OS]. */
export function figurePapierCorrige(e: ExercicePerspectiveCavaliere): string {
  const p = (n: string) => sommet(e, n).dessin;
  const fuyantes = new Set(e.sommets.filter((s) => s.reference?.type === "fuyante").map((s) => [s.nom, (s.reference as { depuis: string }).depuis].sort().join("-")));
  const segments: SegmentFigure[] = e.aretes.map((a) => ({ a: p(a.a), b: p(a.b), pointille: a.cachee, couleur: fuyantes.has(a.cle) ? COULEURS_CAVALIERE.eleve : undefined }));
  const points: PointFigure[] = pointsConnus(e, e.sommets.map((s) => s.nom));
  const textes: TexteFigure[] = [];
  const arcs: ArcFigure[] = [];
  // Mesure d'une fuyante : celle issue de B (en bas à droite, toujours sur le contour du dessin),
  // avec l'angle de 45° (repère horizontal en pointillés, vers l'extérieur) et sa longueur dessinée.
  const o = p("B");
  segments.push({ a: o, b: { x: o.x + 1.3, y: o.y }, couleur: COULEURS_CAVALIERE.annotation, pointille: true, fin: true });
  arcs.push({ centre: o, rayon: 0.7, debut: 0, fin: 45, couleur: COULEURS_CAVALIERE.annotation });
  textes.push({ p: { x: o.x + 1.1 * Math.cos(Math.PI / 8), y: o.y + 1.1 * Math.sin(Math.PI / 8) }, texte: "45°", couleur: COULEURS_CAVALIERE.annotation, taille: 11 });
  textes.push({ p: { x: o.x + 1.5, y: o.y - 0.6 }, texte: `fuyante : ${nombre(e.profondeur / 2)} cm`, couleur: COULEURS_CAVALIERE.annotation, taille: 12 });
  if (e.variante === "pyramide" && e.centreBase) {
    const d = diagonales(e);
    segments.push(...d.segments);
    points.push(...d.points);
    segments.push({ a: e.centreBase, b: p("S"), couleur: COULEURS_CAVALIERE.construction, pointille: true, fin: true });
    textes.push({ p: { x: e.centreBase.x + 0.75, y: (e.centreBase.y + p("S").y) / 2 }, texte: `${nombre(e.hauteur)} cm`, couleur: COULEURS_CAVALIERE.construction, taille: 12 });
  }
  return figureCavaliereSvg({ mode: "papier", cadre: e.cadrePapier, segments, points, textes, arcs, centre: centreDessin(e), libelle: libelleFigure(e) });
}
