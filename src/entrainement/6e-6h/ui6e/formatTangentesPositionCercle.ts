import type { Exercice126, Phase126, Position126 } from "../core6e/tangentesPositionCercle";
import { developpee, distance126, intersectionsDroiteCercle, phases126, pointContact, r126, tangenteEnT, tangentesExterieur } from "../core6e/tangentesPositionCercle";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { P } from "./outilsLieuxLotH1";
import { ILLISIBLE, apercuDroite, apercuNombre, apercuPoint, coordL, equationCours, figureAuto, l, membreL, nb, somme, t } from "./outilsLieuxLotH1";

/**
 * Couche C — textes de `6gen126` « Tangentes et position relative droite–cercle » : énoncés (cercle en
 * forme développée ou réduite, droite, point), champs, options de position (ordre FIXE), aides à deux
 * niveaux (propriété du cours, puis posée pour l'instance — jamais le résultat), réponses attendues,
 * figures (jamais ce que l'écran demande : pas de droite à l'écran de `position`, pas de centre avant
 * qu'il soit trouvé).
 */

type E = Exercice126;
type Ph = Phase126;

export const pt = (nom: string, p: P) => `${nom}${coordL(p)}`;

/** « x^2+y^2-4x+6y-3=0 ». */
export function cercleDeveloppeL(e: E): string {
  const { D, E: Ee, F } = developpee(e);
  return `x^2+y^2${somme([
    [D, "x"],
    [Ee, "y"],
    [F, ""],
  ]).replace(/^(?!-|0$)/, "+").replace(/^\+?0$/, "")}=0`;
}

/** « (x-2)^2+(y+1)^2=9 ». */
export function cercleReduitL(e: E): string {
  const f = (v: string, c: number) => (c === 0 ? `${v}^2` : `(${v}${c > 0 ? "-" : "+"}${nb(Math.abs(c))})^2`);
  return `${f("x", e.O.x)}+${f("y", e.O.y)}=${nb(e.r2)}`;
}

/** « y+5=m\,(x+5) », « y=m\,(x-3) » : droite non verticale de pente m passant par P. */
export function droitePenteL(P: P): string {
  const f = (v: string, c: number) => (c === 0 ? v : `${v}${c > 0 ? "-" : "+"}${nb(Math.abs(c))}`);
  return `${f("y", P.y)}=m\\,${P.x === 0 ? "x" : `(${f("x", P.x)})`}`;
}

export const droiteL = (e: E) => `d\\equiv ${membreL(e.droite!)}=0`;

export function situation126(e: E): Frag[] {
  switch (e.variante) {
    case "position":
      return [t("Dans un repère orthonormé, on donne le cercle "), l(`\\mathcal{C}\\equiv ${cercleDeveloppeL(e)}`), t(" et la droite "), l(droiteL(e)), t(".")];
    case "tangentePoint":
      return [t("Dans un repère orthonormé, on donne le cercle "), l(`\\mathcal{C}\\equiv ${cercleDeveloppeL(e)}`), t(" et son point "), l(pt("T", e.T!)), t(".")];
    case "tangentesExterieur":
      return [t("Dans un repère orthonormé, on donne le cercle "), l(`\\mathcal{C}\\equiv ${cercleReduitL(e)}`), t(" et le point "), l(pt("P", e.P!)), t(", extérieur au cercle.")];
  }
}

export function consigneGlobale126(e: E): Frag[] {
  switch (e.variante) {
    case "position":
      return [t("Détermine le centre et le rayon du cercle, puis la distance du centre à la droite d. Déduis-en la position relative de d et du cercle (sécante, tangente ou extérieure). Justifie.")];
    case "tangentePoint":
      return [t("Détermine le centre du cercle, puis une équation cartésienne de la tangente au cercle en T.")];
    case "tangentesExterieur":
      return [t("Calcule la longueur PT d'une tangente menée de P au cercle (T est le point de contact), puis établis une équation cartésienne de chacune des deux tangentes au cercle passant par P.")];
  }
}

