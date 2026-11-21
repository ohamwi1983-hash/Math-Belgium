import type { ExerciceDetectiveAnalytique } from "../core/detectiveAnalytique.types";
import { descriptionFragments, indiceLigneFausse, nombreLignes, scenario } from "../moteur/modeleDetectiveAnalytique";
import type { Champ, ChampNombre, EcranTSD } from "./ecransTransfertSecondDegre";
import { champDroite, l, t, type Fr } from "./outilsAnalytiqueLotG";

/**
 * Textes et écrans de gen99 « Détective d'erreurs : géométrie analytique » — SOURCE UNIQUE (écran,
 * aides, papier, corrigé). Écran 1 : la ligne fausse (choix, une tentative) ; écran 2 : l'erreur
 * (quatre descriptions, une tentative) ; écran 3 : le résultat corrigé (champs, 3 tentatives ; le
 * résultat de la copie reçoit un message ciblé).
 */

type E = ExerciceDetectiveAnalytique;

export const CONSIGNE_GENERALE = "Une ligne de cette copie est fausse. Trouve-la, explique l'erreur et corrige le résultat.";
export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export function consignesEcrans(e: E): Fr[] {
  return [[t("Quelle ligne de la copie est fausse ?")], [t(`Quelle erreur l'élève a-t-il commise à la ligne ${indiceLigneFausse(e) + 1} ?`)], [t(scenario(e).demande)]];
}

export function recit(e: E): Fr {
  return scenario(e).recit;
}

export function reponseFragments(e: E): Fr {
  return scenario(e).reponse;
}

function champsCorrection(e: E): Champ[] {
  const s = scenario(e);
  const v = s.valeur;
  const copie = "C'est le résultat de la copie : il découle de la ligne fausse. Refais le calcul sans l'erreur.";
  if (v.genre === "droite") {
    return [
      champDroite({
        id: "droite",
        libelle: [l(`${v.nom}\\equiv`)],
        cible: v.droite,
        pieges: [{ droite: v.copie, message: copie }],
        point: { P: { x: v.point.x, y: v.point.y }, message: `Ta droite passe par $${v.point.nom}$, mais sa direction n'est pas la bonne.` },
        messageSiFaux: "Reprends la copie ligne par ligne, en corrigeant la ligne fausse.",
      }),
    ];
  }
  return v.champs.map(
    (c): ChampNombre => ({
      type: "nombre",
      id: c.id,
      libelle: [l(c.libelle)],
      cible: c.cible,
      unite: c.unite,
      pieges: Math.abs(c.copie - c.cible) > 1e-9 ? [{ valeur: c.copie, message: copie }] : [],
      messageSiFaux: "Reprends la copie à partir de la ligne fausse, sans l'erreur.",
    }),
  );
}

export function ecrans(e: E): EcranTSD[] {
  const s = scenario(e);
  const i = indiceLigneFausse(e);
  return [
    {
      type: "choix",
      titre: TITRES_ECRANS[0]!,
      consigne: consignesEcrans(e)[0]!,
      options: Array.from({ length: nombreLignes(e) }, (_, k) => [t(`Ligne ${k + 1}`)]),
      bonne: i,
      aides: [
        [t("Refais la copie ligne par ligne : la première ligne qui ne donne pas le même résultat que ton calcul est la ligne fausse ; les suivantes en découlent.")],
        [t("Une ligne fausse peut être suivie de calculs justes faits avec une valeur fausse : cherche la première ligne où le raisonnement ou le calcul se trompe.")],
      ],
      messageFaux: "Ce n'était pas la ligne fausse.",
    },
    {
      type: "choix",
      titre: TITRES_ECRANS[1]!,
      consigne: consignesEcrans(e)[1]!,
      options: e.options.map((id) => descriptionFragments(id)),
      bonne: e.options.indexOf(e.type),
      aides: [s.regle, [t("Compare la ligne "), l(String(i + 1)), t(" de la copie avec la règle ci-dessus : qu'est-ce qui a été fait autrement ?")]],
      messageFaux: "Ce n'était pas la bonne explication.",
    },
    {
      type: "champs",
      titre: TITRES_ECRANS[2]!,
      consigne: consignesEcrans(e)[2]!,
      champs: champsCorrection(e),
      aides: [[t("Reprends la copie à partir de la ligne fausse, sans l'erreur : les lignes suivantes changent aussi.")], s.aideCorrection],
      reponse: s.reponse,
    },
  ];
}
