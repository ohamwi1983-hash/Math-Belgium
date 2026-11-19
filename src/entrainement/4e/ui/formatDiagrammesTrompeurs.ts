import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/corrigeTableau";
import type {
  ConditionGroupe,
  ExerciceBatons,
  ExerciceCirculaire,
  ExerciceDiagrammesTrompeurs,
  ExerciceTrompeurBarres,
  ExerciceTrompeurCirculaire,
  Manipulation,
} from "../core/diagrammesTrompeurs.types";
import {
  angleSecteur,
  coefficientLongueurs,
  coefficientSuggere,
  contexteBatons,
  derniere,
  effectifGroupe,
  evolutionAffichee,
  evolutionReelle,
  hauteurDessinee,
  indicesGroupe,
  net,
  pourcentageGroupe,
  pourcentageSecteur,
  premiere,
  sommeParts,
  totalBatons,
  totalReponses,
} from "../moteur/modeleDiagrammesTrompeurs";
import { nombreAffiche as nb, nombreLatex as nl } from "./formatNombreDiagrammes";

/**
 * Textes de gen111 (« Diagrammes et graphiques trompeurs ») : énoncé, consignes et champs de chaque
 * écran, aides, réponses attendues, explications. UNE seule source pour l'écran interactif et
 * l'adaptateur papier (`generateurs/diagrammesTrompeurs/exportEvaluation.ts`).
 *
 * Aides : une phrase terminée par « : » puis la formule en LaTeX ; elles ne donnent jamais la réponse
 * finale (il reste toujours au moins un calcul ou une lecture).
 */

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export interface ChampAttendu {
  /** Première colonne (tableau) ou libellé (liste). */
  libelle: FragmentConsigne[];
  /** Colonnes DONNÉES du tableau (entre le libellé et la saisie). */
  cellules: string[];
  attendu: number;
  /** Unité affichée après le champ (« % », « ° », « vélos »…) ; vide si aucune. */
  unite: string;
  /** Message quand ce champ est faux (plusieurs champs). */
  aRevoir: string;
}

export interface EcranChamps {
  genre: "champs";
  titre: string;
  consigne: FragmentConsigne[];
  disposition: "tableau" | "liste";
  /** En-têtes du tableau : libellé, colonnes données, saisie. */
  entetes: FragmentConsigne[][];
  champs: ChampAttendu[];
  aides: FragmentConsigne[][];
  aideSaisie: string;
}

export interface EcranChoix {
  genre: "choix";
  titre: string;
  consigne: FragmentConsigne[];
  options: { id: Manipulation; fragments: FragmentConsigne[] }[];
  attendue: Manipulation;
  aides: FragmentConsigne[][];
}

export type EcranDiagrammes = EcranChamps | EcranChoix;

const SAISIE_POURCENT = "Écris un nombre, avec une virgule si besoin (par exemple 37,5). Le signe % est facultatif.";
const SAISIE_ANGLE = "Écris un nombre entier de degrés (par exemple 126). Le signe ° est facultatif.";
const SAISIE_ENTIER = "Écris un nombre entier.";

const t = texte;
const L = latex;

function guillemets(nom: string): string {
  return `« ${nom} »`;
}

/** 0,375 pour 37,5 % (LaTeX). */
function decimalLatex(pourcent: number): string {
  return nl(net(pourcent / 100));
}

// ---------------------------------------------------------------------------------------------
// Libellés des manipulations (écran 1 des graphiques trompeurs)
// ---------------------------------------------------------------------------------------------

export const LIBELLES_MANIPULATIONS: Record<Manipulation, string> = {
  "axe-tronque": "L'axe vertical ne commence pas à 0 (axe tronqué).",
  "echelle-irreguliere": "Les graduations de l'axe vertical ne sont pas régulières.",
  pictogrammes: "Les dessins sont agrandis en hauteur et en largeur : leur aire grandit plus vite que la valeur.",
  "total-faux": "Les pourcentages affichés ne totalisent pas 100 %.",
};

