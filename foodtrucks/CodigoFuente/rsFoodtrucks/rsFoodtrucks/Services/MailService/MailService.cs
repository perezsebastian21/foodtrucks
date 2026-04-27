using System.Data.Odbc;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using rsFoodtrucks.Models;

namespace rsFoodtrucks.Services.MailService
{
    public class MailService : IMailService
    {
        private readonly string _connectionString;
        private readonly ILogger<MailService> _logger;

        public MailService(IConfiguration configuration, ILogger<MailService> logger)
        {
            _connectionString = configuration.GetConnectionString("MGP015");
            _logger = logger;
        }

        public async Task SendAsync(MailModel mail)
        {
            using OdbcConnection conn = new OdbcConnection(_connectionString);
            await conn.OpenAsync();

            string sql = "EXEC dbo.ADD_ColaEmails ?, ?, ?, ?, ?";
            using OdbcCommand cmd = new OdbcCommand(sql, conn);

            cmd.Parameters.Add(new OdbcParameter { Value = mail.Origen });
            cmd.Parameters.Add(new OdbcParameter { Value = mail.OrigenNombre });
            cmd.Parameters.Add(new OdbcParameter { Value = mail.Destinatario });
            cmd.Parameters.Add(new OdbcParameter { Value = mail.Asunto });
            cmd.Parameters.Add(new OdbcParameter { Value = mail.Cuerpo });

            await cmd.ExecuteNonQueryAsync();
            _logger.LogInformation("Email encolado para: {Destinatario}", mail.Destinatario);
        }
    }
}
