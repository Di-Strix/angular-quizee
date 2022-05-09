import { QuestionType } from '@di-strix/quizee-types';

const matchesCase = (exp: string, caseExp: string) => {
  let [caseFrom, caseTo] = caseExp.split('->');
  const [expFrom, expTo] = exp.split('->');

  if (caseFrom === '*') caseFrom = expFrom;
  if (caseTo === '*') caseTo = expTo;

  return caseFrom === expFrom && caseTo === expTo;
};

const buildExp = (from: QuestionType | '*', to: QuestionType | '*') => `${from}->${to}`;

export const doSwitch = (from: QuestionType, to: QuestionType, cases: [string, () => void][]) =>
  cases.forEach(([caseExp, callable]) => (matchesCase(buildExp(from, to), caseExp) ? callable() : null));

export const switchCase = (
  from: QuestionType | '*',
  to: QuestionType | '*',
  then: () => void
): [string, () => void] => [buildExp(from, to), then];