export const NOMS_MANIPULATIONS: Record<Manipulation, string> = {
  "axe-tronque": "axe vertical tronqué",
  "echelle-irreguliere": "graduations irrégulières",
  pictogrammes: "pictogrammes agrandis dans les deux dimensions",
  "total-faux": "parts dont le total ne fait pas 100 %",
};

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export function consigneGenerale(e: ExerciceDiagrammesTrompeurs): string {
  switch (e.sousType) {
    case "direct":
      return "On veut représenter cette série par un diagramme circulaire.";
    case "inverse":
      return "Retrouve, à partir du diagramme circulaire, la fréquence puis l'effectif de chaque catégorie.";
    case "circulaire":
    case "batons":
      return "Lis le diagramme pour répondre aux questions.";
    case "total-faux":
      return "Ce diagramme est trompeur. Trouve pourquoi, puis interprète correctement les pourcentages.";
    default:
      return "Ce graphique est trompeur. Trouve pourquoi, puis corrige le slogan.";
  }
}

function phraseCirculaire(e: ExerciceCirculaire): string {
  return e.contexte.phrase.replace("{n}", nb(e.n));
}

/** Slogan affiché sous un graphique trompeur à barres (évolution suggérée par le dessin). */
export function slogan(e: ExerciceTrompeurBarres): string {
  return `« ${e.contexte.court} : +${nb(evolutionAffichee(e))} % entre ${premiere(e).annee} et ${derniere(e).annee} ! »`;
}

/** Texte de l'énoncé (avant le tableau ou la figure). */
export function enonceExercice(e: ExerciceDiagrammesTrompeurs): FragmentConsigne[] {
  switch (e.sousType) {
    case "direct":
      return [t(`${phraseCirculaire(e)} Voici les résultats.`)];
    case "inverse":
      return [t(`${phraseCirculaire(e)} Le diagramme circulaire ci-dessous donne l'angle de chaque secteur.`)];
    case "circulaire":
      return [t(`${phraseCirculaire(e)} Le diagramme ci-dessous donne la fréquence de chaque réponse, mais l'une d'elles a été effacée.`)];
    case "batons": {
      const ctx = contexteBatons(e);
      return [t(`${ctx.phrase} Les résultats sont représentés par ce diagramme en bâtons.`)];
    }
    case "total-faux":
      return [t(`Un journal publie ce diagramme circulaire, intitulé « ${e.caractere} (${nb(e.n)} ${e.individus}) ».`)];
    case "pictogrammes":
      return [
        t(
          `${e.contexte.auteur} représente ${e.contexte.grandeur} en ${premiere(e).annee} et en ${derniere(e).annee} par des dessins : la hauteur de chaque dessin indique la valeur, lue sur l'axe vertical. Sous le graphique, on peut lire : ${slogan(e)}`,
        ),
      ];
    default:
      return [t(`${e.contexte.auteur} publie ce graphique sur ${e.contexte.grandeur}, avec le slogan : ${slogan(e)}`)];
  }
}

// ---------------------------------------------------------------------------------------------
// Construction des écrans
// ---------------------------------------------------------------------------------------------

function champsFrequences(e: ExerciceCirculaire, donnee: (i: number) => string): ChampAttendu[] {
  return e.secteurs.map((s, i) => ({ libelle: [t(s.nom)], cellules: [donnee(i)], attendu: pourcentageSecteur(e, i), unite: "%", aRevoir: `La fréquence de ${guillemets(s.nom)} est à revoir.` }));
}

function champsEffectifs(e: ExerciceCirculaire): ChampAttendu[] {
  return e.secteurs.map((s, i) => ({ libelle: [t(s.nom)], cellules: [nb(pourcentageSecteur(e, i))], attendu: s.effectif, unite: "", aRevoir: `L'effectif de ${guillemets(s.nom)} est à revoir.` }));
}

