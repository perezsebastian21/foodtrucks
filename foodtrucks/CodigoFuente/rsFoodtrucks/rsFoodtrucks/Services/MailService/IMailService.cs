using System.Threading.Tasks;
using rsFoodtrucks.Models;

namespace rsFoodtrucks.Services.MailService
{
    public interface IMailService
    {
        Task SendAsync(MailModel mail);
    }
}
