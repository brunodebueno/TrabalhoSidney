import type { ObjectiveFunction, Constraint, Solution } from "@/pages/home";

// Note: This would normally use the javascript-lp-solver library
// For now, implementing a basic simplex solver for the 2-variable case
export async function solveSimplex(
  objective: ObjectiveFunction,
  constraints: Constraint[]
): Promise<Solution> {
  try {
    // Convert to standard form for 2D linear programming
    // For a 2-variable problem, we can solve it graphically or use a simple implementation
    
    // Check if all constraints are valid
    for (const constraint of constraints) {
      if (constraint.operator !== '<=') {
        // For simplicity, this implementation only handles <= constraints
        // In a full implementation, we would convert >= and = constraints
        throw new Error(`Constraint operator ${constraint.operator} not supported in this simplified implementation`);
      }
    }

    // Find the feasible region corners by solving constraint intersections
    const corners = findFeasibleCorners(constraints);
    
    if (corners.length === 0) {
      return {
        feasible: false,
        bounded: true
      };
    }

    // Evaluate objective function at each corner
    let maxValue = -Infinity;
    let optimalPoint = corners[0];

    for (const corner of corners) {
      const value = objective.c1 * corner.x1 + objective.c2 * corner.x2;
      if (value > maxValue) {
        maxValue = value;
        optimalPoint = corner;
      }
    }

    return {
      feasible: true,
      bounded: true,
      result: maxValue,
      variables: {
        x1: optimalPoint.x1,
        x2: optimalPoint.x2
      }
    };
  } catch (error) {
    console.error("Simplex solving error:", error);
    return {
      feasible: false,
      bounded: true
    };
  }
}

interface Point {
  x1: number;
  x2: number;
}

function findFeasibleCorners(constraints: Constraint[]): Point[] {
  const corners: Point[] = [];
  
  // Add origin if feasible
  if (isPointFeasible({ x1: 0, x2: 0 }, constraints)) {
    corners.push({ x1: 0, x2: 0 });
  }

  // Find intersections of constraints with axes
  for (const constraint of constraints) {
    // Intersection with x1-axis (x2 = 0)
    if (constraint.a1 !== 0) {
      const x1 = constraint.rhs / constraint.a1;
      if (x1 >= 0) {
        const point = { x1, x2: 0 };
        if (isPointFeasible(point, constraints)) {
          corners.push(point);
        }
      }
    }

    // Intersection with x2-axis (x1 = 0)
    if (constraint.a2 !== 0) {
      const x2 = constraint.rhs / constraint.a2;
      if (x2 >= 0) {
        const point = { x1: 0, x2 };
        if (isPointFeasible(point, constraints)) {
          corners.push(point);
        }
      }
    }
  }

  // Find intersections between pairs of constraints
  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      const intersection = findConstraintIntersection(constraints[i], constraints[j]);
      if (intersection && intersection.x1 >= 0 && intersection.x2 >= 0) {
        if (isPointFeasible(intersection, constraints)) {
          corners.push(intersection);
        }
      }
    }
  }

  // Remove duplicate points
  const uniqueCorners: Point[] = [];
  for (const corner of corners) {
    const exists = uniqueCorners.some(existing => 
      Math.abs(existing.x1 - corner.x1) < 0.001 && 
      Math.abs(existing.x2 - corner.x2) < 0.001
    );
    if (!exists) {
      uniqueCorners.push(corner);
    }
  }

  return uniqueCorners;
}

function findConstraintIntersection(c1: Constraint, c2: Constraint): Point | null {
  // Solve system of equations:
  // c1.a1 * x1 + c1.a2 * x2 = c1.rhs
  // c2.a1 * x1 + c2.a2 * x2 = c2.rhs
  
  const det = c1.a1 * c2.a2 - c1.a2 * c2.a1;
  
  if (Math.abs(det) < 0.001) {
    // Lines are parallel
    return null;
  }

  const x1 = (c1.rhs * c2.a2 - c1.a2 * c2.rhs) / det;
  const x2 = (c1.a1 * c2.rhs - c1.rhs * c2.a1) / det;

  return { x1, x2 };
}

function isPointFeasible(point: Point, constraints: Constraint[]): boolean {
  for (const constraint of constraints) {
    const value = constraint.a1 * point.x1 + constraint.a2 * point.x2;
    
    switch (constraint.operator) {
      case '<=':
        if (value > constraint.rhs + 0.001) return false;
        break;
      case '>=':
        if (value < constraint.rhs - 0.001) return false;
        break;
      case '=':
        if (Math.abs(value - constraint.rhs) > 0.001) return false;
        break;
    }
  }
  
  return true;
}
