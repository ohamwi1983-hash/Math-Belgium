/**
 * Couche A — famille "revenuPrix" (variante `modelisation`, spec section 3, famille B) : une
 * quantité de référence `Q0` PERD `k` unités pour chaque unité `x` ajoutée à une autre quantité de
 * référence `P0` (le cas le plus intuitif étant "prix" `P0`/"clients" `Q0`, mais la mécanique est
 * générique — voir plus bas). Contrainte donnée SOUS FORME NON ISOLÉE (`y + k·x = Q0`, `y` =
 * quantité restante, écran "isolement") → `y = -k·x + Q0` ; Revenu(x) = (P0+x)·y =
 * -k·x² + (Q0-k·P0)·x + P0·Q0 (écran "construction").
 *
 * **Propreté entière garantie par construction, même technique que `aireEnclos`** : `x_S` est
 * choisi EN PREMIER (entier), puis `Q0 = k·(P0+2·x_S)` est DÉRIVÉ pour que `x_S = (Q0-k·P0)/(2k)`
 * tombe exactement dessus — jamais l'inverse (choisir P0/Q0 au hasard et espérer un sommet entier).
 * `y_S = Revenu(x_S) = k·(P0+x_S)²`, toujours entier. `pente=-k`/`ordonnee=Q0-k·P0=2·k·x_S` de la
 * contrainte isolée sont exactement `a`/`b` de la fonction développée (Revenu(x)=x·contrainte(x) +
 * P0·contrainte(x) — voir le calcul complet en tête de fichier).
 *
 * **Traçabilité de `k`** (correctif `promptcorrectioninterpolationkrevenuPrix.md`) — `k` est
 * interpolé directement dans le template de chaque skin (`phraseEnonce(P0, Q0, k)`), au même titre
 * que `P0`/`Q0` — jamais un remplacement de sous-chaîne magique après coup.
 *
 * **9 thèmes supplémentaires** (`promptcorrectionskinsmanquantsAB.md`, corrige l'audit
 * `promptauditskinsmanquantsgen55.md` qui n'avait trouvé que 5 skins couvrant 2 thèmes réels sur
 * les 11 attendus par la spec) — MÊME mécanique numérique partout, seule la narration change :
 * chaque thème choisit librement d'assigner à `P0` un rôle "quantité comptable à laquelle x
 * s'ajoute" (ex. nombre de représentations, de bovins, de wagons) et à `Q0` un rôle "grandeur qui
 * perd k par unité de x" — soit une quantité brute (ex. autonomie, vitesse max), soit un TAUX "par
 * unité de P0" (ex. spectateurs par représentation, points d'impact par diffusion), auquel cas
 * `P0·Q0` reste dimensionnellement la vraie grandeur totale (spectateurs, points, Mb/s...). Chaque
 * skin porte désormais SES PROPRES `nomGrandeur`/`genreGrandeur`/`uniteGrandeur`/`uniteVariable`/
 * `uniteGrandeurFautive`/aide-contrainte (plutôt que des constantes codées en dur pour toute la
 * famille comme avant ce correctif) — `formuleSubstitueeTexte` reste calculé une seule fois dans
 * `construireRevenuPrix` (algèbre pure, `(P0+x)·(pente·x+ordonnee)`, valable pour TOUS les skins
 * sans exception).
 *
 * **Étape "identifier x et y"** (`spec-gen55-optimisation-second-degre.md`, section 4, écran 1) —
 * TOUJOURS présente sur cette famille (`identificationXY` jamais `undefined`) : aucun des 13 skins ne
 * nomme x/y littéralement dans sa phrase (contrairement à certains skins de `aireEnclos`), donc
 * l'identification n'est jamais triviale. `nomVariableY` (nouveau champ par skin) porte le nom
 * narratif de y, jusqu'ici absent du contrat (seul `contrainte.lettreCherchee="y"` existait, une
 * simple lettre sans description).
 *
 * **"Salle de spectacle" volontairement NON ajoutée comme thème séparé** — signalé plutôt que
 * dupliqué silencieusement (convention CLAUDE.md) : la spec la décrit elle-même comme "déjà proche
 * de billetterie" et demande explicitement de vérifier l'absence de doublon avant de l'ajouter.
 * Toute variante "salle de spectacle" plausible retombe soit sur la mécanique de la skin "salle"
 * déjà présente (tarif × places, hausse de tarif), soit sur celle du nouveau thème "billetterie"
 * (nombre de représentations × spectateurs par représentation) — la spec autorise explicitement de
 * ne pas dupliquer dans ce cas plutôt que de forcer une distinction artificielle.
 */
