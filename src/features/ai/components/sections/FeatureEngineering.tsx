import React, { useState, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { ArrowRight, Trash2, Plus, Lightbulb, AlertTriangle } from 'lucide-react';

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
        Machine learning models only understand numbers. But real-world data includes things like
        &quot;USA&quot;, &quot;Pro subscription&quot;, and &quot;Male&quot;. Feature engineering is
        the art of converting messy, real-world information into clean numbers that machines can
        learn from.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Simple explanation */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">Explain Like I&apos;m 10 🧒</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Imagine you want to teach a calculator to predict which students will pass an exam.
              You can&apos;t type &quot;likes math&quot; or &quot;studies a lot&quot; into a
              calculator — it only understands numbers!
            </p>
            <p className="text-gray-700 leading-relaxed">
              So you need to <strong>convert everything into numbers</strong>. &quot;Likes
              math&quot; becomes <code className="bg-amber-100 px-1 rounded">1</code>,
              &quot;doesn&apos;t like math&quot; becomes{' '}
              <code className="bg-amber-100 px-1 rounded">0</code>. &quot;Studies 3 hours/day&quot;
              stays as <code className="bg-amber-100 px-1 rounded">3</code>. That&apos;s feature
              engineering — <strong>preparing data so machines can understand it</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Why is this needed? */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🤔 Why Can&apos;t Models Use Text Directly?
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          At its core, a machine learning model is just a mathematical formula. It multiplies inputs
          by numbers (weights), adds them up, and produces an output. You can&apos;t multiply
          &quot;Japan&quot; × 0.5 — that doesn&apos;t make mathematical sense!
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">❌ What the model sees</h4>
            <div className="font-mono text-sm text-gray-700 bg-white rounded p-2">
              <div>Country: &quot;USA&quot; → ???</div>
              <div>Plan: &quot;Pro&quot; → ???</div>
              <div className="text-red-500 text-xs mt-1">Can&apos;t do math with text!</div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">✅ After feature engineering</h4>
            <div className="font-mono text-sm text-gray-700 bg-white rounded p-2">
              <div>Country_USA: 1, Country_UK: 0, Country_JP: 0</div>
              <div>Plan_Pro: 1, Plan_Free: 0</div>
              <div className="text-green-500 text-xs mt-1">Now we can multiply and add!</div>
            </div>
          </div>
        </div>
      </ThemeCard>
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
          👨‍🍳 The Analogy: Master Chef&apos;s Kitchen
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine a machine learning model as a world-class master chef, and the raw data as
          groceries delivered straight from a farm. If you hand the chef an unpeeled onion, a live
          chicken, and unwashed wheat stalks, the chef cannot immediately bake a chicken pie.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>Feature engineering</strong> is the meticulous prep work done by sous-chefs before
          any cooking begins: peeling, chopping, measuring, washing, and marinating.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
            <h4 className="font-bold text-rose-800 mb-2 text-sm">One-Hot Encoding</h4>
            <p className="text-sm text-gray-700">
              Like separating a mixed basket of vegetables into clearly labeled containers —
              &quot;Tomatoes here, Peppers here, Onions here.&quot; Each gets its own binary column.
            </p>
          </div>
          <div className="bg-fuchsia-50 rounded-lg p-4 border border-fuchsia-200">
            <h4 className="font-bold text-fuchsia-800 mb-2 text-sm">Feature Creation</h4>
            <p className="text-sm text-gray-700">
              Like creating a new sauce by combining existing ingredients — mixing Debt ÷ Income
              gives you a &quot;financial health score&quot; that&apos;s more informative than
              either alone.
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h4 className="font-bold text-violet-800 mb-2 text-sm">Feature Selection</h4>
            <p className="text-sm text-gray-700">
              Like throwing out the handful of gravel that accidentally got mixed into the delivery
              — irrelevant data that would ruin the meal.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Dimensionality Warning */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-orange-900 mb-2">
              ⚠️ The Dimensionality Explosion Problem
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              One-hot encoding can create a LOT of columns. If &quot;Country&quot; has 200 possible
              values, it creates 200 new columns! A dataset with 50 categorical features, each
              having 100 values, would explode from 50 columns to 5,000 columns.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              This is called the <strong>&quot;curse of dimensionality&quot;</strong> — the more
              columns you have, the more data you need for the model to learn effectively.
              That&apos;s why <strong>feature selection</strong> (removing irrelevant columns) is
              just as important as feature creation.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Selection Methods */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Feature Selection Methods</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Not all features are useful. Some are noisy, redundant, or irrelevant. Selecting the right
          features is like packing for a trip — bring only what you need.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
            <h3 className="font-bold text-rose-800 mb-2">Filter Methods</h3>
            <p className="text-sm text-gray-700 mb-2">
              Evaluate each feature independently using statistics — like checking each
              ingredient&apos;s expiry date before cooking.
            </p>
            <div className="text-[10px] bg-white rounded-lg px-3 py-2 text-gray-600">
              <strong>Cost:</strong> Low — no model training needed
              <br />
              <strong>Example:</strong> Correlation analysis, Chi-squared test
              <br />
              <strong>Best for:</strong> Quick removal of obviously useless features
            </div>
          </div>
          <div className="bg-fuchsia-50 rounded-xl p-4 border border-fuchsia-200">
            <h3 className="font-bold text-fuchsia-800 mb-2">Wrapper Methods</h3>
            <p className="text-sm text-gray-700 mb-2">
              Try every combination of features and pick the best one — like taste-testing every
              possible ingredient combination.
            </p>
            <div className="text-[10px] bg-white rounded-lg px-3 py-2 text-gray-600">
              <strong>Cost:</strong> Very High — trains many models
              <br />
              <strong>Example:</strong> Forward/backward selection
              <br />
              <strong>Best for:</strong> Small datasets where accuracy matters most
            </div>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
            <h3 className="font-bold text-violet-800 mb-2">Embedded Methods</h3>
            <p className="text-sm text-gray-700 mb-2">
              The model itself decides which features matter as it trains — like a chef who
              naturally ignores ingredients that don&apos;t affect taste.
            </p>
            <div className="text-[10px] bg-white rounded-lg px-3 py-2 text-gray-600">
              <strong>Cost:</strong> Medium — done during training
              <br />
              <strong>Example:</strong> Lasso Regression, Random Forests
              <br />
              <strong>Best for:</strong> Most real-world applications
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Key Takeaway */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
        <h3 className="font-bold text-emerald-900 mb-2">🎯 Key Takeaway</h3>
        <p className="text-gray-700 leading-relaxed">
          Feature engineering is often called &quot;the most important part of machine
          learning.&quot; A simple model with great features will outperform a complex model with
          bad features. Data scientists spend about <strong>80% of their time</strong> on data
          preparation and feature engineering — only 20% on actual model training!
        </p>
      </div>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default FeatureEngineering;
