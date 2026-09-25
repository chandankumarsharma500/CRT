
import { GoogleSheetConfig } from '../types';

class GoogleSheetService {
    private config: GoogleSheetConfig | null = null;
    private readonly STORAGE_KEY = 'google_sheet_config';

    constructor() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) this.config = JSON.parse(saved);
    }

    saveConfig(config: GoogleSheetConfig) {
        this.config = config;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    }

    getConfig() {
        return this.config;
    }

    async syncTrade(tradeData: any) {
        if (!this.config || !this.config.enabled || !this.config.webhookUrl) return;

        try {
            const payload = {
                timestamp: new Date().toLocaleString(),
                sheetName: this.config.sheetName || 'Trades',
                ...tradeData
            };

            // We use no-cors if it's a simple macro, but ideally the GAS script handles JSON
            await fetch(this.config.webhookUrl, {
                method: 'POST',
                mode: 'no-cors', // Common for Google Apps Script Webapps
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log("Synced to Google Sheets");
        } catch (e) {
            console.error("Sheet Sync Failed", e);
        }
    }
}

export const googleSheetService = new GoogleSheetService();