import type { ExerciceOptimisationModelisation } from "../../../core/optimisation.types";
import { optimumSurDomaine, sommetDansIntervalle } from "../optimum";
import { construireOptionsInterpretation, formatQuestionFinale } from "../interpretation";
import type { GenreGrandeur } from "../interpretation";
import { construireIdentificationXY } from "../identification";
import { randomInt } from "../aleatoire";

interface SkinRevenuPrix {
  phraseEnonce: (P0: number, Q0: number, k: number) => string;
  nomVariable: string;
  /** Nom narratif de "y" (la grandeur qui PERD k par unité de x) — jamais nommé littéralement dans
   * `phraseEnonce` (contrairement à `nomVariable`, x n'est pas non plus nommé littéralement, mais y
   * l'est encore moins : c'est une quantité purement DÉRIVÉE de la situation). Utilisé par l'étape
   * "identifier x et y" (spec section 4, écran 1), TOUJOURS présente sur cette famille — aucun skin
   * de B ne nomme x/y explicitement dans son énoncé, contrairement à certains skins de `aireEnclos`. */
  nomVariableY: string;
  /** Distracteur de l'étape "identifier x et y" pour le candidat Y — la valeur INITIALE (avant toute
   * diminution) de la MÊME grandeur que `nomVariableY` désigne une fois diminuée. Doit nommer
   * EXPLICITEMENT cette grandeur (jamais "cette grandeur"/"cette valeur" générique — bug trouvé en
   * usage réel sur le skin "wagons", `prompt-groupe-corrections-gen55.md`, point 2 : chaque option
   * doit être compréhensible indépendamment de l'autre). */
  nomVariableYInitiale: string;
  nomGrandeur: string;
  genreGrandeur: GenreGrandeur;
  uniteGrandeur: string;
  uniteVariable: string;
  uniteGrandeurFautive: string;
  texteAideContrainteNiveau1: string;
  texteAideContrainteNiveau2: string;
}

const AIDE_PRIX_CLIENTS_NIVEAU1 = "Rappel : chaque € de hausse x fait perdre un nombre fixe de clients — la quantité vendue y en dépend directement.";
const AIDE_PRIX_CLIENTS_NIVEAU2 = "La perte totale de clients au fil de la hausse x et la quantité restante y sont liées par une somme constante, égale à Q0.";

