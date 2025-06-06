import { CheckCircle, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Solution, Variables, Constraint, ObjectiveFunction } from "@/pages/home";

interface ResultDisplayProps {
  solution: Solution | null;
  variables: Variables;
  constraints: Constraint[];
  objective: ObjectiveFunction;
}

export default function ResultDisplay({ solution, variables, constraints, objective }: ResultDisplayProps) {
  if (!solution) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma Solução Ainda</p>
              <p className="text-sm mt-2">Insira os dados do seu problema e clique em "Calcular" para ver a solução ótima.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!solution.feasible) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive-custom">
              <CheckCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhuma Solução Viável</p>
              <p className="text-sm mt-2">As restrições fornecidas não possuem solução viável. Por favor, revise a formulação do seu problema.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const getConstraintValue = (constraint: Constraint, x1: number, x2: number): number => {
    return constraint.a1 * x1 + constraint.a2 * x2;
  };

  const isConstraintBinding = (constraint: Constraint, x1: number, x2: number): boolean => {
    const value = getConstraintValue(constraint, x1, x2);
    return Math.abs(value - constraint.rhs) < 0.001;
  };

  const x1Value = solution.variables?.x1 || 0;
  const x2Value = solution.variables?.x2 || 0;

  return (
    <div className="space-y-6">
      {/* Solution Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-success-custom" />
            <span>Solução Ótima</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Results Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Lucro Máximo</h3>
              <div className="text-3xl font-bold text-success-custom font-roboto-mono">
                {formatNumber(solution.result || 0)} centavos
              </div>
            </div>
          </div>

          {/* Variable Values */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Valores Ótimos das Variáveis</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Variável x₁</span>
                    <p className="font-medium text-gray-800">{variables.x1.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-custom font-roboto-mono">
                      {formatNumber(x1Value)}
                    </div>
                    <div className="text-sm text-gray-600">litros</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Variável x₂</span>
                    <p className="font-medium text-gray-800">{variables.x2.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-custom font-roboto-mono">
                      {formatNumber(x2Value)}
                    </div>
                    <div className="text-sm text-gray-600">litros</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Constraint Status */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Análise das Restrições</h3>
            <div className="space-y-2">
              {constraints.map((constraint, index) => {
                const value = getConstraintValue(constraint, x1Value, x2Value);
                const binding = isConstraintBinding(constraint, x1Value, x2Value);
                const operatorSymbol = constraint.operator === '<=' ? '≤' : constraint.operator === '>=' ? '≥' : '=';
                
                return (
                  <div key={constraint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-roboto-mono text-sm">
                      {constraint.a1}x₁ + {constraint.a2}x₂ {operatorSymbol} {constraint.rhs}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-roboto-mono text-sm">{formatNumber(value)}</span>
                      <Badge variant={binding ? "destructive" : "secondary"}>
                        {binding ? "Ativa" : "Folga"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-custom" />
            <span>Passos do Cálculo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-custom text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <span className="text-sm text-gray-700">Formulação do problema validada</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-custom text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <span className="text-sm text-gray-700">Tableau inicial construído</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-custom text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <span className="text-sm text-gray-700">Iterações do simplex concluídas</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="flex-shrink-0 w-6 h-6 bg-success-custom text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <span className="text-sm text-gray-700">Solução ótima encontrada</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
