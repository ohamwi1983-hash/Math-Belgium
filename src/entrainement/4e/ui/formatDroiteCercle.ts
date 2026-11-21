import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceCercleTangent, ExerciceDroiteCercle, ExercicePositionRelative, ExerciceTangentePoint, PositionDroiteCercle } from "../core/droiteCercle.types";
import type { EcranTSD } from "./ecransTransfertSecondDegre";
import { q, somme } from "./corrigeChapitre3";
import { figureLotG } from "./figureLotG";
import {
  cercleDeveloppeLatex,
  cercleLatex,
  champCercle,
  champDroite,
  champExact,
  champsPoint,
  colonne,
  coordonnees,
  droiteDirectrice,
  droiteLatex,
  droiteNommee,
  droiteNormale,
  piegesPoint,
  pointLatex,
  racine,
  vecteur,
  vecteurLatex,
  type Fragments,
} from "./geometrieLotG";

/**
 * Textes et écrans de gen92 « Tangente et position relative d'une droite et d'un cercle » — SOURCE
 * UNIQUE pour l'écran, les aides, le papier et le corrigé. Notation du cours (§ 6, § 8) : cercle Γ,
 * centre C, rayon r, droite d ≡ ax + by + c = 0, pied H de la perpendiculaire, distance CH.
 */

type E = ExerciceDroiteCercle;

export const TITRES: Record<E["variante"], string[]> = {
  "tangente-point": ["Le vecteur CP", "Rôle de CP", "La tangente"],
  "position-relative": ["Centre et rayon", "Le pied H", "La distance CH", "Position relative"],
  "cercle-tangent": ["Le pied H", "Le rayon", "L'équation du cercle"],
};

export function enonceFragments(e: E): Fragments {
  if (e.variante === "tangente-point") {
    return [texte("On donne le cercle "), latex(`\\Gamma\\equiv ${cercleLatex(e.centre, e.r2)}`), texte(" et son point "), latex(pointLatex("P", e.p)), texte(".")];
  }
  if (e.variante === "position-relative") {
    return [texte("On donne la droite "), latex(droiteNommee("d", e.d)), texte(" et le cercle "), latex(`\\Gamma\\equiv ${cercleDeveloppeLatex(e.centre, e.r2)}`), texte(".")];
  }
  return [texte("On donne le point "), latex(pointLatex("C", e.centre)), texte(" et la droite "), latex(droiteNommee("d", e.d)), texte(".")];
}

export const CONSIGNES_GLOBALES: Record<E["variante"], string> = {
  "tangente-point": "Détermine une équation cartésienne de la tangente à Γ au point P.",
  "position-relative":
    "Détermine la position relative de d et de Γ (d extérieure, tangente ou sécante à Γ) en comparant la distance du centre de Γ à la droite d avec le rayon de Γ. Donne les longueurs en valeur exacte.",
  "cercle-tangent": "Détermine une équation du cercle de centre C tangent à la droite d.",
};

export function consigneGlobale(e: E): string {
  return CONSIGNES_GLOBALES[e.variante];
}

export const LIBELLES_POSITION: Record<PositionDroiteCercle, string> = {
  exterieure: "d est extérieure à Γ (aucun point commun)",
  tangente: "d est tangente à Γ (un seul point commun)",
  secante: "d est sécante à Γ (deux points communs)",
};

/** Options de l'écran « rôle de CP » (index 0 = la bonne). */
export const OPTIONS_ROLE: Fragments[] = [
  [latex("\\vec{CP}"), texte(" est un vecteur normal de la tangente : la tangente est perpendiculaire au rayon [CP].")],
  [latex("\\vec{CP}"), texte(" est un vecteur directeur de la tangente : la tangente a la direction du rayon [CP].")],
  [latex("\\vec{CP}"), texte(" ne sert à rien ici : il faut un vecteur directeur qui passe par le centre.")],
];

const MESSAGES_ROLE = [
  undefined,
  "La tangente touche le cercle en P sans le traverser : elle est perpendiculaire au rayon [CP]. CP est donc un vecteur normal, pas un vecteur directeur.",
  "CP est précisément le vecteur utile : la tangente en P est perpendiculaire au rayon [CP], donc CP est un vecteur normal de la tangente.",
];

