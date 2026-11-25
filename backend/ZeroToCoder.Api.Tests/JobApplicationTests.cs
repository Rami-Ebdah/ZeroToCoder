using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Tests.Infrastructure;

namespace ZeroToCoder.Api.Tests;

public class JobApplicationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static readonly byte[] Pdf = Encoding.ASCII.GetBytes("%PDF-1.4\n%fake but well-formed header\n");

    [Fact]
    public async Task Apply_RequiresAuthentication()
    {
        var job = await CreateJobAsync();
        var response = await factory.CreateClient().PostAsync("/api/jobapplications", Form(job.JobID, "cv.pdf", Pdf));
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("cv.exe")]
    [InlineData("cv.html")]
    [InlineData("noextension")]
    public async Task Apply_RejectsDisallowedExtensions(string fileName)
    {
        var client = await factory.CreateClientAsync();
        var job = await CreateJobAsync();

        var response = await client.PostAsync("/api/jobapplications", Form(job.JobID, fileName, Pdf));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Apply_RejectsFilesWhoseContentDoesNotMatchTheExtension()
    {
        var client = await factory.CreateClientAsync();
        var job = await CreateJobAsync();

        var response = await client.PostAsync("/api/jobapplications", Form(job.JobID, "cv.pdf", "<script>alert(1)</script>"u8.ToArray()));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Apply_StoresCvPrivately_AndOnlyAdminsCanDownloadIt()
    {
        var user = await factory.CreateUserAsync();
        var client = await factory.CreateClientForAsync(user);
        var admin = await factory.CreateClientAsync(Roles.Admin);
        var job = await CreateJobAsync();

        var response = await client.PostAsync("/api/jobapplications", Form(job.JobID, "../../evil name.pdf", Pdf));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var application = await response.Content.ReadFromJsonAsync<JobApplicationDto>();

        // Applicant comes from the token, and the client file name cannot escape the storage folder.
        Assert.Equal(user.UserID, application!.UserId);
        Assert.StartsWith("CVs/", application.CV);
        Assert.DoesNotContain("..", application.CV);
        Assert.True(File.Exists(Path.Combine(factory.StorageRoot, application.CV!)));

        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync($"/api/jobapplications/{application.ApplicationID}/cv")).StatusCode);
        var download = await admin.GetAsync($"/api/jobapplications/{application.ApplicationID}/cv");
        Assert.Equal(HttpStatusCode.OK, download.StatusCode);
        Assert.Equal(Pdf, await download.Content.ReadAsByteArrayAsync());

        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsync("/api/jobapplications", Form(job.JobID, "cv.pdf", Pdf))).StatusCode);

        Assert.Equal(HttpStatusCode.OK, (await admin.DeleteAsync($"/api/jobapplications/{application.ApplicationID}")).StatusCode);
        Assert.False(File.Exists(Path.Combine(factory.StorageRoot, application.CV!)));
    }

    [Fact]
    public async Task ListingApplications_IsAdminOnly()
    {
        var client = await factory.CreateClientAsync();
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/jobapplications")).StatusCode);
    }

    private async Task<JobPostDto> CreateJobAsync()
    {
        var admin = await factory.CreateClientAsync(Roles.Admin);
        var response = await admin.PostAsJsonAsync("/api/jobposts", new { title = "Dev", company = "Acme", location = "Remote", skills = "C#|SQL" });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JobPostDto>())!;
    }

    private static MultipartFormDataContent Form(int jobId, string fileName, byte[] bytes)
    {
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
        return new MultipartFormDataContent
        {
            { new StringContent(jobId.ToString()), "JobID" },
            { file, "CV", fileName },
        };
    }
}
