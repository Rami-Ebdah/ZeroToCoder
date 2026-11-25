namespace ZeroToCoder.Api.Common;

public static class RateLimitPolicies
{
    /// <summary>Strict per-IP limit for login/signup to slow down brute-force attempts.</summary>
    public const string Auth = "auth";
}
