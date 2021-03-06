import { DefaultImport, NamedImport, SymbolSpecifier } from 'typescript-parser';

/**
 * Proxy class that wraps a NamedImport or a DefaultImport. Is used by the DocumentController to
 * determine if a default import or a named import is used.
 * 
 * @export
 * @class ImportProxy
 * @extends {NamedImport}
 */
export class ImportProxy extends NamedImport {
    public defaultPurposal: string;
    public defaultAlias: string | undefined;

    constructor(library: NamedImport | DefaultImport | string, start?: number, end?: number) {
        super(typeof library !== 'string' ? library.libraryName : library, start, end);

        if (typeof library !== 'string') {
            this.start = library.start;
            this.end = library.end;
            if (library instanceof NamedImport) {
                this.specifiers = library.specifiers;
                const defaultSpec = this.specifiers.find(o => o.specifier === 'default');
                if (defaultSpec) {
                    this.specifiers.splice(this.specifiers.indexOf(defaultSpec), 1);
                    this.defaultAlias = defaultSpec.alias;
                }
            } else {
                this.defaultAlias = library.alias;
            }
        }
    }

    /**
     * Adds a specifier to the import.
     * 
     * @param {string} name
     * 
     * @memberof ImportProxy
     */
    public addSpecifier(name: string): void {
        if (!this.specifiers.some(o => o.specifier === name)) {
            this.specifiers.push(new SymbolSpecifier(name));
        }
    }

    /**
     * Clone this proxy.
     * 
     * @returns {ImportProxy}
     * 
     * @memberof ImportProxy
     */
    public clone(): ImportProxy {
        const clone = new ImportProxy(this.libraryName, this.start, this.end);
        clone.specifiers = this.specifiers.map(o => o.clone());
        clone.defaultAlias = this.defaultAlias;
        clone.defaultPurposal = this.defaultPurposal;
        return clone;
    }

    /**
     * Does check for equality to another proxy. All properties are checked and as a last step,
     * the specifiers are (with order in mind) checked.
     * 
     * @param {ImportProxy} imp
     * @returns {boolean}
     * 
     * @memberof ImportProxy
     */
    public isEqual(imp: ImportProxy): boolean {
        const sameSpecifiers = (specs1: SymbolSpecifier[], specs2: SymbolSpecifier[]) => {
            for (const spec of specs1) {
                const spec2 = specs2[specs1.indexOf(spec)];
                if (!spec2 ||
                    spec.specifier !== spec2.specifier ||
                    spec.alias !== spec2.alias) {
                    return false;
                }
            }
            return true;
        };

        return this.libraryName === imp.libraryName &&
            this.defaultAlias === imp.defaultAlias &&
            this.defaultPurposal === imp.defaultPurposal &&
            this.specifiers.length === imp.specifiers.length &&
            sameSpecifiers(this.specifiers, imp.specifiers);
    }
}
