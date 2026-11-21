import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { ExerciceDetectiveAnalytique, IdDescriptionAnalytique, SupportDetective, TypeErreurAnalytique } from "../core/detectiveAnalytique.types";
import { mono, q, somme } from "../ui/corrigeChapitre3";
import { affineL, colonne, coordL, l, membreDroite, n, nbp, normaliser, parametriquesL, plusTerme, pointL, produitTerme, t, termeProduit, valeurSubst, vecL, type D, type Fr } from "../ui/outilsAnalytiqueLotG";

/**
 * Modèle de gen99 « Détective d'erreurs : géométrie analytique » : à partir des paramètres entiers du
 * support et du type d'erreur, la copie de l'élève fictif (cohérente avec SON erreur), la ligne
 * fausse, les descriptions, la réponse corrigée (écran 3) et les blocs du corrigé détaillé. Une seule
 * source pour l'écran, le papier et le corrigé. Même contrat que 5gen67 / 6gen152 : copie canonique +
 * lignes justes préliminaires ; `av` lignes justes avant la ligne fausse (0 à 3, la position de la
 * ligne fausse est donc équilibrée).
 */

type E = ExerciceDetectiveAnalytique;

export type ValeurCorrection =
  | { genre: "droite"; nom: string; droite: D; copie: D; point: { nom: string; x: number; y: number } }
  | { genre: "nombres"; champs: { id: string; libelle: string; cible: number; copie: number; unite?: string }[] };

export interface ScenarioDetective {
  /** Ce que l'élève devait faire (avant « Voici sa copie : »). */
  recit: Fr;
  /** Question finale de l'écran 3 et du papier. */
  demande: string;
  lignes: Fr[];
  ligneFausse: number;
  preliminaires: Fr[];
  valeur: ValeurCorrection;
  /** Réponse correcte rédigée (écran 3, résultat du corrigé). */
  reponse: Fr;
  /** Résultat (faux) de la copie. */
  resultatCopie: Fr;
  /** Corrigé : ligne fausse refaite, constat, règle, copie reprise, vérification. */
  corrigeA: LigneCalcul[];
  constat: Fr;
  regle: Fr;
  corrigeC: LigneCalcul[];
  verification?: { texte: Fr; lignes: LigneCalcul[] };
  piege: Fr;
  /** Aide de niveau 2 de l'écran 3 (jamais la réponse). */
  aideCorrection: Fr;
}

// ============================================================================
// Descriptions (écran 2)
// ============================================================================

export const TYPES_PAR_SUPPORT: Record<SupportDetective, readonly [TypeErreurAnalytique, TypeErreurAnalytique]> = {
  droite: ["normalDirecteur", "signeC"],
  perpendiculaire: ["perpNormal", "perpEchange"],
  pente: ["penteInversee", "ordonneeOrigine"],
  cercle: ["signeCentre", "rCarre"],
  parabole: ["pAuLieuDemi", "signeDirectrice"],
  distance: ["formeNonRamenee", "carreNegatif"],
};

export const LEURRES_PAR_SUPPORT: Record<SupportDetective, readonly [IdDescriptionAnalytique, IdDescriptionAnalytique]> = {
  droite: ["leurreCoordonnees", "leurreEchange"],
  perpendiculaire: ["leurrePoint", "leurreCoordonnees"],
  pente: ["leurreMelange", "leurreCoordonnees"],
  cercle: ["leurreCompletion", "leurrePasCercle"],
  parabole: ["leurre2p", "leurreSommet"],
  distance: ["leurreDirecteurDistance", "leurrePied"],
};

export function descriptionFragments(id: IdDescriptionAnalytique): Fr {
  switch (id) {
    case "normalDirecteur":
      return [t("Le vecteur directeur a été utilisé comme un vecteur normal : ses composantes ont été prises directement pour a et b.")];
    case "signeC":
      return [t("Erreur de signe en isolant c.")];
    case "perpNormal":
      return [t("Le vecteur "), l(colonne("a", "b")), t(" lu sur l'équation de d a été pris pour un vecteur directeur de d : c'est un vecteur normal.")];
    case "perpEchange":
      return [t("Pour obtenir un vecteur perpendiculaire, les composantes ont été échangées sans changer le signe de l'une d'elles.")];
    case "penteInversee":
      return [t("La pente a été calculée à l'envers : variation des abscisses divisée par la variation des ordonnées.")];
    case "ordonneeOrigine":
      return [t("Erreur de signe en isolant p : il fallait retirer "), l("m\\cdot x_A"), t(" aux deux membres.")];
    case "signeCentre":
      return [t("Les coordonnées du centre ont été lues avec le mauvais signe : "), l("(x-a)^2"), t(" correspond à "), l("x_C=a"), t(".")];
    case "rCarre":
      return [t("Le second membre "), l("r^2"), t(" a été pris pour le rayon : il fallait en prendre la racine carrée.")];
    case "pAuLieuDemi":
      return [t("Le foyer a été placé à une distance p du sommet au lieu de "), l("\\dfrac{p}{2}"), t(".")];
    case "signeDirectrice":
      return [t("La directrice a été placée du même côté que le foyer : elle est de l'autre côté du sommet.")];
    case "formeNonRamenee":
      return [t("L'équation de d a été mal mise sous la forme "), l("ax+by+c=0"), t(" : un terme qui change de membre doit changer de signe.")];
    case "carreNegatif":
      return [t("Le carré d'un nombre négatif a été compté négatif.")];
    case "leurreCoordonnees":
      return [t("Les coordonnées du point ont été échangées (x à la place de y).")];
    case "leurreEchange":
      return [t("Les deux composantes du vecteur ont été échangées sans changer de signe.")];
    case "leurrePoint":
      return [t("La droite trouvée ne passe pas par le point donné.")];
    case "leurreMelange":
      return [t("Abscisses et ordonnées ont été mélangées dans le calcul de la pente (une abscisse moins une ordonnée).")];
    case "leurreCompletion":
      return [t("Un carré a été mal complété : le nombre retiré n'est pas le carré de la moitié du coefficient.")];
    case "leurrePasCercle":
      return [t("Ce n'est pas un cercle : le second membre est négatif.")];
    case "leurre2p":
      return [t("Le paramètre a été lu sans diviser par 2 : "), l("2p"), t(" a été pris pour p.")];
    case "leurreSommet":
      return [t("Le sommet a été lu avec le mauvais signe.")];
    case "leurreDirecteurDistance":
      return [t("La perpendiculaire a été construite avec un vecteur directeur de d au lieu d'un vecteur normal.")];
    case "leurrePied":
      return [t("Le pied H a été calculé dans l'équation de la perpendiculaire au lieu de celle de d.")];
  }
}

