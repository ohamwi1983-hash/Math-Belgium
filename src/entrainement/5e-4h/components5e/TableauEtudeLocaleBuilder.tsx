import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ColonneTableauEtudeLocale, ValeurLigne2Tableau, ValeurSigneTableau } from "../core5e/etudeLocale.types";
import type { ReponseTableauEtudeLocale, TableauEtudeLocaleAttendu } from "../moteur5e/verificationEtudeLocale";
import { libelleLigne2Tableau, libelleSigneTableau } from "../ui5e/formatEtudeLocale";
import { Katex } from "../components/Katex";

/**
 * Tableau de signes ÉTENDU (5gen29) — construit ENTIÈREMENT depuis zéro pour ce générateur, jamais
 * importé de `GrilleQuotientDomfBuilder.tsx` (5gen1, contrat propre/incompatible) : interaction de
 * cycle au clic (même mécanique visuelle — colonnes zone/point alternées, racines/exclusions
 * pré-placées en en-tête), 2 lignes au lieu de 3 : signe (4 états, +/-/0/∄) puis variation de f OU
 * concavité de f (`mode`) — 2 états sur une colonne ZONE, 3 (f') ou 2 (f'') états sur une colonne
 * RACINE, AUCUNE cellule sur une colonne d'exclusion CE (jamais de variation/concavité classée là).
 */

function cyclerSigne(actuel: ValeurSigneTableau | null): ValeurSigneTableau {
  if (actuel === null) return "+";
  if (actuel === "+") return "-";
  if (actuel === "-") return "0";
  if (actuel === "0") return "∄";
  return "+";
}

function cyclerLigne2Zone(actuel: ValeurLigne2Tableau | null, mode: "fprime" | "fseconde"): ValeurLigne2Tableau {
  if (mode === "fprime") return actuel === "↗" ? "↘" : "↗";
  return actuel === "∪" ? "∩" : "∪";
}

function cyclerLigne2Racine(actuel: ValeurLigne2Tableau | null, mode: "fprime" | "fseconde"): ValeurLigne2Tableau {
  if (mode === "fprime") {
    if (actuel === "max") return "min";
    if (actuel === "min") return "ni_lun_ni_lautre";
    return "max";
  }
  return actuel === "pi" ? "pas_de_pi" : "pi";
}

interface Props {
  colonnes: ColonneTableauEtudeLocale[];
  /** LaTeX affiché en en-tête pour chaque colonne "racine"/"exclusion" — "" pour une colonne
   * "zone" (aucun marqueur). Même longueur que `colonnes`. */
  enteteColonnes: string[];
  mode: "fprime" | "fseconde";
  attendu: TableauEtudeLocaleAttendu;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseTableauEtudeLocale) => void;
  /** Contenu rendu juste AVANT le bouton "Valider" — ex. le bouton "Aide", toujours au-dessus de
   * "Valider" (convention transversale). Absent par défaut. */
  contenuAvantValider?: ReactNode;
}

export function TableauEtudeLocaleBuilder({ colonnes, enteteColonnes, mode, attendu, tentativesUtilisees, tentativesMax, onValider, contenuAvantValider }: Props) {
  const n = colonnes.length;
  const [signes, setSignes] = useState<(ValeurSigneTableau | null)[]>(() => Array(n).fill(null));
  const [ligne2, setLigne2] = useState<(ValeurLigne2Tableau | null)[]>(() => Array(n).fill(null));
  useEffect(() => {
    setSignes(Array(n).fill(null));
    setLigne2(Array(n).fill(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  function cyclerCelluleSigne(j: number) {
    setSignes((etat) => etat.map((v, i) => (i === j ? cyclerSigne(v) : v)));
  }
  function cyclerCelluleLigne2(j: number) {
    if (colonnes[j].type === "exclusion") return;
    const cycler = colonnes[j].type === "zone" ? cyclerLigne2Zone : cyclerLigne2Racine;
    setLigne2((etat) => etat.map((v, i) => (i === j ? cycler(v, mode) : v)));
  }

  const complet = signes.every((v) => v !== null) && ligne2.every((v, i) => colonnes[i].type === "exclusion" || v !== null);
  const montrerErreurs = tentativesUtilisees > 0;

  function classeSigne(j: number): string {
    const erronee = montrerErreurs && signes[j] !== null && signes[j] !== attendu.signes[j];
    return erronee ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }
  function classeLigne2(j: number): string {
    const erronee = montrerErreurs && ligne2[j] !== null && ligne2[j] !== attendu.ligne2[j];
    return erronee ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }

  function valider() {
    if (!complet) return;
    onValider({ signes, ligne2 });
  }

  const libelleLigne2 = mode === "fprime" ? "Variations de f" : "Concavité de f";

  return (
    <div>
      <div className="grille-signes-scroll">
        <table className="grille-signes">
          <thead>
            <tr>
              <th className="grille-signes-label">x</th>
              <th className="grille-signes-borne">
                <Katex expression="-\infty" />
              </th>
              {colonnes.map((col, j) => (
                <th key={j} className={col.type === "zone" ? "grille-signes-zone" : "grille-signes-point"}>
                  {enteteColonnes[j] !== "" && <Katex expression={enteteColonnes[j]} />}
                </th>
              ))}
              <th className="grille-signes-borne">
                <Katex expression="+\infty" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="grille-signes-label">Signe</td>
              <td className="grille-signes-borne" />
              {colonnes.map((col, j) => (
                <td key={j} className={col.type === "zone" ? "grille-signes-zone" : "grille-signes-point"}>
                  <button type="button" className={classeSigne(j)} onClick={() => cyclerCelluleSigne(j)}>
                    {libelleSigneTableau(signes[j])}
                  </button>
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
            <tr>
              <td className="grille-signes-label">{libelleLigne2}</td>
              <td className="grille-signes-borne" />
              {colonnes.map((col, j) => (
                <td key={j} className={col.type === "zone" ? "grille-signes-zone" : "grille-signes-point"}>
                  {col.type !== "exclusion" && (
                    <button type="button" className={classeLigne2(j)} onClick={() => cyclerCelluleLigne2(j)}>
                      {libelleLigne2Tableau(ligne2[j])}
                    </button>
                  )}
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
          </tbody>
        </table>
      </div>
      {contenuAvantValider}
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