/* ---------------------------------------------------------------------------------------------
 * Figures (montrées APRÈS la réponse)
 * ------------------------------------------------------------------------------------------- */

export function figure(e: E): string {
  const r = Math.sqrt(e.r2);
  if (e.variante === "tangente-point") {
    return figureLotG({
      cercles: [{ c: e.centre, r }],
      droites: [{ d: e.tangente, nom: "t" }],
      segments: [{ a: e.centre, b: e.p }],
      anglesDroits: [{ sommet: e.p, vers1: e.centre, vers2: { x: e.p.x - e.tangente.b, y: e.p.y + e.tangente.a } }],
      points: [
        { p: e.centre, nom: "C", position: "so" },
        { p: e.p, nom: "P", couleur: "vert", position: "ne" },
      ],
    });
  }
  const objets = {
    cercles: [{ c: e.centre, r }],
    droites: [{ d: e.d, nom: "d" }],
    segments: [{ a: e.centre, b: e.h, pointilles: true }],
    anglesDroits: e.centre.x === e.h.x && e.centre.y === e.h.y ? [] : [{ sommet: e.h, vers1: e.centre, vers2: { x: e.h.x - e.d.b, y: e.h.y + e.d.a } }],
    points: [
      { p: e.centre, nom: "C", position: "so" as const },
      { p: e.h, nom: "H", couleur: "vert" as const, position: "ne" as const },
    ],
  };
  return figureLotG(objets);
}

/* ---------------------------------------------------------------------------------------------
 * Écrans
 * ------------------------------------------------------------------------------------------- */

function ecransTangente(e: ExerciceTangentePoint): EcranTSD[] {
  const { centre, p, cp } = e;
  const faux = piegesPoint(cp, [
    { p: vecteur(p, centre), message: "Tu as calculé $\\vec{PC}$ : $\\vec{CP}$ va de C vers P, ses composantes sont « arrivée moins départ », $x_P-x_C$ et $y_P-y_C$." },
    { p: { x: p.x + centre.x, y: p.y + centre.y }, message: "Le centre de $(x-x_0)^2+(y-y_0)^2=r^2$ est $(x_0\\,;y_0)$ : dans $(x-1)^2$, $x_0=1$ ; dans $(x+1)^2$, $x_0=-1$." },
  ]);
  const ordre = e.ordreRole;
  const bonne = ordre.indexOf(0);
  return [
    {
      type: "champs",
      titre: TITRES["tangente-point"][0]!,
      consigne: [texte("Lis le centre C de Γ, puis calcule les composantes du vecteur "), latex("\\vec{CP}"), texte(".")],
      champs: champsPoint("CP", cp, faux.x, faux.y, "Lis bien le centre dans l'équation, puis calcule « arrivée moins départ ».").map((c, i) => ({ ...c, libelle: [texte("composante en "), latex(i === 0 ? "x" : "y"), texte(" :")] })),
      aides: [
        [texte("Le cercle d'équation "), latex("(x-x_0)^2+(y-y_0)^2=r^2"), texte(" a pour centre "), latex("(x_0\\,;y_0)"), texte(". Les composantes d'un vecteur se calculent « arrivée moins départ » : "), latex("\\vec{CP}=\\begin{pmatrix}x_P-x_C\\\\y_P-y_C\\end{pmatrix}")],
        [texte("Ici, le centre est "), latex(pointLatex("C", centre)), texte(" et "), latex(pointLatex("P", p)), texte(" : il reste à faire les deux soustractions.")],
      ],
      reponse: [latex(vecteurLatex("CP", cp))],
    },
    {
      type: "choix",
      titre: TITRES["tangente-point"][1]!,
      consigne: [texte("Quel rôle joue le vecteur "), latex("\\vec{CP}"), texte(" pour la tangente à Γ en P ?")],
      options: ordre.map((i) => OPTIONS_ROLE[i]!),
      bonne,
      aides: [
        [texte("Propriété du cours : la tangente à un cercle en un point P est perpendiculaire au rayon [CP].")],
        [texte("Un vecteur directeur a la direction de la droite ; un vecteur normal lui est perpendiculaire. Quelle est la position du rayon [CP] par rapport à la tangente ?")],
      ],
      messageFaux: MESSAGES_ROLE[1]!,
      messagesOptions: ordre.map((i) => MESSAGES_ROLE[i]),
    },
    {
      type: "champs",
      titre: TITRES["tangente-point"][2]!,
      consigne: [texte("Écris une équation cartésienne de la tangente t à Γ au point P.")],
      champs: [
        champDroite(
          "t",
          [latex("t\\equiv")],
          e.tangente,
          [
            { d: droiteDirectrice(p, cp), message: "Tu as pris $\\vec{CP}$ comme vecteur directeur : cette droite est le rayon (CP) prolongé. La tangente est perpendiculaire au rayon, donc $\\vec{CP}$ est un vecteur normal : $a(x-x_P)+b(y-y_P)=0$." },
            { d: droiteNormale(centre, cp), message: "Cette droite passe par le centre C. La tangente passe par le point de contact P : écris $a(x-x_P)+b(y-y_P)=0$." },
          ],
          "Une droite de vecteur normal $\\begin{pmatrix}a\\\\b\\end{pmatrix}$ passant par P a pour équation $a(x-x_P)+b(y-y_P)=0$.",
        ),
      ],
      aides: [
        [texte("Une droite de vecteur normal "), latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}"), texte(" passant par le point "), latex("P(x_P\\,;y_P)"), texte(" a pour équation : "), latex("a(x-x_P)+b(y-y_P)=0")],
        [texte("Ici, le vecteur normal est "), latex(vecteurLatex("CP", cp)), texte(" et la droite passe par "), latex(pointLatex("P", p)), texte(" : remplace, puis développe.")],
      ],
      reponse: [latex(`t\\equiv ${droiteLatex(e.tangente)}`)],
      figureApres: figure(e),
    },
  ];
}

