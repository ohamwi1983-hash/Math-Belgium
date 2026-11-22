import type { FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../../export/corrigeTableau";
import type { DessinPave, ExerciceDetectiveEspace, OptionDetective, TypeErreurEspace } from "../../core/detectiveEspace.types";
import { choisir, entier, melanger, descriptionsVariees, t } from "./commun";

/**
 * Thème « cavalière » de gen107 : un élève décrit comment il a dessiné un pavé droit en perspective
 * cavalière (convention du cours : fuyantes à 45°, vers la droite et vers le haut, réduites de
 * moitié ; sommet D — arrière, en bas, à gauche — caché). Sa copie a 4 lignes et son dessin
 * l'accompagne (sur un quadrillage de 1 cm, comme gen104) :
 * 1. la face avant ABFE en vraie grandeur (toujours juste) ;
 * 2. la direction des fuyantes ;
 * 3. la longueur reportée sur les fuyantes ;
 * 4. les arêtes cachées.
 * Types d'erreur (tirés à parts égales, avant les dimensions ; chacun fixe sa ligne) : `angle`
 * (ligne 2 : 30° ou 60°), `reduction` (ligne 3 : profondeur non réduite — fiche), `cachees`
 * (ligne 4 : mauvais sommet caché). L'écran c propose quatre DESSINS : le bon et trois dessins
 * faux (jamais celui de la copie).
 */

export const LIGNE_DU_TYPE: Record<"angle" | "reduction" | "cachees", number> = { angle: 1, reduction: 2, cachees: 3 };

/** « 2,5 » (virgule décimale). */
export function nombre(x: number): string {
  return Number.isInteger(x) ? `${x}` : `${x}`.replace(".", ",");
}

function nombreLatex(x: number): string {
  return Number.isInteger(x) ? `${x}` : `${x}`.replace(".", "{,}");
}

const ARETES_CACHEES: Record<DessinPave["cache"], string> = {
  D: "[AD], [CD] et [DH]",
  C: "[BC], [CD] et [CG]",
  H: "[DH], [EH] et [GH]",
  B: "[AB], [BC] et [BF]",
};

export function genererCavaliere(type: TypeErreurEspace): ExerciceDetectiveEspace {
  const typeC = type as keyof typeof LIGNE_DU_TYPE;
  // Le défaut précis est tiré avant les dimensions.
  const angleFaux = choisir([30, 60]);
  const cacheFaux = choisir(["C", "H"] as const);
  const largeur = entier(2, 7);
  const hauteur = entier(2, 5);
  const profondeur = entier(2, 7);
  // Deux tournures pour la ligne 3, juste ou fausse (la longueur de la ligne ne trahit rien).
  const tournure = Math.random() < 0.5;
  const juste: DessinPave = { largeur, hauteur, profondeur, angle: 45, coefficient: 0.5, cache: "D" };
  const copie: DessinPave =
    typeC === "angle" ? { ...juste, angle: angleFaux } : typeC === "reduction" ? { ...juste, coefficient: 1 } : { ...juste, cache: cacheFaux };
  const q = profondeur / 2;

  const L1 = t(`Je dessine la face avant ABFE en vraie grandeur : un rectangle de ${largeur} cm de large et ${hauteur} cm de haut.`);
  const L2 = t(`Depuis A, B, F et E, je trace des fuyantes parallèles, à ${copie.angle}° de l'horizontale, vers la droite et vers le haut.`);
  const L3: FragmentConsigne[] =
    copie.coefficient === 1
      ? tournure
        ? [texte(`Sur chaque fuyante, je reporte la profondeur mesurée sur le pavé lui-même : ${nombre(profondeur)} cm.`)]
        : [texte(`Sur chaque fuyante, je reporte la profondeur réelle du pavé, comme sur l'objet : ${nombre(profondeur)} cm.`)]
      : tournure
        ? [texte("Sur chaque fuyante, je reporte la moitié de la profondeur : "), latex(`${profondeur} \\times 0{,}5 = ${nombreLatex(q)}`), texte(" cm.")]
        : [texte("Sur chaque fuyante, je reporte la profondeur réduite de moitié : "), latex(`${profondeur} \\div 2 = ${nombreLatex(q)}`), texte(" cm.")];
  const L4 = t(`Je relie les sommets arrière. Le sommet ${copie.cache} est caché : ${ARETES_CACHEES[copie.cache]} sont en pointillés.`);

  const controles: FragmentConsigne[][] = [
    t(`Ligne 1 : la face avant garde ses vraies dimensions (${largeur} cm sur ${hauteur} cm). C'est juste.`),
    copie.angle === 45 ? t("Ligne 2 : fuyantes à 45°, vers la droite et vers le haut : c'est la convention du cours. C'est juste.") : t(`Ligne 2 : la convention du cours impose 45° ; les fuyantes du dessin font ${copie.angle}°. La copie est fausse.`),
    copie.coefficient === 0.5
      ? [texte("Ligne 3 : la profondeur réelle est réduite de moitié : "), latex(`${profondeur} \\times 0{,}5 = ${nombreLatex(q)}`), texte(" cm. C'est juste.")]
      : [texte(`Ligne 3 : la profondeur n'est pas réduite ; les fuyantes devaient mesurer `), latex(`${profondeur} \\times 0{,}5 = ${nombreLatex(q)}`), texte(` cm, pas ${nombre(profondeur)} cm. La copie est fausse.`)],
    copie.cache === "D"
      ? t("Ligne 4 : le sommet caché est D (arrière, en bas, à gauche) ; ses trois arêtes [AD], [CD] et [DH] sont en pointillés. C'est juste.")
      : t(`Ligne 4 : avec des fuyantes vers la droite et vers le haut, le sommet caché est D (arrière, en bas, à gauche), pas ${copie.cache} ; ce sont [AD], [CD] et [DH] qui vont en pointillés. La copie est fausse.`),
  ];

  // Corrigé « comme au tableau » (aucun aléa) : chaque règle de la perspective cavalière, une par ligne.
  const JUSTE = " ; la copie est juste";
  const FAUX = " : la copie est fausse";
  const FACES_SOMMET: Record<DessinPave["cache"], [string, string, string]> = { D: ["AD", "CD", "DH"], C: ["BC", "CD", "CG"], H: ["DH", "EH", "GH"], B: ["AB", "BC", "BF"] };
  const FACES_ARETE: Record<string, [string, string]> = {
    AD: ["ABCD", "ADHE"], CD: ["ABCD", "DCGH"], DH: ["ADHE", "DCGH"], BC: ["ABCD", "BCGF"], CG: ["BCGF", "DCGH"], EH: ["ADHE", "EFGH"], GH: ["DCGH", "EFGH"], AB: ["ABCD", "ABFE"], BF: ["ABFE", "BCGF"],
  };
  const VUES = new Set(["ABFE", "EFGH", "BCGF"]);
  const lignesAngle = (fin: string): LigneCalcul[] => [ligne("\\text{angle des fuyantes}=45^\\circ", `convention du cours, vers la droite et vers le haut${fin}`)];
  const lignesReduction = (fin: string): LigneCalcul[] => [ligne(`\\text{fuyante dessinée}=${profondeur}\\times 0{,}5`, "profondeur réelle réduite de moitié"), ligne(`=${nombreLatex(q)}\\text{ cm}`, fin.trim() ? fin.replace(/^ ; /, "") : undefined)];
  const lignesCachees = (sommet: DessinPave["cache"], fin: string): LigneCalcul[] =>
    FACES_SOMMET[sommet].map((a, k) => {
      const [f1, f2] = FACES_ARETE[a]!;
      const vue = [f1, f2].find((f) => VUES.has(f));
      const j = vue ? `la face ${vue} est vue : arête vue` : "deux faces cachées : arête cachée";
      return ligne(`[${a}]=${f1}\\cap ${f2}`, k === 2 ? `${j}${fin}` : j);
    });
  const tabCtrl: LigneCalcul[][] = [
    [ligne(`AB=${largeur}\\text{ cm}`, "face avant en vraie grandeur"), ligne(`AE=${hauteur}\\text{ cm}`, `face avant en vraie grandeur${JUSTE}`)],
    copie.angle === 45 ? lignesAngle(JUSTE) : [...lignesAngle(""), ligne(`${copie.angle}^\\circ\\neq 45^\\circ`, `angle des fuyantes du dessin${FAUX}`)],
    copie.coefficient === 0.5 ? lignesReduction(JUSTE) : [...lignesReduction(""), ligne(`${nombreLatex(profondeur)}\\text{ cm}\\neq ${nombreLatex(q)}\\text{ cm}`, `fuyantes du dessin non réduites${FAUX}`)],
    copie.cache === "D" ? lignesCachees("D", JUSTE) : lignesCachees(copie.cache, ` ; ${copie.cache} n'est pas caché, la copie est fausse`),
  ];
  const tabCorr: LigneCalcul[] = typeC === "angle" ? lignesAngle("") : typeC === "reduction" ? lignesReduction("") : lignesCachees("D", " : D est le sommet caché");

  let descriptions: OptionDetective[];
  let ligneCorrigee: FragmentConsigne[];
  let piege: string;
  let nomErreur: string;
  if (typeC === "angle") {
    descriptions = descriptionsVariees(t(`Les fuyantes doivent faire 45° avec l'horizontale, pas ${angleFaux}° : c'est la convention.`), [
      t("Les fuyantes doivent rester horizontales : en cavalière, seule leur longueur change."),
      t("Les fuyantes ne doivent pas être parallèles : elles se rejoignent en un point de fuite."),
      t("L'angle est juste, mais les fuyantes doivent partir vers la gauche et vers le bas."),
    ]);
    ligneCorrigee = t("Depuis A, B, F et E, je trace des fuyantes parallèles, à 45° de l'horizontale, vers la droite et vers le haut.");
    piege = "En perspective cavalière, les fuyantes font toujours 45° avec l'horizontale (et vont vers la droite et vers le haut) : un autre angle déforme le solide.";
    nomErreur = `fuyantes tracées à ${angleFaux}° au lieu de 45°`;
  } else if (typeC === "reduction") {
    descriptions = descriptionsVariees([texte("La profondeur doit être réduite de moitié : les fuyantes mesurent "), latex(`${nombreLatex(q)}`), texte(` cm, pas ${nombre(profondeur)} cm.`)], [
      t("La profondeur doit être doublée, pour que le pavé paraisse bien plus profond."),
      t("La profondeur se reporte en comptant un carreau en diagonale par centimètre."),
      t("C'est la largeur de la face avant qu'il faut réduire de moitié, pas la profondeur."),
    ]);
    ligneCorrigee = [texte("Sur chaque fuyante, je reporte la moitié de la profondeur : "), latex(`${profondeur} \\times 0{,}5 = ${nombreLatex(q)}`), texte(" cm.")];
    piege = "Les fuyantes sont réduites de moitié : sans cette réduction, le pavé paraît étiré vers l'arrière. Et compter un carreau en diagonale par centimètre ne réduit pas de moitié (la diagonale d'un carreau mesure environ 1,4 cm).";
    nomErreur = "profondeur reportée sans réduction de moitié";
  } else {
    descriptions = descriptionsVariees(t(`C'est le sommet D qui est caché : [AD], [CD] et [DH] vont en pointillés, pas les arêtes de ${cacheFaux}.`), [
      t("En perspective cavalière, aucune arête n'est cachée : tout se trace en trait plein."),
      t("Toutes les arêtes de la face arrière CDHG sont cachées et vont en pointillés."),
      t(`Le sommet ${cacheFaux} est bien caché, mais une seule de ses arêtes est en pointillés.`),
    ]);
    ligneCorrigee = t("Je relie les sommets arrière. Le sommet D est caché : [AD], [CD] et [DH] sont en pointillés.");
    piege = "Avec des fuyantes vers la droite et vers le haut, on voit la face avant, la face du dessus et la face de droite : le seul sommet caché est D, et ses trois arêtes vont en pointillés.";
    nomErreur = `arêtes du sommet ${cacheFaux} tracées en pointillés au lieu de celles de D`;
  }

  // Écran c : quatre dessins (le bon, trois faux qui ne sont jamais celui de la copie).
  const fauxPossibles: DessinPave[] = [
    { ...juste, angle: 30 },
    { ...juste, angle: 60 },
    { ...juste, coefficient: 1 },
    { ...juste, cache: "C" as const },
    { ...juste, cache: "H" as const },
    { ...juste, angle: 30, coefficient: 1 },
  ].filter((x) => !(x.angle === copie.angle && x.coefficient === copie.coefficient && x.cache === copie.cache));
  // Trois défauts DIFFÉRENTS (angle, réduction, arêtes) autant que possible.
  const familles = (x: DessinPave) => (x.cache !== "D" ? "cache" : x.coefficient !== 0.5 ? "reduction" : "angle");
  const parFamille = new Map<string, DessinPave[]>();
  for (const x of melanger(fauxPossibles)) parFamille.set(familles(x), [...(parFamille.get(familles(x)) ?? []), x]);
  const faux: DessinPave[] = [];
  for (const liste of melanger([...parFamille.values()])) faux.push(liste[0]!);
  for (const x of melanger(fauxPossibles)) if (faux.length < 3 && !faux.includes(x)) faux.push(x);
  const corrections: OptionDetective[] = melanger([
    { fragments: t("Dessin"), correcte: true, dessin: juste },
    ...faux.slice(0, 3).map((x) => ({ fragments: t("Dessin"), correcte: false, dessin: x })),
  ]);

  return {
    theme: "cavaliere",
    type,
    ligneFausse: LIGNE_DU_TYPE[typeC],
    enonce: t(`Un élève doit dessiner en perspective cavalière un pavé droit de ${largeur} cm de large, ${hauteur} cm de haut et ${profondeur} cm de profondeur (face avant ABFE, face arrière DCGH). Voici son dessin, sur un quadrillage de 1 cm, et sa description.`),
    lignes: [L1, L2, L3, L4],
    descriptions,
    questionCorrection: t("Quel dessin l'élève aurait-il dû obtenir ?"),
    corrections,
    controles,
    ligneCorrigee,
    suite: null,
    piege: t(piege),
    nomErreur,
    aides: [
      [
        t("Compare chaque ligne à la convention du cours : face avant en vraie grandeur, fuyantes à 45° vers la droite et vers le haut, réduites de moitié, arêtes cachées en pointillés."),
        t("Sers-toi du quadrillage : la face avant tombe sur les nœuds ; une fuyante est à 45°, et sa longueur se mesure à la règle (la diagonale d'un carreau mesure environ 1,4 cm)."),
      ],
      [
        t("Relis la ligne fausse : quelle règle de la perspective cavalière n'est pas respectée ?"),
        t("Reprends les règles du cours une par une — face avant, angle des fuyantes, longueur des fuyantes, pointillés — et compare-les à cette ligne et au dessin."),
      ],
      [
        t("Le bon dessin respecte TOUTES les règles : vérifie l'angle, la longueur des fuyantes et les pointillés."),
        t("Seules les arêtes du sommet arrière en bas à gauche sont cachées."),
      ],
    ],
    figure: { type: "cavaliere", dessin: copie },
    corrige: { droites: [], plans: [], sections: false, points: [], dessin: juste },
    tableau: { controles: tabCtrl, correction: tabCorr },
  };
}
