import type { ExercicePolygones, ExerciceMesures, ExerciceSommeNulle, ExerciceSommets, PointEntier } from "../core6e/polygonesReguliers.types";
import {
  SIN_2PI_SUR_N,
  SIN_PI_SUR_N,
  affixeLatex,
  aireExacte,
  angleSurLatex,
  anglePasLatex,
  centreEnO,
  complexeExactLatex,
  cosSinPas,
  coteExact,
  nomPolygone,
  perimetreExact,
  radicalLatex,
  radicalLatexParenthese,
  rayonCarre,
  rayonExact,
  sommeSansA,
  sommeSommets,
  sommetExact,
  sommetsAutres,
  vecteurCA,
} from "../moteur6e/modelePolygonesReguliers";
import { graineDepuis, melangerParGraine } from "../moteur6e/saisieComplexe";
import type { PhasePolygones } from "../moteur6e/typesPolygonesReguliers";
import { ID_JUSTE } from "../moteur6e/verificationPolygonesReguliers";
import { l, t } from "./formatLirePlacerPlanComplexe";
import type { AideAvecLatex, FragmentConsigne } from "./formatLirePlacerPlanComplexe";

export { l, t };
export type { AideAvecLatex, FragmentConsigne };

/**
 * Couche ui (6e) — textes, aides, options et réponses attendues de `6gen97` « Polygones réguliers
 * et racines n-ièmes ». Source UNIQUE de ce qu'affichent l'écran, le récapitulatif et l'adaptateur
 * d'export (énoncé papier, corrigé, barème) : les nombres exacts viennent de
 * `moteur6e/modelePolygonesReguliers.ts`, jamais recalculés ici.
 *
 * Écriture : signe « − » (KaTeX), arguments en radians, Re(z)/Im(z) comme dans le cours ; aides =
 * phrase terminée par « : » puis la formule ; une aide ne donne jamais le résultat final.
 */

export interface ChampPolygones {
  label: FragmentConsigne[];
  placeholder: string;
  /** Titre d'un groupe de champs (un sommet) affiché au-dessus du premier champ du groupe. */
  groupe?: FragmentConsigne[];
}

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

// ---------------------------------------------------------------------------------------------
// Écritures communes.
// ---------------------------------------------------------------------------------------------

/** « Z_0Z_1Z_2 », « Z_0Z_1Z_2Z_3 », « Z_0Z_1\cdots Z_{5} ». */
export function nomSommetsLatex(n: number): string {
  if (n <= 4) return Array.from({ length: n }, (_, k) => `Z_${k}`).join("");
  return `Z_0Z_1\\cdots Z_{${n - 1}}`;
}

/** « 1+\omega+\omega^2 », « 1+\omega+\omega^2+\omega^3 », « 1+\omega+\omega^2+\cdots+\omega^{4} ». */
export function sommeOmegaLatex(n: number): string {
  if (n === 3) return "1+\\omega+\\omega^2";
  if (n === 4) return "1+\\omega+\\omega^2+\\omega^3";
  return `1+\\omega+\\omega^2+\\cdots+\\omega^{${n - 1}}`;
}

/** Somme des zₖ, de k = debut à n − 1 : « z_0+z_1+z_2 », « z_1+z_2+\cdots+z_{5} ». */
export function sommeZLatex(n: number, debut: 0 | 1): string {
  const nb = n - debut;
  if (nb <= 3) return Array.from({ length: nb }, (_, i) => `z_${debut + i}`).join("+");
  return `z_${debut}+z_${debut + 1}+\\cdots+z_{${n - 1}}`;
}

function expoPas(n: number): string {
  return `e^{2ik\\pi/${n}}`;
}

export function omegaLatex(n: number): string {
  return `\\omega=e^{2i\\pi/${n}}`;
}

const ORDINAUX: Record<number, string> = { 3: "cubiques", 4: "quatrièmes", 5: "cinquièmes", 6: "sixièmes", 7: "septièmes", 8: "huitièmes" };

/** « Le triangle équilatéral », « L'hexagone régulier ». */
export function leNom(n: number): string {
  const nom = nomPolygone(n);
  return /^[aeiouyh]/.test(nom) ? `L'${nom}` : `Le ${nom}`;
}

