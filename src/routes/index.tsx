import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calculator" },
      { name: "description", content: "A responsive calculator with keyboard support." },
      { property: "og:title", content: "Calculator" },
      { property: "og:description", content: "A responsive calculator with keyboard support." },
    ],
  }),
  component: Index,
});

type Op = "+" | "-" | "*" | "/";

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
  }
}

function format(n: number): string {
  if (!isFinite(n)) return "Error";
  const s = String(n);
  if (s.length > 12) return n.toPrecision(10).replace(/\.?0+(e|$)/, "$1");
  return s;
}

function Index() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [overwrite, setOverwrite] = useState(true);

  const inputDigit = useCallback((d: string) => {
    setDisplay((cur) => {
      if (overwrite) { setOverwrite(false); return d; }
      if (cur === "0") return d;
      if (cur.length >= 14) return cur;
      return cur + d;
    });
  }, [overwrite]);

  const inputDot = useCallback(() => {
    if (overwrite) { setDisplay("0."); setOverwrite(false); return; }
    setDisplay((cur) => (cur.includes(".") ? cur : cur + "."));
  }, [overwrite]);

  const clearAll = useCallback(() => {
    setDisplay("0"); setPrev(null); setOp(null); setOverwrite(true);
  }, []);

  const applyOp = useCallback((nextOp: Op) => {
    const cur = parseFloat(display);
    if (prev === null || op === null) {
      setPrev(cur);
    } else if (!overwrite) {
      const r = compute(prev, cur, op);
      setPrev(r);
      setDisplay(format(r));
    }
    setOp(nextOp);
    setOverwrite(true);
  }, [display, prev, op, overwrite]);

  const equals = useCallback(() => {
    if (prev === null || op === null) return;
    const cur = parseFloat(display);
    const r = compute(prev, cur, op);
    setDisplay(format(r));
    setPrev(null); setOp(null); setOverwrite(true);
  }, [display, prev, op]);

  const backspace = useCallback(() => {
    if (overwrite) return;
    setDisplay((cur) => (cur.length <= 1 ? "0" : cur.slice(0, -1)));
  }, [overwrite]);

  const toggleSign = useCallback(() => {
    setDisplay((cur) => (cur === "0" ? cur : cur.startsWith("-") ? cur.slice(1) : "-" + cur));
  }, []);

  const percent = useCallback(() => {
    setDisplay((cur) => format(parseFloat(cur) / 100));
    setOverwrite(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) { e.preventDefault(); inputDigit(k); }
      else if (k === ".") { e.preventDefault(); inputDot(); }
      else if (k === "+" || k === "-" || k === "*" || k === "/") { e.preventDefault(); applyOp(k as Op); }
      else if (k === "Enter" || k === "=") { e.preventDefault(); equals(); }
      else if (k === "Backspace") { e.preventDefault(); backspace(); }
      else if (k === "Escape" || k.toLowerCase() === "c") { e.preventDefault(); clearAll(); }
      else if (k === "%") { e.preventDefault(); percent(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputDigit, inputDot, applyOp, equals, backspace, clearAll, percent]);

  const btn = "h-14 sm:h-16 rounded-2xl font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm";
  const num = `${btn} bg-card text-card-foreground hover:bg-accent`;
  const fn = `${btn} bg-muted text-muted-foreground hover:bg-muted/80`;
  const opCls = (active: boolean) =>
    `${btn} ${active ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground hover:bg-primary/90"}`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <h1 className="sr-only">Calculator</h1>
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xl">
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-2xl bg-muted px-4 py-6 text-right"
          >
            <div className="text-xs text-muted-foreground h-4 tabular-nums">
              {prev !== null && op ? `${format(prev)} ${op}` : "\u00A0"}
            </div>
            <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground tabular-nums break-all">
              {display}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <button className={fn} onClick={clearAll} aria-label="Clear">AC</button>
            <button className={fn} onClick={toggleSign} aria-label="Toggle sign">±</button>
            <button className={fn} onClick={percent} aria-label="Percent">%</button>
            <button className={opCls(op === "/")} onClick={() => applyOp("/")} aria-label="Divide">÷</button>

            <button className={num} onClick={() => inputDigit("7")}>7</button>
            <button className={num} onClick={() => inputDigit("8")}>8</button>
            <button className={num} onClick={() => inputDigit("9")}>9</button>
            <button className={opCls(op === "*")} onClick={() => applyOp("*")} aria-label="Multiply">×</button>

            <button className={num} onClick={() => inputDigit("4")}>4</button>
            <button className={num} onClick={() => inputDigit("5")}>5</button>
            <button className={num} onClick={() => inputDigit("6")}>6</button>
            <button className={opCls(op === "-")} onClick={() => applyOp("-")} aria-label="Subtract">−</button>

            <button className={num} onClick={() => inputDigit("1")}>1</button>
            <button className={num} onClick={() => inputDigit("2")}>2</button>
            <button className={num} onClick={() => inputDigit("3")}>3</button>
            <button className={opCls(op === "+")} onClick={() => applyOp("+")} aria-label="Add">+</button>

            <button className={`${num} col-span-2`} onClick={() => inputDigit("0")}>0</button>
            <button className={num} onClick={inputDot}>.</button>
            <button className={`${btn} bg-primary text-primary-foreground hover:bg-primary/90`} onClick={equals} aria-label="Equals">=</button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Tip: use your keyboard — 0–9, + − × ÷, Enter, Backspace, Esc
          </p>
        </div>
      </div>
    </main>
  );
}
