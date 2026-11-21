import { useState } from "react";
import type { ReactNode } from "react";
import { messageFragments } from "../ui/formatTransformationDonnees";
import type { Champ, Fragments } from "../ui/ecransTransfertSecondDegre";
import { lireEnsemble, normaliserExpression, saisieEnsembleComplete, type Saisie, type SaisieEnsemble, type StatutChamp } from "../moteur/verificationTransfertSecondDegre";
import { ensembleLatex } from "../moteur/algebreTransfertSecondDegre";
import { etatListeInitiale } from "../ui/listeMorceaux";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments, espacesInsecables } from "./RenduFragments";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { ListePointsIsolesInput } from "./ListePointsIsolesInput";
import { Katex } from "./Katex";
import { saisieEnLatex } from "../ui/historiqueProgression";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran « champs » des nouveaux générateurs du chapitre 2 de 4e (gen115, gen116, gen118, gen119,
 * gen120) : nombres, listes de nombres, expressions, équations, inéquations (aperçu KaTeX en
 * direct) et ensembles-solutions construits (∅, ℝ, nombres isolés, intervalles + points isolés, avec
 * les composants de saisie d'intervalles du chapitre). Jamais de blocage de frappe : seule
 * `normaliserSigneMoins`, aucun `inputMode`. 3 tentatives ; une saisie illisible n'en consomme
 * aucune (l'appli ne l'envoie pas). Le choix fermé réutilise `EtapeChoixTransformation`.
 */

export function saisieInitiale(c: Champ): Saisie {
  return c.type === "ensemble" ? { forme: null, nombres: "", morceaux: etatListeInitiale(), points: [] } : "";
}

/** Rendu de la saisie d'un champ (fiche de l'écran, réponse « Ta réponse »). */
export function saisieAffichee(saisie: Saisie, c: Champ): ReactNode {
  if (typeof saisie !== "string") {
    const e = lireEnsemble(saisie);
    return e ? <Katex expression={`${c.type === "ensemble" && c.prefixeApercu ? c.prefixeApercu : "S="}${ensembleLatex(e)}`} /> : "—";
  }
  if (c.type === "nombre" || c.type === "liste") return saisie.trim().replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2");
  if (c.type === "libre") {
    const l = c.affichee?.(saisie);
    return l ? <Katex expression={l} /> : saisie.trim().replace(/-/g, "−");
  }
  return saisieEnLatex(normaliserExpression(saisie));
}

const AIDE_SAISIE: Record<Champ["type"], string> = {
  nombre: "Un nombre exact : entier, fraction (5/2), décimal à virgule ou racine (√2).",
  liste: "Sépare les valeurs par « ; » (par exemple 3 ; −1/2). S'il n'y en a aucune, écris « aucune ».",
  expression: "Écris x² ou x^2 ; la multiplication peut rester implicite (3x, 2(x+1)).",
  equation: "Écris une équation complète, avec « = » (par exemple 2x² − 3x + 1 = 0).",
  relation: "Symboles au clavier : < ou >, <= pour ≤, >= pour ≥ (= pour une équation).",
  ensemble: "",
  personnalise: "",
  libre: "",
};

function ChampTexte({ champ, valeur, onChange, erronee, fige }: { champ: Champ; valeur: string; onChange: (v: string) => void; erronee: boolean; fige: boolean }) {
  const avecApercu = champ.type === "expression" || champ.type === "equation" || champ.type === "relation" || (champ.type === "personnalise" && !!champ.apercu) || (champ.type === "libre" && !!champ.apercu);
  return (
    <div style={{ minWidth: 0 }} data-champ={champ.id}>
      {avecApercu && !fige && <ApercuExpressionLatex texte={normaliserExpression(valeur)} />}
      <label style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
        <span className="field-label field-label-minuscule" style={{ margin: 0, maxWidth: "100%" }}>
          <RenduFragments fragments={champ.libelle} />
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 160px", minWidth: 0 }}>
          <input
            className={`text-input${erronee ? " is-erronee" : ""}`}
            style={{ flex: 1, minWidth: 0 }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={valeur}
            disabled={fige}
            onChange={(ev) => onChange(normaliserSigneMoins(ev.target.value))}
          />
          {champ.unite && <span style={{ whiteSpace: "nowrap" }}>{champ.unite}</span>}
        </span>
      </label>
    </div>
  );
}

const FORMES: { forme: NonNullable<SaisieEnsemble["forme"]>; libelle: string }[] = [
  { forme: "vide", libelle: "∅ (aucune valeur)" },
  { forme: "reel", libelle: "ℝ (tous les réels)" },
  { forme: "nombres", libelle: "Des nombres isolés" },
  { forme: "intervalles", libelle: "Un ou plusieurs intervalles" },
];

function ChampEnsembleSaisie({ champ, valeur, onChange, erronee, fige }: { champ: Champ; valeur: SaisieEnsemble; onChange: (v: SaisieEnsemble) => void; erronee: boolean; fige: boolean }) {
  const apercu = saisieEnsembleComplete(valeur) ? lireEnsemble(valeur) : null;
  return (
    <div style={{ minWidth: 0 }} data-champ={champ.id} className={erronee ? "ensemble-erronee" : undefined}>
      <p className="field-label field-label-minuscule" style={{ margin: "0 0 6px" }}>
        <RenduFragments fragments={champ.libelle} />
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {FORMES.map((f) => (
          <button
            key={f.forme}
            type="button"
            disabled={fige}
            aria-pressed={valeur.forme === f.forme}
            className={`btn${valeur.forme === f.forme ? " toggle-active" : ""}`}
            style={{ minHeight: 44 }}
            onClick={() => onChange({ forme: f.forme, nombres: "", morceaux: etatListeInitiale(), points: [] })}
          >
            {f.libelle}
          </button>
        ))}
      </div>
      {!fige && valeur.forme === "nombres" && (
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden="true">{"{"}</span>
          <input
            className={`text-input${erronee ? " is-erronee" : ""}`}
            style={{ flex: 1, minWidth: 0 }}
            autoComplete="off"
            spellCheck={false}
            aria-label="Nombres séparés par un point-virgule"
            value={valeur.nombres}
            onChange={(ev) => onChange({ ...valeur, nombres: normaliserSigneMoins(ev.target.value) })}
          />
          <span aria-hidden="true">{"}"}</span>
        </label>
      )}
      {!fige && valeur.forme === "intervalles" && (
        <>
          <ListeMorceauxInput etat={valeur.morceaux} onChange={(morceaux) => onChange({ ...valeur, morceaux })} />
          <ListePointsIsolesInput valeurs={valeur.points} onChange={(points) => onChange({ ...valeur, points })} />
        </>
      )}
      {apercu && (
        <p style={{ margin: "8px 0 0" }}>
          <Katex expression={`${champ.type === "ensemble" && champ.prefixeApercu ? champ.prefixeApercu : champ.type === "ensemble" && champ.variable !== "x" ? `${champ.variable}\\in ` : "S="}${ensembleLatex(apercu)}`} />
        </p>
      )}
    </div>
  );
}

interface PropsAides {
  aides: Fragments[];
  niveauAide: number;
  onActiverAide: () => void;
}

function BlocAides({ aides, niveauAide, onActiverAide }: PropsAides) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={aide} />
          </p>
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

interface PropsChamps extends PropsAides {
  consigne: Fragments;
  champs: Champ[];
  tentativesUtilisees: number;
  tentativesMax: number;
  statuts: StatutChamp[] | null;
  /** Dernière soumission illisible : aucune tentative comptée. */
  illisible: boolean;
  /** Dernière soumission juste mais pas dans la forme demandée (gen126) : message, aucune tentative
   * comptée. */
  messageForme?: string | null;
  onValider: (saisies: Saisie[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChampsTransfert({ consigne, champs, tentativesUtilisees, tentativesMax, statuts, illisible, messageForme, onValider, validation, ...aides }: PropsChamps) {
  const [saisies, setSaisies] = useState<Saisie[]>(() => champs.map(saisieInitiale));
  const fige = !!validation;
  const complet = saisies.every((s) => (typeof s === "string" ? s.trim() !== "" : saisieEnsembleComplete(s)));
  const message = statuts?.find((s) => s.etat !== "correct" && s.message)?.message;
  const fautes = statuts ? statuts.filter((s) => s.etat !== "correct").length : 0;
  const types = [...new Set(champs.map((c) => c.type))].filter((t) => t !== "ensemble" && t !== "personnalise" && t !== "libre");
  const aidesPersonnalisees = [...new Set(champs.flatMap((c) => (c.type === "personnalise" ? [c.aideSaisie ?? ""] : c.type === "libre" ? [c.aideSaisie] : [])).filter((t) => t !== ""))];

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <div style={{ display: "grid", gap: 14, margin: "12px 0", minWidth: 0 }}>
        {champs.map((champ, i) => {
          const erronee = !fige && statuts !== null && statuts[i]!.etat !== "correct";
          const s = saisies[i]!;
          const maj = (v: Saisie) => setSaisies((t) => t.map((x, j) => (j === i ? v : x)));
          return typeof s === "string" ? (
            <ChampTexte key={champ.id} champ={champ} valeur={s} onChange={maj} erronee={erronee} fige={fige} />
          ) : (
            <ChampEnsembleSaisie key={champ.id} champ={champ} valeur={s} onChange={maj} erronee={erronee} fige={fige} />
          );
        })}
      </div>
      {!validation && (
        <>
          {types.length + aidesPersonnalisees.length > 0 && (
            <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
              {espacesInsecables([...types.map((t) => AIDE_SAISIE[t]), ...aidesPersonnalisees].join(" "))}
            </p>
          )}
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {illisible && (
            <p className="alert-error" role="alert">
              Une saisie n'est pas lisible (ou est incomplète) : vérifie l'écriture. Aucune tentative n'est comptée.
            </p>
          )}
          {!illisible && messageForme && (
            <div className="alert-error" role="alert">
              <span>
                <RenduFragments fragments={messageFragments(`${messageForme} Aucune tentative n'est comptée.`)} />
              </span>
            </div>
          )}
          {!illisible && !messageForme && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {message && (
                  <p style={{ margin: "6px 0 0" }}>
                    <RenduFragments fragments={messageFragments(message)} />
                  </p>
                )}
                {champs.length > 1 && fautes > 0 && <p style={{ margin: "6px 0 0" }}>Les champs en rouge sont à revoir.</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
