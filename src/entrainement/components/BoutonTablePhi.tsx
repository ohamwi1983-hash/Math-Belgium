import { useEffect, useState } from "react";
import { TablePhi } from "./TablePhi";

/**
 * Bouton flottant « Table de Φ » (6e ch. 8, lot H2 : 6gen116, 6gen118, 6gen119, 6gen120, 6gen122) —
 * pour un générateur bâti sur un socle sans emplacement libre (`AppEcransTrigo`, que l'on ne modifie
 * pas) : à placer à côté de l'appli. Il ouvre, dans un panneau en bas de l'écran, le composant PARTAGÉ
 * `TablePhi` (valeurs : `lib/tablePhi.ts`, la même table que 6gen51 et l'annexe papier), déplié.
 * Fermeture : bouton « Fermer », touche Échap.
 *
 * Sur téléphone et tablette, le bouton se pose AU-DESSUS de la barre fixe du bas (« Valider »,
 * message de retour, clavier : variables `--barre-h`, `--barre-retour-h`, `--clavier` du cadre, comme
 * la calculatrice flottante) et le panneau ouvert passe par-dessus cette barre. Classe `.btn` neutre
 * (jamais `.btn-primary` : le cadre prendrait ce bouton pour le bouton principal de l'écran). Une
 * marge sous la page évite que le bouton recouvre la fin de l'exercice.
 */
export function BoutonTablePhi() {
  const [ouverte, setOuverte] = useState(false);
  useEffect(() => {
    if (!ouverte) return;
    const echap = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOuverte(false);
    };
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [ouverte]);
  return (
    <>
      <div aria-hidden="true" style={{ height: 76 }} />
      {ouverte && (
        <div
          role="dialog"
          aria-label="Table de Φ"
          className="table-phi-panneau"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 430,
            maxHeight: "min(92vh, calc(60vh + 170px))",
            overflowY: "auto",
            padding: "8px 12px 12px",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            borderTop: "2px solid var(--color-primary)",
            boxShadow: "0 -6px 18px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <strong style={{ fontSize: 15 }}>Table de Φ</strong>
              <button type="button" className="btn" style={{ width: "auto", minHeight: 44, margin: 0 }} onClick={() => setOuverte(false)}>
                Fermer
              </button>
            </div>
            <TablePhi ouverte />
          </div>
        </div>
      )}
      {!ouverte && (
        <button
          type="button"
          className="btn bouton-table-phi"
          aria-haspopup="dialog"
          onClick={() => setOuverte(true)}
          style={{ position: "fixed", right: 12, bottom: "calc(var(--clavier, 0px) + var(--barre-h, 0px) + var(--barre-retour-h, 0px) + 12px)", zIndex: 390, width: "auto", minHeight: 48, margin: 0, padding: "0 16px", borderRadius: 24, border: "2px solid var(--color-primary)", background: "var(--color-surface)", color: "var(--color-primary)", fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,0.22)" }}
        >
          Table de Φ
        </button>
      )}
    </>
  );
}