function aidesEffectifs(e: ExerciceCirculaire): FragmentConsigne[][] {
  const s0 = e.secteurs[0]!;
  return [
    [t("L'effectif d'une catégorie est sa fréquence appliquée à l'effectif total :"), L("n_i = \\dfrac{f_i}{100} \\times n")],
    [t("Ici, "), L(`n = ${nl(e.n)}`), t(`. Pour ${guillemets(s0.nom)} :`), L(`n = ${decimalLatex(pourcentageSecteur(e, 0))} \\times ${nl(e.n)}`)],
  ];
}

const ENTETE_FREQUENCE: FragmentConsigne[] = [t("Fréquence "), L("f_i"), t(" (%)")];
const ENTETE_EFFECTIF: FragmentConsigne[] = [t("Effectif "), L("n_i")];
const ENTETE_ANGLE: FragmentConsigne[] = [t("Angle (°)")];

function ecransCirculaire(e: ExerciceCirculaire): EcranDiagrammes[] {
  const s0 = e.secteurs[0]!;
  const colonne = [t(e.contexte.colonne)];
  if (e.sousType === "direct") {
    return [
      {
        genre: "champs",
        titre: "Fréquences",
        consigne: [t("Calcule la fréquence de chaque catégorie, en %.")],
        disposition: "tableau",
        entetes: [colonne, ENTETE_EFFECTIF, ENTETE_FREQUENCE],
        champs: champsFrequences(e, (i) => nb(e.secteurs[i]!.effectif)),
        aides: [
          [t("La fréquence d'une catégorie est son effectif divisé par l'effectif total, multiplié par 100 pour l'avoir en % :"), L("f_i = \\dfrac{n_i}{n} \\times 100")],
          [t(`Pour ${guillemets(s0.nom)} :`), L(`f = \\dfrac{${nl(s0.effectif)}}{${nl(e.n)}} \\times 100`), t(". À la fin, vérifie que le total fait 100 %.")],
        ],
        aideSaisie: SAISIE_POURCENT,
      },
      {
        genre: "champs",
        titre: "Angles",
        consigne: [t("Calcule l'angle du secteur de chaque catégorie, en degrés.")],
        disposition: "tableau",
        entetes: [colonne, ENTETE_FREQUENCE, ENTETE_ANGLE],
        champs: e.secteurs.map((s, i) => ({ libelle: [t(s.nom)], cellules: [nb(pourcentageSecteur(e, i))], attendu: angleSecteur(e, i), unite: "°", aRevoir: `L'angle de ${guillemets(s.nom)} est à revoir.` })),
        aides: [
          [t("Le disque entier (360°) représente 100 % : l'angle d'un secteur est proportionnel à sa fréquence :"), L("\\alpha_i = \\dfrac{f_i}{100} \\times 360^{\\circ}")],
          [t(`Pour ${guillemets(s0.nom)} :`), L(`\\alpha = ${decimalLatex(pourcentageSecteur(e, 0))} \\times 360^{\\circ}`), t(". La somme des angles doit valoir 360°.")],
        ],
        aideSaisie: SAISIE_ANGLE,
      },
    ];
  }
  if (e.sousType === "inverse") {
    return [
      {
        genre: "champs",
        titre: "Fréquences",
        consigne: [t("Calcule la fréquence de chaque catégorie, en %.")],
        disposition: "tableau",
        entetes: [colonne, ENTETE_ANGLE, ENTETE_FREQUENCE],
        champs: champsFrequences(e, (i) => nb(angleSecteur(e, i))),
        aides: [
          [t("Le disque entier (360°) représente 100 % : la fréquence est la part de 360° occupée par le secteur :"), L("f_i = \\dfrac{\\alpha_i}{360^{\\circ}} \\times 100")],
          [t(`Pour ${guillemets(s0.nom)} :`), L(`f = \\dfrac{${nl(angleSecteur(e, 0))}}{360} \\times 100`)],
        ],
        aideSaisie: SAISIE_POURCENT,
      },
      {
        genre: "champs",
        titre: "Effectifs",
        consigne: [t(`Calcule l'effectif de chaque catégorie (il y a ${nb(e.n)} ${e.contexte.individus} en tout).`)],
        disposition: "tableau",
        entetes: [colonne, ENTETE_FREQUENCE, ENTETE_EFFECTIF],
        champs: champsEffectifs(e),
        aides: aidesEffectifs(e),
        aideSaisie: SAISIE_ENTIER,
      },
    ];
  }
  // Lecture d'un diagramme circulaire en pourcentages, une part effacée.
  const inconnu = e.inconnu!;
  const connus = e.secteurs.map((_, i) => i).filter((i) => i !== inconnu);
  return [
    {
      genre: "champs",
      titre: "Part effacée",
      consigne: [t(`Quel est le pourcentage de la part ${guillemets(e.secteurs[inconnu]!.nom)} ?`)],
      disposition: "liste",
      entetes: [],
      champs: [{ libelle: [t(`Part ${guillemets(e.secteurs[inconnu]!.nom)}`)], cellules: [], attendu: pourcentageSecteur(e, inconnu), unite: "%", aRevoir: "" }],
      aides: [
        [t("Les fréquences de toutes les parts d'un diagramme circulaire totalisent 100 % :"), L("f_1 + f_2 + \\ldots = 100")],
        [t("Additionne d'abord les pourcentages connus :"), L(connus.map((i) => nl(pourcentageSecteur(e, i))).join(" + "))],
      ],
      aideSaisie: SAISIE_POURCENT,
    },
    {
      genre: "champs",
      titre: "Effectifs",
      consigne: [t(`Calcule l'effectif de chaque catégorie (il y a ${nb(e.n)} ${e.contexte.individus} en tout).`)],
      disposition: "tableau",
      entetes: [colonne, ENTETE_FREQUENCE, ENTETE_EFFECTIF],
      champs: champsEffectifs(e),
      aides: aidesEffectifs(e),
      aideSaisie: SAISIE_ENTIER,
    },
  ];
}

