import type { ExerciceTrajectoires } from "../core/trajectoiresRencontre.types";
import type { ChampNombre, EcranTSD } from "./ecransTransfertSecondDegre";
import { COULEURS, affineL, colonne, valeurSubst, droitePointDirecteur, etiquette, fenetreAutour, figureRepere, l, n, pointL, t, type Fr, type P } from "./outilsAnalytiqueLotG";

/**
 * Textes, écrans et figure de gen97 « Trajectoires et rencontre » — SOURCE UNIQUE (écran, aides,
 * papier, corrigé). Notation du cours : forme paramétrique « x = x₀ + t·α, y = y₀ + t·β », vecteur
 * directeur en colonne, critère de colinéarité (jamais « déterminant »).
 */

type E = ExerciceTrajectoires;

interface Contexte {
  mobile: string;
  mobiles: string;
  lieu: string;
  distance: string;
  temps: string;
  tempsLong: string;
  collision: string;
}

export const CONTEXTES: Record<string, Contexte> = {
  bateaux: { mobile: "bateau", mobiles: "les deux bateaux", lieu: "Deux bateaux naviguent au large ; on a placé un repère gradué en kilomètres sur la carte.", distance: "km", temps: "h", tempsLong: "heures", collision: "entrer en collision" },
  drones: { mobile: "drone", mobiles: "les deux drones", lieu: "Deux drones volent à la même altitude au-dessus d'un champ muni d'un repère gradué en mètres.", distance: "m", temps: "s", tempsLong: "secondes", collision: "se heurter" },
  joueurs: { mobile: "joueur", mobiles: "les deux joueurs", lieu: "Deux joueurs courent en ligne droite sur un terrain muni d'un repère gradué en mètres.", distance: "m", temps: "s", tempsLong: "secondes", collision: "se percuter" },
};

export const ctx = (e: E) => CONTEXTES[e.contexte]!;

export const NATURES = ["secantes", "paralleles", "confondues"] as const;
export const OPTIONS_VERDICT = ["collision", "croisement", "paralleles"] as const;

export function critere(e: E): number {
  return e.v1.x * e.v2.y - e.v1.y * e.v2.x;
}

export function positionL(P0: P, v: P, param = "t"): string {
  return `\\begin{cases}x=${affineL(P0.x, v.x, param)}\\\\y=${affineL(P0.y, v.y, param)}\\end{cases}`;
}