/** Nom court de l'erreur (réponse brève, barème). */
export const NOM_ERREUR: Record<TypeErreurAnalytique, string> = {
  normalDirecteur: "vecteur directeur pris pour un vecteur normal",
  signeC: "erreur de signe en isolant c",
  perpNormal: "vecteur normal pris pour un vecteur directeur",
  perpEchange: "composantes échangées sans changer de signe",
  penteInversee: "pente inversée",
  ordonneeOrigine: "erreur de signe en isolant p",
  signeCentre: "signe des coordonnées du centre",
  rCarre: "r² pris pour le rayon",
  pAuLieuDemi: "foyer à p du sommet au lieu de p/2",
  signeDirectrice: "directrice du même côté que le foyer",
  formeNonRamenee: "équation mal mise sous la forme ax + by + c = 0",
  carreNegatif: "carré d'un nombre négatif compté négatif",
};

// ============================================================================
// Écritures
// ============================================================================

const eqL = (a: number, b: number, c: number) => `${membreDroite({ a, b, c })}=0`;
const carre = (v: string, c: number) => (c === 0 ? `${v}^2` : `(${c > 0 ? `${v}-${n(c)}` : `${v}+${n(-c)}`})^2`);
const egaliteC = (A: number, xA: number, B: number, yA: number) => `${termeProduit(A, xA, true)}${termeProduit(B, yA)}+c=0`;

/** Lignes « … ; on multiplie par −1 » quand le premier coefficient est négatif. */
function lignesFinDroite(nom: string, a: number, b: number, c: number): LigneCalcul[] {
  const out = [ligne(`${nom}\\equiv ${eqL(a, b, c)}`, "on remplace c")];
  if (a < 0 || (a === 0 && b < 0)) out.push(ligne(`${nom}\\equiv ${eqL(-a, -b, -c)}`, "on multiplie par −1"));
  return out;
}

const texteNb = (v: number) => (v < 0 ? `−${String(-v)}` : String(v));

// ============================================================================
// Supports
// ============================================================================