export const consigneGenerale126 = (e: E): Frag[] => [...situation126(e), t(" "), ...consigneGlobale126(e)];

const LIBELLE: Record<Ph, string> = {
  centreRayon: "Centre et rayon",
  distance: "Distance du centre à d",
  position: "Position relative",
  centre: "Centre",
  tangente: "Tangente en T",
  longueur: "Longueur PT",
  tangentes: "Tangentes issues de P",
};
export const libelle126 = (_e: E, p: Ph) => LIBELLE[p];

export function consigne126(_e: E, p: Ph): Frag[] {
  switch (p) {
    case "centreRayon":
      return [t("Détermine le centre Ω et le rayon r du cercle.")];
    case "distance":
      return [t("Calcule la distance du centre Ω à la droite d (valeur exacte).")];
    case "position":
      return [t("Quelle est la position relative de la droite d et du cercle ?")];
    case "centre":
      return [t("Détermine le centre Ω du cercle.")];
    case "tangente":
      return [t("Établis une équation cartésienne de la tangente au cercle en T.")];
    case "longueur":
      return [t("Calcule la longueur PT d'une tangente menée de P (T est le point de contact).")];
    case "tangentes":
      return [t("Établis une équation de chacune des deux tangentes au cercle passant par P.")];
  }
}

export const estChoix126 = (_e: E, p: Ph) => p === "position";

export function champs126(_e: E, p: Ph): ChampEcran[] {
  switch (p) {
    case "centreRayon":
      return [
        { label: "Centre Ω", labelLatex: "\\Omega=", placeholder: "(… ; …)", apercuLatex: apercuPoint },
        { label: "Rayon r", labelLatex: "r=", placeholder: "nombre exact", apercuLatex: apercuNombre },
      ];
    case "centre":
      return [{ label: "Centre Ω", labelLatex: "\\Omega=", placeholder: "(… ; …)", apercuLatex: apercuPoint }];
    case "distance":
      return [{ label: "Distance d(Ω ; d)", labelLatex: "d(\\Omega\\,;d)=", placeholder: "nombre exact", apercuLatex: apercuNombre }];
    case "longueur":
      return [{ label: "Longueur PT", labelLatex: "PT=", placeholder: "nombre exact", apercuLatex: apercuNombre }];
    case "tangente":
      return [{ label: "Tangente en T", placeholder: "équation, avec « = »", apercuLatex: apercuDroite }];
    case "tangentes":
      return [
        { label: "Première tangente", placeholder: "équation, avec « = »", apercuLatex: apercuDroite },
        { label: "Seconde tangente", placeholder: "équation, avec « = »", apercuLatex: apercuDroite },
      ];
    case "position":
      return [];
  }
}

export function messageIllisible126(_e: E, p: Ph): string {
  if (p === "tangente" || p === "tangentes") return ILLISIBLE.droite;
  if (p === "centre") return ILLISIBLE.point;
  if (p === "centreRayon") return `${ILLISIBLE.point.split(" Cette")[0]} Le rayon s'écrit comme un nombre exact (5, 2√3…). Cette saisie ne compte pas comme une tentative.`;
  return ILLISIBLE.nombre;
}

export const NOM_POSITION: Record<Position126, string> = {
  secante: "sécante : deux points communs",
  tangente: "tangente : un seul point commun",
  exterieure: "extérieure : aucun point commun",
};

export function options126(): OptionEcran[] {
  return (["secante", "tangente", "exterieure"] as const).map((id) => ({ id, fragments: [t(`La droite est ${NOM_POSITION[id]}.`)] }));
}

export const bonneOption126 = (e: E) => e.position!;

