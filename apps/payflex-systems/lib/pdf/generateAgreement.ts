/**
 * PAYFLEX SYSTEMS - PDF AGREEMENT GENERATOR
 * Generates signed provider agreement PDFs
 */

import jsPDF from 'jspdf';

interface AgreementData {
  providerName: string;
  legalName: string;
  ein: string;
  signedBy: string;
  signedTitle: string;
  signedDate: string;
  ipAddress: string;
  agreementVersion: string;
  agreementText: string;
}

export function generateAgreementPDF(data: AgreementData): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PayFlex Systems', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Provider Program Agreement', 105, 28, { align: 'center' });
  
  // Agreement details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Agreement Version: ${data.agreementVersion}`, 20, 40);
  doc.text(`Date: ${data.signedDate}`, 20, 46);
  
  // Provider information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Provider Information', 20, 58);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Legal Business Name: ${data.legalName}`, 20, 66);
  doc.text(`EIN: ${data.ein}`, 20, 72);
  
  // Agreement text (simplified - would be multi-page in production)
  doc.setFontSize(10);
  const splitText = doc.splitTextToSize(data.agreementText, 170);
  doc.text(splitText, 20, 85);
  
  // Calculate position for signature (simplified)
  const textHeight = splitText.length * 5;
  let signatureY = 85 + textHeight + 20;
  
  // If would exceed page, add new page
  if (signatureY > 250) {
    doc.addPage();
    signatureY = 20;
  }
  
  // Signature section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Electronic Signature', 20, signatureY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Signed by: ${data.signedBy}`, 20, signatureY + 10);
  doc.text(`Title: ${data.signedTitle}`, 20, signatureY + 16);
  doc.text(`Date & Time: ${data.signedDate}`, 20, signatureY + 22);
  doc.text(`IP Address: ${data.ipAddress}`, 20, signatureY + 28);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Electronically signed under the U.S. E-SIGN Act (15 U.S.C. §7001)', 105, signatureY + 40, { align: 'center' });
  doc.text(`Document ID: ${data.agreementVersion}-${Date.now()}`, 105, signatureY + 45, { align: 'center' });
  
  return doc;
}

export async function uploadAgreementPDF(
  supabase: any,
  providerId: string,
  pdf: jsPDF
): Promise<string | null> {
  try {
    // Convert PDF to blob
    const pdfBlob = pdf.output('blob');
    const fileName = `provider-agreement-${providerId}-${Date.now()}.pdf`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('provider-agreements')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });
    
    if (error) {
      console.error('PDF upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('provider-agreements')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (err) {
    console.error('PDF upload failed:', err);
    return null;
  }
}

export const AGREEMENT_TEXT_V1 = `
PAYFLEX SYSTEMS PROVIDER PROGRAM AGREEMENT

This Provider Program Agreement ("Agreement") is entered into between PayFlex Systems ("PayFlex") and the Provider identified in this application.

1. SERVICES
PayFlex provides payment access infrastructure enabling providers to offer structured payment plans to patients/clients. PayFlex is not a lender, bank, or insurance company.

2. PROVIDER OBLIGATIONS
Provider agrees to:
- Maintain all required licenses and credentials
- Comply with applicable state and federal regulations
- Provide accurate information during onboarding
- Use PayFlex services only for legitimate healthcare/legal services
- Maintain trust account compliance where required
- Notify PayFlex of material changes to business structure

3. PAYFLEX OBLIGATIONS
PayFlex agrees to:
- Provide payment infrastructure services
- Handle ACH transactions and collections
- Maintain platform security and compliance
- Provide reporting and audit trails
- Support provider onboarding and training

4. FEES
Provider fees: $0 monthly, $0 transaction fees
Patient/client fees: 5-15% platform fee based on payment term

5. TERM AND TERMINATION
This Agreement begins upon approval and continues until terminated by either party with 30 days written notice.

6. COMPLIANCE
Provider represents that it maintains all necessary licenses, insurance, and compliance with applicable laws including but not limited to HIPAA (healthcare), state bar rules (legal), and consumer protection laws.

7. LIABILITY
PayFlex is not responsible for the quality of services provided by Provider. Provider indemnifies PayFlex against claims arising from Provider's services.

8. DATA SECURITY
Both parties agree to maintain bank-level security for all sensitive information. PayFlex uses encryption, access controls, and regular security audits.

9. GOVERNING LAW
This Agreement is governed by the laws of the State of Delaware.

10. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements.

By signing below, Provider agrees to all terms and conditions of this Agreement.
`;