function scenarioDroite(e: E): ScenarioDetective {
  const { xA, yA, al, be } = e.d as Record<string, number>;
  const s = be * xA - al * yA;
  const faux = e.type === "normalDirecteur";
  const A = faux ? al : be;
  const B = faux ? be : -al;
  const sCopie = A * xA + B * yA;
  const cCopie = e.type === "signeC" ? s : -sCopie;
  const lignes: Fr[] = [
    [l(`d\\equiv ${somme([[A, "x"], [B, "y"]])}+c=0`), t(" car un vecteur directeur est "), l(colonne("-b", "a"))],
    [t("A est sur d : "), l(egaliteC(A, xA, B, yA))],
    [t("donc "), l(`c=${n(cCopie)}`)],
    [l(`d\\equiv ${eqL(A, B, cCopie)}`)],
  ];
  const correcte = normaliser({ a: be, b: -al, c: -s });
  const corrigeA =
    e.type === "normalDirecteur"
      ? [
          ligne(`\\vec{u}=${colonne(al, be)}`, "vecteur directeur donné"),
          ligne(`a=${n(be)}`, [t("deuxième composante de "), l(colonne("-b", "a"))]),
          ligne(`b=${n(-al)}`, "opposé de la première composante"),
          ligne(`d\\equiv ${somme([[be, "x"], [-al, "y"]])}+c=0`, [t("et non "), l(`${somme([[al, "x"], [be, "y"]])}+c=0`), t(" comme dans la copie")]),
        ]
      : [ligne(egaliteC(be, xA, -al, yA), "A est sur d"), ligne(`${n(s)}+c=0`, "on calcule"), ligne(`c=${n(-s)}`, [t(s > 0 ? "on retire " : "on ajoute "), l(n(Math.abs(s))), t(" aux deux membres, et non "), l(`c=${n(s)}`), t(" comme dans la copie")])];
  return {
    recit: [t("Un élève cherche une équation cartésienne de la droite d passant par "), l(pointL("A", { x: xA, y: yA })), t(" et de vecteur directeur "), l(vecL("u", { x: al, y: be })), t(". Voici sa copie :")],
    demande: "Donne une équation cartésienne correcte de d.",
    lignes,
    ligneFausse: e.type === "normalDirecteur" ? 0 : 2,
    preliminaires: [
      [t("Données : "), l(pointL("A", { x: xA, y: yA })), t(" et "), l(vecL("u", { x: al, y: be })), t(".")],
      [t("On cherche une équation de la forme "), l("ax+by+c=0"), t(".")],
      [t("Un vecteur directeur de la droite "), l("ax+by+c=0"), t(" est "), l(colonne("-b", "a")), t(".")],
    ],
    valeur: { genre: "droite", nom: "d", droite: correcte, copie: { a: A, b: B, c: cCopie }, point: { nom: "A", x: xA, y: yA } },
    reponse: [l(`d\\equiv ${eqL(correcte.a, correcte.b, correcte.c)}`)],
    resultatCopie: [l(`d\\equiv ${eqL(A, B, cCopie)}`)],
    corrigeA,
    constat: e.type === "normalDirecteur" ? [t("Les coefficients a et b ne sont pas les composantes du vecteur directeur.")] : [t("Le terme constant c a le mauvais signe.")],
    regle:
      e.type === "normalDirecteur"
        ? [t("Avec un vecteur directeur "), l(colonne("-b", "a")), t(", a est la deuxième composante et b l'opposé de la première ; le vecteur "), l(colonne("a", "b")), t(" est un vecteur normal, perpendiculaire à la droite (cours, § 1).")]
        : [t("Pour isoler c, on retire le même nombre aux deux membres : "), l("s+c=0"), t(" donne "), l("c=-s"), t(".")],
    corrigeC: [
      ligne(`d\\equiv ${somme([[be, "x"], [-al, "y"]])}+c=0`, [t("vecteur directeur "), l(colonne(al, be)), t(" : "), l(`a=${n(be)}`), t(", "), l(`b=${n(-al)}`)]),
      ligne(egaliteC(be, xA, -al, yA), "A est sur d"),
      ligne(`${n(s)}+c=0`, "on calcule"),
      ligne(`c=${n(-s)}`, "on isole c"),
      ...lignesFinDroite("d", be, -al, -s),
    ],
    verification: { texte: [t("Le point "), l(pointL("B", { x: xA + al, y: yA + be })), t(" (A translaté de "), l("\\vec{u}"), t(") est aussi sur d :")], lignes: [ligne(`${termeProduit(correcte.a, xA + al, true)}${termeProduit(correcte.b, yA + be)}${plusTerme(correcte.c)}=0`, "il vérifie l'équation")] },
    piege: e.type === "normalDirecteur" ? [t("Les composantes du vecteur directeur ne sont pas a et b : elles valent −b et a.")] : [t("Quand un nombre change de membre, il change de signe.")],
    aideCorrection: [t("Ici : "), l(`a=${n(be)}`), t(" et "), l(`b=${n(-al)}`), t(" ; remplace les coordonnées de A pour trouver c.")],
  };
}

function scenarioPerpendiculaire(e: E): ScenarioDetective {
  const { a, b, c, xP, yP } = e.d as Record<string, number>;
  const u = e.type === "perpNormal" ? { x: a, y: b } : { x: -b, y: a };
  const v = e.type === "perpNormal" ? { x: -u.y, y: u.x } : e.type === "perpEchange" ? { x: a, y: -b } : { x: a, y: b };
  const A = v.y;
  const B = -v.x;
  const cc = -(A * xP + B * yP);
  const lignes: Fr[] = [
    [t("Vecteur directeur de d : "), l(`\\vec{u}${colonne(u.x, u.y)}`)],
    [t("Vecteur directeur de p, perpendiculaire à "), l("\\vec{u}"), t(" : "), l(`\\vec{v}${colonne(v.x, v.y)}`)],
    [l(`p\\equiv ${somme([[A, "x"], [B, "y"]])}+c=0`), t(" et P est sur p : "), l(egaliteC(A, xP, B, yP)), t(", donc "), l(`c=${n(cc)}`)],
    [l(`p\\equiv ${eqL(A, B, cc)}`)],
  ];
  const cp = -(b * xP - a * yP);
  const correcte = normaliser({ a: b, b: -a, c: cp });
  const dL = `d\\equiv ${eqL(a, b, c)}`;
  return {
    recit: [t("Un élève cherche une équation cartésienne de la droite p perpendiculaire à "), l(dL), t(" passant par "), l(pointL("P", { x: xP, y: yP })), t(". Voici sa copie :")],
    demande: "Donne une équation cartésienne correcte de p.",
    lignes,
    ligneFausse: e.type === "perpNormal" ? 0 : 1,
    preliminaires: [
      [t("Données : "), l(dL), t(" et "), l(pointL("P", { x: xP, y: yP })), t(".")],
      [t("La droite p cherchée est perpendiculaire à d et passe par P.")],
      [t("Deux droites sont perpendiculaires quand leurs vecteurs directeurs ont un produit scalaire nul.")],
    ],
    valeur: { genre: "droite", nom: "p", droite: correcte, copie: { a: A, b: B, c: cc }, point: { nom: "P", x: xP, y: yP } },
    reponse: [l(`p\\equiv ${eqL(correcte.a, correcte.b, correcte.c)}`)],
    resultatCopie: [l(`p\\equiv ${eqL(A, B, cc)}`)],
    corrigeA:
      e.type === "perpNormal"
        ? [ligne(dL, "équation donnée"), ligne(`\\vec{u}=${colonne(-b, a)}`, [t("vecteur directeur "), l(colonne("-b", "a")), t(", et non "), l(colonne(a, b)), t(" comme dans la copie")])]
        : [
            ligne(`\\vec{v}=${colonne(a, b)}`, [t("on échange les composantes de "), l("\\vec{u}"), t(" et on change un signe")]),
            ligne(`\\vec{u}\\cdot\\vec{v}=${nbp(-b)}\\cdot ${nbp(a)}+${nbp(a)}\\cdot ${nbp(b)}`, "produit scalaire"),
            ligne("=0", [t("perpendiculaires ; avec "), l(colonne(a, -b)), t(" (copie), on trouverait "), l(n(-2 * a * b))]),
          ],
    constat: e.type === "perpNormal" ? [t("Le vecteur directeur de d est faux : "), l(colonne(a, b)), t(" est un vecteur normal de d.")] : [t("Le vecteur de la copie n'est pas perpendiculaire à "), l("\\vec{u}"), t(" : leur produit scalaire n'est pas nul.")],
    regle:
      e.type === "perpNormal"
        ? [t("Pour "), l("d\\equiv ax+by+c=0"), t(", "), l(colonne("-b", "a")), t(" est un vecteur directeur et "), l(colonne("a", "b")), t(" un vecteur normal (cours, § 4).")]
        : [t("Un vecteur perpendiculaire à "), l(colonne("\\alpha", "\\beta")), t(" est "), l(colonne("-\\beta", "\\alpha")), t(" : on échange les composantes et on change le signe de l'une d'elles (cours, § 4).")],
    corrigeC: [
      ligne(`\\vec{u}=${colonne(-b, a)}`, "vecteur directeur de d"),
      ligne(`\\vec{v}=${colonne(a, b)}`, [t("perpendiculaire à "), l("\\vec{u}")]),
      ligne(`p\\equiv ${somme([[b, "x"], [-a, "y"]])}+c=0`, [t("vecteur directeur "), l("\\vec{v}")]),
      ligne(egaliteC(b, xP, -a, yP), "P est sur p"),
      ligne(`c=${n(cp)}`, "on isole c"),
      ...lignesFinDroite("p", b, -a, cp),
    ],
    verification: { texte: [t("Produit scalaire des vecteurs directeurs de d et de p :")], lignes: [ligne(`${nbp(-b)}\\cdot ${nbp(a)}+${nbp(a)}\\cdot ${nbp(b)}=0`, "d et p sont bien perpendiculaires")] },
    piege: e.type === "perpNormal" ? [t("Les coefficients a et b de l'équation forment un vecteur normal, pas un vecteur directeur.")] : [t("Échanger les composantes ne suffit pas : il faut aussi changer un signe.")],
    aideCorrection: [t("Ici : "), l(`\\vec{u}=${colonne(-b, a)}`), t(", donc "), l(`p`), t(" a pour vecteur directeur "), l(colonne(a, b)), t(" ; remplace les coordonnées de P pour trouver le terme constant.")],
  };
}

