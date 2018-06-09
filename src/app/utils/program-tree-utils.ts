import { Program } from '../generated/model/program'

export class ProgramTreeUtils {
    public static fullnames(programs: Program[]): Map<Program, string> {
        var fullnames: Map<Program, string> = new Map<Program, string>();

        var idproglkp: Map<string, Program> = new Map<string, Program>();
        programs.forEach((p: Program) => {
            idproglkp.set(p.id, p);
        });

        function progFullName(p: Program): string {
            var pname = '';
            if (null != p.parentMrId) {
                pname = progFullName(idproglkp.get(p.parentMrId)) + '/';
            }
            return pname + p.shortName;
        }

        programs.forEach((p: Program) => {
            fullnames.set(p, progFullName(p));
        });

        return fullnames;
    }
}