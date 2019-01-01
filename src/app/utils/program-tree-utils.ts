import { ProgrammaticRequest } from '../generated/model/programmaticRequest'

export class ProgramTreeUtils {
    public static fullnames(programs: ProgrammaticRequest[]): Map<ProgrammaticRequest, string> {
        var fullnames: Map<ProgrammaticRequest, string> = new Map<ProgrammaticRequest, string>();

        var idproglkp: Map<string, ProgrammaticRequest> = new Map<string, ProgrammaticRequest>();
        programs.forEach((p: ProgrammaticRequest) => {
            idproglkp.set(p.id, p);
        });

        function progFullName(p: ProgrammaticRequest): string {
            var pname = '';
            if (null != p.parentMrId) {
                pname = progFullName(idproglkp.get(p.parentMrId)) + '/';
            }
            return pname + p.shortName;
        }

        programs.forEach((p: ProgrammaticRequest) => {
            fullnames.set(p, progFullName(p));
        });

        return fullnames;
    }
}