function scenarioPente(e: E): ScenarioDetective {
  const { xA, yA, m, dx } = e.d as Record<string, number>;
  const xB = xA + dx;
  const yB = yA + m * dx;
  const p = yA - m * xA;
  const M = e.type === "penteInversee" ? 1 / m : m;
  const P = e.type === "ordonneeOrigine" ? yA + m * xA : yA - M * xA;
  const fracCorrecte = `\\dfrac{${n(yB)}-${nbp(yA)}}{${n(xB)}-${nbp(xA)}}`;
  const fracCopie = e.type === "penteInversee" ? `\\dfrac{${n(xB)}-${nbp(xA)}}{${n(yB)}-${nbp(yA)}}` : fracCorrecte;
  const expl = (mm: number, pp: number) => `y=${somme([[mm, "x"], [pp, ""]])}`;
  const lignes: Fr[] = [
    [l(`m=${fracCopie}=${q(M)}`)],
    [t("A est sur la droite : "), l(`${n(yA)}=${q(M)}\\cdot ${nbp(xA)}+p`)],
    [t("donc "), l(`p=${q(P)}`)],
    [l(expl(M, P))],
  ];
  const correcte = normaliser({ a: m, b: -1, c: p });
  return {
    recit: [t("Un élève cherche l'équation explicite de la droite (AB), avec "), l(pointL("A", { x: xA, y: yA })), t(" et "), l(pointL("B", { x: xB, y: yB })), t(". Voici sa copie :")],
    demande: "Donne l'équation explicite correcte de (AB).",
    lignes,
    ligneFausse: e.type === "penteInversee" ? 0 : 2,
    preliminaires: [
      [t("Données : "), l(pointL("A", { x: xA, y: yA })), t(" et "), l(pointL("B", { x: xB, y: yB })), t(".")],
      [t("On cherche l'équation explicite "), l("y=mx+p"), t(" de la droite (AB).")],
      [t("La pente est le quotient de la variation des ordonnées par la variation des abscisses.")],
    ],
    valeur: { genre: "droite", nom: "(AB)", droite: correcte, copie: { a: M, b: -1, c: P }, point: { nom: "A", x: xA, y: yA } },
    reponse: [l(expl(m, p))],
    resultatCopie: [l(expl(M, P))],
    corrigeA:
      e.type === "penteInversee"
        ? [ligne("m=\\dfrac{y_B-y_A}{x_B-x_A}", "variation des ordonnées sur variation des abscisses"), ligne(`=${fracCorrecte}`), ligne(`=${q(m)}`, [t("et non "), l(q(1 / m)), t(" comme dans la copie")])]
        : [ligne(`${n(yA)}=${q(m)}\\cdot ${nbp(xA)}+p`, "A est sur la droite"), ligne(`${n(yA)}=${n(m * xA)}+p`, "on calcule"), ligne(`p=${n(yA)}-${nbp(m * xA)}`, "on retire le même nombre aux deux membres"), ligne(`=${n(p)}`, [t("et non "), l(n(yA + m * xA)), t(" comme dans la copie")])],
    constat: e.type === "penteInversee" ? [t("La pente de la copie est l'inverse de la bonne.")] : [t("L'ordonnée à l'origine p a été calculée avec une erreur de signe.")],
    regle:
      e.type === "penteInversee"
        ? [t("La pente est "), l("m=\\dfrac{y_B-y_A}{x_B-x_A}"), t(" : la variation des ordonnées au numérateur (cours, § 3).")]
        : [t("Pour isoler p dans "), l("y_A=m\\cdot x_A+p"), t(", on retire "), l("m\\cdot x_A"), t(" aux deux membres : "), l("p=y_A-m\\cdot x_A"), t(".")],
    corrigeC: [
      ligne(`m=${fracCorrecte}`, "pente de (AB)"),
      ligne(`=${q(m)}`),
      ligne(`${n(yA)}=${q(m)}\\cdot ${nbp(xA)}+p`, "A est sur la droite"),
      ligne(`p=${n(yA)}-${nbp(m * xA)}`, "on isole p"),
      ligne(`=${n(p)}`),
      ligne(expl(m, p), "équation explicite"),
    ],
    verification: { texte: [t("Le point B est sur la droite :")], lignes: [ligne(`${q(m)}\\cdot ${nbp(xB)}${plusTerme(p)}=${n(yB)}`, [t("c'est "), l("y_B")])] },
    piege: e.type === "penteInversee" ? [t("La pente se calcule « en haut les ordonnées » : "), l("\\dfrac{\\Delta y}{\\Delta x}"), t(", jamais l'inverse.")] : [t("En isolant p, le terme "), l("m\\cdot x_A"), t(" change de signe.")],
    aideCorrection: [t("Ici : "), l(`m=${fracCorrecte}`), t(" ; puis remplace les coordonnées de A dans "), l("y=mx+p"), t(".")],
  };
}

