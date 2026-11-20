import { useState } from "react";
import type { ReactNode } from "react";
import type { ComparateurSeuil, CompositionDirigee } from "../core5e/composerFonctions.types";
import type { ReponseCondition } from "../moteur5e/verificationComposerFonctions";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { TOLERANCE_SEUIL } from "../moteur5e/verificationComposerFonctions";
import { Katex } from "../components/Katex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { CONSIGNE_GENERALE_COMPOSER_FONCTIONS } from "../ui5e/formatComposerFonctions";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { MESSAGES_ILLISIBLE_FONCTIONS, t } from "../ui5e/retoursFonctions1";
import { PiedEcranFonctions } from "./PiedEcranFonctions";

const INVERSE: Record<ComparateurSeuil, ComparateurSeuil> = { ge: "le", le: "ge", gt: "lt", lt: "gt", ne: "ne", eq: "eq" };
const LARGE_STRICT: Record<ComparateurSeuil, ComparateurSeuil> = { ge: "gt", gt: "ge", le: "lt", lt: "le", ne: "ne", eq: "eq" };

/** Message ciblé (audit 5e ch. 1, lot B) : bon seuil mais comparateur inversé, ou large au lieu de
 * strict (et l'inverse) — le reste reçoit le message générique. */
function cibleConditions(dir: CompositionDirigee, reponse: ReponseCondition[]): FragmentConsigne[] | null {
  for (const c of dir.conditions) {
    const memeSeuil = reponse.filter((r) => Math.abs(r.seuil - c.seuil) < TOLERANCE_SEUIL);
    if (memeSeuil.length === 0) continue;
    if (memeSeuil.some((r) => r.comparateur === c.comparateur)) continue;
    if (memeSeuil.some((r) => r.comparateur === INVERSE[c.comparateur])) {
      return [t("Le sens d'une condition est inversé : relis le domaine de la fonction extérieure (de quel côté du seuil son argument doit-il être ?).")];
    }
    if (memeSeuil.some((r) => r.comparateur === LARGE_STRICT[c.comparateur])) {
      return [t("Une condition est large au lieu de stricte (ou l'inverse) : la borne appartient-elle au domaine de la fonction extérieure ? Une valeur qui annule un dénominateur en est exclue.")];
    }
  }
  if (reponse.some((r) => dir.conditions.some((c) => Math.abs(r.seuil + c.seuil) < TOLERANCE_SEUIL && Math.abs(c.seuil) > TOLERANCE_SEUIL))) {
    return [t("Un seuil a le mauvais signe : il se lit sur le domaine de la fonction extérieure (là où son argument est permis).")];
  }
  return null;
}

const OPTIONS_COMPARATEUR: { id: ComparateurSeuil; texte: string }[] = [
  { id: "ge", texte: "≥" },
  { id: "gt", texte: ">" },
  { id: "le", texte: "≤" },
  { id: "lt", texte: "<" },
  { id: "ne", texte: "≠" },
];

interface Ligne {
  comparateur: ComparateurSeuil | null;
  seuil: string;
}

interface Props {
  dir: CompositionDirigee;
  consigne: string;
  /** Bloc "données" persistant (f(x)/g(x)) — rendu juste APRÈS la consigne (A.9). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  texteAideNiveau1: string;
  latexAideNiveau2: string | null;
  termesEtatActuel?: string[];
  onValider: (reponse: ReponseCondition[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

function EtatActuelComposerFonctions({ termes }: { termes: string[] }) {
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/**
 * Écran B (D.4, riche uniquement) — pose 1 ou 2 conditions `interieure(x) ◇ seuil` (nombre FIXE,
 * connu à l'avance via `dir.conditions.length`, jamais add-as-needed) derrière un seul bouton
 * "Valider" — même patron "N lignes fixes, combobox comparateur + champ numérique" que l'écran CE
 * de 5gen1 (`EtapeCEDomaineDefinition.tsx`), réutilisant les mêmes classes CSS
 * (`.ce-ligne-champs`/`.ce-slot-latex`/`.ce-select`).
 */
export function EtapeConditionsComposerFonctions({ dir, consigne, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, texteAideNiveau1, latexAideNiveau2, termesEtatActuel, onValider, validation}: Props) {
  const [lignes, setLignes] = useState<Ligne[]>(() => dir.conditions.map(() => ({ comparateur: null, seuil: "" })));
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<ReponseCondition[] | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function modifierComparateur(i: number, comparateur: string) {
    setIllisible(false);
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, comparateur: comparateur as ComparateurSeuil } : l)));
  }
  function modifierSeuil(i: number, seuil: string) {
    setIllisible(false);
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, seuil } : l)));
  }

  const valeurs = lignes.map((l) => parserNombreOuFraction(l.seuil));
  const complet = lignes.every((l, i) => l.comparateur !== null && valeurs[i] !== null);
  /** Audit 5e ch. 1, point 24 : l'ordre des lignes ne compte plus — un seuil est juste s'il est celui
   * d'UNE des conditions attendues (recalculé à chaque rendu depuis la saisie actuelle). */
  function seuilErronee(i: number): boolean {
    const v = valeurs[i];
    return montrerErreurs && (v === null || !dir.conditions.some((c) => Math.abs(v - c.seuil) < TOLERANCE_SEUIL));
  }

  function valider() {
    // Comparateur manquant ou seuil illisible : message, rien n'est transmis (aucune tentative).
    if (!complet) {
      setIllisible(true);
      return;
    }
    setIllisible(false);
    const reponse = lignes.map((l, i) => ({ comparateur: l.comparateur as ComparateurSeuil, seuil: valeurs[i] as number }));
    setSoumise(reponse);
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE_COMPOSER_FONCTIONS} blocDonnees={donnees} />
      {termesEtatActuel !== undefined && <EtatActuelComposerFonctions termes={termesEtatActuel} />}
      <p className="prompt-text">{consigne}</p>
      {lignes.map((ligne, i) => (
        <div key={i} className="ce-ligne-champs">
          <span className="ce-slot-latex">
            <Katex expression={`${dir.nomInterieure}(x)`} />
          </span>
          <span className="select-souligne-wrap">
            <select className="ce-select" aria-label="Comparateur" value={ligne.comparateur ?? ""} onChange={(e) => modifierComparateur(i, e.target.value)}>
              <option value="" disabled>
                Choisis…
              </option>
              {OPTIONS_COMPARATEUR.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.texte}
                </option>
              ))}
            </select>
          </span>
          <input
            type="text"
            className={`text-input${seuilErronee(i) ? " is-erronee" : ""}`}
            placeholder="nombre"
            value={ligne.seuil}
            onChange={(e) => modifierSeuil(i, e.target.value)}
          />
        </div>
      ))}
      <PiedEcranFonctions
        aides={[{ texte: [t(texteAideNiveau1)] }, { texte: [t("Ici :")], formules: latexAideNiveau2 ? [latexAideNiveau2] : [] }]}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={lignes.every((l) => l.comparateur === null && l.seuil.trim() === "")}
        illisible={illisible}
        texteIllisible={MESSAGES_ILLISIBLE_FONCTIONS.seuil}
        tentativesUtilisees={montrerErreurs ? tentativesUtilisees : 0}
        tentativesMax={tentativesMax}
        cible={soumise ? cibleConditions(dir, soumise) : null}
        validation={validation}
      />
    </div>
  );
}