function motCondition(c: ConditionGroupe): string {
  return c === "au-moins" ? "au moins" : c === "au-plus" ? "au plus" : c === "plus-de" ? "plus de" : "moins de";
}

/** « 2, 3 et 4 » */
function enumeration(valeurs: string[]): string {
  return valeurs.length <= 1 ? (valeurs[0] ?? "") : `${valeurs.slice(0, -1).join(", ")} et ${valeurs[valeurs.length - 1]}`;
}

export function questionGroupe(e: ExerciceBatons): string {
  const ctx = contexteBatons(e);
  return `Quel pourcentage des ${ctx.individus} ${ctx.groupe(e.condition, e.seuil)} ?`;
}

function ecransBatons(e: ExerciceBatons): EcranDiagrammes[] {
  const groupe = indicesGroupe(e);
  return [
    {
      genre: "champs",
      titre: "Effectifs",
      consigne: [t("Lis sur le diagramme l'effectif de chaque valeur.")],
      disposition: "tableau",
      entetes: [[t("Valeur "), L("x_i")], ENTETE_EFFECTIF],
      champs: e.valeurs.map((v) => ({ libelle: [t(nb(v.x))], cellules: [], attendu: v.effectif, unite: "", aRevoir: `L'effectif de la valeur ${nb(v.x)} est à revoir.` })),
      aides: [
        [t("La hauteur de chaque bâton, lue sur l'axe vertical, donne l'effectif de la valeur écrite en dessous.")],
        [t("Suis l'horizontale qui part du sommet de chaque bâton jusqu'à l'axe vertical : chaque ligne du quadrillage vaut 1.")],
      ],
      aideSaisie: SAISIE_ENTIER,
    },
    {
      genre: "champs",
      titre: "Effectif total",
      consigne: [t("Quel est l'effectif total ?")],
      disposition: "liste",
      entetes: [],
      champs: [{ libelle: [L("n =")], cellules: [], attendu: totalBatons(e), unite: "", aRevoir: "" }],
      aides: [
        [t("L'effectif total est la somme de tous les effectifs :"), L("n = n_1 + n_2 + \\ldots")],
        [t("Additionne les effectifs lus :"), L(e.valeurs.map((v) => nl(v.effectif)).join(" + "))],
      ],
      aideSaisie: SAISIE_ENTIER,
    },
    {
      genre: "champs",
      titre: "Pourcentage",
      consigne: [t(questionGroupe(e))],
      disposition: "liste",
      entetes: [],
      champs: [{ libelle: [t("Pourcentage")], cellules: [], attendu: pourcentageGroupe(e), unite: "%", aRevoir: "" }],
      aides: [
        [t(`Les valeurs concernées (${motCondition(e.condition)} ${nb(e.seuil)}) sont ${enumeration(groupe.map((i) => nb(e.valeurs[i]!.x)))} : additionne leurs effectifs.`)],
        [t("Divise ensuite par l'effectif total et multiplie par 100 :"), L(`\\dfrac{\\ldots}{${nl(totalBatons(e))}} \\times 100`)],
      ],
      aideSaisie: SAISIE_POURCENT,
    },
  ];
}

