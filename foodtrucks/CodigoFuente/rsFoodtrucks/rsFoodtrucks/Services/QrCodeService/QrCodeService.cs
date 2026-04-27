using Microsoft.Extensions.Configuration;
using QRCoder;
using rsFoodtrucks.DataAccess.Interfaces;
using rsFoodtrucks.Models;
using rsFoodtrucks.Utility;
using System;
using System.Threading.Tasks;

namespace rsFoodtrucks.Services.QrCodeService
{
    public class QrCodeService : IQrCodeService
    {
        private readonly IRepositoryAsync<FT_Foodtrucks> _repository;
        private readonly IConfiguration _config;

        public QrCodeService(IRepositoryAsync<FT_Foodtrucks> repository, IConfiguration config)
        {
            _repository = repository;
            _config = config;
        }

        public byte[] GenerarQr(int idFT)
        {
            // Construir la URL que codificará el QR
            string baseUrl = _config["Backend:BaseUrl"] ?? "http://localhost:40930";
            string key = _config["Obfuscation:Key"] ?? "fT_s3cr3t_k3y_2026";
            string encodedId = IdObfuscator.Encode(idFT, key);
            string url = $"{baseUrl}/api/auth/login?r={encodedId}";

            // Generar QR como PNG byte[] usando PngByteQRCode (cross-platform, sin System.Drawing)
            using (var qrGenerator = new QRCodeGenerator())
            using (var qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q))
            using (var qrCode = new PngByteQRCode(qrCodeData))
            {
                return qrCode.GetGraphic(20);
            }
        }

        public async Task<byte[]> GenerarYGuardarQr(int idFT)
        {
            var foodtruck = await _repository.GetByID(idFT);
            if (foodtruck == null)
                throw new Exception($"Foodtruck con ID {idFT} no encontrado.");

            if (foodtruck.QrCode != null && foodtruck.QrCode.Length > 0)
            {
                return foodtruck.QrCode;
            }

            byte[] qrBytes = GenerarQr(idFT);
            foodtruck.QrCode = qrBytes;

            await _repository.Update(foodtruck);
            return qrBytes;
        }
    }
}
