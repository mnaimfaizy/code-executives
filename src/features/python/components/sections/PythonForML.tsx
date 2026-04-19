import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import PythonCodeBlock from '../shared/PythonCodeBlock';
import NeuralNetwork2D from '../visualizations/2d/NeuralNetwork2D';

const WHY_PYTHON_CODE = `# Why Python Dominates Machine Learning
#
# 1. NumPy — Fast numerical computing (C under the hood)
import numpy as np

# Create arrays (not lists — these are contiguous memory blocks)
a = np.array([1, 2, 3, 4, 5])
b = np.array([10, 20, 30, 40, 50])

# Vectorized operations (no explicit loops needed)
c = a + b           # [11, 22, 33, 44, 55]
d = a * 2           # [ 2,  4,  6,  8, 10]
dot = np.dot(a, b)  # 550  (dot product)

# Matrix operations — foundation of ML
matrix = np.array([[1, 2], [3, 4]])
inverse = np.linalg.inv(matrix)
eigenvalues = np.linalg.eigvals(matrix)

# Broadcasting — operations on different shapes
row = np.array([1, 2, 3])      # shape (3,)
col = np.array([[10], [20]])   # shape (2, 1)
result = row + col  # shape (2, 3) — automatically broadcast
# [[11, 12, 13],
#  [21, 22, 23]]`;

const PANDAS_CODE = `# 2. Pandas — Data Analysis and Manipulation
import pandas as pd

# Create DataFrame (like an Excel spreadsheet)
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie", "Diana"],
    "age": [25, 30, 35, 28],
    "salary": [50000, 60000, 70000, 55000],
    "department": ["Engineering", "Marketing", "Engineering", "Marketing"]
})

# Quick overview
print(df.describe())   # Summary statistics
print(df.info())       # Column types and null counts

# Filtering — boolean indexing
engineers = df[df["department"] == "Engineering"]
high_salary = df[df["salary"] > 55000]

# GroupBy — split-apply-combine
dept_avg = df.groupby("department")["salary"].mean()
# department
# Engineering    60000.0
# Marketing      57500.0

# Method chaining — the Pandas way
result = (
    df
    .query("age >= 28")
    .sort_values("salary", ascending=False)
    .head(3)
)

# Missing data handling
df["bonus"] = [5000, None, 7000, None]
df["bonus"].fillna(df["bonus"].mean(), inplace=True)`;

const SKLEARN_CODE = `# 3. scikit-learn — Machine Learning in Python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Typical ML Pipeline
# Step 1: Prepare data
X = dataset.drop("target", axis=1)  # Features
y = dataset["target"]                # Labels

# Step 2: Split into train/test sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Step 3: Scale features (important for many algorithms)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # fit + transform
X_test_scaled = scaler.transform(X_test)         # only transform!

# Step 4: Train model (the fit/predict pattern)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Step 5: Evaluate
y_pred = model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.2%}")
print(classification_report(y_test, y_pred))

# Step 6: Feature importance
importances = model.feature_importances_
for name, imp in sorted(zip(X.columns, importances), key=lambda x: -x[1]):
    print(f"  {name}: {imp:.3f}")`;

const NEURAL_NET_CODE = `# 4. Neural Networks with PyTorch
import torch
import torch.nn as nn
import torch.optim as optim

# Define a simple neural network
class SimpleNN(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),                          # Activation function
            nn.Dropout(0.2),                    # Regularization
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, output_size),
            nn.Softmax(dim=1)                   # Output probabilities
        )

    def forward(self, x):
        return self.network(x)

# Initialize
model = SimpleNN(input_size=784, hidden_size=128, output_size=10)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
for epoch in range(100):
    # Forward pass
    outputs = model(X_train)
    loss = criterion(outputs, y_train)

    # Backward pass
    optimizer.zero_grad()
    loss.backward()          # Compute gradients
    optimizer.step()         # Update weights

    if epoch % 10 == 0:
        print(f"Epoch {epoch}, Loss: {loss.item():.4f}")`;

const codeExamples = [
  { code: WHY_PYTHON_CODE, title: 'numpy_basics.py', highlights: [5, 10, 11, 15, 21, 25] },
  { code: PANDAS_CODE, title: 'pandas_analysis.py', highlights: [4, 15, 19, 22, 28] },
  { code: SKLEARN_CODE, title: 'sklearn_pipeline.py', highlights: [9, 12, 18, 22, 26, 29] },
  { code: NEURAL_NET_CODE, title: 'pytorch_nn.py', highlights: [7, 10, 11, 12, 20, 32, 33] },
];

