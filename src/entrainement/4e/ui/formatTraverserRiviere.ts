import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceTraverserRiviere, GrandeurRiviere, SituationRiviere } from "../core/traverserRiviere.types";
import {
  abscisseAccostage,
  arrondi,
  duree,
  ecransDe,
  estDecimalCourt,
  estExacte,
  valeurAffichee,
  vitesseReelle,
} from "../moteur/modeleTraverserRiviere";
import type { StatutChamp } from "../moteur/verificationTraverserRiviere";
import { nombreFr, nombreFrLatex } from "./nombreFr";

/**
 * Textes de gen87 (écran ET papier : une seule source). Notation du chapitre 6 : vecteurs
 * `\vec{v_p}` (vitesse propre), `\vec{v_c}` (courant), `\vec{v_R}` (vitesse réelle, la résultante),
 * composantes en colonne `\begin{pmatrix} x \\ y \end{pmatrix}`, composante notée `x_{\vec{v_R}}`
 * (comme gen22), norme `\|\vec{v_R}\|`. Virgule décimale, formules toujours en LaTeX, jamais au
 * clavier ; unités m, m/s et s en texte, après une espace insécable.
 */

const NBSP = " ";

/** Nombre en LaTeX, virgule décimale. */
export function n(v: number): string {
  return nombreFrLatex(arrondi(v, 1e6));
}

/** Nombre au carré en LaTeX, entre parenthèses s'il est négatif. */
function carre(v: number): string {
  return v < 0 ? `(${n(v)})^2` : `${n(v)}^2`;
}

export function colonne(x: string, y: string): string {
  return `\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;
}

export const VP = "\\vec{v_p}";
export const VC = "\\vec{v_c}";
export const VR = "\\vec{v_R}";
export const SOMME = `${VR} = ${VP} + ${VC}`;

const SUJETS: Record<SituationRiviere, { un: string; le: string; du: string; verbe: string }> = {
  bateau: { un: "Un bateau à moteur", le: "le bateau", du: "du bateau", verbe: "navigue" },
  nageur: { un: "Un nageur", le: "le nageur", du: "du nageur", verbe: "nage" },
  kayak: { un: "Un kayakiste", le: "le kayakiste", du: "du kayakiste", verbe: "pagaie" },
  bac: { un: "Un bac (bateau de passage entre les deux rives)", le: "le bac", du: "du bac", verbe: "navigue" },
};

export function sujet(e: ExerciceTraverserRiviere): string {
  return SUJETS[e.situation].le;
}

/** « du bateau », « du nageur »… */
export function duSujet(e: ExerciceTraverserRiviere): string {
  return SUJETS[e.situation].du;
}

function majuscule(s: string): string {
  return s.replace(/^./, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------------------------
// Unités, libellés
// ---------------------------------------------------------------------------------------------

export function uniteDe(g: GrandeurRiviere): string {
  if (g === "duree" || g === "dureeEnFace") return "s";
  if (g === "accostage" || g === "distance") return "m";
  return "m/s";
}

/** Membre de gauche (LaTeX) d'une grandeur. */
export function nomGrandeur(g: GrandeurRiviere): string {
  switch (g) {
    case "vRx":
      return `x_{${VR}}`;
    case "vRy":
      return `y_{${VR}}`;
    case "duree":
    case "dureeEnFace":
      return "t";
    case "accostage":
      return "x_A";
    case "vitesse":
      return `\\|${VR}\\|`;
    case "distance":
      return "DA";
    case "compensation":
      return `x_{${VP}}`;
    case "pythagore":
      return `y_{${VP}}`;
  }
}

export interface ChampEcran {
  grandeur: GrandeurRiviere;
  libelle: FragmentConsigne[];
  unite: string;
  placeholder: string;
  /** La forme exacte « rac(…) » a du sens pour ce champ (norme, Pythagore). */
  racine: boolean;
}

export function champsEcran(e: ExerciceTraverserRiviere, ecran: number): ChampEcran[] {
  return ecransDe(e)[ecran]!.map((g) => ({
    grandeur: g,
    libelle: [latex(`${nomGrandeur(g)} =`)],
    unite: uniteDe(g),
    placeholder: uniteDe(g) === "m/s" ? "ex : 2,5" : "ex : 45",
    racine: g === "vitesse" || g === "distance" || g === "pythagore",
  }));
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

function grandeurUnite(nom: string, v: number, unite: string): FragmentConsigne[] {
  return [latex(`${nom} = ${n(v)}`), texte(`${NBSP}${unite}`)];
}

export function enonceFragments(e: ExerciceTraverserRiviere): FragmentConsigne[] {
  const s = SUJETS[e.situation];
  const riviere: FragmentConsigne[] = [
    texte(e.variante === "enFace" ? `${s.un} part du point D et veut traverser une rivière de largeur ` : `${s.un} part du point D pour traverser une rivière de largeur `),
    ...grandeurUnite("L", e.largeur, "m"),
    texte(
      e.variante === "enFace"
        ? " en arrivant exactement au point F, juste en face de D sur l'autre rive. Le courant, parallèle aux rives, a une vitesse de "
        : " ; le point F est juste en face de D, sur l'autre rive. Le courant, parallèle aux rives, a une vitesse de ",
    ),
    ...grandeurUnite("c", e.courant, "m/s"),
    texte(". Repère d'origine D : axe x le long de la rive, dans le sens du courant ; axe y perpendiculaire aux rives, vers l'autre rive ; vitesses en m/s."),
  ];
  if (e.variante === "enFace") {
    return [
      ...riviere,
      texte(` ${majuscule(s.le)} ${s.verbe} à `),
      latex(n(e.normePropre)),
      texte(`${NBSP}m/s par rapport à l'eau : sa vitesse propre `),
      latex(VP),
      texte(" a pour norme "),
      latex(`\\|${VP}\\| = ${n(e.normePropre)}`),
      texte(`${NBSP}m/s, mais sa direction reste à choisir.`),
    ];
  }
  if (e.perpendiculaire) {
    return [
      ...riviere,
      texte(` ${majuscule(s.le)} se dirige perpendiculairement aux rives, avec une vitesse propre (par rapport à l'eau) de `),
      latex(n(e.py)),
      texte(`${NBSP}m/s.`),
    ];
  }
  return [...riviere, texte(` La vitesse propre ${s.du} (par rapport à l'eau) a pour composantes `), latex(`${VP}${colonne(n(e.px), n(e.py))}`), texte(".")];
}

