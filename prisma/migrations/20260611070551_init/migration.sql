-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipePerjalanan" AS ENUM ('ANTAR', 'JEMPUT');

-- CreateEnum
CREATE TYPE "TipeTrip" AS ENUM ('OPEN', 'PRIVATE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'PAID', 'MENUNGGU_KUOTA', 'DIKONFIRMASI', 'BERANGKAT', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Armada" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "platNomor" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "foto" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Armada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jadwal" (
    "id" TEXT NOT NULL,
    "tipe" "TipePerjalanan" NOT NULL,
    "rute" TEXT NOT NULL,
    "asal" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "bandara" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "jamBerangkat" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "minKuota" INTEGER NOT NULL DEFAULT 1,
    "terisi" INTEGER NOT NULL DEFAULT 0,
    "estimasiWaktu" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "armadaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jadwalId" TEXT NOT NULL,
    "jumlahKursi" INTEGER NOT NULL DEFAULT 1,
    "totalHarga" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "tipeTrip" "TipeTrip" NOT NULL DEFAULT 'OPEN',
    "tglBerangkat" TEXT NOT NULL,
    "alamatJemput" TEXT NOT NULL,
    "catatan" TEXT,
    "snapToken" TEXT,
    "kodePenerbangan" TEXT,
    "jamBoarding" TEXT,
    "jamLanding" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightData" (
    "id" TEXT NOT NULL,
    "kodePenerbangan" TEXT NOT NULL,
    "maskapai" TEXT NOT NULL,
    "boardingTime" TEXT,
    "landingTime" TEXT,
    "asal" TEXT,
    "tujuan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Armada_platNomor_key" ON "Armada"("platNomor");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "FlightData_kodePenerbangan_key" ON "FlightData"("kodePenerbangan");

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_armadaId_fkey" FOREIGN KEY ("armadaId") REFERENCES "Armada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "Jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
