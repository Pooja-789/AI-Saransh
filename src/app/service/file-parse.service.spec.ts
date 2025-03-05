import { TestBed } from '@angular/core/testing';

import { FileParseService } from './file-parse.service';

describe('FileParseService', () => {
  let service: FileParseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileParseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
