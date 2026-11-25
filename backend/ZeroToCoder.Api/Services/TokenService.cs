using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Models;
using ZeroToCoder.Api.Options;

namespace ZeroToCoder.Api.Services;

public interface ITokenService
{
    string CreateToken(User user);
}

public sealed class TokenService(IOptions<JwtOptions> options) : ITokenService
{
    /// <summary>Custom claim that carries the numeric user id (kept as "id" for client compatibility).</summary>
    public const string UserIdClaim = "id";

    private readonly JwtOptions _options = options.Value;

    public string CreateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(UserIdClaim, user.UserID.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, Roles.Normalize(user.Role)),
        };

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.ExpireMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
