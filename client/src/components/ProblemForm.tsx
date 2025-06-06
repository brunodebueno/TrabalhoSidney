import { useState } from "react";
import { Plus, Trash2, Play, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { solveSimplex } from "@/lib/simplex";
import type { Constraint, ObjectiveFunction, Variables, Solution } from "@/pages/home";

interface ProblemFormProps {
  objective: ObjectiveFunction;
  setObjective: (obj: ObjectiveFunction) => void;
  variables: Variables;
  setVariables: (vars: Variables) => void;
  constraints: Constraint[];
  setConstraints: (constraints: Constraint[]) => void;
  setSolution: (solution: Solution | null) => void;
  isCalculating: boolean;
  setIsCalculating: (calculating: boolean) => void;
}

export default function ProblemForm({
  objective,
  setObjective,
  variables,
  setVariables,
  constraints,
  setConstraints,
  setSolution,
  isCalculating,
  setIsCalculating
}: ProblemFormProps) {
  const { toast } = useToast();

  const addConstraint = () => {
    const newId = Math.max(...constraints.map(c => parseInt(c.id)), 0) + 1;
    setConstraints([
      ...constraints,
      { id: newId.toString(), a1: 0, a2: 0, operator: "<=", rhs: 0 }
    ]);
  };

  const removeConstraint = (id: string) => {
    if (constraints.length <= 1) {
      toast({
        title: "Não é possível remover restrição",
        description: "Pelo menos uma restrição é obrigatória.",
        variant: "destructive"
      });
      return;
    }
    setConstraints(constraints.filter(c => c.id !== id));
  };

  const updateConstraint = (id: string, field: keyof Constraint, value: any) => {
    setConstraints(constraints.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const validateInputs = (): boolean => {
    // Check objective function
    if (isNaN(objective.c1) || isNaN(objective.c2)) {
      toast({
        title: "Função objetivo inválida",
        description: "Por favor, insira números válidos para os coeficientes da função objetivo.",
        variant: "destructive"
      });
      return false;
    }

    // Check constraints
    for (const constraint of constraints) {
      if (isNaN(constraint.a1) || isNaN(constraint.a2) || isNaN(constraint.rhs)) {
        toast({
          title: "Restrição inválida",
          description: `Por favor, insira números válidos para todos os coeficientes das restrições e valores do lado direito.`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Check variable names
    if (!variables.x1.name.trim() || !variables.x2.name.trim()) {
      toast({
        title: "Nomes de variáveis inválidos",
        description: "Por favor, forneça nomes para ambas as variáveis.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleCalculate = async () => {
    if (!validateInputs()) return;

    setIsCalculating(true);
    setSolution(null);

    try {
      const result = await solveSimplex(objective, constraints);
      setSolution(result);
      
      if (result.feasible) {
        toast({
          title: "Solução encontrada!",
          description: "A solução ótima foi calculada com sucesso.",
        });
      } else {
        toast({
          title: "Nenhuma solução viável",
          description: "O problema não possui solução viável com as restrições fornecidas.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Erro de cálculo",
        description: "Ocorreu um erro ao resolver o problema. Por favor, verifique suas entradas.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Objective Function Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary-custom" />
            <span>Função Objetivo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Maximizar:</p>
            <div className="flex flex-wrap items-center gap-2 font-roboto-mono text-base sm:text-lg">
              <span>Z = </span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={objective.c1}
                  onChange={(e) => setObjective({ ...objective, c1: parseFloat(e.target.value) || 0 })}
                  className="w-14 sm:w-16 text-center text-sm"
                  placeholder="8"
                />
                <span>x₁ +</span>
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={objective.c2}
                  onChange={(e) => setObjective({ ...objective, c2: parseFloat(e.target.value) || 0 })}
                  className="w-14 sm:w-16 text-center text-sm"
                  placeholder="10"
                />
                <span>x₂</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="var1-name">Nome da Variável 1</Label>
              <Input
                id="var1-name"
                value={variables.x1.name}
                onChange={(e) => setVariables({ ...variables, x1: { name: e.target.value } })}
                placeholder="Revelador Fino (litros)"
              />
            </div>
            <div>
              <Label htmlFor="var2-name">Nome da Variável 2</Label>
              <Input
                id="var2-name"
                value={variables.x2.name}
                onChange={(e) => setVariables({ ...variables, x2: { name: e.target.value } })}
                placeholder="Revelador Extrafino (litros)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Constraints Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span className="text-primary-custom">📏</span>
              <span>Restrições</span>
            </CardTitle>
            <Button
              onClick={addConstraint}
              size="sm"
              className="bg-primary-custom hover:bg-primary-dark-custom"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {constraints.map((constraint, index) => (
              <div key={constraint.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Restrição {index + 1}
                  </span>
                  <Button
                    onClick={() => removeConstraint(constraint.id)}
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-sm font-roboto-mono">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={constraint.a1}
                      onChange={(e) => updateConstraint(constraint.id, 'a1', parseFloat(e.target.value) || 0)}
                      className="w-12 h-8 text-center text-xs"
                      placeholder="2"
                    />
                    <span className="text-xs">x₁ +</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={constraint.a2}
                      onChange={(e) => updateConstraint(constraint.id, 'a2', parseFloat(e.target.value) || 0)}
                      className="w-12 h-8 text-center text-xs"
                      placeholder="1"
                    />
                    <span className="text-xs">x₂</span>
                  </div>
                  <Select
                    value={constraint.operator}
                    onValueChange={(value) => updateConstraint(constraint.id, 'operator', value)}
                  >
                    <SelectTrigger className="w-12 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<=">≤</SelectItem>
                      <SelectItem value=">=">≥</SelectItem>
                      <SelectItem value="=">=</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={constraint.rhs}
                    onChange={(e) => updateConstraint(constraint.id, 'rhs', parseFloat(e.target.value) || 0)}
                    className="w-16 h-8 text-center text-xs"
                    placeholder="50"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleCalculate}
              disabled={isCalculating}
              size="lg"
              className="bg-primary-custom hover:bg-primary-dark-custom font-medium shadow-md"
            >
              <Play className="h-5 w-5 mr-2" />
              {isCalculating ? "Calculando..." : "Calcular Solução Ótima"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
