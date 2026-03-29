const { sendEmail } = require('./_mailer');

const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const readBody = async (req) => {
  if (req.body) return req.body;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf-8');
  return raw ? JSON.parse(raw) : {};
};

const yesNo = (value) => (value ? 'Yes' : 'No');

module.exports = async (req, res) => {
  withCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const body = await readBody(req);

    if (body.two_post_phone) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    const required = [
      'first_name',
      'last_name',
      'gender',
      'email',
      'email_confirm',
      'phone',
      'dob',
      'address_line_1',
      'postcode',
      'passport_type',
      'medical_conditions',
      'allergies',
    ];

    const missing = required.filter((key) => !body[key]);
    if (missing.length) {
      res.statusCode = 400;
      res.end(`Missing required fields: ${missing.join(', ')}`);
      return;
    }

    if (String(body.email).trim().toLowerCase() !== String(body.email_confirm).trim().toLowerCase()) {
      res.statusCode = 400;
      res.end('Email and confirm email do not match');
      return;
    }

    await sendEmail({
      subject: `VCC Join Us Submission: ${body.first_name} ${body.last_name}`,
      html: `
        <h2>Join Us Submission</h2>
        <p><strong>Name:</strong> ${body.first_name} ${body.last_name}</p>
        <p><strong>Gender:</strong> ${body.gender}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phone}</p>
        <p><strong>DOB:</strong> ${body.dob}</p>
        <p><strong>Address:</strong> ${body.address_line_1}${body.address_line_2 ? `, ${body.address_line_2}` : ''}, ${body.postcode}</p>
        <p><strong>Passport Type:</strong> ${body.passport_type}</p>
        <p><strong>Visa Number:</strong> ${body.visa_number || '-'}</p>
        <p><strong>Date of Entry to UK:</strong> ${body.entry_date || '-'}</p>
        <p><strong>Previous Clubs:</strong> ${body.previous_clubs || '-'}</p>
        <p><strong>Medical Conditions:</strong> ${String(body.medical_conditions).replace(/\n/g, '<br>')}</p>
        <p><strong>Allergies:</strong> ${String(body.allergies).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><strong>Photo/Video Consent (records):</strong> ${body.consent_photos_taken || 'No'}</p>
        <p><strong>Social Media Consent:</strong> ${body.consent_social_media || 'No'}</p>
        <p><strong>Name Mention Consent:</strong> ${yesNo(body.consent_name_mention)}</p>
        <p><strong>Guardian Consent (U18):</strong> ${yesNo(body.guardian_consent_under18)}</p>
        <p><strong>Final Confirmation:</strong> ${yesNo(body.confirmation)}</p>
      `,
      replyTo: body.email,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    res.statusCode = 500;
    res.end(error.message || 'Failed to submit form');
  }
};
