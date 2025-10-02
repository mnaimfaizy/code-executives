// src/components/models2d/bigo/metaphors/TSPVisualization.tsx
// Interactive visualization of the Traveling Salesman Problem (TSP)

import React, { useState, useEffect } from 'react';

interface TSPVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface City {
  id: number;
  x: number;
  y: number;
  name: string;
}

interface Path {
  cities: number[];
  distance: number;
  isOptimal: boolean;
}

const TSPVisualization: React.FC<TSPVisualizationProps> = ({ className = '' }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [bestPath, setBestPath] = useState<Path | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [iterations, setIterations] = useState(0);

  // Initialize cities
  useEffect(() => {
    const initialCities: City[] = [
      { id: 0, x: 100, y: 100, name: 'A' },
      { id: 1, x: 300, y: 80, name: 'B' },
      { id: 2, x: 350, y: 200, name: 'C' },
      { id: 3, x: 150, y: 250, name: 'D' },
      { id: 4, x: 50, y: 180, name: 'E' },
    ];
    setCities(initialCities);
  }, []);

  const calculateDistance = (path: number[]): number => {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const cityA = cities[path[i]];
      const cityB = cities[path[i + 1]];
      distance += Math.sqrt(Math.pow(cityB.x - cityA.x, 2) + Math.pow(cityB.y - cityA.y, 2));
    }
    // Return to start
    const lastCity = cities[path[path.length - 1]];
    const firstCity = cities[path[0]];
    distance += Math.sqrt(
      Math.pow(firstCity.x - lastCity.x, 2) + Math.pow(firstCity.y - lastCity.y, 2)
    );
    return Math.round(distance);
  };

  const runBruteForce = async () => {
    if (cities.length > 10) {
      alert('Brute force would take too long for more than 10 cities!');
      return;
    }

    setIsRunning(true);
    setIterations(0);
    setBestPath(null);

    const allPermutations = generatePermutations(cities.map((c) => c.id));

    for (const perm of allPermutations) {
      setCurrentPath([...perm]);
      const distance = calculateDistance(perm);
      setCurrentDistance(distance);
      setIterations((prev) => prev + 1);

      if (!bestPath || distance < bestPath.distance) {
        setBestPath({ cities: [...perm], distance, isOptimal: true });
      }

      await new Promise((resolve) => setTimeout(resolve, 500)); // Animation delay
    }

    setIsRunning(false);
  };

  const runGreedyApproximation = async () => {
    setIsRunning(true);
    setIterations(0);
    setBestPath(null);

    // Start from city 0
    const path = [0];
    const remaining = cities.map((c) => c.id).filter((id) => id !== 0);

    while (remaining.length > 0) {
      const lastCity = path[path.length - 1];
      let nearestCity = remaining[0];
      let minDistance = calculateDistance([lastCity, nearestCity]);

      for (const cityId of remaining) {
        const distance = calculateDistance([lastCity, cityId]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = cityId;
        }
      }

      path.push(nearestCity);
      remaining.splice(remaining.indexOf(nearestCity), 1);

      setCurrentPath([...path]);
      setCurrentDistance(calculateDistance(path));
      setIterations((prev) => prev + 1);

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const finalDistance = calculateDistance(path);
    setBestPath({ cities: [...path], distance: finalDistance, isOptimal: false });
    setIsRunning(false);
  };

  const generatePermutations = (arr: number[]): number[][] => {
    if (arr.length <= 1) return [arr];
    const permutations: number[][] = [];

    for (let i = 0; i < arr.length; i++) {
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const subPermutations = generatePermutations(remaining);
      for (const perm of subPermutations) {
        permutations.push([arr[i], ...perm]);
      }
    }

    return permutations;
  };

  const reset = () => {
    setCurrentPath([]);
    setBestPath(null);
    setCurrentDistance(0);
    setIterations(0);
    setIsRunning(false);
  };

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg border-2 border-gray-200 p-4 ${className}`}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Traveling Salesman Problem (TSP)</h3>
        <p className="text-sm text-gray-600">
          Find the shortest route visiting each city exactly once and returning home
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-blue-600">{cities.length}</div>
          <div className="text-gray-600">Cities</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-600">{currentDistance}</div>
          <div className="text-gray-600">Current Distance</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-purple-600">{iterations}</div>
          <div className="text-gray-600">Iterations</div>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative mb-4" style={{ height: '200px' }}>
        <svg width="400" height="200" className="border border-gray-300 rounded">
          {/* Current path */}
          {currentPath.length > 1 && (
            <g>
              {currentPath.map((cityId, index) => {
                if (index < currentPath.length - 1) {
                  const cityA = cities[cityId];
                  const cityB = cities[currentPath[index + 1]];
                  return (
                    <line
                      key={`current-${index}`}
                      x1={cityA.x}
                      y1={cityA.y}
                      x2={cityB.x}
                      y2={cityB.y}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      opacity="0.7"
                    />
                  );
                }
                return null;
              })}
              {/* Return to start */}
              {currentPath.length === cities.length && (
                <line
                  x1={cities[currentPath[currentPath.length - 1]].x}
                  y1={cities[currentPath[currentPath.length - 1]].y}
                  x2={cities[currentPath[0]].x}
                  y2={cities[currentPath[0]].y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.7"
                  strokeDasharray="5,5"
                />
              )}
            </g>
          )}

          {/* Best path */}
          {bestPath && (
            <g>
              {bestPath.cities.map((cityId, index) => {
                if (index < bestPath.cities.length - 1) {
                  const cityA = cities[cityId];
                  const cityB = cities[bestPath.cities[index + 1]];
                  return (
                    <line
                      key={`best-${index}`}
                      x1={cityA.x}
                      y1={cityA.y}
                      x2={cityB.x}
                      y2={cityB.y}
                      stroke={bestPath.isOptimal ? '#10b981' : '#f59e0b'}
                      strokeWidth="3"
                    />
                  );
                }
                return null;
              })}
              {/* Return to start */}
              <line
                x1={cities[bestPath.cities[bestPath.cities.length - 1]].x}
                y1={cities[bestPath.cities[bestPath.cities.length - 1]].y}
                x2={cities[bestPath.cities[0]].x}
                y2={cities[bestPath.cities[0]].y}
                stroke={bestPath.isOptimal ? '#10b981' : '#f59e0b'}
                strokeWidth="3"
              />
            </g>
          )}

          {/* Cities */}
          {cities.map((city) => (
            <g key={city.id}>
              <circle
                cx={city.x}
                cy={city.y}
                r="15"
                fill="#ffffff"
                stroke="#374151"
                strokeWidth="2"
              />
              <text
                x={city.x}
                y={city.y}
                textAnchor="middle"
                dy="0.35em"
                className="text-sm font-bold fill-gray-800"
              >
                {city.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={runBruteForce}
          disabled={isRunning || cities.length > 10}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {cities.length > 10 ? 'Too Many Cities' : 'Brute Force (Optimal)'}
        </button>
        <button
          onClick={runGreedyApproximation}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          Greedy Approximation
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {bestPath && (
        <div className="text-center text-sm text-gray-600 mb-2">
          <strong>Best Path Found:</strong>{' '}
          {bestPath.cities.map((id) => cities[id].name).join(' → ')} →{' '}
          {cities[bestPath.cities[0]].name}
          <br />
          <strong>Distance:</strong> {bestPath.distance}{' '}
          {bestPath.isOptimal ? '(Optimal)' : '(Approximation)'}
        </div>
      )}

      {/* Explanation */}
      <div className="text-xs text-gray-600 text-center">
        <p>
          <strong>NP-Complete:</strong> TSP grows exponentially with city count. For {cities.length}{' '}
          cities, there are {((cities.length - 1) * cities.length) / 2} possible routes to check!
        </p>
      </div>
    </div>
  );
};

export default TSPVisualization;
