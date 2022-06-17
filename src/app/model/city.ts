import { Country } from './country';

export class City {
    id: number;
    name: string;
    country?: Country;
    latitude?: number;
    longitude?: number;
    count?: number;
    transport: string;
    showGlobal: boolean;
    simpleStep?: boolean;
}