import { Visit } from './visit';

export class Trip {
    id: number;
    title: string;
    dates: string;
    peopleNb: number;
    visits: Visit[];
    brought: string;
}