export function reponse126(e: E, p: Ph): Frag[] {
  switch (p) {
    case "centreRayon":
      return [l(`${pt("\\Omega", e.O)},\\ r=${nb(r126(e))}`)];
    case "centre":
      return [l(pt("\\Omega", e.O))];
    case "distance":
      return [l(`d(\\Omega\\,;d)=${nb(distance126(e).d)}`)];
    case "position": {
      const { d } = distance126(e);
      const cmp = e.position === "secante" ? "<" : e.position === "tangente" ? "=" : ">";
      return [l(`d(\\Omega\\,;d)=${nb(d)}${cmp}${nb(r126(e))}=r`), t(` : la droite est ${NOM_POSITION[e.position!]}.`)];
    }
    case "tangente":
      return [l(equationCours(tangenteEnT(e)))];
    case "longueur":
      return [l(`PT=${nb(e.pt!)}`)];
    case "tangentes": {
      const [d1, d2] = tangentesExterieur(e);
      return [l(equationCours(d1!)), t(" et "), l(equationCours(d2!))];
    }
  }
}

export function recap126(e: E, p: Ph): Frag[] {
  if (p === "position") return [t(`${NOM_POSITION[e.position!].split(" :")[0]!.replace(/^./, (c) => c.toUpperCase())}`)];
  return reponse126(e, p);
}

export function aide1_126(_e: E, p: Ph): AideEcran {
  switch (p) {
    case "centreRayon":
    case "centre":
      return { texte: [t(`Cours, point 2 : on complète les carrés pour passer à la forme centre-rayon :`)], latex: "x^2-2px=(x-p)^2-p^2" };
    case "distance":
      return { texte: [t(`Cours, point 2 : distance d'un point à une droite ax + by + c = 0 :`)], latex: "d(\\Omega\\,;d)=\\dfrac{|a\\,x_\\Omega+b\\,y_\\Omega+c|}{\\sqrt{a^2+b^2}}" };
    case "position":
      return { texte: [t(`Cours, point 2 : on compare la distance du centre à la droite avec le rayon : plus petite → sécante, égale → tangente, plus grande → extérieure.`)] };
    case "tangente":
      return { texte: [t(`Cours, point 2 : la tangente en T est perpendiculaire au rayon [ΩT] ; le vecteur `), l("\\vec{\\Omega T}"), t(" en est un vecteur normal.")] };
    case "longueur":
      return { texte: [t(`Cours, point 2 : le triangle ΩTP est rectangle en T (la tangente est perpendiculaire au rayon) ; par Pythagore :`)], latex: "PT^2=\\Omega P^2-r^2" };
    case "tangentes":
      return { texte: [t(`Cours, point 2 : une droite passant par P est tangente au cercle si et seulement si la distance du centre à cette droite vaut r. Écris une droite non verticale par P avec une pente m, sans oublier la droite verticale par P.`)] };
  }
}

export function aide2_126(e: E, p: Ph): AideEcran | null {
  switch (p) {
    case "centreRayon":
    case "centre": {
      const { D, E: Ee } = developpee(e);
      return { texte: [t("Ici, regroupe "), l(`x^2${somme([[D, "x"]]).replace(/^(?!-)/, "+")}`), t(" et "), l(`y^2${somme([[Ee, "y"]]).replace(/^(?!-)/, "+")}`), t(", puis complète chacun en un carré.")] };
    }
    case "distance": {
      const d = e.droite!;
      const norme = Math.round(Math.hypot(d.a, d.b));
      return {
        texte:
          norme === 1
            ? [t("Ici, remplace x et y par les coordonnées du centre dans "), l(membreL(d)), t(" et prends la valeur absolue (le vecteur normal a pour norme 1).")]
            : [t("Ici, remplace x et y par les coordonnées du centre dans "), l(membreL(d)), t(", prends la valeur absolue, puis divise par "), l(`\\sqrt{${nb(d.a)}^2+${d.b < 0 ? `(${nb(d.b)})` : nb(d.b)}^2}`), t(".")],
      };
    }
    case "position":
      return { texte: [t("Ici, compare la distance trouvée à l'écran précédent avec le rayon r.")] };
    case "tangente":
      return { texte: [t("Ici, calcule les composantes de "), l("\\vec{\\Omega T}"), t(", puis écris la droite passant par T qui a ce vecteur normal.")] };
    case "longueur": {
      const u = e.P!.x - e.O.x;
      const v = e.P!.y - e.O.y;
      return { texte: [t("Ici, "), l(`\\Omega P^2=${u < 0 ? `(${nb(u)})` : nb(u)}^2+${v < 0 ? `(${nb(v)})` : nb(v)}^2`), t(" et "), l(`r^2=${nb(e.r2)}`), t(".")] };
    }
    case "tangentes":
      return { texte: [t("Ici, une droite non verticale par P s'écrit "), l(droitePenteL(e.P!)), t(" ; écris que sa distance au centre vaut "), l(nb(r126(e))), t(", élève au carré et résous en m. Teste aussi la droite verticale "), l(`x=${nb(e.P!.x)}`), t(".")] };
  }
}

