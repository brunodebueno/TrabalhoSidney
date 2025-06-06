import { useState } from "react";
import { Calculator } from "lucide-react";
import ProblemForm from "@/components/ProblemForm";
import ResultDisplay from "@/components/ResultDisplay";

export interface Constraint {
  id: string;
  a1: number;
  a2: number;
  operator: '<=' | '>=' | '=';
  rhs: number;
}

export interface ObjectiveFunction {
  c1: number;
  c2: number;
}

export interface Variables {
  x1: { name: string };
  x2: { name: string };
}

export interface Solution {
  feasible: boolean;
  bounded: boolean;
  result?: number;
  variables?: { [key: string]: number };
  constraintStatus?: Array<{
    constraint: string;
    value: number;
    slack: number;
    binding: boolean;
  }>;
}

export default function Home() {
  const [objective, setObjective] = useState<ObjectiveFunction>({ c1: 8, c2: 10 });
  const [variables, setVariables] = useState<Variables>({
    x1: { name: "Revelador Fino (litros)" },
    x2: { name: "Revelador Extrafino (litros)" }
  });
  const [constraints, setConstraints] = useState<Constraint[]>([
    { id: "1", a1: 2, a2: 1, operator: "<=", rhs: 50 },
    { id: "2", a1: 1, a2: 2, operator: "<=", rhs: 70 }
  ]);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary-custom text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Calculator className="h-8 w-8" />
            <h1 className="text-2xl font-medium">Linear Programming Simplex Calculator</h1>
          </div>
          <p className="text-blue-100 mt-2">Optimize your linear programming problems with the simplex method</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProblemForm
            objective={objective}
            setObjective={setObjective}
            variables={variables}
            setVariables={setVariables}
            constraints={constraints}
            setConstraints={setConstraints}
            setSolution={setSolution}
            isCalculating={isCalculating}
            setIsCalculating={setIsCalculating}
          />
          
          <ResultDisplay
            solution={solution}
            variables={variables}
            constraints={constraints}
            objective={objective}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>Linear Programming Simplex Calculator • Built with React & Tailwind CSS</p>
            <p className="mt-1">Powered by javascript-lp-solver library</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
