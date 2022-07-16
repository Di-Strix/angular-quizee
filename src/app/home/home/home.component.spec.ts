import { of } from 'rxjs';
import { QuizeeService } from 'src/app/shared/services/quizee.service';

import { HomeComponent } from './home.component';

jest.mock('src/app/shared/services/quizee.service');

describe('HomeComponent', () => {
  let service: QuizeeService;
  let component: HomeComponent;

  beforeEach(() => {
    service = new (QuizeeService as any)();
    component = new HomeComponent(service);

    jest.useFakeTimers();
  });

  it('should fetch quizees ', async () => {
    const mockQuizees = [{ a: 1 }, { b: 2 }];

    (service.getQuizeeList as jest.Mock).mockReturnValue(of(mockQuizees));
    component.ngOnInit();

    await jest.runAllTimers();

    expect(component.quizees).toEqual(mockQuizees);
  });
});
