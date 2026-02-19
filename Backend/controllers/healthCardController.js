const HealthCard = require('../models/healthCardModel');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

/**
 * Generate unique health card number
 */
function generateHealthCardNumber() {
  const prefix = 'ZUNF';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate QR code data URL
 */
async function generateQRCode(healthCardNumber) {
  try {
    const qrData = await QRCode.toDataURL(healthCardNumber, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 200,
    });
    return qrData;
  } catch (error) {
    console.error('QR code generation error:', error);
    return '';
  }
}

/**
 * Calculate validity date (1 year from issue date)
 */
function calculateValidity(issueDate) {
  const validity = new Date(issueDate);
  validity.setFullYear(validity.getFullYear() + 1);
  return validity;
}

/**
 * Create or update health card
 */
exports.createOrUpdateHealthCard = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      name,
      idCard,
      phone,
      email,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      organizationName,
      employeeId,
      emergencyContact,
      medicalConditions,
      allergies,
    } = req.body;

    // Validate required fields
    if (!name || !idCard || !phone || !dateOfBirth || !gender || !address) {
      return res.status(400).json({
        message: 'Name, CNIC/B-Form, Phone, Date of Birth, Gender, and Address are required',
      });
    }

    // Check if health card already exists
    let healthCard = await HealthCard.findOne({ userId });
    const isNewCard = !healthCard;

    if (healthCard) {
      // Update existing card
      healthCard.name = name;
      healthCard.idCard = idCard;
      healthCard.phone = phone;
      healthCard.email = email;
      healthCard.dateOfBirth = dateOfBirth;
      healthCard.gender = gender;
      healthCard.address = address;
      healthCard.bloodGroup = bloodGroup || '';
      healthCard.organizationName = organizationName || '';
      healthCard.employeeId = employeeId || '';
      healthCard.emergencyContact = emergencyContact || { name: '', phone: '' };
      healthCard.medicalConditions = medicalConditions || '';
      healthCard.allergies = allergies || '';
      await healthCard.save();
    } else {
      // Create new card - generate auto-generated fields
      const healthCardNumber = generateHealthCardNumber();
      const issueDate = new Date();
      const validity = calculateValidity(issueDate);
      const qrCode = await generateQRCode(healthCardNumber);

      healthCard = new HealthCard({
        userId,
        name,
        idCard,
        phone,
        email,
        dateOfBirth,
        gender,
        address,
        bloodGroup: bloodGroup || '',
        organizationName: organizationName || '',
        employeeId: employeeId || '',
        emergencyContact: emergencyContact || { name: '', phone: '' },
        medicalConditions: medicalConditions || '',
        allergies: allergies || '',
        healthCardNumber,
        qrCode,
        issueDate,
        validity,
      });
      await healthCard.save();
    }

    res.status(200).json({
      message: 'Health card saved successfully',
      healthCard,
    });
  } catch (error) {
    console.error('Create health card error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user's health card
 */
exports.getHealthCard = async (req, res) => {
  try {
    const userId = req.userId;

    const healthCard = await HealthCard.findOne({ userId });

    if (!healthCard) {
      return res.status(404).json({ message: 'Health card not found' });
    }

    res.json({ healthCard });
  } catch (error) {
    console.error('Get health card error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get logo as base64
 */
function getLogoBase64() {
  try {
    // Try to read logo from frontend public folder
    const logoPath = path.join(__dirname, '../../Frontend/public/zunf.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
  } catch (error) {
    console.error('Error reading logo:', error);
  }
  // Return empty string if logo not found
  return '';
}

/**
 * Generate HTML template for health card
 */
function generateCardHTML(healthCard) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const logoBase64 = getLogoBase64();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: 85.6mm 53.98mm;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 340px;
      height: 214px;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    body {
      font-family: Arial, sans-serif;
      background: white;
    }
    .card {
      width: 340px;
      height: 214px;
      background: rgb(255, 255, 255);
      border: 2px solid rgb(209, 213, 219);
      border-radius: 8px;
      padding: 10px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.15;
      pointer-events: none;
      z-index: 0;
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .watermark img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 2px solid rgb(148, 202, 67);
    }
    .header-left h2 {
      font-size: 14px;
      font-weight: bold;
      color: rgb(148, 202, 67);
      line-height: 1.2;
    }
    .header-left p {
      font-size: 9px;
      color: rgb(75, 85, 99);
      font-weight: 600;
    }
    .header-right {
      text-align: right;
      font-size: 7px;
      color: rgb(107, 114, 128);
      font-family: monospace;
    }
    .main-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 50px;
      gap: 10px 8px;
      font-size: 8px;
      min-height: 0;
    }
    .left-column {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }
    .field {
      overflow: hidden;
    }
    .field-label {
      font-size: 6px;
      color: rgb(107, 114, 128);
      text-transform: uppercase;
      font-weight: 600;
      line-height: 1.2;
    }
    .field-value {
      font-size: 8px;
      color: rgb(17, 24, 39);
      font-weight: 600;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .field-value.name {
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .field-value.primary {
      color: rgb(148, 202, 67);
      font-weight: bold;
    }
    .field-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .qr-code {
      display: flex;
      align-items: start;
      justify-content: center;
      padding-top: 2px;
    }
    .qr-code img {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
    .footer {
      margin-top: auto;
      padding-top: 4px;
      border-top: 1px solid rgb(229, 231, 235);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 5px;
      color: rgb(156, 163, 175);
    }
    .footer-left p {
      line-height: 1.2;
    }
    .footer-right {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="watermark">
      ${logoBase64 ? `<img src="${logoBase64}" alt="ZUNF Logo" />` : '<div style="width: 180px; height: 180px; background: rgb(148, 202, 67); opacity: 0.1; border-radius: 50%;"></div>'}
    </div>
    <div class="content">
      <div class="header">
        <div class="header-left">
          <h2>ZUNF MEDICARE</h2>
          <p>HEALTH CARD</p>
        </div>
        <div class="header-right">
          ${healthCard.healthCardNumber || ''}
        </div>
      </div>
      <div class="main-content">
        <div class="left-column">
          <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value name">${(healthCard.name || '').toUpperCase()}</div>
          </div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">CNIC/B-Form</div>
              <div class="field-value">${healthCard.idCard || ''}</div>
            </div>
            <div class="field">
              <div class="field-label">DOB</div>
              <div class="field-value">${healthCard.dateOfBirth || ''}</div>
            </div>
          </div>
          <div class="field-grid">
            ${healthCard.gender ? `<div class="field">
              <div class="field-label">Gender</div>
              <div class="field-value">${healthCard.gender}</div>
            </div>` : ''}
            ${healthCard.bloodGroup ? `<div class="field">
              <div class="field-label">Blood</div>
              <div class="field-value primary">${healthCard.bloodGroup}</div>
            </div>` : ''}
          </div>
          ${(healthCard.organizationName || healthCard.employeeId) ? `<div class="field-grid">
            ${healthCard.organizationName ? `<div class="field">
              <div class="field-label">Org</div>
              <div class="field-value">${healthCard.organizationName}</div>
            </div>` : ''}
            ${healthCard.employeeId ? `<div class="field">
              <div class="field-label">Emp ID</div>
              <div class="field-value">${healthCard.employeeId}</div>
            </div>` : ''}
          </div>` : ''}
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Phone</div>
              <div class="field-value">${healthCard.phone || ''}</div>
            </div>
            ${healthCard.emergencyContact?.phone ? `<div class="field">
              <div class="field-label">Emergency</div>
              <div class="field-value">${healthCard.emergencyContact.phone}</div>
            </div>` : ''}
          </div>
          ${healthCard.email ? `<div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${healthCard.email}</div>
          </div>` : ''}
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value" style="white-space: normal; line-height: 1.1;">${healthCard.address || ''}</div>
          </div>
          ${(healthCard.medicalConditions || healthCard.allergies) ? `<div class="field-grid">
            ${healthCard.medicalConditions ? `<div class="field">
              <div class="field-label">Conditions</div>
              <div class="field-value">${healthCard.medicalConditions}</div>
            </div>` : ''}
            ${healthCard.allergies ? `<div class="field">
              <div class="field-label">Allergies</div>
              <div class="field-value">${healthCard.allergies}</div>
            </div>` : ''}
          </div>` : ''}
        </div>
        ${healthCard.qrCode ? `<div class="qr-code">
          <img src="${healthCard.qrCode}" alt="QR Code" />
        </div>` : ''}
      </div>
      <div class="footer">
        <div class="footer-left">
          ${healthCard.issueDate ? `<p>Issued: ${formatDate(healthCard.issueDate)}</p>` : ''}
          ${healthCard.validity ? `<p>Valid: ${formatDate(healthCard.validity)}</p>` : ''}
        </div>
        <div class="footer-right">ZUNF MEDICARE</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Download health card as PDF
 */
exports.downloadHealthCard = async (req, res) => {
  try {
    const userId = req.userId;

    const healthCard = await HealthCard.findOne({ userId });

    if (!healthCard) {
      return res.status(404).json({ message: 'Health card not found' });
    }

    const html = generateCardHTML(healthCard);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to match card dimensions exactly
    await page.setViewport({
      width: 340,
      height: 214,
      deviceScaleFactor: 2
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      width: '85.6mm',  // Standard ID card width in mm (340px = 85.6mm at 96dpi)
      height: '53.98mm', // Standard ID card height in mm (214px = 53.98mm at 96dpi)
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
      pageRanges: '1'
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="health-card-${healthCard.name.replace(/\s+/g, '-')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download health card error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


