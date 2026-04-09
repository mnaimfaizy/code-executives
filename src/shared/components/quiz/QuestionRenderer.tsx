import React from 'react';
import type {
  QuizChoiceQuestion,
  QuizMatchingQuestion,
  QuizMultiSelectQuestion,
  QuizOrderingQuestion,
  QuizQuestion,
  QuizStoredAnswer,
} from '../../../types/quiz';

interface QuestionRendererProps {
  question: QuizQuestion;
  answer: QuizStoredAnswer | null;
  colorScheme: string;
  onAnswerChange: (answer: QuizStoredAnswer) => void;
}

const colorStyles: Record<string, { selected: string; badge: string; muted: string }> = {
  indigo: {
    selected: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100',
    badge: 'bg-indigo-100 text-indigo-800',
    muted: 'text-indigo-700',
  },
  purple: {
    selected: 'border-purple-500 bg-purple-50 ring-2 ring-purple-100',
    badge: 'bg-purple-100 text-purple-800',
    muted: 'text-purple-700',
  },
  orange: {
    selected: 'border-orange-500 bg-orange-50 ring-2 ring-orange-100',
    badge: 'bg-orange-100 text-orange-800',
    muted: 'text-orange-700',
  },
  blue: {
    selected: 'border-blue-500 bg-blue-50 ring-2 ring-blue-100',
    badge: 'bg-blue-100 text-blue-800',
    muted: 'text-blue-700',
  },
  emerald: {
    selected: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800',
    muted: 'text-emerald-700',
  },
  rose: {
    selected: 'border-rose-500 bg-rose-50 ring-2 ring-rose-100',
    badge: 'bg-rose-100 text-rose-800',
    muted: 'text-rose-700',
  },
  green: {
    selected: 'border-green-500 bg-green-50 ring-2 ring-green-100',
    badge: 'bg-green-100 text-green-800',
    muted: 'text-green-700',
  },
  sky: {
    selected: 'border-sky-500 bg-sky-50 ring-2 ring-sky-100',
    badge: 'bg-sky-100 text-sky-800',
    muted: 'text-sky-700',
  },
  amber: {
    selected: 'border-amber-500 bg-amber-50 ring-2 ring-amber-100',
    badge: 'bg-amber-100 text-amber-800',
    muted: 'text-amber-700',
  },
};

const getStyles = (colorScheme: string) => colorStyles[colorScheme] ?? colorStyles.blue;

const optionBaseClass =
  'w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-gray-300 hover:bg-gray-50';

const isNumberArray = (value: QuizStoredAnswer | null): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number');

const isStringArray = (value: QuizStoredAnswer | null): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  colorScheme,
  onAnswerChange,
}) => {
  const styles = getStyles(colorScheme);

  const renderChoiceQuestion = (
    choiceQuestion: QuizChoiceQuestion | QuizMultiSelectQuestion,
    multiSelect = false
  ) => {
    const selectedAnswers = isNumberArray(answer) ? answer : [];
    const selectedAnswer = typeof answer === 'number' ? answer : -1;

    return (
      <div className="space-y-3" role={multiSelect ? 'group' : 'radiogroup'}>
        {choiceQuestion.options.map((option: string, index: number) => {
          const isSelected = multiSelect
            ? selectedAnswers.includes(index)
            : selectedAnswer === index;

          return (
            <button
              key={`${question.id}-option-${index}`}
              type="button"
              onClick={() => {
                if (multiSelect) {
                  const nextValue = isSelected
                    ? selectedAnswers.filter((item) => item !== index)
                    : [...selectedAnswers, index];
                  onAnswerChange(nextValue);
                  return;
                }

                onAnswerChange(index);
              }}
              className={`${optionBaseClass} ${isSelected ? styles.selected : ''}`}
              aria-pressed={multiSelect ? isSelected : undefined}
              aria-checked={!multiSelect ? isSelected : undefined}
              role={multiSelect ? undefined : 'radio'}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                    isSelected
                      ? `${styles.badge} border-transparent`
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm leading-6 text-gray-800">{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderOrderingQuestion = (orderingQuestion: QuizOrderingQuestion) => {
    const currentOrder =
      isStringArray(answer) && answer.length === orderingQuestion.items.length
        ? answer
        : orderingQuestion.items;

    const moveItem = (fromIndex: number, direction: -1 | 1) => {
      const targetIndex = fromIndex + direction;
      if (targetIndex < 0 || targetIndex >= currentOrder.length) {
        return;
      }

      const nextOrder = [...currentOrder];
      [nextOrder[fromIndex], nextOrder[targetIndex]] = [
        nextOrder[targetIndex],
        nextOrder[fromIndex],
      ];
      onAnswerChange(nextOrder);
    };

    return (
      <ol className="space-y-3">
        {currentOrder.map((item: string, index: number) => (
          <li
            key={`${orderingQuestion.id}-ordering-${item}`}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4"
          >
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles.badge}`}>
              {index + 1}
            </span>
            <span className="flex-1 text-sm leading-6 text-gray-800">{item}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={index === 0}
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={index === currentOrder.length - 1}
              >
                Down
              </button>
            </div>
          </li>
        ))}
      </ol>
    );
  };

  const renderMatchingQuestion = (matchingQuestion: QuizMatchingQuestion) => {
    const selectedMatches =
      isNumberArray(answer) && answer.length === matchingQuestion.premises.length
        ? answer
        : Array(matchingQuestion.premises.length).fill(-1);

    return (
      <div className="space-y-4">
        {matchingQuestion.premises.map((premise: string, premiseIndex: number) => (
          <div
            key={`${matchingQuestion.id}-match-${premiseIndex}`}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <label className="flex flex-col gap-3 text-sm font-medium text-gray-800">
              <span>{premise}</span>
              <select
                value={selectedMatches[premiseIndex]}
                onChange={(event) => {
                  const nextMatches = [...selectedMatches];
                  nextMatches[premiseIndex] = Number(event.target.value);
                  onAnswerChange(nextMatches);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-gray-400 focus:outline-none"
              >
                <option value={-1}>Select the best match</option>
                {matchingQuestion.responses.map((response: string, responseIndex: number) => (
                  <option
                    key={`${matchingQuestion.id}-response-${responseIndex}`}
                    value={responseIndex}
                  >
                    {response}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${styles.badge}`}
        >
          {question.difficulty}
        </span>
        <span className={`text-xs font-medium uppercase tracking-[0.18em] ${styles.muted}`}>
          {question.type.replace('-', ' ')}
        </span>
      </div>

      <div className="space-y-3">
        <p className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-7 text-gray-700">
          {question.scenario}
        </p>
        <h3 className="text-2xl font-bold text-gray-900">{question.prompt}</h3>
      </div>

      {(question.type === 'single-choice' || question.type === 'true-false') &&
        renderChoiceQuestion(question, false)}
      {question.type === 'multi-select' && renderChoiceQuestion(question, true)}
      {question.type === 'ordering' && renderOrderingQuestion(question)}
      {question.type === 'matching' && renderMatchingQuestion(question)}

      {question.type === 'multi-select' && (
        <p className="text-sm text-gray-500">
          Select every option that meaningfully contributes to the outcome.
        </p>
      )}
      {question.type === 'ordering' && (
        <p className="text-sm text-gray-500">
          Use the controls to move each step into the order you would execute it in practice.
        </p>
      )}
      {question.type === 'matching' && (
        <p className="text-sm text-gray-500">
          Match each scenario clue to the response that best addresses it.
        </p>
      )}
    </div>
  );
};

export default QuestionRenderer;
