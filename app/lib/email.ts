import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `Skyvora Travel <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/*  Email templates                                                    */
/* ------------------------------------------------------------------ */

const EMAIL_HEADER = `
<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#f5f3f0;padding:20px;">
  <div style="background:#1a1a2e;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">
      <span style="color:#60a5fa;">Skyvora</span> Travel
    </h1>
  </div>
  <div style="background:#fff;border-radius:0 0 12px 12px;padding:32px;border:1px solid #e5e7eb;">
`;

const EMAIL_FOOTER = `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;text-align:center;">
      © 2026 Skyvora Travel — Email ini dikirim otomatis, mohon tidak membalas.
    </p>
  </div>
</div>
`;

function btn(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">${text}</a>`;
}

/** Booking baru dibuat — konfirmasi ke user */
export function tplBookingNew(params: {
  userName: string;
  rute: string;
  tglBerangkat: string;
  jamBerangkat: string;
  jumlahKursi: number;
  totalHarga: number;
  status: string;
  bookingUrl: string;
}) {
  const { userName, rute, tglBerangkat, jamBerangkat, jumlahKursi, totalHarga, status, bookingUrl } = params;
  const statusColor = status === "PAID" ? "#16a34a" : status === "PENDING_PAYMENT" ? "#d97706" : "#0ea5e9";
  const statusLabel = status === "PAID" ? "Sudah Bayar" : status === "PENDING_PAYMENT" ? "Menunggu Pembayaran" : status;

  return {
    subject: `Booking #${rute} — ${statusLabel}`,
    html: `
${EMAIL_HEADER}
    <h2 style="color:#111;margin:0 0 8px;">Halo, ${userName} 👋</h2>
    <p style="color:#6b7280;margin:0 0 20px;">Booking kamu telah diterima. Berikut detailnya:</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:140px;">Rute</td><td style="padding:8px 0;font-weight:700;color:#111;">${rute}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 0;color:#6b7280;font-size:13px;">Tanggal</td><td style="padding:8px 0;font-weight:700;color:#111;">${tglBerangkat}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Jam Berangkat</td><td style="padding:8px 0;font-weight:700;color:#111;">${jamBerangkat}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 0;color:#6b7280;font-size:13px;">Jumlah Kursi</td><td style="padding:8px 0;font-weight:700;color:#111;">${jumlahKursi}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Total</td><td style="padding:8px 0;font-weight:700;color:#111;font-size:18px;">Rp ${totalHarga.toLocaleString("id-ID")}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 0;color:#6b7280;font-size:13px;">Status</td><td style="padding:8px 0;"><span style="background:${statusColor}15;color:${statusColor};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${statusLabel}</span></td></tr>
    </table>

    <div style="text-align:center;margin:24px 0;">
      ${btn("Lihat Detail Booking", bookingUrl)}
    </div>
${EMAIL_FOOTER}`,
    text: `Halo ${userName},\n\nBooking kamu telah diterima.\nRute: ${rute}\nTanggal: ${tglBerangkat}\nJam: ${jamBerangkat}\nKursi: ${jumlahKursi}\nTotal: Rp ${totalHarga.toLocaleString("id-ID")}\nStatus: ${statusLabel}\n\nDetail: ${bookingUrl}`,
  };
}

