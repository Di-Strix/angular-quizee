import { LoadingDialogComponent } from './loading-dialog.component';

describe('LoadingDialogComponent', () => {
  let component: LoadingDialogComponent;

  beforeEach(() => {
    component = new LoadingDialogComponent('');
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
