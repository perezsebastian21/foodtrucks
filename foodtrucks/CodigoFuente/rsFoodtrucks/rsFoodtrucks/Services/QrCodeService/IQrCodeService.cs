using System.Threading.Tasks;

namespace rsFoodtrucks.Services.QrCodeService
{
    public interface IQrCodeService
    {
        /// <summary>
        /// Genera el QR PNG como byte[] para un foodtruck dado su IdFT.
        /// </summary>
        byte[] GenerarQr(int idFT);

        /// <summary>
        /// Obtiene el QR de la base de datos si existe, sino lo genera, lo guarda y lo devuelve.
        /// </summary>
        Task<byte[]> GenerarYGuardarQr(int idFT);
    }
}