function leNomMinuscule(n: number): string {
  const s = leNom(n);
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function par(p: PointEntier): string {
  const tx = affixeLatex(p);
  return p.x === 0 || p.y === 0 ? (tx.startsWith("-") ? `(${tx})` : tx) : `(${tx})`;
}

/** e^{iα} exact en forme algébrique (α = 2kπ/n). */
function expoAlgebrique(n: number, k: number): string {
  const { cos, sin } = cosSinPas(n, k);
  return complexeExactLatex({ re: cos, im: sin });
}

// ---------------------------------------------------------------------------------------------
// Libellés, consignes, champs.
// ---------------------------------------------------------------------------------------------

export const LIBELLE_PHASE: Record<PhasePolygones, string> = {
  formule: "Relation des sommets",
  donnees: "Vecteur et angle",
  sommet1: "Sommet Z₁",
  autresSommets: "Autres sommets",
  rayon: "Rayon",
  cote: "Côté",
  perimetre: "Périmètre",
  aire: "Aire",
  identite: "Somme géométrique",
  conclusion: "Conclusion S = 0",
  somme: "Somme des sommets",
  sansA: "Somme sans A",
};

/** Consigne générale (énoncé) : données de l'exercice, identiques sur tous les écrans. */
export function consigneGenerale(e: ExercicePolygones): FragmentConsigne[] {
  if (e.variante === "sommets") {
    return [
      t(`${leNom(e.n)} `),
      l(nomSommetsLatex(e.n)),
      t(" a pour centre le point C d'affixe "),
      l(`c=${affixeLatex(e.c)}`),
      t(" et pour sommet "),
      l("Z_0"),
      t(" le point A d'affixe "),
      l(`a=${affixeLatex(e.a)}`),
      t(". Ses sommets sont numérotés dans le sens trigonométrique (sens contraire des aiguilles d'une montre)."),
    ];
  }
  if (e.variante === "mesures") {
    return [
      t(`${leNom(e.n)} `),
      l(nomSommetsLatex(e.n)),
      t(" a pour centre O ; son sommet "),
      l("Z_0"),
      t(" a pour affixe "),
      l(`z_0=${affixeLatex(e.a)}`),
      t(". Ses sommets ont pour affixes "),
      l(`z_k=z_0\\,${expoPas(e.n)}`),
      t(" : ils sont sur le cercle de centre O passant par "),
      l("Z_0"),
      t("."),
    ];
  }
  return [
    t("On note "),
    l(omegaLatex(e.n)),
    t(" et "),
    l(`S=${sommeOmegaLatex(e.n)}`),
    t(` la somme des ${e.n} racines ${ORDINAUX[e.n]} de l'unité. ${leNom(e.n)} `),
    l(nomSommetsLatex(e.n)),
    t(" a pour centre le point C d'affixe "),
    l(`c=${affixeLatex(e.c)}`),
    t(" et pour sommet "),
    l("Z_0"),
    t(" le point A d'affixe "),
    l(`a=${affixeLatex(e.a)}`),
    t(" ; ses sommets ont pour affixes "),
    l("z_k=c+(a-c)\\,\\omega^k"),
    t("."),
  ];
}

function listeSommets(ks: number[]): FragmentConsigne[] {
  const noms = ks.map((k) => l(`Z_${k}`));
  if (noms.length === 1) return noms;
  return [...noms.slice(0, -1).flatMap((x, i) => (i === 0 ? [x] : [t(", "), x])), t(" et "), noms[noms.length - 1]];
}

export function consigneEcran(e: ExercicePolygones, phase: PhasePolygones): FragmentConsigne[] {
  switch (phase) {
    case "formule":
      return [t("Quelle relation donne l'affixe "), l("z_k"), t(" du sommet "), l("Z_k"), t(" (pour "), l(`k=0,\\,1,\\,\\ldots,\\,${e.n - 1}`), t(") ?")];
    case "donnees":
      return [
        t("On passe d'un sommet au suivant par une rotation de centre C. Calcule l'affixe "),
        l("a-c"),
        t(" du vecteur "),
        l("\\overrightarrow{CA}"),
        t(" (forme "),
        l("a+bi"),
        t(") et l'angle "),
        l("\\theta"),
        t(" de cette rotation (en radians)."),
      ];
    case "sommet1":
      return [t("Calcule l'affixe "), l("z_1"), t(" du sommet "), l("Z_1"), t(" : donne sa partie réelle et sa partie imaginaire (valeurs exactes).")];
    case "autresSommets":
      return [t("Calcule de même les affixes exactes de "), ...listeSommets(sommetsAutres(e as ExerciceSommets)), t(" (partie réelle et partie imaginaire).")];
    case "rayon":
      return [t("Calcule le rayon "), l("r"), t(" du cercle (valeur exacte).")];
    case "cote":
      return [t("Montre que la longueur d'un côté vaut "), l(`\\ell=|z_1-z_0|=2r\\sin\\frac{\\pi}{${e.n}}`), t(", puis calcule-la (valeur exacte).")];
    case "perimetre":
      return [t("Calcule le périmètre "), l("P"), t(" du polygone (valeur exacte).")];
    case "aire":
      return [t("Calcule l'aire "), l("\\mathcal{A}"), t(" du polygone (valeur exacte).")];
    case "identite":
      return [l("S"), t(" est une somme géométrique de raison "), l("\\omega"), t(". Quelle égalité obtient-on en multipliant "), l("S"), t(" par "), l("\\omega-1"), t(" ?")];
    case "conclusion":
      return [t("Pourquoi peut-on conclure que "), l("S=0"), t(" ?")];
    case "somme":
      return [t("Calcule la somme "), l(sommeZLatex(e.n, 0)), t(" des affixes des sommets (forme "), l("a+bi"), t(").")];
    case "sansA":
      return [t("Déduis-en la somme "), l(sommeZLatex(e.n, 1)), t(" des affixes des sommets autres que A (forme "), l("a+bi"), t(").")];
  }
}

function champsSommet(k: number): ChampPolygones[] {
  return [
    { groupe: [t("Sommet "), l(`Z_${k}`)], label: [l(`\\mathrm{Re}(z_${k})=`)], placeholder: "ex : 1+√3" },
    { label: [l(`\\mathrm{Im}(z_${k})=`)], placeholder: "ex : −√3/2" },
  ];
}

export function champsEcran(e: ExercicePolygones, phase: PhasePolygones): ChampPolygones[] {
  switch (phase) {
    case "donnees":
      return [
        { label: [l("a-c=")], placeholder: "ex : 3−2i" },
        { label: [l("\\theta=")], placeholder: "ex : 3π/4" },
      ];
    case "sommet1":
      return champsSommet(1);
    case "autresSommets":
      return sommetsAutres(e as ExerciceSommets).flatMap(champsSommet);
    case "rayon":
      return [{ label: [l("r=")], placeholder: "ex : 2√5" }];
    case "cote":
      return [{ label: [l("\\ell=")], placeholder: "ex : √15" }];
    case "perimetre":
      return [{ label: [l("P=")], placeholder: "ex : 3√15" }];
    case "aire":
      return [{ label: [l("\\mathcal{A}=")], placeholder: "ex : 15√3/4" }];
    case "somme":
      return [{ label: [l(`${sommeZLatex(e.n, 0)}=`)], placeholder: "ex : 6−3i" }];
    case "sansA":
      return [{ label: [l(`${sommeZLatex(e.n, 1)}=`)], placeholder: "ex : 4+i" }];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------------------------
// Choix fermés (une seule tentative) : options mélangées par une graine tirée de l'exercice.
// ---------------------------------------------------------------------------------------------

export function formuleLatex(id: string, n: number): string {
  const ex: Record<string, string> = {
    [ID_JUSTE]: `z_k=c+(a-c)\\,${expoPas(n)}`,
    rotationO: `z_k=a\\,${expoPas(n)}`,
    oubliTranslation: `z_k=(a-c)\\,${expoPas(n)}`,
    deuxKPi: "z_k=c+(a-c)\\,e^{2ik\\pi}",
    kPiSurN: `z_k=c+(a-c)\\,e^{ik\\pi/${n}}`,
    sensHoraire: `z_k=c+(a-c)\\,e^{-2ik\\pi/${n}}`,
  };
  return ex[id];
}

function identiteLatex(id: string, n: number): string {
  const ex: Record<string, string> = {
    [ID_JUSTE]: `(\\omega-1)\\,S=\\omega^{${n}}-1`,
    nMoins1: `(\\omega-1)\\,S=\\omega^{${n - 1}}-1`,
    nPlus1: `(\\omega-1)\\,S=\\omega^{${n + 1}}-1`,
    foisN: `(\\omega-1)\\,S=${n}\\,(\\omega-1)`,
  };
  return ex[id];
}

function conclusionFragments(id: string, n: number): FragmentConsigne[] {
  switch (id) {
    case ID_JUSTE:
      return [
        t("Parce que "),
        l(`\\omega^{${n}}=e^{2i\\pi}=1`),
        t(", donc "),
        l("(\\omega-1)\\,S=0"),
        t(" ; comme "),
        l("\\omega\\neq1"),
        t(", on peut diviser par "),
        l("\\omega-1"),
        t("."),
      ];
    case "omegaUn":
      return [t("Parce que "), l(`\\omega^{${n}}=1`), t(" entraîne "), l("\\omega=1"), t(", donc chaque terme de "), l("S"), t(" s'annule avec un autre.")];
    case "denominateurNul":
      return [t("Parce que "), l("\\omega-1=0"), t(" alors que "), l(`\\omega^{${n}}-1\\neq0`), t(".")];
    default:
      return [t("Parce que la somme des modules "), l(`|1|+|\\omega|+\\cdots+|\\omega^{${n - 1}}|`), t(" est nulle.")];
  }
}

export function optionsChoix(e: ExercicePolygones, phase: PhasePolygones): OptionChoix[] {
  let ids: string[];
  let rendu: (id: string) => FragmentConsigne[];
  if (phase === "formule" && e.variante === "sommets") {
    const graine = graineDepuis(e, "formule");
    const troisieme = graine % 2 === 0 ? "deuxKPi" : "kPiSurN";
    const pieges = centreEnO(e) ? ["deuxKPi", "kPiSurN", "sensHoraire"] : ["rotationO", "oubliTranslation", troisieme];
    ids = [ID_JUSTE, ...pieges];
    rendu = (id) => [l(formuleLatex(id, e.n))];
  } else if (phase === "identite") {
    ids = [ID_JUSTE, "nMoins1", "nPlus1", "foisN"];
    rendu = (id) => [l(identiteLatex(id, e.n))];
  } else if (phase === "conclusion") {
    ids = [ID_JUSTE, "omegaUn", "denominateurNul", "modules"];
    rendu = (id) => conclusionFragments(id, e.n);
  } else {
    return [];
  }
  return melangerParGraine(ids, graineDepuis(e, phase)).map((id) => ({ id, fragments: rendu(id) }));
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux sur les écrans de saisie, un seul sur un choix fermé).
// ---------------------------------------------------------------------------------------------

export function aideNiveau1(e: ExercicePolygones, phase: PhasePolygones): AideAvecLatex {
  const n = e.n;
  switch (phase) {
    case "formule":
      return { texte: "On passe de Z₀ à Zₖ par k rotations de centre C, toutes du même angle (n rotations font un tour complet). Une rotation de centre C et d'angle α envoie le point d'affixe z sur le point d'affixe z' tel que :", latex: "z'-c=e^{i\\alpha}\\,(z-c)" };
    case "donnees":
      return { texte: "Le vecteur CA a pour affixe « arrivée moins départ » ; n rotations successives d'angle θ font exactement un tour complet (n est le nombre de sommets) :", latex: "\\overrightarrow{CA}\\ \\longleftrightarrow\\ a-c,\\qquad n\\,\\theta=2\\pi" };
    case "sommet1":
      return { texte: "Applique la rotation à A (k = 1), en écrivant d'abord l'exponentielle sous forme algébrique :", latex: "z_1=c+(a-c)\\,e^{i\\theta},\\qquad e^{i\\theta}=\\cos\\theta+i\\sin\\theta" };
    case "autresSommets":
      return { texte: "Le sommet Zₖ s'obtient en tournant A de k fois l'angle θ autour de C :", latex: "z_k=c+(a-c)\\,e^{ik\\theta}" };
    case "rayon":
      return { texte: "Le rayon est la distance de O au sommet Z₀, c'est-à-dire le module de z₀ :", latex: "r=|z_0|=\\sqrt{x_0^2+y_0^2}" };
    case "cote":
      return {
        texte: "Mets z₀ en évidence, puis factorise l'exponentielle de l'angle moitié (les formules d'Euler font apparaître un sinus) :",
        latex: `|z_1-z_0|=|z_0|\\cdot\\left|e^{2i\\pi/${n}}-1\\right|,\\qquad e^{2i\\alpha}-1=e^{i\\alpha}\\left(e^{i\\alpha}-e^{-i\\alpha}\\right)=e^{i\\alpha}\\cdot 2i\\sin\\alpha`,
      };
    case "perimetre":
      return { texte: "Le polygone a n côtés, tous de même longueur ℓ :", latex: "P=n\\,\\ell" };
    case "aire":
      return { texte: "Découpe le polygone en n triangles isocèles OZₖZₖ₊₁ (deux côtés de longueur r, angle au sommet O égal à l'angle entre deux sommets consécutifs). L'aire d'un triangle vaut la moitié du produit de deux côtés par le sinus de l'angle compris :", latex: "\\mathcal{A}=n\\cdot\\frac{1}{2}\\,r^2\\sin\\frac{2\\pi}{n}" };
    case "identite":
      return { texte: "Multiplie S par ω : chaque puissance augmente de 1. Puis soustrais S (les termes communs s'éliminent) :", latex: `\\omega S=\\omega\\left(${sommeOmegaLatex(n)}\\right)` };
    case "conclusion":
      return { texte: "Calcule ωⁿ avec la forme exponentielle, puis demande-toi si ω peut valoir 1 (son argument est-il un multiple de 2π ?) :", latex: `\\omega^{${n}}=\\left(e^{2i\\pi/${n}}\\right)^{${n}}` };
    case "somme":
      return { texte: "Additionne les n égalités zₖ = c + (a − c)ωᵏ, puis mets a − c en évidence :", latex: `${sommeZLatex(n, 0)}=${n}\\,c+(a-c)\\left(${sommeOmegaLatex(n)}\\right)` };
    case "sansA":
      return { texte: "Retire z₀ = a de la somme de tous les sommets :", latex: `${sommeZLatex(n, 1)}=\\left(${sommeZLatex(n, 0)}\\right)-z_0` };
  }
}

export function aideNiveau2(e: ExercicePolygones, phase: PhasePolygones): AideAvecLatex {
  if (e.variante === "sommets") {
    const ca = vecteurCA(e);
    switch (phase) {
      case "donnees":
        return { texte: "Soustrais partie réelle par partie réelle, partie imaginaire par partie imaginaire, puis simplifie la fraction de l'angle :", latex: `a-c=${centreEnO(e) ? "a" : `${par(e.a)}-${par(e.c)}`},\\qquad \\theta=\\frac{2\\pi}{${e.n}}` };
      case "sommet1":
        return { texte: "Avec les valeurs de l'exercice, il reste à développer le produit (avec i² = −1) puis à ajouter c :", latex: `z_1=${par(e.c)}+${par(ca)}\\left(\\cos${angleSurLatex(2, e.n)}+i\\sin${angleSurLatex(2, e.n)}\\right)` };
      case "autresSommets": {
        const ks = sommetsAutres(e);
        return {
          texte: "Avec les valeurs de l'exercice (contrôle : un sommet opposé à A dans le polygone est son symétrique par rapport à C) :",
          latex: ks.map((k) => `z_${k}=${par(e.c)}+${par(ca)}\\left(\\cos${angleSurLatex(2 * k, e.n)}+i\\sin${angleSurLatex(2 * k, e.n)}\\right)`).join(",\\quad "),
        };
      }
      default:
        return { texte: "", latex: null };
    }
  }
  if (e.variante === "mesures") {
    const r = radicalLatex(rayonExact(e));
    switch (phase) {
      case "rayon":
        return { texte: "Avec les coordonnées de Z₀, puis simplifie la racine si possible :", latex: `r=\\sqrt{${e.a.x < 0 ? `(${e.a.x})` : e.a.x}^2+${e.a.y < 0 ? `(${e.a.y})` : e.a.y}^2}` };
      case "cote":
        return { texte: "Le module d'une exponentielle imaginaire vaut 1 ; remplace r et le sinus par leurs valeurs exactes :", latex: `\\ell=2r\\sin\\frac{\\pi}{${e.n}}=2\\cdot ${r}\\cdot\\sin\\frac{\\pi}{${e.n}}` };
      case "perimetre":
        return { texte: "Multiplie la longueur ℓ trouvée par le nombre de côtés :", latex: `P=${e.n}\\,\\ell` };
      case "aire":
        return { texte: "Remplace r² et le sinus par leurs valeurs exactes :", latex: `\\mathcal{A}=${e.n}\\cdot\\frac{1}{2}\\cdot ${rayonCarre(e)}\\cdot\\sin\\frac{2\\pi}{${e.n}}` };
      default:
        return { texte: "", latex: null };
    }
  }
  switch (phase) {
    case "somme":
      return { texte: "La parenthèse est S, que tu viens de démontrer nulle ; il reste à multiplier c par n :", latex: `c=${affixeLatex(e.c)}` };
    case "sansA":
      return { texte: "Avec la somme trouvée et la valeur de a :", latex: `a=${affixeLatex(e.a)}` };
    default:
      return { texte: "", latex: null };
  }
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues (écran, récapitulatif, corrigé).
// ---------------------------------------------------------------------------------------------

export function sommetLatex(e: ExerciceSommets, k: number): string {
  return `z_${k}=${complexeExactLatex(sommetExact(e, k))}`;
}

/** Réponse attendue d'un écran, en LaTeX (une formule par élément). */
export function formatReponseAttenduePhaseLatex(e: ExercicePolygones, phase: PhasePolygones): string[] {
  switch (phase) {
    case "formule":
      return [formuleLatex(ID_JUSTE, e.n)];
    case "donnees": {
      const s = e as ExerciceSommets;
      return [`a-c=${affixeLatex(vecteurCA(s))}`, `\\theta=${anglePasLatex(e.n)}`];
    }
    case "sommet1":
      return [sommetLatex(e as ExerciceSommets, 1)];
    case "autresSommets":
      return sommetsAutres(e as ExerciceSommets).map((k) => sommetLatex(e as ExerciceSommets, k));
    case "rayon":
      return [`r=${radicalLatex(rayonExact(e as ExerciceMesures))}`];
    case "cote":
      return [`\\ell=${radicalLatex(coteExact(e as ExerciceMesures))}`];
    case "perimetre":
      return [`P=${radicalLatex(perimetreExact(e as ExerciceMesures))}`];
    case "aire":
      return [`\\mathcal{A}=${radicalLatex(aireExacte(e as ExerciceMesures))}`];
    case "identite":
      return [identiteLatex(ID_JUSTE, e.n)];
    case "conclusion":
      return [`\\omega^{${e.n}}=1,\\ \\omega\\neq1\\ \\Longrightarrow\\ S=0`];
    case "somme":
      return [`${sommeZLatex(e.n, 0)}=${affixeLatex(sommeSommets(e as ExerciceSommeNulle))}`];
    case "sansA":
      return [`${sommeZLatex(e.n, 1)}=${affixeLatex(sommeSansA(e as ExerciceSommeNulle))}`];
  }
}

/** Réponse d'un écran sous forme de fragments (corrigé, barème, écran de validation). */
export function reponseFragments(e: ExercicePolygones, phase: PhasePolygones): FragmentConsigne[] {
  if (phase === "conclusion") return conclusionFragments(ID_JUSTE, e.n);
  return formatReponseAttenduePhaseLatex(e, phase).flatMap((x, i) => (i === 0 ? [l(x)] : [t(" ; "), l(x)]));
}

/** Ligne du récapitulatif « Ce qu'on sait déjà ». */
export function valeurRecapitulatif(e: ExercicePolygones, phase: PhasePolygones): { valeur: string; estLatex: boolean } {
  return { valeur: formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "), estLatex: true };
}

// ---------------------------------------------------------------------------------------------
// Diagnostics (message ciblé après une réponse fausse — jamais la réponse).
// ---------------------------------------------------------------------------------------------

const MESSAGES_CHOIX: Record<string, (n: number) => FragmentConsigne[]> = {
  rotationO: () => [t("Cette relation fait tourner A autour de O, pas autour du centre C du polygone.")],
  oubliTranslation: () => [t("Il manque la translation : "), l("(a-c)\\,e^{i\\alpha}"), t(" est l'affixe du vecteur "), l("\\overrightarrow{CZ_k}"), t(", pas celle du point "), l("Z_k"), t(" ; il faut encore ajouter "), l("c"), t(".")],
  deuxKPi: () => [l("e^{2ik\\pi}=1"), t(" pour tout entier k : tous les sommets seraient confondus avec A. Deux sommets consécutifs sont séparés d'un angle "), l("\\frac{2\\pi}{n}"), t(".")],
  kPiSurN: () => [t("Avec l'angle "), l("\\frac{k\\pi}{n}"), t(", les n rotations ne feraient qu'un demi-tour : l'angle entre deux sommets consécutifs est "), l("\\frac{2\\pi}{n}"), t(".")],
  sensHoraire: () => [t("Le signe moins fait tourner dans le sens des aiguilles d'une montre ; les sommets sont numérotés dans le sens trigonométrique.")],
  nMoins1: (n) => [t("Le dernier terme de "), l("S"), t(" est "), l(`\\omega^{${n - 1}}`), t(" : dans "), l("\\omega S"), t(", il devient "), l(`\\omega^{${n}}`), t(".")],
  nPlus1: (n) => [t("En multipliant "), l(`\\omega^{${n - 1}}`), t(" par "), l("\\omega"), t(", on obtient "), l(`\\omega^{${n}}`), t(", pas "), l(`\\omega^{${n + 1}}`), t(".")],
  foisN: () => [t("Les termes de "), l("S"), t(" ne valent pas tous 1 : écris "), l("\\omega S-S"), t(" terme à terme, presque tout s'élimine.")],
  omegaUn: (n) => [l("\\omega"), t(" ne vaut pas 1 : son argument "), l(`\\frac{2\\pi}{${n}}`), t(" n'est pas un multiple de "), l("2\\pi"), t(". C'est "), l(`\\omega^{${n}}`), t(" qui vaut 1.")],
  denominateurNul: () => [t("C'est l'inverse : "), l("\\omega^{n}-1=0"), t(" et "), l("\\omega-1\\neq0"), t(" ; on ne divise jamais par 0.")],
  modules: () => [t("Les modules sont tous égaux à 1, leur somme vaut n, pas 0 : l'argument doit porter sur la somme géométrique.")],
};

export function messageDiagnostic(e: ExercicePolygones, phase: PhasePolygones, id: string): FragmentConsigne[] {
  if (phase === "formule" || phase === "identite" || phase === "conclusion") return (MESSAGES_CHOIX[id] ?? MESSAGES_CHOIX.modules)(e.n);
  if (phase === "donnees") {
    const m: Record<string, FragmentConsigne[]> = {
      "ac:inverse": [t("Tu as calculé "), l("c-a"), t(" : le vecteur "), l("\\overrightarrow{CA}"), t(" va de C vers A, son affixe est « arrivée moins départ ».")],
      "ac:somme": [t("Tu as additionné : l'affixe du vecteur "), l("\\overrightarrow{CA}"), t(" est une différence.")],
      "ac:a": [l("a"), t(" est l'affixe du point A, pas du vecteur "), l("\\overrightarrow{CA}"), t(" : retire "), l("c"), t(".")],
      "ac:autre": [t("Recalcule "), l("a-c"), t(" : partie réelle moins partie réelle, partie imaginaire moins partie imaginaire.")],
      "angle:tour": [t("Vecteur correct. "), l("2\\pi"), t(" est un tour complet : on reviendrait sur A. Les n sommets se partagent ce tour en n angles égaux.")],
      "angle:sens": [t("Vecteur correct. Les sommets sont numérotés dans le sens trigonométrique : l'angle est positif.")],
      "angle:moitie": [t("Vecteur correct. C'est la moitié de l'angle : n rotations successives doivent faire un tour complet.")],
      "angle:autre": [t("Vecteur correct. Pour l'angle : n rotations successives de cet angle font exactement un tour complet.")],
    };
    return m[id] ?? m["ac:autre"];
  }
  if (phase === "sommet1" || phase === "autresSommets") {
    const [nom, cas] = id.split(":");
    const k = nom.slice(1);
    const tete = [l(`Z_${k}`), t(" : ")];
    const m: Record<string, FragmentConsigne[]> = {
      rotationO: [t("tu as fait tourner A autour de O. Fais tourner le vecteur "), l("\\overrightarrow{CA}"), t(" (d'affixe "), l("a-c"), t("), puis ajoute "), l("c"), t(".")],
      oubliTranslation: [t("tu as oublié d'ajouter "), l("c"), t(" après la rotation de "), l("a-c"), t(".")],
      sensHoraire: [t("tu as tourné dans le sens des aiguilles d'une montre ; l'angle est "), l("+k\\theta"), t(".")],
      echange: [t("partie réelle et partie imaginaire sont échangées.")],
      imaginaire: [t("partie réelle correcte ; revois la partie imaginaire (n'oublie pas "), l("i^2=-1"), t(").")],
      reelle: [t("partie imaginaire correcte ; revois la partie réelle (n'oublie pas "), l("i^2=-1"), t(").")],
      autre: [t("développe "), l("(a-c)\\left(\\cos(k\\theta)+i\\sin(k\\theta)\\right)"), t(" avec "), l("i^2=-1"), t(", puis ajoute "), l("c"), t(".")],
    };
    return [...tete, ...(m[cas] ?? m.autre)];
  }
  if (e.variante === "mesures") {
    const m: Record<string, FragmentConsigne[]> = {
      carre: [t("Tu as donné "), l("r^2"), t(" : prends la racine carrée.")],
      somme: [t("Le module n'est pas la somme des coordonnées : c'est la distance OZ₀, par Pythagore.")],
      oubli2: [t("Il manque le facteur 2 : "), l("\\left|e^{2i\\alpha}-1\\right|=2\\sin\\alpha"), t(" pour un angle α entre 0 et π.")],
      angleDouble: [t("Tu as pris "), l(`\\sin\\frac{2\\pi}{${e.n}}`), t(" : l'angle à utiliser est la moitié de "), l(`\\frac{2\\pi}{${e.n}}`), t(".")],
      r: [t("Tu as utilisé "), l("r^2"), t(" au lieu de "), l("r"), t(".")],
      cercle: phase === "perimetre" ? [t("C'est le périmètre du cercle : le polygone a n côtés de longueur ℓ.")] : [t("C'est l'aire du disque : le polygone est plus petit que le disque.")],
      demi: [t("Tu as oublié le facteur "), l("\\frac{1}{2}"), t(" de l'aire d'un triangle.")],
      sinPiSurN: [t("L'angle au sommet O de chaque triangle vaut "), l(`\\frac{2\\pi}{${e.n}}`), t(", pas "), l(`\\frac{\\pi}{${e.n}}`), t(".")],
    };
    const autre: Record<string, FragmentConsigne[]> = {
      rayon: [t("Le rayon est la distance OZ₀ : "), l("r=\\sqrt{x_0^2+y_0^2}"), t(".")],
      cote: [t("Remplace "), l("r"), t(" par sa valeur et "), l(`\\sin\\frac{\\pi}{${e.n}}`), t(" par sa valeur exacte.")],
      perimetre: [t("Le périmètre est n fois la longueur d'un côté.")],
      aire: [t("Découpe en n triangles isocèles de sommet O : chacun a pour aire "), l(`\\frac{1}{2}\\,r^2\\sin\\frac{2\\pi}{${e.n}}`), t(".")],
    };
    if (id === "r" && phase === "aire") return [t("Utilise "), l("r^2"), t(" (pas "), l("r"), t(") : l'aire d'un triangle est "), l("\\frac{1}{2}\\cdot r\\cdot r\\cdot\\sin\\alpha"), t(".")];
    return m[id] ?? autre[phase] ?? autre.rayon;
  }
  const m: Record<string, FragmentConsigne[]> = {
    zero: [l("S=0"), t(", mais la somme des sommets contient aussi n fois le terme "), l("c"), t(".")],
    c: [t("Chacun des n sommets apporte un terme "), l("c"), t(" : il y en a n.")],
    na: [t("Regroupe chaque terme "), l("c+(a-c)\\,\\omega^k"), t(" : c'est "), l("a-c"), t(" qui est multiplié par "), l("S"), t(".")],
    oubliA: [t("C'est la somme de tous les sommets : retire "), l("z_0=a"), t(".")],
    nMoins1c: [t("On retire le sommet "), l("z_0=a"), t(", pas "), l("c"), t(".")],
    plusA: [t("Il faut retrancher "), l("a"), t(", pas l'ajouter.")],
  };
  const autre: FragmentConsigne[] =
    phase === "somme"
      ? [t("Additionne les n égalités "), l("z_k=c+(a-c)\\,\\omega^k"), t(" et mets "), l("a-c"), t(" en évidence.")]
      : [t("La somme des autres sommets est la somme de tous les sommets moins "), l("z_0"), t(".")];
  return m[id] ?? autre;
}

// ---------------------------------------------------------------------------------------------
// Corrigé : lignes de calcul, contrôles et pièges.
// ---------------------------------------------------------------------------------------------

export function calculEtape(e: ExercicePolygones, phase: PhasePolygones): string[] {
  const n = e.n;
  switch (phase) {
    case "formule":
      return [`z_k-c=${expoPas(n)}\\,(z_0-c)\\ \\Longrightarrow\\ ${formuleLatex(ID_JUSTE, n)}`];
    case "donnees": {
      const s = e as ExerciceSommets;
      const difference = centreEnO(s) ? "a" : `${par(s.a)}-${par(s.c)}`;
      return [`a-c=${difference}=${affixeLatex(vecteurCA(s))},\\qquad \\theta=\\frac{2\\pi}{${n}}=${anglePasLatex(n)}`];
    }
    case "sommet1":
    case "autresSommets": {
      const s = e as ExerciceSommets;
      const ks = phase === "sommet1" ? [1] : sommetsAutres(s);
      return ks.map((k) => {
        // Exposant écrit en ligne (« 2\pi/3 ») : une fraction en exposant est illisible à l'écran.
        const angle = angleSurLatex(2 * k, n).replace(/^\\frac\{(.+)\}\{(\d+)\}$/, "$1/$2");
        return `z_${k}=c+(a-c)\\,e^{i${angle}}=${par(s.c)}+${par(vecteurCA(s))}\\left(${expoAlgebrique(n, k)}\\right)=${complexeExactLatex(sommetExact(s, k))}`;
      });
    }
    case "rayon": {
      const m = e as ExerciceMesures;
      const p = (v: number) => (v < 0 ? `(${v})` : `${v}`);
      const R = rayonCarre(m);
      const r = radicalLatex(rayonExact(m));
      return [`r=|z_0|=\\sqrt{${p(m.a.x)}^2+${p(m.a.y)}^2}=\\sqrt{${R}}${r === `\\sqrt{${R}}` ? "" : `=${r}`}`];
    }
    case "cote": {
      const m = e as ExerciceMesures;
      return [
        `|z_1-z_0|=|z_0|\\cdot\\left|e^{2i\\pi/${n}}-1\\right|=r\\,\\left|e^{i\\pi/${n}}\\right|\\cdot\\left|e^{i\\pi/${n}}-e^{-i\\pi/${n}}\\right|=r\\cdot\\left|2i\\sin\\frac{\\pi}{${n}}\\right|=2r\\sin\\frac{\\pi}{${n}}`,
        `\\ell=2\\cdot ${radicalLatexParenthese(rayonExact(m))}\\cdot ${SIN_PI_SUR_N[n]}=${radicalLatex(coteExact(m))}`,
      ];
    }
    case "perimetre": {
      const m = e as ExerciceMesures;
      return [`P=${n}\\,\\ell=${n}\\cdot ${radicalLatexParenthese(coteExact(m))}=${radicalLatex(perimetreExact(m))}`];
    }
    case "aire": {
      const m = e as ExerciceMesures;
      return [`\\mathcal{A}=${n}\\cdot\\frac{1}{2}\\,r^2\\sin\\frac{2\\pi}{${n}}=${n}\\cdot\\frac{1}{2}\\cdot ${rayonCarre(m)}\\cdot ${SIN_2PI_SUR_N[n]}=${radicalLatex(aireExacte(m))}`];
    }
    case "identite":
      return [`\\omega S=\\omega+\\omega^2+\\cdots+\\omega^{${n}}`, `\\omega S-S=\\omega^{${n}}-1\\ \\Longleftrightarrow\\ ${identiteLatex(ID_JUSTE, n)}`];
    case "conclusion":
      return [`\\omega^{${n}}=\\left(e^{2i\\pi/${n}}\\right)^{${n}}=e^{2i\\pi}=1,\\qquad \\omega\\neq1\\ \\left(0<\\frac{2\\pi}{${n}}<2\\pi\\right)`, `S=\\frac{\\omega^{${n}}-1}{\\omega-1}=\\frac{0}{\\omega-1}=0`];
    case "somme": {
      const s = e as ExerciceSommeNulle;
      return [`${sommeZLatex(n, 0)}=${n}\\,c+(a-c)\\,S=${n}\\cdot ${par(s.c)}+0=${affixeLatex(sommeSommets(s))}`];
    }
    case "sansA": {
      const s = e as ExerciceSommeNulle;
      return [`${sommeZLatex(n, 1)}=\\left(${sommeZLatex(n, 0)}\\right)-a=${affixeLatex(sommeSommets(s))}-${par(s.a)}=${affixeLatex(sommeSansA(s))}`];
    }
  }
}

/** Contrôle géométrique rapide des sommets demandés (corrigé de l'écran « autres sommets »), ou null. */
export function controleSommets(e: ExerciceSommets): FragmentConsigne[] | null {
  const ca = vecteurCA(e);
  if (e.n === 4) return [t("Contrôle : "), l("Z_2"), t(" est le symétrique de A par rapport à C, "), l(`z_2=2c-a=${affixeLatex({ x: 2 * e.c.x - e.a.x, y: 2 * e.c.y - e.a.y })}`), t(".")];
  if (e.n === 6) return [t("Contrôle : "), l("Z_3"), t(" est le symétrique de A par rapport à C, "), l(`z_3=2c-a=${affixeLatex({ x: 2 * e.c.x - e.a.x, y: 2 * e.c.y - e.a.y })}`), t(".")];
  if (e.n === 8) return [t("Contrôle : "), l("Z_2"), t(" s'obtient par un quart de tour, "), l(`z_2=c+i(a-c)=${affixeLatex({ x: e.c.x - ca.y, y: e.c.y + ca.x })}`), t(".")];
  return null;
}

export function piegeEtape(e: ExercicePolygones, phase: PhasePolygones): FragmentConsigne[] {
  const n = e.n;
  switch (phase) {
    case "formule":
      return [t("Faire tourner A autour de O ("), l(`a\\,${expoPas(n)}`), t(") au lieu de C, ou oublier d'ajouter "), l("c"), t(" après la rotation de "), l("a-c"), t(".")];
    case "donnees":
      return [t("Prendre "), l("2\\pi"), t(" (un tour complet) au lieu de "), l(`\\frac{2\\pi}{${n}}`), t(", ou calculer "), l("c-a"), t(" au lieu de "), l("a-c"), t(".")];
    case "sommet1":
      return [t("Oublier d'ajouter "), l("c"), t(" après la rotation, ou faire tourner A autour de O.")];
    case "autresSommets":
      return [t("Garder l'angle "), l("\\theta"), t(" pour tous les sommets : pour "), l("Z_k"), t(", l'angle est "), l("k\\theta"), t(".")];
    case "rayon":
      return [t("Oublier la racine carrée (donner "), l("r^2"), t(").")];
    case "cote":
      return [t("Prendre "), l(`\\sin\\frac{2\\pi}{${n}}`), t(" au lieu de "), l(`\\sin\\frac{\\pi}{${n}}`), t(", ou oublier le facteur 2.")];
    case "perimetre":
      return [t("Confondre avec le périmètre du cercle, "), l("2\\pi r"), t(".")];
    case "aire":
      return [t("Oublier le "), l("\\frac{1}{2}"), t(" de l'aire d'un triangle, ou prendre l'angle "), l(`\\frac{\\pi}{${n}}`), t(" au lieu de "), l(`\\frac{2\\pi}{${n}}`), t(".")];
    case "identite":
      return [t("Se tromper d'exposant : le dernier terme de "), l("S"), t(" est "), l(`\\omega^{${n - 1}}`), t(", donc "), l("\\omega S"), t(" se termine par "), l(`\\omega^{${n}}`), t(".")];
    case "conclusion":
      return [t("Diviser par "), l("\\omega-1"), t(" sans justifier que "), l("\\omega\\neq1"), t(".")];
    case "somme":
      return [t("Répondre 0 : c'est "), l("S"), t(" qui est nulle, pas la somme des affixes des sommets (sauf si C = O).")];
    case "sansA":
      return [t("Retirer "), l("c"), t(" au lieu de "), l("z_0=a"), t(".")];
  }
}

/** Phrase de méthode du corrigé (aide de niveau 1 de l'écran). */
export function methodeFragments(e: ExercicePolygones, phase: PhasePolygones): FragmentConsigne[] {
  const aide = aideNiveau1(e, phase);
  if (phase === "identite") return [t("Multiplie "), l("S"), t(" par "), l("\\omega"), t(" (chaque puissance augmente de 1), puis soustrais "), l("S"), t(" : les termes communs s'éliminent.")];
  return aide.latex ? [t(`${aide.texte} `), l(aide.latex)] : [t(aide.texte)];
}

export { leNomMinuscule };
