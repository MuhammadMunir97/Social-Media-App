using Domain;

namespace Application.Interfaces
{
    public interface IJwtGenerator
    {
        public string CreateToken(AppUser user);
    }
}