function ecranPied(e: ExercicePositionRelative | ExerciceCercleTangent, titre: string): EcranTSD {
  const { d, centre, h } = e;
  const axiale = d.a === 0 || d.b === 0;
  const champs = champsPoint("H", h, [], [], "Vérifie que ton point H est sur d (il doit vérifier son équation) et que $\\vec{CH}$ est perpendiculaire à d.");
  // Piège : perpendiculaire construite avec un vecteur directeur de d (elle serait parallèle à d) —
  // aucun point ; piège fréquent repérable : C lui-même donné comme pied.
  champs[0]!.pieges.push(...(centre.x !== h.x ? [{ valeur: centre.x, message: "Ce sont les coordonnées de C. H est le pied de la perpendiculaire : il est sur d." }] : []));
  champs[1]!.pieges.push(...(centre.y !== h.y ? [{ valeur: centre.y, message: "Ce sont les coordonnées de C. H est le pied de la perpendiculaire : il est sur d." }] : []));
  return {
    type: "champs",
    titre,
    consigne: [texte("Calcule les coordonnées du pied H de la perpendiculaire à d menée par le centre "), latex(pointLatex("C", centre)), texte(".")],
    champs,
    aides: axiale
      ? [
          [texte("Raccourci du cours : quand d est verticale ("), latex("x=k"), texte(") ou horizontale ("), latex("y=k"), texte("), la perpendiculaire par C est horizontale ou verticale.")],
          [texte("Ici, d est "), texte(d.b === 0 ? "verticale" : "horizontale"), texte(" : H a la même "), texte(d.b === 0 ? "abscisse que d et la même ordonnée que C." : "ordonnée que d et la même abscisse que C.")],
        ]
      : [
          [texte("Méthode du cours (§ 6) : la perpendiculaire à "), latex("d\\equiv ax+by+c=0"), texte(" a pour vecteur directeur le vecteur normal "), latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}"), texte(" de d ; H est l'intersection de cette perpendiculaire et de d.")],
          [texte("Ici, la perpendiculaire par C a pour équations paramétriques "), latex(`\\begin{cases}x=${somme([[centre.x, ""], [d.a, "t"]])}\\\\y=${somme([[centre.y, ""], [d.b, "t"]])}\\end{cases}`), texte(" : remplace x et y dans l'équation de d pour trouver t.")],
        ],
    reponse: [latex(pointLatex("H", h))],
  };
}

