/**
 * Fusionne un opérateur fixe ('+' ou '-') d'un template d'affichage avec une valeur déjà
 * formatée en LaTeX qui peut elle-même être négative — évite le double signe visuel ('+ -3' au
 * lieu de '- 3', ou '- -3' au lieu de '+ 3') partout où ce pattern de concaténation existe sur la
 * plateforme (bug transversal, `6gen6-refonte-complete.md`). `valeurLatex` reste la représentation
 * LaTeX déjà produite par le formateur propre à chaque générateur (fraction, racine, etc.) — cette
 * fonction ne fait que lire/retirer un éventuel signe négatif en tête, jamais reformater la valeur
 * elle-même.
 */
export function fusionnerOperateurSigne(operateurFixe: "+" | "-", valeurLatex: string): string {
  const valeur = valeurLatex.trim();
  const estNegatif = valeur.startsWith("-");
  const valeurAbsolue = estNegatif ? valeur.slice(1).trim() : valeur;
  const operateurFinal = estNegatif ? (operateurFixe === "+" ? "-" : "+") : operateurFixe;
  return `${operateurFinal} ${valeurAbsolue}`;
}
