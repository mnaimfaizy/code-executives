import React, { useState, useCallback, useEffect } from 'react';
import { Plus, RotateCcw, Search, Palette, Trash2 } from 'lucide-react';
import type { TreeNode, BaseVisualizationProps } from '../../../../../../types/datastructures';

interface RBNode extends TreeNode {
  color: 'red' | 'black';
  isNIL?: boolean;
}

interface RBVisualizationProps extends BaseVisualizationProps {
  maxNodes?: number;
}

interface TreePosition {
  x: number;
  y: number;
}

type AnimationState =
  | 'idle'
  | 'inserting'
  | 'rotating-left'
  | 'rotating-right'
  | 'recoloring'
  | 'deleting'
  | 'searching'
  | 'fixing-violations';

const RedBlackTreeVisualization: React.FC<RBVisualizationProps> = ({
  maxNodes = 15,
  className = '',
  onOperationComplete,
}) => {
  const [nodes, setNodes] = useState<Map<string, RBNode>>(new Map());
  const [rootId, setRootId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, TreePosition>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [violationNodes, setViolationNodes] = useState<string[]>([]);
  const [isOperating, setIsOperating] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [rotatingNodes, setRotatingNodes] = useState<Set<string>>(new Set());
  const [recoloringNodes, setRecoloringNodes] = useState<Set<string>>(new Set());

  // Constants for layout - Increased for better visibility and consistency with Heap
  const SVG_WIDTH = 1200;
  const SVG_HEIGHT = 700; // Increased from 600 to accommodate trees up to height 7
  const NODE_RADIUS = 28;
  const LEVEL_HEIGHT = 90;

  // Red-Black Tree Properties Check
  const checkRBProperties = useCallback(
    (nodeMap: Map<string, RBNode>, rootNodeId: string | null): string[] => {
      const violations: string[] = [];
      if (!rootNodeId) return violations;

      // Property 1: Root is black
      const rootNode = nodeMap.get(rootNodeId);
      if (rootNode?.color !== 'black') {
        violations.push(rootNodeId);
      }

      // Property 4: Red nodes have black children
      const checkRedNodeProperty = (nodeId: string) => {
        const node = nodeMap.get(nodeId);
        if (!node) return;

        if (node.color === 'red') {
          if (node.left) {
            const leftChild = nodeMap.get(node.left);
            if (leftChild?.color === 'red') {
              violations.push(nodeId);
            }
          }
          if (node.right) {
            const rightChild = nodeMap.get(node.right);
            if (rightChild?.color === 'red') {
              violations.push(nodeId);
            }
          }
        }

        if (node.left) checkRedNodeProperty(node.left);
        if (node.right) checkRedNodeProperty(node.right);
      };

      checkRedNodeProperty(rootNodeId);
      return violations;
    },
    []
  );

  // Left rotation
  const rotateLeft = useCallback(
    (nodeMap: Map<string, RBNode>, xId: string): [Map<string, RBNode>, string, Set<string>] => {
      const x = nodeMap.get(xId)!;
      const yId = x.right!;
      const y = nodeMap.get(yId)!;

      // Track rotating nodes for visual highlighting
      const rotatingNodesSet = new Set([xId, yId]);

      // Perform rotation
      x.right = y.left;
      y.left = xId;

      // Update parent references
      if (x.right) {
        const rightChild = nodeMap.get(x.right)!;
        rightChild.parent = xId;
      }
      y.parent = x.parent;
      x.parent = yId;

      // Update levels
      x.level = y.level + 1;
      const updateLevels = (nodeId: string, level: number) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          node.level = level;
          if (node.left) updateLevels(node.left, level + 1);
          if (node.right) updateLevels(node.right, level + 1);
        }
      };
      updateLevels(xId, y.level + 1);

      return [nodeMap, yId, rotatingNodesSet];
    },
    []
  );

  // Right rotation
  const rotateRight = useCallback(
    (nodeMap: Map<string, RBNode>, yId: string): [Map<string, RBNode>, string, Set<string>] => {
      const y = nodeMap.get(yId)!;
      const xId = y.left!;
      const x = nodeMap.get(xId)!;

      // Track rotating nodes for visual highlighting
      const rotatingNodesSet = new Set([xId, yId]);

      // Perform rotation
      y.left = x.right;
      x.right = yId;

      // Update parent references
      if (y.left) {
        const leftChild = nodeMap.get(y.left)!;
        leftChild.parent = yId;
      }
      x.parent = y.parent;
      y.parent = xId;

      // Update levels
      y.level = x.level + 1;
      const updateLevels = (nodeId: string, level: number) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          node.level = level;
          if (node.left) updateLevels(node.left, level + 1);
          if (node.right) updateLevels(node.right, level + 1);
        }
      };
      updateLevels(yId, x.level + 1);

      return [nodeMap, xId, rotatingNodesSet];
    },
    []
  );

  // Red-Black Tree insertion with fixup
  const insertRB = useCallback(
    (
      nodeMap: Map<string, RBNode>,
      rootNodeId: string | null,
      value: number
    ): [Map<string, RBNode>, string] => {
      // Create new node
      const newNodeId = `rb-${value}-${Date.now()}`;
      const newNode: RBNode = {
        id: newNodeId,
        value,
        level: 0,
        color: 'red', // New nodes are always red
        isRoot: rootNodeId === null,
      };

      if (rootNodeId === null) {
        newNode.color = 'black'; // Root is always black
        nodeMap.set(newNodeId, newNode);
        return [nodeMap, newNodeId];
      }

      // Standard BST insertion
      let currentId: string | null = rootNodeId;
      let parentId: string | null = null;

      while (currentId) {
        const current: RBNode = nodeMap.get(currentId)!;
        parentId = currentId;

        if (value < (current.value as number)) {
          currentId = current.left || null;
        } else if (value > (current.value as number)) {
          currentId = current.right || null;
        } else {
          // Value already exists
          return [nodeMap, rootNodeId];
        }
      }

      // Insert the new node
      const parent = nodeMap.get(parentId!)!;
      newNode.parent = parentId || undefined;
      newNode.level = parent.level + 1;

      if (value < (parent.value as number)) {
        parent.left = newNodeId;
      } else {
        parent.right = newNodeId;
      }

      nodeMap.set(newNodeId, newNode);

      // Fix Red-Black Tree properties
      let currentRoot = rootNodeId;
      let current = newNodeId;

      while (current !== currentRoot) {
        const node = nodeMap.get(current)!;
        const parentNode = node.parent ? nodeMap.get(node.parent) : null;

        if (!parentNode || parentNode.color === 'black') {
          break;
        }

        const grandparentId = parentNode.parent;
        if (!grandparentId) {
          parentNode.color = 'black';
          break;
        }

        const grandparent = nodeMap.get(grandparentId)!;

        if (parentNode.id === grandparent.left) {
          // Parent is left child of grandparent
          const uncleId = grandparent.right;
          const uncle = uncleId ? nodeMap.get(uncleId) : null;

          if (uncle && uncle.color === 'red') {
            // Case 1: Uncle is red - recolor parent, uncle, and grandparent
            const recoloringSet = new Set([parentNode.id, uncle.id, grandparentId]);
            setRecoloringNodes(recoloringSet);

            parentNode.color = 'black';
            uncle.color = 'black';
            grandparent.color = 'red';
            current = grandparentId;
          } else {
            // Case 2 & 3: Uncle is black
            if (current === parentNode.right) {
              // Case 2: Node is right child
              current = parentNode.id;
              const [newMap, , rotatingNodesSet] = rotateLeft(nodeMap, current);
              nodeMap = newMap;
              setRotatingNodes(rotatingNodesSet);
              const updatedNode = nodeMap.get(current)!;
              const updatedParent = updatedNode.parent ? nodeMap.get(updatedNode.parent) : null;
              if (updatedParent) {
                current = updatedParent.id;
              }
            }

            // Case 3: Node is left child
            const currentNode = nodeMap.get(current)!;
            const currentParent = currentNode.parent ? nodeMap.get(currentNode.parent) : null;
            const currentGrandparent = currentParent?.parent
              ? nodeMap.get(currentParent.parent)
              : null;

            if (currentParent && currentGrandparent) {
              currentParent.color = 'black';
              currentGrandparent.color = 'red';

              const [newMap, newRoot, rotatingNodesSet] = rotateRight(
                nodeMap,
                currentGrandparent.id
              );
              nodeMap = newMap;
              setRotatingNodes(rotatingNodesSet);

              if (currentGrandparent.id === currentRoot) {
                currentRoot = newRoot;
              }
            }
            break;
          }
        } else {
          // Parent is right child of grandparent (symmetric cases)
          const uncleId = grandparent.left;
          const uncle = uncleId ? nodeMap.get(uncleId) : null;

          if (uncle && uncle.color === 'red') {
            // Case 1: Uncle is red - recolor parent, uncle, and grandparent
            const recoloringSet = new Set([parentNode.id, uncle.id, grandparentId]);
            setRecoloringNodes(recoloringSet);

            parentNode.color = 'black';
            uncle.color = 'black';
            grandparent.color = 'red';
            current = grandparentId;
          } else {
            // Case 2 & 3: Uncle is black
            if (current === parentNode.left) {
              // Case 2: Node is left child
              current = parentNode.id;
              const [newMap, , rotatingNodesSet] = rotateRight(nodeMap, current);
              nodeMap = newMap;
              setRotatingNodes(rotatingNodesSet);
              const updatedNode = nodeMap.get(current)!;
              const updatedParent = updatedNode.parent ? nodeMap.get(updatedNode.parent) : null;
              if (updatedParent) {
                current = updatedParent.id;
              }
            }

            // Case 3: Node is right child
            const currentNode = nodeMap.get(current)!;
            const currentParent = currentNode.parent ? nodeMap.get(currentNode.parent) : null;
            const currentGrandparent = currentParent?.parent
              ? nodeMap.get(currentParent.parent)
              : null;

            if (currentParent && currentGrandparent) {
              currentParent.color = 'black';
              currentGrandparent.color = 'red';

              const [newMap, newRoot, rotatingNodesSet] = rotateLeft(
                nodeMap,
                currentGrandparent.id
              );
              nodeMap = newMap;
              setRotatingNodes(rotatingNodesSet);

              if (currentGrandparent.id === currentRoot) {
                currentRoot = newRoot;
              }
            }
            break;
          }
        }
      }

      // Ensure root is black
      const finalRoot = nodeMap.get(currentRoot)!;
      finalRoot.color = 'black';

      return [nodeMap, currentRoot];
    },
    [rotateLeft, rotateRight, setRotatingNodes, setRecoloringNodes]
  );

  // Helper: Find minimum node in subtree
  const findMinimum = useCallback((nodeMap: Map<string, RBNode>, nodeId: string): string => {
    let current = nodeId;
    while (true) {
      const node = nodeMap.get(current);
      if (!node || !node.left) break;
      current = node.left;
    }
    return current;
  }, []);

  // Helper: Transplant node
  const transplant = useCallback(
    (nodeMap: Map<string, RBNode>, rootNodeId: string, uId: string, vId: string | null): string => {
      const u = nodeMap.get(uId)!;
      let newRoot = rootNodeId;

      if (!u.parent) {
        // u is root
        newRoot = vId!;
      } else {
        const parent = nodeMap.get(u.parent)!;
        if (uId === parent.left) {
          parent.left = vId || undefined;
        } else {
          parent.right = vId || undefined;
        }
      }

      if (vId) {
        const v = nodeMap.get(vId)!;
        v.parent = u.parent;
      }

      return newRoot;
    },
    []
  );

  // Deletion fixup to restore Red-Black properties
  const deleteFixup = useCallback(
    (
      nodeMap: Map<string, RBNode>,
      rootNodeId: string,
      xId: string | null
    ): [Map<string, RBNode>, string] => {
      let currentRoot = rootNodeId;
      let x = xId;

      while (x !== currentRoot && x) {
        const xNode = nodeMap.get(x);
        if (!xNode || xNode.color === 'red') break;

        const xParentId = xNode.parent;
        if (!xParentId) break;

        const xParent = nodeMap.get(xParentId)!;

        if (x === xParent.left) {
          // Left child cases
          let siblingId = xParent.right;
          if (!siblingId) break;

          let sibling = nodeMap.get(siblingId)!;

          // Case 1: Sibling is red
          if (sibling.color === 'red') {
            sibling.color = 'black';
            xParent.color = 'red';
            const [newMap, newSubRoot, rotatingNodesSet] = rotateLeft(nodeMap, xParentId);
            nodeMap = newMap;
            setRotatingNodes(rotatingNodesSet);
            if (xParentId === currentRoot) {
              currentRoot = newSubRoot;
            }
            siblingId = xParent.right!;
            sibling = nodeMap.get(siblingId)!;
          }

          const siblingLeft = sibling.left ? nodeMap.get(sibling.left) : null;
          const siblingRight = sibling.right ? nodeMap.get(sibling.right) : null;

          // Case 2: Sibling is black with two black children
          if (
            (!siblingLeft || siblingLeft.color === 'black') &&
            (!siblingRight || siblingRight.color === 'black')
          ) {
            sibling.color = 'red';
            x = xParentId;
          } else {
            // Case 3: Sibling is black, left child is red, right child is black
            if (!siblingRight || siblingRight.color === 'black') {
              if (siblingLeft) {
                siblingLeft.color = 'black';
              }
              sibling.color = 'red';
              const [newMap, newSubRoot, rotatingNodesSet] = rotateRight(nodeMap, siblingId);
              nodeMap = newMap;
              setRotatingNodes(rotatingNodesSet);
              if (siblingId === currentRoot) {
                currentRoot = newSubRoot;
              }
              siblingId = xParent.right!;
              sibling = nodeMap.get(siblingId)!;
            }

            // Case 4: Sibling is black with red right child
            sibling.color = xParent.color;
            xParent.color = 'black';
            const siblingRightNode = sibling.right ? nodeMap.get(sibling.right) : null;
            if (siblingRightNode) {
              siblingRightNode.color = 'black';
            }
            const [newMap, newSubRoot, rotatingNodesSet] = rotateLeft(nodeMap, xParentId);
            nodeMap = newMap;
            setRotatingNodes(rotatingNodesSet);
            if (xParentId === currentRoot) {
              currentRoot = newSubRoot;
            }
            x = currentRoot;
          }
        } else {
          // Right child cases (symmetric)
          let siblingId = xParent.left;
          if (!siblingId) break;

          let sibling = nodeMap.get(siblingId)!;

          // Case 1: Sibling is red
          if (sibling.color === 'red') {
            sibling.color = 'black';
            xParent.color = 'red';
            const [newMap, newSubRoot, rotatingNodesSet] = rotateRight(nodeMap, xParentId);
            nodeMap = newMap;
            setRotatingNodes(rotatingNodesSet);
            if (xParentId === currentRoot) {
              currentRoot = newSubRoot;
            }
            siblingId = xParent.left!;
            sibling = nodeMap.get(siblingId)!;
          }

          const siblingLeft = sibling.left ? nodeMap.get(sibling.left) : null;
          const siblingRight = sibling.right ? nodeMap.get(sibling.right) : null;

          // Case 2: Sibling is black with two black children
          if (
            (!siblingLeft || siblingLeft.color === 'black') &&
            (!siblingRight || siblingRight.color === 'black')
          ) {
            sibling.color = 'red';
            x = xParentId;
          } else {
            // Case 3: Sibling is black, right child is red, left child is black
            if (!siblingLeft || siblingLeft.color === 'black') {
              if (siblingRight) {
                siblingRight.color = 'black';
              }
              sibling.color = 'red';
              const [newMap, newSubRoot, rotatingNodesSet] = rotateLeft(nodeMap, siblingId);
              nodeMap = newMap;
              setRotatingNodes(rotatingNodesSet);
              if (siblingId === currentRoot) {
                currentRoot = newSubRoot;
              }
              siblingId = xParent.left!;
              sibling = nodeMap.get(siblingId)!;
            }

            // Case 4: Sibling is black with red left child
            sibling.color = xParent.color;
            xParent.color = 'black';
            const siblingLeftNode = sibling.left ? nodeMap.get(sibling.left) : null;
            if (siblingLeftNode) {
              siblingLeftNode.color = 'black';
            }
            const [newMap, newSubRoot, rotatingNodesSet] = rotateRight(nodeMap, xParentId);
            nodeMap = newMap;
            setRotatingNodes(rotatingNodesSet);
            if (xParentId === currentRoot) {
              currentRoot = newSubRoot;
            }
            x = currentRoot;
          }
        }
      }

      // Ensure x is black
      if (x) {
        const xNode = nodeMap.get(x);
        if (xNode) {
          xNode.color = 'black';
        }
      }

      return [nodeMap, currentRoot];
    },
    [rotateLeft, rotateRight, setRotatingNodes]
  );

  // Red-Black Tree deletion
  const deleteRB = useCallback(
    (
      nodeMap: Map<string, RBNode>,
      rootNodeId: string | null,
      value: number
    ): [Map<string, RBNode>, string | null] => {
      if (!rootNodeId) return [nodeMap, null];

      // Find node to delete
      let zId: string | null = null;
      let currentId: string | null = rootNodeId;

      while (currentId) {
        const current: RBNode = nodeMap.get(currentId)!;
        if (current.value === value) {
          zId = currentId;
          break;
        } else if (value < (current.value as number)) {
          currentId = current.left || null;
        } else {
          currentId = current.right || null;
        }
      }

      if (!zId) return [nodeMap, rootNodeId]; // Node not found

      const z = nodeMap.get(zId)!;
      let yOriginalColor = z.color;
      let xId: string | null;
      let newRoot = rootNodeId;

      if (!z.left) {
        // Case 1: No left child
        xId = z.right || null;
        newRoot = transplant(nodeMap, rootNodeId, zId, z.right || null);
      } else if (!z.right) {
        // Case 2: No right child
        xId = z.left;
        newRoot = transplant(nodeMap, rootNodeId, zId, z.left);
      } else {
        // Case 3: Two children - find successor
        const yId = findMinimum(nodeMap, z.right);
        const y = nodeMap.get(yId)!;
        yOriginalColor = y.color;
        xId = y.right || null;

        if (y.parent === zId) {
          // Successor is direct child
          if (xId) {
            const x = nodeMap.get(xId)!;
            x.parent = yId;
          }
        } else {
          // Successor is not direct child
          newRoot = transplant(nodeMap, newRoot, yId, y.right || null);
          y.right = z.right;
          const zRight = nodeMap.get(z.right)!;
          zRight.parent = yId;
        }

        newRoot = transplant(nodeMap, newRoot, zId, yId);
        y.left = z.left;
        const zLeft = nodeMap.get(z.left)!;
        zLeft.parent = yId;
        y.color = z.color;

        // Update levels
        y.level = z.level;
        const updateLevels = (nodeId: string, level: number) => {
          const node = nodeMap.get(nodeId);
          if (node) {
            node.level = level;
            if (node.left) updateLevels(node.left, level + 1);
            if (node.right) updateLevels(node.right, level + 1);
          }
        };
        if (y.left) updateLevels(y.left, y.level + 1);
        if (y.right) updateLevels(y.right, y.level + 1);
      }

      // Remove node from map
      nodeMap.delete(zId);

      // Fix violations if deleted node was black
      if (yOriginalColor === 'black' && xId) {
        [nodeMap, newRoot] = deleteFixup(nodeMap, newRoot, xId);
      }

      // Ensure root is black
      if (newRoot) {
        const root = nodeMap.get(newRoot);
        if (root) {
          root.color = 'black';
          root.isRoot = true;
        }
      }

      return [nodeMap, newRoot];
    },
    [transplant, findMinimum, deleteFixup]
  );

  // Calculate positions for all nodes
  const calculatePositions = useCallback(
    (rootNodeId: string | null) => {
      if (!rootNodeId || !nodes.has(rootNodeId)) return new Map();

      const positions = new Map<string, TreePosition>();

      // In-order traversal for x-positioning
      const inOrderTraversal: string[] = [];
      const traverse = (nodeId: string) => {
        const node = nodes.get(nodeId);
        if (!node) return;

        if (node.left) traverse(node.left);
        inOrderTraversal.push(nodeId);
        if (node.right) traverse(node.right);
      };

      traverse(rootNodeId);

      // Assign positions
      const xSpacing = SVG_WIDTH / (inOrderTraversal.length + 1);
      inOrderTraversal.forEach((nodeId, index) => {
        const node = nodes.get(nodeId);
        if (node) {
          const x = (index + 1) * xSpacing;
          const y = 60 + node.level * LEVEL_HEIGHT;
          positions.set(nodeId, { x, y });
        }
      });

      return positions;
    },
    [nodes, SVG_WIDTH, LEVEL_HEIGHT]
  );

  // Update positions when nodes change
  useEffect(() => {
    const newPositions = calculatePositions(rootId);
    setNodePositions(newPositions);

    // Check for violations
    const violations = checkRBProperties(nodes, rootId);
    setViolationNodes(violations);
  }, [nodes, rootId, calculatePositions, checkRBProperties]);

  // Handle insertion
  const handleInsert = useCallback(() => {
    if (!inputValue.trim() || isOperating) return;

    const numValue = parseInt(inputValue);
    if (isNaN(numValue)) return;

    setIsOperating(true);
    setAnimationState('inserting');
    setStatusMessage(`Inserting node ${numValue}...`);

    setTimeout(() => {
      const [newNodes, newRootId] = insertRB(new Map(nodes), rootId, numValue);
      setNodes(newNodes);
      setRootId(newRootId);
      setInputValue('');

      setAnimationState('idle');
      setStatusMessage('Insertion complete!');

      // Clear rotating and recoloring nodes after a short delay to show final positions
      setTimeout(() => {
        setRotatingNodes(new Set());
        setRecoloringNodes(new Set());
      }, 400);

      setTimeout(() => {
        setIsOperating(false);
        setStatusMessage('');
      }, 800);
    }, 500);

    onOperationComplete?.({
      type: 'insert',
      target: numValue,
      description: `Inserted ${numValue} into Red-Black tree with property preservation`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });
  }, [inputValue, nodes, rootId, insertRB, isOperating, onOperationComplete]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!deleteValue.trim() || !rootId || isOperating) return;

    const numValue = parseInt(deleteValue);
    if (isNaN(numValue)) return;

    setIsOperating(true);
    setAnimationState('deleting');
    setStatusMessage(`Deleting node ${numValue}...`);

    setTimeout(() => {
      const [newNodes, newRootId] = deleteRB(new Map(nodes), rootId, numValue);
      setNodes(newNodes);
      setRootId(newRootId);
      setDeleteValue('');

      setAnimationState('idle');
      setStatusMessage('Deletion complete!');

      // Clear rotating and recoloring nodes after a short delay to show final positions
      setTimeout(() => {
        setRotatingNodes(new Set());
        setRecoloringNodes(new Set());
      }, 400);

      setTimeout(() => {
        setIsOperating(false);
        setStatusMessage('');
      }, 800);
    }, 700);

    onOperationComplete?.({
      type: 'delete',
      target: numValue,
      description: `Deleted ${numValue} from Red-Black tree with property preservation`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });
  }, [deleteValue, nodes, rootId, deleteRB, isOperating, onOperationComplete]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchValue.trim() || !rootId) return;

    const numValue = parseInt(searchValue);
    if (isNaN(numValue)) return;

    setAnimationState('searching');
    setStatusMessage(`Searching for node ${numValue}...`);

    const path: string[] = [];
    let currentId: string | null = rootId;

    // Animate search
    const searchStep = () => {
      if (!currentId) {
        setSearchPath(path);
        setStatusMessage(`Node ${numValue} not found`);
        setTimeout(() => {
          setSearchPath([]);
          setAnimationState('idle');
          setStatusMessage('');
        }, 2000);
        return;
      }

      const current = nodes.get(currentId)!;
      path.push(currentId);
      setSearchPath([...path]);

      if (current.value === numValue) {
        setStatusMessage(`Found node ${numValue}!`);
        setTimeout(() => {
          setSearchPath([]);
          setAnimationState('idle');
          setStatusMessage('');
        }, 2000);
      } else if (numValue < (current.value as number)) {
        currentId = current.left || null;
        setTimeout(searchStep, 400);
      } else {
        currentId = current.right || null;
        setTimeout(searchStep, 400);
      }
    };

    searchStep();
  }, [searchValue, rootId, nodes]);

  // Reset tree
  const handleReset = useCallback(() => {
    setNodes(new Map());
    setRootId(null);
    setNodePositions(new Map());
    setInputValue('');
    setSearchValue('');
    setDeleteValue('');
    setSearchPath([]);
    setViolationNodes([]);
    setIsOperating(false);
    setAnimationState('idle');
    setStatusMessage('');
  }, []);

  // Render edges
  const renderEdges = () => {
    const edges: React.ReactElement[] = [];

    nodes.forEach((node) => {
      const nodePos = nodePositions.get(node.id);
      if (!nodePos) return;

      if (node.left) {
        const leftPos = nodePositions.get(node.left);
        if (leftPos) {
          const leftNode = nodes.get(node.left);
          const isHighlighted = searchPath.includes(node.id) && searchPath.includes(node.left);
          const isAnimating = animationState !== 'idle';

          // Color based on parent and child colors for gradient effect
          const edgeColor = isHighlighted
            ? '#3b82f6'
            : leftNode?.color === 'red'
              ? '#ef4444'
              : '#4b5563';

          edges.push(
            <line
              key={`edge-${node.id}-left`}
              x1={nodePos.x}
              y1={nodePos.y}
              x2={leftPos.x}
              y2={leftPos.y}
              stroke={edgeColor}
              strokeWidth={isHighlighted ? 4 : 3}
              strokeDasharray={isAnimating ? '5,5' : 'none'}
              className="transition-all duration-300 ease-in-out"
              opacity={isHighlighted ? 1 : 0.6}
            />
          );
        }
      }

      if (node.right) {
        const rightPos = nodePositions.get(node.right);
        if (rightPos) {
          const rightNode = nodes.get(node.right);
          const isHighlighted = searchPath.includes(node.id) && searchPath.includes(node.right);
          const isAnimating = animationState !== 'idle';

          // Color based on parent and child colors for gradient effect
          const edgeColor = isHighlighted
            ? '#3b82f6'
            : rightNode?.color === 'red'
              ? '#ef4444'
              : '#4b5563';

          edges.push(
            <line
              key={`edge-${node.id}-right`}
              x1={nodePos.x}
              y1={nodePos.y}
              x2={rightPos.x}
              y2={rightPos.y}
              stroke={edgeColor}
              strokeWidth={isHighlighted ? 4 : 3}
              strokeDasharray={isAnimating ? '5,5' : 'none'}
              className="transition-all duration-300 ease-in-out"
              opacity={isHighlighted ? 1 : 0.6}
            />
          );
        }
      }
    });

    return edges;
  };

  // Render nodes
  const renderNodes = () => {
    return Array.from(nodes.values()).map((node) => {
      const position = nodePositions.get(node.id);
      if (!position) return null;

      const isHighlighted = searchPath.includes(node.id);
      const hasViolation = violationNodes.includes(node.id);
      const isRotating = rotatingNodes.has(node.id);
      const isRecoloring = recoloringNodes.has(node.id);
      const isAnimating = animationState !== 'idle';

      // Determine gradient and filters based on node state (priority: rotating > recoloring > search > violation > normal)
      const gradientFill = isRotating
        ? 'url(#rotatingGradient)'
        : isRecoloring
          ? 'url(#recoloringGradient)'
          : isHighlighted
            ? 'url(#searchGradient)'
            : hasViolation
              ? 'url(#violationGradient)'
              : node.color === 'red'
                ? 'url(#redNodeGradient)'
                : 'url(#blackNodeGradient)';

      const filters = [];
      if (isRotating) {
        filters.push('url(#rotatingGlow)');
      } else if (isRecoloring) {
        filters.push('url(#recoloringGlow)');
      } else if (isAnimating || isHighlighted || hasViolation) {
        filters.push('url(#nodeGlow)');
      }
      filters.push('url(#dropShadow)');

      return (
        <g key={node.id} className="transition-all duration-500">
          {/* Node circle with gradient and filters */}
          <circle
            cx={position.x}
            cy={position.y}
            r={NODE_RADIUS}
            fill={gradientFill}
            stroke={
              isRotating
                ? '#a855f7'
                : isRecoloring
                  ? '#f59e0b'
                  : isHighlighted
                    ? '#1d4ed8'
                    : hasViolation
                      ? '#d97706'
                      : node.color === 'red'
                        ? '#dc2626'
                        : '#111827'
            }
            strokeWidth={isRotating || isRecoloring ? 4 : isHighlighted || hasViolation ? 3 : 2}
            filter={filters.join(' ')}
            className={`cursor-pointer hover:opacity-90 transition-all ${
              isAnimating || isRotating || isRecoloring ? 'animate-pulse' : ''
            }`}
            style={
              isRotating || isRecoloring
                ? {
                    transform: 'scale(1.1)',
                    transformOrigin: `${position.x}px ${position.y}px`,
                    transition: 'all 500ms ease-in-out',
                  }
                : undefined
            }
          />

          {/* Node value */}
          <text
            x={position.x}
            y={position.y + 4}
            textAnchor="middle"
            className={`text-sm font-medium pointer-events-none ${
              node.color === 'red' ? 'fill-white' : 'fill-white'
            }`}
          >
            {node.value}
          </text>

          {/* Color indicator */}
          <circle
            cx={position.x + NODE_RADIUS + 8}
            cy={position.y - NODE_RADIUS + 8}
            r={6}
            fill={node.color === 'red' ? '#ef4444' : '#1f2937'}
            stroke={node.color === 'red' ? '#dc2626' : '#111827'}
            strokeWidth={1}
            className="pointer-events-none"
          />

          {/* Violation indicator */}
          {hasViolation && (
            <text
              x={position.x}
              y={position.y - NODE_RADIUS - 8}
              textAnchor="middle"
              className="text-xs font-bold fill-yellow-600 pointer-events-none"
            >
              ⚠️
            </text>
          )}
        </g>
      );
    });
  };

  // Check if tree follows Red-Black properties
  const isValidRBTree = () => {
    return violationNodes.length === 0;
  };

  return (
    <div className={`rb-tree-visualization ${className}`}>
      {/* Status Message Bar */}
      {statusMessage && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-blue-900">{statusMessage}</span>
            <span className="text-xs text-blue-600 ml-auto">
              {animationState !== 'idle' && `(${animationState})`}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to insert"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
            disabled={isOperating}
          />
          <button
            onClick={handleInsert}
            disabled={nodes.size >= maxNodes || isOperating}
            className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Insert</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to delete"
            value={deleteValue}
            onChange={(e) => setDeleteValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
            disabled={isOperating || nodes.size === 0}
          />
          <button
            onClick={handleDelete}
            disabled={nodes.size === 0 || isOperating}
            className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-md hover:shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Delete</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Search</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">Reset</span>
        </button>
      </div>

      {/* Red-Black Properties */}
      <div className="mb-4 p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-red-700">RB Properties: </span>
            <span
              className={`font-semibold ${isValidRBTree() ? 'text-green-600' : 'text-red-600'}`}
            >
              {isValidRBTree() ? '✓ Valid' : '✗ Violations Found'}
            </span>
            {violationNodes.length > 0 && (
              <span className="ml-2 text-xs text-yellow-600">
                ⚠️ {violationNodes.length} violation(s)
              </span>
            )}
          </div>
          <div className="text-xs text-red-600">
            Root=Black, Red→Black children, Equal black heights
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="relative bg-white rounded-lg border border-gray-200 p-4">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto"
        >
          {/* Gradient Definitions */}
          <defs>
            {/* Red Node Gradient */}
            <radialGradient id="redNodeGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
            </radialGradient>

            {/* Black Node Gradient */}
            <radialGradient id="blackNodeGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#4b5563" stopOpacity="1" />
              <stop offset="50%" stopColor="#1f2937" stopOpacity="1" />
              <stop offset="100%" stopColor="#111827" stopOpacity="1" />
            </radialGradient>

            {/* Search Highlight Gradient */}
            <radialGradient id="searchGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
            </radialGradient>

            {/* Violation Gradient */}
            <radialGradient id="violationGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
            </radialGradient>

            {/* Rotating Node Gradient (Purple-Pink) */}
            <radialGradient id="rotatingGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
            </radialGradient>

            {/* Recoloring Node Gradient (Amber-Yellow) */}
            <radialGradient id="recoloringGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#fcd34d" stopOpacity="1" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
            </radialGradient>

            {/* Glow Filter for Nodes */}
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Rotating Glow Filter (Enhanced for rotations) */}
            <filter id="rotatingGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.8" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Recoloring Glow Filter (For color transitions) */}
            <filter id="recoloringGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.7" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Drop Shadow Filter */}
            <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="2" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {renderEdges()}
          {renderNodes()}
        </svg>

        {nodes.size === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center backdrop-blur-sm bg-white/30 rounded-2xl p-8 border-4 border-gradient-to-r from-red-200 via-purple-200 to-blue-200 shadow-xl">
              <div className="text-6xl mb-4 animate-pulse">🔴⚫</div>
              <p className="text-base font-medium text-gray-700 mb-2">
                Add nodes to build your Red-Black Tree
              </p>
              <p className="text-sm text-gray-500">
                Watch automatic recoloring and rotations maintain balance
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-indigo-600" />
          Node Types & States
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center space-x-3 bg-white rounded-lg p-2 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md"></div>
            <span className="font-medium text-gray-700">Red Node</span>
          </div>
          <div className="flex items-center space-x-3 bg-white rounded-lg p-2 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-md"></div>
            <span className="font-medium text-gray-700">Black Node</span>
          </div>
          <div className="flex items-center space-x-3 bg-white rounded-lg p-2 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md ring-2 ring-blue-300"></div>
            <span className="font-medium text-gray-700">Search Path</span>
          </div>
          <div className="flex items-center space-x-3 bg-white rounded-lg p-2 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-md animate-pulse"></div>
            <span className="font-medium text-gray-700">Violation</span>
          </div>
        </div>
      </div>

      {/* Red-Black Properties Reference */}
      <div className="mt-4 bg-gradient-to-br from-red-50 to-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Red-Black Tree Properties</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
          <div>1. Every node is either red or black</div>
          <div>2. Root is always black</div>
          <div>3. All leaves (NIL) are black</div>
          <div>4. Red nodes have black children</div>
          <div className="md:col-span-2">
            5. All paths from node to leaves have equal black height
          </div>
        </div>
      </div>

      {/* Tree Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-white/20 rounded-full p-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{nodes.size}</div>
          <div className="text-sm text-white/90 font-medium">Total Nodes</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-white/20 rounded-full p-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {Array.from(nodes.values()).filter((n) => n.color === 'red').length}
          </div>
          <div className="text-sm text-white/90 font-medium">Red Nodes</div>
        </div>
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-white/20 rounded-full p-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {Array.from(nodes.values()).filter((n) => n.color === 'black').length}
          </div>
          <div className="text-sm text-white/90 font-medium">Black Nodes</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-white/20 rounded-full p-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {Math.max(...Array.from(nodes.values()).map((n) => n.level), -1) + 1}
          </div>
          <div className="text-sm text-white/90 font-medium">Height</div>
        </div>
      </div>
    </div>
  );
};

export default RedBlackTreeVisualization;