function piegesDistance(dist2: number): { valeur: number; message: string }[] {
  return [{ valeur: dist2, message: "C'est $CH^2$ : la distance est la racine carrée, $CH=\\sqrt{(x_H-x_C)^2+(y_H-y_C)^2}$." }];
}

function ecransPosition(e: ExercicePositionRelative): EcranTSD[] {
  const { centre, r2, dist2, position } = e;
  const r = Math.sqrt(r2);
  const F = centre.x * centre.x + centre.y * centre.y - r2;
  const faux = piegesPoint(centre, [{ p: { x: -centre.x, y: -centre.y }, message: "Attention aux signes : $x^2-2ax=(x-a)^2-a^2$, donc le centre a pour abscisse la moitié de l'opposé du coefficient de x." }]);
  const piegesR = [
    { valeur: r2, message: "C'est $r^2$ : le rayon est sa racine carrée." },
    ...(F < 0 ? [{ valeur: Math.sqrt(-F), message: "Tu as oublié les carrés complétés : en complétant, $-a^2$ et $-b^2$ passent aussi dans le second membre." }] : []),
  ];
  const ordre: PositionDroiteCercle[] = ["exterieure", "tangente", "secante"];
  return [
    {
      type: "champs",
      titre: TITRES["position-relative"][0]!,
      consigne: [texte("Complète les carrés : donne le centre C et le rayon r de Γ (valeur exacte).")],
      champs: [...champsPoint("C", centre, faux.x, faux.y, "Regroupe les termes en x et en y, puis complète chaque carré."), champExact("r", [latex("r=")], r, piegesR, "Après avoir complété les carrés, le second membre est $r^2$.")],
      aides: [
        [texte("Regroupe "), latex("x^2+Dx"), texte(" et "), latex("y^2+Ey"), texte(", puis complète chaque carré : "), latex("x^2-2ax=(x-a)^2-a^2"), texte(". On obtient "), latex("(x-a)^2+(y-b)^2=r^2"), texte(".")],
        [texte("Ici, "), latex(`\\Gamma\\equiv ${cercleDeveloppeLatex(centre, r2)}`), texte(" : prends la moitié du coefficient de x et celle du coefficient de y, puis rassemble les constantes à droite.")],
      ],
      reponse: [latex(pointLatex("C", centre)), texte(" et "), latex(`r=${racine(r2)}`)],
    },
    ecranPied(e, TITRES["position-relative"][1]!),
    {
      type: "champs",
      titre: TITRES["position-relative"][2]!,
      consigne: [texte("Calcule la distance CH du centre à la droite d (valeur exacte).")],
      champs: [champExact("CH", [latex("CH=")], Math.sqrt(dist2), piegesDistance(dist2), "La distance CH est la norme du vecteur $\\vec{CH}$.")],
      aides: [
        [texte("La distance de C à d est la longueur CH, norme du vecteur "), latex("\\vec{CH}"), texte(" : "), latex("CH=\\sqrt{(x_H-x_C)^2+(y_H-y_C)^2}")],
        [texte("Ici, "), latex(pointLatex("C", centre)), texte(" et "), latex(pointLatex("H", e.h)), texte(" : calcule les composantes de "), latex("\\vec{CH}"), texte(", puis sa norme.")],
      ],
      reponse: [latex(`CH=${racine(dist2)}`)],
    },
    {
      type: "choix",
      titre: TITRES["position-relative"][3]!,
      consigne: [texte("Compare la distance CH au rayon r : quelle est la position relative de d et de Γ ?")],
      options: ordre.map((p) => [texte(LIBELLES_POSITION[p])]),
      bonne: ordre.indexOf(position),
      aides: [
        [texte("Si la distance du centre à la droite est plus grande que le rayon, la droite passe hors du cercle ; égale, elle le touche en un point ; plus petite, elle le traverse.")],
        [texte("Ici, "), latex(`CH=${racine(dist2)}`), texte(" et "), latex(`r=${racine(r2)}`), texte(" : pour comparer deux racines, compare leurs carrés "), latex("CH^2"), texte(" et "), latex("r^2"), texte(".")],
      ],
      messageFaux: `Compare des grandeurs de même nature : CH et r, ou CH² et r² (ici CH² = ${q(dist2)} et r² = ${q(r2)}), jamais CH² et r.`,
      figure: undefined,
      figureApres: figure(e),
    },
  ];
}

