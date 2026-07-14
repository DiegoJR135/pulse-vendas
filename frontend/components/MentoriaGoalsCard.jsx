// components/MentoriaGoalsCard.jsx
import { GraduationCap, CalendarClock } from "lucide-react";

function GoalBar({ icon: Icon, label, sublabel, current, target }) {
  const percent = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-white">
          <Icon className="h-4 w-4 text-[var(--green-400)]" />
          {label}
        </span>
        <span className="font-mono text-xs font-bold text-white">
          {current}/{target}
        </span>
      </div>
      <div className="progress-track h-2 w-full overflow-hidden rounded-full">
        <div className="progress-fill h-full rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1.5 font-mono text-[10px] font-medium text-[var(--muted)]">{sublabel}</p>
    </div>
  );
}

export default function MentoriaGoalsCard({ mentoriaGoal, meetingsGoal }) {
  return (
    <div className="glass-card space-y-5 p-6">
      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Meta mensal — Mentoria
      </span>

      <GoalBar
        icon={GraduationCap}
        label="Vendas do mês"
        sublabel="Meta mensal — reseta todo dia 1"
        current={mentoriaGoal.current}
        target={mentoriaGoal.target}
      />

      <GoalBar
        icon={CalendarClock}
        label="Reuniões agendadas"
        sublabel="Meta mensal — reseta todo dia 1"
        current={meetingsGoal.current}
        target={meetingsGoal.target}
      />
    </div>
  );
}
