import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PfmTestModule } from '../../../../test.module';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ProgrammingServiceImpl } from '../../../../../../app/programming-feature/services/programming-service-impl.service';
import { RequestsDetailsComponent } from '../../../../../../app/programming-feature/requests/requests-details/requests-details.component';
import { ProgrammingService } from '../../../../../../app/programming-feature/services/programming-service';
import { Program } from '../../../../../../app/programming-feature/models/Program';
import { ProgramStatus } from '../../../../../../app/programming-feature/models/enumerations/program-status.model';

describe('Component Tests', () => {
  describe('Requests Details Management Component', () => {
    let comp: RequestsDetailsComponent;
    let fixture: ComponentFixture<RequestsDetailsComponent>;
    let service: ProgrammingServiceImpl;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [PfmTestModule],
        declarations: [RequestsDetailsComponent],
        providers: []
      })
        .overrideTemplate(RequestsDetailsComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(RequestsDetailsComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(ProgrammingService);
    });

    it('Should call load all on init', fakeAsync(() => {
      // GIVEN
      spyOn(service, 'getProgramById').and.returnValue(
        of(
          {
            result: { id: '123' }
          }
        )
      );

      // WHEN
      comp.ngOnInit();
      tick(); // simulate async

      // THEN
      expect(service.getProgramById).toHaveBeenCalled();
      expect(comp.program).toEqual(jasmine.objectContaining({ id: '123' }));
    }));

    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        const entity = new Program();
        entity.id = '123';

        spyOn(service, 'updateProgram').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.program = entity;
        // WHEN
        comp.onSave();
        tick(); // simulate async

        // THEN
        const entityToBeSaved = { ...entity, programStatus: ProgramStatus.SAVED };
        expect(service.updateProgram).toHaveBeenCalledWith(entityToBeSaved);
        expect(comp.busy).toEqual(false);
      }));

    });
  });
});
