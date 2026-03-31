import React, { useState, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { ArrowRight, Trash2, Plus } from 'lucide-react';

interface RawColumn {
  name: string;
  values: string[];
  type: 'categorical' | 'numeric';
}

const RAW_DATA: RawColumn[] = [
  { name: 'Country', values: ['USA', 'UK', 'Japan'], type: 'categorical' },
  { name: 'Subscription', values: ['Free', 'Pro', 'Enterprise'], type: 'categorical' },
  { name: 'Income', values: ['$85,000', '$62,000', '$91,000'], type: 'numeric' },
  { name: 'Debt', values: ['$12,000', '$35,000', '$8,000'], type: 'numeric' },
];

const ENCODED_COUNTRY = [
  { name: 'Country_USA', values: [1, 0, 0] },
  { name: 'Country_UK', values: [0, 1, 0] },
  { name: 'Country_Japan', values: [0, 0, 1] },
];

const ENCODED_SUB = [
  { name: 'Sub_Free', values: [1, 0, 0] },
  { name: 'Sub_Pro', values: [0, 1, 0] },
  { name: 'Sub_Enterprise', values: [0, 0, 1] },
];

const FeatureEngineering: React.FC = () => {
  const [processedFeatures, setProcessedFeatures] = useState<string[]>([]);
  const [debtRatioCreated, setDebtRatioCreated] = useState(false);

  const handleEncode = useCallback(
    (columnName: string) => {
      if (!processedFeatures.includes(columnName)) {
        setProcessedFeatures((prev) => [...prev, columnName]);
      }
    },
    [processedFeatures]
  );

  const handleCreateRatio = useCallback(() => {
    setDebtRatioCreated(true);
    if (!processedFeatures.includes('DebtRatio')) {
      setProcessedFeatures((prev) => [...prev, 'DebtRatio']);
    }
  }, [processedFeatures]);

  const handleReset = useCallback(() => {
    setProcessedFeatures([]);
    setDebtRatioCreated(false);
  }, []);

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Feature Engineering</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        The art and science of transforming raw data into meaningful numerical features. ML
        algorithms only understand numbers — feature engineering bridges the gap.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Interactive Feature Factory */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Interactive Feature Factory</h2>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Reset
          </button>
        </div>
        <p className="text-gray-600 mb-6 text-sm">
          Click on categorical columns to one-hot encode them, or combine numeric features to
          engineer new ones.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Raw Data Panel */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
              Raw Data
            </h3>
            <div className="space-y-3">
              {RAW_DATA.map((col) => (
                <button
                  key={col.name}
                  onClick={() => (col.type === 'categorical' ? handleEncode(col.name) : undefined)}
                  disabled={processedFeatures.includes(col.name)}
                  className={`w-full text-left rounded-lg p-3 border-2 transition-all duration-300 ${
                    processedFeatures.includes(col.name)
                      ? 'border-green-300 bg-green-50 opacity-60'
                      : col.type === 'categorical'
                        ? 'border-rose-200 bg-white hover:border-rose-400 hover:shadow-md cursor-pointer'
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-800">{col.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        col.type === 'categorical'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {col.type}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {col.values.map((v, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                  {processedFeatures.includes(col.name) && (
                    <div className="mt-1 text-[10px] text-green-600 font-medium">✓ Encoded</div>
                  )}
                </button>
              ))}

              {/* Debt Ratio button */}
              {!debtRatioCreated && (
                <button
                  onClick={handleCreateRatio}
                  className="w-full text-left rounded-lg p-3 border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 hover:border-fuchsia-400 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-fuchsia-600" />
                    <span className="font-semibold text-sm text-fuchsia-800">
                      Create Debt/Income Ratio
                    </span>
                  </div>
                  <p className="text-[10px] text-fuchsia-600 mt-1">
                    Combine Debt ÷ Income → new feature
                  </p>
                </button>
              )}
            </div>
          </div>

          {/* Processing Zone */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gradient-to-b from-rose-50 to-fuchsia-50 rounded-xl p-6 border border-rose-200 w-full">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide text-center">
                Processing Zone
              </h3>
              {processedFeatures.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <ArrowRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Click a categorical column to encode it</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {processedFeatures.includes('Country') && (
                    <div className="bg-white rounded-lg p-3 border border-rose-200 transition-all duration-500 animate-fadeIn">
                      <div className="text-[10px] font-bold text-rose-600 mb-2 uppercase">
                        One-Hot Encoding: Country
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Country → Country_USA, Country_UK, Country_Japan
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {ENCODED_COUNTRY.map((col) => (
                          <div key={col.name} className="text-center">
                            <div className="text-[9px] font-medium text-gray-500 truncate">
                              {col.name}
                            </div>
                            {col.values.map((v, i) => (
                              <div
                                key={i}
                                className={`text-xs font-mono ${v === 1 ? 'text-green-600 font-bold' : 'text-gray-400'}`}
                              >
                                {v}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {processedFeatures.includes('Subscription') && (
                    <div className="bg-white rounded-lg p-3 border border-fuchsia-200 transition-all duration-500 animate-fadeIn">
                      <div className="text-[10px] font-bold text-fuchsia-600 mb-2 uppercase">
                        One-Hot Encoding: Subscription
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {ENCODED_SUB.map((col) => (
                          <div key={col.name} className="text-center">
                            <div className="text-[9px] font-medium text-gray-500 truncate">
                              {col.name}
                            </div>
                            {col.values.map((v, i) => (
                              <div
                                key={i}
                                className={`text-xs font-mono ${v === 1 ? 'text-green-600 font-bold' : 'text-gray-400'}`}
                              >
                                {v}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {debtRatioCreated && (
                    <div className="bg-white rounded-lg p-3 border border-violet-200 transition-all duration-500 animate-fadeIn">
                      <div className="text-[10px] font-bold text-violet-600 mb-2 uppercase">
                        Engineered Feature
                      </div>
                      <div className="text-xs text-gray-600 mb-1">Debt ÷ Income = Debt Ratio</div>
                      <div className="space-y-1">
                        {['0.141', '0.565', '0.088'].map((v, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Row {i + 1}:</span>
                            <span className="text-xs font-mono text-violet-700 font-bold">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Output Vector Panel */}
          <div className="bg-gradient-to-b from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
              Output Feature Vector
            </h3>
            {processedFeatures.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-sm">No features processed yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {processedFeatures.includes('Country') &&
                  ENCODED_COUNTRY.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200"
                    >
                      <span className="text-[10px] font-medium text-green-700 w-20 truncate">
                        {col.name}
                      </span>
                      <div className="flex gap-1">
                        {col.values.map((v, i) => (
                          <span
                            key={i}
                            className={`text-xs font-mono px-1.5 py-0.5 rounded ${v === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'}`}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                {processedFeatures.includes('Subscription') &&
                  ENCODED_SUB.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200"
                    >
                      <span className="text-[10px] font-medium text-green-700 w-20 truncate">
                        {col.name}
                      </span>
                      <div className="flex gap-1">
                        {col.values.map((v, i) => (
                          <span
                            key={i}
                            className={`text-xs font-mono px-1.5 py-0.5 rounded ${v === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'}`}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                {debtRatioCreated && (
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-violet-200">
                    <span className="text-[10px] font-medium text-violet-700 w-20">Debt Ratio</span>
                    <div className="flex gap-1">
                      {['0.14', '0.57', '0.09'].map((v, i) => (
                        <span
                          key={i}
                          className="text-xs font-mono px-1.5 py-0.5 rounded bg-violet-100 text-violet-700"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 p-2 bg-green-100 rounded-lg text-center">
                  <span className="text-[10px] font-bold text-green-800">
                    {processedFeatures.length} feature group
                    {processedFeatures.length > 1 ? 's' : ''} ready for model input
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </ThemeCard>

      {/* Analogy */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          👨‍🍳 The Analogy: Master Chef's Kitchen
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine a machine learning model as a world-class master chef, and the raw data as
          groceries delivered from a farm. If you hand the chef an unpeeled onion, a live chicken,
          and unwashed wheat stalks, the chef cannot immediately bake a chicken pie.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>Feature engineering</strong> is the meticulous prep work done by sous-chefs before
          cooking: peeling, chopping, measuring, washing, and marinating.{' '}
          <strong>One-hot encoding</strong> is like separating a mixed basket of vegetables into
          clearly labeled Tupperware containers.
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong>Feature selection</strong> is throwing out the handful of gravel that accidentally
          got mixed into the delivery — irrelevant data that would ruin the meal.
        </p>
      </ThemeCard>

      {/* Feature Selection Methods */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Feature Selection Methods</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
            <h3 className="font-bold text-rose-800 mb-2">Filter Methods</h3>
            <p className="text-sm text-gray-700 mb-2">
              Evaluate statistical properties independently of the model.
            </p>
            <div className="text-[10px] bg-white rounded-lg px-3 py-2 text-gray-600">
              <strong>Cost:</strong> Low <br />
              <strong>Use:</strong> Rapid pruning of noisy datasets
            </div>
          </div>
          <div className="bg-fuchsia-50 rounded-xl p-4 border border-fuchsia-200">
            <h3 className="font-bold text-fuchsia-800 mb-2">Wrapper Methods</h3>
            <p className="text-sm text-gray-700 mb-2">
              Train the model iteratively on different feature subsets.
            </p>
            <div className="text-[10px] bg-white rounded-lg px-3 py-2 text-gray-600">
              <strong>Cost:</strong> Very High <br />
              <strong>Use:</strong> Finding optimal feature combinations
            </div>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
            <h3 className="font-bold text-violet-800 mb-2">Embedded Methods</h3>
            <p className="text-sm text-gray-700 mb-2">
              Algorithms select features during training automatically.
            </p>
            <div className="text-[10px] bg-white rounded-lg px-3 py-2 text-gray-600">
              <strong>Cost:</strong> Medium <br />
              <strong>Use:</strong> Lasso Regression, Random Forests
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default FeatureEngineering;
