import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceTroisPointsAlignes, PointIntersectionNomme } from "../../core/demontrerParallelisme.types";
import { COURS_DEUX_PLANS, COURS_PERCEE, COURS_PLAN, dL, paralleleL } from "../../ui/corrigeEspace2";
import { figureTroisPointsAlignesSvg } from "../../ui/figureTroisPointsAlignes";
import { conclusionEcranAlignes, dA, droiteFinale, nomsConstruits, reponseEcranAlignes } from "../../ui/formatTroisPointsAlignes";

/**
 * Corrigé « comme au tableau » de la variante « trois points alignés » de gen103 (manuel, ex. 11).
 * Une lettre par ÉCRAN : a) l'idée (deux plans sécants, ou droite d'intersection + théorème du toit),
 * b) les points communs (chaque point : sur un côté de MNP inclus dans (MNP), sur un côté de ABC
 * inclus dans (ABC)), c) les plans distincts et sécants, leur droite commune, puis la conclusion
 * (alignés ; ou parallèles par le théorème du toit). Partagé par l'appli et l'adaptateur papier ; la
 * figure complète (côtés prolongés, I, J, K, droite d'intersection) va sous le résultat final.
 */

type E = ExerciceTroisPointsAlignes;

const PLAN_HAUT = "(MNP)";
const PLAN_BASE = "(ABC)";

/** Deux lignes par point : `I\in(MN)\subset(MNP)` et `I\in(AB)\subset(ABC)`. */
function lignesPoint(x: PointIntersectionNomme): LigneCalcul[] {
  return [
    ligne(`${x.nom}\\in${dL(x.droiteHaut)}\\subset${PLAN_HAUT}`, `${x.nom} est sur ${dA(x.droiteHaut)} ; ${x.droiteHaut[0]} et ${x.droiteHaut[1]} sont deux points du plan ${PLAN_HAUT}`),
    ligne(`${x.nom}\\in${dL(x.droiteBase)}\\subset${PLAN_BASE}`, `${x.nom} est sur ${dA(x.droiteBase)} ; ${x.droiteBase[0]} et ${x.droiteBase[1]} sont deux points du plan ${PLAN_BASE}`),
  ];
}

const listeL = (e: E) => e.construits.map((x) => x.nom).join(",\\,");

function figureFinale(e: E): string {
  return figureTroisPointsAlignesSvg(e, { mode: "papier", construction: true, finale: true });
}

function corrigeGeneral(e: E): EtapeCorrection[] {
  const noms = nomsConstruits(e);
  return [
    utilise("a", [texte(`Deux plans distincts qui ont un point commun sont sécants : leur intersection est une droite, qui contient tous leurs points communs ${COURS_DEUX_PLANS}.`)]),
    calcul("a", [
      ligne(`${listeL(e)}\\in${PLAN_HAUT}\\cap${PLAN_BASE}`, "à démontrer : étape 2"),
      ligne(`${PLAN_HAUT}\\cap${PLAN_BASE}=d`, "plans sécants : à démontrer à l'étape 3"),
      ligne(`${listeL(e)}\\in d`, `alors ${noms} sont alignés`),
    ]),
    resultat("a", [texte(`Il suffit de montrer que ${noms} sont communs aux plans ${PLAN_HAUT} et ${PLAN_BASE}, et que ces deux plans sont sécants : « ${reponseEcranAlignes(e, 0)} »`)]),
    piege("a", [texte("Trois points d'un même plan ne sont pas forcément alignés, ni trois points pris sur les trois côtés d'un triangle : il faut deux plans sécants, dont la droite commune porte les trois points.")]),
    utilise("b", [texte(`Une droite est dans un plan quand deux de ses points y sont ${COURS_PLAN} ; un point d'une droite incluse dans un plan est un point de ce plan.`)]),
    calcul("b", [...e.construits.flatMap(lignesPoint), ligne(`${listeL(e)}\\in${PLAN_HAUT}\\cap${PLAN_BASE}`, "communs aux deux plans")]),
    resultat("b", [texte(conclusionEcranAlignes(e, 1).replace(" Il reste à voir que ces plans sont sécants.", ""))]),
    piege("b", [texte(`${noms} sont sur les côtés prolongés, en dehors des triangles MNP et ABC : ce sont les plans, illimités, qui les contiennent.`)]),
    utilise("c", [texte(`Deux plans distincts qui ont un point commun sont sécants suivant une droite ${COURS_DEUX_PLANS}.`)]),
    calcul("c", [
      ligne(`M\\notin${PLAN_BASE}`, "M est sur l'arête [SA], entre S et A : il n'est pas dans le plan de la base"),
      ligne(`${PLAN_HAUT}\\neq${PLAN_BASE}`, "les deux plans sont distincts"),
      ligne(`${e.construits[0]!.nom}\\in${PLAN_HAUT}\\cap${PLAN_BASE}`, "étape 2 : un point commun"),
      ligne(`${PLAN_HAUT}\\cap${PLAN_BASE}=d`, "deux plans sécants : leur intersection est une droite d"),
    ]),
    calcul("c", [ligne(`${listeL(e)}\\in d`, "points communs aux deux plans : ils sont sur leur droite d'intersection")], [], "Conclusion"),
    { ...resultat("c", [texte(`Les points ${noms} sont sur la droite d'intersection d des plans ${PLAN_HAUT} et ${PLAN_BASE} : ils sont alignés.`)]), figureHtml: figureFinale(e) },
    piege("c", [texte("Deux plans sécants ont toute une droite en commun, jamais un seul point ; et « dans un même plan » ne suffit pas pour être alignés.")]),
  ];
}

