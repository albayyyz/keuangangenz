// export-pdf.js - Export PDF Functionality

console.log('🔄 Loading export-pdf.js...');

// Function untuk Export PDF
async function exportPDF() {
    console.log('📄 exportPDF function called!');
    
    // Show loading
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'pdfLoading';
    loadingMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 30px 50px;
        border-radius: 15px;
        z-index: 9999;
        font-size: 18px;
        font-weight: 600;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    loadingMsg.innerHTML = '📄 Membuat PDF...<br><small style="font-size: 14px; font-weight: normal;">Mohon tunggu sebentar</small>';
    document.body.appendChild(loadingMsg);

    try {
        console.log('🔍 Getting transaction data...');
        
        // Get data dari API
        const allTransaksi = await getTransaksiData();
        const summary = await calculateSummary();
        
        console.log('📊 Data received:', {
            transaksiCount: allTransaksi.length,
            summary: summary
        });
        
        if (allTransaksi.length === 0) {
            alert('❌ Tidak ada data untuk diekspor!');
            document.body.removeChild(loadingMsg);
            return;
        }

        console.log('📝 Creating PDF content...');
        
        // Buat konten PDF
        const pdfContent = await createPDFContent(allTransaksi, summary);
        
        console.log('🖨️ Generating PDF document...');
        
        // Generate PDF menggunakan jsPDF
        await generatePDFDocument(pdfContent, summary);
        
        // Remove loading
        document.body.removeChild(loadingMsg);
        
        console.log('✅ PDF generated successfully!');
        
        // Success message
        showSuccessMessage('✅ PDF berhasil diunduh!');
        
    } catch (error) {
        console.error('❌ Error exporting PDF:', error);
        document.body.removeChild(loadingMsg);
        alert('❌ Gagal membuat PDF: ' + error.message);
    }
}

// Create PDF Content
async function createPDFContent(transaksi, summary) {
    console.log('📋 Processing PDF content...');
    
    // Group by bulan
    const byMonth = {};
    transaksi.forEach(t => {
        const date = new Date(t.tanggal);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!byMonth[monthKey]) {
            byMonth[monthKey] = {
                pemasukan: [],
                pengeluaran: [],
                totalPemasukan: 0,
                totalPengeluaran: 0
            };
        }
        
        if (t.tipe === 'pemasukan') {
            byMonth[monthKey].pemasukan.push(t);
            byMonth[monthKey].totalPemasukan += parseFloat(t.jumlah);
        } else {
            byMonth[monthKey].pengeluaran.push(t);
            byMonth[monthKey].totalPengeluaran += parseFloat(t.jumlah);
        }
    });
    
    console.log('✅ PDF content processed:', Object.keys(byMonth).length, 'months');
    
    return { byMonth, transaksi, summary };
}

// Generate PDF Document
async function generatePDFDocument(content, summary) {
    console.log('🖨️ Starting PDF generation...');
    
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF library tidak ditemukan. Pastikan library sudah dimuat.');
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function untuk cek new page
    function checkNewPage(requiredSpace = 30) {
        if (yPos + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPos = 20;
            return true;
        }
        return false;
    }
    
    // ===== HEADER =====
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(74, 222, 128); // Hijau tosca
    doc.text('LAPORAN KEUANGAN', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Aplikasi Keuangan GenZ', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Dicetak: ${today}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    
    // Garis pemisah
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    // ===== SUMMARY BOX =====
    checkNewPage(50);
    
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('RINGKASAN KESELURUHAN', margin + 5, yPos + 10);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Total Pemasukan
    doc.setTextColor(16, 185, 129); // Hijau
    doc.text('Total Pemasukan:', margin + 5, yPos + 20);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRupiah(summary.totalPemasukan), margin + 50, yPos + 20);
    
    // Total Pengeluaran
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(239, 68, 68); // Merah
    doc.text('Total Pengeluaran:', margin + 5, yPos + 28);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRupiah(summary.totalPengeluaran), margin + 50, yPos + 28);
    
    // Saldo
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(59, 130, 246); // Biru
    doc.text('Saldo:', margin + 5, yPos + 36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(summary.saldo >= 0 ? 16 : 239, summary.saldo >= 0 ? 185 : 68, summary.saldo >= 0 ? 129 : 68);
    doc.text(formatRupiah(summary.saldo), margin + 50, yPos + 36);
    
    yPos += 50;
    
    // ===== DATA TRANSAKSI =====
    checkNewPage(40);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('RINCIAN TRANSAKSI', margin, yPos);
    yPos += 10;
    
    const months = Object.keys(content.byMonth).sort().reverse();
    
    for (const monthKey of months) {
        const monthData = content.byMonth[monthKey];
        const [year, month] = monthKey.split('-');
        const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'long' 
        });
        
        checkNewPage(60);
        
        // Month Header
        doc.setFillColor(74, 222, 128); // Hijau tosca
        doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(monthName.toUpperCase(), margin + 3, yPos + 7);
        yPos += 15;
        
        // Month Summary
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(16, 185, 129);
        doc.text(`Pemasukan: ${formatRupiah(monthData.totalPemasukan)}`, margin + 5, yPos);
        doc.setTextColor(239, 68, 68);
        doc.text(`Pengeluaran: ${formatRupiah(monthData.totalPengeluaran)}`, margin + 80, yPos);
        yPos += 8;
        
        // Transaksi List
        const allMonthTransaksi = [...monthData.pemasukan, ...monthData.pengeluaran]
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        
        if (allMonthTransaksi.length > 0) {
            // Table Header
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPos, contentWidth, 8, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(80, 80, 80);
            doc.text('Tanggal', margin + 2, yPos + 5);
            doc.text('Kategori', margin + 30, yPos + 5);
            doc.text('Deskripsi', margin + 60, yPos + 5);
            doc.text('Jumlah', margin + 130, yPos + 5);
            yPos += 10;
            
            // Table Rows
            for (const t of allMonthTransaksi) {
                checkNewPage(10);
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60, 60, 60);
                
                const tanggalShort = new Date(t.tanggal).toLocaleDateString('id-ID', { 
                    day: '2-digit', 
                    month: 'short' 
                });
                doc.text(tanggalShort, margin + 2, yPos);
                doc.text(capitalizeFirst(t.kategori), margin + 30, yPos);
                
                // Deskripsi (truncate if too long)
                const desc = t.deskripsi || '-';
                const truncDesc = desc.length > 30 ? desc.substring(0, 27) + '...' : desc;
                doc.text(truncDesc, margin + 60, yPos);
                
                // Jumlah dengan warna
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(t.tipe === 'pemasukan' ? 16 : 239, t.tipe === 'pemasukan' ? 185 : 68, t.tipe === 'pemasukan' ? 129 : 68);
                const jumlahText = formatRupiah(t.jumlah);
                doc.text(jumlahText, margin + 130, yPos);
                
                yPos += 7;
            }
        } else {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('Tidak ada transaksi', margin + 5, yPos);
            yPos += 7;
        }
        
        yPos += 10;
    }
    
    // ===== FOOTER =====
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Halaman ${i} dari ${totalPages} - Generated by Aplikasi Keuangan GenZ`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }
    
    // Save PDF
    const fileName = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF saved:', fileName);
}

// Show Success Message
function showSuccessMessage(message) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4ade80 0%, #ec4899 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        z-index: 9999;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;
    successMsg.textContent = message;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(successMsg), 300);
    }, 3000);
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Export PDF module loaded successfully');

// Test if function is accessible globally
if (typeof window !== 'undefined') {
    window.exportPDF = exportPDF;
    console.log('✅ exportPDF attached to window object');
}