/** Point du mobile à un instant donné. */
export function positionEn(P0: P, v: P, tt: number): P {
  return { x: P0.x + v.x * tt, y: P0.y + v.y * tt };
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export function enonceFragments(e: E): Fr {
  const c = ctx(e);
  return [
    t(`${c.lieu} À l'instant t (en ${c.tempsLong}), le ${c.mobile} 1 est au point de coordonnées `),
    l(positionL(e.P1, e.v1)),
    t(` et le ${c.mobile} 2 au point de coordonnées `),
    l(positionL(e.P2, e.v2)),
    t("."),
  ];
}

export function questionPapier(e: E): Fr {
  const c = ctx(e);
  return [
    t(`${c.mobiles.charAt(0).toUpperCase()}${c.mobiles.slice(1)} risquent-ils ${/^[aeiouéè]/.test(c.collision) ? "d'" : "de "}${c.collision} ? Justifie. S'il y a collision, donne l'instant et le lieu ; si leurs trajectoires se croisent sans qu'ils se rencontrent, donne le point de croisement et l'écart de temps entre leurs deux passages.`),
  ];
}

export const CONSIGNE_GENERALE = "Compare les vecteurs directeurs des trajectoires, cherche leur point commun avec deux instants t₁ et t₂, puis décide s'il y a collision.";

export const TITRES = ["Les trajectoires", "Les instants t₁ et t₂", "Le point commun K", "Collision ?", "En contexte"];

function libelleNature(id: (typeof NATURES)[number]): Fr {
  if (id === "secantes") return [t("Sécantes : les vecteurs directeurs ne sont pas colinéaires (critère de colinéarité non nul).")];
  if (id === "paralleles") return [t("Parallèles distinctes : vecteurs directeurs colinéaires, et le départ du mobile 2 n'est pas sur la trajectoire du mobile 1.")];
  return [t("Confondues : vecteurs directeurs colinéaires, et le départ du mobile 2 est sur la trajectoire du mobile 1.")];
}

export function natureAttendue(e: E): (typeof NATURES)[number] {
  return e.verdict === "paralleles" ? "paralleles" : "secantes";
}

export function libelleVerdict(e: E, id: (typeof OPTIONS_VERDICT)[number]): Fr {
  const c = ctx(e);
  if (id === "collision") return [t(`Collision : ${c.mobiles} sont au point commun K au même instant.`)];
  if (id === "croisement") return [t(`Pas de collision : les trajectoires se croisent en K, mais ${c.mobiles} n'y passent pas au même instant.`)];
  return [t(`Pas de collision : les trajectoires sont parallèles, elles ne se croisent jamais.`)];
}

export function consigneE(e: E): Fr {
  const c = ctx(e);
  return e.verdict === "collision"
    ? [t(`À quel instant la collision a-t-elle lieu ? Donne t en ${c.tempsLong}.`)]
    : [t(`Quel écart de temps sépare les passages des deux ${c.mobile}s au point K ? Donne-le en ${c.tempsLong}.`)];
}

export function consignesEcrans(e: E): Fr[] {
  const c = ctx(e);
  const base: Fr[] = [[t("Les deux trajectoires sont-elles sécantes, parallèles distinctes ou confondues ?")]];
  if (e.verdict !== "paralleles") {
    base.push(
      [t(`Le point commun K des trajectoires est atteint à l'instant `), l("t_1"), t(` par le ${c.mobile} 1 et à l'instant `), l("t_2"), t(` par le ${c.mobile} 2. Calcule `), l("t_1"), t(" et "), l("t_2"), t(".")],
      [t("Calcule les coordonnées du point commun "), l("K"), t(" des deux trajectoires.")],
    );
  }
  base.push([t(`${c.mobiles.charAt(0).toUpperCase()}${c.mobiles.slice(1)} vont-ils ${c.collision} ?`)]);
  if (e.verdict !== "paralleles") base.push(consigneE(e));
  return base;
}

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export function reponseNature(e: E): Fr {
  return libelleNature(natureAttendue(e));
}
export function reponseInstants(e: E): Fr {
  const u = ctx(e).temps;
  return [l(`t_1=${n(e.t1!)}\\ \\text{${u}}`), t(" et "), l(`t_2=${n(e.t2!)}\\ \\text{${u}}`)];
}
export const reponseK = (e: E): Fr => [l(pointL("K", e.K!))];
export const reponseVerdict = (e: E): Fr => libelleVerdict(e, e.verdict);
export function valeurE(e: E): number {
  return e.verdict === "collision" ? e.t1! : Math.abs(e.t1! - e.t2!);
}
export function reponseE(e: E): Fr {
  const u = ctx(e).temps;
  return e.verdict === "collision" ? [l(`t=${n(e.t1!)}\\ \\text{${u}}`)] : [l(`|t_1-t_2|=${n(valeurE(e))}\\ \\text{${u}}`)];
}

// ---------------------------------------------------------------------------------------------
// Figure du corrigé (trajectoires, départs, point commun)
// ---------------------------------------------------------------------------------------------

export function figureCorrige(e: E): string {
  const pts = [e.P1, e.P2, { x: 0, y: 0 }];
  if (e.K) pts.push(e.K);
  const f = fenetreAutour(pts, 2);
  const etendue = Math.max(f.xMax - f.xMin, f.yMax - f.yMin);
  const unite = etendue > 30 ? 9 : etendue > 20 ? 12 : etendue > 14 ? 16 : 20;
  const c = ctx(e);
  const points = [
    { P: e.P1, label: `départ 1`, position: "ne" as "ne" | "se", couleur: COULEURS.accent },
    { P: e.P2, label: `départ 2`, position: "ne" as const, couleur: COULEURS.bleu },
  ];
  if (e.K) points.push({ P: e.K, label: etiquette("K", e.K), position: "se" as const, couleur: COULEURS.noir });
  void c;
  return figureRepere({
    fenetre: f,
    unite,
    droites: [
      { d: droitePointDirecteur(e.P1, e.v1), couleur: COULEURS.accent, epaisseur: 1.6 },
      { d: droitePointDirecteur(e.P2, e.v2), couleur: COULEURS.bleu, epaisseur: 1.6 },
    ],
    segments: [
      { A: e.P1, B: positionEn(e.P1, e.v1, 1), couleur: COULEURS.accent, fleche: true, epaisseur: 2.4 },
      { A: e.P2, B: positionEn(e.P2, e.v2, 1), couleur: COULEURS.bleu, fleche: true, epaisseur: 2.4 },
    ],
    points,
  });
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

const MESSAGES_NATURE: Record<string, string> = {
  secantes: "Calcule le critère de colinéarité des deux vecteurs directeurs (les coefficients de t) : il est nul, les trajectoires ne sont pas sécantes.",
  paralleles: "Le critère de colinéarité des vecteurs directeurs n'est pas nul : les trajectoires ne sont pas parallèles.",
  confondues: "Les trajectoires ne sont pas confondues : vérifie si le départ du mobile 2 est sur la trajectoire du mobile 1.",
};

function champTemps(id: string, nom: string, cible: number, pieges: { valeur: number; message: string }[], unite: string, messageSiFaux: string): ChampNombre {
  return {
    type: "nombre",
    id,
    libelle: [l(`${nom}=`)],
    unite,
    cible,
    pieges: pieges.filter((p, i, tab) => Number.isFinite(p.valeur) && Math.abs(p.valeur - cible) > 1e-9 && tab.findIndex((q) => Math.abs(q.valeur - p.valeur) < 1e-9) === i),
    messageSiFaux,
  };
}

export function ecrans(e: E): EcranTSD[] {
  const c = ctx(e);
  const u = c.temps;
  const options = NATURES.map((id) => libelleNature(id));
  const bonneNature = NATURES.indexOf(natureAttendue(e));
  const liste: EcranTSD[] = [
    {
      type: "choix",
      titre: TITRES[0]!,
      consigne: consignesEcrans(e)[0]!,
      options,
      bonne: bonneNature,
      aides: [
        [t("Les vecteurs directeurs des trajectoires sont les coefficients de "), l("t"), t(". Deux vecteurs "), l(colonne("x_1", "y_1")), t(" et "), l(colonne("x_2", "y_2")), t(" sont colinéaires si, et seulement si, "), l("x_1\\cdot y_2-y_1\\cdot x_2=0"), t(" (critère de colinéarité).")],
        [t("Ici : "), l(`\\vec{v_1}=${colonne(e.v1.x, e.v1.y)}`), t(" et "), l(`\\vec{v_2}=${colonne(e.v2.x, e.v2.y)}`), t(". Calcule le critère ; s'il est nul, regarde si le départ du mobile 2 est sur la trajectoire du mobile 1.")],
      ],
      messageFaux: "Ce n'était pas la bonne réponse.",
      messagesOptions: NATURES.map((id) => (id === natureAttendue(e) ? undefined : MESSAGES_NATURE[id])),
    },
  ];
  if (e.verdict !== "paralleles") {
    const memeT = "Tu as donné le même instant aux deux mobiles : ils ne passent pas forcément en K au même moment. Écris le système avec deux inconnues $t_1$ et $t_2$.";
    const inverses = "Tes instants semblent inversés : $t_1$ est l'instant du mobile 1, $t_2$ celui du mobile 2.";
    liste.push(
      {
        type: "champs",
        titre: TITRES[1]!,
        consigne: consignesEcrans(e)[1]!,
        champs: [
          champTemps("t1", "t_1", e.t1!, [{ valeur: e.t2!, message: e.verdict === "croisement" ? `${inverses} ${memeT}` : inverses }], u, "Pose $x$ du mobile 1 en $t_1$ égal à $x$ du mobile 2 en $t_2$, même chose pour $y$ : un système de deux équations à deux inconnues."),
          champTemps("t2", "t_2", e.t2!, [{ valeur: e.t1!, message: e.verdict === "croisement" ? `${inverses} ${memeT}` : inverses }], u, "Une fois $t_1$ trouvé, remplace-le dans l'une des deux équations pour obtenir $t_2$."),
        ],
        aides: [
          [t("Au point commun, les deux mobiles ont les mêmes coordonnées, mais pas forcément au même instant : écris "), l("x_1(t_1)=x_2(t_2)"), t(" et "), l("y_1(t_1)=y_2(t_2)"), t(", avec deux inconnues.")],
          [t("Ici : "), l(`\\begin{cases}${affineL(e.P1.x, e.v1.x, "t_1")}=${affineL(e.P2.x, e.v2.x, "t_2")}\\\\${affineL(e.P1.y, e.v1.y, "t_1")}=${affineL(e.P2.y, e.v2.y, "t_2")}\\end{cases}`), t(" ; résous ce système par combinaison ou par substitution.")],
        ],
        reponse: reponseInstants(e),
      },
      {
        type: "champs",
        titre: TITRES[2]!,
        consigne: consignesEcrans(e)[2]!,
        champs: (["x", "y"] as const).map(
          (k): ChampNombre => ({
            type: "nombre",
            id: `${k}K`,
            libelle: [l(`${k}_K=`)],
            unite: c.distance,
            cible: e.K![k],
            pieges: [
              { valeur: positionEn(e.P1, e.v1, e.t2!)[k], message: "Tu as remplacé $t_2$ dans les équations du mobile 1 : chaque mobile avec son propre instant." },
              { valeur: positionEn(e.P2, e.v2, e.t1!)[k], message: "Tu as remplacé $t_1$ dans les équations du mobile 2 : chaque mobile avec son propre instant." },
            ].filter((p, i, tab) => Math.abs(p.valeur - e.K![k]) > 1e-9 && tab.findIndex((q) => Math.abs(q.valeur - p.valeur) < 1e-9) === i),
            messageSiFaux: "Remplace $t_1$ dans les équations du mobile 1 (ou $t_2$ dans celles du mobile 2).",
          }),
        ),
        aides: [
          [t("K est la position du mobile 1 à l'instant "), l("t_1"), t(" (et aussi celle du mobile 2 à l'instant "), l("t_2"), t(").")],
          [t("Ici : "), l(`x_K=${valeurSubst(e.P1.x, e.v1.x, e.t1!)}`), t(" ; même chose pour "), l("y_K"), t(".")],
        ],
        reponse: reponseK(e),
      },
    );
  }
  const optionsVerdict = OPTIONS_VERDICT.map((id) => libelleVerdict(e, id));
  liste.push({
    type: "choix",
    titre: TITRES[3]!,
    consigne: consignesEcrans(e)[e.verdict === "paralleles" ? 1 : 3]!,
    options: optionsVerdict,
    bonne: OPTIONS_VERDICT.indexOf(e.verdict),
    aides: [
      [t("Il y a collision seulement si les deux mobiles sont au même endroit au même instant : il faut un point commun ET "), l("t_1=t_2"), t(".")],
      e.verdict === "paralleles" ? [t("Reprends la réponse du premier écran : des trajectoires parallèles distinctes n'ont aucun point commun.")] : [t("Compare les deux instants trouvés : "), l(`t_1=${n(e.t1!)}`), t(" et "), l(`t_2=${n(e.t2!)}`), t(".")],
    ],
    messageFaux: "Ce n'était pas la bonne conclusion.",
    messagesOptions: OPTIONS_VERDICT.map((id) =>
      id === e.verdict
        ? undefined
        : id === "collision"
          ? "Une collision demande le même point au même instant : ici ce n'est pas le cas."
          : id === "croisement"
            ? e.verdict === "paralleles"
              ? "Des trajectoires parallèles ne se croisent pas."
              : "Les deux instants sont égaux : les mobiles sont en K en même temps."
            : "Les trajectoires ne sont pas parallèles : elles ont un point commun K.",
    ),
    figureApres: figureCorrige(e),
  });
  if (e.verdict !== "paralleles") {
    const v = valeurE(e);
    liste.push({
      type: "champs",
      titre: TITRES[4]!,
      consigne: consignesEcrans(e)[4]!,
      champs: [
        e.verdict === "collision"
          ? champTemps("t", "t", v, [], u, "La collision a lieu à l'instant commun $t_1=t_2$.")
          : champTemps("ecart", "|t_1-t_2|", v, [{ valeur: -v, message: "Un écart de temps est positif : prends la différence du plus grand et du plus petit instant." }, { valeur: e.t1!, message: "C'est l'instant du mobile 1 : il faut l'écart entre les deux instants." }, { valeur: e.t2!, message: "C'est l'instant du mobile 2 : il faut l'écart entre les deux instants." }], u, "L'écart de temps est la différence entre les deux instants de passage en K."),
      ],
      aides:
        e.verdict === "collision"
          ? [[t("La collision a lieu au point K, à l'instant où les deux mobiles y sont ensemble.")], [t("Ici, "), l("t_1=t_2"), t(" : c'est l'instant de la collision.")]]
          : [[t("Les deux mobiles passent en K à des instants différents : l'écart est la différence des deux instants, en valeur positive.")], [t("Ici : "), l(`|t_1-t_2|=|${n(e.t1!)}-${n(e.t2!)}|`), t(".")]],
      reponse: reponseE(e),
    });
  }
  return liste;
}
