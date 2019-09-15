import { OnDestroy } from '@angular/core';

export interface SummaryModal extends OnDestroy {
    initFromId(id: string | number): void;

    close(): void;
}
