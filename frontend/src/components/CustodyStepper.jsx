import React from "react";
import { Check } from "lucide-react";
import { STAGES } from "../constants";

export default function CustodyStepper({ stageIndex }) {
  return (
    <div className="flex items-center w-full">
      {STAGES.map((s, i) => {
        const done = i < stageIndex;
        const current = i === stageIndex;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`relative w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px]
                ${done ? "bg-verified border-verified text-[#0D1410]" : current ? "border-amber text-amber" : "border-[#3A424B] text-steel"}`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-wide ${current ? "text-amber" : done ? "text-verified" : "text-steel"}`}>
                {s}
              </span>
            </div>
            {i < STAGES.length - 1 && <div className={`flex-1 h-px mb-4 mx-1 ${i < stageIndex ? "bg-verified" : "bg-[#3A424B]"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