function ecranManipulation(e: ExerciceTrompeurBarres | ExerciceTrompeurCirculaire): EcranChoix {
  return {
    genre: "choix",
    titre: "Manipulation",
    consigne: [t(`Qu'est-ce qui rend ce ${e.sousType === "total-faux" ? "diagramme" : "graphique"} trompeur ?`)],
    options: e.options.map((id) => ({ id, fragments: [t(LIBELLES_MANIPULATIONS[id])] })),
    attendue: e.sousType,
    aides: [
      [t("Regarde d'abord l'axe vertical, s'il y en a un : où commence-t-il ? Ses graduations sont-elles régulières ?")],
      [t("Compare ensuite ce que montre le dessin aux nombres écrits : l'œil compare des hauteurs de barres, mais des aires de dessins ; et les parts d'un tout doivent totaliser 100 %.")],
    ],
  };
}

const FORMULE_EVOLUTION: FragmentConsigne[] = [
  t("Le pourcentage d'évolution compare l'augmentation à la valeur de départ "),
  L("V_1"),
  t(" (valeur d'arrivée "),
  L("V_2"),
  t(") :"),
  L("\\dfrac{V_2 - V_1}{V_1} \\times 100"),
];

export function questionEvolution(e: ExerciceTrompeurBarres): string {
  return `Calcule le vrai pourcentage d'augmentation ${e.contexte.complement} entre ${premiere(e).annee} et ${derniere(e).annee}.`;
}

function ecransTrompeurBarres(e: ExerciceTrompeurBarres): EcranDiagrammes[] {
  const p = premiere(e);
  const d = derniere(e);
  const sommet = e.sousType === "pictogrammes" ? "du sommet de chaque dessin" : "du sommet de chaque barre";
  return [
    ecranManipulation(e),
    {
      genre: "champs",
      titre: "Vraies valeurs",
      consigne: [t(`Lis sur l'axe vertical les vraies valeurs de ${p.annee} et de ${d.annee}.`)],
      disposition: "liste",
      entetes: [],
      champs: [
        { libelle: [t(`En ${p.annee}`)], cellules: [], attendu: p.valeur, unite: e.contexte.unite, aRevoir: `La valeur de ${p.annee} est à revoir.` },
        { libelle: [t(`En ${d.annee}`)], cellules: [], attendu: d.valeur, unite: e.contexte.unite, aRevoir: `La valeur de ${d.annee} est à revoir.` },
      ],
      aides: [
        [t(`Les valeurs se lisent sur l'axe vertical, en face ${sommet} — pas en comptant les carreaux depuis le bas.`)],
        [t(`Les graduations écrites sont, de bas en haut : ${enumeration(e.graduations.map(nb))}.`)],
      ],
      aideSaisie: SAISIE_ENTIER,
    },
    {
      genre: "champs",
      titre: "Slogan corrigé",
      consigne: [t(`${questionEvolution(e)} Le slogan annonce +${nb(evolutionAffichee(e))} %.`)],
      disposition: "liste",
      entetes: [],
      champs: [{ libelle: [t("Évolution réelle : +")], cellules: [], attendu: evolutionReelle(e), unite: "%", aRevoir: "" }],
      aides: [FORMULE_EVOLUTION, [t("Ici :"), L(`\\dfrac{${nl(d.valeur)} - ${nl(p.valeur)}}{${nl(p.valeur)}} \\times 100`)]],
      aideSaisie: SAISIE_POURCENT,
    },
  ];
}

