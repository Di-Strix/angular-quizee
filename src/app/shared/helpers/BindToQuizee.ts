import { FormControl } from '@angular/forms';

import { Observable, Subscription, distinctUntilChanged, first } from 'rxjs';

import { RecursivePartial } from './RecursivePartial';

export interface BindToQuizeeModifiers<T> {
  getter: () => Observable<T>;
  setter: (changes: RecursivePartial<T>) => any;
  dataParser: (data: T) => string;
  quizeeModifier: (value: string) => RecursivePartial<T>;
}

export const bindToQuizee = <T>(formControl: FormControl, opts: BindToQuizeeModifiers<T>): Subscription => {
  opts
    .getter()
    .pipe(first())
    .subscribe((data) => formControl.setValue(opts.dataParser(data)));

  return formControl.valueChanges
    .pipe(distinctUntilChanged())
    .subscribe((current) => opts.setter(opts.quizeeModifier(current)));
};
