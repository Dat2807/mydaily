import type { SavingGoal, SavingAllocation } from "../types";

export interface AllocationResult {
  allocations: Omit<SavingAllocation, "id" | "transactionId">[];
  unallocated: number;
  updatedGoals: SavingGoal[];
}

// Distribute a saving amount across active goals by priority order
export function allocateSaving(
  amount: number,
  goals: SavingGoal[],
  transactionDate: string
): AllocationResult {
  const activeGoals = goals
    .filter((g) => g.status === "active")
    .sort((a, b) => a.priority - b.priority);

  const allocations: Omit<SavingAllocation, "id" | "transactionId">[] = [];
  const updatedGoals: SavingGoal[] = goals.map((g) => ({ ...g }));
  let remaining = amount;

  for (const goal of activeGoals) {
    if (remaining <= 0) break;
    const goalRef = updatedGoals.find((g) => g.id === goal.id)!;
    const needed = goalRef.targetAmount - goalRef.currentAmount;
    if (needed <= 0) continue;

    const toAllocate = Math.min(remaining, needed);
    goalRef.currentAmount += toAllocate;
    remaining -= toAllocate;

    allocations.push({
      goalId: goal.id,
      amount: toAllocate,
      date: transactionDate,
    });

    if (goalRef.currentAmount >= goalRef.targetAmount) {
      goalRef.status = "completed";
      goalRef.completedAt = new Date().toISOString();
    }
  }

  return { allocations, unallocated: remaining, updatedGoals };
}

// Reverse allocation when a saving transaction is deleted
export function deallocateSaving(
  transactionId: string,
  allAllocations: SavingAllocation[],
  goals: SavingGoal[]
): { updatedGoals: SavingGoal[]; remainingAllocations: SavingAllocation[] } {
  const toRemove = allAllocations.filter((a) => a.transactionId === transactionId);
  const remaining = allAllocations.filter((a) => a.transactionId !== transactionId);
  const updatedGoals: SavingGoal[] = goals.map((g) => ({ ...g }));

  for (const alloc of toRemove) {
    const goal = updatedGoals.find((g) => g.id === alloc.goalId);
    if (goal) {
      goal.currentAmount = Math.max(0, goal.currentAmount - alloc.amount);
      // Reopen if it was completed by this allocation
      if (goal.status === "completed" && goal.currentAmount < goal.targetAmount) {
        goal.status = "active";
        goal.completedAt = undefined;
      }
    }
  }

  return { updatedGoals, remainingAllocations: remaining };
}
