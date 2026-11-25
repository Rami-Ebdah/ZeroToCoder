namespace ZeroToCoder.Api.Common;

/// <summary>Role names stored in <c>Users.Role</c> and issued in the JWT role claim.</summary>
public static class Roles
{
    public const string Admin = "Admin";
    public const string User = "User";

    /// <summary>Maps any stored role value (case-insensitive) to its canonical name.</summary>
    public static string Normalize(string? role) =>
        string.Equals(role?.Trim(), Admin, StringComparison.OrdinalIgnoreCase) ? Admin : User;
}
