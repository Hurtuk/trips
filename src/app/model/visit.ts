import { City } from './city';

export class Visit {
    id: number;
    city: City;
    startDate: string;
    endDate: string;
    latitude: number;
    longitude: number;
    stayedUrl?: string;
    transport: string;
    transportBack?: string;
    cityFrom?: City;
    simpleStep?: boolean;
}