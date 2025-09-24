import {
  Scene,
  Points,
  BufferGeometry,
  PointsMaterial,
  Vector3,
  Color,
  AxesHelper,
  GridHelper,
  BufferAttribute,
} from 'three';
import type { IModel } from '../core/types';
import type { AlgorithmDescription, ComplexityType } from '../../types/bigo';

interface AlgorithmPoint {
  algorithm: AlgorithmDescription;
  position: Vector3;
  color: Color;
}

export interface ComplexityLandscape3DProps {
  algorithms?: AlgorithmDescription[];
  showAxes?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
  onAlgorithmSelect?: (algorithm: AlgorithmDescription) => void;
}

export class ComplexityLandscape3D implements IModel {
  private points?: Points;
  private axesHelper?: AxesHelper;
  private gridHelper?: GridHelper;
  private algorithmPoints: AlgorithmPoint[] = [];
  private props: ComplexityLandscape3DProps;

  constructor(props: ComplexityLandscape3DProps = {}) {
    this.props = {
      algorithms: props.algorithms || this.getDefaultAlgorithms(),
      showAxes: true,
      showGrid: true,
      interactive: false,
      ...props,
    };
  }

  init(scene: Scene): void {
    this.createAlgorithmPoints();
    this.createVisualization();
    this.addHelpers(scene);
  }

  update(dt: number): void {
    // Animate points or add interactive features
    if (this.points) {
      this.points.rotation.y += dt * 0.1; // Slow rotation for visual appeal
    }
  }

  dispose(): void {
    if (this.points) {
      this.points.geometry.dispose();
      if (this.points.material instanceof PointsMaterial) {
        this.points.material.dispose();
      }
    }
  }

  private createAlgorithmPoints(): void {
    const algorithms = this.props.algorithms || this.getDefaultAlgorithms();
    this.algorithmPoints = algorithms.map((algorithm) => {
      const position = this.complexityToPosition(
        algorithm.timeComplexity,
        algorithm.spaceComplexity
      );
      const color = this.getComplexityColor(algorithm.timeComplexity);
      return { algorithm, position, color };
    });
  }

  private createVisualization(): void {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(this.algorithmPoints.length * 3);
    const colors = new Float32Array(this.algorithmPoints.length * 3);

    this.algorithmPoints.forEach((point, index) => {
      positions[index * 3] = point.position.x;
      positions[index * 3 + 1] = point.position.y;
      positions[index * 3 + 2] = point.position.z;

      colors[index * 3] = point.color.r;
      colors[index * 3 + 1] = point.color.g;
      colors[index * 3 + 2] = point.color.b;
    });

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    this.points = new Points(geometry, material);
  }

  private addHelpers(scene: Scene): void {
    if (this.props.showAxes!) {
      this.axesHelper = new AxesHelper(5);
      scene.add(this.axesHelper);
    }

    if (this.props.showGrid!) {
      this.gridHelper = new GridHelper(10, 10);
      this.gridHelper.rotation.x = Math.PI / 2; // Rotate to XY plane
      scene.add(this.gridHelper);
    }

    if (this.points) {
      scene.add(this.points);
    }
  }

  private complexityToPosition(
    timeComplexity: ComplexityType,
    spaceComplexity: ComplexityType
  ): Vector3 {
    // Map complexity to 3D coordinates
    // X: Time complexity (logarithmic scale)
    // Y: Space complexity (logarithmic scale)
    // Z: Some derived metric (e.g., efficiency score)

    const timeValue = this.complexityToNumber(timeComplexity);
    const spaceValue = this.complexityToNumber(spaceComplexity);

    // Use logarithmic scaling for better visualization
    const x = Math.log(timeValue + 1) * 2 - 3; // Spread from -3 to 3
    const y = Math.log(spaceValue + 1) * 2 - 3;
    const z = -(timeValue + spaceValue) * 0.1; // Negative Z for depth

    return new Vector3(x, y, z);
  }

  private complexityToNumber(complexity: ComplexityType): number {
    switch (complexity) {
      case 'O(1)':
        return 1;
      case 'O(log n)':
        return 2;
      case 'O(n)':
        return 10;
      case 'O(n log n)':
        return 20;
      case 'O(n²)':
        return 100;
      case 'O(n³)':
        return 1000;
      case 'O(2^n)':
        return 10000;
      case 'O(n!)':
        return 100000;
      default:
        return 1;
    }
  }

  private getComplexityColor(complexity: ComplexityType): Color {
    switch (complexity) {
      case 'O(1)':
        return new Color(0x3b82f6); // Blue
      case 'O(log n)':
        return new Color(0x10b981); // Green
      case 'O(n)':
        return new Color(0xf59e0b); // Orange
      case 'O(n log n)':
        return new Color(0x8b5cf6); // Purple
      case 'O(n²)':
        return new Color(0xef4444); // Red
      case 'O(n³)':
        return new Color(0xdc2626); // Dark Red
      case 'O(2^n)':
        return new Color(0x7f1d1d); // Very Dark Red
      case 'O(n!)':
        return new Color(0x000000); // Black
      default:
        return new Color(0x6b7280);
    }
  }

  private getDefaultAlgorithms(): AlgorithmDescription[] {
    return [
      {
        name: 'Hash Table Lookup',
        description: 'Constant time key-value access',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(n)',
        category: 'data-structure',
      },
      {
        name: 'Binary Search',
        description: 'Divide and conquer search in sorted array',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        category: 'search',
      },
      {
        name: 'Linear Search',
        description: 'Sequential search through unsorted array',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        category: 'search',
      },
      {
        name: 'Merge Sort',
        description: 'Efficient divide and conquer sorting',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        category: 'sort',
      },
      {
        name: 'Bubble Sort',
        description: 'Simple sorting with nested comparisons',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        category: 'sort',
      },
      {
        name: 'Matrix Multiplication',
        description: 'Naive matrix multiplication algorithm',
        timeComplexity: 'O(n³)',
        spaceComplexity: 'O(n²)',
        category: 'mathematical',
      },
      {
        name: 'Subset Generation',
        description: 'Generate all possible subsets',
        timeComplexity: 'O(2^n)',
        spaceComplexity: 'O(2^n)',
        category: 'combinatorial',
      },
      {
        name: 'Traveling Salesman',
        description: 'Brute force solution to TSP',
        timeComplexity: 'O(n!)',
        spaceComplexity: 'O(n)',
        category: 'optimization',
      },
    ];
  }
}