/** Booking dikonfirmasi oleh admin */
export function tplBookingConfirmed(params: {
  userName: string;
  rute: string;
  tglBerangkat: string;
  jamBerangkat: string;
  jumlahKursi: number;
  totalHarga: number;
  alamatJemput: string;
  status: string;
  bookingUrl: string;
}) {
  const { userName, rute, tglBerangkat, jamBerangkat, jumlahKursi, totalHarga, alamatJemput, status, bookingUrl } = params;
  return {
    subject: `✅ Booking Dikonfirmasi — ${rute}`,
    html: `
${EMAIL_HEADER}
    <h2 style="color:#111;margin:0 0 8px;">Halo, ${userName}! 🎉</h2>
    <p style="color:#6b7280;margin:0 0 20px;">Booking kamu sudah <strong>dikonfirmasi</strong> oleh admin. Berangkatnya mepet nih, siap-siap!</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:140px;">Rute</td><td style="padding:8px 0;font-weight:700;color:#111;">${rute}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 0;color:#6b7280;font-size:13px;">Tanggal</td><td style="padding:8px 0;font-weight:700;color:#111;">${tglBerangkat}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Jam Berangkat</td><td style="padding:8px 0;font-weight:700;color:#111;">${jamBerangkat}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 0;color:#6b7280;font-size:13px;">Jumlah Kursi</td><td style="padding:8px 0;font-weight:700;color:#111;">${jumlahKursi} orang</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Total Harga</td><td style="padding:8px 0;font-weight:700;color:#111;font-size:16px;">Rp ${totalHarga.toLocaleString("id-ID")}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 0;color:#6b7280;font-size:13px;">Alamat Jemput</td><td style="padding:8px 0;font-weight:700;color:#111;">${alamatJemput}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Status</td><td style="padding:8px 0;"><span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${status}</span></td></tr>
    </table>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#166534;font-size:13px;">✅ <strong>Terkonfirmasi!</strong> Armada akan menjemput sesuai jadwal. Pastikan kamu sudah siap di lokasi penjemputan 15 menit sebelum jam berangkat.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      ${btn("Lihat Detail Booking", bookingUrl)}
    </div>
${EMAIL_FOOTER}`,
    text: `Halo ${userName}!\n\nBooking kamu sudah dikonfirmasi.\nRute: ${rute}\nTanggal: ${tglBerangkat}\nJam: ${jamBerangkat}\nJumlah Kursi: ${jumlahKursi}\nTotal: Rp ${totalHarga.toLocaleString("id-ID")}\nAlamat Jemput: ${alamatJemput}\nStatus: ${status}\n\nSiap-siap di lokasi penjemputan 15 menit sebelum berangkat!\nDetail: ${bookingUrl}`,
  };
}

/** Booking selesai */
export function tplBookingSelesai(params: {
  userName: string;
  rute: string;
  tglBerangkat: string;
  bookingUrl: string;
}) {
  const { userName, rute, tglBerangkat, bookingUrl } = params;
  return {
    subject: `✅ Perjalanan Selesai — ${rute}`,
    html: `
${EMAIL_HEADER}
    <h2 style="color:#111;margin:0 0 8px;">Halo, ${userName}! 🎉</h2>
    <p style="color:#6b7280;margin:0 0 20px;">Perjalanan kamu dengan rute <strong>${rute}</strong> pada <strong>${tglBerangkat}</strong> telah <strong>selesai</strong>.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#166534;font-size:13px;">Terima kasih sudah menggunakan Skyvora Travel! Semoga perjalanannya nyaman dan aman sampai tujuan 🙏</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      ${btn("Lihat Riwayat Booking", bookingUrl)}
    </div>
${EMAIL_FOOTER}`,
    text: `Halo ${userName}!\n\nPerjalanan ${rute} pada ${tglBerangkat} telah selesai.\nTerima kasih sudah menggunakan Skyvora Travel!\nRiwayat: ${bookingUrl}`,
  };
}

/** Booking dibatalkan */
export function tplBookingDibatalkan(params: {
  userName: string;
  rute: string;
  tglBerangkat: string;
  alasan?: string;
  bookingUrl: string;
}) {
  const { userName, rute, tglBerangkat, alasan, bookingUrl } = params;
  return {
    subject: `❌ Booking Dibatalkan — ${rute}`,
    html: `
${EMAIL_HEADER}
    <h2 style="color:#111;margin:0 0 8px;">Halo, ${userName}</h2>
    <p style="color:#6b7280;margin:0 0 20px;">Booking kamu dengan rute <strong>${rute}</strong> pada <strong>${tglBerangkat}</strong> telah <strong>dibatalkan</strong>.</p>

    ${alasan ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:20px;"><p style="margin:0;color:#991b1b;font-size:13px;"><strong>Alasan:</strong> ${alasan}</p></div>` : ""}

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#374151;font-size:13px;">Jika kamu sudah melakukan pembayaran, refund akan diproses dalam 3-5 hari kerja.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      ${btn("Lihat Detail", bookingUrl)}
    </div>
${EMAIL_FOOTER}`,
    text: `Halo ${userName},\n\nBooking ${rute} pada ${tglBerangkat} telah dibatalkan.\n${alasan ? `Alasan: ${alasan}\n` : ""}Jika sudah bayar, refund akan diproses 3-5 hari kerja.\nDetail: ${bookingUrl}`,
  };
}
