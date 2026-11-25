import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceRealiteIllusion } from "../../core/realiteIllusion.types";
import { figureCorrige } from "../../ui/figureEspaceLotH";
import { COURS_CAVALIERE, COURS_TROIS_PLANS, constatDessin, droiteLat, figureRI, phraseVerdict } from "../../ui/formatRealiteIllusion";

/**
 * Corrigé détaillé « comme au tableau » de gen135 (partagé par l'adaptateur et l'appli, une lettre par
 * écran) : a) les trois plans et leurs droites d'intersection ; b) ce que montre le dessin, arêtes
 * prolongées (figure annotée sous le résultat) ; c) le théorème des trois plans et la conclusion.
 * Les relations « sur le dessin » portent sur les droites DESSINÉES (projection cavalière).
 */

type E = ExerciceRealiteIllusion;
const T = texte;

function lignesDessin(e: E): LigneCalcul[] {
  if (e.disposition === "concourantes")
    return [ligne("(AD)\\cap(BE)=\\{S\\}", "sur le dessin, les deux droites prolongées se coupent en S"), ligne("S\\in(CF)", "sur le dessin, (CF) prolongée passe aussi par S")];
  if (e.disposition === "paralleles")
    return [ligne("(AD)\\parallel(BE)", "sur le dessin, même direction (verticale)"), ligne("(BE)\\parallel(CF)", "sur le dessin, même direction (verticale)")];
  const p = e.areteDeplacee!;
  const [q, r] = [0, 1, 2].filter((i) => i !== p) as [number, number];
  if (e.variante === "prisme")
    return [
      ligne(`${droiteLat(q)}\\parallel${droiteLat(r)}`, "sur le dessin, même direction (verticale)"),
      ligne(`${droiteLat(p)}\\nparallel${droiteLat(q)}`, `sur le dessin, ${droiteLat(p)} est penchée`),
      ligne(`${droiteLat(p)}\\cap${droiteLat(q)}=\\{J\\}`, `et ${droiteLat(p)} coupe ${droiteLat(r)} en K`),
    ];
  return [
    ligne(`${droiteLat(q)}\\cap${droiteLat(r)}=\\{I\\}`, "sur le dessin, les deux droites prolongées se coupent en I"),
    ligne(`I\\notin${droiteLat(p)}`, `sur le dessin, ${droiteLat(p)} passe à côté de I`),
    ligne(`${droiteLat(p)}\\cap${droiteLat(q)}=\\{J\\}`, `et ${droiteLat(p)} coupe ${droiteLat(r)} en K : I, J et K sont trois points différents`),
  ];
}

const DISPOSITION_TEXTE = { concourantes: "concourantes", paralleles: "parallèles", aucune: "ni concourantes ni parallèles" } as const;

export function correctionDetailleeRealiteIllusion(e: E): EtapeCorrection[] {
  const existe = e.verdict === "existe";
  return [
    utilise("a", [T(COURS_TROIS_PLANS)]),
    calcul("a", [
      ligne("(ABED)\\cap(BCFE)=(BE)", "B et E sont deux points communs : l'arête [BE]"),
      ligne("(BCFE)\\cap(ACFD)=(CF)", "C et F sont deux points communs : l'arête [CF]"),
      ligne("(ABED)\\cap(ACFD)=(AD)", "A et D sont deux points communs : l'arête [AD]"),
    ]),
    resultat("a", [T("Les trois faces latérales ABED, BCFE et ACFD sont sécantes deux à deux, suivant trois droites distinctes : (AD), (BE) et (CF).")]),
    piege("a", [T("La base et deux faces latérales se coupent suivant trois droites qui passent par un même sommet : c'est vrai pour tout solide, on n'apprend rien.")]),

    utilise("b", [T(COURS_CAVALIERE)]),
    calcul("b", lignesDessin(e)),
    { ...resultat("b", [T(`${constatDessin(e)} Sur le dessin, (AD), (BE) et (CF) sont ${DISPOSITION_TEXTE[e.disposition]}.`)]), figureHtml: figureCorrige(figureRI(e, "papier", 2)) },
    piege("b", [T("Juger à l'œil sans prolonger : il faut prolonger les trois arêtes à la règle et vérifier que la troisième passe par le point de rencontre des deux autres, ou qu'elle a la même direction.")]),

    utilise("c", [T(`${COURS_TROIS_PLANS} Une projection parallèle garde ces droites concourantes ou parallèles sur le dessin.`)]),
    existe
      ? resultat("c", [T(`Les arêtes latérales sont ${DISPOSITION_TEXTE[e.disposition]} sur le dessin, comme le veut le théorème. ${phraseVerdict(e)}`)], "Conclusion")
      : resultat(
          "c",
          [
            T(
              "Si les faces latérales étaient planes, les plans (ABED), (BCFE) et (ACFD) se couperaient deux à deux suivant (AD), (BE) et (CF), trois droites concourantes ou parallèles, et elles le seraient aussi sur le dessin. Or, sur le dessin, elles ne sont ni concourantes ni parallèles. " +
                phraseVerdict(e),
            ),
          ],
          "Conclusion",
        ),
    existe
      ? verification("c", [
          T(
            e.variante === "tronc"
              ? "Les faces latérales passent toutes par S : la pyramide SABC, coupée par le plan (DEF), donne ce dessin. Le dessus DEF est un triangle : trois points sont toujours dans un plan."
              : "Les arêtes latérales ont la même direction : le prisme de base ABC, coupé par le plan (DEF), donne ce dessin. Le dessus DEF est un triangle : trois points sont toujours dans un plan.",
          ),
        ])
      : resultat("c", [T("Une face seule ne permet pas de conclure : sur le dessin, deux arêtes latérales se coupent toujours (ou sont parallèles). C'est le théorème appliqué aux trois faces ensemble qui montre l'impossibilité.")], "Remarque"),
    piege("c", [T("Conclure « on ne peut pas savoir sur un dessin » : la perspective cavalière conserve le parallélisme et le point commun de deux droites, le dessin suffit.")]),
  ];
}