const PythonForML: React.FC = () => {
  const [activeExample, setActiveExample] = React.useState(0);

  const stats = [
    { label: 'ML Libraries', value: '4', description: 'NumPy, Pandas, scikit-learn, PyTorch' },
    { label: 'Speedup', value: '100x', description: 'NumPy vs pure Python loops' },
    { label: 'ML Models', value: '50+', description: 'scikit-learn built-in estimators' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🤖 Python for Machine Learning</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Discover why Python is the #1 language for AI and Machine Learning. From NumPy arrays to
          neural networks — understand the full ML stack.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="python" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Why Python for ML */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🐍 Why Python for Machine Learning?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            {
              title: 'C-Speed Math',
              icon: '⚡',
              desc: 'NumPy, SciPy run optimized C/Fortran under the hood — vectorized operations are 100x faster than Python loops',
            },
            {
              title: 'Rich Ecosystem',
              icon: '📦',
              desc: 'scikit-learn, TensorFlow, PyTorch, Pandas, Matplotlib — the entire ML pipeline in one language',
            },
            {
              title: 'Simple Syntax',
              icon: '✨',
              desc: 'Focus on the math and algorithms, not boilerplate. Python reads like pseudocode',
            },
            {
              title: 'Community',
              icon: '🌍',
              desc: 'Largest ML community: papers ship with Python code, Jupyter notebooks for research',
            },
          ].map((item) => (
            <div key={item.title} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-gray-800">
                {item.icon} {item.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Neural Network Visualization */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🧠 Neural Network Visualization</h2>
        <p className="text-gray-600 mb-4">
          Step through how a neural network learns: architecture → forward pass → loss →
          backpropagation → training.
        </p>
        <NeuralNetwork2D />
      </ThemeCard>

      {/* Code Examples */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💻 ML Code Examples</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {['NumPy', 'Pandas', 'scikit-learn', 'PyTorch'].map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveExample(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeExample === i
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <PythonCodeBlock
          code={codeExamples[activeExample].code}
          title={codeExamples[activeExample].title}
          highlightLines={codeExamples[activeExample].highlights}
          maxHeight="32rem"
        />
      </ThemeCard>

      {/* ML Pipeline Overview */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔄 The ML Pipeline</h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { step: 'Data Collection', icon: '📊', color: 'blue' },
            { step: 'Preprocessing', icon: '🧹', color: 'indigo' },
            { step: 'Feature Engineering', icon: '🔧', color: 'purple' },
            { step: 'Train/Test Split', icon: '✂️', color: 'violet' },
            { step: 'Model Training', icon: '🏋️', color: 'pink' },
            { step: 'Evaluation', icon: '📈', color: 'rose' },
            { step: 'Deployment', icon: '🚀', color: 'red' },
          ].map((item, i) => (
            <React.Fragment key={item.step}>
              <div
                className={`p-3 bg-${item.color}-50 rounded-lg border border-${item.color}-100 text-center min-w-[100px]`}
              >
                <div className="text-xl">{item.icon}</div>
                <div className="text-xs font-medium text-gray-700 mt-1">{item.step}</div>
              </div>
              {i < 6 && <span className="text-gray-300 text-lg">→</span>}
            </React.Fragment>
          ))}
        </div>
      </ThemeCard>
    </div>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎯 Learning Objectives</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Understand why Python dominates ML</li>
            <li>• Use NumPy for vectorized computation</li>
            <li>• Analyze data with Pandas DataFrames</li>
            <li>• Build ML models with scikit-learn</li>
            <li>• Understand neural network fundamentals</li>
            <li>• Know the full ML pipeline</li>
          </ul>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📚 Key Libraries</h3>
          <div className="space-y-2 text-sm">
            {[
              { name: 'NumPy', desc: 'N-dimensional arrays, linear algebra', color: 'blue' },
              { name: 'Pandas', desc: 'DataFrames, data wrangling', color: 'indigo' },
              { name: 'Matplotlib', desc: 'Static plots and charts', color: 'purple' },
              { name: 'scikit-learn', desc: 'Classical ML algorithms', color: 'pink' },
              { name: 'PyTorch', desc: 'Deep learning framework', color: 'red' },
              { name: 'TensorFlow', desc: 'Production ML platform', color: 'orange' },
            ].map((lib) => (
              <div
                key={lib.name}
                className={`p-2 bg-${lib.color}-50 rounded border border-${lib.color}-100`}
              >
                <span className={`font-semibold text-${lib.color}-800`}>{lib.name}</span>
                <p className={`text-${lib.color}-600 text-xs mt-0.5`}>{lib.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🧮 Key ML Concepts</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="font-medium">Supervised</span>
              <span>Classification, Regression</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Unsupervised</span>
              <span>Clustering, Dimensionality</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Deep Learning</span>
              <span>Neural Networks, CNNs, RNNs</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reinforcement</span>
              <span>Agent-based learning</span>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <SectionLayout
      section="python"
      hero={heroContent}
      mainContent={mainContent}
      sidebar={sidebarContent}
    />
  );
};

export default PythonForML;
