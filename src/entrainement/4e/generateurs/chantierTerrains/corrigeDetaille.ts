import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { Affine, ExerciceChantierTerrains } from "../../core/chantierTerrains.types";
import { angleDegres, demiVecteur, equationPiquet, lettreInconnue, point, valeurCritere, valeurInconnue, vecteursUtiles } from "../../moteur/modeleChantierTerrains";
import { figureChantierSvg } from "../../ui/figureChantierTerrains";
import { EGALITE_ENCLOS, affineLatex, colonneLatex, contexte, ecrans, equationLatex, indicePhraseJuste, nombreLatex, phrasesConclusion, pointLatex, vecLatex, vecteurAvecComposantesLatex } from "../../ui/formatChantierTerrains";
import { COURS_COLINEARITE, COURS_COMPOSANTES, COURS_MILIEU, COURS_MULTIPLE_REPERE, COURS_ORTHOGONALITE, COURS_VECTEUR, finaliserVecteurs } from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen88 « Chantier et terrains » — règle
 * `.claude/rules/feuilles-evaluations.md`. Quatre ÉCRANS : a) l'outil vectoriel caché derrière les mots
 * du chantier, b) les composantes des vecteurs utiles (plan annoté en figure), c) le critère (critère
 * de colinéarité, produit scalaire), le demi-vecteur, l'égalité de vecteurs ou l'équation du piquet,
 * d) la réponse dans le contexte. Partagé par l'adaptateur papier et l'appli. Mêmes fonctions que
 * l'écran (`vecteursUtiles`, `equationLatex`, `phrasesConclusion`).
 */

type E = ExerciceChantierTerrains;

