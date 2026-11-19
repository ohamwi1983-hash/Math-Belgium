import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceComposerForces } from "../../core/composerForces.types";
import { angleCap, angleInterieur, angleSommetPetit, deviation, estCap, intensiteResultante, sommetPetit, triangleUtile } from "../../moteur/modeleComposerForces";
import {
  angleCapNom,
  angleDonneCapNom,
  angleInterieurNom,
  angleNom,
  angleSommetPetitNom,
  deviationNom,
  intensiteNom,
  nomGrand,
  nomResultante,
  reponseAttendueFragments,
  vecteur,
} from "../../ui/formatComposerForces";
import { construireFigureComposerForces } from "../../ui/figureComposerForces";
import {
  COURS_TRIANGLE,
  COURS_TRIANGULATION,
  angleDonne,
  angleMemoire,
  coteMemoire,
  donnee,
  finaliserCorrigeTriangles,
  lignesAlKashiCote,
  lignesArcsin,
  lignesLoiSinusCote,
  lignesLoiSinusSinus,
  lignesSommeAngles,
  nb,
  nbFixe,
  u,
} from "../../ui/corrigeTriangles";

/**
 * Corrigé détaillé « comme au tableau » de gen80 (composer deux forces ou deux vitesses) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`nombreEcrans`) : a) le triangle à
 * résoudre sur le parallélogramme (figure résolue) ; sens direct : b) l'angle intérieur (angles
 * consécutifs supplémentaires), c) l'intensité par Al-Kashi, d) la direction par la loi des sinus ;
 * cap : b) l'angle entre le cap et la route (loi des sinus, angle aigu), c) l'angle restant (somme),
 * d) l'intensité sur la route (loi des sinus, vérifiée par Al-Kashi). Réponses : mêmes fonctions que
 * l'écran (`reponseAttendueFragments`). Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceComposerForces;

function figureCorrige(e: E): string {
  // Triangle surligné seulement : ni angle du triangle ni intensité, réponses des écrans suivants.
  return construireFigureComposerForces(e, { theme: "papier", triangle: true });
}

function etapeTriangle(e: E): EtapeCorrection[] {
  const g = e.sommetGrand;
  const p = sommetPetit(e);
  const tri = triangleUtile(e);
  const U = u(e.unite);
  const lignes: LigneCalcul[] = estCap(e)
    ? [
        ligne(`\\vec{OC}=\\vec{O${g}}+\\vec{O${p}}`, "règle du parallélogramme : la résultante est la diagonale [OC], portée par la route"),
        ligne(`\\vec{${p}C}=\\vec{O${g}}`, "côtés opposés du parallélogramme : la vitesse propre reportée en " + p),
        ligne(`${p}C=O${g}=${nb(e.grand)}${U}`, "même longueur"),
        ligne(`O${p}=${nb(e.petit)}${U}`, "le vecteur dont on connaît l'angle avec la route"),
      ]
    : [
        ligne(`\\vec{OC}=\\vec{O${g}}+\\vec{O${p}}`, "règle du parallélogramme : la résultante est la diagonale [OC]"),
        ligne(`\\vec{${g}C}=\\vec{O${p}}`, `côtés opposés du parallélogramme : le second vecteur reporté en ${g}`),
        ligne(`${g}C=O${p}=${nb(e.petit)}${U}`, "même longueur"),
        ligne(`O${g}=${nb(e.grand)}${U}`, "le premier vecteur"),
      ];
  return [
    utilise("a", [
      texte(`Règle du parallélogramme ${COURS_TRIANGULATION} : `),
      latex(`${vecteur(e, "R")}=${vecteur(e, "1")}+${vecteur(e, "2")}`),
      texte(` est la diagonale [OC] ; deux côtés opposés d'un parallélogramme sont parallèles et de même longueur. Le triangle à résoudre a [OC] comme côté${estCap(e) ? " et contient le vecteur dont on connaît l'angle avec la route" : ""}.`),
    ]),
    calcul("a", lignes),
    { ...resultat("a", [texte(`Le triangle ${tri}.`)]), figureHtml: figureCorrige(e) },
    piege("a", [texte(estCap(e) ? "La route voulue est la diagonale [OC] : c'est la vitesse obtenue, pas la vitesse propre." : "L'autre diagonale du parallélogramme ne représente pas la somme des deux vecteurs.")]),
  ];
}

function etapesDirectes(e: E): EtapeCorrection[] {
  const g = e.sommetGrand;
  const p = sommetPetit(e);
  const interieur = angleInterieur(e);
  const R = intensiteResultante(e);
  const dev = deviation(e);
  const etapes: EtapeCorrection[] = [
    utilise("b", [texte(`Dans un parallélogramme, deux angles consécutifs sont supplémentaires ${COURS_TRIANGULATION} : l'angle en ${g} du triangle et l'angle entre les deux vecteurs, en O.`)]),
    calcul("b", [
      ligne(`${angleInterieurNom(e)}=180^\\circ-${angleNom(p, "O", g)}`, "angles consécutifs du parallélogramme"),
      ligne(`=180^\\circ-${e.angle}^\\circ`, "on remplace"),
      ligne(`=${interieur}^\\circ`),
    ]),
    resultat("b", reponseAttendueFragments(e, 1)),
    piege("b", [texte(`L'angle donné (${e.angle}°) est l'angle entre les deux vecteurs, en O : ce n'est pas l'angle du triangle en ${g}.`)]),
    utilise("c", [texte(`Dans le triangle O${g}C, on connaît deux côtés et l'angle compris en ${g} : loi des cosinus (Al-Kashi) ${COURS_TRIANGLE}.`)]),
    calcul("c", [
      ...lignesAlKashiCote({ x: "OC", p: `O${g}`, q: `${g}C`, X: angleInterieurNom(e), vp: donnee(e.grand), vq: donnee(e.petit), vX: angleDonne(interieur), resultat: R, unite: e.unite }),
      ligne(`${intensiteNom(e, "R")}=OC`, "l'intensité de la résultante est la longueur de la diagonale"),
    ]),
    resultat("c", reponseAttendueFragments(e, 2)),
    verification(
      "c",
      [texte("Inégalité triangulaire : la résultante est comprise entre la différence et la somme des deux intensités.")],
      [ligne(`${nb(e.grand - e.petit)}<${nbFixe(R, 2)}<${nb(e.grand + e.petit)}`, `${nb(e.grand)} − ${nb(e.petit)} et ${nb(e.grand)} + ${nb(e.petit)}`)],
    ),
    piege("c", [texte(`Dans Al-Kashi, on met l'angle du triangle en ${g} (${interieur}°), pas l'angle entre les vecteurs : sinon on calcule l'autre diagonale. Calculatrice en degrés.`)]),
  ];
  if (e.question === "direction") {
    etapes.push(
      utilise("d", [texte(`Loi des sinus dans le triangle O${g}C ${COURS_TRIANGLE} : l'angle en O fait face au côté ${g}C ; il est aigu, car ${g}C est plus court que O${g}.`)]),
      calcul("d", [
        ...lignesLoiSinusSinus({ X: deviationNom(e), x: `${g}C`, K: angleInterieurNom(e), k: "OC", vx: donnee(e.petit), vK: angleDonne(interieur), vk: coteMemoire(R), sinus: Math.sin((dev * Math.PI) / 180) }),
        ...lignesArcsin({ X: deviationNom(e), angle: dev }),
      ]),
      resultat("d", reponseAttendueFragments(e, 3)),
      piege("d", [texte(`On demande l'angle entre la résultante et ${nomGrand(e)}, `), latex(vecteur(e, "1")), texte(" : pas celui avec l'autre vecteur.")]),
    );
  }
  return etapes;
}

function etapesCap(e: E): EtapeCorrection[] {
  const p = sommetPetit(e);
  const cap = angleCap(e);
  const P = angleSommetPetit(e);
  const R = intensiteResultante(e);
  return [
    utilise("b", [texte(`Dans le triangle O${p}C, on connaît O${p}, ${p}C et l'angle en O, opposé à ${p}C : loi des sinus pour l'angle en C, opposé à O${p} ${COURS_TRIANGLE}. Il est aigu, car O${p} est plus court que ${p}C.`)]),
    calcul("b", [
      ...lignesLoiSinusSinus({ X: angleCapNom(e), x: `O${p}`, K: angleDonneCapNom(e), k: `${p}C`, vx: donnee(e.petit), vK: angleDonne(e.angle), vk: donnee(e.grand), sinus: Math.sin((cap * Math.PI) / 180) }),
      ...lignesArcsin({ X: angleCapNom(e), angle: cap }),
    ]),
    resultat("b", reponseAttendueFragments(e, 1)),
    piege("b", [texte(`L'angle donné (${e.angle}°) est celui ${e.situation === "avion" ? "du vent" : "du courant"} avec la route, en O : l'angle entre le cap et la route est en C.`)]),
    utilise("c", [texte("La somme des angles d'un triangle vaut 180°.")]),
    calcul("c", lignesSommeAngles({ inconnu: angleSommetPetitNom(e), autres: [angleDonneCapNom(e), angleCapNom(e)], valeurs: [angleDonne(e.angle), angleMemoire(cap)], resultat: P })),
    resultat("c", reponseAttendueFragments(e, 2)),
    utilise("d", [texte(`Loi des sinus ${COURS_TRIANGLE} : OC fait face à l'angle en ${p}, ${p}C à l'angle en O.`)]),
    calcul("d", [
      ...lignesLoiSinusCote({ x: "OC", X: angleSommetPetitNom(e), k: `${p}C`, K: angleDonneCapNom(e), vk: donnee(e.grand), vX: angleMemoire(P), vK: angleDonne(e.angle), resultat: R, unite: e.unite }),
      ligne(`${intensiteNom(e, "R")}=OC`, `l'intensité de ${nomResultante(e)} est la longueur de la diagonale`),
    ]),
    resultat("d", reponseAttendueFragments(e, 3)),
    verification("d", [texte("Par Al-Kashi dans le même triangle, on retrouve OC :")], lignesAlKashiCote({ x: "OC", p: `O${p}`, q: `${p}C`, X: angleSommetPetitNom(e), vp: donnee(e.petit), vq: donnee(e.grand), vX: angleMemoire(P), resultat: R, unite: e.unite })),
  ];
}

export function correctionDetailleeComposerForces(e: E): EtapeCorrection[] {
  return finaliserCorrigeTriangles([...etapeTriangle(e), ...(estCap(e) ? etapesCap(e) : etapesDirectes(e))]);
}
