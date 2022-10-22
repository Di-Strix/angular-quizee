import { PlayerService } from '../player.service';

import { QuestionFooterComponent } from './question-footer.component';

jest.mock('../player.service');

describe('FooterComponent', () => {
  let playerService: jest.Mock<PlayerService>['prototype'];
  let component: QuestionFooterComponent;

  beforeEach(async () => {
    playerService = new PlayerService({} as any);
    component = new QuestionFooterComponent(playerService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