export function consigneGenerale(e: ExerciceTraverserRiviere): string {
  return e.variante === "enFace"
    ? "Travaille avec les composantes des vitesses : trouve la direction à donner à la vitesse propre pour arriver juste en face, puis la durée de la traversée."
    : "Travaille avec les composantes des vitesses : la vitesse réelle est la somme de la vitesse propre et de celle du courant. Trouve où il accoste.";
}

/** Vraies questions de l'énoncé papier. */
export function questionsPapier(e: ExerciceTraverserRiviere): FragmentConsigne[][] {
  const s = sujet(e);
  if (e.variante === "enFace") {
    return [
      [texte("Détermine les composantes de la vitesse propre "), latex(VP), texte(` que ${s} doit adopter (au centième près si nécessaire).`)],
      [texte("Calcule la durée de la traversée (au dixième de seconde près si nécessaire).")],
    ];
  }
  const derniere: FragmentConsigne[] =
    e.quatrieme === "vitesse"
      ? [texte(`Calcule la vitesse réelle ${duSujet(e)}, c'est-à-dire la norme de `), latex(VR), texte(" (au centième près si nécessaire).")]
      : [texte(`Calcule la distance réellement parcourue par ${s}, de D au point d'accostage (au dixième de mètre près si nécessaire).`)];
  return [
    [texte("Calcule la durée de la traversée.")],
    [texte(`Détermine le point A où ${s} accoste : à quelle distance du point F, vers l'aval ?`)],
    derniere,
  ];
}