/** Figure de l'écran (jamais la réponse de l'écran). */
export function figure126(e: E, p: Ph): string | null {
  const r = r126(e);
  const cercle = { centre: e.O, rayon: r };
  const cadreCercle = [
    { x: e.O.x - r, y: e.O.y - r },
    { x: e.O.x + r, y: e.O.y + r },
  ];
  if (e.variante === "position") {
    if (p === "centreRayon") return null;
    return figureAuto({ cercles: [cercle], points: [{ P: e.O, label: "Ω" }] }, cadreCercle);
  }
  if (e.variante === "tangentePoint") {
    if (p === "centre") return null;
    return figureAuto({ cercles: [cercle], points: [{ P: e.O, label: "Ω" }, { P: e.T!, label: "T", couleur: "#c2410c" }] }, cadreCercle);
  }
  return figureAuto({ cercles: [cercle], points: [{ P: e.O, label: "Ω" }, { P: e.P!, label: "P", couleur: "#c2410c" }] }, [...cadreCercle, e.P!]);
}

/** Figure du corrigé : droite et points communs, tangente(s) et points de contact. */
export function figureCorrige126(e: E): string {
  const r = r126(e);
  const cercle = { centre: e.O, rayon: r };
  const cadre = [
    { x: e.O.x - r, y: e.O.y - r },
    { x: e.O.x + r, y: e.O.y + r },
  ];
  if (e.variante === "position") {
    const pts = intersectionsDroiteCercle(e);
    return figureAuto(
      { cercles: [cercle], droites: [{ d: e.droite!, label: "d" }], points: [{ P: e.O, label: "Ω" }, ...pts.map((q) => ({ P: q, couleur: "#2f7d32" }))], segments: [{ A: e.O, B: pointContact(e, e.droite!), pointille: true, couleur: "#6b7280" }] },
      cadre,
    );
  }
  if (e.variante === "tangentePoint") {
    return figureAuto({ cercles: [cercle], droites: [{ d: tangenteEnT(e) }], segments: [{ A: e.O, B: e.T!, pointille: true, couleur: "#6b7280" }], points: [{ P: e.O, label: "Ω" }, { P: e.T!, label: "T", couleur: "#c2410c" }] }, cadre);
  }
  const ds = tangentesExterieur(e);
  const contacts = ds.map((d) => pointContact(e, d));
  return figureAuto(
    {
      cercles: [cercle],
      droites: ds.map((d) => ({ d })),
      segments: contacts.map((c) => ({ A: e.O, B: c, pointille: true, couleur: "#6b7280" })),
      points: [{ P: e.O, label: "Ω" }, { P: e.P!, label: "P", couleur: "#c2410c" }, ...contacts.map((c, i) => ({ P: c, label: `T${i === 0 ? "₁" : "₂"}`, couleur: "#2f7d32" }))],
    },
    [...cadre, e.P!],
  );
}

export { phases126 };
