using System.Security.Claims;
using ZeroToCoder.Api.Services;

namespace ZeroToCoder.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    /// <summary>Returns the authenticated user's id, or <c>null</c> when absent or malformed.</summary>
    public static int? GetUserId(this ClaimsPrincipal? principal)
    {
        var value = principal?.FindFirst(TokenService.UserIdClaim)?.Value;
        return int.TryParse(value, out var id) ? id : null;
    }
}