export function etapesParQuestionPapier(e: ExerciceTraverserRiviere): string[][] {
  return e.variante === "enFace" ? [["a", "b"], ["c"]] : [["a", "b"], ["c"], ["d"]];
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export function titresEcrans(e: ExerciceTraverserRiviere): string[] {
  if (e.variante === "enFace") return ["La compensation du courant", "La composante y (Pythagore)", "La durée de la traversée"];
  return ["La vitesse réelle en composantes", "La durée de la traversée", "Le point d'accostage", e.quatrieme === "vitesse" ? "La vitesse réelle" : "La distance parcourue"];
}

const SI_NECESSAIRE_CENTIEME = " (arrondie au centième si nécessaire)";

/** Consigne de chaque écran. `papier` : titre d'étape du corrigé (infinitif, sans tournure d'écran). */
export function consignesEcrans(e: ExerciceTraverserRiviere, support: "ecran" | "papier"): FragmentConsigne[][] {
  const ecran = support === "ecran";
  const s = sujet(e);
  if (e.variante === "enFace") {
    return [
      ecran
        ? [
            texte("Pour arriver juste en face, la vitesse réelle "),
            latex(SOMME),
            texte(" doit être dirigée selon l'axe y : sa composante x est nulle. Quelle doit être la composante x de la vitesse propre ?"),
          ]
        : [texte("Écrire que la composante x de la vitesse réelle "), latex(SOMME), texte(" est nulle, pour trouver celle de la vitesse propre.")],
      ecran
        ? [texte(`Calcule la composante y de la vitesse propre${SI_NECESSAIRE_CENTIEME}.`)]
        : [texte("Calculer la composante y de la vitesse propre (Pythagore).")],
      ecran ? [texte("Combien de temps dure la traversée ? (arrondie au dixième de seconde si nécessaire)")] : [texte("Calculer la durée de la traversée.")],
    ];
  }
  const consignes: FragmentConsigne[][] = [
    ecran
      ? [texte("Calcule les composantes de la vitesse réelle "), latex(SOMME), texte(" (vitesse par rapport à la rive).")]
      : [texte("Calculer les composantes de la vitesse réelle "), latex(SOMME), texte(".")],
    ecran ? [texte("Combien de temps dure la traversée ?")] : [texte("Calculer la durée de la traversée.")],
    ecran
      ? [texte(`À quelle distance du point F, vers l'aval, ${s} accoste-t-il ? Donne l'abscisse `), latex("x_A"), texte(" du point d'accostage "), latex(`A(x_A\\,;\\,${n(e.largeur)})`), texte(".")]
      : [texte("Déterminer l'abscisse "), latex("x_A"), texte(" du point d'accostage "), latex(`A(x_A\\,;\\,${n(e.largeur)})`), texte(".")],
  ];
  if (e.quatrieme === "vitesse") {
    consignes.push(
      ecran
        ? [texte(`Quelle est la vitesse réelle ${duSujet(e)}, c'est-à-dire la norme `), latex(`\\|${VR}\\|`), texte(` ?${SI_NECESSAIRE_CENTIEME}`)]
        : [texte("Calculer la vitesse réelle "), latex(`\\|${VR}\\|`), texte(".")],
    );
  } else {
    consignes.push(
      ecran
        ? [texte(`Quelle distance ${s} parcourt-il réellement, de D à A ? (arrondie au dixième de mètre si nécessaire)`)]
        : [texte("Calculer la distance réellement parcourue DA.")],
    );
  }
  return consignes;
}

// ---------------------------------------------------------------------------------------------
// Valeurs attendues (écran, corrigé)
// ---------------------------------------------------------------------------------------------

/** Radicande de la norme d'une grandeur « racine » (vitesse, distance, Pythagore). */
export function radicande(e: ExerciceTraverserRiviere, g: GrandeurRiviere): number {
  if (g === "vitesse") {
    const v = vitesseReelle(e);
    return arrondi(v.x ** 2 + v.y ** 2, 1e6);
  }
  if (g === "distance") return arrondi(abscisseAccostage(e) ** 2 + e.largeur ** 2, 1e6);
  return arrondi(e.normePropre ** 2 - e.courant ** 2, 1e6);
}

/** « = 4,03 », « = \sqrt{13} \approx 3,61 », « \approx 41,6 » : membre de droite d'une réponse. */
export function membreDroit(e: ExerciceTraverserRiviere, g: GrandeurRiviere): string {
  const affichee = n(valeurAffichee(e, g));
  if (estExacte(e, g)) return `= ${affichee}`;
  if (g === "vitesse" || g === "distance" || g === "pythagore") return `= \\sqrt{${n(radicande(e, g))}} \\approx ${affichee}`;
  return `\\approx ${affichee}`;
}

export function resultatFragments(e: ExerciceTraverserRiviere, g: GrandeurRiviere): FragmentConsigne[] {
  return [latex(`${nomGrandeur(g)} ${membreDroit(e, g)}`), texte(`${NBSP}${uniteDe(g)}`)];
}

export function reponseAttendueFragments(e: ExerciceTraverserRiviere, ecran: number): FragmentConsigne[] {
  const grandeurs = ecransDe(e)[ecran]!;
  if (grandeurs.length === 2) {
    const v = vitesseReelle(e);
    return [latex(`${VR}${colonne(n(v.x), n(v.y))}`), texte(`${NBSP}(en m/s)`)];
  }
  return resultatFragments(e, grandeurs[0]!);
}

/** Saisie de l'élève relue dans la fiche de consultation. */
export function saisieTexte(e: ExerciceTraverserRiviere, ecran: number, valeurs: number[]): string {
  const grandeurs = ecransDe(e)[ecran]!;
  const lu = valeurs.map((v) => (estDecimalCourt(v) ? nombreFr(arrondi(v, 100)) : `≈ ${nombreFr(arrondi(v, 100))}`).replace("-", "−"));
  if (grandeurs.length === 2) return `(${lu[0]} ; ${lu[1]}) m/s`;
  return `${lu[0]} ${uniteDe(grandeurs[0]!)}`;
}

// ---------------------------------------------------------------------------------------------
// Aides (2 niveaux par écran ; jamais la réponse finale : il reste toujours un calcul)
// ---------------------------------------------------------------------------------------------

export function aidesEcran(e: ExerciceTraverserRiviere, ecran: number): FragmentConsigne[][] {
  const g = ecransDe(e)[ecran]![0]!;
  const c = n(e.courant);
  const vR = vitesseReelle(e);
  switch (g) {
    case "vRx":
    case "vRy":
      return [
        e.perpendiculaire
          ? [
              texte("Perpendiculaire aux rives, la vitesse propre est dirigée selon l'axe y ; le courant, parallèle aux rives, est dirigé selon l'axe x. Leurs composantes :"),
              latex(`${VP}${colonne("0", n(e.py))} \\qquad ${VC}${colonne(c, "0")}`),
            ]
          : [texte("Le courant est parallèle aux rives, dans le sens de l'axe x : ses composantes sont :"), latex(`${VC}${colonne(c, "0")}`)],
        [texte("On additionne composante par composante :"), latex(`${VR}${colonne(`${n(e.px)} + ${c}`, `${n(e.py)} + 0`)}`)],
      ];
    case "duree":
      return [
        [
          texte("Seule la composante y de la vitesse réelle rapproche de l'autre rive ; la composante x fait glisser le long de la rive sans rapprocher. Il faut parcourir la largeur L selon y :"),
          latex(`t = \\dfrac{L}{y_{${VR}}}`),
        ],
        [texte("Avec la largeur et la composante y de la vitesse réelle :"), latex(`t = \\dfrac{${n(e.largeur)}}{${n(vR.y)}}`)],
      ];
    case "accostage":
      return [
        [texte("Pendant toute la traversée, la composante x de la vitesse réelle fait glisser le long de la rive :"), latex(`x_A = x_{${VR}} \\cdot t`)],
        [texte("Avec la composante x de la vitesse réelle et la durée trouvée :"), latex(`x_A = ${n(vR.x)} \\cdot ${n(duree(e))}`)],
      ];
    case "vitesse":
      return [
        [texte("La norme d'un vecteur se calcule à partir de ses composantes (Pythagore dans le repère) :"), latex(`\\|${VR}\\| = \\sqrt{x_{${VR}}^2 + y_{${VR}}^2}`)],
        [texte("Avec les composantes de la vitesse réelle :"), latex(`\\|${VR}\\| = \\sqrt{${carre(vR.x)} + ${carre(vR.y)}}`)],
      ];
    case "distance":
      return [
        [texte("Le trajet réel est le segment [DA], avec "), latex("D(0\\,;\\,0)"), texte(" et "), latex("A(x_A\\,;\\,L)"), texte(" : c'est la distance entre deux points :"), latex("DA = \\sqrt{x_A^2 + L^2}")],
        [texte("Avec l'abscisse du point d'accostage et la largeur :"), latex(`DA = \\sqrt{${carre(abscisseAccostage(e))} + ${carre(e.largeur)}}`)],
      ];
    case "compensation":
      return [
        [texte(`Le courant pousse vers l'aval (sens de l'axe x) : pour le compenser, ${sujet(e)} doit viser vers l'amont, contre le courant.`)],
        [texte("Le courant a pour composantes "), latex(`${VC}${colonne(c, "0")}`), texte(". Les composantes x s'additionnent et leur somme doit être nulle :"), latex(`x_{${VP}} + ${c} = 0`)],
      ];
    case "pythagore":
      return [
        [texte("La norme de la vitesse propre est connue : Pythagore relie ses deux composantes :"), latex(`x_{${VP}}^2 + y_{${VP}}^2 = \\|${VP}\\|^2`)],
        [
          texte("Avec la norme donnée et la composante x trouvée (la composante y est positive : vers l'autre rive) :"),
          latex(`y_{${VP}} = \\sqrt{${carre(e.normePropre)} - ${carre(-e.courant)}}`),
        ],
      ];
    case "dureeEnFace":
      return [
        [texte("La vitesse réelle est "), latex(`${VR}${colonne("0", `y_{${VP}}`)}`), texte(" : seule sa composante y fait traverser la largeur L :"), latex(`t = \\dfrac{L}{y_{${VP}}}`)],
        [
          texte("Avec la largeur et la composante y trouvée :"),
          latex(`t = \\dfrac{${n(e.largeur)}}{${estExacte(e, "pythagore") ? n(valeurAffichee(e, "pythagore")) : `\\sqrt{${n(radicande(e, "pythagore"))}}`}}`),
        ],
      ];
  }
}

// ---------------------------------------------------------------------------------------------
// Messages d'erreur ciblés
// ---------------------------------------------------------------------------------------------

export function messageStatut(e: ExerciceTraverserRiviere, g: GrandeurRiviere, statut: StatutChamp): string | null {
  switch (statut) {
    case "courant_oublie":
      return "Tu as oublié le courant : il s'ajoute à la composante x de la vitesse propre.";
    case "signe_courant":
      return "Le courant va dans le sens de l'axe x : sa composante x est positive, on l'ajoute.";
    case "courant_mauvaise_composante":
      return "Le courant est parallèle aux rives : il ne change que la composante x, pas la composante y.";
    case "duree_norme":
      return "Le courant ne change pas la durée de la traversée : seule la composante y de la vitesse rapproche de l'autre rive, pas la vitesse réelle tout entière.";
    case "duree_propre":
      return "Divise la largeur par la composante y de la vitesse, pas par la norme de la vitesse propre.";
    case "accostage_sans_px":
      return "La vitesse propre a aussi une composante x : utilise la composante x de la vitesse réelle, pas seulement le courant.";
    case "accostage_norme":
      return "Multiplie la composante x de la vitesse réelle par la durée trouvée à l'écran précédent.";
    case "somme_composantes":
      return "La norme ne s'obtient pas en additionnant les composantes : utilise Pythagore.";
    case "norme_propre":
      return "C'est la norme de la vitesse propre ; on demande celle de la vitesse réelle, courant compris.";
    case "distance_somme":
      return "Le trajet réel est le segment [DA], pas « le long de la rive puis en travers » : utilise Pythagore.";
    case "distance_largeur":
      return `Le courant fait dériver ${sujet(e)} : il parcourt plus que la largeur de la rivière.`;
    case "compensation_signe":
      return "Le courant pousse vers l'aval (x positif) : pour le compenser, la vitesse propre doit viser vers l'amont, avec une composante x négative.";
    case "pythagore_difference":
      return g === "dureeEnFace"
        ? "La composante y de la vitesse propre ne s'obtient pas par une soustraction des normes : reprends-la par Pythagore."
        : "On ne soustrait pas les normes : les composantes se combinent par Pythagore.";
    case "pythagore_somme":
      return "Le carré de la norme est la somme des carrés des composantes : la composante y est donc plus petite que la norme.";
    case "pythagore_norme":
      return "Une partie de la vitesse propre sert à compenser le courant : la composante y est plus petite que la norme.";
    case "duree_enface_norme":
      return "Une partie de la vitesse propre sert à remonter le courant : seule la composante y fait traverser.";
    default:
      return null;
  }
}