function scenarioCercle(e: E): ScenarioDetective {
  const { a, b, R } = e.d as Record<string, number>;
  const D = -2 * a;
  const Ey = -2 * b;
  const F = a * a + b * b - R;
  const r = Math.sqrt(R);
  const C = e.type === "signeCentre" ? { x: -a, y: -b } : { x: a, y: b };
  const rCopie = e.type === "rCarre" ? R : r;
  const rL = n(r) === `\\sqrt{${R}}` ? `\\sqrt{${R}}` : `\\sqrt{${R}}=${n(r)}`;
  const rCopieL = e.type === "rCarre" ? n(R) : rL;
  const developpee = `x^2+y^2${plusTerme(D, "x")}${plusTerme(Ey, "y")}${plusTerme(F)}=0`;
  const lignes: Fr[] = [
    [l(`(x^2${plusTerme(D, "x")})+(y^2${plusTerme(Ey, "y")})=${n(-F)}`)],
    [l(`${carre("x", a)}-${n(a * a)}+${carre("y", b)}-${n(b * b)}=${n(-F)}`)],
    [l(`${carre("x", a)}+${carre("y", b)}=${n(R)}`)],
    [t("Centre : "), l(`C${coordL(C)}`)],
    [t("Rayon : "), l(`r=${rCopieL}`)],
    [t("Le cercle a pour centre "), l(`C${coordL(C)}`), t(" et pour rayon "), l(n(rCopie)), t(".")],
  ];
  return {
    recit: [t("Un élève cherche le centre et le rayon du cercle d'équation "), l(developpee), t(". Voici sa copie :")],
    demande: "Donne le centre et le rayon corrects.",
    lignes,
    ligneFausse: e.type === "signeCentre" ? 3 : 4,
    preliminaires: [
      [t("Les coefficients de "), l("x^2"), t(" et de "), l("y^2"), t(" valent 1 : c'est peut-être un cercle.")],
      [t("On regroupe les termes en x et les termes en y, puis on complète les carrés.")],
      [t("Le second membre obtenu devra être positif : c'est le carré du rayon.")],
    ],
    valeur: {
      genre: "nombres",
      champs: [
        { id: "xC", libelle: "x_C=", cible: a, copie: C.x },
        { id: "yC", libelle: "y_C=", cible: b, copie: C.y },
        { id: "r", libelle: "r=", cible: r, copie: rCopie },
      ],
    },
    reponse: [t("Centre "), l(`C${coordL({ x: a, y: b })}`), t(", rayon "), l(`r=${n(r)}`), t(".")],
    resultatCopie: [t("centre "), l(`C${coordL(C)}`), t(", rayon "), l(n(rCopie))],
    corrigeA:
      e.type === "signeCentre"
        ? [ligne(`x_C=${n(a)}`, [t("dans "), l(carre("x", a)), t(", on change le signe du nombre")]), ligne(`y_C=${n(b)}`, [t("dans "), l(carre("y", b)), t(", et non "), l(`C${coordL(C)}`), t(" comme dans la copie")])]
        : [ligne(`r^2=${n(R)}`, "second membre de la forme centre-rayon"), ligne(`r=\\sqrt{${R}}`, "le rayon est la racine carrée"), ...(n(r) === `\\sqrt{${R}}` ? [] : [ligne(`=${n(r)}`, [t("et non "), l(n(R)), t(" comme dans la copie")])])],
    constat: e.type === "signeCentre" ? [t("Les coordonnées du centre ont le mauvais signe.")] : [t("Le rayon de la copie est le carré du rayon.")],
    regle:
      e.type === "signeCentre"
        ? [l("(x-a)^2+(y-b)^2=r^2"), t(" est l'équation du cercle de centre "), l("(a\\,;b)"), t(" : on change le signe du nombre écrit dans chaque parenthèse (cours, § 8).")]
        : [t("Dans "), l("(x-a)^2+(y-b)^2=r^2"), t(", le second membre est le carré du rayon : "), l("r=\\sqrt{r^2}"), t(" (cours, § 8).")],
    corrigeC: [
      ligne(`(x^2${plusTerme(D, "x")})+(y^2${plusTerme(Ey, "y")})=${n(-F)}`, "on regroupe"),
      ligne(`${carre("x", a)}-${n(a * a)}+${carre("y", b)}-${n(b * b)}=${n(-F)}`, "on complète les carrés"),
      ligne(`${carre("x", a)}+${carre("y", b)}=${n(R)}`, "on réduit"),
      ligne(`x_C=${n(a)}`, "centre"),
      ligne(`y_C=${n(b)}`),
      ligne(`r=\\sqrt{${R}}`, "rayon"),
      ...(n(r) === `\\sqrt{${R}}` ? [] : [ligne(`=${n(r)}`)]),
    ],
    verification: { texte: [t("En développant, on retrouve le terme constant de l'équation :")], lignes: [ligne(`${n(a * a)}+${n(b * b)}-${n(R)}=${n(F)}`, "terme constant de l'équation donnée")] },
    piege: e.type === "signeCentre" ? [t("Le centre se lit en changeant le signe : "), l("(x+3)^2"), t(" donne "), l("x_C=-3"), t(".")] : [t("Le second membre est "), l("r^2"), t(", pas r.")],
    aideCorrection: [t("Ici : "), l(`${carre("x", a)}+${carre("y", b)}=${n(R)}`), t(" ; lis le centre (en changeant les signes) et prends la racine carrée du second membre.")],
  };
}