function np(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

/** Composante dans un produit : parenthèses autour d'une expression en lettre ou d'un négatif. */
function terme(a: Affine, lettre: string | null): string {
  return a.coef !== 0 && lettre ? `(${affineLatex(a, lettre).replace(/ /g, "")})` : np(a.cst);
}

const COURS_OUTIL: Record<E["situation"], string> = {
  alignement: COURS_COLINEARITE,
  equerre: COURS_ORTHOGONALITE,
  paralleles: COURS_COLINEARITE,
  milieu: COURS_MILIEU,
  enclos: COURS_VECTEUR,
  piquet: COURS_COLINEARITE,
};

function etapesOutil(e: E): EtapeCorrection[] {
  const ec = ecrans(e)[0]!;
  const choix = ec.type === "choix" ? ec.options[ec.bonne]! : [];
  const nom = e.cherche?.nom ?? "M";
  const relation: Record<E["situation"], [string, string]> = {
    alignement: ["\\text{A, B, C alignés}\\iff\\vec{AC}=k\\,\\vec{AB}", "même direction : vecteurs colinéaires"],
    equerre: ["\\text{angle droit en A}\\iff\\vec{AB}\\cdot\\vec{AC}=0", "vecteurs orthogonaux : produit scalaire nul"],
    paralleles: ["(AB)\\parallel(CD)\\iff\\vec{CD}=k\\,\\vec{AB}", "vecteurs directeurs colinéaires"],
    milieu: [`\\text{${nom} milieu de [AB]}\\iff\\vec{A${nom}}=\\frac{1}{2}\\,\\vec{AB}`, "« à mi-chemin » sur un chemin droit"],
    enclos: [`\\text{ABCD parallélogramme}\\iff ${EGALITE_ENCLOS.replace(/ /g, "")}`, "côtés opposés égaux, même sens"],
    piquet: ["\\text{A, B, P alignés}\\iff\\vec{AP}=k\\,\\vec{AB}", "AB et AP colinéaires"],
  };
  const [rel, just] = relation[e.situation];
  return [
    utilise("a", [texte(`On traduit le mot du chantier en relation entre vecteurs ${COURS_OUTIL[e.situation]}.`)]),
    calcul("a", [ligne(rel, just)]),
    resultat("a", [texte("Outil : "), ...choix, texte(".")]),
  ];
}

function lignesComposantesUtiles(e: E): LigneCalcul[] {
  const lettre = lettreInconnue(e);
  return vecteursUtiles(e).flatMap((v) => {
    const p = point(e, v.origine);
    const q =
      v.extremite === "P" && e.ligne
        ? { x: e.ligne.axe === "x" ? nombreLatex(e.ligne.valeur) : lettre!, y: e.ligne.axe === "y" ? nombreLatex(e.ligne.valeur) : lettre! }
        : { x: nombreLatex(point(e, v.extremite).x), y: nombreLatex(point(e, v.extremite).y) };
    return [
      ligne(`${vecLatex(v.origine, v.extremite)}=${colonneLatex(`${q.x}-${np(p.x)}`, `${q.y}-${np(p.y)}`)}`, v.extremite === "P" ? `composantes : extrémité − origine, la coordonnée inconnue de P reste ${lettre}` : "composantes : extrémité − origine"),
      ligne(`=${colonneLatex(affineLatex(v.x, lettre).replace(/ /g, ""), affineLatex(v.y, lettre).replace(/ /g, ""))}`),
    ];
  });
}

function etapesVecteurs(e: E): EtapeCorrection[] {
  const lettre = lettreInconnue(e);
  const res: FragmentConsigne[] = vecteursUtiles(e).flatMap((v, i) => [...(i > 0 ? [texte(" et ")] : []), latex(vecteurAvecComposantesLatex(v, lettre))]);
  return [
    utilise("b", [texte(`Composantes d'un vecteur : extrémité moins origine ${COURS_COMPOSANTES}, `), latex("\\vec{AB}\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}"), texte(".")]),
    calcul("b", lignesComposantesUtiles(e)),
    { ...resultat("b", res), figureHtml: figureChantierSvg(e, true) },
  ];
}

function lignesCritere(e: E): LigneCalcul[] {
  const [u, v] = vecteursUtiles(e);
  const nu = `${u!.origine}${u!.extremite}`;
  const nv = `${v!.origine}${v!.extremite}`;
  const val = valeurCritere(e);
  if (e.situation === "equerre") {
    const p1 = u!.x.cst * v!.x.cst;
    const p2 = u!.y.cst * v!.y.cst;
    return [
      ligne(`x_{${nu}}\\cdot x_{${nv}}+y_{${nu}}\\cdot y_{${nv}}=${np(u!.x.cst)}\\cdot ${np(v!.x.cst)}+${np(u!.y.cst)}\\cdot ${np(v!.y.cst)}`, "produit scalaire"),
      ligne(`=${nombreLatex(p1)}+${np(p2)}`, "on calcule les produits"),
      ligne(`=${nombreLatex(val)}`, val === 0 ? "nul : angle droit en A" : "non nul : pas d'angle droit"),
    ];
  }
  const p1 = u!.x.cst * v!.y.cst;
  const p2 = u!.y.cst * v!.x.cst;
  return [
    ligne(`x_{${nu}}\\cdot y_{${nv}}-y_{${nu}}\\cdot x_{${nv}}=${np(u!.x.cst)}\\cdot ${np(v!.y.cst)}-${np(u!.y.cst)}\\cdot ${np(v!.x.cst)}`, "critère de colinéarité"),
    ligne(`=${nombreLatex(p1)}-${np(p2)}`, "on calcule les produits"),
    ligne(`=${nombreLatex(val)}`, val === 0 ? "nul : vecteurs colinéaires" : "non nul : vecteurs non colinéaires"),
  ];
}

function etapesCritere(e: E): EtapeCorrection[] {
  const [u, v] = vecteursUtiles(e);
  switch (e.situation) {
    case "milieu": {
      const nom = e.cherche!.nom;
      const am = demiVecteur(e);
      return [
        utilise("c", [texte(`${nom} milieu de [AB] : `), latex(`\\vec{A${nom}}=\\frac{1}{2}\\,\\vec{AB}`), texte(` ${COURS_MILIEU} ; multiplier un vecteur par un réel multiplie chaque composante ${COURS_MULTIPLE_REPERE}.`)]),
        calcul("c", [
          ligne(`\\vec{A${nom}}=\\frac{1}{2}\\,\\vec{AB}`, "milieu"),
          ligne(`=${colonneLatex(`\\frac{1}{2}\\cdot ${np(u!.x.cst)}`, `\\frac{1}{2}\\cdot ${np(u!.y.cst)}`)}`, "composantes de l'étape b"),
          ligne(`=${colonneLatex(nombreLatex(am.x), nombreLatex(am.y))}`),
        ]),
        resultat("c", [latex(`\\vec{A${nom}}${colonneLatex(nombreLatex(am.x), nombreLatex(am.y))}`)]),
      ];
    }
    case "enclos": {
      const c = point(e, "C");
      return [
        utilise("c", [texte("ABCD est un parallélogramme si et seulement si "), latex(EGALITE_ENCLOS), texte(` : côtés opposés [AB] et [DC], parcourus dans le même sens ${COURS_VECTEUR}.`)]),
        calcul("c", [
          ligne(EGALITE_ENCLOS.replace(/ /g, ""), "ordre des sommets : A vers B, D vers C"),
          ligne(`\\vec{DC}=${colonneLatex(`${nombreLatex(c.x)}-x_D`, `${nombreLatex(c.y)}-y_D`)}`, "composantes de DC, avec D inconnu"),
        ]),
        resultat("c", [latex(EGALITE_ENCLOS)]),
      ];
    }
    case "piquet": {
      const lettre = lettreInconnue(e)!;
      const eq = equationPiquet(e);
      const a = u!.x.cst;
      const b = u!.y.cst;
      // critère : x_AB · y_AP − y_AB · x_AP (un seul facteur contient la lettre)
      const yAP = v!.y;
      const xAP = v!.x;
      const developpe = (k: number, af: Affine): string => {
        if (af.coef === 0) return nombreLatex(k * af.cst);
        return affineLatex({ coef: k * af.coef, cst: k * af.cst }, lettre).replace(/ /g, "");
      };
      const d1 = developpe(a, yAP);
      const d2 = developpe(b, xAP);
      const moinsD2 = d2.startsWith("-") ? `+${d2.slice(1).replace(/([+-])/g, (s) => (s === "+" ? "-" : "+"))}` : `-${d2.replace(/([+-])/g, (s) => (s === "+" ? "-" : "+"))}`;
      return [
        utilise("c", [texte("A, B et P alignés : "), latex("\\vec{AB}"), texte(" et "), latex("\\vec{AP}"), texte(" colinéaires, leur critère de colinéarité "), latex("x_{AB}\\cdot y_{AP}-y_{AB}\\cdot x_{AP}"), texte(` est nul ${COURS_COLINEARITE}.`)]),
        calcul("c", [
          ligne(`x_{AB}\\cdot y_{AP}-y_{AB}\\cdot x_{AP}=0`, "A, B, P alignés"),
          ligne(`${np(a)}\\cdot ${terme(yAP, lettre)}-${np(b)}\\cdot ${terme(xAP, lettre)}=0`, "composantes de l'étape b"),
          ligne(`${d1}${moinsD2}=0`, "on distribue"),
          ligne(`${affineLatex(eq, lettre).replace(/ /g, "")}=0`, "on réduit"),
        ]),
        resultat("c", [latex(equationLatex(e))]),
      ];
    }
    default: {
      const nu = vecLatex(u!.origine, u!.extremite);
      const nv = vecLatex(v!.origine, v!.extremite);
      const val = valeurCritere(e);
      const ortho = e.situation === "equerre";
      return [
        utilise("c", ortho
          ? [texte("Deux vecteurs sont orthogonaux si et seulement si leur produit scalaire "), latex("x_u\\cdot x_v+y_u\\cdot y_v"), texte(` est nul ${COURS_ORTHOGONALITE}.`)]
          : [texte("Deux vecteurs sont colinéaires si et seulement si leur critère de colinéarité "), latex("x_u\\cdot y_v-y_u\\cdot x_v"), texte(` est nul ${COURS_COLINEARITE}.`)]),
        calcul("c", lignesCritere(e)),
        resultat("c", [texte(ortho ? "Produit scalaire de " : "Critère de colinéarité de "), latex(nu), texte(" et "), latex(nv), texte(" : "), latex(val === 0 ? "0" : `${nombreLatex(val)} \\neq 0`), texte(".")]),
      ];
    }
  }
}

function etapesReponse(e: E): EtapeCorrection[] {
  const sujet = contexte(e).sujet;
  const Sujet = sujet.charAt(0).toUpperCase() + sujet.slice(1);
  if (e.verdict !== null) {
    const val = valeurCritere(e);
    const ortho = e.situation === "equerre";
    const [u, v] = vecteursUtiles(e);
    const nu = `${u!.origine}${u!.extremite}`;
    const nv = `${v!.origine}${v!.extremite}`;
    const formule = ortho ? `x_{${nu}}\\cdot x_{${nv}}+y_{${nu}}\\cdot y_{${nv}}` : `x_{${nu}}\\cdot y_{${nv}}-y_{${nu}}\\cdot x_{${nv}}`;
    return [
      utilise("d", [texte(`Le critère est une égalité EXACTE : seul un ${ortho ? "produit scalaire" : "critère de colinéarité"} égal à 0 permet de répondre « oui » ; un résultat non nul, même petit, veut dire « non ». L'aspect du plan ne prouve rien.`)]),
      calcul("d", val === 0 ? [ligne(`${formule}=0`, "étape c : le critère est nul")] : [ligne(`${formule}=${nombreLatex(val)}`, "étape c"), ligne(`${nombreLatex(val)}\\neq 0`, "le critère n'est pas nul")]),
      resultat("d", phrasesConclusion(e)[indicePhraseJuste(e)]!),
    ];
  }
  const c = e.cherche!;
  const a = point(e, "A");
  if (e.situation === "milieu") {
    const am = demiVecteur(e);
    const b = point(e, "B");
    return [
      utilise("d", [texte(`${c.nom} est le translaté de A par `), latex(`\\vec{A${c.nom}}`), texte(` : `), latex(`x_${c.nom}=x_A+x_{A${c.nom}}`), texte(` ${COURS_MILIEU}.`)]),
      calcul("d", [
        ligne(`x_${c.nom}=x_A+x_{A${c.nom}}`, "translation"),
        ligne(`=${nombreLatex(a.x)}+${np(am.x)}`),
        ligne(`=${nombreLatex(c.x)}`),
        ligne(`y_${c.nom}=y_A+y_{A${c.nom}}`),
        ligne(`=${nombreLatex(a.y)}+${np(am.y)}`),
        ligne(`=${nombreLatex(c.y)}`),
      ]),
      resultat("d", [texte(`${Sujet} se trouve en `), latex(pointLatex(c)), texte(".")]),
      verification("d", [texte("Le milieu a pour coordonnées les moyennes de celles de A et B : ")], [
        ligne(`\\frac{x_A+x_B}{2}=\\frac{${nombreLatex(a.x)}+${np(b.x)}}{2}`, "moyenne des abscisses"),
        ligne(`=${nombreLatex(c.x)}`),
      ]),
    ];
  }
  if (e.situation === "enclos") {
    const pc = point(e, "C");
    const [ab] = vecteursUtiles(e);
    return [
      utilise("d", [texte("Deux vecteurs égaux ont les mêmes composantes : "), latex("x_C-x_D=x_{AB}"), texte(" et "), latex("y_C-y_D=y_{AB}"), texte(` ${COURS_COMPOSANTES}.`)]),
      calcul("d", [
        ligne(`${nombreLatex(pc.x)}-x_D=${nombreLatex(ab!.x.cst)}`, "premières composantes égales"),
        ligne(`x_D=${nombreLatex(pc.x)}-${np(ab!.x.cst)}`, "on isole l'abscisse de D"),
        ligne(`=${nombreLatex(c.x)}`),
        ligne(`${nombreLatex(pc.y)}-y_D=${nombreLatex(ab!.y.cst)}`, "secondes composantes égales"),
        ligne(`y_D=${nombreLatex(pc.y)}-${np(ab!.y.cst)}`, "on isole l'ordonnée de D"),
        ligne(`=${nombreLatex(c.y)}`),
      ]),
      resultat("d", [texte(`${Sujet} : `), latex(pointLatex(c)), texte(".")]),
      verification("d", [texte("On recalcule "), latex("\\vec{DC}"), texte(" : on retrouve "), latex("\\vec{AB}"), texte(".")], [
        ligne(`\\vec{DC}=${colonneLatex(`${nombreLatex(pc.x)}-${np(c.x)}`, `${nombreLatex(pc.y)}-${np(c.y)}`)}`, "composantes : extrémité − origine"),
        ligne(`=${colonneLatex(nombreLatex(ab!.x.cst), nombreLatex(ab!.y.cst))}`),
      ]),
    ];
  }
  const lettre = lettreInconnue(e)!;
  const eq = equationPiquet(e);
  const val = valeurInconnue(e);
  const [u, v] = vecteursUtiles(e);
  const ap = { x: v!.x.coef * val + v!.x.cst, y: v!.y.coef * val + v!.y.cst };
  const lignes: LigneCalcul[] = [ligne(`${affineLatex(eq, lettre).replace(/ /g, "")}=0`, "équation de l'étape c")];
  const coefL = `${eq.coef === 1 ? "" : eq.coef === -1 ? "-" : nombreLatex(eq.coef)}${lettre}`;
  if (eq.cst !== 0) lignes.push(ligne(`${coefL}=${nombreLatex(-eq.cst)}`, eq.cst > 0 ? `on retire ${nombreLatex(eq.cst)} aux deux membres` : `on ajoute ${nombreLatex(-eq.cst)} aux deux membres`));
  if (eq.coef !== 1) lignes.push(ligne(`${lettre}=\\dfrac{${nombreLatex(-eq.cst)}}{${nombreLatex(eq.coef)}}`, `on divise par ${nombreLatex(eq.coef).replace("-", "−")}`), ligne(`=${nombreLatex(val)}`));
  return [
    utilise("d", [texte(`Équation du premier degré : on isole ${lettre}.`)]),
    calcul("d", lignes),
    resultat("d", [texte(`Il faut planter ${sujet} en `), latex(pointLatex(c)), texte(".")]),
    verification("d", [texte("Avec cette valeur, "), latex("\\vec{AP}"), texte(" est colinéaire à "), latex("\\vec{AB}"), texte(" : ")], [
      ligne(`x_{AB}\\cdot y_{AP}-y_{AB}\\cdot x_{AP}=${np(u!.x.cst)}\\cdot ${np(ap.y)}-${np(u!.y.cst)}\\cdot ${np(ap.x)}`, [texte("critère de colinéarité, "), latex(`\\vec{AP}${colonneLatex(nombreLatex(ap.x), nombreLatex(ap.y))}`)]),
      ligne(`=${nombreLatex(u!.x.cst * ap.y)}-${np(u!.y.cst * ap.x)}`),
      ligne("=0", "nul : A, B et P sont alignés"),
    ]),
  ];
}

function arrondi1(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

function lignePiege(e: E): EtapeCorrection {
  const [u, v] = vecteursUtiles(e);
  const nu = vecLatex(u!.origine, u!.extremite);
  switch (e.situation) {
    case "alignement":
    case "paralleles": {
      if (!e.verdict) {
        const ang = angleDegres({ x: u!.x.cst, y: u!.y.cst }, { x: v!.x.cst, y: v!.y.cst });
        const ecart = Math.min(ang, 180 - ang);
        return piege("d", [texte(`Sur le plan, l'écart ne se voit presque pas (environ ${arrondi1(ecart)}°) : seul le calcul tranche. Un critère de colinéarité non nul, même petit, veut dire « non ».`)]);
      }
      const g = pgcd(v!.x.cst, u!.x.cst) || 1;
      const num = Math.abs(v!.x.cst) / g;
      const den = Math.abs(u!.x.cst) / g;
      const negatif = v!.x.cst * u!.x.cst < 0;
      const kLatex = den === 1 ? (num === 1 ? (negatif ? "-" : "") : nombreLatex((negatif ? -1 : 1) * num)) : `${negatif ? "-" : ""}\\frac{${num}}{${den}}`;
      return piege("d", [texte("Colinéaires ne veut pas dire égaux : "), latex(`${vecLatex(v!.origine, v!.extremite)} = ${kLatex}\\,${nu}`), texte(e.situation === "paralleles" ? " — la longueur des deux tronçons ne compte pas, seule la direction compte." : " — les composantes sont proportionnelles, pas identiques.")]);
    }
    case "equerre": {
      const angle = angleDegres({ x: u!.x.cst, y: u!.y.cst }, { x: v!.x.cst, y: v!.y.cst });
      return piege("c", [
        texte("Pour un angle droit, c'est le produit scalaire "),
        latex("x_u \\cdot x_v + y_u \\cdot y_v"),
        texte(" — pas le critère de colinéarité, qui teste la colinéarité."),
        ...(e.verdict ? [] : [texte(` Ici, l'angle en A mesure environ ${arrondi1(angle)}° : à l'œil, impossible de le distinguer d'un angle droit.`)]),
      ]);
    }
    case "milieu": {
      return piege("d", [texte("Ne pas s'arrêter aux composantes de "), latex(vecLatex("A", e.cherche!.nom)), texte(" : ce sont celles d'un déplacement, pas les coordonnées du point.")]);
    }
    case "enclos": {
      const c = point(e, "C");
      return piege("c", [texte("L'ordre des lettres compte : "), latex(`${vecLatex("A", "B")} = ${vecLatex("C", "D")}`), texte(" donnerait "), latex(pointLatex({ nom: "D", x: c.x + u!.x.cst, y: c.y + u!.y.cst })), texte(", et ABCD serait un quadrilatère croisé.")]);
    }
    case "piquet": {
      const lettre = lettreInconnue(e)!;
      return piege("b", [texte(`Garder la lettre ${lettre} dans la composante de `), latex(vecLatex("A", "P")), texte(" ("), latex(`${lettre}_{AP} = ${affineLatex(lettre === "y" ? v!.y : v!.x, lettre)}`), texte(") : c'est elle qui donne l'équation.")]);
    }
  }
}

function corrigeBrutChantierTerrains(e: E): EtapeCorrection[] {
  const etapes = [...etapesOutil(e), ...etapesVecteurs(e), ...etapesCritere(e), ...etapesReponse(e)];
  const p = lignePiege(e);
  const fin = etapes.map((x) => x.sousQuestion).lastIndexOf(p.sousQuestion);
  etapes.splice(fin + 1, 0, p);
  return etapes;
}

export function correctionDetailleeChantierTerrains(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutChantierTerrains(e));
}
