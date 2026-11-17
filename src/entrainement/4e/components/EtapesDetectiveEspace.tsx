import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DessinPave, ExerciceDetectiveEspace } from "../core/detectiveEspace.types";
import { cadreCommun, dessinPaveSvg, figureSolideSvg } from "../ui/formatDetectiveEspace";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Composants propres à gen107 (« Détective d'erreurs : géométrie dans l'espace ») : la figure de
 * l'énoncé (solide, avec des boutons « Ligne n » qui tracent les droites ou les points cités par une
 * ligne de la copie — jamais la réponse : seulement ce que la ligne nomme) et le choix d'un dessin
 * (écran c du thème « cavalière », une tentative). Les écrans a et b réutilisent ceux de gen81/gen91
 * (`EtapesDetectiveErreurs.tsx`).
 */

const STYLE_FIGURE = { maxWidth: 460, margin: "8px auto 0" } as const;

export function FigureDetectiveEspace({ e }: { e: ExerciceDetectiveEspace }) {
  const [ligne, setLigne] = useState<number | null>(null);
  const f = e.figure;
  const svg = useMemo(() => (f.type === "solide" ? figureSolideSvg(f, "ecran", { ligne }) : dessinPaveSvg(f.dessin, "ecran")), [f, ligne]);
  return (
    <div>
      <div style={STYLE_FIGURE} dangerouslySetInnerHTML={{ __html: svg }} />
      {f.type === "solide" && f.dessins && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", margin: "8px 0 0", alignItems: "center" }} role="group" aria-label="Tracer sur la figure les éléments d'une ligne">
          <span style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>Tracer :</span>
          {f.dessins.map((_, i) => (
            <button key={i} type="button" className={`btn${ligne === i ? " toggle-active" : ""}`} aria-pressed={ligne === i} style={{ minHeight: 44 }} onClick={() => setLigne(ligne === i ? null : i)}>
              {`Ligne ${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PropsDessins extends PropsAides {
  consigne: ReactNode;
  dessins: DessinPave[];
  attendue: number;
  onValider: (indice: number) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran c du thème « cavalière » : quatre dessins (même cadre), un seul juste. */
export function EtapeChoixDessin({ consigne, dessins, attendue, onValider, validation, ...aides }: PropsDessins) {
  const [choix, setChoix] = useState<number | null>(null);
  const fige = !!validation;
  const cadre = useMemo(() => cadreCommun(dessins), [dessins]);
  const svgs = useMemo(() => dessins.map((d) => dessinPaveSvg(d, "ecran", { etiquettes: false, cadre })), [dessins, cadre]);
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, margin: "12px 0" }} role="group" aria-label="Dessins proposés">
        {svgs.map((svg, i) => {
          const choisi = choix === i;
          const faux = fige && choisi && attendue !== i;
          const bon = fige && attendue === i && validation?.revele;
          return (
            <button
              key={i}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              aria-label={`Dessin ${i + 1}`}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ display: "block", padding: 6, height: "auto", minHeight: 44, outline: bon ? "3px solid var(--color-success, #15803d)" : undefined }}
              onClick={() => setChoix(i)}
            >
              <span style={{ display: "block", fontSize: "0.85em", marginBottom: 4 }}>{`Dessin ${i + 1}`}</span>
              <span style={{ display: "block", pointerEvents: "none" }} dangerouslySetInnerHTML={{ __html: svg }} />
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
