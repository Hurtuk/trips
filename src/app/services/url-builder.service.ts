import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class UrlBuilderService {

	private urlPrefix = 'https://www.louiecinephile.fr/tripsBO/api/';

	private static replaceContent(source: string, args: any[]) {
		return source.replace(/{(\d+)}/g,
			(match, number) =>
				typeof args[number] !== 'undefined'
				? '' + args[number]
				: match);
	}

	public buildUrl(request: string, ...args: any[]): string {
		return this.urlPrefix + UrlBuilderService.replaceContent(
			request + '.php?' + args.map((arg, index) =>
				'arg' + index + (arg ? '={' + index + '}' : '=')).join('&'),
			args);
	}

	public genericUrl(relative: string): string {
		return this.urlPrefix + relative;
	}
}
