import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice126 } from "../../core6e/tangentesPositionCercle";
import { developpee, distance126, equationPente, phases126, r126, tangentesExterieur } from "../../core6e/tangentesPositionCercle";
import { cercleDeveloppeL, cercleReduitL, droitePenteL, figureCorrige126, reponse126 } from "../../ui6e/formatTangentesPositionCercle";
import { lignesDroiteNormale } from "../../ui6e/corrigeLieuxLotH1";
import { equationCours, fr, l, nb, nbp, somme, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen126`, une lettre par écran : complétion des carrés
 * (centre, rayon), distance du centre à la droite (valeur absolue, norme du vecteur normal),
 * comparaison avec r (figure : droite et points communs) ; tangente en T (vecteur normal ΩT) ; depuis P :
 * Pythagore dans ΩTP, puis la condition d(Ω ; t) = r sur une droite de pente m — équation du second
 * degré, ou du premier degré quand une tangente est verticale (x = x_P, testée à part). Même source que
 * l'écran.
 */

type E = Exercice126;

const carre = (v: string, c: number) => (c === 0 ? `${v}^2` : `(${v}${c > 0 ? "-" : "+"}${nb(Math.abs(c))})^2`);

/** Complétion des carrés : forme développée → forme centre-rayon. */
function lignesCarres(e: E): LigneCalcul[] {
  const { D, E: Ee, F } = developpee(e);
  const p = e.O.x;
  const q = e.O.y;
  const grp = (v: string, k: number) => (k === 0 ? `${v}^2` : `\\left(${v}^2${somme([[k, v]]).replace(/^(?!-)/, "+")}\\right)`);
  const cst = F === 0 ? "" : F > 0 ? `+${nb(F)}` : nb(F);
  const moins = (c: number) => (c === 0 ? "" : `-${nb(c * c)}`);
  return [
    ligne(cercleDeveloppeL(e), "équation donnée"),
    ligne(`${grp("x", D)}+${grp("y", Ee)}${cst}=0`, "on regroupe les termes en x et en y"),
    ligne(`${carre("x", p)}${moins(p)}+${carre("y", q)}${moins(q)}${cst}=0`, "on complète les carrés"),
    ligne(cercleReduitL(e), "forme centre-rayon"),
  ];
}

export function correctionDetaillee126(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const r = r126(e);
  phases126(e).forEach((ph, i) => {
    const sq = lettreEtape(i);
    switch (ph) {
      case "centreRayon":
      case "centre":
        out.push(
          utilise(sq, [t("Équation d'un cercle (cours, § 2) : on complète les carrés pour obtenir "), l("(x-p)^2+(y-q)^2=r^2"), t(", de centre "), l("\\Omega(p\\,;q)"), t(" et de rayon r.")]),
          calcul(sq, [...lignesCarres(e), ...(ph === "centreRayon" ? [ligne(`r=\\sqrt{${nb(e.r2)}}=${nb(r)}`, "racine du second membre")] : [])]),
          resultat(sq, fr(reponse126(e, ph))),
          piege(sq, [t("Se tromper de signe : "), l("x^2-2px"), t(" donne un centre d'abscisse p, positive ; et "), l("r^2"), t(" n'est pas le rayon.")]),
        );
        break;
      case "distance": {
        const d = e.droite!;
        const { num, norme, d: dist } = distance126(e);
        const termes = [d.a !== 0 ? `${nb(d.a)}\\times ${nbp(e.O.x)}` : "", d.b !== 0 ? `${d.b < 0 ? `(${nb(d.b)})` : nb(d.b)}\\times ${nbp(e.O.y)}` : "", d.c !== 0 ? nb(d.c) : ""].filter((s) => s !== "");
        const valeur = d.a * e.O.x + d.b * e.O.y + d.c;
        out.push(
          utilise(sq, [t("Distance d'un point à une droite (cours, § 1) : "), l("d(\\Omega\\,;d)=\\dfrac{|a\\,x_\\Omega+b\\,y_\\Omega+c|}{\\sqrt{a^2+b^2}}"), t(".")]),
          calcul(sq, [
            ligne(`d(\\Omega\\,;d)=\\dfrac{\\left|${termes.join("+").replace(/\+-/g, "-")}\\right|}{${norme === 1 ? "1" : `\\sqrt{${nb(d.a)}^2+${nbp(d.b)}^2}`}}`, "on remplace"),
            ligne(`=\\dfrac{|${nb(valeur)}|}{${nb(norme)}}`),
            ...(norme === 1 ? [ligne(`=${nb(dist)}`)] : [ligne(`=\\dfrac{${nb(num)}}{${nb(norme)}}`), ...(Number.isInteger(dist) ? [ligne(`=${nb(dist)}`)] : [])]),
          ]),
          resultat(sq, fr(reponse126(e, ph))),
          piege(sq, [t("Oublier la valeur absolue (une distance est positive) ou la racine carrée au dénominateur.")]),
        );
        break;
      }
      case "position":
        out.push(
          utilise(sq, [t("Position d'une droite et d'un cercle (cours, § 2) : si "), l("d(\\Omega\\,;d)<r"), t(", la droite est sécante (deux points communs) ; si "), l("d(\\Omega\\,;d)=r"), t(", tangente ; si "), l("d(\\Omega\\,;d)>r"), t(", extérieure.")]),
          { ...resultat(sq, fr(reponse126(e, ph))), figureHtml: figureCorrigeLot(figureCorrige126(e)) },
          piege(sq, [t("Comparer la distance à "), l("r^2"), t(" au lieu de r.")]),
        );
        break;
      case "tangente": {
        const T = e.T!;
        const n = { x: T.x - e.O.x, y: T.y - e.O.y };
        const { lignes } = lignesDroiteNormale(n, T, "T");
        out.push(
          utilise(sq, [t("Tangente en un point (cours, § 2) : elle est perpendiculaire au rayon [ΩT], donc "), l("\\vec{\\Omega T}"), t(" en est un vecteur normal.")]),
          { ...calcul(sq, [ligne(`\\vec{\\Omega T}\\begin{pmatrix}${nb(T.x)}-${nbp(e.O.x)}\\\\${nb(T.y)}-${nbp(e.O.y)}\\end{pmatrix}=\\begin{pmatrix}${nb(n.x)}\\\\${nb(n.y)}\\end{pmatrix}`), ...lignes]), figureHtml: figureCorrigeLot(figureCorrige126(e)) },
          resultat(sq, fr(reponse126(e, ph))),
          verification(sq, [t("T est bien sur le cercle : "), l(`${nbp(n.x)}^2+${nbp(n.y)}^2=${nb(e.r2)}=r^2`), t(" ; et T vérifie l'équation de la tangente.")]),
          piege(
            sq,
            n.y === 0
              ? [t("Ici, la tangente est verticale : son équation est de la forme x = k, sans pente — une écriture y = mx + p ne la donne jamais.")]
              : [t("Prendre "), l("\\vec{\\Omega T}"), t(" comme vecteur directeur : on obtiendrait la droite (ΩT), qui porte le rayon.")],
          ),
        );
        break;
      }
      case "longueur": {
        const { u, v } = equationPente(e);
        const OP2 = u * u + v * v;
        out.push(
          utilise(sq, [t("Longueur d'une tangente (cours, § 2) : la tangente est perpendiculaire au rayon, le triangle ΩTP est rectangle en T ; par Pythagore, "), l("PT^2=\\Omega P^2-r^2"), t(".")]),
          calcul(sq, [ligne(`\\Omega P^2=${nbp(u)}^2+${nbp(v)}^2=${nb(OP2)}`), ligne(`PT^2=${nb(OP2)}-${nb(e.r2)}=${nb(e.pt! ** 2)}`, "Pythagore dans ΩTP"), ligne(`PT=${nb(e.pt!)}`)]),
          resultat(sq, fr(reponse126(e, ph))),
          piege(sq, [t("Additionner au lieu de soustraire : l'hypoténuse du triangle rectangle est [ΩP], pas [PT].")]),
        );
        break;
      }
      case "tangentes": {
        const { A, B, C, u, v } = equationPente(e);
        const P = e.P!;
        const [d1, d2] = tangentesExterieur(e);
        const lignes: LigneCalcul[] = [
          ligne(droitePenteL(P), "droite non verticale par P"),
          ligne(`\\dfrac{\\left|${somme([[-u, "m"], [v, ""]])}\\right|}{\\sqrt{m^2+1}}=${nb(r)}`, "distance du centre égale au rayon"),
          ligne(`\\left(${somme([[-u, "m"], [v, ""]])}\\right)^2=${nb(e.r2)}\\,(m^2+1)`, "on élève au carré"),
          ligne(`${somme([[A, "m^2"], [B, "m"], [C, ""]])}=0`, "on développe et on regroupe"),
        ];
        if (A === 0) {
          lignes.push(ligne(`m=${nb(-C / B)}`, "équation du premier degré : une seule pente"));
          lignes.push(ligne(`d(\\Omega\\,;x=${nb(P.x)})=|${nb(P.x)}-${nbp(e.O.x)}|=${nb(Math.abs(u))}=r`, "la droite verticale par P est tangente aussi"));
        } else {
          const delta = B * B - 4 * A * C;
          const rac = Math.round(Math.sqrt(delta));
          lignes.push(ligne(`\\Delta=${nbp(B)}^2-4\\times ${nbp(A)}\\times ${nbp(C)}=${nb(delta)}`));
          lignes.push(ligne(`m=\\dfrac{${nb(-B)}\\pm ${nb(rac)}}{${nb(2 * A)}}`, "deux pentes"));
          lignes.push(ligne(`m_1=${nb((-B + rac) / (2 * A))},\\ m_2=${nb((-B - rac) / (2 * A))}`));
        }
        out.push(
          utilise(sq, [t("Tangentes issues d'un point (cours, § 2) : une droite par P est tangente si et seulement si la distance du centre à cette droite vaut r ; on traite à part la droite verticale "), l(`x=${nb(P.x)}`), t(", qui n'a pas de pente.")]),
          { ...calcul(sq, lignes), figureHtml: figureCorrigeLot(figureCorrige126(e)) },
          resultat(sq, [l(equationCours(d1!)), t(" et "), l(equationCours(d2!))]),
          piege(sq, [t("Ne chercher que des droites y = mx + p : quand l'équation en m n'a qu'une solution, la seconde tangente est verticale.")]),
        );
        break;
      }
    }
  });
  return out;
}
