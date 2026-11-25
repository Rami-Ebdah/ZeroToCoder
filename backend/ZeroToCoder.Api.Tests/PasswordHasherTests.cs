using System.Security.Cryptography;
using System.Text;
using ZeroToCoder.Api.Helpers;

namespace ZeroToCoder.Api.Tests;

public class PasswordHasherTests
{
    [Fact]
    public void Hash_IsSaltedAndVerifies()
    {
        var first = PasswordHasher.Hash("secret123");
        var second = PasswordHasher.Hash("secret123");

        Assert.NotEqual(first, second);
        Assert.StartsWith("pbkdf2$", first);
        Assert.True(first.Length <= 255, "must fit the Users.PasswordHash column");
        Assert.True(PasswordHasher.Verify("secret123", first, out var rehash));
        Assert.False(rehash);
    }

    [Fact]
    public void Verify_RejectsWrongPassword() =>
        Assert.False(PasswordHasher.Verify("wrong", PasswordHasher.Hash("secret123"), out _));

    [Fact]
    public void Verify_AcceptsLegacySha256HashAndRequestsRehash()
    {
        var legacy = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes("secret123")));

        Assert.True(PasswordHasher.Verify("secret123", legacy, out var rehash));
        Assert.True(rehash);
        Assert.False(PasswordHasher.Verify("nope", legacy, out _));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("pbkdf2$abc$!!$!!")]
    [InlineData("not-base64!!")]
    public void Verify_HandlesMalformedHashes(string? stored) =>
        Assert.False(PasswordHasher.Verify("secret123", stored, out _));
}
