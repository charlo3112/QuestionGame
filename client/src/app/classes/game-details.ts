export class AdminGameDetails {
    constructor(
        public id: string,
        public name: string,
        public image: string,
        public description: string,
        public isVisible: boolean,
        public lastModified: string,
    ) {}
}