const SKINS: SkinRevenuPrix[] = [
  {
    phraseEnonce: (P0, Q0, k) => `Un commerce vend ${Q0} articles par semaine au prix de ${P0} €. Chaque € de hausse du prix fait perdre ${k} clients par semaine.`,
    nomVariable: "la hausse de prix",
    nomVariableY: "le nombre de clients restants après la hausse",
    nomVariableYInitiale: "le nombre de clients avant toute hausse de prix",
    nomGrandeur: "le revenu",
    genreGrandeur: "masculin",
    uniteGrandeur: "€",
    uniteVariable: "€",
    uniteGrandeurFautive: "clients",
    texteAideContrainteNiveau1: AIDE_PRIX_CLIENTS_NIVEAU1,
    texteAideContrainteNiveau2: AIDE_PRIX_CLIENTS_NIVEAU2,
  },
  {
    phraseEnonce: (P0, Q0, k) => `Une salle loue ${Q0} places par soirée au tarif de ${P0} €. Chaque € de hausse du tarif fait perdre ${k} spectateurs.`,
    nomVariable: "la hausse de tarif",
    nomVariableY: "le nombre de places restant à louer après la hausse",
    nomVariableYInitiale: "le nombre de places louées avant toute hausse de tarif",
    nomGrandeur: "le revenu",
    genreGrandeur: "masculin",
    uniteGrandeur: "€",
    uniteVariable: "€",
    uniteGrandeurFautive: "clients",
    texteAideContrainteNiveau1: AIDE_PRIX_CLIENTS_NIVEAU1,
    texteAideContrainteNiveau2: AIDE_PRIX_CLIENTS_NIVEAU2,
  },
  {
    phraseEnonce: (P0, Q0, k) => `Un club vend ${Q0} abonnements par mois à ${P0} €. Chaque € de hausse de l'abonnement fait perdre ${k} adhérents.`,
    nomVariable: "la hausse de prix",
    nomVariableY: "le nombre d'adhérents restants après la hausse",
    nomVariableYInitiale: "le nombre d'adhérents avant toute hausse de prix",
    nomGrandeur: "le revenu",
    genreGrandeur: "masculin",
    uniteGrandeur: "€",
    uniteVariable: "€",
    uniteGrandeurFautive: "clients",
    texteAideContrainteNiveau1: AIDE_PRIX_CLIENTS_NIVEAU1,
    texteAideContrainteNiveau2: AIDE_PRIX_CLIENTS_NIVEAU2,
  },
  {
    phraseEnonce: (P0, Q0, k) => `Un maraîcher récolte ${Q0} céleris par semaine et les vend à ${P0} €. Chaque € de hausse du prix fait perdre ${k} acheteurs.`,
    nomVariable: "la hausse de prix",
    nomVariableY: "le nombre d'acheteurs restants après la hausse",
    nomVariableYInitiale: "le nombre d'acheteurs avant toute hausse de prix",
    nomGrandeur: "le revenu",
    genreGrandeur: "masculin",
    uniteGrandeur: "€",
    uniteVariable: "€",
    uniteGrandeurFautive: "clients",
    texteAideContrainteNiveau1: AIDE_PRIX_CLIENTS_NIVEAU1,
    texteAideContrainteNiveau2: AIDE_PRIX_CLIENTS_NIVEAU2,
  },
  {
    phraseEnonce: (P0, Q0, k) => `Une coopérative vend ${Q0} boîtes de haricots verts par mois à ${P0} €. Chaque € de hausse du prix fait perdre ${k} acheteurs.`,
    nomVariable: "la hausse de prix",
    nomVariableY: "le nombre d'acheteurs restants après la hausse",
    nomVariableYInitiale: "le nombre d'acheteurs avant toute hausse de prix",
    nomGrandeur: "le revenu",
    genreGrandeur: "masculin",
    uniteGrandeur: "€",
    uniteVariable: "€",
    uniteGrandeurFautive: "clients",
    texteAideContrainteNiveau1: AIDE_PRIX_CLIENTS_NIVEAU1,
    texteAideContrainteNiveau2: AIDE_PRIX_CLIENTS_NIVEAU2,
  },
  // ===== Thème "billetterie" — nombre de représentations × spectateurs par représentation (PAS le
  // prix du billet, volontairement distinct de "salle" ci-dessus). P0 = nombre de représentations
  // (x s'y ajoute), Q0 = spectateurs par représentation (perd k par représentation ajoutée). =====
  {
    phraseEnonce: (P0, Q0, k) => `Une troupe en tournée donne ${P0} représentations dans une région, chacune attirant ${Q0} spectateurs en moyenne. Chaque représentation supplémentaire programmée fait perdre ${k} spectateurs de moyenne par représentation (le public disponible est limité).`,
    nomVariable: "le nombre de représentations supplémentaires",
    nomVariableY: "le nombre moyen de spectateurs restant par représentation",
    nomVariableYInitiale: "le nombre moyen de spectateurs par représentation avant l'ajout de représentations supplémentaires",
    nomGrandeur: "le nombre total de spectateurs",
    genreGrandeur: "masculin",
    uniteGrandeur: "spectateurs",
    uniteVariable: "représentations",
    uniteGrandeurFautive: "représentations",
    texteAideContrainteNiveau1: "Rappel : chaque représentation supplémentaire programmée fait baisser la fréquentation moyenne des autres — les 2 quantités sont liées directement.",
    texteAideContrainteNiveau2: "La perte de fréquentation moyenne au fil des représentations ajoutées x et la fréquentation restante y sont liées par une somme constante, égale à Q0.",
  },
  // ===== Thème "densité de plantation agricole" — rendement total = densité × rendement par plant.
  // P0 = nombre de pieds plantés par hectare (x s'y ajoute), Q0 = rendement par pied, en grammes
  // (perd k par pied supplémentaire planté, compétition pour les ressources). =====
  {
    phraseEnonce: (P0, Q0, k) => `Un agriculteur plante ${P0} pieds de maïs par hectare, chacun produisant en moyenne ${Q0} g de récolte. Chaque pied supplémentaire planté par hectare fait perdre ${k} g de récolte de moyenne par pied (compétition pour l'eau et la lumière).`,
    nomVariable: "le nombre de pieds supplémentaires plantés par hectare",
    nomVariableY: "le rendement moyen restant par pied",
    nomVariableYInitiale: "le rendement moyen par pied avant l'ajout de pieds supplémentaires",
    nomGrandeur: "le rendement total récolté par hectare",
    genreGrandeur: "masculin",
    uniteGrandeur: "g",
    uniteVariable: "pieds",
    uniteGrandeurFautive: "pieds",
    texteAideContrainteNiveau1: "Rappel : chaque pied planté en plus fait baisser le rendement moyen des autres pieds — les 2 quantités sont liées directement.",
    texteAideContrainteNiveau2: "La perte de rendement moyen au fil des pieds ajoutés x et le rendement restant par pied y sont liés par une somme constante, égale à Q0.",
  },
  // ===== Thème "élevage" — nombre d'animaux vs croissance/santé par animal. P0 = nombre de bovins
  // (x s'y ajoute), Q0 = gain de poids quotidien par bovin, en grammes (perd k par bovin
  // supplémentaire introduit, ressources partagées). =====
  {
    phraseEnonce: (P0, Q0, k) => `Un éleveur possède ${P0} bovins dans un pâturage, chacun prenant en moyenne ${Q0} g de poids par jour. Chaque bovin supplémentaire introduit dans le pâturage fait perdre ${k} g de gain de poids quotidien de moyenne par bovin (ressources partagées).`,
    nomVariable: "le nombre de bovins supplémentaires",
    nomVariableY: "le gain de poids quotidien moyen restant par bovin",
    nomVariableYInitiale: "le gain de poids quotidien moyen par bovin avant l'introduction de bovins supplémentaires",
    nomGrandeur: "le gain de poids quotidien total du troupeau",
    genreGrandeur: "masculin",
    uniteGrandeur: "g",
    uniteVariable: "bovins",
    uniteGrandeurFautive: "bovins",
    texteAideContrainteNiveau1: "Rappel : chaque bovin introduit en plus fait baisser le gain de poids moyen des autres — les 2 quantités sont liées directement.",
    texteAideContrainteNiveau2: "La perte de gain moyen au fil des bovins ajoutés x et le gain restant par bovin y sont liés par une somme constante, égale à Q0.",
  },
  // ===== Thème "puissance de chauffe et autonomie (batterie/gaz)". P0 = puissance de chauffe, en
  // watts (x s'y ajoute), Q0 = autonomie à pleine charge, en minutes (perd k minutes par watt
  // supplémentaire). =====
  {
    phraseEnonce: (P0, Q0, k) => `Un chauffage d'appoint sur batterie fonctionne à une puissance de ${P0} W, offrant une autonomie de ${Q0} min à pleine charge. Chaque W de puissance supplémentaire fait perdre ${k} min d'autonomie.`,
    nomVariable: "la puissance de chauffe supplémentaire",
    nomVariableY: "l'autonomie restante",
    nomVariableYInitiale: "l'autonomie à pleine charge, avant toute augmentation de puissance",
    nomGrandeur: "l'énergie totale disponible avant épuisement",
    genreGrandeur: "feminin",
    uniteGrandeur: "W·min",
    uniteVariable: "W",
    uniteGrandeurFautive: "min",
    texteAideContrainteNiveau1: "Rappel : chaque watt de puissance supplémentaire fait baisser l'autonomie restante — les 2 quantités sont liées directement.",
    texteAideContrainteNiveau2: "La perte d'autonomie au fil de la puissance ajoutée x et l'autonomie restante y sont liées par une somme constante, égale à Q0.",
  },
  // ===== Thème "vitesse et endurance sportive" — distance/performance = vitesse × temps tenu,
  // règle explicitée dans le texte (même convention que les skins "abstrait"/"révision"/"budget" de
  // aireEnclos.ts). P0 = vitesse de base, en km/h (x s'y ajoute), Q0 = temps tenu à cette vitesse,
  // en minutes (perd k minutes par km/h supplémentaire, effort accru). =====
  {
    phraseEnonce: (P0, Q0, k) => `Un cycliste roule à une vitesse de base de ${P0} km/h, qu'il peut tenir pendant ${Q0} min. Chaque km/h de vitesse supplémentaire fait perdre ${k} min d'endurance à cette allure. La performance (en points) est définie comme le produit de la vitesse (en km/h) par le temps tenu à cette vitesse (en min).`,
    nomVariable: "la vitesse supplémentaire",
    nomVariableY: "le temps restant que le cycliste peut tenir à cette allure",
    nomVariableYInitiale: "le temps que le cycliste peut tenir à la vitesse de base, avant toute augmentation de vitesse",
    nomGrandeur: "la performance",
    genreGrandeur: "feminin",
    uniteGrandeur: "points",
    uniteVariable: "km/h",
    uniteGrandeurFautive: "min",
    texteAideContrainteNiveau1: "Rappel : chaque km/h de vitesse supplémentaire fait baisser le temps que le cycliste peut tenir — les 2 quantités sont liées directement.",
    texteAideContrainteNiveau2: "La perte de temps tenu au fil de la vitesse ajoutée x et le temps restant y sont liés par une somme constante, égale à Q0.",
  },
  // ===== Thème "publicité/lassitude" — diffusions × efficacité par diffusion. P0 = nombre de
  // diffusions par semaine (x s'y ajoute), Q0 = points d'impact par diffusion (perd k par diffusion
  // supplémentaire, lassitude du public). =====
  {
    phraseEnonce: (P0, Q0, k) => `Une publicité est diffusée ${P0} fois par semaine, chacune générant en moyenne ${Q0} points d'impact. Chaque diffusion supplémentaire par semaine fait perdre ${k} points d'impact de moyenne par diffusion (lassitude du public).`,
    nomVariable: "le nombre de diffusions supplémentaires par semaine",
    nomVariableY: "l'impact moyen restant par diffusion",
    nomVariableYInitiale: "l'impact moyen par diffusion avant l'ajout de diffusions supplémentaires",
    nomGrandeur: "l'impact publicitaire total",
    genreGrandeur: "masculin",
    uniteGrandeur: "points",
    uniteVariable: "diffusions",
    uniteGrandeurFautive: "diffusions",
    texteAideContrainteNiveau1: "Rappel : chaque diffusion supplémentaire fait baisser l'impact moyen des autres diffusions — les 2 quantités sont liées directement.",
    texteAideContrainteNiveau2: "La perte d'impact moyen au fil des diffusions ajoutées x et l'impact restant par diffusion y sont liés par une somme constante, égale à Q0.",
  },
  // ===== Thème "débit internet partagé entre connexions simultanées". P0 = nombre de connexions
  // simultanées (x s'y ajoute), Q0 = débit par connexion, en Mb/s (perd k Mb/s par connexion
  // supplémentaire, partage de la bande passante). =====
  {
    phraseEnonce: (P0, Q0, k) => `Une box internet répartit son débit entre ${P0} connexions simultanées, chacune bénéficiant en moyenne de ${Q0} Mb/s. Chaque connexion supplémentaire fait perdre ${k} Mb/s de moyenne à chacune (partage de la bande passante).`,
    nomVariable: "le nombre de connexions supplémentaires",
    nomVariableY: "le débit moyen restant par connexion",
    nomVariableYInitiale: "le débit moyen par connexion avant l'ajout de connexions supplémentaires",
    nomGrandeur: "le débit total utilisé",
    genreGrandeur: "masculin",
    uniteGrandeur: "Mb/s",
    uniteVariable: "connexions",
    uniteGrandeurFautive: "connexions",
    texteAideContrainteNiveau1: "Rappel : chaque connexion supplémentaire fait baisser le débit moyen des autres — les 2 quantités sont liées directement.",
    texteAideContrainteNiveau2: "La perte de débit moyen au fil des connexions ajoutées x et le débit restant par connexion y sont liés par une somme constante, égale à Q0.",
  },
  // ===== Thème "nombre de wagons d'une locomotive et vitesse maximale atteignable" — capacité de
  // transport = wagons × vitesse max, règle explicitée dans le texte. P0 = nombre de wagons
  // (x s'y ajoute), Q0 = vitesse maximale atteignable, en km/h (perd k km/h par wagon
  // supplémentaire attelé, surcharge). =====
  {
    phraseEnonce: (P0, Q0, k) => `Une locomotive tire ${P0} wagons à une vitesse maximale de ${Q0} km/h. Chaque wagon supplémentaire attelé fait perdre ${k} km/h à la vitesse maximale atteignable (surcharge). La capacité de transport (en points) est définie comme le produit du nombre de wagons par la vitesse maximale atteignable (en km/h).`,
    nomVariable: "le nombre de wagons supplémentaires",
    nomVariableY: "la vitesse maximale restante atteignable",
    nomVariableYInitiale: "la vitesse maximale atteignable avant l'ajout de wagons supplémentaires",
    nomGrandeur: "la capacité de transport",
    genreGrandeur: "feminin",
    uniteGrandeur: "points",
    uniteVariable: "wagons",
    uniteGrandeurFautive: "km/h",
    texteAideContrainteNiveau1: "Rappel : chaque wagon supplémentaire attelé fait baisser la vitesse maximale atteignable — les 2 quantités sont liées directement.",
    texteAideContrainteNiveau2: "La perte de vitesse maximale au fil des wagons ajoutés x et la vitesse restante y sont liées par une somme constante, égale à Q0.",
  },
];

