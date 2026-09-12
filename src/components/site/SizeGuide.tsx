import { useState } from "react";

const ROWS = [
  { size: "XS", uk: "6", bust: "80", waist: "62", hip: "88" },
  { size: "S", uk: "8", bust: "84", waist: "66", hip: "92" },
  { size: "M", uk: "10-12", bust: "90", waist: "72", hip: "98" },
  { size: "L", uk: "14", bust: "96", waist: "78", hip: "104" },
  { size: "XL", uk: "16", bust: "102", waist: "84", hip: "110" },
];

export function SizeGuide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="label-xs underline underline-offset-4">
        Size guide
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-md bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg">Size guide</h3>
            <p className="mt-1 text-xs text-muted-foreground">Measurements in centimetres.</p>
            <table className="mt-5 w-full text-left text-sm">
              <thead>
                <tr className="label-xs border-b border-border text-muted-foreground">
                  <th className="py-2">Size</th>
                  <th className="py-2">UK</th>
                  <th className="py-2">Bust</th>
                  <th className="py-2">Waist</th>
                  <th className="py-2">Hip</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.size} className="border-b border-border/60">
                    <td className="py-2">{r.size}</td>
                    <td className="py-2">{r.uk}</td>
                    <td className="py-2">{r.bust}</td>
                    <td className="py-2">{r.waist}</td>
                    <td className="py-2">{r.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn-outline mt-6 w-full" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
