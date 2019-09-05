import { City } from './city';

export class Visit {
    id: number;
    city: City;
    startDate: string;
    endDate: string;
    stayedGPSlatitude: string;
    stayedGPSlongitude: string;
    stayedUrl?: string;
    transport: string;
    transportBack?: string;
    cityFrom?: City;
}