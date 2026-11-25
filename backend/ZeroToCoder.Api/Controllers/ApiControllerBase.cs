using Microsoft.AspNetCore.Mvc;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Extensions;

namespace ZeroToCoder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>
    /// Id of the authenticated user. Only call this from actions protected by <c>[Authorize]</c>;
    /// the authentication handler guarantees the claim exists and the user is not blocked.
    /// </summary>
    protected int CurrentUserId =>
        User.GetUserId() ?? throw new InvalidOperationException("Authenticated user id claim is missing.");

    protected bool IsAdmin => User.IsInRole(Roles.Admin);

    protected ObjectResult Message(int statusCode, string message) =>
        StatusCode(statusCode, new { message });
}