function scenarioParabole(e: E): ScenarioDetective {
  const { xS, yS, p } = e.d as Record<string, number>;
  const k = 2 * p;
  const yF = yS + p / 2;
  const yd = yS - p / 2;
  const yFCopie = e.type === "pAuLieuDemi" ? yS + p : yF;
  const ydCopie = e.type === "signeDirectrice" ? yS + p / 2 : yd;
  const second = yS === 0 ? `${k === 1 ? "" : k === -1 ? "-" : n(k)}y` : `${k === 1 ? "" : k === -1 ? "-" : n(k)}(${yS > 0 ? `y-${n(yS)}` : `y+${n(-yS)}`})`;
  const equation = `${carre("x", xS)}=${second}`;
  const lignes: Fr[] = [
    [t("Sommet : "), l(pointL("S", { x: xS, y: yS }))],
    [l(`2p=${n(k)}`), t(", donc "), l(`p=${n(p)}`)],
    [t("Foyer : "), l(e.type === "pAuLieuDemi" ? `y_F=y_S+p=${q(yFCopie)}` : `y_F=y_S+\\dfrac{p}{2}=${q(yFCopie)}`), t(", donc "), l(pointL("F", { x: xS, y: yFCopie }))],
    [t("Directrice : "), l(e.type === "signeDirectrice" ? `y=y_S+\\dfrac{p}{2}=${q(ydCopie)}` : `y=y_S-\\dfrac{p}{2}=${q(ydCopie)}`)],
    [t("Le foyer est "), l(pointL("F", { x: xS, y: yFCopie })), t(" et la directrice a pour équation "), l(`y=${q(ydCopie)}`), t(".")],
  ];
  return {
    recit: [t("Un élève cherche le foyer F et la directrice de la parabole d'équation "), l(equation), t(". Voici sa copie :")],
    demande: "Donne le foyer et l'équation de la directrice corrects.",
    lignes,
    ligneFausse: e.type === "pAuLieuDemi" ? 2 : 3,
    preliminaires: [
      [t("L'axe de la parabole est vertical : la droite "), l(`x=${n(xS)}`), t(".")],
      [t("Forme du cours : "), l("(x-x_S)^2=2p(y-y_S)"), t(".")],
      [t("Le sommet est au milieu du foyer et de la directrice.")],
    ],
    valeur: {
      genre: "nombres",
      champs: [
        { id: "xF", libelle: "x_F=", cible: xS, copie: xS },
        { id: "yF", libelle: "y_F=", cible: yF, copie: yFCopie },
        { id: "yd", libelle: "\\text{directrice : }y=", cible: yd, copie: ydCopie },
      ],
    },
    reponse: [l(pointL("F", { x: xS, y: yF })), t(" et la directrice "), l(`y=${q(yd)}`), t(".")],
    resultatCopie: [l(pointL("F", { x: xS, y: yFCopie })), t(", directrice "), l(`y=${q(ydCopie)}`)],
    corrigeA:
      e.type === "pAuLieuDemi"
        ? [ligne("y_F=y_S+\\dfrac{p}{2}", [t("le foyer est à "), l("\\dfrac{p}{2}"), t(" du sommet")]), ligne(`=${n(yS)}+\\dfrac{${n(p)}}{2}`), ligne(`=${q(yF)}`, [t("et non "), l(q(yS + p)), t(" comme dans la copie")])]
        : [ligne("y=y_S-\\dfrac{p}{2}", "de l'autre côté du sommet que le foyer"), ligne(`=${n(yS)}-\\dfrac{${n(p)}}{2}`), ligne(`=${q(yd)}`, [t("et non "), l(q(yS + p / 2)), t(" comme dans la copie")])],
    constat: e.type === "pAuLieuDemi" ? [t("Le foyer de la copie est deux fois trop loin du sommet.")] : [t("La directrice de la copie passe par le foyer : elle est du mauvais côté du sommet.")],
    regle:
      e.type === "pAuLieuDemi"
        ? [t("Pour "), l("(x-x_S)^2=2p(y-y_S)"), t(", le foyer est "), l("F\\left(x_S\\,;y_S+\\dfrac{p}{2}\\right)"), t(" (cours, § 9).")]
        : [t("La directrice est "), l("y=y_S-\\dfrac{p}{2}"), t(" : le sommet est au milieu du foyer et de la directrice (cours, § 9).")],
    corrigeC: [
      ligne(`2p=${n(k)}`, "on identifie avec la forme du cours"),
      ligne(`p=${q(p)}`),
      ligne(`y_F=${n(yS)}+\\dfrac{${n(p)}}{2}`, [l("y_F=y_S+\\dfrac{p}{2}")]),
      ligne(`=${q(yF)}`),
      ligne(`x_F=${n(xS)}`, "le foyer est sur l'axe"),
      ligne(`y=${n(yS)}-\\dfrac{${n(p)}}{2}`, [t("directrice : "), l("y=y_S-\\dfrac{p}{2}")]),
      ligne(`=${q(yd)}`),
    ],
    verification: { texte: [t("Le sommet est au milieu du foyer et de la directrice :")], lignes: [ligne(`\\dfrac{${q(yF)}+${q(yd) .startsWith("-") ? `(${q(yd)})` : q(yd)}}{2}=${n(yS)}`, [t("c'est "), l("y_S")])] },
    piege: e.type === "pAuLieuDemi" ? [t("p est la distance du foyer à la directrice ; le foyer est à "), l("\\dfrac{p}{2}"), t(" du sommet.")] : [t("Foyer et directrice sont de part et d'autre du sommet.")],
    aideCorrection: [t("Ici : "), l(`p=${q(p)}`), t(" ; utilise "), l("y_F=y_S+\\dfrac{p}{2}"), t(" et "), l("y=y_S-\\dfrac{p}{2}"), t(".")],
  };
}