function ecransCercleTangent(e: ExerciceCercleTangent): EcranTSD[] {
  const { centre, r2 } = e;
  const r = Math.sqrt(r2);
  return [
    ecranPied(e, TITRES["cercle-tangent"][0]!),
    {
      type: "champs",
      titre: TITRES["cercle-tangent"][1]!,
      consigne: [texte("Le cercle est tangent à d en H : son rayon est la distance CH. Calcule r (valeur exacte).")],
      champs: [champExact("r", [latex("r=")], r, piegesDistance(r2), "Le rayon est la norme du vecteur $\\vec{CH}$.")],
      aides: [
        [texte("Un cercle de centre C tangent à d touche d au pied H de la perpendiculaire : "), latex("r=CH=\\sqrt{(x_H-x_C)^2+(y_H-y_C)^2}")],
        [texte("Ici, "), latex(pointLatex("C", centre)), texte(" et "), latex(pointLatex("H", e.h)), texte(" : calcule les composantes de "), latex("\\vec{CH}"), texte(", puis sa norme.")],
      ],
      reponse: [latex(`r=${racine(r2)}`)],
    },
    {
      type: "champs",
      titre: TITRES["cercle-tangent"][2]!,
      consigne: [texte("Écris une équation du cercle de centre C et de rayon r.")],
      champs: [
        champCercle(
          "cercle",
          centre,
          r2,
          [
            { centre, r2: r, message: "Au second membre, c'est $r^2$, pas r : $(x-x_0)^2+(y-y_0)^2=r^2$." },
            { centre: { x: -centre.x, y: -centre.y }, r2, message: "Attention aux signes : le cercle de centre $(x_0\\,;y_0)$ a pour équation $(x-x_0)^2+(y-y_0)^2=r^2$ ; pour $x_0=-2$, on écrit $(x+2)^2$." },
          ],
          "Le cercle de centre $(x_0\\,;y_0)$ et de rayon r a pour équation $(x-x_0)^2+(y-y_0)^2=r^2$.",
        ),
      ],
      aides: [
        [texte("Le cercle de centre "), latex("(x_0\\,;y_0)"), texte(" et de rayon r a pour équation "), latex("(x-x_0)^2+(y-y_0)^2=r^2")],
        [texte("Ici, le centre est "), latex(pointLatex("C", centre)), texte(" et "), latex(`r=${racine(r2)}`), texte(" : n'oublie pas d'élever le rayon au carré.")],
      ],
      reponse: [latex(cercleLatex(centre, r2))],
      figureApres: figure(e),
    },
  ];
}

export function ecrans(e: E): EcranTSD[] {
  if (e.variante === "tangente-point") return ecransTangente(e);
  if (e.variante === "position-relative") return ecransPosition(e);
  return ecransCercleTangent(e);
}

export function reponseBreveFragments(e: E): Fragments {
  if (e.variante === "tangente-point") return [texte("Tangente : "), latex(`t\\equiv ${droiteLatex(e.tangente)}`), texte(".")];
  if (e.variante === "position-relative") {
    const signe = e.dist2 > e.r2 ? ">" : e.dist2 < e.r2 ? "<" : "=";
    return [
      latex(`${pointLatex("C", e.centre)},\\ r=${racine(e.r2)}`),
      texte(" ; "),
      latex(`${pointLatex("H", e.h)},\\ CH=${racine(e.dist2)}`),
      texte(" ; "),
      latex(`CH${signe}r`),
      texte(` : ${LIBELLES_POSITION[e.position]}.`),
    ];
  }
  return [latex(`${pointLatex("H", e.h)},\\ r=${racine(e.r2)}`), texte(" ; "), latex(cercleLatex(e.centre, e.r2)), texte(".")];
}

export { colonne, coordonnees };
