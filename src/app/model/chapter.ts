import { City } from './city';

export class Chapter {
    number: number;
    date?: string;
    title: string;
    content: string;
    images?: string[];
    transports?: string[];
    from?: City;
    to?: City;
}