export function questionReponses(e: ExerciceTrompeurCirculaire): string {
  return `En réalité, chaque personne interrogée pouvait citer plusieurs ${e.objet}. Combien de réponses ont été données au total ?`;
}

function ecransTotalFaux(e: ExerciceTrompeurCirculaire): EcranDiagrammes[] {
  const p0 = e.parts[0]!;
  return [
    ecranManipulation(e),
    {
      genre: "champs",
      titre: "Somme des pourcentages",
      consigne: [t("Calcule la somme des pourcentages affichés.")],
      disposition: "liste",
      entetes: [],
      champs: [{ libelle: [t("Somme")], cellules: [], attendu: sommeParts(e), unite: "%", aRevoir: "" }],
      aides: [[t("Dans un vrai diagramme circulaire, les parts découpent un tout : leur somme vaut 100 %.")], [t("Additionne :"), L(e.parts.map((p) => nl(p.pourcentage)).join(" + "))]],
      aideSaisie: SAISIE_POURCENT,
    },
    {
      genre: "champs",
      titre: "Nombre de réponses",
      consigne: [t(questionReponses(e))],
      disposition: "liste",
      entetes: [],
      champs: [{ libelle: [t("Nombre de réponses")], cellules: [], attendu: totalReponses(e), unite: "", aRevoir: "" }],
      aides: [
        [t(`Chaque pourcentage est calculé sur les ${nb(e.n)} ${e.individus}. Par exemple, la part ${guillemets(p0.nom)} représente ce nombre de réponses :`), L(`\\dfrac{${nl(p0.pourcentage)}}{100} \\times ${nl(e.n)}`)],
        [t("Fais de même avec la somme des pourcentages :"), L(`\\dfrac{${nl(sommeParts(e))}}{100} \\times ${nl(e.n)}`)],
      ],
      aideSaisie: SAISIE_ENTIER,
    },
  ];
}

