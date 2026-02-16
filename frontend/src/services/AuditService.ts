// services/AuditService.ts
import { HSCodeDatabase } from './docs-data';

export interface AuditIssue {
    id: string;
    type: string;
    category: 'Tax' | 'Regulation' | 'Consistency';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    description: string;
    suggestion: string;
}

export interface HSRecommendation {
    hscode: string;
    description: string;
    confidence: number;
    dutyEstimate: string;
}

export const analyzeDocuments = async (files: File[]): Promise<{ issues: AuditIssue[], recommendations: HSRecommendation[] }> => {
    // DeepSeek-R1 Logic Simulation: Cross-checking documents
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock extracted data from OCR/LayoutLM
    const invoiceData = { totalQuantity: 500, hscode: '0802.22' };
    const packingListData = { totalQuantity: 480 };

    const issues: AuditIssue[] = [];

    // Miktar Kontrolü (DeepSeek Logic)
    if (invoiceData.totalQuantity !== packingListData.totalQuantity) {
        issues.push({
            id: 'a1',
            type: 'QUANTITY_MISMATCH',
            category: 'Consistency',
            severity: 'CRITICAL',
            description: `Invoice shows ${invoiceData.totalQuantity}, but Packing List shows ${packingListData.totalQuantity}.`,
            suggestion: 'Check weights in BL to confirm actual loaded volume. Update Packing List before customs filing to avoid fines.'
        });
    }

    // GTİP (HS Code) Risk Analizi
    const hscodeRisk = HSCodeDatabase.find(h => h.code === invoiceData.hscode);
    if (hscodeRisk?.hasAdditionalDuty) {
        issues.push({
            id: 'a2',
            type: 'DUTY_WARNING',
            category: 'Tax',
            severity: 'WARNING',
            description: `HS Code ${invoiceData.hscode} has an additional duty of ${hscodeRisk.dutyRate}%.`,
            suggestion: 'Apply for GSP or EUR.1 if applicable to mitigate costs. Ensure Certificate of Origin (Form A) is attached.'
        });
    }

    // Regulation Check
    issues.push({
        id: 'a3',
        type: 'REG_UPDATE',
        category: 'Regulation',
        severity: 'INFO',
        description: 'New EU Deforestation Regulation (EUDR) requirement for hazelnut products starts in 6 months.',
        suggestion: 'Request GPS coordinates of production land from supplier now to ensure future compliance.'
    });

    const recommendations: HSRecommendation[] = [
        {
            hscode: '0802.22.00',
            description: 'Shelled Hazelnuts (Fresh or Dried)',
            confidence: 0.98,
            dutyEstimate: '12.0%'
        }
    ];

    return { issues, recommendations };
};
