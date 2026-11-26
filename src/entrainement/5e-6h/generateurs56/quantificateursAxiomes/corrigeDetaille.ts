import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { axiome } from "./core/banque";
import type { ExerciceQuantif } from "./core/types";
import { egaliteEtape, reponse } from "./ui/format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen17`, une lettre par écran. quantifies : lecture de
 * l'énoncé, témoin (vrai) ou contre-exemple (faux) ligne à ligne ; négation : chaque quantificateur
 * remplacé, la condition niée. axiomes : l'égalité de l'étape, l'axiome et son énoncé.
 */

type E = ExerciceQuantif;
const t = texte;
const f = latex;
const LETTRES = "abc";
const COURS = "(cours, étape 3)";
const frags = (fr: Frag[]) => fr.map((x) => (x.type === "latex" ? f(x.valeur) : t(x.valeur)));

function corrigeQuantifies(e: E): EtapeCorrection[] {
  const r: EtapeCorrection[] = [];
  e.enonces.forEach((en, i) => {
    const sq = LETTRES[i];
    r.push(utilise(sq, [t(`« Pour tout » : faux dès qu'un contre-exemple existe ; « il existe » : vrai dès qu'un exemple existe ; dans « ∀x ∃y », y peut dépendre de x, dans « ∃y ∀x », non ${COURS}.`)]));
    r.push(calcul(sq, en.lignes.map((l) => ligne(l.latex, l.justification))));
    r.push(resultat(sq, [...reponse(e, i === 0 ? "enonce1" : "enonce2"), t(". "), ...frags(en.raison)]));
    const piegeTexte = en.latex.startsWith("\\exists y") && en.latex.includes("\\forall x")
      ? "Lire « ∃y ∀x » comme « ∀x ∃y » : ici, le même y doit convenir pour tous les x."
      : en.latex.startsWith("\\forall x") && en.latex.includes("\\exists y")
        ? "Exiger un même y pour tous les x : dans « ∀x ∃y », y peut dépendre de x."
        : "Juger sur un seul exemple un énoncé « pour tout » : un exemple ne prouve rien, un contre-exemple suffit à le rendre faux.";
    r.push(piege(sq, [t(piegeTexte)]));
  });
  r.push(utilise("c", [t(`Négation : « pour tout » devient « il existe », « il existe » devient « pour tout », l'ordre reste, la condition est niée ${COURS}.`)]));
  const premier = e.aNier.startsWith("\\forall") ? "\\forall" : "\\exists";
  r.push(
    calcul("c", [
      // Pas de « \ » (espace) juste avant la relation : l'écran coupe la ligne à « \Longleftrightarrow » et le
      // membre de gauche finirait par une barre oblique isolée (.katex-error).
      ligne(`\\text{non}\\,\\big(${premier}\\big)\\Longleftrightarrow ${premier === "\\forall" ? "\\exists" : "\\forall"}`, "premier quantificateur remplacé"),
      ligne(`\\text{non}\\,\\big(${premier === "\\forall" ? "\\exists" : "\\forall"}\\big)\\Longleftrightarrow ${premier}`, "second quantificateur remplacé, même ordre"),
      ligne(`\\text{non}\\,\\big({${e.predicat}}\\big)\\Longleftrightarrow {${e.predicatNie}}`, "condition niée"),
    ]),
  );
  r.push(resultat("c", reponse(e, "negation")));
  r.push(piege("c", [t("Ne nier que la condition, ou échanger l'ordre des quantificateurs.")]));
  return r;
}

function corrigeAxiomes(e: E): EtapeCorrection[] {
  const r: EtapeCorrection[] = [];
  e.etapes.forEach((et, i) => {
    const sq = LETTRES[i];
    const ax = axiome(et.axiome);
    r.push(utilise(sq, [t(`Axiomes de l'addition, de la multiplication et de l'ordre, définitions de la soustraction et de la division ${COURS}.`)]));
    r.push(calcul(sq, [ligne(egaliteEtape(e, i), ax.nom)]));
    r.push(resultat(sq, reponse(e, (["etape1", "etape2", "etape3"] as const)[i])));
    r.push(
      piege(
        sq,
        ax.famille === "ord"
          ? [t("Oublier la condition de l'axiome (pour la multiplication : un facteur positif).")]
          : et.axiome.endsWith("Assoc")
            ? [t("Confondre associativité (parenthèses déplacées) et commutativité (ordre changé).")]
            : et.axiome.endsWith("Sym")
              ? [t("Confondre le symétrique (la somme vaut 0, le produit vaut 1) et le neutre.")]
              : [t("Invoquer une « règle de calcul » sans dire de quel axiome elle vient.")],
      ),
    );
  });
  return r;
}

export function correctionDetailleeQuantif(e: E): EtapeCorrection[] {
  return e.variante === "quantifies" ? corrigeQuantifies(e) : corrigeAxiomes(e);
}