export function ecransExercice(e: ExerciceDiagrammesTrompeurs): EcranDiagrammes[] {
  switch (e.sousType) {
    case "direct":
    case "inverse":
    case "circulaire":
      return ecransCirculaire(e as ExerciceCirculaire);
    case "batons":
      return ecransBatons(e);
    case "total-faux":
      return ecransTotalFaux(e);
    default:
      return ecransTrompeurBarres(e as ExerciceTrompeurBarres);
  }
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues et explications
// ---------------------------------------------------------------------------------------------

/** Valeur attendue avec son unité (« 37,5 % », « 126° », « 1080 vélos »). */
export function valeurAvecUnite(champ: ChampAttendu): string {
  const v = nb(champ.attendu);
  return champ.unite === "%" ? `${v} %` : champ.unite === "°" ? `${v}°` : champ.unite ? `${v} ${champ.unite}` : v;
}

/** « Bus : 37,5 % » — une ligne par champ. */
export function ligneAttendue(champ: ChampAttendu): FragmentConsigne[] {
  const premier = champ.libelle[0];
  if (premier?.type === "latex") return [L(`${premier.valeur} ${nl(champ.attendu)}`)];
  const libelle = champ.libelle.map((f) => f.valeur).join("");
  if (libelle.endsWith(": +")) return [t(`${libelle}${valeurAvecUnite(champ)}`)];
  return [t(`${libelle} : ${valeurAvecUnite(champ)}`)];
}

/** Pourquoi le dessin trompe (réponse de l'écran 1, corrigé). */
export function explicationManipulation(e: ExerciceTrompeurBarres | ExerciceTrompeurCirculaire): FragmentConsigne[] {
  if (e.sousType === "total-faux") {
    return [
      t(
        `Les pourcentages totalisent ${nb(sommeParts(e))} %, et non 100 % : les parts ne découpent pas un tout. Des personnes sont comptées dans plusieurs parts, et le disque, entièrement rempli, fausse la taille de chaque part. Un diagramme circulaire ne convient pas ici (un diagramme en barres, oui).`,
      ),
    ];
  }
  const p = premiere(e);
  const d = derniere(e);
  const h1 = hauteurDessinee(e, p.valeur);
  const h2 = hauteurDessinee(e, d.valeur);
  const coef = nb(coefficientSuggere(e));
  const pluriel = (h: number) => (h > 1 ? "graduations" : "graduation");
  if (e.sousType === "axe-tronque") {
    return [
      t(
        `L'axe vertical commence à ${nb(e.graduations[0]!)}, pas à 0 : la barre de ${p.annee} mesure ${h1} ${pluriel(h1)} et celle de ${d.annee} en mesure ${h2}. Elle paraît ${coef} fois plus haute (d'où « +${nb(evolutionAffichee(e))} % »), alors que la valeur passe seulement de ${nb(p.valeur)} à ${nb(d.valeur)}.`,
      ),
    ];
  }
  if (e.sousType === "echelle-irreguliere") {
    const g = e.graduations;
    const grand = g[1]! - g[0]!;
    const petit = g[g.length - 1]! - g[g.length - 2]!;
    return [
      t(
        `Les graduations sont régulièrement espacées, mais pas les valeurs : un intervalle vaut d'abord ${nb(grand)}, puis seulement ${nb(petit)}. La barre de ${d.annee} paraît ${coef} fois plus haute que celle de ${p.annee} (d'où « +${nb(evolutionAffichee(e))} % »), alors que la valeur passe seulement de ${nb(p.valeur)} à ${nb(d.valeur)}.`,
      ),
    ];
  }
  const k = coefficientLongueurs(e);
  return [
    t(`Le dessin de ${d.annee} est ${nb(k)} fois plus haut ET ${nb(k)} fois plus large que celui de ${p.annee} : son aire est `),
    L(`${nl(k)}^2 = ${nl(net(k * k))}`),
    t(` fois plus grande (d'où « +${nb(evolutionAffichee(e))} % »), alors que la valeur n'est multipliée que par ${nb(k)}.`),
  ];
}

/** Ligne « Piège » ciblée du corrigé. */
export function piege(e: ExerciceDiagrammesTrompeurs): FragmentConsigne[] {
  switch (e.sousType) {
    case "direct":
      return [t("Confondre la fréquence et l'angle : 25 % ne fait pas 25°, mais 25 % de 360°, soit 90°. Contrôle : les angles totalisent 360°.")];
    case "inverse":
      return [t("Diviser l'angle par 100 au lieu de 360 : c'est le disque entier (360°) qui représente 100 %.")];
    case "circulaire":
      return [t("Oublier de diviser le pourcentage par 100 avant de l'appliquer à l'effectif total ; contrôle : les effectifs totalisent l'effectif total.")];
    case "batons":
      return [
        t(
          e.condition === "au-moins" || e.condition === "au-plus"
            ? `« ${motCondition(e.condition)} ${nb(e.seuil)} » inclut la valeur ${nb(e.seuil)} elle-même.`
            : `« ${motCondition(e.condition)} ${nb(e.seuil)} » exclut la valeur ${nb(e.seuil)} elle-même.`,
        ),
      ];
    case "axe-tronque":
      return [t("Comparer les hauteurs des barres au lieu des valeurs lues sur l'axe : un axe qui ne part pas de 0 exagère les écarts.")];
    case "echelle-irreguliere":
      return [t("Compter les carreaux au lieu de lire les graduations : sur une échelle irrégulière, deux carreaux ne représentent pas le même écart.")];
    case "pictogrammes":
      return [t("Comparer les aires des dessins au lieu de leurs hauteurs : agrandir un dessin dans les deux sens multiplie son aire par le carré du coefficient.")];
    case "total-faux":
      return [t("Lire chaque part comme une fraction du disque : quand le total dépasse 100 %, une même personne figure dans plusieurs parts.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Calculs détaillés (corrigé papier, réponses révélées)
// ---------------------------------------------------------------------------------------------

/** Calcul détaillé d'un champ (sans la réponse finale si `sansResultat`). */
export function calculChamp(e: ExerciceDiagrammesTrompeurs, ecran: number, i: number): FragmentConsigne[] {
  const champ = (ecransExercice(e)[ecran] as EcranChamps).champs[i]!;
  const res = nl(champ.attendu);
  if (e.sousType === "direct" || e.sousType === "inverse" || e.sousType === "circulaire") {
    const c = e as ExerciceCirculaire;
    const s = c.secteurs[i];
    if (e.sousType === "circulaire" && ecran === 0) {
      const connus = c.secteurs.map((_, j) => j).filter((j) => j !== c.inconnu);
      return [t(`Part ${guillemets(c.secteurs[c.inconnu!]!.nom)} :`), L(`100 - (${connus.map((j) => nl(pourcentageSecteur(c, j))).join(" + ")}) = ${res}\\ \\%`)];
    }
    const etiquette = t(`${s!.nom} :`);
    const premierEcranDirect = e.sousType === "direct" && ecran === 0;
    const premierEcranInverse = e.sousType === "inverse" && ecran === 0;
    if (premierEcranDirect) return [etiquette, L(`\\dfrac{${nl(s!.effectif)}}{${nl(c.n)}} \\times 100 = ${res}\\ \\%`)];
    if (e.sousType === "direct") return [etiquette, L(`${decimalLatex(pourcentageSecteur(c, i))} \\times 360^{\\circ} = ${res}^{\\circ}`)];
    if (premierEcranInverse) return [etiquette, L(`\\dfrac{${nl(angleSecteur(c, i))}}{360} \\times 100 = ${res}\\ \\%`)];
    return [etiquette, L(`${decimalLatex(pourcentageSecteur(c, i))} \\times ${nl(c.n)} = ${res}`)];
  }
  if (e.sousType === "batons") {
    if (ecran === 0) return [t(`Valeur ${nb(e.valeurs[i]!.x)} : `), L(`n_i = ${res}`)];
    if (ecran === 1) return [L(`n = ${e.valeurs.map((v) => nl(v.effectif)).join(" + ")} = ${res}`)];
    const groupe = indicesGroupe(e);
    return [
      t(`Valeurs ${enumeration(groupe.map((j) => nb(e.valeurs[j]!.x)))} :`),
      L(`${groupe.map((j) => nl(e.valeurs[j]!.effectif)).join(" + ")} = ${nl(effectifGroupe(e))}`),
      t(` ${contexteBatons(e).individus}, soit `),
      L(`\\dfrac{${nl(effectifGroupe(e))}}{${nl(totalBatons(e))}} \\times 100 = ${res}\\ \\%`),
    ];
  }
  if (e.sousType === "total-faux") {
    if (ecran === 1) return [L(`${e.parts.map((p) => nl(p.pourcentage)).join(" + ")} = ${res}\\ \\%`)];
    return [L(`\\dfrac{${nl(sommeParts(e))}}{100} \\times ${nl(e.n)} = ${res}`), t(` réponses pour ${nb(e.n)} ${e.individus}.`)];
  }
  const b = e as ExerciceTrompeurBarres;
  if (ecran === 1) return ligneAttendue(champ);
  const p = premiere(b).valeur;
  const d = derniere(b).valeur;
  return [L(`\\dfrac{${nl(d)} - ${nl(p)}}{${nl(p)}} \\times 100 = ${res}`), t(` : les valeurs ont augmenté de ${nb(evolutionReelle(b))} %, et non de ${nb(evolutionAffichee(b))} %.`)];
}

/** Réponse attendue d'un écran, une ligne par champ (écran interactif). */
export function reponseEcran(e: ExerciceDiagrammesTrompeurs, ecran: number): FragmentConsigne[][] {
  const ec = ecransExercice(e)[ecran]!;
  if (ec.genre === "choix") return [[t(LIBELLES_MANIPULATIONS[ec.attendue])]];
  return ec.champs.map((c) => ligneAttendue(c));
}