function corrigeToit(e: E): EtapeCorrection[] {
  const noms = nomsConstruits(e);
  const [h, b] = e.paralleles!;
  const D = droiteFinale(e);
  const [x, y] = e.construits as [PointIntersectionNomme, PointIntersectionNomme];
  // Sommet commun aux deux côtés de la base qui portent les deux points (B pour (AB) et (BC)).
  const commun = x.droiteBase.find((s) => y.droiteBase.includes(s))!;
  return [
    utilise("a", [
      texte(`Théorème du toit : si deux plans sécants contiennent chacun une droite, et que ces deux droites sont parallèles, la droite d'intersection des deux plans est parallèle à ces deux droites ${COURS_PERCEE}.`),
    ]),
    calcul("a", [
      ligne(`${PLAN_HAUT}\\cap${PLAN_BASE}=${dL(D)}`, "à démontrer : étape 2"),
      ligne(`${dL(h)}\\subset${PLAN_HAUT},\\ ${dL(b)}\\subset${PLAN_BASE},\\ ${paralleleL(dL(h), dL(b))}`, "données de la figure"),
      ligne(paralleleL(dL(D), dL(b)), "théorème du toit"),
    ]),
    resultat("a", [texte(`Il suffit de montrer que ${dA(D)} est la droite commune aux plans ${PLAN_HAUT} et ${PLAN_BASE} : « ${reponseEcranAlignes(e, 0)} »`)]),
    piege("a", [texte(`Deux droites d'un même plan, comme ${dA(D)} et ${dA(b)} dans le plan ${PLAN_BASE}, peuvent être sécantes : être dans un même plan ne suffit pas.`)]),
    utilise("b", [texte(`Une droite est dans un plan quand deux de ses points y sont ${COURS_PLAN} ; deux plans distincts qui ont deux points communs distincts se coupent suivant la droite qui passe par ces deux points ${COURS_DEUX_PLANS}.`)]),
    calcul("b", [
      ...lignesPoint(x),
      ...lignesPoint(y),
      ligne(`M\\notin${PLAN_BASE}`, "M est sur l'arête [SA], entre S et A : les plans sont distincts"),
      ligne(`${x.nom}\\neq ${y.nom}`, `${x.nom} est sur ${dA(x.droiteBase)} et ${y.nom} sur ${dA(y.droiteBase)}, tous deux distincts de ${commun}`),
      ligne(`${PLAN_HAUT}\\cap${PLAN_BASE}=${dL(D)}`, "deux points communs distincts : la droite d'intersection"),
    ]),
    resultat("b", [texte(conclusionEcranAlignes(e, 1))]),
    piege("b", [texte(`${noms} sont sur les côtés prolongés, en dehors des triangles MNP et ABC : ce sont les plans, illimités, qui les contiennent.`)]),
    utilise("c", [texte(`Théorème du toit ${COURS_PERCEE}.`)]),
    calcul("c", [
      ligne(`${dL(h)}\\subset${PLAN_HAUT}`, `${h[0]} et ${h[1]} sont deux points du plan ${PLAN_HAUT}`),
      ligne(`${dL(b)}\\subset${PLAN_BASE}`, `${b[0]} et ${b[1]} sont deux points du plan ${PLAN_BASE}`),
      ligne(paralleleL(dL(h), dL(b)), "donnée de l'énoncé"),
      ligne(`${PLAN_HAUT}\\cap${PLAN_BASE}=${dL(D)}`, "étape 2"),
      ligne(`${x.nom}\\notin${dL(b)}`, `${dA(D)} n'est pas confondue avec ${dA(b)}`),
    ]),
    calcul("c", [ligne(paralleleL(dL(D), dL(b)), "théorème du toit")], [], "Conclusion"),
    { ...resultat("c", [texte(`${reponseEcranAlignes(e, 2)}`)]), figureHtml: figureFinale(e) },
    piege("c", [texte(`${dA(D)} et ${dA(h)} sont dans le plan ${PLAN_HAUT}, ${dA(D)} et ${dA(b)} dans le plan ${PLAN_BASE} : cela ne suffit pas, c'est le théorème du toit qui donne la direction de la droite d'intersection.`)]),
  ];
}

export function corrigeAlignes(e: E): EtapeCorrection[] {
  return e.cas === "general" ? corrigeGeneral(e) : corrigeToit(e);
}
