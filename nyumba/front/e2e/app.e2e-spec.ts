import { Nyumba1Page } from './app.po';

describe('nyumba1 App', () => {
  let page: Nyumba1Page;

  beforeEach(() => {
    page = new Nyumba1Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