const X_S_MIN = 4;
const X_S_MAX = 15;
const K_MIN = 2;
const K_MAX = 6;
const P0_MIN = 10;
const P0_MAX = 60;

export function construireRevenuPrix(): ExerciceOptimisationModelisation {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const k = randomInt(K_MIN, K_MAX);
  const P0 = randomInt(P0_MIN, P0_MAX);
  const Q0 = k * (P0 + 2 * xS);

  // Isolement : y + k·x = Q0 → y = -k·x + Q0 (pente=-k, ordonnee=Q0) — jamais confondu avec le
  // coefficient b de la fonction développée ci-dessous (Q0-k·P0), une quantité DIFFÉRENTE.
  const pente = -k;
  const ordonnee = Q0;

  const fonction = { a: pente, b: Q0 - k * P0, c: P0 * Q0 };
  const sommet = { x: xS, y: k * (P0 + xS) * (P0 + xS) };

  // Domaine = la VRAIE plage de positivité physique (`promptcorrectiondomainereelABTV.md`, corrige
  // `promptcorrectiondomainehardcodeB.md` — une fenêtre artificiellement étroite autour de xS avait
  // été confondue avec la vraie contrainte physique, rendant fausse toute réponse élève dérivée
  // honnêtement de "prix positif"/"quantité positive") : `P0+x>0 ⟺ x>-P0` (prix positif) ET
  // `y=-kx+Q0>0 ⟺ x<Q0/k` (quantité positive) → `domaine=[-P0, Q0/k]`. `Q0/k = P0+2·xS` (voir la
  // définition de `Q0` ci-dessus), toujours entier. Le sommet `xS` est TOUJOURS exactement le milieu
  // de `[-P0, Q0/k]` (produit de 2 quantités complémentaires positives) : `sommetDansDomaine` est
  // donc TOUJOURS `true` sur cette famille, jamais un ratio 75/25 (réservé aux familles
  // `fonctionDonnee`, dont le domaine est narratif et indépendant de la fonction).
  const domaine = { inf: -P0, sup: Q0 / k };
  const sommetDansDomaine = sommetDansIntervalle(xS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  // "Identifier x et y" (spec section 4, écran 1) — TOUJOURS présente sur cette famille (aucun skin
  // ne nomme x/y littéralement, voir `SkinRevenuPrix::nomVariableY`). `x` confondu avec la grandeur
  // FINALE optimisée (`nomGrandeur`, ex. "le revenu" au lieu de "la hausse de prix" qui le produit) ;
  // `y` confondu avec la valeur de DÉPART de la MÊME grandeur (avant toute diminution — `skin.
  // nomVariableYInitiale`, nommée EXPLICITEMENT par skin depuis `prompt-groupe-corrections-gen55.md`,
  // point 2 : un texte générique "cette grandeur, avant toute diminution" ne disait pas LAQUELLE,
  // bug trouvé en usage réel sur le skin "wagons" — chaque option d'un menu déroulant doit rester
  // compréhensible indépendamment de l'autre).
  const identificationXY = construireIdentificationXY(
    skin.nomVariable,
    skin.nomVariableY,
    skin.nomGrandeur,
    skin.nomVariableYInitiale,
  );

  return {
    variante: "modelisation",
    famille: "revenuPrix",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(P0, Q0, k),
      labelVariable: "x",
      nomVariable: skin.nomVariable,
      nomGrandeur: skin.nomGrandeur,
      genreGrandeur: skin.genreGrandeur,
      uniteVariable: skin.uniteVariable,
      uniteGrandeur: skin.uniteGrandeur,
      questionFinale: formatQuestionFinale("max", skin.nomGrandeur, skin.genreGrandeur),
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    identificationXY,
    // Écran "contrainteEtGrandeur", champ 2 (`prompt-restructuration-architecture-modelisation.md`)
    // — Revenu = (P0+x)·y, P0 déjà substitué numériquement (seul x/y restent des variables).
    formuleGrandeurXYTexte: `(${P0}+x)*y`,
    // (P0+x)·y (produit DÉCALÉ, premier facteur ≠ x nu) — le gabarit générique de l'aide partagée
    // `texteAideConstructionNiveau2` (`ui/formatOptimisation.ts`) suppose "labelVariable ·
    // (isolé)", faux ici pour TOUS les skins (algèbre identique quelle que soit la narration) :
    // fourni explicitement, jamais par skin.
    formuleSubstitueeTexte: `(${P0}+x) · (${pente}x + ${ordonnee})`,
    contrainte: {
      enonceLatex: `y + ${k}x = ${Q0}`,
      lettreCherchee: "y",
      pente,
      ordonnee,
    },
    texteAideContrainteNiveau1: skin.texteAideContrainteNiveau1,
    texteAideContrainteNiveau2: skin.texteAideContrainteNiveau2,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: skin.nomGrandeur,
      genreGrandeur: skin.genreGrandeur,
      uniteGrandeur: skin.uniteGrandeur,
      uniteGrandeurFautive: skin.uniteGrandeurFautive,
      labelVariable: "x",
      uniteVariable: skin.uniteVariable,
      optimal,
    }),
  };
}