function scenarioDistance(e: E): ScenarioDetective {
  const { al, be, ga, xH, yH, k } = e.d as Record<string, number>;
  // d : al·x = be·y + ga, soit al·x − be·y − ga = 0 ; C = H + k·(al ; −be).
  const a = al;
  const b = -be;
  const c = -ga;
  const C = { x: xH + k * a, y: yH + k * b };
  const forme = e.type === "formeNonRamenee";
  const A = a;
  const B = forme ? be : b;
  const Cc = forme ? ga : c;
  const s = A * A + B * B;
  const T = -(A * C.x + B * C.y + Cc) / s;
  const H = { x: C.x + T * A, y: C.y + T * B };
  const dx = H.x - C.x;
  const dy = H.y - C.y;
  const N2 = dx * dx + dy * dy;
  const dist = Math.sqrt(N2);
  // carré négatif : la composante négative (la plus petite en valeur absolue) comptée négative.
  const neg = dx < 0 ? dx : dy;
  const pos = dx < 0 ? dy : dx;
  const N2Copie = e.type === "carreNegatif" ? pos * pos - neg * neg : N2;
  const distCopie = Math.sqrt(N2Copie);
  const dTexte = `d\\equiv ${mono(al, "x")}=${somme([
    [be, "y"],
    [ga, ""],
  ])}`;
  const racine = (N: number) => (n(Math.sqrt(N)) === `\\sqrt{${N}}` ? `\\sqrt{${N}}` : `\\sqrt{${N}}=${n(Math.sqrt(N))}`);
  const subst = `${produitTerme(A, affineL(C.x, A), true)}${produitTerme(B, affineL(C.y, B))}${plusTerme(Cc)}=0`;
  const normeCopie = e.type === "carreNegatif" ? `CH=\\sqrt{${nbp(dx)}^2+${nbp(dy)}^2}=\\sqrt{${n(pos * pos)}-${n(neg * neg)}}=${racine(N2Copie)}` : `CH=\\sqrt{${nbp(dx)}^2+${nbp(dy)}^2}=${racine(N2)}`;
  const lignes: Fr[] = [
    [t("On écrit d sous la forme ax + by + c = 0 : "), l(`d\\equiv ${eqL(A, B, Cc)}`)],
    [t("Perpendiculaire par C, de vecteur directeur "), l(colonne(A, B)), t(" : "), l(parametriquesL(C, { x: A, y: B }))],
    [t("Dans d : "), l(subst), t(", donc "), l(`t=${q(T)}`), t(" et "), l(`H${coordL(H)}`)],
    [l(normeCopie)],
    [t("La distance de C à d vaut "), l(n(distCopie)), t(".")],
  ];
  const sCorr = a * a + b * b;
  const cst = a * C.x + b * C.y + c;
  return {
    recit: [t("Un élève cherche la distance du point "), l(pointL("C", C)), t(" à la droite "), l(dTexte), t(". Voici sa copie :")],
    demande: "Donne la distance correcte de C à d (valeur exacte).",
    lignes,
    ligneFausse: forme ? 0 : 3,
    preliminaires: [
      [t("Données : "), l(pointL("C", C)), t(" et "), l(dTexte), t(".")],
      [t("Méthode : perpendiculaire à d par C, pied H sur d, puis norme de "), l("\\vec{CH}"), t(".")],
      [t("Un vecteur normal de la droite "), l("ax+by+c=0"), t(" est "), l(colonne("a", "b")), t(".")],
    ],
    valeur: { genre: "nombres", champs: [{ id: "dist", libelle: "\\text{distance}=", cible: Math.sqrt(a * a * k * k + b * b * k * k), copie: distCopie }] },
    reponse: [t("La distance de C à d vaut "), l(n(Math.abs(k) * Math.sqrt(sCorr))), t(".")],
    resultatCopie: [l(n(distCopie))],
    corrigeA: forme
      ? [ligne(`${mono(al, "x")}=${somme([[be, "y"], [ga, ""]])}`, "équation donnée"), ligne(eqL(a, b, c), [t("on fait passer les termes à gauche, ils changent de signe ; et non "), l(eqL(al, be, ga)), t(" comme dans la copie")])]
      : [ligne(`${nbp(neg)}^2=${n(neg * neg)}`, "un carré n'est jamais négatif"), ligne(`CH=\\sqrt{${n(pos * pos)}+${n(neg * neg)}}`), ligne(`=${n(dist)}`, [t("et non "), l(n(distCopie)), t(" comme dans la copie")])],
    constat: forme ? [t("La droite utilisée par la copie n'est pas d : les signes de b et de c sont faux.")] : [t("La norme de la copie est fausse : un carré y est compté négatif.")],
    regle: forme
      ? [t("Un terme qui change de membre change de signe : "), l("\\alpha x=\\beta y+\\gamma"), t(" s'écrit "), l("\\alpha x-\\beta y-\\gamma=0"), t(" (cours, § 1).")]
      : [t("Le carré d'un nombre négatif est positif : "), l(`${nbp(neg)}^2=${n(neg * neg)}`), t(". La norme de "), l(colonne("x", "y")), t(" est "), l("\\sqrt{x^2+y^2}"), t(" (cours, § 6).")],
    corrigeC: [
      ligne(`d\\equiv ${eqL(a, b, c)}`, "forme ax + by + c = 0"),
      ligne(`p\\equiv ${parametriquesL(C, { x: a, y: b })}`, "perpendiculaire par C, vecteur normal de d"),
      ligne(`${produitTerme(a, affineL(C.x, a), true)}${produitTerme(b, affineL(C.y, b))}${plusTerme(c)}=0`, "dans l'équation de d"),
      ligne(`${sCorr === 1 ? "" : n(sCorr)}t${plusTerme(cst)}=0`, "on réduit"),
      ligne(`t=${q(-k)}`, "on isole t"),
      ligne(`x_H=${valeurSubst(C.x, a, -k)}=${n(xH)}`),
      ligne(`y_H=${valeurSubst(C.y, b, -k)}=${n(yH)}`),
      ligne(`CH=\\sqrt{${nbp(xH - C.x)}^2+${nbp(yH - C.y)}^2}`, [t("norme de "), l("\\vec{CH}")]),
      ligne(`=\\sqrt{${n((xH - C.x) ** 2 + (yH - C.y) ** 2)}}`),
      ...(n(Math.sqrt((xH - C.x) ** 2 + (yH - C.y) ** 2)) === `\\sqrt{${(xH - C.x) ** 2 + (yH - C.y) ** 2}}` ? [] : [ligne(`=${n(Math.sqrt((xH - C.x) ** 2 + (yH - C.y) ** 2))}`)]),
    ],
    verification: { texte: [t("Le pied H est bien sur d :")], lignes: [ligne(`${termeProduit(a, xH, true)}${termeProduit(b, yH)}${plusTerme(c)}=0`, "H vérifie l'équation de d")] },
    piege: forme ? [t("Avant de lire a, b et c, on met l'équation sous la forme "), l("ax+by+c=0"), t(" : tout dans le membre de gauche.")] : [t("Dans une norme, les deux carrés sont positifs : on les additionne.")],
    aideCorrection: [t("Ici : "), l(`d\\equiv ${eqL(a, b, c)}`), t(" ; la perpendiculaire par C a pour vecteur directeur "), l(colonne(a, b)), t(".")],
  };
}

