import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { axiome } from "../core/banque";
import type { ExerciceQuantif, IdAxiome, PhaseQuantif } from "../core/types";
import { bonneOptionId, indexEtape, options } from "../ui/format";

/**
 * Couche B — vérification de `56gen17` : uniquement des choix fermés (une tentative), messages ciblés
 * après un choix faux (affichés avec la réponse révélée).
 */

type E = ExerciceQuantif;
type P = PhaseQuantif;

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (!options(e, p).some((o) => o.id === v)) return ["parse_error"];
  return [v === bonneOptionId(e, p) ? "correct" : "not_equivalent"];
}

export function bonneOption(e: E, p: P): string {
  return bonneOptionId(e, p);
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (diagnostiquer(e, p, valeurs)[0] !== "not_equivalent") return null;
  if (p === "enonce1" || p === "enonce2") {
    const en = e.enonces[indexEtape(p)];
    return en.vrai ? [tx("Un exemple bien choisi suffit ici : "), ...en.raison] : [tx("Un contre-exemple suffit ici : "), ...en.raison];
  }
  if (p === "negation") {
    const sorte = e.optionsNegation.find((o) => o.id === v)?.sorte;
    if (sorte === "predicat") return [tx("Les quantificateurs aussi doivent changer : « pour tout » devient « il existe », et inversement.")];
    if (sorte === "quantificateurs") return [tx("Il faut aussi nier la condition : "), lx(e.predicat), tx(" devient "), lx(e.predicatNie), tx(".")];
    return [tx("L'ordre des quantificateurs ne change pas dans une négation : seul chaque quantificateur est remplacé par l'autre.")];
  }
  const attendu = e.etapes[indexEtape(p)].axiome;
  const choisi = v as IdAxiome;
  const fa = axiome(attendu).famille;
  const fc = axiome(choisi).famille;
  if (fa !== fc && (fa === "ord" || fc === "ord")) return [tx(fa === "ord" ? "C'est une inégalité : il faut un axiome de la relation d'ordre." : "C'est une égalité entre deux écritures : aucun axiome de l'ordre n'intervient.")];
  if ((attendu === "addAssoc" && choisi === "addComm") || (attendu === "mulAssoc" && choisi === "mulComm")) return [tx("L'ordre des termes n'a pas changé : seules les parenthèses ont bougé.")];
  if ((attendu === "addComm" && choisi === "addAssoc") || (attendu === "mulComm" && choisi === "mulAssoc")) return [tx("Les parenthèses sont les mêmes : c'est l'ordre des termes qui a changé.")];
  if ((attendu === "addSym" && choisi === "addNeutre") || (attendu === "mulSym" && choisi === "mulNeutre")) return [tx("À cette étape, deux nombres se combinent pour donner le neutre : c'est la propriété du symétrique, pas celle du neutre.")];
  if ((attendu === "addNeutre" && choisi === "addSym") || (attendu === "mulNeutre" && choisi === "mulSym")) return [tx("À cette étape, le neutre disparaît : c'est la propriété du neutre.")];
  return [tx("À cette étape, c'est la "), tx(axiome(attendu).nom), tx(" : "), lx(axiome(attendu).latex), tx(".")];
}