// ============================================================================
// Copie finale
// ============================================================================

function canonique(e: E): ScenarioDetective {
  switch (e.support) {
    case "droite":
      return scenarioDroite(e);
    case "perpendiculaire":
      return scenarioPerpendiculaire(e);
    case "pente":
      return scenarioPente(e);
    case "cercle":
      return scenarioCercle(e);
    case "parabole":
      return scenarioParabole(e);
    case "distance":
      return scenarioDistance(e);
  }
}

/** Copie finale : `av` lignes justes (préliminaires puis lignes justes de la copie canonique, les
 * dernières gardées) avant la ligne fausse, puis ses conséquences. */
function assembler(c: ScenarioDetective, av: number): ScenarioDetective {
  const pool = [...c.preliminaires, ...c.lignes.slice(0, c.ligneFausse)];
  const kk = Math.min(av, pool.length);
  return { ...c, lignes: [...pool.slice(pool.length - kk), ...c.lignes.slice(c.ligneFausse)], ligneFausse: kk };
}

const CACHE = new WeakMap<E, ScenarioDetective>();
export function scenario(e: E): ScenarioDetective {
  const enCache = CACHE.get(e);
  if (enCache) return enCache;
  const s = assembler(canonique(e), e.av);
  CACHE.set(e, s);
  return s;
}

export const copieEleve = (e: E): Fr[] => scenario(e).lignes;
export const indiceLigneFausse = (e: E): number => scenario(e).ligneFausse;
export const nombreLignes = (e: E): number => scenario(e).lignes.length;

export { texteNb };
